import { useEffect, useState } from 'react';
import { Crown, UserMinus, UserPlus, Users, Search, Clock, ListTodo, Library, ArrowRight } from 'lucide-react';
import { taskApi } from '../tasks/api';
import type { Task } from '../tasks/types';
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
  viewRole?: 'leader' | 'member';
  onNavigate?: (tab: 'tasks' | 'library') => void;
}

function errorText(error: unknown): string {
  const response = error as { body?: { error?: { message?: string } }; message?: string };
  return response?.body?.error?.message || response?.message || 'Thao tác không thành công. Vui lòng thử lại.';
}

export function GroupMembersView({ workspace, currentUser, classOwnerId, onMembershipChanged, viewRole, onNavigate }: Props) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [inviteeId, setInviteeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const isClassGroup = workspace.kind === 'class_group';
  const me = members.find(member => member.memberId === currentUser?.id);
  const canManage = Boolean(viewRole ? viewRole === 'leader' : (
    currentUser?.id && (
      workspace.ownerId === currentUser.id || classOwnerId === currentUser.id || me?.role === 'leader'
    )
  ));
  const leader = members.find(member => member.role === 'leader');
  const visibleMembers = members.filter(member => !search || `${member.displayName ?? ''} ${member.memberId}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  const assignedTasks = tasks?.filter(task => task.assigneeId) ?? [];
  const doneTasks = assignedTasks.filter(task => task.status === 'done');
  const myTasks = tasks?.filter(task => task.assigneeId === currentUser?.id) ?? [];
  const memberProgress = (memberId: string) => {
    const assigned = tasks?.filter(task => task.assigneeId === memberId) ?? [];
    return { total: assigned.length, done: assigned.filter(task => task.status === 'done').length };
  };

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
      try { setTasks(await taskApi.listWorkspaceTasks(workspace.id)); }
      catch { setTasks(null); }
    } catch (cause) {
      setMembers([]);
      setRequests([]);
      setTasks(null);
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

  return <div className="review-screen group-members-screen">
    <div className="review-hero">
      <div>
        <span className="review-eyebrow">{canManage ? 'Điều phối workspace nhóm' : 'Thành viên chính thức'}</span>
        <h1>{canManage ? `Quản trị Thành viên: ${workspace.name}` : workspace.name}</h1>
        <p>
          {loading ? 'Đang tải thành viên...' : `${members.length} thành viên đang hoạt động`}
        </p>
      </div>
      <div className="review-group-shortcuts"><button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('tasks')}><ListTodo size={13} /> Tiến độ Gantt <ArrowRight size={12} /></button><button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('library')}><Library size={13} /> Thư viện tệp <ArrowRight size={12} /></button><button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()} disabled={busy}>Làm mới</button></div>
    </div>

    {error && <div role="alert" style={{ color: 'var(--danger)' }}>{error}</div>}
    {info && <div role="status" style={{ color: 'var(--success)' }}>{info}</div>}

    {canManage ? <div className="review-stats" aria-label="Tổng quan thành viên nhóm">
      <div><span><Users size={14} /> Sĩ số nhóm</span><strong>{members.length}</strong></div>
      <div><span><ListTodo size={14} /> Điều phối công việc</span><strong>{tasks ? `${doneTasks.length}/${assignedTasks.length}` : '—'}</strong><small>{tasks ? 'Việc được giao đã hoàn thành' : 'Chưa tải được công việc'}</small></div>
      <div><span><Clock size={14} /> Yêu cầu chờ xử lý</span><strong>{requests.length}</strong></div>
    </div> : <div className="review-leadership">
      <article className="review-panel"><span className="review-eyebrow"><Crown size={13} /> Trưởng nhóm phụ trách</span><h2>{leader?.displayName || leader?.memberId || 'Chưa có'}</h2></article>
      <article className="review-panel"><span className="review-eyebrow"><ListTodo size={13} /> Công việc của bạn</span><h2>{tasks ? `${myTasks.filter(task => task.status === 'done').length}/${myTasks.length} việc hoàn thành` : 'Chưa tải được'}</h2><button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('tasks')}>Xem chi tiết việc của tôi <ArrowRight size={12} /></button></article>
    </div>}

    {canManage && <form className="review-panel review-invite-form" onSubmit={event => {
      event.preventDefault();
      const recipient = inviteeId.trim();
      if (!recipient) return;
      void run(() => isClassGroup
        ? createGroupInvitation(workspace.id, recipient)
        : createWorkspaceInvitation(workspace.id, recipient), 'Đã gửi lời mời.').then(ok => { if (ok) setInviteeId(''); });
    }}>
      <label className="form-label" htmlFor="member-invite-id" style={{ width: '100%' }}>Mã tài khoản người được mời</label>
      <input id="member-invite-id" className="form-input" value={inviteeId} onChange={event => setInviteeId(event.target.value)}
        placeholder="UUID tài khoản" required style={{ maxWidth: 320 }} />
      <button type="submit" className="btn btn-primary" disabled={busy}><UserPlus size={15} /> Gửi lời mời</button>
    </form>}

    <div className="review-toolbar review-member-tabs">
      <div className="review-filters" role="tablist" aria-label="Mục thành viên nhóm">
        <button type="button" role="tab" aria-selected={activeTab === 'members'} className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>Thành viên chính thức ({members.length})</button>
        {canManage && isClassGroup && <button type="button" role="tab" aria-selected={activeTab === 'requests'} className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Đơn xin vào ({requests.length})</button>}
      </div>
    </div>

    {canManage && isClassGroup && activeTab === 'requests' && <div className="review-panel">
      <h2 className="section-title">Yêu cầu vào nhóm ({requests.length})</h2>
      {requests.length === 0 && <p>Không có yêu cầu đang chờ.</p>}
      {requests.map(request => <div key={request.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{request.initiatorId}</span>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy}
          onClick={() => void run(() => approveGroupJoinRequest(request.id, request.version), 'Đã duyệt yêu cầu.')}>Duyệt</button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
          onClick={() => void run(() => declineGroupJoinRequest(request.id, request.version), 'Đã từ chối yêu cầu.')}>Từ chối</button>
      </div>)}
    </div>}

    {activeTab === 'members' && <div className="review-panel review-members-directory">
      <div className="review-panel-line"><h2>Danh sách thành viên</h2><label className="review-search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo mã tài khoản" aria-label="Tìm thành viên nhóm" /></label></div>
      <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Thành viên</th><th>Vai trò</th><th>Công việc được giao</th>{canManage && <th>Thao tác</th>}</tr></thead>
        <tbody>{visibleMembers.map(member => <tr key={member.id}>
          <td style={{ overflowWrap: 'anywhere' }}>{member.displayName || member.memberId}{member.memberId === currentUser?.id ? ' (Bạn)' : ''}{member.displayName && <small style={{ display: 'block', fontFamily: 'monospace' }}>{member.memberId}</small>}</td>
          <td>{member.role === 'leader' ? <><Crown size={14} /> Trưởng nhóm</> : 'Thành viên'}</td>
          <td>{tasks ? (() => { const progress = memberProgress(member.memberId); return <span>{progress.done}/{progress.total} việc xong</span>; })() : 'Chưa có dữ liệu'}</td>
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
    </div>}

    {me && !canManage && <button type="button" className="btn btn-secondary" disabled={busy}
      onClick={() => { if (confirm('Rời workspace này?')) void run(() => leaveGroup(workspace.id, undefined, me.version), 'Đã rời workspace.', false); }}>
      Rời workspace
    </button>}
  </div>;
}
