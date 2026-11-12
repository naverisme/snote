import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'monitor' | 'member';
  groupName: string;
  joinedAt: string;
  status: 'active' | 'pending';
  lastActive: string;
}

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
}

interface SentInvitation {
  id: string;
  email: string;
  role: 'member' | 'monitor';
  sentAt: string;
  status: 'pending_acceptance';
}

const TEACHER_PROFILE: MemberItem = {
  id: 'm-01',
  name: 'TS. Nguyễn Văn Toàn (Bạn)',
  email: 'toan.nv@hcmut.edu.vn',
  role: 'teacher',
  groupName: 'Giáo viên chủ nhiệm & Quản trị lớp',
  joinedAt: '01/09/2026',
  status: 'active',
  lastActive: 'Đang trực tuyến',
};

const INITIAL_STUDENTS: MemberItem[] = [
  { id: 'm-02', name: 'Lê Hoàng Nam (Lớp trưởng)', email: 'nam.le@student.edu.vn', role: 'monitor', groupName: 'Nhóm 01 - AI & Data', joinedAt: '03/09/2026', status: 'active', lastActive: '5 phút trước' },
  { id: 'm-03', name: 'Trần Thị Mai', email: 'mai.tran@student.edu.vn', role: 'member', groupName: 'Nhóm 01 - AI & Data', joinedAt: '03/09/2026', status: 'active', lastActive: '12 phút trước' },
  { id: 'm-04', name: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@student.edu.vn', role: 'member', groupName: 'Nhóm 02 - Web Platform', joinedAt: '04/09/2026', status: 'active', lastActive: '1 giờ trước' },
  { id: 'm-05', name: 'Đỗ Quốc Bảo', email: 'bao.do@student.edu.vn', role: 'member', groupName: 'Chưa có nhóm', joinedAt: '05/09/2026', status: 'active', lastActive: '1 ngày trước' },
  { id: 'm-06', name: 'Vũ Đức Thịnh', email: 'thinh.vu@student.edu.vn', role: 'member', groupName: 'Chưa có nhóm', joinedAt: '06/09/2026', status: 'active', lastActive: 'Chưa đăng nhập' },
];

const INITIAL_REQUESTS: JoinRequest[] = [
  { id: 'req-01', name: 'Nguyễn Thanh Hằng', email: 'hang.nguyen@student.edu.vn', requestedAt: '10 phút trước' },
  { id: 'req-02', name: 'Bùi Anh Tuấn', email: 'tuan.bui@student.edu.vn', requestedAt: '1 giờ trước' },
];

const INITIAL_INVITATIONS: SentInvitation[] = [
  { id: 'inv-01', email: 'lan.hoang@student.edu.vn', role: 'member', sentAt: 'Hôm qua', status: 'pending_acceptance' },
  { id: 'inv-02', email: 'phuc.dang@student.edu.vn', role: 'member', sentAt: '2 ngày trước', status: 'pending_acceptance' },
];

export const Tab01ClassMembersAdmin: React.FC = () => {
  const [students, setStudents] = useState<MemberItem[]>(INITIAL_STUDENTS);
  const [requests, setRequests] = useState<JoinRequest[]>(INITIAL_REQUESTS);
  const [invitations, setInvitations] = useState<SentInvitation[]>(INITIAL_INVITATIONS);

  // View Mode: Table (CUXC-07, CUXC-11) or Cards Grid
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filters, Search & Sort
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'monitor' | 'member'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'activity'>('recent');

  // Active Tab for Requests & Invitations Box
  const [activeQueueTab, setActiveQueueTab] = useState<'requests' | 'invitations'>('requests');

  // Join Code State & Privacy
  const [joinCodeEnabled, setJoinCodeEnabled] = useState(true);
  const [joinCode, setJoinCode] = useState('SNOTE-CS101-2026');
  const [showCodePlaintext, setShowCodePlaintext] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals state
  const [targetMemberForMonitor, setTargetMemberForMonitor] = useState<MemberItem | null>(null);
  const [targetMemberForKick, setTargetMemberForKick] = useState<MemberItem | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'monitor'>('member');

  // Toast Feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3200);
  };

  // Close modals on Escape key (WCAG AA)
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

  // Monitor Management: Maximum 1 active monitor
  const currentMonitor = students.find(m => m.role === 'monitor');

  const handleConfirmAppointMonitor = () => {
    if (!targetMemberForMonitor) return;
    const targetId = targetMemberForMonitor.id;
    const isCurrentlyMonitor = targetMemberForMonitor.role === 'monitor';

    if (isCurrentlyMonitor) {
      // Demote monitor to member
      setStudents(prev => prev.map(m => m.id === targetId ? { ...m, role: 'member', name: m.name.replace(' (Lớp trưởng)', '') } : m));
      showNotice(`Đã chuyển ${targetMemberForMonitor.name} về vai trò Học sinh.`);
    } else {
      // Appoint as monitor: demote existing monitor(s) first to preserve single monitor invariant
      setStudents(prev => prev.map(m => {
        if (m.id === targetId) {
          const cleanName = m.name.replace(' (Lớp trưởng)', '');
          return { ...m, role: 'monitor', name: `${cleanName} (Lớp trưởng)` };
        }
        if (m.role === 'monitor') {
          return { ...m, role: 'member', name: m.name.replace(' (Lớp trưởng)', '') };
        }
        return m;
      }));
      showNotice(`Đã bổ nhiệm ${targetMemberForMonitor.name} làm Lớp trưởng.`);
    }
    setTargetMemberForMonitor(null);
  };

  // Kick Member: preserve work and submissions history
  const handleConfirmKick = () => {
    if (!targetMemberForKick) return;
    const name = targetMemberForKick.name;
    setStudents(prev => prev.filter(m => m.id !== targetMemberForKick.id));
    showNotice(`Đã xóa ${name} khỏi lớp học. Lịch sử bài làm và điểm số được bảo lưu.`);
    setTargetMemberForKick(null);
  };

  // Single Approve / Decline Join Request
  const handleApproveRequest = (id: string, name: string, email: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    const newStudent: MemberItem = {
      id: `m-${Date.now()}`,
      name,
      email,
      role: 'member',
      groupName: 'Chưa có nhóm',
      joinedAt: 'Hôm nay',
      status: 'active',
      lastActive: 'Vừa xong',
    };
    setStudents(prev => [...prev, newStudent]);
    showNotice(`Đã duyệt học sinh ${name} vào lớp học.`);
  };

  const handleDeclineRequest = (id: string, name: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    showNotice(`Đã từ chối yêu cầu gia nhập của ${name}.`);
  };

  // Bulk Approve All Requests
  const handleApproveAllRequests = () => {
    if (requests.length === 0) return;
    const count = requests.length;
    const newMembers: MemberItem[] = requests.map(req => ({
      id: `m-${Date.now()}-${req.id}`,
      name: req.name,
      email: req.email,
      role: 'member',
      groupName: 'Chưa có nhóm',
      joinedAt: 'Hôm nay',
      status: 'active',
      lastActive: 'Vừa xong',
    }));
    setStudents(prev => [...prev, ...newMembers]);
    setRequests([]);
    showNotice(`Đã duyệt đồng loạt ${count} học sinh vào lớp học.`);
  };

  // Bulk Decline All Requests
  const handleDeclineAllRequests = () => {
    if (requests.length === 0) return;
    const count = requests.length;
    setRequests([]);
    showNotice(`Đã từ chối đồng loạt ${count} yêu cầu gia nhập.`);
  };

  // Parse Multi-Email input
  const parsedEmails = Array.from(new Set(
    inviteInput
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  ));

  // Send Bulk Invitations
  const handleSendBulkInvites = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedEmails.length === 0) return;
    const newInvites: SentInvitation[] = parsedEmails.map(email => ({
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      email,
      role: inviteRole,
      sentAt: 'Vừa xong',
      status: 'pending_acceptance',
    }));
    setInvitations(prev => [...newInvites, ...prev]);
    showNotice(`Đã gửi đồng loạt ${parsedEmails.length} lời mời tham gia lớp học.`);
    setInviteInput('');
    setShowInviteModal(false);
  };

  const handleRevokeInvitation = (id: string, email: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    showNotice(`Đã thu hồi lời mời gửi tới ${email}.`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    showNotice(`Đã sao chép mã tham gia lớp: ${joinCode}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter & Sort Logic on Student Roster
  const filteredStudents = students.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ? true : m.role === roleFilter;

    const matchesGroup =
      groupFilter === 'all'
        ? true
        : groupFilter === 'assigned'
          ? m.groupName !== 'Chưa có nhóm'
          : m.groupName === 'Chưa có nhóm';

    return matchesSearch && matchesRole && matchesGroup;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'vi');
    }
    if (sortBy === 'activity') {
      const getScore = (val: string) => {
        if (val.includes('trực tuyến') || val.includes('Vừa')) return 5;
        if (val.includes('phút')) return 4;
        if (val.includes('giờ')) return 3;
        if (val.includes('ngày')) return 2;
        return 1;
      };
      return getScore(b.lastActive) - getScore(a.lastActive);
    }
    // Default: 'recent'
    return 0;
  });

  // KPI Metrics Calculation
  const unassignedCount = students.filter(m => m.groupName === 'Chưa có nhóm').length;
  const assignedCount = students.filter(m => m.groupName !== 'Chưa có nhóm').length;

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

      {/* 1. CLASS LEADERSHIP HERO CARD (PER-01 & PER-02) */}
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
              NVT
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {TEACHER_PROFILE.name}
                </h1>
                <span
                  data-spec="PER-01"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1.5px solid var(--border-strong, #52525b)',
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
                {TEACHER_PROFILE.email} • Quản trị viên lớp học
              </div>
            </div>
          </div>

          {/* Quick Actions Bar: Direct Invite Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              data-spec="CLS-02"
              onClick={() => setShowInviteModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                background: '#09090b',
                color: '#ffffff',
                border: '1px solid #09090b',
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

        {/* Join Code High-Contrast Box with Privacy Toggle & 1-Click Copy */}
        <div
          style={{
            background: 'var(--surface-hover)',
            border: '1.5px solid var(--border-strong, #52525b)',
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
                title="Bấm để sao chép mã tham gia"
                style={{
                  background: 'var(--surface-card)',
                  border: '1.5px solid var(--border-strong, #52525b)',
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
                <span>{(!joinCodeEnabled && !showCodePlaintext) ? '••••••••••••••••' : joinCode}</span>
                {copiedCode ? <CheckCheck size={14} /> : <Copy size={14} style={{ color: 'var(--text-primary)' }} />}
              </button>

              {!joinCodeEnabled && (
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
              onClick={() => {
                setJoinCode(`SNOTE-CS101-${Math.floor(1000 + Math.random() * 9000)}`);
                showNotice('Đã tạo mã tham gia lớp mới');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'var(--surface-card)',
                border: '1.5px solid var(--border-strong, #52525b)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} />
              <span>Đổi mã mới</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJoinCodeEnabled(!joinCodeEnabled);
                showNotice(joinCodeEnabled ? 'Đã tạm khóa nhận yêu cầu qua mã' : 'Đã mở tiếp nhận yêu cầu qua mã');
              }}
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
                border: '1.5px solid var(--border-strong, #52525b)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: joinCodeEnabled ? 'var(--text-primary)' : 'transparent',
                  border: joinCodeEnabled ? 'none' : '1.5px solid var(--border-strong, #52525b)',
                  display: 'inline-block',
                }}
              />
              <span>{joinCodeEnabled ? 'Mã đang Mở' : 'Mã đang Khóa'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BENTO METRICS BAR: Semantic DL, DT, DD with Hover Micro-Interactions */}
      <section aria-label="Thống kê Tình trạng Lớp học">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Bento Card 1: Tổng sĩ số */}
          <article
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '16px 20px',
              transition: 'border-color var(--transition-fast, 160ms ease)',
            }}
          >
            <dl style={{ margin: 0 }}>
              <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                <span>Tổng sĩ số học sinh</span>
                <Users size={16} />
              </dt>
              <dd style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {students.length} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>thành viên</span>
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
              transition: 'border-color var(--transition-fast, 160ms ease)',
            }}
          >
            <dl style={{ margin: 0 }}>
              <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                <span>Lớp trưởng</span>
                <Award size={16} />
              </dt>
              <dd style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentMonitor ? currentMonitor.name.replace(' (Lớp trưởng)', '') : 'Chưa bổ nhiệm'}
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
              transition: 'border-color var(--transition-fast, 160ms ease)',
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
              transition: 'border-color var(--transition-fast, 160ms ease)',
            }}
          >
            <dl style={{ margin: 0 }}>
              <dt style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>
                <span>Hàng đợi chờ xử lý</span>
                <Clock size={16} />
              </dt>
              <dd style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {requests.length} yêu cầu mã • {invitations.length} lời mời gửi
              </dd>
              <dd style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Chờ duyệt hoặc người học xác nhận
              </dd>
            </dl>
          </article>
        </div>
      </section>

      {/* 3. QUEUE SECTION: Tabbed View for Join Requests & Sent Invitations with Bulk Actions */}
      {(requests.length > 0 || invitations.length > 0) && (
        <section
          aria-label="Hàng đợi Yêu cầu và Lời mời Tham gia"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-divider)', paddingBottom: '10px', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                data-spec="CLS-03"
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
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '10px', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong, #52525b)', color: 'var(--text-primary)' }}>
                  {requests.length}
                </span>
              </button>

              <button
                type="button"
                data-spec="CLS-02"
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
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '10px', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong, #52525b)', color: 'var(--text-primary)' }}>
                  {invitations.length}
                </span>
              </button>
            </div>

            {/* Bulk Actions Button for Requests */}
            {activeQueueTab === 'requests' && requests.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  data-spec="CLS-03"
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
                    border: '1.5px solid var(--border-strong, #52525b)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <UserCheck size={13} />
                  <span>Duyệt tất cả ({requests.length})</span>
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
                    border: '1.5px solid var(--border-strong, #52525b)',
                    cursor: 'pointer',
                  }}
                >
                  Từ chối tất cả
                </button>
              </div>
            )}
          </div>

          {activeQueueTab === 'requests' ? (
            requests.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Không có yêu cầu xin gia nhập nào đang chờ duyệt.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{req.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.email} • Gửi lúc: {req.requestedAt}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id, req.name, req.email)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong, #52525b)',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          cursor: 'pointer',
                        }}
                      >
                        Duyệt vào lớp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineRequest(req.id, req.name)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong, #52525b)',
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
            invitations.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Không có lời mời nào đang chờ chấp nhận.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {invitations.map(inv => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.email}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Vai trò dự kiến: {inv.role === 'monitor' ? 'Lớp trưởng' : 'Học sinh'} • Đã gửi: {inv.sentAt} • Đang chờ người học xác nhận
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => showNotice(`Đã gửi lại lời mời tới ${inv.email}`)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong, #52525b)',
                          cursor: 'pointer',
                        }}
                      >
                        Gửi lại
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong, #52525b)',
                          cursor: 'pointer',
                        }}
                      >
                        Thu hồi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      )}

      {/* 4. STUDENT MEMBERS ROSTER: Table View (CUXC-07, CUXC-11) or Member Cards Grid View */}
      <section
        aria-label="Danh sách Học sinh và Quản trị Thành viên"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}
      >
        {/* Header & Filter Controls Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Học sinh trong lớp ({sortedStudents.length}/{students.length})
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
                  placeholder="Tìm học sinh theo tên/email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '6px',
                    background: 'var(--surface-card)',
                    border: '1.5px solid var(--border-strong, #52525b)',
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
                    border: '1.5px solid var(--border-strong, #52525b)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="recent">Mới vào lớp</option>
                  <option value="name">Tên (A → Z)</option>
                  <option value="activity">Hoạt động gần nhất</option>
                </select>
              </div>

              {/* View Switcher: Table vs Cards (Refined Segmented Control) */}
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

          {/* Filter Chips Bar (Refined Segmented Control) */}
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

        {/* VIEW 1: TABLE VIEW WITH STICKY COLUMNS */}
        {viewMode === 'table' ? (
          <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
            <table style={{ width: '100%', minWidth: '840px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-divider)', background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600, position: 'sticky', left: 0, zIndex: 3, background: 'var(--surface-card)', boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                    Học sinh / Người học
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vai trò</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nhóm đang tham gia</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Hoạt động gần nhất</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ngày vào lớp</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right', position: 'sticky', right: 0, zIndex: 3, background: 'var(--surface-card)', boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Không tìm thấy học sinh nào khớp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                      {/* Sticky Student Profile Column */}
                      <td style={{ padding: '12px 20px', position: 'sticky', left: 0, zIndex: 2, background: 'var(--surface-card)', boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.email}</div>
                      </td>

                      {/* Role Column */}
                      <td style={{ padding: '12px 16px' }}>
                        {m.role === 'monitor' ? (
                          <span
                            data-spec="PER-02"
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

                      {/* Group Status */}
                      <td style={{ padding: '12px 16px' }}>
                        {m.groupName === 'Chưa có nhóm' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1.5px dashed var(--border-strong, #52525b)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 500 }}>
                            <span>Chưa có nhóm</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            {m.groupName}
                          </span>
                        )}
                      </td>

                      {/* Last Active Indicator */}
                      <td style={{ padding: '12px 16px', color: m.lastActive.includes('phút') || m.lastActive.includes('trực tuyến') ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: m.lastActive.includes('phút') || m.lastActive.includes('trực tuyến') ? 600 : 400 }}>
                        {m.lastActive}
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {m.joinedAt}
                      </td>

                      {/* Sticky Actions Column */}
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
                              border: '1.5px solid var(--border-strong, #52525b)',
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
                            title={`Đưa ${m.name} ra khỏi lớp học`}
                            aria-label={`Xóa ${m.name} khỏi lớp học`}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              background: 'var(--surface-card)',
                              color: 'var(--text-primary)',
                              border: '1.5px solid var(--border-strong, #52525b)',
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
                        {m.name}
                      </div>
                      {m.role === 'monitor' ? (
                        <span
                          data-spec="PER-02"
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
                      {m.email}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Nhóm:</span>
                        {m.groupName === 'Chưa có nhóm' ? (
                          <span style={{ border: '1.5px dashed var(--border-strong, #52525b)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 500 }}>
                            Chưa có nhóm
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.groupName}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Hoạt động:</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500 }}>{m.lastActive}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Ngày vào:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{m.joinedAt}</span>
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
                        border: '1.5px solid var(--border-strong, #52525b)',
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
                      title={`Đưa ${m.name} ra khỏi lớp học`}
                      aria-label={`Xóa ${m.name} khỏi lớp học`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: 'var(--surface-hover)',
                        color: 'var(--text-primary)',
                        border: '1.5px solid var(--border-strong, #52525b)',
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

      {/* MODAL 1: Bổ nhiệm / Bãi nhiệm Lớp trưởng (PER-02, PER-10, PER-11) */}
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
                <h3 id="modal-monitor-title" data-spec="PER-02" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {targetMemberForMonitor.role === 'monitor' ? 'Bãi nhiệm Lớp trưởng' : 'Bổ nhiệm Lớp trưởng'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetMemberForMonitor(null)}
                aria-label="Đóng cửa sổ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              {targetMemberForMonitor.role === 'monitor' ? (
                <span>
                  Bạn có chắc chắn muốn chuyển học sinh <strong style={{ color: 'var(--text-primary)' }}>{targetMemberForMonitor.name}</strong> về vai trò <strong>Học sinh</strong>? Quyền xem và hỗ trợ công việc của các nhóm trong lớp sẽ dừng có hiệu lực.
                </span>
              ) : (
                <>
                  <span>
                    Bổ nhiệm học sinh <strong style={{ color: 'var(--text-primary)' }}>{targetMemberForMonitor.name}</strong> làm Lớp trưởng của lớp.
                  </span>
                  {currentMonitor && (
                    <div data-spec="PER-02" style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Lưu ý:</strong> Mỗi lớp học chỉ có tối đa một Lớp trưởng. Học sinh <strong>{currentMonitor.name.replace(' (Lớp trưởng)', '')}</strong> sẽ tự động được chuyển về vai trò <strong>Học sinh</strong>.
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Lớp trưởng có quyền xem và hỗ trợ công việc, lịch trình của các nhóm trong lớp.
                  </div>
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
                  border: '1.5px solid var(--border-strong, #52525b)',
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
                  background: '#09090b',
                  color: '#ffffff',
                  border: '1px solid #09090b',
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

      {/* MODAL 2: Khai trừ / Đưa học sinh ra khỏi lớp (CLS-08, CLS-12) */}
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
                <h3 id="modal-kick-title" data-spec="CLS-08" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Xác nhận đưa học sinh ra khỏi lớp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetMemberForKick(null)}
                aria-label="Đóng cửa sổ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Bạn có chắc chắn muốn đưa học sinh <strong style={{ color: 'var(--text-primary)' }}>{targetMemberForKick.name}</strong> ({targetMemberForKick.email}) ra khỏi lớp học?
              <div data-spec="CLS-08 CLS-12" style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                <strong>Lưu ý khi xóa học sinh khỏi lớp:</strong>
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  <li>Quyền truy cập lớp học và workspace nhóm sẽ chấm dứt ngay lập tức.</li>
                  <li>Lịch sử công việc và các bản nộp bài cũ của học sinh vẫn được bảo lưu tại lớp.</li>
                  {targetMemberForKick.groupName !== 'Chưa có nhóm' && (
                    <li>Học sinh hiện đang thuộc <strong>{targetMemberForKick.groupName}</strong>. Hãy đảm bảo các phần việc phụ trách đã được bàn giao.</li>
                  )}
                </ul>
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
                  border: '1.5px solid var(--border-strong, #52525b)',
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
                  background: '#09090b',
                  color: '#ffffff',
                  border: '1px solid #09090b',
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

      {/* MODAL 3: Mời học sinh tham gia lớp qua Email (CLS-02) with Multi-Email Bulk Support */}
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
                <h3 id="modal-invite-title" data-spec="CLS-02" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Mời học sinh tham gia lớp học
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                aria-label="Đóng cửa sổ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendBulkInvites}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
                Nhập một hoặc nhiều địa chỉ email (phân tách bằng dấu phẩy, dấu chấm phẩy hoặc xuống dòng). Lời mời sẽ có hiệu lực sau khi người học xác nhận tham gia.
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Danh sách Email học sinh <span style={{ color: 'var(--text-secondary)' }}>*</span>
                  </label>
                  {parsedEmails.length > 0 && (
                    <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '10px', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong, #52525b)', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Đã nhận diện: {parsedEmails.length} email
                    </span>
                  )}
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="sv1@student.edu.vn, sv2@student.edu.vn&#10;sv3@student.edu.vn"
                  value={inviteInput}
                  onChange={e => setInviteInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-card)',
                    border: '1.5px solid var(--border-strong, #52525b)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Vai trò ban đầu:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="inviteRole"
                      value="member"
                      checked={inviteRole === 'member'}
                      onChange={() => setInviteRole('member')}
                    />
                    <span>Học sinh (Mặc định)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="inviteRole"
                      value="monitor"
                      checked={inviteRole === 'monitor'}
                      onChange={() => setInviteRole('monitor')}
                    />
                    <span>Lớp trưởng</span>
                  </label>
                </div>
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
                    border: '1.5px solid var(--border-strong, #52525b)',
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={parsedEmails.length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#09090b',
                    color: '#ffffff',
                    border: '1px solid #09090b',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    cursor: parsedEmails.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: parsedEmails.length === 0 ? 0.5 : 1,
                  }}
                >
                  <Send size={14} />
                  <span>Gửi {parsedEmails.length > 1 ? `${parsedEmails.length} lời mời` : 'lời mời'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
