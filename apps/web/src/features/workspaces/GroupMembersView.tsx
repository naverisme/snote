import React, { useState } from 'react';
import { Users, Crown, UserMinus, UserPlus, LogOut, ShieldCheck, Mail, ArrowRightLeft, Check, X, AlertTriangle } from 'lucide-react';
import type { Workspace, Account } from '../../shared/types';

interface GroupMemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
  assignedTasksCount: number;
}

interface GroupMembersViewProps {
  workspace: Workspace;
  currentUser?: Account | null;
  viewRole?: 'owner' | 'member';
}

const MOCK_GROUP_MEMBERS: GroupMemberItem[] = [
  {
    id: 'u-lead-01',
    name: 'Nguyễn Văn Minh (Bạn)',
    email: 'minh.nguyen@example.com',
    role: 'owner',
    joinedAt: '01/10/2026',
    assignedTasksCount: 4,
  },
  {
    id: 'u-mem-02',
    name: 'Trần Thị Mai',
    email: 'mai.tran@example.com',
    role: 'member',
    joinedAt: '03/10/2026',
    assignedTasksCount: 3,
  },
  {
    id: 'u-mem-03',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@example.com',
    role: 'member',
    joinedAt: '05/10/2026',
    assignedTasksCount: 2,
  },
  {
    id: 'u-mem-04',
    name: 'Phạm Quỳnh Anh',
    email: 'quynhanh.pham@example.com',
    role: 'member',
    joinedAt: '07/10/2026',
    assignedTasksCount: 1,
  },
];

const MOCK_PENDING_REQUESTS = [
  { id: 'req-01', name: 'Đỗ Quốc Bảo', email: 'bao.do@example.com', requestedAt: '08/11/2026' },
];

