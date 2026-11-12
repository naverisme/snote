import React, { useState } from 'react';
import {
  Crown,
  Users,
  LogOut,
  AlertCircle,
  Check,
  CheckSquare,
  Clock,
  Send,
  X,
  ArrowRightLeft,
  Calendar,
  Layers,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  specialty: string;
  status: 'online' | 'offline';
  completedTasks: number;
  totalTasks: number;
}

interface TaskItem {
  id: string;
  title: string;
  assigneeId: string;
  deadline: string;
  checklistDone: number;
  checklistTotal: number;
  status: 'in_progress' | 'completed' | 'pending';
}

interface MilestoneItem {
  id: string;
  title: string;
  statusText: string;
  submittedVersion?: string;
  deadline: string;
  isCompleted: boolean;
}

const INITIAL_MEMBERS: MemberItem[] = [
  {
    id: 'u-lead-01',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@student.edu.vn',
    role: 'owner',
    specialty: 'Kiến trúc hệ thống & Quản trị Workspace',
    status: 'online',
    completedTasks: 1,
    totalTasks: 1,
  },
  {
    id: 'u-mem-02',
    name: 'Trần Thị Mai (Bạn)',
    email: 'mai.tran@student.edu.vn',
    role: 'member',
    specialty: 'Thiết kế CSDL & Backend API',
    status: 'online',
    completedTasks: 0,
    totalTasks: 3,
  },
  {
    id: 'u-mem-03',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@student.edu.vn',
    role: 'member',
    specialty: 'Frontend UI/UX & Tối ưu hóa Web',
    status: 'offline',
    completedTasks: 0,
    totalTasks: 1,
  },
  {
    id: 'u-mem-04',
    name: 'Phạm Quỳnh Anh',
    email: 'quynhanh.pham@student.edu.vn',
    role: 'member',
    specialty: 'Kiểm thử chất lượng & Tài liệu kỹ thuật',
    status: 'offline',
    completedTasks: 1,
    totalTasks: 1,
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TASK-01',
    title: 'Thiết kế lược đồ CSDL & Kịch bản Migration v2',
    assigneeId: 'u-mem-02',
    deadline: '12/11/2026',
    checklistDone: 2,
    checklistTotal: 3,
    status: 'in_progress',
  },
  {
    id: 'TASK-02',
    title: 'Đặc tả ranh giới module & Kiến trúc phân rã hệ thống',
    assigneeId: 'u-lead-01',
    deadline: '08/11/2026',
    checklistDone: 4,
    checklistTotal: 4,
    status: 'completed',
  },
  {
    id: 'TASK-03',
    title: 'Tích hợp giao diện Preview & Mock State tự thân',
    assigneeId: 'u-mem-02',
    deadline: '15/11/2026',
    checklistDone: 1,
    checklistTotal: 3,
    status: 'in_progress',
  },
  {
    id: 'TASK-04',
    title: 'Kiểm thử khả năng tiếp cận WCAG AA & Phân cấp Headings',
    assigneeId: 'u-mem-03',
    deadline: '16/11/2026',
    checklistDone: 1,
    checklistTotal: 2,
    status: 'in_progress',
  },
  {
    id: 'TASK-05',
    title: 'Biên soạn hồ sơ kỹ thuật & Kịch bản nghiệm thu đồ án',
    assigneeId: 'u-mem-02',
    deadline: '20/11/2026',
    checklistDone: 0,
    checklistTotal: 2,
    status: 'pending',
  },
  {
    id: 'TASK-06',
    title: 'Tối ưu hóa hệ thống Tokens & Quy chuẩn Đơn sắc Monochrome',
    assigneeId: 'u-mem-04',
    deadline: '09/11/2026',
    checklistDone: 3,
    checklistTotal: 3,
    status: 'completed',
  },
];

const MILESTONES: MilestoneItem[] = [
  {
    id: 'MS-01',
    title: 'Cột mốc 1: Đề cương đề tài & Kiến trúc tổng thể',
    statusText: 'Đã nộp đúng hạn',
    submittedVersion: 'Bản nộp v1 (Chính thức)',
    deadline: '28/10/2026',
    isCompleted: true,
  },
  {
    id: 'MS-02',
    title: 'Cột mốc 2: Báo cáo giữa kỳ & Bản mẫu giao diện',
    statusText: 'Đang triển khai',
    deadline: '18/11/2026',
    isCompleted: false,
  },
  {
    id: 'MS-03',
    title: 'Cột mốc 3: Báo cáo cuối kỳ & Nghiệm thu mã nguồn',
    statusText: 'Chưa mở nộp',
    deadline: '05/12/2026',
    isCompleted: false,
  },
];

