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
          padding: '32px',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px dashed #d1d5db',
        }}
      >
        Chưa có nhóm nào nhận bài giao này.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nhóm nhận bài</th>
            {/* ASG-02: Ba nguồn tiến độ riêng biệt, không tính tỷ lệ tổng hợp */}
            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Công việc hoàn thành</th>
            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tiến độ checklist</th>
            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cập nhật gần nhất</th>
            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bản nộp</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
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
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  transition: 'background-color 140ms ease',
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>
                  {recipient.workspaceName || `Nhóm ${recipient.workspaceId.slice(0, 8)}`}
                </td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#f3f4f6',
                      fontSize: '12px',
                    }}
                  >
                    {tasksDisplay}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: hasChecklist ? '#374151' : '#9ca3af' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: hasChecklist ? '#f3f4f6' : '#f9fafb',
                      fontSize: '12px',
                    }}
                  >
                    {checklistDisplay}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#4b5563', maxWidth: '240px' }}>
                  {recipient.progressText ? (
                    <span style={{ fontStyle: 'italic', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{recipient.progressText}"
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>Chưa có cập nhật</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {hasSubmitted ? (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      Đã nộp (v{recipient.submissionVersion})
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                      }}
                    >
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
                      border: isSelected ? '1px solid #2563eb' : '1px solid #d1d5db',
                      background: isSelected ? '#2563eb' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#374151',
                      cursor: 'pointer',
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
