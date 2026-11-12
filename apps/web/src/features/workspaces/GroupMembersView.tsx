import { useEffect, useState } from 'react';
import { Crown, UserMinus, UserPlus } from 'lucide-react';
import type { Account, JoinRequest, Membership, Workspace } from '../../shared/types';
import {
  approveGroupJoinRequest, changeGroupLeader, createGroupInvitation,
  createWorkspaceInvitation, declineGroupJoinRequest, leaveGroup,
  listGroupJoinRequests, listGroupMembers, listWorkspaceMembers,
  removeGroupMember, transferWorkspaceOwnership,
} from '../../shared/api';

interface Props {
  workspace: Workspace;
  currentUser?: Account | null;
  classOwnerId?: string;
  onMembershipChanged?: () => void;
}

function errorText(error: unknown): string {
  const response = error as { body?: { error?: { message?: string } }; message?: string };
  return response?.body?.error?.message || response?.message || 'Thao tác không thành công. Vui lòng thử lại.';
}

export function GroupMembersView({ workspace, currentUser, classOwnerId, onMembershipChanged }: Props) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [inviteeId, setInviteeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const isClassGroup = workspace.kind === 'class_group';
  const me = members.find(member => member.memberId === currentUser?.id);
  const canManage = Boolean(currentUser?.id && (
    workspace.ownerId === currentUser.id || classOwnerId === currentUser.id || me?.role === 'leader'
  ));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = isClassGroup ? await listGroupMembers(workspace.id) : await listWorkspaceMembers(workspace.id);
      setMembers(response.data);
      const canReadRequests = isClassGroup && Boolean(currentUser?.id && (
        classOwnerId === currentUser.id || response.data.some(member => member.memberId === currentUser.id && member.role === 'leader')
      ));
      setRequests(canReadRequests ? (await listGroupJoinRequests(workspace.id)).data : []);
    } catch (cause) {
      setMembers([]);
      setRequests([]);
      setError(errorText(cause));
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.id, currentUser?.id, classOwnerId]);

  const run = async (action: () => Promise<unknown>, success: string, refresh = true): Promise<boolean> => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
      setInfo(success);
      if (refresh) await load();
      onMembershipChanged?.();
      return true;
    } catch (cause) { setError(errorText(cause)); return false; }
    finally { setBusy(false); }
  };

  if (workspace.kind === 'default') {
    return <div className="section-box" style={{ padding: 24 }}>
      <h2>Workspace cá nhân</h2>
      <p>Workspace cá nhân chỉ dành cho bạn. Hãy tạo workspace độc lập để cộng tác.</p>
    </div>;
  }

  return <div className="section-box" style={{ display: 'grid', gap: 20 }}>
    <div className="view-header">
      <div>
        <h1 className="view-title">Thành viên: {workspace.name}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0' }}>
          {loading ? 'Đang tải thành viên...' : `${members.length} thành viên đang hoạt động`}
        </p>
      </div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()} disabled={busy}>Làm mới</button>
    </div>

    {error && <div role="alert" style={{ color: 'var(--danger)' }}>{error}</div>}
    {info && <div role="status" style={{ color: 'var(--success)' }}>{info}</div>}

    {canManage && <form onSubmit={event => {
      event.preventDefault();
      const recipient = inviteeId.trim();
      if (!recipient) return;
      void run(() => isClassGroup
        ? createGroupInvitation(workspace.id, recipient)
        : createWorkspaceInvitation(workspace.id, recipient), 'Đã gửi lời mời.').then(ok => { if (ok) setInviteeId(''); });
    }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <label className="form-label" htmlFor="member-invite-id" style={{ width: '100%' }}>Mã tài khoản người được mời</label>
      <input id="member-invite-id" className="form-input" value={inviteeId} onChange={event => setInviteeId(event.target.value)}
        placeholder="UUID tài khoản" required style={{ maxWidth: 320 }} />
      <button type="submit" className="btn btn-primary" disabled={busy}><UserPlus size={15} /> Gửi lời mời</button>
    </form>}

    {canManage && isClassGroup && requests.length > 0 && <div>
      <h2 className="section-title">Yêu cầu vào nhóm ({requests.length})</h2>
      {requests.map(request => <div key={request.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{request.initiatorId}</span>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy}
          onClick={() => void run(() => approveGroupJoinRequest(request.id, request.version), 'Đã duyệt yêu cầu.')}>Duyệt</button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
          onClick={() => void run(() => declineGroupJoinRequest(request.id, request.version), 'Đã từ chối yêu cầu.')}>Từ chối</button>
      </div>)}
    </div>}

    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Thành viên</th><th>Vai trò</th>{canManage && <th>Thao tác</th>}</tr></thead>
        <tbody>{members.map(member => <tr key={member.id}>
          <td style={{ overflowWrap: 'anywhere' }}>{member.memberId}{member.memberId === currentUser?.id ? ' (Bạn)' : ''}</td>
          <td>{member.role === 'leader' ? <><Crown size={14} /> Trưởng nhóm</> : 'Thành viên'}</td>
          {canManage && <td>
            {member.memberId !== currentUser?.id && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
                onClick={() => void run(() => isClassGroup
                  ? changeGroupLeader(workspace.id, member.memberId, member.version)
                  : transferWorkspaceOwnership(workspace.id, member.memberId),
                isClassGroup ? 'Đã đổi trưởng nhóm.' : 'Đã gửi yêu cầu chuyển chủ; người nhận cần chấp nhận.')}>Chuyển quyền</button>
              <button type="button" className="btn btn-danger btn-sm" disabled={busy}
                onClick={() => { if (confirm('Đưa thành viên này ra khỏi workspace?')) void run(
                  () => removeGroupMember(workspace.id, member.memberId, undefined, member.version), 'Đã đưa thành viên ra khỏi workspace.'); }}>
                <UserMinus size={14} /> Đưa ra
              </button>
            </div>}
          </td>}
        </tr>)}</tbody>
      </table>
      {!loading && members.length === 0 && !error && <p style={{ padding: 16 }}>Chưa có thành viên.</p>}
    </div>

    {me && !canManage && <button type="button" className="btn btn-secondary" disabled={busy}
      onClick={() => { if (confirm('Rời workspace này?')) void run(() => leaveGroup(workspace.id, undefined, me.version), 'Đã rời workspace.', false); }}>
      Rời workspace
    </button>}
  </div>;
}
