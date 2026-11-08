import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';
import type { Submission } from '../types';
import { TeacherFeedbackForm } from './TeacherFeedbackForm';

export interface RevisionHistoryViewProps {
  submissions: Submission[];
  isTeacher?: boolean;
  onSubmitFeedback?: (submissionId: string, text: string) => Promise<void>;
}

export const RevisionHistoryView: React.FC<RevisionHistoryViewProps> = ({
  submissions,
  isTeacher = false,
  onSubmitFeedback,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(() => {
    return submissions.length > 0 ? submissions[0].version : 1;
  });

  if (submissions.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
        Chưa có phiên bản nộp nào.
      </div>
    );
  }

  const activeSubmission = submissions.find(s => s.version === selectedVersion) || submissions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Revision tabs (CUXD-05, CUXD-07) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', overflowX: 'auto' }}>
        {submissions.map(sub => {
          const isSelected = sub.version === activeSubmission.version;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedVersion(sub.version)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb',
                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                color: isSelected ? '#1d4ed8' : '#4b5563',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Phiên bản {sub.version}</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: sub.timeliness === 'on_time' ? '#dcfce7' : '#fee2e2',
                  color: sub.timeliness === 'on_time' ? '#15803d' : '#b91c1c',
                }}
              >
                {sub.timeliness === 'on_time' ? 'Đúng hạn' : 'Muộn'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Revision Details (CUXD-07) */}
      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Phiên bản {activeSubmission.version}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '10px' }}>
              Nộp bởi: {activeSubmission.submittedBy} • {new Date(activeSubmission.acceptedAt).toLocaleString()}
            </span>
          </div>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: activeSubmission.timeliness === 'on_time' ? '#dcfce7' : '#fee2e2',
              color: activeSubmission.timeliness === 'on_time' ? '#15803d' : '#b91c1c',
            }}
          >
            {activeSubmission.timeliness === 'on_time' ? 'Đúng hạn' : 'Nộp muộn'}
          </span>
        </div>

        {/* Text content */}
        {activeSubmission.text && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
              Nội dung văn bản:
            </span>
            <div
              style={{
                background: '#ffffff',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
                color: '#1f2937',
              }}
            >
              {activeSubmission.text}
            </div>
          </div>
        )}

        {/* Links */}
        {activeSubmission.links && activeSubmission.links.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
              Đường dẫn đính kèm:
            </span>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
              {activeSubmission.links.map((link, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attachments */}
        {activeSubmission.uploadIds && activeSubmission.uploadIds.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
              Tệp đính kèm:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeSubmission.uploadIds.map((blobId, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    color: '#374151',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Paperclip size={12} />
                  <span>{blobId}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feedback list */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
            Nhận xét ({activeSubmission.feedback?.length ?? 0}):
          </span>
          {(!activeSubmission.feedback || activeSubmission.feedback.length === 0) ? (
            <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Chưa có nhận xét cho phiên bản này.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeSubmission.feedback.map(fb => (
                <div
                  key={fb.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: '#111827' }}>Giáo viên ({fb.teacherId})</span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {new Date(fb.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: '#374151' }}>{fb.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Teacher feedback form if in teacher mode */}
          {isTeacher && onSubmitFeedback && (
            <TeacherFeedbackForm
              submissionId={activeSubmission.id}
              onSubmitFeedback={onSubmitFeedback}
            />
          )}
        </div>
      </div>
    </div>
  );
};
