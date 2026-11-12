import React, { useEffect, useMemo, useState } from 'react';
import { X, ArrowRight, FolderKanban, Search, Users, Plus, Archive, Inbox, LogOut, ShieldCheck } from 'lucide-react';
import type { Class, Workspace, Account, Invitation, Membership } from '../../shared/types';
import {
  listClassGroups,
  createClassGroup,
  createGroupJoinRequest,
  listGroupMembers,
  getMyInvitations,
  acceptGroupInvitation,
  declineGroupInvitation,
  leaveGroup,
} from '../../shared/api';

interface ClassGroupsViewProps {
  cls: Class;
  currentUser: Account | null;
  onOpenGroupWorkspace: (ws: Workspace) => void;
  accessibleGroupIds: string[];
  onMembershipChanged?: () => void;
  viewRole?: 'teacher' | 'student';
}

export function ClassGroupsView({ cls, currentUser, onOpenGroupWorkspace, accessibleGroupIds, onMembershipChanged, viewRole }: ClassGroupsViewProps) {
  const [groups, setGroups] = useState<Workspace[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'active' | 'archived'>('all');
  const [studentFilter, setStudentFilter] = useState<'all' | 'joinable' | 'joined'>('all');
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [membersByGroup, setMembersByGroup] = useState<Record<string, Membership[]>>({});
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const isOwner = viewRole ? viewRole === 'teacher' : currentUser?.id === cls.ownerId;

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listClassGroups(cls.id);
      const nextGroups = res.data ?? [];
      setGroups(nextGroups);
      if (!isOwner) {
        try {
          const myInvitations = await getMyInvitations();
          const ids = new Set(nextGroups.map(group => group.id));
          setInvitations(myInvitations.data.filter(invitation => invitation.targetType === 'workspace' && ids.has(invitation.targetId) && invitation.status === 'pending'));
        } catch {
          setInvitations([]);
        }
      } else setInvitations([]);
      const counts = await Promise.allSettled(nextGroups.map(async group => {
        if (!isOwner && !accessibleGroupIds.includes(group.id)) return null;
        const response = await listGroupMembers(group.id);
        return { id: group.id, members: response.data.filter(member => member.status === 'active') };
      }));
      setMemberCounts(Object.fromEntries(counts.flatMap(result =>
        result.status === 'fulfilled' && result.value ? [[result.value.id, result.value.members.length]] : [],
      )));
      setMembersByGroup(Object.fromEntries(counts.flatMap(result =>
        result.status === 'fulfilled' && result.value ? [[result.value.id, result.value.members]] : [],
      )));
    } catch (cause: any) {
      setGroups([]);
      setError(cause?.body?.error?.message || cause?.message || 'Không thể tải danh sách nhóm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, [cls.id]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await createClassGroup(cls.id, { name: newGroupName.trim() });
      setInfo(`Đã tạo nhóm "${newGroupName}" thành công!`);
      setNewGroupName('');
      setShowCreateModal(false);
      await loadGroups();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi tạo nhóm');
    }
  };

  const handleJoinRequest = async (groupId: string) => {
    try {
      await createGroupJoinRequest(groupId);
      setInfo('Đã gửi yêu cầu tham gia nhóm!');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi gửi yêu cầu');
    }
  };

  const handleInvitation = async (invitation: Invitation, accept: boolean) => {
    try {
      if (accept) await acceptGroupInvitation(invitation.id, invitation.version);
      else await declineGroupInvitation(invitation.id, invitation.version);
      setInfo(accept ? 'Đã chấp nhận lời mời vào nhóm.' : 'Đã từ chối lời mời.');
      await loadGroups();
      if (accept) onMembershipChanged?.();
    } catch (cause: any) {
      setError(cause?.body?.error?.message || cause?.message || 'Không thể xử lý lời mời.');
    }
  };

  const handleLeaveGroup = async (group: Workspace) => {
    const membership = membersByGroup[group.id]?.find(member => member.memberId === currentUser?.id);
    if (!membership) { setError('Chưa tải được tư cách nhóm của bạn. Vui lòng làm mới.'); return; }
    if (!window.confirm(`Rời nhóm “${group.name}”? Vai trò hoặc công việc đang phụ trách có thể cần bàn giao trước.`)) return;
    try {
      await leaveGroup(group.id, undefined, membership.version);
      setInfo('Đã rời nhóm.');
      onMembershipChanged?.();
      await loadGroups();
    } catch (cause: any) {
      setError(cause?.body?.error?.message || cause?.message || 'Không thể rời nhóm. Kiểm tra việc bàn giao rồi thử lại.');
    }
  };

  const visibleGroups = useMemo(() => groups.filter(group => {
    if (search && !group.name.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) return false;
    if (filter === 'mine') return accessibleGroupIds.includes(group.id);
    if (filter === 'active') return group.status === 'active';
    if (filter === 'archived') return group.status !== 'active';
    return true;
  }), [groups, search, filter, accessibleGroupIds]);
  const activeCount = groups.filter(group => group.status === 'active').length;
  const ownGroup = groups.find(group => accessibleGroupIds.includes(group.id) && group.status === 'active');
  const ownMembers = ownGroup ? membersByGroup[ownGroup.id] : undefined;
  const otherGroups = groups.filter(group => group.id !== ownGroup?.id && group.status === 'active');
  const visibleOtherGroups = otherGroups.filter(group =>
    (!search || group.name.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) &&
    (studentFilter === 'all' || (studentFilter === 'joined' ? accessibleGroupIds.includes(group.id) : !accessibleGroupIds.includes(group.id))),
  );

  return (
    <div className={`review-screen class-groups-screen ${isOwner ? '' : 'student-groups-screen'}`}>
      {isOwner ? <div className="review-hero">
        <div><span className="review-eyebrow">{cls.name} · Giáo viên chủ lớp</span><h1>Quản trị Nhóm trong Lớp học</h1><p>Theo dõi các workspace nhóm trực thuộc lớp.</p></div>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={15} /> Tạo nhóm mới</button>
      </div> : <header className="review-panel student-groups-header">
        <div className="student-groups-top">
          <div><div className="student-groups-title"><h1>Nhóm học tập trong lớp</h1><span className="review-badge">Học sinh</span>{invitations.length > 0 && <span className="review-badge"><Inbox size={12} /> {invitations.length} lời mời mới</span>}</div>
            <p>Tra cứu danh bạ nhóm, theo dõi lời mời và quản lý yêu cầu gia nhập nhóm học tập.</p></div>
          <div className="student-groups-actions"><span className="student-groups-state">{ownGroup ? 'Đã có nhóm' : 'Chưa có nhóm'}</span><button type="button" className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={15} /> Tạo nhóm nếu có quyền</button></div>
        </div>
        <div className="student-groups-toolbar">
          <label className="review-search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm kiếm theo tên nhóm..." aria-label="Tìm nhóm" /></label>
          <div className="review-filters student-groups-filters" role="group" aria-label="Lọc nhóm">
            {(['all', 'joinable', 'joined'] as const).map(option => <button key={option} type="button" className={studentFilter === option ? 'active' : ''} onClick={() => setStudentFilter(option)}>{{ all: 'Tất cả', joinable: 'Có thể xin vào', joined: 'Đã tham gia' }[option]} <span>{option === 'all' ? groups.filter(group => group.status === 'active').length : option === 'joinable' ? otherGroups.filter(group => !accessibleGroupIds.includes(group.id)).length : groups.filter(group => group.status === 'active' && accessibleGroupIds.includes(group.id)).length}</span></button>)}
          </div>
        </div>
      </header>}

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
      {info && <div style={{ color: 'var(--success)', marginBottom: 12, fontSize: '0.875rem' }}>{info}</div>}

      {isOwner ? (
        <div className="review-stats" aria-label="Tổng quan nhóm">
          <div><span>Nhóm đang hoạt động</span><strong>{activeCount}</strong></div>
          <div><span>Kho lưu trữ</span><strong>{groups.length - activeCount}</strong></div>
          <div><span>Nhóm bạn có thể mở</span><strong>{groups.filter(group => accessibleGroupIds.includes(group.id) || isOwner).length}</strong></div>
        </div>
      ) : <>
        {ownGroup && <section className="review-panel student-own-group">
          <div className="student-own-group-heading"><div><span className="student-own-badge">NHÓM CỦA BẠN</span><span>Đang tham gia chính thức</span></div><div className="student-own-actions"><button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleLeaveGroup(ownGroup)} disabled={!ownMembers?.some(member => member.memberId === currentUser?.id)}><LogOut size={13} /> Rời nhóm</button><button type="button" className="btn btn-primary btn-sm" onClick={() => onOpenGroupWorkspace(ownGroup)}>Vào Workspace nhóm <ArrowRight size={14} /></button></div></div>
          <div className="student-own-main"><div><h2>{ownGroup.name}</h2><p>Workspace nhóm thuộc {cls.name}</p></div><div className="student-own-count"><span>Sĩ số nhóm <strong>{memberCounts[ownGroup.id] !== undefined ? `${memberCounts[ownGroup.id]} thành viên` : 'Chưa có dữ liệu'}</strong></span><small>{memberCounts[ownGroup.id] !== undefined ? 'Thành viên đang hoạt động' : 'Không thể đọc danh sách thành viên lúc này'}</small></div></div>
          <div className="student-own-members"><div className="student-section-caption">DANH SÁCH THÀNH VIÊN {ownMembers ? `(${ownMembers.length} NGƯỜI)` : ''}</div>{ownMembers ? <div className="student-member-grid">{ownMembers.map(member => <div key={member.id} className="student-member-tile"><span className="student-member-avatar" aria-hidden="true">{member.memberId.slice(0, 2).toUpperCase()}</span><div><strong>{member.memberId}</strong><small>{member.role === 'leader' ? <><ShieldCheck size={11} /> Trưởng nhóm</> : member.memberId === currentUser?.id ? 'Bạn · Thành viên' : 'Thành viên'}</small></div></div>)}</div> : <p>Danh sách thành viên chưa tải được.</p>}</div>
        </section>}

        {invitations.length > 0 && <section className="review-panel student-invitations"><div className="student-invitations-head"><h2><Inbox size={16} /> Lời mời & Yêu cầu gia nhập của bạn</h2><span className="review-badge">{invitations.length} lời mời cần phản hồi</span></div><div className="student-section-caption">LỜI MỜI THAM GIA NHÓM</div>
          {invitations.map(invitation => <div key={invitation.id} className="student-invitation-row"><div><strong>{groups.find(group => group.id === invitation.targetId)?.name ?? 'Nhóm trong lớp'}</strong><small>Người mời: {invitation.initiatorId}{invitation.expiresAt ? ` · Hết hạn ${new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}` : ''}</small></div><div><button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleInvitation(invitation, false)}>Từ chối</button><button type="button" className="btn btn-primary btn-sm" onClick={() => void handleInvitation(invitation, true)}>Chấp nhận vào nhóm</button></div></div>)}
        </section>}

        <section className="student-other-groups"><div className="student-other-heading"><h2>Tất cả các nhóm khác trong lớp ({otherGroups.length} nhóm)</h2><span>Danh sách nhóm đang hoạt động</span></div>{loading ? <div className="review-panel review-empty">Đang tải nhóm...</div> : visibleOtherGroups.length ? <div className="review-group-grid">{visibleOtherGroups.map(group => <article className="review-panel review-group-card student-group-card" key={group.id}><div className="review-panel-line"><h2><FolderKanban size={17} /> {group.name}</h2><span className="review-badge">{accessibleGroupIds.includes(group.id) ? 'Đã tham gia' : 'Nhóm khác'}</span></div><p>Workspace nhóm thuộc {cls.name}</p><div className="student-group-card-count"><Users size={14} /> {memberCounts[group.id] !== undefined ? `${memberCounts[group.id]} thành viên` : 'Sĩ số chưa có dữ liệu'}</div><div className="review-panel-line review-group-card-footer"><span>{invitations.some(invitation => invitation.targetId === group.id) ? 'Bạn có lời mời vào nhóm này' : 'Tham gia theo quyền lớp'}</span>{accessibleGroupIds.includes(group.id) ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOpenGroupWorkspace(group)}>Vào Workspace <ArrowRight size={13} /></button> : <button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleJoinRequest(group.id)}>Xin vào nhóm</button>}</div></article>)}</div> : <div className="review-panel review-empty">{studentFilter === 'joined' && ownGroup ? 'Nhóm bạn đang tham gia được hiển thị ở trên.' : otherGroups.length ? 'Không có nhóm khớp tìm kiếm hoặc bộ lọc.' : 'Chưa có nhóm khác trong lớp.'}</div>}</section>
      </>}

      {isOwner && <>
      <div className="review-toolbar">
        <div className="review-filters" role="group" aria-label="Lọc nhóm">
          {(['all', 'mine', 'active', 'archived'] as const).map(option => (
            <button key={option} type="button" className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>
              {{ all: 'Tất cả', mine: 'Nhóm của tôi', active: 'Đang hoạt động', archived: 'Lưu trữ' }[option]}
            </button>
          ))}
        </div>
        <label className="review-search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tên nhóm" aria-label="Tìm nhóm" /></label>
      </div>

      {loading ? <div className="review-panel review-empty">Đang tải nhóm...</div> : visibleGroups.length === 0 && !error ? (
        <div className="review-panel review-empty">{groups.length ? 'Không có nhóm khớp bộ lọc.' : 'Chưa có nhóm nào được tạo trong lớp này.'}</div>
      ) : (
        <div className="review-group-grid">
          {visibleGroups.map(group => {
            const canOpen = isOwner || accessibleGroupIds.includes(group.id);
            return <article className="review-panel review-group-card" key={group.id}>
              <div className="review-panel-line">
                <h2><FolderKanban size={18} /> {group.name}</h2>
                <span className="review-badge">{group.status === 'active' ? 'Đang hoạt động' : 'Lưu trữ'}</span>
              </div>
              <p>{canOpen ? 'Workspace nhóm trực thuộc lớp' : 'Gửi yêu cầu để tham gia nhóm này'}</p>
              <div className="review-group-card-meta"><Users size={14} /> {memberCounts[group.id] !== undefined ? `${memberCounts[group.id]} thành viên` : 'Sĩ số chưa có dữ liệu'}</div>
              <div className="review-panel-line review-group-card-footer">
                <span>{group.status === 'active' ? 'Có thể truy cập theo quyền' : <><Archive size={13} /> Đã lưu trữ</>}</span>
                {canOpen ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOpenGroupWorkspace(group)}>Vào Workspace <ArrowRight size={13} /></button> : group.status === 'active' ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleJoinRequest(group.id)}>Xin vào nhóm</button> : null}
              </div>
            </article>;
          })}
        </div>
      )}
      </>}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tạo nhóm mới trong lớp</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)} aria-label="Đóng"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateGroup}>
              {!isOwner && <p>Giáo viên cần cấp quyền lập nhóm cho bạn trước khi tạo.</p>}
              <div className="form-group">
                <label className="form-label">Tên nhóm</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Ví dụ: Nhóm 1, Nhóm Robot..."
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
