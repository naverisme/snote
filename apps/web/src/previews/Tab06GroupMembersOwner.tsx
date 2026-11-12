import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Users,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  X,
  Search,
  Copy,
  Clock,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  History,
  Bell,
  ChevronRight,
  Calendar,
  CheckSquare,
} from 'lucide-react';

/* ============================================================================
   TYPE DEFINITIONS & BUSINESS CONTRACTS
   ============================================================================ */

export interface MemberTaskDetail {
  id: string;
  title: string;
  deadline: string;
  status: 'done' | 'in_progress';
  priority: 'high' | 'normal';
}

export interface GroupMemberItem {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  role: 'owner' | 'member';
  joinedAt: string;
  assignedTasks: number;
  completedTasks: number;
  tasksList: MemberTaskDetail[];
}

export interface JoinRequestItem {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  requestedAt: string;
  message?: string;
}

export interface OutgoingInviteItem {
  id: string;
  name: string;
  email: string;
  sentAt: string;
}

export interface ClassmateCandidate {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  hasGroup: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}

const MAX_CAPACITY = 5; // Định mức tối đa 5 thành viên/nhóm

/* ============================================================================
   INITIAL MOCK DATA (CLEANED OF SPEC CODE CLUTTER)
   ============================================================================ */

const INITIAL_MEMBERS: GroupMemberItem[] = [
  {
    id: 'u-lead-01',
    name: 'Lê Hoàng Nam (Bạn - Trưởng nhóm)',
    email: 'nam.le@student.edu.vn',
    studentCode: '2210012',
    role: 'owner',
    joinedAt: '01/10/2026',
    assignedTasks: 4,
    completedTasks: 2,
    tasksList: [
      { id: 't-01', title: 'Khởi tạo Workspace & Phân rã WBS đồ án', deadline: '05/10/2026', status: 'done', priority: 'high' },
      { id: 't-02', title: 'Thiết kế Data Contract & OpenAPI v2', deadline: '12/10/2026', status: 'done', priority: 'high' },
      { id: 't-03', title: 'Cấu hình Dataproc Spark Serverless pipeline', deadline: '20/11/2026', status: 'in_progress', priority: 'high' },
      { id: 't-04', title: 'Tổng hợp báo cáo tiến độ nộp giáo viên (Mốc 1)', deadline: '25/11/2026', status: 'in_progress', priority: 'normal' },
    ],
  },
  {
    id: 'u-mem-02',
    name: 'Trần Thị Mai',
    email: 'mai.tran@student.edu.vn',
    studentCode: '2210034',
    role: 'member',
    joinedAt: '03/10/2026',
    assignedTasks: 3,
    completedTasks: 2,
    tasksList: [
      { id: 't-05', title: 'Xây dựng UI Component preview Tab 01-05', deadline: '10/10/2026', status: 'done', priority: 'normal' },
      { id: 't-06', title: 'Tối ưu CSS Theme Tokens Monochrome WCAG AA', deadline: '15/10/2026', status: 'done', priority: 'high' },
      { id: 't-07', title: 'Tích hợp Gantt Timeline 22 ngày', deadline: '22/11/2026', status: 'in_progress', priority: 'high' },
    ],
  },
  {
    id: 'u-mem-03',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@student.edu.vn',
    studentCode: '2210078',
    role: 'member',
    joinedAt: '05/10/2026',
    assignedTasks: 2,
    completedTasks: 1,
    tasksList: [
      { id: 't-08', title: 'Cài đặt SQLite Cache & State Store', deadline: '18/10/2026', status: 'done', priority: 'normal' },
      { id: 't-09', title: 'Xử lý logic xung đột chỉnh sửa đồng thời (CRDT)', deadline: '24/11/2026', status: 'in_progress', priority: 'high' },
    ],
  },
  {
    id: 'u-mem-04',
    name: 'Phạm Quỳnh Anh',
    email: 'quynhanh.pham@student.edu.vn',
    studentCode: '2210105',
    role: 'member',
    joinedAt: '07/10/2026',
    assignedTasks: 1,
    completedTasks: 1,
    tasksList: [
      { id: 't-10', title: 'Viết tài liệu kiểm thử chấp nhận (12 ca kiểm nền)', deadline: '15/10/2026', status: 'done', priority: 'normal' },
    ],
  },
];

const INITIAL_REQUESTS: JoinRequestItem[] = [
  {
    id: 'req-01',
    name: 'Đỗ Quốc Bảo',
    email: 'bao.do@student.edu.vn',
    studentCode: '2210045',
    requestedAt: '2 giờ trước',
    message: 'Chào nhóm trưởng, mình có kinh nghiệm làm frontend React và muốn xin vào nhóm để phụ trách phần UI đồ án.',
  },
];

