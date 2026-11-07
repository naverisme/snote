import React, { useState } from 'react';
import type { AssignmentInput, WorkspaceGroup, SubmissionInput } from './types';
import { useAssignments } from './hooks/useAssignments';
import { useReducedMotion } from './hooks/useReducedMotion';
import { AssignmentCreateModal } from './components/AssignmentCreateModal';
import { TeacherProgressDashboard } from './components/TeacherProgressDashboard';
import { StudentSubmissionForm } from './components/StudentSubmissionForm';
import { RevisionHistoryView } from './components/RevisionHistoryView';
import { GroupProgressUpdateWidget } from './components/GroupProgressUpdateWidget';
import * as api from './api';

export interface AssignmentFeatureProps {
  classId: string;
  isTeacher?: boolean;
  activeWorkspaceId?: string;
  availableGroups?: WorkspaceGroup[];
  csrfToken?: string;
}

export const AssignmentFeature: React.FC<AssignmentFeatureProps> = ({
  classId,
  isTeacher = false,
  activeWorkspaceId,
  availableGroups = [],
  csrfToken,
}) => {
  const {
    assignments,
    selectedAssignmentId,
    setSelectedAssignmentId,
    recipients,
    selectedRecipientId,
    setSelectedRecipientId,
    submissions,
    loading,
    error,
    refreshAssignments,
    refreshSubmissions,
  } = useAssignments(classId, activeWorkspaceId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);
  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  const handleCreateAssignment = async (input: AssignmentInput) => {
    await api.createAssignment(classId, input, { csrfToken });
    await refreshAssignments();
  };

  const handleArchiveAssignment = async (assignmentId: string, version: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn lưu trữ bài giao này? (Lịch sử nộp bài vẫn được giữ lại)')) {
      return;
    }
    try {
      await api.archiveAssignment(assignmentId, { csrfToken, etag: `"${version}"` });
      await refreshAssignments();
    } catch (err: any) {
      setActionError(err?.message || 'Không thể lưu trữ bài giao.');
    }
  };

  const handleProgressUpdate = async (recipientId: string, text: string, currentVersion: number) => {
    await api.updateProgressText(recipientId, text, {
      csrfToken,
      etag: `"${currentVersion}"`,
    });
    await refreshAssignments();
  };

  const handleTeacherFeedback = async (submissionId: string, text: string) => {
    await api.addFeedback(submissionId, text, { csrfToken });
    await refreshSubmissions();
  };

  const handleSubmitApi = async (
    recipientId: string,
    input: SubmissionInput,
    options: { idempotencyKey: string; etag?: string }
  ) => {
    const res = await api.submitWork(recipientId, input, {
      ...options,
      csrfToken,
    });
    await refreshAssignments();
    await refreshSubmissions();
    return res;
  };

  if (loading && assignments.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        Đang tải dữ liệu bài giao...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#111827',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
            Bài giao và Theo dõi tiến độ
          </h1>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {isTeacher ? 'Chế độ Giáo viên' : 'Chế độ Người học'}
          </span>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: reducedMotion ? 'none' : 'background-color 140ms ease',
            }}
          >
            + Giao bài mới
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '6px',
            fontSize: '13px',
            border: '1px solid #fecaca',
          }}
        >
          {error || actionError}
        </div>
      )}

      {assignments.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            border: '1px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '6px' }}>
            Chưa có bài giao nào trong lớp này
          </div>
          <div style={{ fontSize: '13px' }}>
            {isTeacher ? 'Bấm vào nút "Giao bài mới" ở trên để bắt đầu giao việc cho các nhóm.' : 'Giáo viên chưa giao bài cho nhóm của bạn.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          {/* Left Column: Assignments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Danh sách bài giao ({assignments.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {assignments.map(asg => {
                const isSelected = asg.id === selectedAssignmentId;
                return (
                  <button
                    key={asg.id}
                    type="button"
                    onClick={() => setSelectedAssignmentId(asg.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#374151',
                      cursor: 'pointer',
                      transition: reducedMotion ? 'none' : 'all 140ms ease',
                    }}
                  >
                    <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: '13px', marginBottom: '2px' }}>
                      {asg.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {asg.deadline ? `Hạn: ${new Date(asg.deadline).toLocaleDateString()}` : asg.deadlineDate ? `Hạn: ${asg.deadlineDate.date}` : 'Không có hạn'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Assignment Content */}
          {selectedAssignment && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Assignment Overview Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px 0' }}>
                      {selectedAssignment.title}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {selectedAssignment.deadline
                        ? `Thời hạn: ${new Date(selectedAssignment.deadline).toLocaleString()}`
                        : selectedAssignment.deadlineDate
                        ? `Thời hạn: Cuối ngày ${selectedAssignment.deadlineDate.date} (${selectedAssignment.deadlineDate.timeZone})`
                        : 'Không giới hạn thời gian'}
                      {' • '}
                      <span>Nộp lần đầu sau hạn: <strong>{selectedAssignment.lateFirst || 'inherit'}</strong></span>
                      {' • '}
                      <span>Sửa sau hạn: <strong>{selectedAssignment.lateRevision || 'inherit'}</strong></span>
                    </div>
                  </div>

                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => handleArchiveAssignment(selectedAssignment.id, selectedAssignment.version)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        borderRadius: '4px',
                        color: '#6b7280',
                        cursor: 'pointer',
                      }}
                    >
                      Lưu trữ (ASG-10)
                    </button>
                  )}
                </div>

                {selectedAssignment.description && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                    {selectedAssignment.description}
                  </p>
                )}
              </div>

              {/* TEACHER MODE: Progress Tracking Table & Selected Group Review */}
              {isTeacher && (
                <>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 10px 0', color: '#374151' }}>
                      Tiến độ các nhóm nhận bài ({recipients.length} nhóm)
                    </h3>
                    <TeacherProgressDashboard
                      recipients={recipients}
                      selectedRecipientId={selectedRecipientId ?? undefined}
                      onSelectRecipient={setSelectedRecipientId}
                    />
                  </div>

                  {selectedRecipient && (
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0' }}>
                        Chi tiết bản nộp nhóm: {selectedRecipient.workspaceName || selectedRecipient.workspaceId}
                      </h3>
                      <RevisionHistoryView
                        submissions={submissions}
                        isTeacher={true}
                        onSubmitFeedback={handleTeacherFeedback}
                      />
                    </div>
                  )}
                </>
              )}

              {/* STUDENT MODE: Progress update, Submission Form, Revision History */}
              {!isTeacher && selectedRecipient && (
                <>
                  <GroupProgressUpdateWidget
                    recipientId={selectedRecipient.id}
                    currentProgressText={selectedRecipient.progressText}
                    currentVersion={selectedRecipient.version}
                    onUpdateProgress={handleProgressUpdate}
                  />

                  <StudentSubmissionForm
                    recipientId={selectedRecipient.id}
                    currentVersion={submissions.length > 0 ? submissions[0].version : 0}
                    onSubmitted={() => refreshSubmissions()}
                    onSubmitApi={handleSubmitApi}
                    onRefreshLatest={refreshSubmissions}
                  />

                  {submissions.length > 0 && (
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 12px 0' }}>
                        Lịch sử các phiên bản đã nộp và Nhận xét của giáo viên
                      </h3>
                      <RevisionHistoryView
                        submissions={submissions}
                        isTeacher={false}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Assignment Create Modal (CUXD-01/02) */}
      <AssignmentCreateModal
        isOpen={isCreateModalOpen}
        classId={classId}
        availableGroups={availableGroups}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAssignment}
      />
    </div>
  );
};
