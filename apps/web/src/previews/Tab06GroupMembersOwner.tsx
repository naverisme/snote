import React, { useState } from 'react';
import { Crown, Users, UserPlus, UserMinus, ArrowRightLeft, Check, X, ShieldCheck } from 'lucide-react';

interface GroupMemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
  assignedTasks: number;
}

const INITIAL_MEMBERS: GroupMemberItem[] = [
  { id: 'u-lead-01', name: 'Lê Hoàng Nam (Bạn - Trưởng nhóm)', email: 'nam.le@student.edu.vn', role: 'owner', joinedAt: '01/10/2026', assignedTasks: 4 },
  { id: 'u-mem-02', name: 'Trần Thị Mai', email: 'mai.tran@student.edu.vn', role: 'member', joinedAt: '03/10/2026', assignedTasks: 3 },
  { id: 'u-mem-03', name: 'Nguyễn Văn Minh', email: 'minh.nguyen@student.edu.vn', role: 'member', joinedAt: '05/10/2026', assignedTasks: 2 },
  { id: 'u-mem-04', name: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@student.edu.vn', role: 'member', joinedAt: '07/10/2026', assignedTasks: 1 },
];

const INITIAL_REQUESTS = [
  { id: 'req-01', name: 'Đỗ Quốc Bảo', email: 'bao.do@student.edu.vn', requestedAt: '2 giờ trước' },
];

export const Tab06GroupMembersOwner: React.FC = () => {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleApprove = (id: string, name: string) => {
    setRequests(requests.filter(r => r.id !== id));
    setMembers([
      ...members,
      { id, name, email: `${id}@student.edu.vn`, role: 'member', joinedAt: 'Hôm nay', assignedTasks: 0 },
    ]);
    showNotice(`Đã duyệt học sinh ${name} vào workspace nhóm (PER-04)`);
  };

  const handleTransfer = (id: string, name: string) => {
    if (confirm(`Chuyển giao vai trò Trưởng nhóm chính (PER-03) cho ${name}?`)) {
      setMembers(members.map(m => {
        if (m.id === id) return { ...m, role: 'owner' };
        if (m.role === 'owner') return { ...m, role: 'member' };
        return m;
      }));
      showNotice(`Đã bàn giao quyền Trưởng nhóm cho ${name}`);
    }
  };

  const handleKick = (id: string, name: string) => {
    if (confirm(`Đưa thành viên ${name} ra khỏi nhóm?`)) {
      setMembers(members.filter(m => m.id !== id));
      showNotice(`Đã xóa ${name} khỏi nhóm`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Info Card */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Quản trị Thành viên: Nhóm 01 - AI & Data
            </h2>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>
              Trưởng nhóm (PER-03)
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Quản trị độc lập không gian làm việc nhóm thuộc lớp CS101 • Sĩ số: {members.length}/5 thành viên
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={15} />
          <span>Mời bạn cùng lớp</span>
        </button>
      </div>

      {/* Pending Join Requests */}
      {requests.length > 0 && (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Đơn xin gia nhập nhóm chờ Trưởng nhóm duyệt (PER-04)</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)' }}>{requests.length}</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requests.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{req.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.email} • Gửi lúc: {req.requestedAt}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="btn btn-primary btn-sm" style={{ padding: '4px 12px', height: '28px', fontSize: '12px' }} onClick={() => handleApprove(req.id, req.name)}>Duyệt vào</button>
                  <button type="button" className="btn btn-outline btn-sm" style={{ padding: '4px 12px', height: '28px', fontSize: '12px' }} onClick={() => setRequests(requests.filter(r => r.id !== req.id))}>Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Danh sách thành viên chính thức ({members.length})
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 500 }}>Thành viên</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Vai trò</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Ngày vào nhóm</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Đầu việc phụ trách</th>
              <th style={{ padding: '12px 20px', fontWeight: 500, textAlign: 'right' }}>Thao tác Trưởng nhóm</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.email}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {m.role === 'owner' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                      <Crown size={12} /> Trưởng nhóm (Owner)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Thành viên</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{m.joinedAt}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.assignedTasks} công việc</td>
                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                  {m.role !== 'owner' && (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
                        title="Chuyển quyền Trưởng nhóm (STR-09)"
                        onClick={() => handleTransfer(m.id, m.name)}
                      >
                        <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
                        <span>Chuyển trưởng nhóm</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '3px 8px', height: '26px', color: 'rgba(248, 113, 113, 0.9)' }}
                        title="Xóa thành viên khỏi nhóm"
                        onClick={() => handleKick(m.id, m.name)}
                      >
                        <UserMinus size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal mời bạn cùng lớp */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Mời bạn cùng lớp vào nhóm</h2>
              <button type="button" onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Nhập email của bạn học trong lớp CS101 chưa tham gia nhóm nào:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="vd: banhoc@student.edu.vn"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (inviteEmail.trim()) {
                    showNotice(`Đã gửi lời mời tham gia nhóm tới ${inviteEmail}`);
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }
                }}
              >
                Mời vào
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