const INITIAL_OUTGOING_INVITES: OutgoingInviteItem[] = [
  {
    id: 'inv-01',
    name: 'Vũ Đức Thịnh',
    email: 'thinh.vu@student.edu.vn',
    sentAt: 'Hôm qua, 15:30',
  },
];

const CLASSMATE_CANDIDATES: ClassmateCandidate[] = [
  { id: 'c-01', name: 'Đỗ Quốc Bảo', email: 'bao.do@student.edu.vn', studentCode: '2210045', hasGroup: false },
  { id: 'c-02', name: 'Vũ Đức Thịnh', email: 'thinh.vu@student.edu.vn', studentCode: '2210089', hasGroup: false },
  { id: 'c-03', name: 'Nguyễn Thanh Hằng', email: 'hang.nguyen@student.edu.vn', studentCode: '2210112', hasGroup: false },
  { id: 'c-04', name: 'Bùi Anh Tuấn', email: 'tuan.bui@student.edu.vn', studentCode: '2210156', hasGroup: false },
  { id: 'c-05', name: 'Hoàng Minh Khôi', email: 'khoi.hoang@student.edu.vn', studentCode: '2210201', hasGroup: true },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '07/10/2026 09:15',
    actor: 'Lê Hoàng Nam',
    action: 'Duyệt gia nhập',
    target: 'Phạm Quỳnh Anh',
    details: 'Chấp thuận đơn xin gia nhập nhóm CS101-N01.',
  },
  {
    id: 'log-02',
    timestamp: '05/10/2026 14:20',
    actor: 'Lê Hoàng Nam',
    action: 'Gia nhập nhóm',
    target: 'Nguyễn Văn Minh',
    details: 'Hoàn tất bước chấp nhận lời mời tham gia nhóm.',
  },
  {
    id: 'log-03',
    timestamp: '01/10/2026 08:00',
    actor: 'Lê Hoàng Nam',
    action: 'Khởi tạo Workspace',
    target: 'Nhóm 01 - AI & Data Platform',
    details: 'Được chỉ định làm Trưởng nhóm chính.',
  },
];

/* ============================================================================
   MAIN COMPONENT: Tab06GroupMembersOwner
   ============================================================================ */

