import React, { useState } from 'react';
import { Users, Award, ShieldCheck, LogOut, AlertTriangle, Check, BookOpen, Layers } from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'monitor' | 'member';
  groupName: string;
}

const MEMBERS_DATA: MemberItem[] = [
  { id: 'm-01', name: 'TS. Nguyễn Văn Toàn', email: 'toan.nv@hcmut.edu.vn', role: 'teacher', groupName: 'Giáo viên hướng dẫn' },
  { id: 'm-02', name: 'Lê Hoàng Nam', email: 'nam.le@student.edu.vn', role: 'monitor', groupName: 'Nhóm 01 - AI & Data' },
  { id: 'm-03', name: 'Trần Thị Mai (Bạn)', email: 'mai.tran@student.edu.vn', role: 'member', groupName: 'Nhóm 01 - AI & Data' },
  { id: 'm-04', name: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@student.edu.vn', role: 'member', groupName: 'Nhóm 02 - Web Platform' },
  { id: 'm-05', name: 'Đỗ Quốc Bảo', email: 'bao.do@student.edu.vn', role: 'member', groupName: 'Chưa có nhóm' },
  { id: 'm-06', name: 'Vũ Đức Thịnh', email: 'thinh.vu@student.edu.vn', role: 'member', groupName: 'Chưa có nhóm' },
];

export const Tab02ClassMembersStudent: React.FC = () => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const teacher = MEMBERS_DATA.find(m => m.role === 'teacher');
  const monitor = MEMBERS_DATA.find(m => m.role === 'monitor');
  const classmates = MEMBERS_DATA.filter(m => m.role === 'member');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Student Context Status Card */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Tư cách thành viên lớp học (CLS-13)</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>Member</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Bạn đang tham gia nhóm: <strong style={{ color: 'var(--text-primary)' }}>Nhóm 01 - AI & Data</strong> • Điểm tiến độ nhóm gắn chặt với lớp
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(248, 113, 113, 0.9)' }}
          onClick={() => setShowLeaveModal(true)}
        >
          <LogOut size={14} />
          <span>Rời khỏi lớp học</span>
        </button>
      </div>

      {/* Leadership & Staff Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {teacher && (
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Giáo viên chủ lớp (PER-01)</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{teacher.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{teacher.email}</div>
              </div>
            </div>
          </div>
        )}

        {monitor && (
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Lớp trưởng (PER-02/10)</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{monitor.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{monitor.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Classmates Directory */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Danh bạ học sinh trong lớp ({classmates.length} bạn học)
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 500 }}>Họ và tên</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Email liên hệ</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Nhóm học tập</th>
            </tr>
          </thead>
          <tbody>
            {classmates.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {c.name}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {c.email}
                </td>
                <td style={{ padding: '12px 16px', color: c.groupName === 'Chưa có nhóm' ? 'rgba(248, 113, 113, 0.9)' : 'var(--text-primary)' }}>
                  {c.groupName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Rời lớp */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'rgba(248, 113, 113, 0.9)' }}>
              <AlertTriangle size={20} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Xác nhận rời khỏi lớp học</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Theo quy định STR-09, việc rời lớp sẽ tự động hủy tư cách của bạn trong workspace nhóm và các bài giao liên quan. Lịch sử bài tập và bản nộp của bạn vẫn được lưu giữ tại lớp.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowLeaveModal(false)}>Hủy</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 0.8)' }}
                onClick={() => {
                  setShowLeaveModal(false);
                  setNotice('Đã gửi yêu cầu rời lớp tới giáo viên');
                  setTimeout(() => setNotice(null), 3000);
                }}
              >
                Rời lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
