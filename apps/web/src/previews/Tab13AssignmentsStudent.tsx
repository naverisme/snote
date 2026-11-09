import React, { useState } from 'react';
import { Award, Clock, FileText, Send, CheckCircle2, History, Check, AlertTriangle, Plus } from 'lucide-react';

interface SubmissionRevision {
  version: number;
  submittedAt: string;
  notes: string;
  attachments: string[];
  feedback?: string;
  grade?: string;
}

const INITIAL_REVISIONS: SubmissionRevision[] = [
  {
    version: 2,
    submittedAt: '08/11/2026, 14:30',
    notes: 'Đã hoàn tất báo cáo kỹ thuật và bổ sung test script 100% pass.',
    attachments: ['SNOTE_v2_Final_Report.pdf', 'E2E_Test_Summary.log'],
    grade: '9.5 / 10',
    feedback: 'Bài nộp rất xuất sắc, kiến trúc phân tầng rõ ràng và kiểm thử kỹ lưỡng.',
  },
  {
    version: 1,
    submittedAt: '05/11/2026, 20:15',
    notes: 'Bản nộp sơ thảo lần 1: Đã xong tài liệu kiến trúc và mock UI.',
    attachments: ['SNOTE_v2_Draft.pdf'],
    grade: 'Chưa chấm',
    feedback: 'Cần bổ sung thêm tài liệu OpenAPI và chạy kiểm thử E2E.',
  },
];

export const Tab13AssignmentsStudent: React.FC = () => {
  const [revisions, setRevisions] = useState(INITIAL_REVISIONS);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleNewSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    const nextVer: SubmissionRevision = {
      version: revisions.length + 1,
      submittedAt: 'Vừa xong',
      notes: notes.trim(),
      attachments: fileName ? [fileName] : ['Submission_Payload.pdf'],
      grade: 'Chờ giáo viên chấm',
    };
    setRevisions([nextVer, ...revisions]);
    setNotes('');
    setFileName('');
    showNotice(`Đã nộp thành công phiên bản mới (Phiên bản v${nextVer.version} - ASG-05)`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {feedbackNotice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Assignment Overview */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Bài giao lớp học (CUXD-05)
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hạn chót: 23:59, 15/11/2026 (Còn 6 ngày)</span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          Đồ án Chuyên ngành: Xây dựng Hệ thống SNOTE v2
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Yêu cầu: Hoàn thành thiết kế hệ thống, hợp đồng OpenAPI, kiểm thử tự động đạt 100% test suites và cấu hình Docker Compose.
        </p>
      </div>

      {/* Versioned Submission Form (ASG-03/05) */}
      <form onSubmit={handleNewSubmission} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Nộp bài theo phiên bản mới (v{revisions.length + 1})
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Mỗi lần nộp bài tạo một snapshot phiên bản độc lập (ASG-05). Lịch sử và nhận xét được gắn chặt theo phiên bản.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Ghi chú đính kèm bản nộp</label>
            <textarea
              rows={3}
              placeholder="Mô tả tóm tắt nội dung bạn đã thực hiện hoặc link repo Git..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Tệp đính kèm (PDF, ZIP, PPTX)</label>
            <input
              type="text"
              placeholder="vd: SNOTE_v2_Final_Solution.pdf"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Send size={14} />
          <span>Gửi bản nộp phiên bản v{revisions.length + 1}</span>
        </button>
      </form>

      {/* Revision History & Teacher Feedbacks */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} />
          <span>Lịch sử các phiên bản nộp bài ({revisions.length} phiên bản)</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {revisions.map(rev => (
            <div
              key={rev.version}
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)' }}>
                    Phiên bản v{rev.version}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nộp lúc: {rev.submittedAt}</span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Điểm: {rev.grade}
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                {rev.notes}
              </p>

              {rev.attachments.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {rev.attachments.map((att, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
                      <FileText size={11} /> {att}
                    </span>
                  ))}
                </div>
              )}

              {rev.feedback && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-divider)', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <strong>Nhận xét của Giáo viên:</strong> &ldquo;{rev.feedback}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