export const Tab06GroupMembersOwner: React.FC = () => {
  // Core States
  const [members, setMembers] = useState<GroupMemberItem[]>(INITIAL_MEMBERS);
  const [requests, setRequests] = useState<JoinRequestItem[]>(INITIAL_REQUESTS);
  const [outgoingInvites, setOutgoingInvites] = useState<OutgoingInviteItem[]>(INITIAL_OUTGOING_INVITES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Navigation & Filtering
  const [activeSegment, setActiveSegment] = useState<'members' | 'requests' | 'logs'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Modals & Drawer
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState<GroupMemberItem | null>(null);
  const [kickTarget, setKickTarget] = useState<GroupMemberItem | null>(null);
  const [selectedMemberForTasks, setSelectedMemberForTasks] = useState<GroupMemberItem | null>(null);

  // Form States for Handover
  const [transferTaskOption, setTransferTaskOption] = useState<'keep' | 'transfer'>('transfer');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [kickReassignOption, setKickReassignOption] = useState<'reassign' | 'unassign'>('reassign');
  const [kickReassignMemberId, setKickReassignMemberId] = useState<string>('');
  const [kickReason, setKickReason] = useState<string>('');

  // Keyboard accessibility: ESC closes any open modal or drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInviteModal(false);
        setTransferTarget(null);
        setKickTarget(null);
        setSelectedMemberForTasks(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set default reassign target when kick target changes
  useEffect(() => {
    if (kickTarget) {
      const otherMember = members.find((m) => m.id !== kickTarget.id);
      if (otherMember) {
        setKickReassignMemberId(otherMember.id);
      }
      setKickReason('');
      setKickReassignOption('reassign');
    }
  }, [kickTarget, members]);

  // Derived Metrics
  const isFull = members.length >= MAX_CAPACITY;
  const totalTasks = useMemo(() => members.reduce((sum, m) => sum + m.assignedTasks, 0), [members]);
  const completedTasks = useMemo(() => members.reduce((sum, m) => sum + m.completedTasks, 0), [members]);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const quotaPercent = Math.round((members.length / MAX_CAPACITY) * 100);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.studentCode.includes(q)
    );
  }, [members, searchQuery]);

  // Show Toast
  const showNotice = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Log an Audit Entry
  const addAuditEntry = (action: string, target: string, details: string) => {
    const now = new Date();
    const formatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: formatted,
      actor: 'Lê Hoàng Nam (Trưởng nhóm)',
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  /* ============================================================================
     ACTION HANDLERS
     ============================================================================ */

  // 1. Duyệt đơn xin vào nhóm
  const handleApproveRequest = (request: JoinRequestItem) => {
    if (isFull) {
      showNotice(`Không thể duyệt: Nhóm đã đủ ${MAX_CAPACITY}/${MAX_CAPACITY} thành viên.`, 'warn');
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    const newMember: GroupMemberItem = {
      id: request.id,
      name: request.name,
      email: request.email,
      studentCode: request.studentCode,
      role: 'member',
      joinedAt: 'Hôm nay',
      assignedTasks: 0,
      completedTasks: 0,
      tasksList: [],
    };
    setMembers((prev) => [...prev, newMember]);
    addAuditEntry('Duyệt gia nhập', request.name, `Chấp thuận đơn xin vào nhóm. Sĩ số mới: ${members.length + 1}/${MAX_CAPACITY}`);
    showNotice(`Đã phê duyệt sinh viên ${request.name} vào nhóm thành công.`);
  };

  // 2. Từ chối đơn xin vào nhóm
  const handleRejectRequest = (request: JoinRequestItem) => {
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    addAuditEntry('Từ chối đơn', request.name, 'Trưởng nhóm từ chối yêu cầu gia nhập.');
    showNotice(`Đã từ chối đơn gia nhập của ${request.name}.`, 'info');
  };

  // 3. Hủy lời mời đã gửi
  const handleCancelInvite = (invite: OutgoingInviteItem) => {
    setOutgoingInvites((prev) => prev.filter((i) => i.id !== invite.id));
    addAuditEntry('Hủy lời mời', invite.name, 'Thu hồi lời mời gia nhập nhóm đã phát đi trước đó.');
    showNotice(`Đã thu hồi lời mời gửi tới ${invite.name}.`, 'info');
  };

  // 4. Mời bạn cùng lớp
  const handleSendInviteToCandidate = (candidate: ClassmateCandidate) => {
    if (isFull) {
      showNotice(`Không thể gửi lời mời: Nhóm đã đạt sĩ số tối đa ${MAX_CAPACITY}/${MAX_CAPACITY}.`, 'warn');
      return;
    }
    const alreadyInvited = outgoingInvites.some((i) => i.email === candidate.email);
    if (alreadyInvited) {
      showNotice(`Lời mời đã được gửi tới ${candidate.name} trước đó.`, 'info');
      return;
    }

    const newInvite: OutgoingInviteItem = {
      id: `inv-${Date.now()}`,
      name: candidate.name,
      email: candidate.email,
      sentAt: 'Vừa xong',
    };
    setOutgoingInvites((prev) => [...prev, newInvite]);
    addAuditEntry('Gửi lời mời', candidate.name, `Gửi lời mời gia nhập nhóm tới sinh viên lớp CS101 (${candidate.studentCode}).`);
    showNotice(`Đã phát lời mời tham gia nhóm tới ${candidate.name}.`);
    setShowInviteModal(false);
  };

  // 5. Bàn giao quyền Trưởng nhóm kèm xử lý đầu việc
  const handleExecuteTransferOwnership = () => {
    if (!transferTarget || !transferConfirmed) return;

    const currentOwner = members.find((m) => m.role === 'owner');
    const ownerTasksCount = currentOwner ? currentOwner.assignedTasks : 0;
    const ownerCompletedCount = currentOwner ? currentOwner.completedTasks : 0;
    const ownerTasks = currentOwner ? currentOwner.tasksList : [];

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === transferTarget.id) {
          return {
            ...m,
            role: 'owner',
            assignedTasks: transferTaskOption === 'transfer' ? m.assignedTasks + ownerTasksCount : m.assignedTasks,
            completedTasks: transferTaskOption === 'transfer' ? m.completedTasks + ownerCompletedCount : m.completedTasks,
            tasksList: transferTaskOption === 'transfer' ? [...m.tasksList, ...ownerTasks] : m.tasksList,
          };
        }
        if (m.role === 'owner') {
          return {
            ...m,
            role: 'member',
            assignedTasks: transferTaskOption === 'transfer' ? 0 : m.assignedTasks,
            completedTasks: transferTaskOption === 'transfer' ? 0 : m.completedTasks,
            tasksList: transferTaskOption === 'transfer' ? [] : m.tasksList,
          };
        }
        return m;
      })
    );

    const taskDetails =
      transferTaskOption === 'transfer'
        ? `Bàn giao toàn bộ ${ownerTasksCount} đầu việc cho Trưởng nhóm mới.`
        : `Người bàn giao tiếp tục phụ trách ${ownerTasksCount} đầu việc với tư cách Thành viên.`;

    addAuditEntry(
      'Chuyển giao quyền Trưởng nhóm',
      transferTarget.name,
      `Bàn giao quyền điều phối chính workspace. ${taskDetails}`
    );

    showNotice(`Đã chuyển giao vai trò Trưởng nhóm cho ${transferTarget.name}. Bạn hiện là Thành viên.`);
    setTransferTarget(null);
    setTransferConfirmed(false);
  };

  // 6. Loại thành viên khỏi nhóm kèm tái phân bổ đầu việc
  const handleExecuteKickMember = () => {
    if (!kickTarget) return;

    const tasksToHandle = kickTarget.assignedTasks;
    const completedToHandle = kickTarget.completedTasks;
    const memberTasks = kickTarget.tasksList;
    let detailsText = '';

    if (kickReassignOption === 'reassign' && kickReassignMemberId) {
      const receiver = members.find((m) => m.id === kickReassignMemberId);
      const receiverName = receiver ? receiver.name : 'thành viên khác';

      setMembers((prev) =>
        prev
          .filter((m) => m.id !== kickTarget.id)
          .map((m) => {
            if (m.id === kickReassignMemberId) {
              return {
                ...m,
                assignedTasks: m.assignedTasks + tasksToHandle,
                completedTasks: m.completedTasks + completedToHandle,
                tasksList: [...m.tasksList, ...memberTasks],
              };
            }
            return m;
          })
      );
      detailsText = `Chuyển giao ${tasksToHandle} đầu việc dang dở cho ${receiverName}.`;
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== kickTarget.id));
      detailsText = `Đưa ${tasksToHandle} đầu việc về trạng thái 'Chờ phân công'.`;
    }

    if (kickReason.trim()) {
      detailsText += ` Lý do: ${kickReason.trim()}`;
    }

    addAuditEntry('Loại khỏi nhóm', kickTarget.name, detailsText);
    showNotice(`Đã đưa ${kickTarget.name} ra khỏi nhóm và xử lý an toàn ${tasksToHandle} công việc.`);
    setKickTarget(null);
  };

  // 7. Nhắc việc 1-click
  const handleSendReminder = (member: GroupMemberItem) => {
    const pendingCount = member.assignedTasks - member.completedTasks;
    showNotice(`Đã gửi thông báo nhắc hạn ${pendingCount} công việc đến ${member.name} (${member.email}).`, 'info');
    addAuditEntry('Nhắc tiến độ công việc', member.name, `Gửi thông báo đôn đốc hoàn thành ${pendingCount} đầu việc chưa xong.`);
  };

  // 8. Xuất báo cáo nhân sự & tiến độ đồ án
  const handleExportSummary = () => {
    const report = [
      `# BÁO CÁO NHÂN SỰ & TIẾN ĐỘ WORKSPACE`,
      `Nhóm: Nhóm 01 - AI & Data Platform • Lớp: CS101`,
      `Sĩ số: ${members.length}/${MAX_CAPACITY} thành viên`,
      `Tiến độ chung: ${completedTasks}/${totalTasks} đầu việc hoàn thành (${progressPercent}%)`,
      `---`,
      `DANH SÁCH THÀNH VIÊN:`,
      ...members.map(
        (m, idx) =>
          `${idx + 1}. ${m.name} (${m.role === 'owner' ? 'Trưởng nhóm' : 'Thành viên'}) - MSSV: ${m.studentCode} | Tiến độ: ${m.completedTasks}/${m.assignedTasks} việc (${m.email})`
      ),
      `---`,
      `Trạng thái tuyển quân: ${requests.length} đơn chờ duyệt, ${outgoingInvites.length} lời mời đang chờ phản hồi.`,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      showNotice('Đã sao chép báo cáo nhân sự & tiến độ nhóm vào Clipboard!');
    } else {
      showNotice('Không hỗ trợ Clipboard tự động trên môi trường này.', 'info');
    }
  };

  return (
    <div className="tab06-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      <style>{`
        .tab06-root .btn-primary {
          background-color: var(--text-primary) !important;
          color: var(--bg-app) !important;
          border: 1px solid var(--text-primary) !important;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 160ms ease, opacity 160ms ease;
        }
        .tab06-root .btn-primary:hover:not(:disabled) {
          background-color: #27272a !important;
          border-color: #27272a !important;
        }
        .tab06-root .btn-primary:disabled {
          opacity: 0.55 !important;
          cursor: not-allowed !important;
        }
        .tab06-root .btn-primary:focus-visible {
          outline: 2px solid var(--text-primary) !important;
          outline-offset: 2px !important;
        }
        .tab06-root .btn-outline {
          background-color: var(--surface-card) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-divider) !important;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 160ms ease, border-color 160ms ease;
        }
        .tab06-root .btn-outline:hover:not(:disabled) {
          background-color: var(--surface-hover) !important;
          border-color: var(--text-secondary) !important;
        }
        .tab06-root .btn-outline:disabled {
          opacity: 0.55 !important;
          cursor: not-allowed !important;
        }
        .tab06-root .btn-outline:focus-visible {
          outline: 2px solid var(--text-primary) !important;
          outline-offset: 2px !important;
        }
        .tab06-root .tab06-icon-btn:hover {
          color: var(--text-primary) !important;
        }
        .tab06-root .tab06-icon-btn:focus-visible {
          outline: 2px solid var(--text-primary) !important;
          outline-offset: 2px !important;
          border-radius: 4px;
        }
      `}</style>
      {/* ====================================================================
          1. FEEDBACK BANNER (ACCESSIBLE TOAST)
          ==================================================================== */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            padding: '12px 18px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {feedback.type === 'warn' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
            <span style={{ fontWeight: 500 }}>{feedback.message}</span>
          </div>
          <button
            type="button"
            className="tab06-icon-btn"
            onClick={() => setFeedback(null)}
            aria-label="Đóng thông báo"
            title="Đóng"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ====================================================================
          2. HEADER HERO CARD: CONTEXT & QUICK ACTIONS
          ==================================================================== */}
      <header
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '10px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Quản trị Thành viên: Nhóm 01 - AI & Data
            </h1>
            <span
              data-spec="PER-03"
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Quyền Trưởng nhóm chính quản trị không gian làm việc"
            >
              <Crown size={13} /> Trưởng nhóm
            </span>
            <span
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              Lớp CS101 • Học kỳ 1
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Điều phối workspace nhóm độc lập • Sĩ số hiện tại:{' '}
            <strong data-spec="CLS-06" style={{ color: 'var(--text-primary)' }}>{members.length}/{MAX_CAPACITY} thành viên</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleExportSummary}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Sao chép báo cáo nhân sự và tiến độ nhóm vào Clipboard"
          >
            <Copy size={14} />
            <span>Xuất báo cáo</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowInviteModal(true)}
            disabled={isFull}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isFull ? 0.6 : 1,
              cursor: isFull ? 'not-allowed' : 'pointer',
            }}
            title={isFull ? 'Nhóm đã đạt sĩ số tối đa 5 người' : 'Mời sinh viên trong lớp CS101 vào nhóm'}
          >
            <UserPlus size={15} />
            <span>Mời bạn cùng lớp</span>
          </button>
        </div>
      </header>

      {/* ====================================================================
          3. BENTO GRID METRICS (SĨ SỐ / TIẾN ĐỘ / HÀNG CHỜ PHÊ DUYỆT)
          ==================================================================== */}
      <section
        aria-label="Chỉ số tổng quan nhân sự và tiến độ"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Metric 1: Sĩ số & Giới hạn Quota */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              data-spec="CLS-06"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Sĩ số nhóm
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {members.length}/{MAX_CAPACITY}
            </span>
          </div>

          <div>
            <div style={{ height: '7px', width: '100%', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${quotaPercent}%`,
                  background: 'var(--text-primary)',
                  borderRadius: '4px',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 500 }}>{quotaPercent}% định mức</span>
              <span data-spec="CLS-11" style={{ fontWeight: 500, color: isFull ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {isFull ? 'Đã đủ thành viên' : `Còn ${MAX_CAPACITY - members.length} chỗ trống`}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Phân bổ & Tiến độ Công việc */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Điều phối Đồ án
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {completedTasks}/{totalTasks} việc xong
            </span>
          </div>

          <div>
            <div style={{ height: '7px', width: '100%', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'var(--text-primary)',
                  borderRadius: '4px',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 500 }}>{progressPercent}% hoàn thành</span>
              <span style={{ fontWeight: 500 }}>{totalTasks} đầu việc đã giao</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Hàng chờ Tuyển dụng & Lời mời */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              data-spec="PER-04"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Hàng chờ Phê duyệt
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                background: requests.length > 0 ? 'var(--text-primary)' : 'var(--surface-hover)',
                color: requests.length > 0 ? 'var(--bg-app)' : 'var(--text-primary)',
                border: requests.length > 0 ? '1px solid var(--text-primary)' : '1px solid var(--border-divider)',
              }}
            >
              {requests.length} đơn chờ
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Lời mời đang chờ: <strong style={{ color: 'var(--text-primary)' }}>{outgoingInvites.length}</strong></span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', padding: '2px 10px', height: '26px' }}
              onClick={() => setActiveSegment('requests')}
              title="Chuyển đến tab Đơn xin vào & Lời mời để phê duyệt"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SEGMENTED NAVIGATION TABS (WCAG TABS PATTERN)
          ==================================================================== */}
      <div
        role="tablist"
        aria-label="Phân loại dữ liệu quản trị thành viên"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-divider)',
          gap: '8px',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSegment === 'members'}
          onClick={() => setActiveSegment('members')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSegment === 'members' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeSegment === 'members' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeSegment === 'members' ? 600 : 500,
            padding: '10px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} />
          <span>Thành viên chính thức ({members.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSegment === 'requests'}
          onClick={() => setActiveSegment('requests')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSegment === 'requests' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeSegment === 'requests' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeSegment === 'requests' ? 600 : 500,
            padding: '10px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ListFilter size={16} />
          <span>Đơn xin vào & Lời mời</span>
          {(requests.length > 0 || outgoingInvites.length > 0) && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '10px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {requests.length + outgoingInvites.length}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSegment === 'logs'}
          onClick={() => setActiveSegment('logs')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSegment === 'logs' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeSegment === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeSegment === 'logs' ? 600 : 500,
            padding: '10px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <History size={16} />
          <span>Nhật ký nhân sự ({auditLogs.length})</span>
        </button>
      </div>

      {/* ====================================================================
          5. TAB PANELS CONTENT
          ==================================================================== */}

      {/* TAB 1: DANH SÁCH THÀNH VIÊN CHÍNH THỨC */}
      {activeSegment === 'members' && (
        <section
          aria-label="Danh sách thành viên chính thức"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Table Toolbar */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Tìm theo họ tên, MSSV hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filteredMembers.length}</strong> / {members.length} thành viên
            </div>
          </div>

          {/* Members Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Thành viên</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vai trò</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ngày vào</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tiến độ công việc</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Không tìm thấy thành viên nào khớp với từ khóa "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const taskPct = m.assignedTasks > 0 ? Math.round((m.completedTasks / m.assignedTasks) * 100) : 0;
                    const isCurrentUser = m.role === 'owner';

                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: '1px solid var(--border-divider)',
                          background: isCurrentUser ? 'var(--surface-hover)' : 'transparent',
                          borderLeft: isCurrentUser ? '4px solid var(--text-primary)' : '4px solid transparent',
                          transition: 'background 160ms ease',
                        }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: isCurrentUser ? 'var(--text-primary)' : 'var(--surface-hover)',
                                border: '1px solid var(--border-divider)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '13px',
                                color: isCurrentUser ? 'var(--bg-app)' : 'var(--text-primary)',
                              }}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{m.name}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>({m.studentCode})</span>
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {m.role === 'owner' ? (
                            <span
                              data-spec="PER-03"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: 'var(--surface-card)',
                                border: '1px solid var(--border-divider)',
                                fontWeight: 600,
                                fontSize: '12px',
                                color: 'var(--text-primary)',
                              }}
                              title="Trưởng nhóm và chủ workspace nhóm"
                            >
                              <Crown size={12} /> Trưởng nhóm
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                              Thành viên
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          {m.joinedAt}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div
                            style={{ minWidth: '140px', cursor: 'pointer' }}
                            onClick={() => setSelectedMemberForTasks(m)}
                            title="Bấm để xem danh sách đầu việc chi tiết của thành viên này"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                {m.completedTasks}/{m.assignedTasks} việc
                                <ChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                              </span>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{taskPct}%</span>
                            </div>
                            <div style={{ height: '5px', width: '100%', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${taskPct}%`, background: 'var(--text-primary)', borderRadius: '3px' }} />
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {!isCurrentUser ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {m.assignedTasks > m.completedTasks && (
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ fontSize: '12px', padding: '3px 8px', height: '28px' }}
                                  title="Gửi thông báo đôn đốc tiến độ công việc"
                                  onClick={() => handleSendReminder(m)}
                                >
                                  <Bell size={13} style={{ marginRight: '4px' }} />
                                  <span>Nhắc việc</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '12px', padding: '3px 8px', height: '28px' }}
                                title="Bàn giao quyền Trưởng nhóm"
                                onClick={() => setTransferTarget(m)}
                              >
                                <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
                                <span>Chuyển quyền</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '12px', padding: '3px 8px', height: '28px', color: 'var(--text-primary)' }}
                                title="Loại khỏi nhóm kèm biên bản bàn giao công việc"
                                onClick={() => setKickTarget(m)}
                              >
                                <UserMinus size={13} style={{ marginRight: '4px' }} />
                                <span>Loại</span>
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: 500 }}>
                              Tài khoản của bạn
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: ĐƠN XIN GIA NHẬP & LỜI MỜI ĐÃ GỬI */}
      {activeSegment === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 2A: Đơn xin gia nhập chờ duyệt */}
          <section
            aria-label="Đơn xin gia nhập chờ duyệt"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 data-spec="PER-04" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Đơn xin gia nhập nhóm chờ duyệt
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Sinh viên cùng lớp CS101 chủ động gửi yêu cầu tham gia workspace
                </p>
              </div>

              {isFull && (
                <span
                  data-spec="CLS-11"
                  style={{
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                  title="Nhóm đã đạt sĩ số tối đa"
                >
                  Khóa duyệt: Nhóm đã đủ sĩ số tối đa
                </span>
              )}
            </div>

            {requests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: '6px', fontSize: '13px' }}>
                Hiện không có đơn xin gia nhập nào đang chờ duyệt.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '14px 16px',
                      background: 'var(--surface-hover)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-divider)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {req.name} <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>({req.studentCode})</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {req.email} • Gửi yêu cầu {req.requestedAt}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isFull}
                          onClick={() => handleApproveRequest(req)}
                          style={{
                            padding: '4px 14px',
                            height: '28px',
                            fontSize: '12px',
                            opacity: isFull ? 0.6 : 1,
                            cursor: isFull ? 'not-allowed' : 'pointer',
                          }}
                          title={isFull ? 'Nhóm đã đủ sĩ số tối đa' : 'Phê duyệt sinh viên vào nhóm'}
                        >
                          Duyệt vào nhóm
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleRejectRequest(req)}
                          style={{ padding: '4px 12px', height: '28px', fontSize: '12px' }}
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>

                    {req.message && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          background: 'var(--surface-card)',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-divider)',
                          fontStyle: 'italic',
                        }}
                      >
                        "{req.message}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2B: Lời mời đã gửi đang chờ phản hồi */}
          <section
            aria-label="Lời mời đã phát đi"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h2 data-spec="STR-07" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Lời mời nhóm đã gửi
            </h2>

            {outgoingInvites.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: '6px', fontSize: '13px' }}>
                Không có lời mời nào đang chờ phản hồi.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {outgoingInvites.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--surface-hover)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-divider)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {inv.email} • Gửi lúc {inv.sentAt}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleCancelInvite(inv)}
                      style={{ fontSize: '12px', padding: '3px 10px', height: '28px' }}
                    >
                      Thu hồi lời mời
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: NHẬT KÝ BIẾN ĐỘNG NHÂN SỰ */}
      {activeSegment === 'logs' && (
        <section
          aria-label="Nhật ký biến động nhân sự"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 data-spec="PER-08,STR-10" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Nhật ký Quản trị & Điều chuyển Nhân sự
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Lịch sử minh bạch ghi nhận các thao tác phân quyền, duyệt và bàn giao trong nhóm
              </p>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{auditLogs.length} sự kiện</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'var(--surface-hover)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                  fontSize: '13px',
                }}
              >
                <Clock size={16} style={{ color: 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong>Người thực hiện:</strong> {log.actor} • <strong>Đối tượng:</strong> {log.target}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px' }}>{log.details}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          DRAWER: CHI TIẾT CÔNG VIỆC THÀNH VIÊN
          ==================================================================== */}
      {selectedMemberForTasks && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-tasks-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMemberForTasks(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              height: '100%',
              background: 'var(--surface-card)',
              borderLeft: '1px solid var(--border-divider)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={18} style={{ color: 'var(--text-primary)' }} />
                  <h2 id="drawer-tasks-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Phân công Công việc
                  </h2>
                </div>
                <button
                  type="button"
                  className="tab06-icon-btn"
                  onClick={() => setSelectedMemberForTasks(null)}
                  aria-label="Đóng ngăn kéo"
                  title="Đóng (Phím Esc)"
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Member Brief Card */}
              <div
                style={{
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedMemberForTasks.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  MSSV: {selectedMemberForTasks.studentCode} • {selectedMemberForTasks.email}
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Tiến độ: {selectedMemberForTasks.completedTasks}/{selectedMemberForTasks.assignedTasks} việc hoàn thành
                </div>
              </div>

              {/* Tasks List */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Danh sách đầu việc cụ thể ({selectedMemberForTasks.tasksList.length}):
              </div>

              {selectedMemberForTasks.tasksList.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Thành viên này hiện chưa được phân công đầu việc nào.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                  {selectedMemberForTasks.tasksList.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        padding: '12px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-divider)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {task.title}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: task.status === 'done' ? 'var(--text-primary)' : 'var(--surface-hover)',
                            color: task.status === 'done' ? 'var(--bg-app)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.status === 'done' ? 'Xong' : 'Đang làm'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> Hạn: {task.deadline}
                        </span>
                        {task.priority === 'high' && (
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Quan trọng</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleSendReminder(selectedMemberForTasks)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Bell size={13} />
                <span>Nhắc tiến độ</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedMemberForTasks(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: MỜI BẠN CÙNG LỚP
          ==================================================================== */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-invite-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteModal(false);
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '10px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 id="modal-invite-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Mời Bạn Cùng Lớp CS101 Vào Nhóm
              </h2>
              <button
                type="button"
                className="tab06-icon-btn"
                onClick={() => setShowInviteModal(false)}
                aria-label="Đóng cửa sổ"
                title="Đóng"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p data-spec="STR-07" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Danh sách sinh viên trong lớp CS101 hiện chưa tham gia nhóm nào. Chọn sinh viên để phát lời mời tham gia workspace:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CLASSMATE_CANDIDATES.map((can) => {
                const isInvited = outgoingInvites.some((i) => i.email === can.email);
                const isAlreadyInGroup = members.some((m) => m.email === can.email) || can.hasGroup;

                return (
                  <div
                    key={can.id}
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
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {can.name} <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>({can.studentCode})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{can.email}</div>
                    </div>

                    <div>
                      {isAlreadyInGroup ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: 500 }}>
                          Đã có nhóm
                        </span>
                      ) : isInvited ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Đã gửi lời mời</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: '12px',
                            padding: '4px 10px',
                            height: '28px',
                            opacity: isFull ? 0.6 : 1,
                            cursor: isFull ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => handleSendInviteToCandidate(can)}
                          disabled={isFull}
                          title={isFull ? 'Nhóm đã đạt sĩ số tối đa 5 người' : 'Gửi lời mời tham gia nhóm'}
                          aria-disabled={isFull}
                        >
                          Gửi lời mời
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-divider)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowInviteModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: BÀN GIAO QUYỀN TRƯỞNG NHÓM
          ==================================================================== */}
      {transferTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-transfer-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setTransferTarget(null);
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '10px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 id="modal-transfer-title" data-spec="STR-10" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Bàn Giao Quyền Trưởng Nhóm
              </h2>
              <button
                type="button"
                className="tab06-icon-btn"
                onClick={() => setTransferTarget(null)}
                aria-label="Đóng"
                title="Đóng"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Bạn đang chuyển giao quyền Trưởng nhóm chính cho{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{transferTarget.name}</strong>. Sau khi hoàn tất, bạn sẽ trở thành
              Thành viên thường trong nhóm.
            </p>

            {/* Task handling options for outgoing owner */}
            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Xử lý 4 đầu việc bạn đang phụ trách:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="transferOption"
                    value="transfer"
                    checked={transferTaskOption === 'transfer'}
                    onChange={() => setTransferTaskOption('transfer')}
                  />
                  <span>Chuyển giao toàn bộ 4 việc cho Trưởng nhóm mới</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="transferOption"
                    value="keep"
                    checked={transferTaskOption === 'keep'}
                    onChange={() => setTransferTaskOption('keep')}
                  />
                  <span>Tiếp tục giữ làm 4 việc với tư cách Thành viên</span>
                </label>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={transferConfirmed}
                onChange={(e) => setTransferConfirmed(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span data-spec="STR-10" style={{ fontWeight: 500 }}>
                Tôi xác nhận và chấp thuận biên bản bàn giao vai trò Trưởng nhóm.
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setTransferTarget(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!transferConfirmed}
                onClick={handleExecuteTransferOwnership}
                style={{ opacity: !transferConfirmed ? 0.6 : 1, cursor: !transferConfirmed ? 'not-allowed' : 'pointer' }}
              >
                Xác nhận bàn giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: LOẠI THÀNH VIÊN KHỎI NHÓM & TÁI PHÂN BỔ TASK
          ==================================================================== */}
      {kickTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-kick-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setKickTarget(null);
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '10px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 id="modal-kick-title" data-spec="STR-09,CLS-15" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Biên Bản Đưa Thành Viên Khỏi Nhóm
              </h2>
              <button
                type="button"
                className="tab06-icon-btn"
                onClick={() => setKickTarget(null)}
                aria-label="Đóng"
                title="Đóng"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Bạn đang chuẩn bị đưa <strong style={{ color: 'var(--text-primary)' }}>{kickTarget.name}</strong> ra khỏi nhóm.
              Thành viên này hiện đang phụ trách{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{kickTarget.assignedTasks} công việc</strong>.
            </p>

            {/* Task Reassignment Section */}
            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div data-spec="CLS-15" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Phương án xử lý {kickTarget.assignedTasks} công việc (Bắt buộc):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kickOption"
                    value="reassign"
                    checked={kickReassignOption === 'reassign'}
                    onChange={() => setKickReassignOption('reassign')}
                  />
                  <span>Chuyển giao cho thành viên khác trong nhóm</span>
                </label>

                {kickReassignOption === 'reassign' && (
                  <div style={{ paddingLeft: '24px' }}>
                    <select
                      value={kickReassignMemberId}
                      onChange={(e) => setKickReassignMemberId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-divider)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                      }}
                    >
                      {members
                        .filter((m) => m.id !== kickTarget.id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.assignedTasks} việc hiện có)
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kickOption"
                    value="unassign"
                    checked={kickReassignOption === 'unassign'}
                    onChange={() => setKickReassignOption('unassign')}
                  />
                  <span data-spec="TASK-14">Đưa về trạng thái Chưa phân công (Unassigned)</span>
                </label>
              </div>
            </div>

            {/* Reason input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                Lý do đưa ra khỏi nhóm (Ghi nhận vào Nhật ký nhân sự):
              </label>
              <input
                type="text"
                placeholder="vd: Chuyển nhóm theo nguyện vọng, không tham gia họp..."
                value={kickReason}
                onChange={(e) => setKickReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setKickTarget(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleExecuteKickMember}
              >
                Xác nhận loại khỏi nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
