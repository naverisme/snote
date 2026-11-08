import React from 'react';
import { CheckCircle2, ListChecks, MessageSquare, Clock, ChevronRight } from 'lucide-react';
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
          padding: '32px 24px', // Inset >= 12px
          textAlign: 'center',
          color: 'var(--ink-muted)',
          backgroundColor: 'var(--surface-ground)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-light)',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-title)', marginBottom: '4px' }}>
          Chưa có nhóm nào nhận bài giao này
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-subtle)' }}>
          Các nhóm được giao sẽ xuất hiện tại đây kèm theo 3 nguồn tiến độ độc lập (CUXD-03).
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--surface-ground)',
              borderBottom: '1px solid var(--hairline)',
              color: 'var(--ink-subtle)',
            }}
          >
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Nhóm nhận bài</th>
            {/* CUXD-03 / ASG-02: Ba nguồn tiến độ phân tách riêng biệt, không tính tỷ lệ tổng hợp */}
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} style={{ color: 'var(--ink-muted)' }} />
                <span>Nguồn 1: Công việc</span>
              </div>
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ListChecks size={13} style={{ color: 'var(--ink-muted)' }} />
                <span>Nguồn 2: Checklist</span>
              </div>
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MessageSquare size={13} style={{ color: 'var(--ink-muted)' }} />
                <span>Nguồn 3: Cập nhật văn bản</span>
              </div>
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>Bản nộp hiện hành</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map(recipient => {
            const isSelected = recipient.id === selectedRecipientId;
            const hasChecklist = (recipient.checklistTotal ?? 0) > 0;
            const checklistPercent = hasChecklist
              ? Math.round(((recipient.checklistCompleted ?? 0) / (recipient.checklistTotal || 1)) * 100)
              : null;
            const checklistDisplay = hasChecklist
              ? `${checklistPercent}% (${recipient.checklistCompleted ?? 0}/${recipient.checklistTotal} mục)`
              : 'Chưa có checklist';

            const tasksDisplay = `${recipient.tasksCompleted ?? 0}/${recipient.tasksTotal ?? 0} việc`;
            const hasSubmitted = recipient.submissionVersion !== undefined && recipient.submissionVersion > 0;

            return (
              <tr
                key={recipient.id}
                onClick={() => onSelectRecipient(recipient.id)}
                style={{
                  borderBottom: '1px solid var(--hairline)',
                  backgroundColor: isSelected ? 'var(--surface-ground)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                {/* Nhóm */}
                <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--ink-title)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSelected ? (
                      <span
                        style={{
                          width: '3px',
                          height: '14px',
                          backgroundColor: 'var(--accent)',
                          borderRadius: '2px',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span style={{ width: '3px', height: '14px', display: 'inline-block', flexShrink: 0 }} />
                    )}
                    <span>{recipient.workspaceName || `Nhóm ${recipient.workspaceId.slice(0, 8)}`}</span>
                  </div>
                </td>

                {/* Nguồn 1: Công việc (Tasks Completed / Total) */}
                <td style={{ padding: '14px 16px', color: 'var(--ink-body)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-ground)',
                      border: '1px solid var(--hairline)',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--ink-title)',
                    }}
                  >
                    {tasksDisplay}
                  </span>
                </td>

                {/* Nguồn 2: Checklist (Completed / Total %) */}
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: hasChecklist ? 'var(--surface-ground)' : 'transparent',
                      border: hasChecklist ? '1px solid var(--hairline)' : 'none',
                      color: hasChecklist ? 'var(--ink-title)' : 'var(--ink-muted)',
                      fontSize: '12px',
                      fontWeight: hasChecklist ? 500 : 400,
                    }}
                  >
                    {checklistDisplay}
                  </span>
                </td>

                {/* Nguồn 3: Cập nhật văn bản (progressText) */}
                <td style={{ padding: '14px 16px', color: 'var(--ink-subtle)', maxWidth: '240px' }}>
                  {recipient.progressText ? (
                    <span
                      style={{
                        fontStyle: 'italic',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--ink-body)',
                      }}
                      title={recipient.progressText}
                    >
                      "{recipient.progressText}"
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ink-muted)', fontSize: '12px' }}>Chưa có cập nhật</span>
                  )}
                </td>

                {/* Bản nộp hiện hành */}
                <td style={{ padding: '14px 16px' }}>
                  {hasSubmitted ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--success)',
                          display: 'inline-block',
                        }}
                      />
                      <span>Đã nộp v{recipient.submissionVersion}</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--surface-ground)',
                        color: 'var(--ink-muted)',
                        border: '1px solid var(--hairline)',
                        fontSize: '12px',
                      }}
                    >
                      <span>Chưa nộp bài</span>
                    </span>
                  )}
                </td>

                {/* Thao tác (CUXD-05) */}
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectRecipient(recipient.id);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface-raised)',
                      color: isSelected ? '#ffffff' : 'var(--ink-subtle)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span>{isSelected ? 'Đang chọn' : 'Xem bài nộp'}</span>
                    <ChevronRight size={13} style={{ opacity: isSelected ? 1 : 0.7 }} />
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