export const Tab07GroupMembersStudent: React.FC = () => {
  const [members, setMembers] = useState<MemberItem[]>(INITIAL_MEMBERS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'roster' | 'tasks' | 'milestones'>('roster');
  const [taskFilter, setTaskFilter] = useState<'all' | 'mine' | 'in_progress' | 'completed'>('mine');
  
  // Handover & Leave state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [handoverRecipientId, setHandoverRecipientId] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  
  // Quick ping leader state
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingSubject, setPingSubject] = useState('');
  const [pingMessage, setPingMessage] = useState('');
  
  // Toast notifications
  const [notice, setNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const lead = members.find(m => m.role === 'owner');
  const myMemberId = 'u-mem-02';
  const myTasks = tasks.filter(t => t.assigneeId === myMemberId);
  const myPendingTasksCount = myTasks.filter(t => t.status !== 'completed').length;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'mine') return t.assigneeId === myMemberId;
    if (taskFilter === 'in_progress') return t.status === 'in_progress';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  // Calculate my checklist progress
  const myTotalChecklist = myTasks.reduce((sum, t) => sum + t.checklistTotal, 0);
  const myDoneChecklist = myTasks.reduce((sum, t) => sum + t.checklistDone, 0);
  const myProgressPercent = myTotalChecklist > 0 ? Math.round((myDoneChecklist / myTotalChecklist) * 100) : 0;

  // Handle Handover & Leave
  const handleConfirmLeave = () => {
    if (!handoverRecipientId && myPendingTasksCount > 0) return;

    const recipient = members.find(m => m.id === handoverRecipientId);
    const recipientName = recipient ? recipient.name : 'Trưởng nhóm';

    // Transfer all my tasks to recipient
    const updatedTasks = tasks.map(t => {
      if (t.assigneeId === myMemberId) {
        return { ...t, assigneeId: handoverRecipientId };
      }
      return t;
    });

    // Update member list
    const updatedMembers = members
      .filter(m => m.id !== myMemberId)
      .map(m => {
        if (m.id === handoverRecipientId) {
          return {
            ...m,
            totalTasks: m.totalTasks + myTasks.length,
          };
        }
        return m;
      });

    setTasks(updatedTasks);
    setMembers(updatedMembers);
    setHasLeftGroup(true);
    setShowLeaveModal(false);
    showToast(`Đã bàn giao ${myTasks.length} công việc cho ${recipientName} và rời nhóm thành công.`);
  };

  const handleSendPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingMessage.trim()) return;
    setShowPingModal(false);
    setPingSubject('');
    setPingMessage('');
    showToast(`Đã gửi tin nhắn trao đổi tới Trưởng nhóm (${lead?.name || 'Lê Hoàng Nam'}).`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Toast Alert */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-divider)',
            padding: '12px 16px',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* State Banner when user has left the group */}
      {hasLeftGroup && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Bạn đã hoàn tất bàn giao và rời khỏi nhóm này
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Toàn bộ đầu việc, tài liệu và lịch sử bài nộp đã được chuyển giao cho thành viên tiếp quản. Không gian hiện ở chế độ chỉ đọc.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.search = '?tab=4';
              }
            }}
          >
            <span>Xem danh bạ nhóm lớp</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Main Header / Context Hero */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                LỚP CS101 • HK1
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                Thành viên chính thức
              </span>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Nhóm 01 - AI & Data Platform
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Đề tài: Nền tảng phân tích dữ liệu lớn và thị giác máy tính • Không gian làm việc chung của nhóm
            </p>
          </div>

          {!hasLeftGroup && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'var(--border-divider)',
                color: 'var(--text-primary)',
              }}
              onClick={() => setShowLeaveModal(true)}
              title="Mở quy trình bàn giao công việc và rời khỏi nhóm"
            >
              <LogOut size={14} />
              <span>Rời khỏi nhóm</span>
            </button>
          )}
        </div>

        {/* Quick Workspace Navigation Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-divider)',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <span>Lối tắt không gian làm việc:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.search = '?tab=8';
                }}
              >
                <Layers size={12} style={{ marginRight: '4px' }} />
                <span>Tiến độ Gantt</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.search = '?tab=11';
                }}
              >
                <FileText size={12} style={{ marginRight: '4px' }} />
                <span>Thư viện tệp</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.search = '?tab=13';
                }}
              >
                <CheckSquare size={12} style={{ marginRight: '4px' }} />
                <span>Bài giao đồ án</span>
              </button>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)' }}>
            Sĩ số: <strong style={{ color: 'var(--text-primary)' }}>{members.length}/5 thành viên</strong>
          </div>
        </div>
      </div>

      {/* Bento Grid: 2 Columns (Leader Info & Your Status) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Card: Lead Information */}
        {lead && (
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Crown size={15} style={{ color: 'var(--text-primary)' }} />
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Trưởng nhóm phụ trách
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Điều phối & Đại diện nộp bài
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  LN
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lead.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {lead.email}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  padding: '8px 12px',
                  background: 'var(--surface-hover)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                }}
              >
                Chuyên môn: <strong style={{ color: 'var(--text-primary)' }}>{lead.specialty}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-divider)', paddingTop: '12px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                onClick={() => setShowPingModal(true)}
              >
                <MessageSquare size={13} />
                <span>Nhắn tin cho Trưởng nhóm</span>
              </button>
            </div>
          </div>
        )}

        {/* Right Card: Your Role & Assignment Status */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} style={{ color: 'var(--text-primary)' }} />
                <span
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  Trách nhiệm cá nhân của bạn
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                Đang trực tuyến
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                TM
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Trần Thị Mai (Bạn)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  mai.tran@student.edu.vn • Thành viên nhóm
                </div>
              </div>
            </div>

            {/* Checklist progress bar */}
            <div style={{ marginTop: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Tiến độ checklist cá nhân</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {myDoneChecklist}/{myTotalChecklist} mục ({myProgressPercent}%)
                </strong>
              </div>
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  background: 'var(--surface-hover)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-divider)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${myProgressPercent}%`,
                    background: 'var(--text-primary)',
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-divider)',
              paddingTop: '12px',
              fontSize: '12px',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              Đầu việc phụ trách: <strong style={{ color: 'var(--text-primary)' }}>{myTasks.length} nhiệm vụ</strong>
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
              onClick={() => {
                setActiveTab('tasks');
                setTaskFilter('mine');
              }}
            >
              <span>Xem chi tiết việc của tôi</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Roster vs Task Matrix vs Milestones */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-divider)',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'roster' ? '2px solid var(--text-primary)' : '2px solid transparent',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: activeTab === 'roster' ? 600 : 500,
            color: activeTab === 'roster' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Users size={15} />
          <span>Danh bạ thành viên ({members.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'tasks' ? '2px solid var(--text-primary)' : '2px solid transparent',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: activeTab === 'tasks' ? 600 : 500,
            color: activeTab === 'tasks' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckSquare size={15} />
          <span>Ma trận công việc đồ án ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'milestones' ? '2px solid var(--text-primary)' : '2px solid transparent',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: activeTab === 'milestones' ? 600 : 500,
            color: activeTab === 'milestones' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Calendar size={15} />
          <span>Tiến độ nộp bài đồ án ({MILESTONES.length})</span>
        </button>
      </div>

      {/* TAB 1: ROSTER VIEW */}
      {activeTab === 'roster' && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Danh sách thành viên chính thức
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Học sinh đang tham gia không gian làm việc nhóm
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                color: 'var(--text-secondary)',
              }}
            >
              Sĩ số: {members.length}/5
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)', background: 'var(--surface-hover)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 500 }}>Thành viên</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Vai trò</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Chuyên môn phụ trách</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Công việc được gán</th>
                <th style={{ padding: '12px 20px', fontWeight: 500, textAlign: 'right' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const isMe = m.id === myMemberId;
                const memberTasks = tasks.filter(t => t.assigneeId === m.id);
                const doneCount = memberTasks.filter(t => t.status === 'completed').length;
                const percent = memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 100;

                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid var(--border-divider)',
                      background: isMe ? 'var(--surface-hover)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--surface-card)',
                            border: isMe ? '1px solid var(--text-primary)' : '1px solid var(--border-divider)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: isMe ? 600 : 500, color: 'var(--text-primary)' }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {m.email}
                          </div>
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
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-divider)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <Crown size={11} /> Trưởng nhóm
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Thành viên
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {m.specialty}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {memberTasks.length} việc
                        </span>
                        <div
                          style={{
                            width: '60px',
                            height: '4px',
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-divider)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${percent}%`,
                              background: 'var(--text-primary)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {percent}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: m.status === 'online' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: m.status === 'online' ? 'var(--text-primary)' : 'var(--border-divider)',
                          }}
                        />
                        {m.status === 'online' ? 'Trực tuyến' : 'Vắng'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: TASKS MATRIX VIEW */}
      {activeTab === 'tasks' && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Lọc nhiệm vụ:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    height: '24px',
                    background: taskFilter === 'mine' ? 'var(--surface-hover)' : 'transparent',
                    borderColor: taskFilter === 'mine' ? 'var(--text-primary)' : 'var(--border-divider)',
                    fontWeight: taskFilter === 'mine' ? 600 : 400,
                  }}
                  onClick={() => setTaskFilter('mine')}
                >
                  Việc của tôi ({myTasks.length})
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    height: '24px',
                    background: taskFilter === 'all' ? 'var(--surface-hover)' : 'transparent',
                    borderColor: taskFilter === 'all' ? 'var(--text-primary)' : 'var(--border-divider)',
                    fontWeight: taskFilter === 'all' ? 600 : 400,
                  }}
                  onClick={() => setTaskFilter('all')}
                >
                  Tất cả ({tasks.length})
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    height: '24px',
                    background: taskFilter === 'in_progress' ? 'var(--surface-hover)' : 'transparent',
                    borderColor: taskFilter === 'in_progress' ? 'var(--text-primary)' : 'var(--border-divider)',
                    fontWeight: taskFilter === 'in_progress' ? 600 : 400,
                  }}
                  onClick={() => setTaskFilter('in_progress')}
                >
                  Đang thực hiện
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    height: '24px',
                    background: taskFilter === 'completed' ? 'var(--surface-hover)' : 'transparent',
                    borderColor: taskFilter === 'completed' ? 'var(--text-primary)' : 'var(--border-divider)',
                    fontWeight: taskFilter === 'completed' ? 600 : 400,
                  }}
                  onClick={() => setTaskFilter('completed')}
                >
                  Hoàn thành
                </button>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Hiển thị: <strong>{filteredTasks.length} nhiệm vụ</strong>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)', background: 'var(--surface-hover)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 500 }}>Nhiệm vụ đồ án</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Người phụ trách</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Hạn chót</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Checklist tiến độ</th>
                <th style={{ padding: '12px 20px', fontWeight: 500, textAlign: 'right' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => {
                const assignee = members.find(m => m.id === t.assigneeId);
                const isMyTask = t.assigneeId === myMemberId;

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid var(--border-divider)',
                      background: isMyTask ? 'var(--surface-hover)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {t.id}
                        </span>
                        <span style={{ fontWeight: isMyTask ? 600 : 500, color: 'var(--text-primary)' }}>
                          {t.title}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', color: isMyTask ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isMyTask ? 600 : 400 }}>
                        {assignee ? assignee.name : 'Chưa phân công'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {t.deadline}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        {t.checklistDone}/{t.checklistTotal} mục
                      </span>
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {t.status === 'completed' && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-divider)',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                          }}
                        >
                          Hoàn thành
                        </span>
                      )}
                      {t.status === 'in_progress' && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'var(--surface-hover)',
                            border: '1px solid var(--border-divider)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          Đang làm
                        </span>
                      )}
                      {t.status === 'pending' && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'transparent',
                            border: '1px solid var(--border-divider)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Chờ thực hiện
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MILESTONES VIEW */}
      {activeTab === 'milestones' && (
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
              Tiến độ nộp bài đồ án của nhóm
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Theo dõi tình trạng nộp bài các mốc đánh giá chung của toàn nhóm
            </div>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MILESTONES.map((ms, idx) => (
              <div
                key={ms.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--surface-hover)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {ms.title}
                    </strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Hạn nộp: {ms.deadline} {ms.submittedVersion ? `• ${ms.submittedVersion}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: ms.isCompleted ? 'var(--surface-card)' : 'transparent',
                      border: '1px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontWeight: ms.isCompleted ? 600 : 400,
                    }}
                  >
                    {ms.statusText}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', height: '26px' }}
                    onClick={() => {
                      if (typeof window !== 'undefined') window.location.search = '?tab=13';
                    }}
                  >
                    <span>Xem bài nộp</span>
                    <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: BÀN GIAO TRÁCH NHIỆM & RỜI KHỎI NHÓM */}
      {showLeaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-divider)',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightLeft size={18} style={{ color: 'var(--text-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Bàn giao trách nhiệm & Rời khỏi nhóm
                </h3>
              </div>
              <button
                type="button"
                aria-label="Đóng cửa sổ"
                onClick={() => setShowLeaveModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Bạn hiện đang phụ trách <strong style={{ color: 'var(--text-primary)' }}>{myPendingTasksCount} công việc chưa hoàn thành</strong> trong nhóm. Toàn bộ tài liệu, ghi chú và lịch sử đóng góp sẽ được lưu lại nhóm. Bạn bắt buộc phải chọn thành viên tiếp nhận bàn giao trước khi rời đi.
            </div>

            {/* List of tasks to handover */}
            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Các công việc cần bàn giao:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {myTasks.map(t => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>• {t.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Hạn: {t.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Select handover recipient */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="recipient-select"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Chọn thành viên tiếp nhận bàn giao: <span style={{ color: 'var(--text-primary)' }}>*</span>
              </label>
              <select
                id="recipient-select"
                value={handoverRecipientId}
                onChange={e => setHandoverRecipientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="">-- Chọn thành viên tiếp nhận --</option>
                {members
                  .filter(m => m.id !== myMemberId)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.role === 'owner' ? '(Trưởng nhóm)' : '(Thành viên)'}
                    </option>
                  ))}
              </select>
            </div>

            {/* Handover notes */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="handover-notes"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Ghi chú chuyển giao công việc:
              </label>
              <textarea
                id="handover-notes"
                rows={3}
                placeholder="Ví dụ: Đã hoàn tất 2/3 lược đồ CSDL, tài liệu đang lưu trong Thư viện chung..."
                value={handoverNotes}
                onChange={e => setHandoverNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  resize: 'vertical',
                }}
              />
            </div>

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
                disabled={!handoverRecipientId && myPendingTasksCount > 0}
                style={{
                  opacity: (!handoverRecipientId && myPendingTasksCount > 0) ? 0.5 : 1,
                  cursor: (!handoverRecipientId && myPendingTasksCount > 0) ? 'not-allowed' : 'pointer',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  borderColor: 'var(--text-primary)',
                  fontWeight: 600,
                }}
                onClick={handleConfirmLeave}
              >
                Xác nhận bàn giao & Rời nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NHẮN TIN / YÊU CẦU HỖ TRỢ TRƯỞNG NHÓM (QUICK PING) */}
      {showPingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-divider)',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: 'var(--text-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Nhắn tin cho Trưởng nhóm ({lead?.name})
                </h3>
              </div>
              <button
                type="button"
                aria-label="Đóng cửa sổ"
                onClick={() => setShowPingModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendPing}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  htmlFor="ping-subject"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}
                >
                  Chủ đề trao đổi:
                </label>
                <input
                  id="ping-subject"
                  type="text"
                  placeholder="Ví dụ: Đề xuất gia hạn TASK-01 hoặc cần hỗ trợ API"
                  value={pingSubject}
                  onChange={e => setPingSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="ping-message"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}
                >
                  Nội dung tin nhắn: <span style={{ color: 'var(--text-primary)' }}>*</span>
                </label>
                <textarea
                  id="ping-message"
                  rows={4}
                  required
                  placeholder="Nhập nội dung cần hỗ trợ hoặc đề xuất điều phối..."
                  value={pingMessage}
                  onChange={e => setPingMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowPingModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    borderColor: 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  <Send size={13} />
                  <span>Gửi tin nhắn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