export const GroupMembersView: React.FC<GroupMembersViewProps> = ({
  workspace,
  viewRole: initialRole,
}) => {
  const [role, setRole] = useState<'owner' | 'member'>(initialRole ?? 'owner');
  const [members, setMembers] = useState<GroupMemberItem[]>(MOCK_GROUP_MEMBERS);
  const [requests, setRequests] = useState(MOCK_PENDING_REQUESTS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isOwner = role === 'owner';

  // Personal workspace guard
  if (workspace.kind === 'default') {
    return (
      <div className="section-box" style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-primary)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Không gian Cá nhân Độc lập
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Theo quy định an toàn dữ liệu cá nhân (ACC-06), Workspace mặc định không cho phép chia sẻ hoặc thêm thành viên khác.
            Để cộng tác nhóm, vui lòng tham gia hoặc tạo nhóm trong lớp học.
          </p>
        </div>
      </div>
    );
  }

  const handleApproveRequest = (id: string, name: string) => {
    setRequests(requests.filter(r => r.id !== id));
    setMembers([
      ...members,
      {
        id,
        name,
        email: `${id}@example.com`,
        role: 'member',
        joinedAt: 'Hôm nay',
        assignedTasksCount: 0,
      },
    ]);
    setActionSuccess(`Đã duyệt thành viên ${name} vào nhóm`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeclineRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleKickMember = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn đưa ${name} ra khỏi nhóm?`)) {
      setMembers(members.filter(m => m.id !== id));
      setActionSuccess(`Đã xóa ${name} khỏi nhóm`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleTransferOwnership = (id: string, name: string) => {
    if (confirm(`Chuyển giao quyền Trưởng nhóm cho ${name}? Bạn sẽ trở thành thành viên thường.`)) {
      setMembers(members.map(m => {
        if (m.id === id) return { ...m, role: 'owner' };
        if (m.role === 'owner') return { ...m, role: 'member' };
        return m;
      }));
      setRole('member');
      setActionSuccess(`Đã chuyển quyền Trưởng nhóm cho ${name}`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Role Switcher Toolbar (Preview Mode) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-hover)',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-divider)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} style={{ color: 'var(--text-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Góc nhìn quyền hạn (Preview):
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {isOwner ? 'Trưởng nhóm (Owner/Lead)' : 'Thành viên (Member)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className={`btn btn-sm ${isOwner ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '12px', padding: '4px 10px', height: '28px' }}
            onClick={() => setRole('owner')}
          >
            Trưởng nhóm (Owner)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!isOwner ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '12px', padding: '4px 10px', height: '28px' }}
            onClick={() => setRole('member')}
          >
            Thành viên (Member)
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            padding: '10px 16px',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header Overview Card */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Thành viên Nhóm: {workspace.name}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Tổng số: {members.length} thành viên • Quản trị độc lập không gian làm việc nhóm
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isOwner ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={15} />
              <span>Mời bạn cùng lớp</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(248, 113, 113, 0.9)' }}
              onClick={() => setShowLeaveModal(true)}
            >
              <LogOut size={15} />
              <span>Rời khỏi nhóm</span>
            </button>
          )}
        </div>
      </div>

      {/* Owner: Pending Join Requests Queue */}
      {isOwner && requests.length > 0 && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '16px 20px',
          }}
        >
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Yêu cầu xin gia nhập nhóm</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-divider)',
              }}
            >
              {requests.length}
            </span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requests.map(req => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface-hover)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{req.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.email} • Yêu cầu: {req.requestedAt}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 10px', height: '28px', fontSize: '12px' }}
                    onClick={() => handleApproveRequest(req.id, req.name)}
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 10px', height: '28px', fontSize: '12px' }}
                    onClick={() => handleDeclineRequest(req.id)}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Directory Table */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Danh sách thành viên hiện tại ({members.length})
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 500 }}>Thành viên</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Vai trò</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Ngày gia nhập</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Việc phụ trách</th>
              {isOwner && <th style={{ padding: '12px 20px', fontWeight: 500, textAlign: 'right' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr
                key={m.id}
                style={{
                  borderBottom: '1px solid var(--border-divider)',
                  transition: 'background-color 120ms ease',
                }}
              >
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-divider)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {m.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.email}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  {m.role === 'owner' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-divider)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Crown size={12} />
                      <span>Trưởng nhóm</span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Thành viên</span>
                  )}
                </td>

                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {m.joinedAt}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {m.assignedTasksCount} công việc
                  </span>
                </td>

                {isOwner && (
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    {m.role !== 'owner' && (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
                          title="Chuyển quyền Trưởng nhóm"
                          onClick={() => handleTransferOwnership(m.id, m.name)}
                        >
                          <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
                          <span>Chuyển quyền</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px', height: '26px', color: 'rgba(248, 113, 113, 0.9)' }}
                          title="Xóa khỏi nhóm"
                          onClick={() => handleKickMember(m.id, m.name)}
                        >
                          <UserMinus size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Mời bạn cùng lớp */}
      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Mời thành viên vào nhóm
              </h2>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Nhập email hoặc tên người dùng của bạn học trong lớp để gửi lời mời tham gia workspace nhóm:
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="vd: banhoc@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (inviteEmail.trim()) {
                    setActionSuccess(`Đã gửi lời mời tới ${inviteEmail}`);
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setTimeout(() => setActionSuccess(null), 3000);
                  }
                }}
              >
                Gửi lời mời
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận rời nhóm (Member) */}
      {showLeaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'rgba(248, 113, 113, 0.9)' }}>
              <AlertTriangle size={20} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Xác nhận rời khỏi nhóm
              </h2>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Theo quy định bàn giao công việc (STR-09), toàn bộ việc bạn đã nhận và tiến độ nộp bài sẽ ở lại nhóm.
              Vui lòng đảm bảo bạn đã hoàn tất hoặc bàn giao các đầu việc đang phụ trách cho Trưởng nhóm trước khi tiếp tục.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowLeaveModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 0.8)' }}
                onClick={() => {
                  setShowLeaveModal(false);
                  setActionSuccess('Bạn đã rời khỏi nhóm thành công');
                  setTimeout(() => setActionSuccess(null), 3000);
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
