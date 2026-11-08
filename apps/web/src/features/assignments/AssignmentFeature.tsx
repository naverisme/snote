import React, { useState } from 'react';
import { Plus, Archive, Clock, AlertTriangle, ShieldCheck, Calendar, Users } from 'lucide-react';
import type { AssignmentInput, WorkspaceGroup, SubmissionInput } from './types';
import { useAssignments } from './hooks/useAssignments';
import { useReducedMotion } from './hooks/useReducedMotion';
import { AssignmentCreateModal } from './components/AssignmentCreateModal';
import { TeacherProgressDashboard } from './components/TeacherProgressDashboard';
import { StudentSubmissionForm } from './components/StudentSubmissionForm';
import { RevisionHistoryView } from './components/RevisionHistoryView';
import { GroupProgressUpdateWidget } from './components/GroupProgressUpdateWidget';
import { AssignmentEmptyState } from './components/AssignmentEmptyState';
import * as api from './api';
import './assignments.css';

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

  const latePolicyLabel = (value: 'inherit' | 'allow' | 'lock' | undefined) =>
    value === 'allow' ? 'Cho phép' : value === 'lock' ? 'Khóa sau hạn' : 'Theo cài đặt lớp';

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
    return res;
  };

  // ==========================================================================
  // Zero-CLS Skeleton Loader: Exact Pitch, Margins, Borders & Heights
  // ==========================================================================
  if (loading && assignments.length === 0) {
    return (
      <div className="assignment-skeleton-container" aria-busy="true" aria-label="Đang tải bài giao">
        {/* Header Skeleton matching 56px height */}
        <div className="skeleton-header skeleton-shimmer">
          <div>
            <div className="skeleton-box skeleton-header-title" />
            <div className="skeleton-box skeleton-header-subtitle" />
          </div>
          {isTeacher && <div className="skeleton-box skeleton-header-button" />}
        </div>

        {/* Layout Skeleton */}
        <div className="assignment-layout">
          {/* Left Column Skeleton: 3 items matching exact 64px card height */}
          <div className="skeleton-list-container skeleton-shimmer">
            <div className="skeleton-box skeleton-list-label" />
            {[0, 1, 2].map(idx => (
              <div key={idx} className="skeleton-assignment-card">
                <div className="skeleton-box skeleton-card-title" />
                <div className="skeleton-box skeleton-card-date" />
              </div>
            ))}
          </div>

          {/* Right Column Skeleton: Matching overview card + table */}
          <div className="skeleton-overview-card skeleton-shimmer">
            <div className="skeleton-overview-title-row">
              <div className="skeleton-box skeleton-overview-title" />
              {isTeacher && <div className="skeleton-box skeleton-overview-badge" />}
            </div>
            <div className="skeleton-box skeleton-overview-meta" />
            <div className="skeleton-box skeleton-overview-desc-1" />
            <div className="skeleton-box skeleton-overview-desc-2" />

            <div className="skeleton-table-card" style={{ marginTop: '16px' }}>
              <div className="skeleton-table-header">
                <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
                <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
                <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
                <div className="skeleton-box" style={{ width: '140px', height: '14px' }} />
              </div>
              {[0, 1].map(rIdx => (
                <div key={rIdx} className="skeleton-table-row">
                  <div className="skeleton-box" style={{ width: '100px', height: '14px' }} />
                  <div className="skeleton-box" style={{ width: '60px', height: '14px' }} />
                  <div className="skeleton-box" style={{ width: '60px', height: '14px' }} />
                  <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-feature">
      {/* Top Header */}
      <div className="assignment-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink-title)', margin: 0 }}>
            Bài giao và Theo dõi tiến độ
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--ink-subtle)', marginTop: '2px', display: 'block' }}>
            {isTeacher ? 'Chế độ Giáo viên — Quản lý bài tập & Theo dõi các nhóm' : 'Chế độ Người học — Báo cáo tiến độ & Nộp bài'}
          </span>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-raised)',
              transition: reducedMotion ? 'none' : 'background-color var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            <Plus size={15} />
            <span>Giao bài mới</span>
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div
          role="alert"
          style={{
            padding: '12px 16px', // Inset >= 12px
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error || actionError}</span>
        </div>
      )}

      {/* Empty State Showcase (Stageshow Miniature Pattern) */}
      {assignments.length === 0 ? (
        <AssignmentEmptyState
          isTeacher={isTeacher}
          onCreateAssignment={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="assignment-layout">
          {/* Left Column: Assignments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Danh sách bài giao ({assignments.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignments.map(asg => {
                const isSelected = asg.id === selectedAssignmentId;
                return (
                  <button
                    key={asg.id}
                    type="button"
                    onClick={() => setSelectedAssignmentId(asg.id)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px', // Inset >= 12px
                      height: '64px', // Matches skeleton pitch exactly
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--hairline)',
                      backgroundColor: isSelected ? 'var(--surface-ground)' : 'var(--surface-raised)',
                      color: isSelected ? 'var(--accent)' : 'var(--ink-body)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: isSelected ? 'var(--shadow-raised)' : 'none',
                      transition: reducedMotion ? 'none' : 'all var(--transition-fast)',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '13px',
                        color: isSelected ? 'var(--accent)' : 'var(--ink-title)',
                        marginBottom: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {asg.title}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--ink-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Clock size={11} />
                      <span>
                        {asg.deadline
                          ? `Hạn: ${new Date(asg.deadline).toLocaleDateString('vi-VN')}`
                          : asg.deadlineDate
                          ? `Hạn: ${asg.deadlineDate.date}`
                          : 'Không giới hạn thời gian'}
                      </span>
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
              <div
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px', // Inset >= 12px
                  boxShadow: 'var(--shadow-raised)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink-title)', margin: '0 0 6px 0' }}>
                      {selectedAssignment.title}
                    </h2>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--ink-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: 'var(--ink-muted)' }} />
                        <span>
                          {selectedAssignment.deadline
                            ? `Thời hạn: ${new Date(selectedAssignment.deadline).toLocaleString('vi-VN')}`
                            : selectedAssignment.deadlineDate
                            ? `Thời hạn: Cuối ngày ${selectedAssignment.deadlineDate.date} (${selectedAssignment.deadlineDate.timeZone})`
                            : 'Không giới hạn thời gian'}
                        </span>
                      </span>
                      <span>•</span>
                      <span>
                        Nộp lần đầu sau hạn: <strong>{latePolicyLabel(selectedAssignment.lateFirst)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Sửa sau hạn: <strong>{latePolicyLabel(selectedAssignment.lateRevision)}</strong>
                      </span>
                    </div>
                  </div>

                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => handleArchiveAssignment(selectedAssignment.id, selectedAssignment.version)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: '1px solid var(--border-light)',
                        background: 'var(--surface-ground)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--ink-subtle)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--danger)';
                        e.currentTarget.style.borderColor = '#fecaca';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--ink-subtle)';
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                      }}
                    >
                      <Archive size={13} />
                      <span>Lưu trữ</span>
                    </button>
                  )}
                </div>

                {selectedAssignment.description && (
                  <p
                    style={{
                      margin: '10px 0 0 0',
                      fontSize: '13px',
                      color: 'var(--ink-body)',
                      lineHeight: '1.5',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--hairline)',
                    }}
                  >
                    {selectedAssignment.description}
                  </p>
                )}
              </div>

              {/* TEACHER MODE: CUXD-03 Progress Tracking Table & CUXD-05 Selected Group Review */}
              {isTeacher && (
                <>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        margin: '0 0 10px 0',
                        color: 'var(--ink-title)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Users size={15} style={{ color: 'var(--accent)' }} />
                      <span>Tiến độ các nhóm nhận bài ({recipients.length} nhóm — CUXD-03)</span>
                    </h3>
                    <TeacherProgressDashboard
                      recipients={recipients}
                      selectedRecipientId={selectedRecipientId ?? undefined}
                      onSelectRecipient={setSelectedRecipientId}
                    />
                  </div>

                  {selectedRecipient && (
                    <div
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--radius-md)',
                        padding: '18px 20px', // Inset >= 12px
                        boxShadow: 'var(--shadow-raised)',
                      }}
                    >
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-title)', margin: '0 0 12px 0' }}>
                        Chi tiết bản nộp nhóm: {selectedRecipient.workspaceName || selectedRecipient.workspaceId} (CUXD-05)
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

              {/* STUDENT MODE: CUXD-04/05/06 Submission Form, Progress Update, Revision History */}
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
                    workspaceId={selectedRecipient.workspaceId}
                    currentVersion={submissions.length > 0 ? submissions[0].version : 0}
                    onSubmitted={() => {
                      void refreshAssignments();
                      void refreshSubmissions();
                    }}
                    onSubmitApi={handleSubmitApi}
                    onRefreshLatest={refreshSubmissions}
                  />

                  {submissions.length > 0 && (
                    <div
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 'var(--radius-md)',
                        padding: '18px 20px', // Inset >= 12px
                        boxShadow: 'var(--shadow-raised)',
                      }}
                    >
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-title)', margin: '0 0 12px 0' }}>
                        Lịch sử các phiên bản đã nộp và Nhận xét của giáo viên (CUXD-05/07)
                      </h3>
                      <RevisionHistoryView submissions={submissions} isTeacher={false} />
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
