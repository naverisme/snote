import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  Key,
  UserMinus,
  Search,
  Check,
  RefreshCw,
  Mail,
  X,
  AlertTriangle,
  Copy,
  Send,
  ArrowRightLeft,
  Filter,
  Layers,
  Clock,
  LayoutGrid,
  List,
  CheckCheck,
  Eye,
  EyeOff,
  ArrowUpDown,
  UserCheck,
  User,
} from 'lucide-react';
import type { Class, Membership, Invitation, JoinRequest, Account } from '../../shared/types';
import {
  listClassMembers,
  changeMemberRole,
  setClassJoinCode,
  getClassJoinCode,
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
  listClassGroups,
  listGroupMembers,
} from '../../shared/api';

interface ClassMembersViewProps {
  cls: Class;
  currentUser: Account | null;
  onClassUpdated?: (updated: Class) => void;
  viewRole?: 'teacher' | 'student';
}

export function ClassMembersView({ cls, currentUser, onClassUpdated, viewRole }: ClassMembersViewProps) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [myInvitations, setMyInvitations] = useState<Invitation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [joinCodeEnabled, setJoinCodeEnabled] = useState<boolean | null>(null);
  const [showCodePlaintext, setShowCodePlaintext] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [groupNameByMemberId, setGroupNameByMemberId] = useState<Record<string, string>>({});

  // View & Filter States
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'monitor' | 'member'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'activity'>('recent');
  const [activeQueueTab, setActiveQueueTab] = useState<'requests' | 'invitations'>('requests');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'monitor'>('member');
  const [targetMemberForMonitor, setTargetMemberForMonitor] = useState<Membership | null>(null);
  const [targetMemberForKick, setTargetMemberForKick] = useState<Membership | null>(null);

  const isOwner = viewRole ? viewRole === 'teacher' : currentUser?.id === cls.ownerId;
  const currentMonitor = useMemo(() => members.find(m => m.role === 'monitor'), [members]);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3200);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const membersRes = await listClassMembers(cls.id);
      setMembers(membersRes.data ?? []);

      const myInvsRes = await getMyInvitations().catch(() => null);
      setMyInvitations(myInvsRes?.data.filter(i => i.targetType === 'class' && i.targetId === cls.id && i.status === 'pending') ?? []);

      const groupsResult = await listClassGroups(cls.id).catch(() => null);
      if (groupsResult) {
        const groupMembers = await Promise.allSettled(groupsResult.data.map(async group => ({
          name: group.name,
          members: (await listGroupMembers(group.id)).data,
        })));
        setGroupNameByMemberId(Object.fromEntries(groupMembers.flatMap(result =>
          result.status === 'fulfilled' ? result.value.members.map(member => [member.memberId, result.value.name] as const) : [],
        )));
      } else {
        setGroupNameByMemberId({});
      }

      if (isOwner) {
        const reqsRes = await listClassJoinRequests(cls.id).catch(() => null);
        setPendingRequests(reqsRes?.data ?? []);
        const codeRes = await getClassJoinCode(cls.id).catch(() => null);
        setJoinCodeEnabled(codeRes?.data.enabled ?? null);
        setJoinCode(codeRes?.data.code ?? null);
      }
    } catch (cause: any) {
      setMembers([]);
      setMyInvitations([]);
      setPendingRequests([]);
      setGroupNameByMemberId({});
      setJoinCodeEnabled(null);
      setJoinCode(null);
      setError(cause?.body?.error?.message || cause?.message || 'Không thể tải thành viên lớp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [cls.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTargetMemberForMonitor(null);
        setTargetMemberForKick(null);
        setShowInviteModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => members.filter(m => {
    const matchesSearch =
      !search ||
      m.memberId.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' ? true : m.role === roleFilter;

    const hasGroup = Boolean(groupNameByMemberId[m.memberId] && groupNameByMemberId[m.memberId] !== 'Chưa có nhóm');
    const matchesGroup = groupFilter === 'all'
      ? true
      : groupFilter === 'assigned'
        ? hasGroup
        : !hasGroup;

    return matchesSearch && matchesRole && matchesGroup;
  }), [members, search, roleFilter, groupFilter, groupNameByMemberId]);

  const sortedStudents = useMemo(() => [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') return a.memberId.localeCompare(b.memberId, 'vi');
    return 0;
  }), [filteredStudents, sortBy]);

  // Metrics
  const unassignedCount = members.filter(m => !groupNameByMemberId[m.memberId] || groupNameByMemberId[m.memberId] === 'Chưa có nhóm').length;
  const assignedCount = members.filter(m => groupNameByMemberId[m.memberId] && groupNameByMemberId[m.memberId] !== 'Chưa có nhóm').length;

  // Actions
  const handleCopyCode = () => {
    const code = joinCode;
    if (!code) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(true);
    showNotice(`Đã sao chép mã tham gia lớp: ${code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSetJoinCode = async (enabled: boolean) => {
    if (!isOwner) return;
    try {
      const res = await setClassJoinCode(cls.id, enabled, cls.version);
      setJoinCodeEnabled(res.data.enabled);
      setJoinCode(res.data.code ?? null);
      if (onClassUpdated) {
        onClassUpdated({ ...cls, version: res.data.version });
      }
      showNotice(enabled ? `Mã lớp mới: ${res.data.code}` : 'Đã khóa mã tham gia lớp');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi cập nhật mã lớp');
    }
  };

  const handleApproveRequest = async (reqId: string, version: number) => {
    try {
      await approveClassJoinRequest(reqId, version);
      showNotice('Đã duyệt học sinh vào lớp học.');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi duyệt yêu cầu');
    }
  };

  const handleDeclineRequest = async (reqId: string, version: number) => {
    try {
      await declineClassJoinRequest(reqId, version);
      showNotice('Đã từ chối yêu cầu gia nhập.');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi từ chối yêu cầu');
    }
  };

  const handleApproveAllRequests = async () => {
    if (pendingRequests.length === 0) return;
    try {
      const results = await Promise.allSettled(pendingRequests.map(r => approveClassJoinRequest(r.id, r.version)));
      const completed = results.filter(result => result.status === 'fulfilled').length;
      showNotice(`Đã duyệt ${completed}/${results.length} yêu cầu.`);
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi duyệt đồng loạt');
    }
  };

  const handleDeclineAllRequests = async () => {
    if (pendingRequests.length === 0) return;
    try {
      const results = await Promise.allSettled(pendingRequests.map(r => declineClassJoinRequest(r.id, r.version)));
      const completed = results.filter(result => result.status === 'fulfilled').length;
      showNotice(`Đã từ chối ${completed}/${results.length} yêu cầu.`);
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi từ chối đồng loạt');
    }
  };

  const handleConfirmAppointMonitor = async () => {
    if (!targetMemberForMonitor) return;
    const nextRole = targetMemberForMonitor.role === 'monitor' ? 'member' : 'monitor';
    try {
      await changeMemberRole(cls.id, targetMemberForMonitor.id, nextRole, targetMemberForMonitor.version);
      showNotice(nextRole === 'monitor' ? `Đã bổ nhiệm ${targetMemberForMonitor.memberId} làm Lớp trưởng.` : `Đã chuyển ${targetMemberForMonitor.memberId} về vai trò Học sinh.`);
      setTargetMemberForMonitor(null);
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Không thể đổi vai trò');
    }
  };

  const handleConfirmKick = async () => {
    if (!targetMemberForKick) return;
    try {
      await removeClassMember(cls.id, targetMemberForKick.memberId, targetMemberForKick.version);
      showNotice(`Đã xóa ${targetMemberForKick.memberId} khỏi lớp học.`);
      setTargetMemberForKick(null);
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi xóa học sinh');
    }
  };

  const parsedInviteeIds = useMemo(() => Array.from(new Set(
    inviteInput
      .split(/[\n,;]+/)
      .map(value => value.trim())
      .filter(Boolean)
  )), [inviteInput]);

  const handleSendBulkInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedInviteeIds.length === 0) return;
    try {
      const results = await Promise.allSettled(parsedInviteeIds.map(inviteeId => createClassInvitation(cls.id, inviteeId)));
      const completed = results.filter(result => result.status === 'fulfilled').length;
      showNotice(`Đã gửi ${completed}/${results.length} lời mời.`);
      if (completed === results.length) { setInviteInput(''); setShowInviteModal(false); }
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi gửi lời mời');
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    try {
      await createClassJoinRequest(cls.id, inputCode.trim());
      showNotice('Yêu cầu gia nhập bằng mã đã được gửi tới giáo viên!');
      setInputCode('');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Mã lớp không hợp lệ');
    }
  };

  const handleLeaveClass = async () => {
    if (!confirm('Bạn có chắc muốn rời lớp học này?')) return;
    try {
      await leaveClass(cls.id);
      showNotice('Bạn đã rời lớp');
      await loadData();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi rời lớp');
    }
  };

  // =========================================================================
  // GÓC NHÌN GIÁO VIÊN (TAB 01: Class Members Admin)
  // =========================================================================
  if (isOwner) {
    const teacherName = currentUser?.id || cls.ownerId;
    const teacherInitials = teacherName.slice(0, 2).toUpperCase();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Toast Feedback */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'sticky',
              top: '12px',
              zIndex: 100,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
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
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div role="alert" style={{ padding: '10px 14px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* 1. CLASS LEADERSHIP HERO CARD */}
        <header
          aria-label="Thông tin Lãnh đạo và Điều phối Lớp học"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'border-color var(--transition-fast, 160ms ease)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            {/* Teacher Profile Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '0.05em',
                }}
                title="Chủ sở hữu lớp học"
              >
                {teacherInitials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {teacherName}
                  </h1>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: 'var(--surface-hover)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>Giáo viên chủ nhiệm</span>
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Mã tài khoản: {teacherName} • Chủ lớp
                </div>
              </div>
            </div>

            {/* Quick Actions Bar: Direct Invite Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: '1px solid var(--text-primary)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'opacity var(--transition-fast, 160ms ease)',
                }}
              >
                <Mail size={15} />
                <span>Mời học sinh</span>
              </button>
            </div>
          </div>

          {/* Join Code High-Contrast Box */}
          <div
            style={{
              background: 'var(--surface-hover)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: '6px',
              padding: '12px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={16} style={{ color: 'var(--text-primary)' }} />
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 500 }}>Mã tham gia lớp:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  disabled={!joinCode}
                  title={joinCode ? 'Sao chép mã tham gia' : 'Chưa có mã đang mở'}
                  style={{
                    background: 'var(--surface-card)',
                    border: '1.5px solid var(--border-strong)',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'monospace',
                  }}
                >
                  <span>{joinCode ? (showCodePlaintext ? joinCode : '••••••••') : 'Chưa có mã đang mở'}</span>
                  {copiedCode ? <CheckCheck size={14} /> : <Copy size={14} style={{ color: 'var(--text-primary)' }} />}
                </button>

                {joinCode && (
                  <button
                    type="button"
                    onClick={() => setShowCodePlaintext(!showCodePlaintext)}
                    title={showCodePlaintext ? 'Ẩn mã lớp khi trình chiếu' : 'Hiện mã lớp'}
                    aria-label="Ẩn hiện mã lớp"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-primary)' }}
                  >
                    {showCodePlaintext ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => void handleSetJoinCode(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'var(--surface-card)',
                  border: '1.5px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                <span>Đổi mã mới</span>
              </button>

              <button
                type="button"
                onClick={() => void handleSetJoinCode(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border-strong)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: joinCodeEnabled === true ? 'var(--text-primary)' : 'transparent',
                    border: joinCodeEnabled === true ? 'none' : '1.5px solid var(--border-strong)',
                    display: 'inline-block',
                  }}
                />
                <span>{joinCodeEnabled === null ? 'Khóa mã lớp' : joinCodeEnabled ? 'Khóa mã đang mở' : 'Mã đã khóa'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* 2. BENTO METRICS BAR (4 CARDS) */}
        <section aria-label="Thống kê Tình trạng Lớp học">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Bento Card 1: Tổng sĩ số */}
            <article
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <dl style={{ margin: 0 }}>
                <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                  <span>Tổng sĩ số học sinh</span>
                  <Users size={16} />
                </dt>
                <dd style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {members.length} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>thành viên</span>
                </dd>
                <dd style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Thành viên học sinh chính thức
                </dd>
              </dl>
            </article>

            {/* Bento Card 2: Lớp trưởng */}
            <article
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <dl style={{ margin: 0 }}>
                <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                  <span>Lớp trưởng</span>
                  <Award size={16} />
                </dt>
                <dd style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentMonitor ? currentMonitor.memberId : 'Chưa bổ nhiệm'}
                </dd>
                <dd style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {currentMonitor ? 'Được ủy quyền hỗ trợ việc chung' : 'Tối đa 1 lớp trưởng chính'}
                </dd>
              </dl>
            </article>

            {/* Bento Card 3: Phân bổ Nhóm */}
            <article
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <dl style={{ margin: 0 }}>
                <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                  <span>Phân bổ Nhóm trong lớp</span>
                  <Layers size={16} />
                </dt>
                <dd style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {assignedCount} đã có nhóm • {unassignedCount} chưa nhóm
                </dd>
                <dd style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Quy chuẩn: 1 nhóm/học sinh
                </dd>
              </dl>
            </article>

            {/* Bento Card 4: Hàng đợi Chờ xử lý */}
            <article
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <dl style={{ margin: 0 }}>
                <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                  <span>Hàng đợi chờ xử lý</span>
                  <Clock size={16} />
                </dt>
                <dd style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {pendingRequests.length} yêu cầu mã • {myInvitations.length} lời mời gửi
                </dd>
                <dd style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Chờ duyệt hoặc người học xác nhận
                </dd>
              </dl>
            </article>
          </div>
        </section>

        {/* Zone 3: Pending Join Requests */}
        {/* Zone 2: My Invitations */}
        {/* 3. QUEUE SECTION */}
        {(pendingRequests.length > 0 || myInvitations.length > 0) && (
          <section
            aria-label="Hàng đợi Yêu cầu và Lời mời Tham gia"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-divider)', paddingBottom: '10px', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab('requests')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeQueueTab === 'requests' ? '2px solid var(--text-primary)' : '2px solid transparent',
                    padding: '4px 6px 8px 6px',
                    fontSize: '13px',
                    fontWeight: activeQueueTab === 'requests' ? 600 : 400,
                    color: activeQueueTab === 'requests' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Yêu cầu gia nhập bằng mã</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '10px', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                    {pendingRequests.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveQueueTab('invitations')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeQueueTab === 'invitations' ? '2px solid var(--text-primary)' : '2px solid transparent',
                    padding: '4px 6px 8px 6px',
                    fontSize: '13px',
                    fontWeight: activeQueueTab === 'invitations' ? 600 : 400,
                    color: activeQueueTab === 'invitations' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Lời mời đang chờ phản hồi</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '10px', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                    {myInvitations.length}
                  </span>
                </button>
              </div>

              {activeQueueTab === 'requests' && pendingRequests.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleApproveAllRequests}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--surface-card)',
                      color: 'var(--text-primary)',
                      border: '1.5px solid var(--border-strong)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                      cursor: 'pointer',
                    }}
                  >
                    <UserCheck size={13} />
                    <span>Duyệt tất cả ({pendingRequests.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineAllRequests}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--surface-card)',
                      color: 'var(--text-primary)',
                      border: '1.5px solid var(--border-strong)',
                      cursor: 'pointer',
                    }}
                  >
                    Từ chối tất cả
                  </button>
                </div>
              )}
            </div>

            {activeQueueTab === 'requests' ? (
              pendingRequests.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Không có yêu cầu xin gia nhập nào đang chờ duyệt.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingRequests.map(req => (
                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{req.initiatorId}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mã yêu cầu: {req.id.slice(0, 8)} • Đang chờ xử lý</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req.id, req.version)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            border: '1.5px solid var(--border-strong)',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer',
                          }}
                        >
                          Duyệt vào lớp
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req.id, req.version)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            border: '1.5px solid var(--border-strong)',
                            cursor: 'pointer',
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              myInvitations.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Không có lời mời nào đang chờ phản hồi.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myInvitations.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Mã mời: {inv.id.slice(0, 8)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Hết hạn: {inv.expiresAt || 'Chưa đặt'} • Trạng thái: Đang chờ phản hồi
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => showNotice(`Lời mời ${inv.id.slice(0, 8)} đang có hiệu lực`)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            border: '1.5px solid var(--border-strong)',
                            cursor: 'pointer',
                          }}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        )}

        {/* Zone 1: Main Class Members Table (CUXC-07, CUXC-11) */}
        {/* 4. STUDENT MEMBERS ROSTER */}
        <section
          aria-label="Danh sách Học sinh và Quản trị Thành viên"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}
        >
          {/* Header & Filter Controls Bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Học sinh trong lớp ({sortedStudents.length}/{members.length})
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Quản lý vai trò và phân bổ nhóm của từng học sinh
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)' }} />
                  <input
                    type="text"
                    placeholder="Tìm theo mã tài khoản..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '6px',
                      background: 'var(--surface-card)',
                      border: '1.5px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Xóa từ khóa tìm kiếm"
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '2px' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Sort Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <ArrowUpDown size={13} />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    aria-label="Sắp xếp danh sách học sinh"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'var(--surface-card)',
                      border: '1.5px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="recent">Mới vào lớp</option>
                    <option value="name">Tên (A → Z)</option>
                  </select>
                </div>

                {/* View Switcher: Table vs Cards */}
                <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border-divider)' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    title="Dạng bảng tính chi tiết"
                    aria-label="Xem dạng bảng"
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: viewMode === 'table' ? '1px solid var(--border-divider)' : 'none',
                      cursor: 'pointer',
                      background: viewMode === 'table' ? 'var(--surface-card)' : 'transparent',
                      color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      fontWeight: viewMode === 'table' ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    title="Dạng thẻ thành viên trực quan"
                    aria-label="Xem dạng thẻ"
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: viewMode === 'cards' ? '1px solid var(--border-divider)' : 'none',
                      cursor: 'pointer',
                      background: viewMode === 'cards' ? 'var(--surface-card)' : 'transparent',
                      color: viewMode === 'cards' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      fontWeight: viewMode === 'cards' ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={13} />
                <span style={{ fontWeight: 500 }}>Vai trò:</span>
                <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border-divider)' }}>
                  {(['all', 'monitor', 'member'] as const).map(rf => (
                    <button
                      key={rf}
                      type="button"
                      onClick={() => setRoleFilter(rf)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: roleFilter === rf ? '1px solid var(--border-divider)' : 'none',
                        cursor: 'pointer',
                        background: roleFilter === rf ? 'var(--surface-card)' : 'transparent',
                        color: roleFilter === rf ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: roleFilter === rf ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontWeight: roleFilter === rf ? 600 : 500,
                        transition: 'all 120ms ease',
                      }}
                    >
                      {rf === 'all' ? 'Tất cả' : rf === 'monitor' ? 'Lớp trưởng' : 'Học sinh'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 500 }}>Nhóm:</span>
                <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border-divider)' }}>
                  {(['all', 'assigned', 'unassigned'] as const).map(gf => (
                    <button
                      key={gf}
                      type="button"
                      onClick={() => setGroupFilter(gf)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: groupFilter === gf ? '1px solid var(--border-divider)' : 'none',
                        cursor: 'pointer',
                        background: groupFilter === gf ? 'var(--surface-card)' : 'transparent',
                        color: groupFilter === gf ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: groupFilter === gf ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontWeight: groupFilter === gf ? 600 : 500,
                        transition: 'all 120ms ease',
                      }}
                    >
                      {gf === 'all' ? 'Tất cả' : gf === 'assigned' ? 'Đã có nhóm' : 'Chưa có nhóm'}
                    </button>
                  ))}
                </div>
              </div>

              {(roleFilter !== 'all' || groupFilter !== 'all' || search !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter('all');
                    setGroupFilter('all');
                    setSearch('');
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: TABLE VIEW */}
          {viewMode === 'table' ? (
            <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
              <table className="class-members-table" style={{ width: '100%', minWidth: '840px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-divider)', background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
                    <th className="col-learner" style={{ padding: '12px 20px', fontWeight: 600, position: 'sticky', left: 0, zIndex: 3, background: 'var(--surface-card)', boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                      Học sinh / Người học
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vai trò</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nhóm đang tham gia</th>
                    <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right', position: 'sticky', right: 0, zIndex: 3, background: 'var(--surface-card)', boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Không tìm thấy học sinh nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    sortedStudents.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td className="col-learner" style={{ padding: '12px 20px', position: 'sticky', left: 0, zIndex: 2, background: 'var(--surface-card)', boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.memberId}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mã: {m.id.slice(0, 8)}</div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {m.role === 'monitor' ? (
                            <span
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '11px' }}
                            >
                              <Award size={13} />
                              <span>Lớp trưởng</span>
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500 }}>
                              <Users size={13} />
                              <span>Học sinh</span>
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {!groupNameByMemberId[m.memberId] || groupNameByMemberId[m.memberId] === 'Chưa có nhóm' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1.5px dashed var(--border-strong)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 500 }}>
                              <span>Chưa có nhóm</span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {groupNameByMemberId[m.memberId]}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 20px', textAlign: 'right', position: 'sticky', right: 0, zIndex: 2, background: 'var(--surface-card)', boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setTargetMemberForMonitor(m)}
                              title={m.role === 'monitor' ? 'Bãi nhiệm vai trò Lớp trưởng' : 'Bổ nhiệm làm Lớp trưởng'}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: 'var(--surface-card)',
                                color: 'var(--text-primary)',
                                border: '1.5px solid var(--border-strong)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <ArrowRightLeft size={13} />
                              <span>{m.role === 'monitor' ? 'Hạ vai trò' : 'Đặt Lớp trưởng'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTargetMemberForKick(m)}
                              title={`Đưa ${m.memberId} ra khỏi lớp học`}
                              aria-label={`Xóa ${m.memberId} khỏi lớp học`}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                background: 'var(--surface-card)',
                                color: 'var(--text-primary)',
                                border: '1.5px solid var(--border-strong)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW 2: CARDS GRID VIEW */
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {sortedStudents.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Không tìm thấy học sinh nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                sortedStudents.map(m => (
                  <article
                    key={m.id}
                    style={{
                      background: 'var(--surface-card)',
                      border: '1.5px solid var(--border-divider)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {m.memberId}
                        </div>
                        {m.role === 'monitor' ? (
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '11px' }}
                          >
                            <Award size={12} />
                            <span>Lớp trưởng</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>Học sinh</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Mã: {m.id.slice(0, 8)}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Nhóm:</span>
                          {!groupNameByMemberId[m.memberId] || groupNameByMemberId[m.memberId] === 'Chưa có nhóm' ? (
                            <span style={{ border: '1.5px dashed var(--border-strong)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 500 }}>
                              Chưa có nhóm
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{groupNameByMemberId[m.memberId]}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-divider)', paddingTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setTargetMemberForMonitor(m)}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'var(--surface-hover)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        <ArrowRightLeft size={13} />
                        <span>{m.role === 'monitor' ? 'Hạ vai trò' : 'Đặt Lớp trưởng'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetMemberForKick(m)}
                        title={`Đưa ${m.memberId} ra khỏi lớp học`}
                        aria-label={`Xóa ${m.memberId} khỏi lớp học`}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          background: 'var(--surface-hover)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <UserMinus size={13} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* MODAL 1: Bổ nhiệm / Bãi nhiệm Lớp trưởng */}
        {targetMemberForMonitor && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-monitor-title"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setTargetMemberForMonitor(null)}
          >
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                maxWidth: '460px',
                width: '100%',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} />
                  <h3 id="modal-monitor-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {targetMemberForMonitor.role === 'monitor' ? 'Bãi nhiệm Lớp trưởng' : 'Bổ nhiệm Lớp trưởng'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetMemberForMonitor(null)}
                  aria-label="Đóng"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                {targetMemberForMonitor.role === 'monitor' ? (
                  <span>
                    Bạn có chắc chắn muốn chuyển học sinh <strong style={{ color: 'var(--text-primary)' }}>{targetMemberForMonitor.memberId}</strong> về vai trò <strong>Học sinh</strong>? Quyền hỗ trợ lớp học sẽ dừng có hiệu lực.
                  </span>
                ) : (
                  <>
                    <span>
                      Bổ nhiệm học sinh <strong style={{ color: 'var(--text-primary)' }}>{targetMemberForMonitor.memberId}</strong> làm Lớp trưởng của lớp.
                    </span>
                    {currentMonitor && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Lưu ý:</strong> Mỗi lớp học chỉ có tối đa một Lớp trưởng. Học sinh <strong>{currentMonitor.memberId}</strong> sẽ tự động được chuyển về vai trò <strong>Học sinh</strong>.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-divider)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setTargetMemberForMonitor(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'var(--surface-card)',
                    color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-strong)',
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAppointMonitor}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    border: '1px solid var(--text-primary)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                  }}
                >
                  {targetMemberForMonitor.role === 'monitor' ? 'Xác nhận Bãi nhiệm' : 'Xác nhận Bổ nhiệm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Xóa học sinh ra khỏi lớp */}
        {targetMemberForKick && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-kick-title"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setTargetMemberForKick(null)}
          >
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                maxWidth: '460px',
                width: '100%',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserMinus size={18} />
                  <h3 id="modal-kick-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Xác nhận đưa học sinh ra khỏi lớp
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetMemberForKick(null)}
                  aria-label="Đóng"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Bạn có chắc chắn muốn đưa học sinh <strong style={{ color: 'var(--text-primary)' }}>{targetMemberForKick.memberId}</strong> ra khỏi lớp học?
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <strong>Lưu ý:</strong> Quyền truy cập lớp học và workspace nhóm sẽ chấm dứt ngay lập tức. Lịch sử bài làm cũ vẫn được bảo lưu.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-divider)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setTargetMemberForKick(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'var(--surface-card)',
                    color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-strong)',
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmKick}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                  }}
                >
                  Xác nhận Đưa ra khỏi lớp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mời học sinh bằng mã tài khoản theo hợp đồng hiện hành. */}
        {showInviteModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-invite-title"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setShowInviteModal(false)}
          >
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                maxWidth: '520px',
                width: '100%',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} />
                  <h3 id="modal-invite-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Mời học sinh tham gia lớp học
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  aria-label="Đóng"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendBulkInvites}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
                  Nhập mã tài khoản của người học, mỗi mã một dòng hoặc ngăn bằng dấu phẩy. Người học cần chấp nhận lời mời để vào lớp.
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Danh sách mã tài khoản học sinh <span style={{ color: 'var(--text-secondary)' }}>*</span>
                    </label>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mã tài khoản thứ nhất, mã tài khoản thứ hai"
                    value={inviteInput}
                    onChange={e => setInviteInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--surface-card)',
                      border: '1.5px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-divider)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: 'var(--surface-card)',
                      color: 'var(--text-primary)',
                      border: '1.5px solid var(--border-strong)',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={!inviteInput.trim()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: 'var(--text-primary)',
                      color: 'var(--bg-app)',
                      border: '1px solid var(--text-primary)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                      cursor: !inviteInput.trim() ? 'not-allowed' : 'pointer',
                      opacity: !inviteInput.trim() ? 0.5 : 1,
                    }}
                  >
                    <Send size={14} />
                    <span>Gửi lời mời</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // GÓC NHÌN HỌC SINH (TAB 02: Class Members Student)
  // =========================================================================
  return (
    <div className="review-screen class-members-screen">
      <div className="review-hero">
        <div>
          <span className="review-eyebrow">HỌC PHẦN CHÍNH KHÓA</span>
          <h1>{cls.name}</h1>
          <p>Tổng sĩ số: {members.length} học sinh · Múi giờ {cls.timeZone}</p>
          {currentUser && <div className="review-student-identity"><span className="student-member-avatar">{currentUser.id.slice(0, 2).toUpperCase()}</span><div><strong>{currentUser.id} (Bạn)</strong><small>Học sinh chính thức · {groupNameByMemberId[currentUser.id] ?? 'Chưa có nhóm'}</small></div><span>Quyền hạn: tra cứu danh bạ thành viên lớp</span></div>}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleLeaveClass}>
            Rời lớp
          </button>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            Làm mới
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
      {feedback && <div style={{ color: 'var(--success)', marginBottom: 12, fontSize: '0.875rem' }}>{feedback}</div>}
      {loading && <p>Đang tải thành viên lớp...</p>}

      <div className="review-leadership">
        <article className="review-panel review-contact-card"><span className="review-eyebrow"><ShieldCheck size={13} /> Giáo viên chủ lớp</span><h2>{cls.ownerId}</h2><button type="button" className="btn btn-secondary btn-sm" onClick={() => { void navigator.clipboard.writeText(cls.ownerId); showNotice('Đã sao chép mã tài khoản giáo viên.'); }}><Copy size={13} /> Sao chép mã</button></article>
        <article className="review-panel review-contact-card"><span className="review-eyebrow"><Award size={13} /> Lớp trưởng</span><h2>{currentMonitor?.memberId ?? 'Chưa bổ nhiệm'}</h2>{currentMonitor && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { void navigator.clipboard.writeText(currentMonitor.memberId); showNotice('Đã sao chép mã tài khoản lớp trưởng.'); }}><Copy size={13} /> Sao chép mã</button>}</article>
      </div>

      {/* My Invitations */}
      {myInvitations.length > 0 && (
        <div className="section-box">
          <div className="section-title">Lời mời tham gia lớp học dành cho bạn</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Giáo viên đã gửi lời mời tham gia lớp học này cho bạn.
          </p>
          {myInvitations.map(inv => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span>Lời mời từ giáo viên (Mã: {inv.id.slice(0, 8)}...)</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={async () => {
                  try {
                    await acceptClassInvitation(inv.id, inv.version);
                    showNotice('Đã chấp nhận lời mời vào lớp!');
                    await loadData();
                  } catch (err: any) {
                    setError(err?.body?.error?.message || err?.message || 'Lỗi chấp nhận');
                  }
                }}>
                  Chấp nhận
                </button>
                <button className="btn btn-secondary btn-sm" onClick={async () => {
                  try {
                    await declineClassInvitation(inv.id, inv.version);
                    showNotice('Đã từ chối lời mời');
                    await loadData();
                  } catch (err: any) {
                    setError(err?.body?.error?.message || err?.message || 'Lỗi từ chối');
                  }
                }}>
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Student Directory Table */}
      <div className="section-box review-members-directory">
        <div className="section-header">
          <div className="section-title">Danh bạ bạn học trong lớp</div>
          <span className="review-directory-count">Hiển thị {sortedStudents.length}/{members.length} học sinh</span>
        </div>

        <div className="review-toolbar">
          <div className="review-filters" role="group" aria-label="Lọc nhóm">
            {(['all', 'assigned', 'unassigned'] as const).map(option => (
              <button key={option} type="button" className={groupFilter === option ? 'active' : ''} onClick={() => setGroupFilter(option)}>
                {{ all: `Tất cả (${members.length})`, assigned: `Đã có nhóm (${assignedCount})`, unassigned: `Chưa có nhóm (${unassignedCount})` }[option]}
              </button>
            ))}
          </div>
          <label className="review-search">
            <Search size={15} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo mã tài khoản" aria-label="Tìm thành viên lớp" />
          </label>
          <label className="review-directory-sort">Sắp xếp <select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)}><option value="recent">Mặc định</option><option value="name">Mã tài khoản</option></select></label>
        </div>

        <div className="table-container class-members-container">
          <table className="data-table class-members-table">
            <thead>
              <tr>
                <th className="col-learner">Học sinh / Sinh viên</th>
                <th>Vai trò</th>
                <th>Nhóm đang tham gia</th>
                <th>Liên hệ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="owner-row">
                <td className="col-learner">
                  <strong>{cls.ownerId}</strong> <span className="badge badge-info" style={{ marginLeft: 6 }}>Giáo viên chủ lớp</span>
                </td>
                <td>Chủ lớp</td>
                <td>Chủ lớp</td>
                <td><button type="button" className="btn btn-secondary btn-sm" onClick={() => { void navigator.clipboard.writeText(cls.ownerId); showNotice('Đã sao chép mã tài khoản.'); }} aria-label="Sao chép mã tài khoản giáo viên"><Copy size={13} /></button></td>
              </tr>
              {sortedStudents.map(member => (
                <tr key={member.id}>
                  <td className="col-learner" style={{ fontFamily: 'monospace' }}>{member.memberId}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {member.role === 'monitor' ? (
                        <>
                          <Award size={13} style={{ color: 'var(--accent)' }} />
                          <span>Lớp trưởng</span>
                        </>
                      ) : (
                        <>
                          <User size={13} style={{ color: 'var(--text-secondary)' }} />
                          <span>Thành viên</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td>{groupNameByMemberId[member.memberId] ?? 'Chưa có dữ liệu nhóm'}</td>
                  <td><button type="button" className="btn btn-secondary btn-sm" onClick={() => { void navigator.clipboard.writeText(member.memberId); showNotice('Đã sao chép mã tài khoản.'); }} aria-label={`Sao chép mã tài khoản ${member.memberId}`}><Copy size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
