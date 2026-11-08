import React from 'react';
import type { RecipientProgress } from '../types';

export interface TeacherProgressDashboardProps {
  recipients: RecipientProgress[];
  selectedRecipientId?: string;
  onSelectRecipient: (recipientId: string) => void;
}

export const TeacherProgressDashboard: React.FC<TeacherProgressDashboardProps> = ({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
}) => {
  if (recipients.length === 0) {
    return (
      <div
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>
          Chưa có nhóm nào nhận bài giao này
        </div>
        <div style={{ fontSize: '12px' }}>
          Các nhóm được giao sẽ xuất hiện tại đây kèm theo 3 trục tiến độ độc lập.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#ffffff',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Nhóm nhận bài</th>
            {/* ASG-02: Ba nguồn tiến độ riêng biệt, không tính tỷ lệ tổng hợp */}
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Công việc</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Checklist</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Cập nhật gần nhất</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Trạng thái nộp bài</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map(recipient => {
            const isSelected = recipient.id === selectedRecipientId;
            const hasChecklist = (recipient.checklistTotal ?? 0) > 0;
            const checklistDisplay = hasChecklist
              ? `${recipient.checklistCompleted ?? 0}/${recipient.checklistTotal} mục`
              : 'Chưa có checklist';

            const tasksDisplay = `${recipient.tasksCompleted ?? 0}/${recipient.tasksTotal ?? 0} việc`;
            const hasSubmitted = recipient.submissionVersion !== undefined && recipient.submissionVersion > 0;

            return (
              <tr
                key={recipient.id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: isSelected ? '#f8fafc' : 'transparent',
                  transition: 'background-color 140ms ease',
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSelected && (
                      <span
                        style={{
                          width: '3px',
                          height: '14px',
                          backgroundColor: '#2563eb',
                          borderRadius: '2px',
                          display: 'inline-block',
                        }}
                      />
                    )}
                    <span>{recipient.workspaceName || `Nhóm ${recipient.workspaceId.slice(0, 8)}`}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#334155' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {tasksDisplay}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: hasChecklist ? '#f8fafc' : 'transparent',
                      border: hasChecklist ? '1px solid #e2e8f0' : 'none',
                      color: hasChecklist ? '#334155' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: hasChecklist ? 500 : 400,
                    }}
                  >
                    {checklistDisplay}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '240px' }}>
                  {recipient.progressText ? (
                    <span
                      style={{
                        fontStyle: 'italic',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      "{recipient.progressText}"
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Chưa có cập nhật</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {/* Badges trạng thái nộp bài không dùng màu chói (Quiet Hierarchy) */}
                  {hasSubmitted ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#16a34a',
                          display: 'inline-block',
                        }}
                      />
                      Đã nộp (v{recipient.submissionVersion})
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#94a3b8',
                          display: 'inline-block',
                        }}
                      />
                      Chưa nộp
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => onSelectRecipient(recipient.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#2563eb' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 140ms ease',
                    }}
                  >
                    {isSelected ? 'Đang xem' : 'Xem bản nộp & nhận xét'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Alias export for interoperability
export const TeacherDashboard = TeacherProgressDashboard;
export type TeacherDashboardProps = TeacherProgressDashboardProps;
