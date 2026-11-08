import React, { useEffect, useState } from 'react';
import { Award, User, ShieldCheck } from 'lucide-react';
import type { Class, Membership, Invitation, JoinRequest, Account } from '../../shared/types';
import {
  listClassMembers,
  changeMemberRole,
  setClassJoinCode,
  createClassJoinRequest,
  listClassJoinRequests,
  approveClassJoinRequest,
  declineClassJoinRequest,
  createClassInvitation,
  acceptClassInvitation,
  declineClassInvitation,
  removeClassMember,
  leaveClass,
  getMyInvitations,
} from '../../shared/api';

interface ClassMembersViewProps {
  cls: Class;
  currentUser: Account | null;
  onClassUpdated?: (updated: Class) => void;
}

export function ClassMembersView({ cls, currentUser, onClassUpdated }: ClassMembersViewProps) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [myInvitations, setMyInvitations] = useState<Invitation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [joinCodeEnabled, setJoinCodeEnabled] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [inviteeId, setInviteeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isOwner = currentUser?.id === cls.ownerId;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, myInvsRes] = await Promise.all([
        listClassMembers(cls.id),
        getMyInvitations(),
      ]);
      setMembers(membersRes.data);
      setMyInvitations(myInvsRes.data.filter(i => i.targetType === 'class' && i.targetId === cls.id && i.status === 'pending'));

      if (isOwner) {
        const reqsRes = await listClassJoinRequests(cls.id);
        setPendingRequests(reqsRes.data);
      }
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [cls.id]);

  const handleRoleChange = async (membershipId: string, currentRole: 'member' | 'monitor', version: number) => {
    if (!isOwner) return;
    const nextRole = currentRole === 'member' ? 'monitor' : 'member';
    try {
      await changeMemberRole(cls.id, membershipId, nextRole, version);
      setInfo(`Đã đổi vai trò thành ${nextRole === 'monitor' ? 'Lớp trưởng' : 'Thành viên'}`);
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Không thể đổi vai trò');
    }
  };

  const handleToggleJoinCode = async () => {
    if (!isOwner) return;
    try {
      const nextState = !joinCodeEnabled;
      const res = await setClassJoinCode(cls.id, nextState, cls.version);
      setJoinCodeEnabled(res.data.enabled);
      setJoinCode(res.data.code ?? null);
      if (onClassUpdated) {
        onClassUpdated({ ...cls, version: res.data.version });
      }
      setInfo(nextState ? `Mã lớp mới: ${res.data.code}` : 'Đã tắt mã lớp');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi cập nhật mã lớp');
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    try {
      await createClassJoinRequest(cls.id, inputCode.trim());
      setInfo('Yêu cầu gia nhập bằng mã đã được gửi tới giáo viên!');
      setInputCode('');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Mã lớp không hợp lệ');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeId.trim()) return;
    try {
      await createClassInvitation(cls.id, inviteeId.trim());
      setInfo('Đã gửi lời mời tham gia lớp học!');
      setInviteeId('');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi gửi lời mời');
    }
  };

  const handleApproveRequest = async (requestId: string, version: number) => {
    try {
      await approveClassJoinRequest(requestId, version);
      setInfo('Đã duyệt yêu cầu vào lớp');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi duyệt');
    }
  };

  const handleDeclineRequest = async (requestId: string, version: number) => {
    try {
      await declineClassJoinRequest(requestId, version);
      setInfo('Đã từ chối yêu cầu vào lớp');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi từ chối');
    }
  };

  const handleAcceptInvitation = async (invitationId: string, version: number) => {
    try {
      await acceptClassInvitation(invitationId, version);
      setInfo('Đã chấp nhận lời mời vào lớp!');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi chấp nhận');
    }
  };

  const handleDeclineInvitation = async (invitationId: string, version: number) => {
    try {
      await declineClassInvitation(invitationId, version);
      setInfo('Đã từ chối lời mời');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi từ chối');
    }
  };

  const handleRemoveMember = async (memberId: string, version: number) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi lớp?')) return;
    try {
      await removeClassMember(cls.id, memberId, version);
      setInfo('Đã xóa thành viên khỏi lớp');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi xóa thành viên');
    }
  };

  const handleLeaveClass = async () => {
    if (!confirm('Bạn có chắc muốn rời lớp học này?')) return;
    try {
      await leaveClass(cls.id);
      setInfo('Bạn đã rời lớp');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi rời lớp');
    }
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Thành viên lớp: {cls.name}</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Múi giờ: {cls.timeZone}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isOwner && (
            <button className="btn btn-secondary btn-sm" onClick={handleLeaveClass}>
              Rời lớp
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            Làm mới
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
      {info && <div style={{ color: 'var(--success)', marginBottom: 12, fontSize: '0.875rem' }}>{info}</div>}

      {/* Class Join Code & Invitation Bar */}
      <div className="section-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {isOwner ? (
          <>
            <div>
              <span style={{ fontWeight: 600, marginRight: 8 }}>Mã tham gia lớp:</span>
              {joinCode ? (
                <code style={{ background: 'var(--surface-ground)', border: '1px solid var(--border-light)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>{joinCode}</code>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Chưa bật</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleToggleJoinCode}>
                {joinCodeEnabled ? 'Tắt mã lớp' : 'Bật mã tham gia lớp'}
              </button>

              <form onSubmit={handleInvite} style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Mã tài khoản học sinh..."
                  value={inviteeId}
                  onChange={e => setInviteeId(e.target.value)}
                  style={{ width: 180, padding: '4px 8px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">Mời học sinh</button>
              </form>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmitCode} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Nhập mã vào lớp:</span>
            <input
              className="form-input"
              type="text"
              placeholder="Nhập mã 8 ký tự..."
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              style={{ width: 160, padding: '4px 8px', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">Gửi yêu cầu</button>
          </form>
        )}
      </div>

      {/* Zone 2: My Invitations for this class */}
      {myInvitations.length > 0 && (
        <div className="section-box" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="section-title">Lời mời tham gia lớp học dành cho bạn</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Giáo viên đã gửi lời mời tham gia lớp học này cho bạn.
          </p>
          {myInvitations.map(inv => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span>Lời mời từ giáo viên (Mã: {inv.id.slice(0, 8)}...)</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => handleAcceptInvitation(inv.id, inv.version)}>
                  Chấp nhận
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDeclineInvitation(inv.id, inv.version)}>
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone 3: Pending Join Requests (Owner only) */}
      {isOwner && pendingRequests.length > 0 && (
        <div className="section-box" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="section-title">Yêu cầu tham gia đang chờ duyệt ({pendingRequests.length})</div>
          <div className="table-container" style={{ marginTop: 8 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người xin vào</th>
                  <th>Thời điểm</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontFamily: 'monospace' }}>{req.initiatorId}</td>
                    <td>{req.acceptedAt || 'Vừa xong'}</td>
                    <td><span className="badge badge-warning">Chờ duyệt</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={() => handleApproveRequest(req.id, req.version)}
                      >
                        Duyệt
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeclineRequest(req.id, req.version)}
                      >
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zone 1: Main Class Members Table (CUXC-07, CUXC-11) */}
      <div className="section-box">
        <div className="section-header">
          <div className="section-title">Danh sách người trong lớp ({members.length + 1})</div>
        </div>

        <div className="table-container class-members-container">
          <table className="data-table class-members-table">
            <thead>
              <tr>
                <th className="col-learner">Người học (Learner)</th>
                <th>Vai trò (Role)</th>
                <th>Nhóm đang tham gia</th>
                {isOwner && <th style={{ textAlign: 'right' }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {/* Owner row */}
              <tr className="owner-row">
                <td className="col-learner">
                  <strong>{cls.ownerId}</strong> <span className="badge badge-info" style={{ marginLeft: 6 }}>Giáo viên chủ lớp</span>
                </td>
                <td>Chủ lớp</td>
                <td>Tất cả các nhóm</td>
                {isOwner && <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>}
              </tr>

              {/* Members rows */}
              {members.map(member => (
                <tr key={member.id}>
                  <td className="col-learner" style={{ fontFamily: 'monospace' }}>{member.memberId}</td>
                  <td>
                    {isOwner ? (
                      <button
                        className={`btn btn-sm ${member.role === 'monitor' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleRoleChange(member.id, member.role as 'member' | 'monitor', member.version)}
                        title="Bấm để thay đổi giữa Member và Lớp trưởng"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        {member.role === 'monitor' ? (
                          <>
                            <Award size={13} />
                            <span>Lớp trưởng (Monitor)</span>
                          </>
                        ) : (
                          <>
                            <User size={13} />
                            <span>Thành viên (Member)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {member.role === 'monitor' ? (
                          <>
                            <Award size={13} style={{ color: 'var(--accent)' }} />
                            <span>Lớp trưởng</span>
                          </>
                        ) : (
                          <>
                            <User size={13} style={{ color: 'var(--ink-muted)' }} />
                            <span>Thành viên</span>
                          </>
                        )}
                      </span>
                    )}
                  </td>
                  <td>Nhóm của lớp</td>
                  {isOwner && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveMember(member.memberId, member.version)}
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
