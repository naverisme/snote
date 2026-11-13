import { useEffect, useState } from 'react';
import { Crown, UserMinus, UserPlus, Users, Search, Clock, ListTodo, Library, ArrowRight, Copy, LogOut, RefreshCw } from 'lucide-react';
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

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(-2).map(part => part[0] ?? '').join('').toLocaleUpperCase('vi') || '?';
}

function progress(done: number, total: number): number {
  return total ? Math.round(done / total * 100) : 0;
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
  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'tasks'>('members');
  const [showInvite, setShowInvite] = useState(false);
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
  const myDoneTasks = myTasks.filter(task => task.status === 'done');
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

  const copyAccountId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setInfo('Đã sao chép mã tài khoản.');
    } catch {
      setError('Không thể sao chép tự động. Hãy chọn và sao chép mã trong danh sách.');
    }
  };

  if (workspace.kind === 'default') {
    return <div className="section-box" style={{ padding: 24 }}>
      <h2>Workspace cá nhân</h2>
      <p>Workspace cá nhân chỉ dành cho bạn. Hãy tạo workspace độc lập để cộng tác.</p>
    </div>;
  }

  return <div className="review-screen group-members-screen">
    <div className="review-hero group-members-hero">
      <div>
        <div className="group-members-meta"><span>{isClassGroup ? 'Nhóm trong lớp' : 'Workspace cộng tác'}</span><span>{canManage ? 'Quản lý thành viên' : 'Thành viên chính thức'}</span></div>
        <h1>{canManage ? `Quản trị thành viên: ${workspace.name}` : workspace.name}</h1>
        <p>
          {loading ? 'Đang tải thành viên...' : `${members.length} thành viên đang hoạt động trong workspace`}
        </p>
      </div>
      <div className="review-group-shortcuts">
        {canManage && <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowInvite(value => !value)} aria-expanded={showInvite}><UserPlus size={14} /> Mời thành viên</button>}
        {me && !canManage && <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => { if (confirm('Rời workspace này?')) void run(() => leaveGroup(workspace.id, undefined, me.version), 'Đã rời workspace.', false); }}><LogOut size={14} /> Rời nhóm</button>}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()} disabled={busy || loading}><RefreshCw size={14} /> Làm mới</button>
      </div>
    </div>

    {error && <div role="alert" style={{ color: 'var(--danger)' }}>{error}</div>}
    {info && <div role="status" style={{ color: 'var(--success)' }}>{info}</div>}

    {canManage ? <div className="review-stats group-members-stats" aria-label="Tổng quan thành viên nhóm">
      <div><span><Users size={14} /> Thành viên chính thức</span><strong>{members.length}</strong><small>Đang tham gia workspace</small></div>
      <div><span><ListTodo size={14} /> Điều phối công việc</span><strong>{tasks ? `${doneTasks.length}/${assignedTasks.length}` : '—'}</strong>{tasks && <div className="group-progress" role="progressbar" aria-label="Tiến độ công việc nhóm" aria-valuenow={progress(doneTasks.length, assignedTasks.length)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress(doneTasks.length, assignedTasks.length)}%` }} /></div>}<small>{tasks ? `${progress(doneTasks.length, assignedTasks.length)}% việc được giao hoàn thành` : 'Chưa tải được công việc'}</small></div>
      <div><span><Clock size={14} /> Yêu cầu chờ xử lý</span><strong>{isClassGroup ? requests.length : '—'}</strong><small>{isClassGroup ? 'Đơn xin vào nhóm' : 'Chỉ áp dụng cho nhóm trong lớp'}</small></div>
    </div> : <>
      <div className="group-members-shortcuts"><span>Lối tắt không gian làm việc</span><button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('tasks')}><ListTodo size={14} /> Tiến độ Gantt</button><button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('library')}><Library size={14} /> Thư viện tệp</button></div>
      <div className="review-leadership group-members-leadership">
        <article className="review-panel"><h2><Crown size={15} /> Trưởng nhóm phụ trách</h2><div className="group-person"><span className="group-avatar" aria-hidden="true">{initials(leader?.displayName || leader?.memberId || '?')}</span><div><strong>{leader?.displayName || leader?.memberId || 'Chưa có trưởng nhóm'}</strong>{leader && <small>Mã tài khoản: {leader.memberId}</small>}</div></div></article>
        <article className="review-panel"><h2><ListTodo size={15} /> Công việc của bạn</h2><div className="group-person"><span className="group-avatar" aria-hidden="true">{initials(currentUser?.displayName || me?.displayName || currentUser?.id || '?')}</span><div><strong>{currentUser?.displayName || me?.displayName || 'Bạn'}</strong><small>{tasks ? `${myDoneTasks.length}/${myTasks.length} việc đã hoàn thành` : 'Chưa tải được công việc'}</small></div></div>{tasks && <div className="group-progress" role="progressbar" aria-label="Tiến độ công việc của bạn" aria-valuenow={progress(myDoneTasks.length, myTasks.length)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress(myDoneTasks.length, myTasks.length)}%` }} /></div>}<button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('tasks')}>Xem việc của tôi <ArrowRight size={12} /></button></article>
      </div>
    </>}

    {canManage && showInvite && <form className="review-panel review-invite-form" onSubmit={event => {
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
        <button type="button" role="tab" aria-selected={activeTab === 'members'} className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}><Users size={14} /> {canManage ? 'Thành viên chính thức' : 'Danh bạ thành viên'} ({members.length})</button>
        {canManage && isClassGroup && <button type="button" role="tab" aria-selected={activeTab === 'requests'} className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}><Clock size={14} /> Đơn xin vào ({requests.length})</button>}
        {!canManage && <button type="button" role="tab" aria-selected={activeTab === 'tasks'} className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}><ListTodo size={14} /> Công việc nhóm ({assignedTasks.length})</button>}
      </div>
    </div>

    {canManage && isClassGroup && activeTab === 'requests' && <div className="review-panel">
      <h2 className="section-title">Yêu cầu vào nhóm ({requests.length})</h2>
      {requests.length === 0 && <p>Không có yêu cầu đang chờ.</p>}
      {requests.map(request => <div key={request.id} className="group-request-row">
        <span><strong>{members.find(member => member.memberId === request.initiatorId)?.displayName || 'Tài khoản xin vào nhóm'}</strong><small>Mã tài khoản: {request.initiatorId}</small></span>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy}
          onClick={() => void run(() => approveGroupJoinRequest(request.id, request.version), 'Đã duyệt yêu cầu.')}>Duyệt</button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
          onClick={() => void run(() => declineGroupJoinRequest(request.id, request.version), 'Đã từ chối yêu cầu.')}>Từ chối</button>
      </div>)}
    </div>}

    {!canManage && activeTab === 'tasks' && <div className="review-panel group-task-list">
      <div className="review-panel-line"><h2>Công việc đã giao trong nhóm</h2><span className="review-directory-count">{tasks ? `${assignedTasks.length} việc` : 'Chưa tải được công việc'}</span></div>
      {tasks && assignedTasks.length === 0 && <p>Chưa có công việc được giao.</p>}
      {assignedTasks.map(task => <div key={task.id} className="group-task-row"><span><strong>{task.title}</strong><small>{members.find(member => member.memberId === task.assigneeId)?.displayName || (task.assigneeId === currentUser?.id ? 'Bạn' : 'Thành viên nhóm')}</small></span><span>{task.status === 'done' ? 'Đã xong' : task.status === 'doing' ? 'Đang làm' : 'Chưa làm'}</span></div>)}
    </div>}

    {activeTab === 'members' && <div className="review-panel review-members-directory">
      <div className="review-panel-line"><div><h2>{canManage ? 'Danh sách thành viên chính thức' : 'Danh sách thành viên nhóm'}</h2><p>{canManage ? 'Theo dõi công việc và quản lý tư cách thành viên' : 'Những người đang cùng làm việc trong workspace'}</p></div><span className="review-directory-count">Hiển thị {visibleMembers.length}/{members.length}</span></div>
      <label className="review-search group-members-search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mã tài khoản" aria-label="Tìm thành viên nhóm" /></label>
      <div className="table-container">
      <table className="data-table group-members-table">
        <thead><tr><th>Thành viên</th><th>Vai trò</th><th>Công việc được giao</th>{canManage && <th>Thao tác quản trị</th>}</tr></thead>
        <tbody>{visibleMembers.map(member => <tr key={member.id}>
          <td><div className="group-person"><span className="group-avatar" aria-hidden="true">{initials(member.displayName || member.memberId)}</span><div><strong>{member.displayName || 'Thành viên chưa đặt tên'}{member.memberId === currentUser?.id ? ' (Bạn)' : ''}</strong><span className="group-account-id">Mã tài khoản: {member.memberId}</span></div><button type="button" className="group-copy-id" onClick={() => void copyAccountId(member.memberId)} aria-label={`Sao chép mã tài khoản của ${member.displayName || member.memberId}`} title="Sao chép mã tài khoản"><Copy size={13} /></button></div></td>
          <td>{member.role === 'leader' ? <span className="group-role"><Crown size={14} /> Trưởng nhóm</span> : 'Thành viên'}</td>
          <td>{tasks ? (() => { const summary = memberProgress(member.memberId); return <div className="group-member-progress"><span>{summary.done}/{summary.total} việc xong</span><div className="group-progress" role="progressbar" aria-label={`Tiến độ công việc của ${member.displayName || member.memberId}`} aria-valuenow={progress(summary.done, summary.total)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress(summary.done, summary.total)}%` }} /></div><small>{progress(summary.done, summary.total)}%</small></div>; })() : 'Chưa tải được'}</td>
          {canManage && <td>
            {member.memberId !== currentUser?.id && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
                onClick={() => void run(() => isClassGroup
                  ? changeGroupLeader(workspace.id, member.memberId, member.version)
                  : transferWorkspaceOwnership(workspace.id, member.memberId),
                isClassGroup ? 'Đã đổi trưởng nhóm.' : 'Đã gửi yêu cầu chuyển chủ; người nhận cần chấp nhận.')}>Chuyển quyền</button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
                onClick={() => { if (confirm('Đưa thành viên này ra khỏi workspace?')) void run(
                  () => removeGroupMember(workspace.id, member.memberId, undefined, member.version), 'Đã đưa thành viên ra khỏi workspace.'); }}>
                <UserMinus size={14} /> Loại
              </button>
            </div>}
          </td>}
        </tr>)}</tbody>
      </table>
      {!loading && members.length === 0 && !error && <p style={{ padding: 16 }}>Chưa có thành viên.</p>}
      {!loading && members.length > 0 && visibleMembers.length === 0 && <p style={{ padding: 16 }}>Không tìm thấy thành viên phù hợp.</p>}
      </div>
    </div>}
  </div>;
}
