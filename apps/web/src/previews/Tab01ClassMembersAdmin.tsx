import React, { useState } from 'react';
import { Users, Award, ShieldCheck, UserCheck, Key, UserPlus, UserMinus, Search, Check, RefreshCw } from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'monitor' | 'member';
  groupName: string;
  joinedAt: string;
  status: 'active' | 'pending';
}

const INITIAL_MEMBERS: MemberItem[] = [
  { id: 'm-01', name: 'TS. Nguyễn Văn Toàn (Bạn)', email: 'toan.nv@hcmut.edu.vn', role: 'teacher', groupName: 'Giáo viên chủ nhiệm', joinedAt: '01/09/2026', status: 'active' },
  { id: 'm-02', name: 'Lê Hoàng Nam (Lớp trưởng)', email: 'nam.le@student.edu.vn', role: 'monitor', groupName: 'Nhóm 01 - AI & Data', joinedAt: '03/09/2026', status: 'active' },
  { id: 'm-03', name: 'Trần Thị Mai', email: 'mai.tran@student.edu.vn', role: 'member', groupName: 'Nhóm 01 - AI & Data', joinedAt: '03/09/2026', status: 'active' },
  { id: 'm-04', name: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@student.edu.vn', role: 'member', groupName: 'Nhóm 02 - Web Platform', joinedAt: '04/09/2026', status: 'active' },
  { id: 'm-05', name: 'Đỗ Quốc Bảo', email: 'bao.do@student.edu.vn', role: 'member', groupName: 'Chưa có nhóm', joinedAt: '05/09/2026', status: 'active' },
  { id: 'm-06', name: 'Vũ Đức Thịnh', email: 'thinh.vu@student.edu.vn', role: 'member', groupName: 'Chưa có nhóm', joinedAt: '06/09/2026', status: 'active' },
];

const INITIAL_REQUESTS = [
  { id: 'req-01', name: 'Nguyễn Thanh Hằng', email: 'hang.nguyen@student.edu.vn', requestedAt: '10 phút trước' },
  { id: 'req-02', name: 'Bùi Anh Tuấn', email: 'tuan.bui@student.edu.vn', requestedAt: '1 giờ trước' },
];

export const Tab01ClassMembersAdmin: React.FC = () => {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [search, setSearch] = useState('');
  const [joinCodeEnabled, setJoinCodeEnabled] = useState(true);
  const [joinCode, setJoinCode] = useState('SNOTE-CS101-2026');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleMonitor = (id: string, currentRole: string) => {
    const nextRole = currentRole === 'monitor' ? 'member' : 'monitor';
    setMembers(members.map(m => m.id === id ? { ...m, role: nextRole as any } : m));
    showNotice(`Đã chuyển vai trò thành ${nextRole === 'monitor' ? 'Lớp trưởng (PER-10)' : 'Học sinh thường'}`);
  };

  const handleApproveRequest = (id: string, name: string) => {
    setRequests(requests.filter(r => r.id !== id));
    setMembers([
      ...members,
      {
        id,
        name,
        email: `${id}@student.edu.vn`,
        role: 'member',
        groupName: 'Chưa có nhóm',
        joinedAt: 'Vừa xong',
        status: 'active',
      },
    ]);
    showNotice(`Đã duyệt học sinh ${name} vào lớp học`);
  };

  const handleKick = (id: string, name: string) => {
    if (confirm(`Đưa học sinh ${name} ra khỏi lớp học?`)) {
      setMembers(members.filter(m => m.id !== id));
      showNotice(`Đã xóa ${name} khỏi lớp`);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {feedback && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Controls Bar: Join Code & Quick Actions */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Key size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Mã tham gia lớp (Join Code): <code style={{ background: 'var(--surface-hover)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>{joinCode}</code></div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Học sinh gửi yêu cầu vào lớp bằng mã này (CLS-03)</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setJoinCode(`SNOTE-CS101-${Math.floor(1000 + Math.random() * 9000)}`);
              showNotice('Đã tạo mã tham gia lớp mới');
            }}
          >
            <RefreshCw size={14} style={{ marginRight: '6px' }} />
            <span>Đổi mã mới</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${joinCodeEnabled ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setJoinCodeEnabled(!joinCodeEnabled);
              showNotice(joinCodeEnabled ? 'Đã tạm khóa mã vào lớp' : 'Đã mở nhận yêu cầu qua mã');
            }}
          >
            <span>{joinCodeEnabled ? 'Đang mở mã' : 'Đang khóa mã'}</span>
          </button>
        </div>
      </div>

      {/* Pending Join Requests Section */}
      {requests.length > 0 && (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Yêu cầu xin gia nhập lớp chờ duyệt (CLS-03)</span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)' }}>{requests.length}</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requests.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{req.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.email} • Gửi lúc: {req.requestedAt}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="btn btn-primary btn-sm" style={{ padding: '4px 12px', height: '28px', fontSize: '12px' }} onClick={() => handleApproveRequest(req.id, req.name)}>Duyệt</button>
                  <button type="button" className="btn btn-outline btn-sm" style={{ padding: '4px 12px', height: '28px', fontSize: '12px' }} onClick={() => setRequests(requests.filter(r => r.id !== req.id))}>Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Danh sách học sinh & thành viên ({filteredMembers.length})
          </h2>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '12px' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 500 }}>Học sinh / Thành viên</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Vai trò cấp lớp (PER-10)</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Nhóm tham gia</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Ngày vào lớp</th>
              <th style={{ padding: '12px 20px', fontWeight: 500, textAlign: 'right' }}>Thao tác giáo viên</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.email}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {m.role === 'teacher' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                      <ShieldCheck size={13} /> Giáo viên chủ lớp
                    </span>
                  ) : m.role === 'monitor' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                      <Award size={13} /> Lớp trưởng
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Học sinh (Member)</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: m.groupName === 'Chưa có nhóm' ? 'rgba(248, 113, 113, 0.9)' : 'var(--text-primary)' }}>
                  {m.groupName}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {m.joinedAt}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                  {m.role !== 'teacher' && (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
                        title="Bổ nhiệm / Bãi nhiệm Lớp trưởng"
                        onClick={() => handleToggleMonitor(m.id, m.role)}
                      >
                        {m.role === 'monitor' ? 'Hạ vai trò' : 'Đặt làm Lớp trưởng'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '3px 8px', height: '26px', color: 'rgba(248, 113, 113, 0.9)' }}
                        title="Đưa ra khỏi lớp"
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
    </div>
  );
};
