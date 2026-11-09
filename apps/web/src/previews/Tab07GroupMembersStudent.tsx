import React, { useState } from 'react';
import { Crown, Users, LogOut, AlertTriangle, Check, CheckSquare } from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  assignedTasks: number;
}

const MEMBERS: MemberItem[] = [
  { id: 'u-lead-01', name: 'Lê Hoàng Nam', email: 'nam.le@student.edu.vn', role: 'owner', assignedTasks: 4 },
  { id: 'u-mem-02', name: 'Trần Thị Mai (Bạn)', email: 'mai.tran@student.edu.vn', role: 'member', assignedTasks: 3 },
  { id: 'u-mem-03', name: 'Nguyễn Văn Minh', email: 'minh.nguyen@student.edu.vn', role: 'member', assignedTasks: 2 },
  { id: 'u-mem-04', name: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@student.edu.vn', role: 'member', assignedTasks: 1 },
];

export const Tab07GroupMembersStudent: React.FC = () => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const lead = MEMBERS.find(m => m.role === 'owner');
  const mates = MEMBERS.filter(m => m.role === 'member');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Context Card */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Nhóm 01 - AI & Data Platform
            </h2>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>
              Thành viên nhóm
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Bạn đang phụ trách <strong style={{ color: 'var(--text-primary)' }}>3 công việc</strong> trong đồ án môn học này
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(248, 113, 113, 0.9)' }}
          onClick={() => setShowLeaveModal(true)}
        >
          <LogOut size={14} />
          <span>Rời khỏi nhóm</span>
        </button>
      </div>

      {/* Trưởng nhóm Lead Info Card */}
      {lead && (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <Crown size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Trưởng nhóm phụ trách (PER-03)</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lead.email} • Phụ trách điều phối & đại diện nộp bài</div>
            </div>
          </div>
        </div>
      )}

      {/* Thành viên Table */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Tất cả các thành viên trong nhóm ({MEMBERS.length})
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 500 }}>Họ và tên</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Vai trò</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Việc được gán</th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {m.name}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {m.email}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {m.role === 'owner' ? (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Trưởng nhóm</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Thành viên</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                  {m.assignedTasks} công việc
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal rời nhóm */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'rgba(248, 113, 113, 0.9)' }}>
              <AlertTriangle size={20} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Xác nhận rời khỏi nhóm học tập</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Quy tắc bàn giao trách nhiệm (STR-09): Bạn hiện đang nhận 3 công việc trong nhóm. Toàn bộ tài liệu, ghi chú và các bản nộp đã gửi sẽ ở lại nhóm. Hãy thông báo cho Trưởng nhóm để bàn giao các đầu việc trước khi rời đi.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowLeaveModal(false)}>Hủy</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 0.8)' }}
                onClick={() => {
                  setShowLeaveModal(false);
                  setNotice('Đã gửi thông báo rời nhóm tới Trưởng nhóm');
                  setTimeout(() => setNotice(null), 3000);
                }}
              >
                Xác nhận rời nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
