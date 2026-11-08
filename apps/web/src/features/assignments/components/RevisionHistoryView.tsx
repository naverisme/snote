import React, { useState } from 'react';
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
          padding: '32px 24px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          fontSize: '13px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>
          Chưa có phiên bản nộp nào
        </div>
        <div style={{ fontSize: '12px' }}>
          Lịch sử các lần nộp và sửa đổi bài sẽ xuất hiện dưới dạng dòng thời gian tại đây.
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
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Lịch sử phiên bản nộp bài ({submissions.length} phiên bản)
        </span>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Bấm vào phiên bản trên timeline để xem chi tiết
        </span>
      </div>

      {/* Vertical Timeline with connected node dots */}
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
            backgroundColor: '#e2e8f0',
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
                    backgroundColor: isSelected ? '#2563eb' : isOnTime ? '#16a34a' : '#ea580c',
                    border: '2px solid #ffffff',
                    boxShadow: isSelected
                      ? '0 0 0 3px #dbeafe'
                      : isOnTime
                      ? '0 0 0 2px #dcfce7'
                      : '0 0 0 2px #fed7aa',
                    transition: 'all 150ms ease',
                  }}
                />
              </div>

              {/* Revision Card */}
              <div
                style={{
                  border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: isSelected ? '0 1px 3px 0 rgba(0, 0, 0, 0.05)' : 'none',
                  overflow: 'hidden',
                  transition: 'border-color 140ms ease, box-shadow 140ms ease',
                }}
              >
                {/* Clickable Card Header */}
                <div
                  onClick={() => setSelectedVersion(sub.version)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    borderBottom: isSelected ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#1e40af' : '#0f172a' }}>
                      Phiên bản {sub.version}
                    </span>
                    {isLatest && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #dbeafe',
                          fontWeight: 500,
                        }}
                      >
                        Bản mới nhất
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Nộp bởi {sub.submittedBy} • {new Date(sub.acceptedAt).toLocaleString('vi-VN')}
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
                          backgroundColor: isOnTime ? '#16a34a' : '#ea580c',
                          display: 'inline-block',
                        }}
                      />
                      {isOnTime ? 'Đúng hạn' : 'Nộp muộn'}
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                    >
                      {isSelected ? '▲ Thu gọn' : '▼ Chi tiết'}
                    </button>
                  </div>
                </div>

                {/* Expanded details when selected */}
                {isSelected && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Text content */}
                    {sub.text ? (
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '4px',
                          }}
                        >
                          Nội dung báo cáo / ghi chú văn bản:
                        </span>
                        <div
                          style={{
                            backgroundColor: '#f8fafc',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            whiteSpace: 'pre-wrap',
                            color: '#1e293b',
                            lineHeight: '1.5',
                          }}
                        >
                          {sub.text}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
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
                            color: '#475569',
                            marginBottom: '6px',
                          }}
                        >
                          Đường dẫn đính kèm ({sub.links.length}):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                              <span style={{ color: '#64748b' }}>🔗</span>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
                              >
                                {link}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments (uploadIds) */}
                    {sub.uploadIds && sub.uploadIds.length > 0 && (
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '6px',
                          }}
                        >
                          Tệp đính kèm ({sub.uploadIds.length}):
                        </span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {sub.uploadIds.map((blobId, bIdx) => (
                            <span
                              key={bIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontSize: '12px',
                                color: '#334155',
                              }}
                            >
                              <span>📎</span>
                              <span>{blobId}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback list */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#334155',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Nhận xét của giáo viên ({sub.feedback?.length ?? 0}):
                      </span>

                      {(!sub.feedback || sub.feedback.length === 0) ? (
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '8px' }}>
                          Chưa có nhận xét cho phiên bản này.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {sub.feedback.map(fb => (
                            <div
                              key={fb.id}
                              style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '13px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 500, color: '#0f172a' }}>Giáo viên ({fb.teacherId})</span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {new Date(fb.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div style={{ color: '#334155', lineHeight: '1.4' }}>{fb.text}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Teacher feedback form if in teacher mode */}
                      {isTeacher && onSubmitFeedback && (
                        <TeacherFeedbackForm
                          submissionId={sub.id}
                          onSubmitFeedback={onSubmitFeedback}
                        />
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
