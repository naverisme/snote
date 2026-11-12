import React, { useState } from 'react';
import {
  Paperclip,
  Link2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  User,
  MessageSquare,
} from 'lucide-react';
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
      <div
        style={{
          padding: '32px 24px', // Inset >= 12px
          textAlign: 'center',
          color: 'var(--ink-muted)',
          backgroundColor: 'var(--surface-ground)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-light)',
          fontSize: '13px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-title)', marginBottom: '4px' }}>
          Chưa có phiên bản nộp nào
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-subtle)' }}>
          Lịch sử các lần nộp và sửa đổi bài sẽ xuất hiện tại đây.
        </div>
      </div>
    );
  }

  // Sắp xếp các phiên bản mới nhất ở trên
  const sortedSubmissions = [...submissions].sort((a, b) => b.version - a.version);
  const activeSubmission = submissions.find(s => s.version === selectedVersion) || sortedSubmissions[0];
  const maxVersion = Math.max(...submissions.map(s => s.version));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Timeline Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--ink-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Lịch sử phiên bản nộp bài ({submissions.length} phiên bản)
        </span>
        <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
          Chọn một phiên bản để xem chi tiết
        </span>
      </div>

      {/* Vertical Timeline */}
      <div
        style={{
          position: 'relative',
          paddingLeft: '32px',
          paddingTop: '6px',
          paddingBottom: '6px',
        }}
      >
        {/* Continuous vertical connecting line */}
        <div
          style={{
            position: 'absolute',
            left: '11px',
            top: '16px',
            bottom: '24px',
            width: '2px',
            backgroundColor: 'var(--border-light)',
            borderRadius: '1px',
          }}
        />

        {sortedSubmissions.map((sub, idx) => {
          const isSelected = sub.version === activeSubmission.version;
          const isLatest = sub.version === maxVersion;
          const isOnTime = sub.timeliness === 'on_time';

          return (
            <div
              key={sub.id}
              style={{
                position: 'relative',
                marginBottom: idx === sortedSubmissions.length - 1 ? '0' : '20px',
              }}
            >
              {/* Connected Timeline Node Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-32px',
                  top: '14px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: isSelected ? '14px' : '12px',
                    height: isSelected ? '14px' : '12px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--accent)' : isOnTime ? 'var(--success)' : 'var(--warning)',
                    border: '2px solid var(--surface-raised)',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(37, 99, 235, 0.2)'
                      : isOnTime
                      ? '0 0 0 2px rgba(16, 185, 129, 0.2)'
                      : '0 0 0 2px rgba(245, 158, 11, 0.2)',
                    transition: 'all var(--transition-fast)',
                  }}
                />
              </div>

              {/* Revision Card */}
              <div
                style={{
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--hairline)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-raised)',
                  boxShadow: isSelected ? 'var(--shadow-raised)' : 'none',
                  overflow: 'hidden',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                {/* Clickable Card Header */}
                <div
                  onClick={() => setSelectedVersion(sub.version)}
                  style={{
                    padding: '12px 16px', // Inset >= 12px
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isSelected ? 'var(--surface-ground)' : 'var(--surface-raised)',
                    cursor: 'pointer',
                    borderBottom: isSelected ? '1px solid var(--hairline)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isSelected ? 'var(--accent)' : 'var(--ink-title)',
                      }}
                    >
                      Phiên bản v{sub.version}
                    </span>
                    {isLatest && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#eff6ff',
                          color: 'var(--accent)',
                          border: '1px solid #bfdbfe',
                          fontWeight: 500,
                        }}
                      >
                        Bản mới nhất
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--ink-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} style={{ color: 'var(--ink-muted)' }} />
                      <span>{sub.submittedBy}</span>
                      <span>•</span>
                      <Clock size={12} style={{ color: 'var(--ink-muted)' }} />
                      <span>{new Date(sub.acceptedAt).toLocaleString('vi-VN')}</span>
                    </span>
                  </div>

                  {/* Status Badge without harsh/glaring colors */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: isOnTime ? '#f0fdf4' : '#fff7ed',
                        color: isOnTime ? '#166534' : '#9a3412',
                        border: `1px solid ${isOnTime ? '#bbf7d0' : '#fed7aa'}`,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isOnTime ? 'var(--success)' : 'var(--warning)',
                          display: 'inline-block',
                        }}
                      />
                      <span>{isOnTime ? 'Đúng hạn' : 'Nộp muộn'}</span>
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ink-muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      {isSelected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>{isSelected ? 'Thu gọn' : 'Chi tiết'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded details when selected (CUXD-07) */}
                {isSelected && (
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Text content */}
                    {sub.text ? (
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--ink-subtle)',
                            marginBottom: '4px',
                          }}
                        >
                          Nội dung báo cáo / ghi chú văn bản:
                        </span>
                        <div
                          style={{
                            backgroundColor: 'var(--surface-ground)',
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--hairline)',
                            fontSize: '13px',
                            whiteSpace: 'pre-wrap',
                            color: 'var(--ink-body)',
                            lineHeight: '1.5',
                          }}
                        >
                          {sub.text}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                        Không có ghi chú văn bản trong phiên bản này.
                      </div>
                    )}

                    {/* Links */}
                    {sub.links && sub.links.length > 0 && (
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--ink-subtle)',
                            marginBottom: '6px',
                          }}
                        >
                          Đường dẫn đính kèm ({sub.links.length}):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {sub.links.map((link, lIdx) => (
                            <div
                              key={lIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                              }}
                            >
                              <Link2 size={13} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}
                              >
                                {link}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {sub.uploadIds && sub.uploadIds.length > 0 && (
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--ink-subtle)',
                            marginBottom: '6px',
                          }}
                        >
                          Tệp đính kèm ({sub.uploadIds.length} tệp):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {sub.uploadIds.map((uId, uIdx) => (
                            <div
                              key={uIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--surface-ground)',
                                border: '1px solid var(--hairline)',
                                fontSize: '12px',
                                color: 'var(--ink-title)',
                              }}
                            >
                              <Paperclip size={13} style={{ color: 'var(--ink-muted)' }} />
                              <span style={{ fontFamily: 'monospace' }}>upload-{uId.slice(0, 10)}...</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teacher Feedback list for this version (ASG-09 / CUXD-07) */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--ink-subtle)',
                          marginBottom: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--hairline)',
                        }}
                      >
                        <MessageSquare size={13} style={{ color: 'var(--ink-muted)' }} />
                        <span>Nhận xét của giáo viên cho phiên bản v{sub.version}:</span>
                      </div>

                      {sub.feedback && sub.feedback.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {sub.feedback.map(fb => (
                            <div
                              key={fb.id}
                              style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                fontSize: '13px',
                                color: '#0369a1',
                              }}
                            >
                              <div style={{ fontSize: '11px', color: '#0284c7', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Giáo viên: {fb.teacherId}</span>
                                <span>{new Date(fb.createdAt).toLocaleString('vi-VN')}</span>
                              </div>
                              <div style={{ lineHeight: 1.4 }}>{fb.text}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                          Chưa có nhận xét nào từ giáo viên cho phiên bản này.
                        </div>
                      )}

                      {/* Teacher Form to add feedback */}
                      {isTeacher && onSubmitFeedback && (
                        <TeacherFeedbackForm submissionId={sub.id} onSubmitFeedback={onSubmitFeedback} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
