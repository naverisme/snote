import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  Archive,
  Check,
  Search,
  Pencil,
  RotateCcw,
  AlertCircle,
  FileText,
  X,
  Layers,
  HelpCircle,
  Lock,
  Unlock,
  LayoutGrid,
  List,
  Bell,
  UserPlus,
} from 'lucide-react';

export interface GroupCardItem {
  id: string;
  name: string;
  description: string;
  leadName: string;
  memberCount: number;
  maxMembers: number;
  submittedCount: number;
  totalAssignments: number;
  isArchived: boolean;
  createdAt: string;
}

const INITIAL_GROUPS: GroupCardItem[] = [
  {
    id: 'g-01',
    name: 'Nhóm 01 - AI & Data Platform',
    description: 'Nghiên cứu kiến trúc RAG nâng cao, Vector Database và LLM Orchestration',
    leadName: 'Lê Hoàng Nam',
    memberCount: 4,
    maxMembers: 5,
    submittedCount: 3,
    totalAssignments: 4,
    isArchived: false,
    createdAt: '01/09/2026',
  },
  {
    id: 'g-02',
    name: 'Nhóm 02 - Web Collaboration Engine',
    description: 'Phát triển hạ tầng cộng tác thời gian thực, CRDT và HMR canvas',
    leadName: 'Phạm Quỳnh Anh',
    memberCount: 5,
    maxMembers: 5,
    submittedCount: 4,
    totalAssignments: 4,
    isArchived: false,
    createdAt: '02/09/2026',
  },
  {
    id: 'g-03',
    name: 'Nhóm 03 - Cloud Microservices',
    description: 'Thiết kế hệ thống phân tán, container orchestration và API gateway',
    leadName: 'Vũ Đức Thịnh',
    memberCount: 3,
    maxMembers: 5,
    submittedCount: 2,
    totalAssignments: 4,
    isArchived: false,
    createdAt: '03/09/2026',
  },
  {
    id: 'g-04',
    name: 'Nhóm 04 - Mobile Native Client',
    description: 'Ứng dụng di động bản địa cho học sinh và giáo viên kiểm tra lịch trình',
    leadName: 'Đỗ Quốc Bảo',
    memberCount: 2,
    maxMembers: 5,
    submittedCount: 1,
    totalAssignments: 4,
    isArchived: false,
    createdAt: '04/09/2026',
  },
  {
    id: 'g-05',
    name: 'Nhóm 05 - Embedded Systems (Lưu trữ)',
    description: 'Dự án phân đoạn 1 đã hoàn tất chỉ tiêu môn học và lưu trữ hồ sơ',
    leadName: 'Trần Văn Minh',
    memberCount: 3,
    maxMembers: 5,
    submittedCount: 4,
    totalAssignments: 4,
    isArchived: true,
    createdAt: '28/08/2026',
  },
];

const INITIAL_UNASSIGNED_STUDENTS = [
  'Nguyễn Thành Đạt (dat.nguyen@student.edu.vn)',
  'Trần Thu Hương (huong.tran@student.edu.vn)',
  'Hoàng Minh Triết (triet.hoang@student.edu.vn)',
  'Lê Thị Bích (bich.le@student.edu.vn)',
];

/**
 * SpecInfoCode: Micro-badge đạt chuẩn WCAG AA (Tương phản cao >= 4.5:1)
 * Hỗ trợ chế độ Inverted khi đặt trong header tối và Tooltip giải thích quy chuẩn SNOTE v2
 */
const SpecInfoCode: React.FC<{
  code: string;
  title: string;
  explanation: string;
  inverted?: boolean;
  visible?: boolean;
}> = ({ code, title, explanation, inverted = false, visible = true }) => {
  const [open, setOpen] = useState(false);

  if (!visible) return null;

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          background: inverted ? 'rgba(255, 255, 255, 0.16)' : 'var(--surface-hover)',
          border: inverted ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid var(--border-divider)',
          padding: '2px 6px',
          borderRadius: '4px',
          cursor: 'help',
          color: inverted ? 'var(--bg-app)' : 'var(--text-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '1.2',
        }}
        aria-label={`Giải thích quy tắc ${code}`}
      >
        <span>({code})</span>
        <HelpCircle size={12} aria-hidden="true" />
      </button>

      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '12px',
            lineHeight: '1.45',
            color: 'var(--text-primary)',
            width: '260px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            zIndex: 1000,
            pointerEvents: 'none',
            textAlign: 'left',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>
            {code}: {title}
          </strong>
          <span style={{ color: 'var(--text-secondary)' }}>{explanation}</span>
        </span>
      )}
    </span>
  );
};

export const Tab03ClassGroupsAdmin: React.FC = () => {
  const [groups, setGroups] = useState<GroupCardItem[]>(INITIAL_GROUPS);
  const [unassignedStudents, setUnassignedStudents] = useState<string[]>(INITIAL_UNASSIGNED_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs-attention' | 'available' | 'full' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGroupsLocked, setIsGroupsLocked] = useState(false);
  const [isSpecMode, setIsSpecMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupLead, setNewGroupLead] = useState(unassignedStudents[0] || 'Chưa chỉ định');

  const [renamingGroup, setRenamingGroup] = useState<GroupCardItem | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  const [reassigningGroup, setReassigningGroup] = useState<GroupCardItem | null>(null);
  const [selectedNewLead, setSelectedNewLead] = useState('');

  const [archivingGroup, setArchivingGroup] = useState<GroupCardItem | null>(null);
  const [showQuickAssignModal, setShowQuickAssignModal] = useState(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Helper xác định nhóm có cần chú ý hay không (Needs Attention: Sĩ số <= 2 hoặc Tiến độ < 50%)
  const checkNeedsAttention = (g: GroupCardItem) => {
    if (g.isArchived) return false;
    return g.memberCount <= 2 || (g.submittedCount / g.totalAssignments) < 0.5;
  };

  // Telemetry Calculations
  const activeGroups = useMemo(() => groups.filter(g => !g.isArchived), [groups]);
  const archivedGroups = useMemo(() => groups.filter(g => g.isArchived), [groups]);
  const attentionGroups = useMemo(() => activeGroups.filter(checkNeedsAttention), [activeGroups]);
  const totalStudentsInGroups = useMemo(
    () => activeGroups.reduce((acc, g) => acc + g.memberCount, 0),
    [activeGroups]
  );
  const totalClassEnrollment = 18;

  // Lọc dữ liệu hiển thị
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'archived') {
        return g.isArchived;
      }
      if (g.isArchived) {
        return false;
      }
      if (filterStatus === 'needs-attention') {
        return checkNeedsAttention(g);
      }
      if (filterStatus === 'available') {
        return g.memberCount < g.maxMembers;
      }
      if (filterStatus === 'full') {
        return g.memberCount >= g.maxMembers;
      }
      return true; // 'all'
    });
  }, [groups, searchQuery, filterStatus]);

  // Hành động: Tạo nhóm mới (CLS-04)
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const formattedLeadName = newGroupLead.split(' (')[0] || newGroupLead;

    const newGroup: GroupCardItem = {
      id: `g-0${groups.length + 1}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Không gian làm việc nhóm trực thuộc lớp học.',
      leadName: formattedLeadName,
      memberCount: 1,
      maxMembers: 5,
      submittedCount: 0,
      totalAssignments: 4,
      isArchived: false,
      createdAt: 'Hôm nay',
    };

    setGroups([newGroup, ...groups]);
    setUnassignedStudents(unassignedStudents.filter(s => !s.startsWith(formattedLeadName)));
    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreateModal(false);
    showNotice(`Đã khởi tạo thành công "${newGroup.name}" với Trưởng nhóm: ${formattedLeadName}`);
  };

  // Hành động: Đổi tên nhóm
  const handleRenameGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingGroup || !renameInputValue.trim()) return;

    setGroups(
      groups.map(g => (g.id === renamingGroup.id ? { ...g, name: renameInputValue.trim() } : g))
    );
    showNotice(`Đã đổi tên nhóm thành "${renameInputValue.trim()}"`);
    setRenamingGroup(null);
  };

  // Hành động: Đổi Trưởng nhóm
  const handleReassignLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningGroup || !selectedNewLead) return;

    const cleanLeadName = selectedNewLead.split(' (')[0] || selectedNewLead;
    setGroups(
      groups.map(g => (g.id === reassigningGroup.id ? { ...g, leadName: cleanLeadName } : g))
    );
    showNotice(`Đã chỉ định ${cleanLeadName} làm Trưởng nhóm mới của "${reassigningGroup.name}"`);
    setReassigningGroup(null);
  };

  // Hành động: Lưu trữ nhóm
  const handleConfirmArchive = () => {
    if (!archivingGroup) return;

    setGroups(
      groups.map(g => (g.id === archivingGroup.id ? { ...g, isArchived: true } : g))
    );
    showNotice(`Đã chuyển "${archivingGroup.name}" vào kho lưu trữ.`);
    setArchivingGroup(null);
  };

  // Hành động: Khôi phục nhóm từ kho lưu trữ
  const handleRestoreGroup = (groupId: string, groupName: string) => {
    setGroups(
      groups.map(g => (g.id === groupId ? { ...g, isArchived: false } : g))
    );
    showNotice(`Đã khôi phục "${groupName}" trở lại hoạt động bình thường.`);
  };

  // Hành động: Ghép nhóm nhanh thông minh (Smart Auto-Assign)
  const handleConfirmQuickAssign = () => {
    // Phân bổ 4 học sinh chưa có nhóm:
    // 2 bạn vào Nhóm 04 (hiện có 2 -> lên 4)
    // 1 bạn vào Nhóm 03 (hiện có 3 -> lên 4)
    // 1 bạn vào Nhóm 01 (hiện có 4 -> lên 5)
    setGroups(
      groups.map(g => {
        if (g.id === 'g-04') return { ...g, memberCount: g.memberCount + 2 };
        if (g.id === 'g-03') return { ...g, memberCount: g.memberCount + 1 };
        if (g.id === 'g-01') return { ...g, memberCount: g.memberCount + 1 };
        return g;
      })
    );
    setUnassignedStudents([]);
    setShowQuickAssignModal(false);
    showNotice(`Đã tự động phân bổ thành công 4 học sinh vào các nhóm còn trống chỗ.`);
  };

  // Hành động: Gửi nhắc nhở tiến độ cho nhóm
  const handleSendReminder = (groupName: string, leadName: string) => {
    showNotice(`Đã gửi thông báo đôn đốc tiến độ nộp bài tới Trưởng nhóm ${leadName} và thành viên của "${groupName}".`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        color: 'var(--text-primary)',
      }}
    >
      {/* Toast Notice */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-divider)',
            padding: '12px 18px',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Check size={16} aria-hidden="true" />
          <span style={{ fontWeight: 500 }}>{notice}</span>
        </div>
      )}

      {/* KHỐI 1: HEADER & TELEMETRY SUMMARY */}
      <header
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
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                }}
              >
                Lớp CS101 • Học kỳ 1
              </span>

              {/* Huy hiệu Giáo viên chủ lớp với SpecInfoCode Inverted đạt chuẩn tương phản cao */}
              <span
                data-spec="PER-01"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Giáo viên chủ nhiệm</span>
              </span>

              {/* Huy hiệu Trạng thái Khóa nhóm */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-secondary)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isGroupsLocked ? <Lock size={12} aria-hidden="true" /> : <Unlock size={12} aria-hidden="true" />}
                <span>{isGroupsLocked ? 'Đã chốt danh sách' : 'Cho phép đổi nhóm'}</span>
              </span>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Quản trị Nhóm trong Lớp học
            </h1>

            {/* POLICY RIBBON CONTAINER */}
            <div
              style={{
                marginTop: '12px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div data-spec="CLS-16" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={15} style={{ color: 'var(--text-primary)', flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                  Workspace nhóm trực thuộc lớp học
                </span>
              </div>

              <div
                data-spec="CLS-07"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-divider)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                <Users size={14} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
                <span>Tối đa 5 thành viên/nhóm</span>
              </div>
            </div>
          </div>

          {/* Group Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Toggle Khóa nhóm */}
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '12.5px',
                fontWeight: 500,
                background: 'var(--surface-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => {
                const nextState = !isGroupsLocked;
                setIsGroupsLocked(nextState);
                showNotice(nextState ? 'Đã khóa danh sách nhóm: Học sinh không thể tự chuyển nhóm.' : 'Đã mở danh sách nhóm cho phép học sinh gia nhập.');
              }}
              aria-label={isGroupsLocked ? 'Mở khóa danh sách nhóm' : 'Khóa danh sách nhóm'}
            >
              {isGroupsLocked ? <Unlock size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
              <span>{isGroupsLocked ? 'Mở khóa nhóm' : 'Khóa nhóm'}</span>
            </button>

            {/* Tạo nhóm mới */}
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'var(--text-primary)',
                color: 'var(--bg-app)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
              onClick={() => setShowCreateModal(true)}
              aria-label="Tạo nhóm học tập mới cho lớp"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Tạo nhóm mới</span>
            </button>
          </div>
        </div>

        {/* 4 Bento Telemetry Mini-Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-divider)',
          }}
        >
          <div
            style={{
              background: 'var(--surface-hover)',
              padding: '12px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-divider)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Nhóm đang hoạt động
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
              {activeGroups.length} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>nhóm</span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface-hover)',
              padding: '12px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-divider)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Đã phân bổ nhóm
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
              {totalStudentsInGroups} / {totalClassEnrollment}{' '}
              <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                ({Math.round((totalStudentsInGroups / totalClassEnrollment) * 100)}%)
              </span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface-hover)',
              padding: '12px 14px',
              borderRadius: '6px',
              border: unassignedStudents.length > 0 ? '1px dashed var(--text-primary)' : '1px solid var(--border-divider)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Chưa có nhóm ({unassignedStudents.length})
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
                {unassignedStudents.length} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>học sinh</span>
              </div>
            </div>

            {unassignedStudents.length > 0 && (
              <button
                type="button"
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-divider)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  alignSelf: 'flex-start',
                }}
                onClick={() => setShowQuickAssignModal(true)}
                aria-label="Mở cửa sổ tự động ghép nhóm cho học sinh chưa có nhóm"
              >
                <UserPlus size={12} aria-hidden="true" />
                <span>Ghép nhóm nhanh</span>
              </button>
            )}
          </div>

          <div
            style={{
              background: 'var(--surface-hover)',
              padding: '12px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-divider)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Kho lưu trữ
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
              {archivedGroups.length} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>nhóm</span>
            </div>
          </div>
        </div>
      </header>

      {/* KHỐI 2: MANAGEMENT TOOLBAR & FILTER BAR */}
      <section
        aria-label="Thanh công cụ lọc và tìm kiếm nhóm"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Bộ lọc phân loại */}
        <div
          role="tablist"
          aria-label="Phân loại trạng thái nhóm"
          style={{
            display: 'inline-flex',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '6px',
            padding: '3px',
            gap: '2px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: filterStatus === 'all' ? 600 : 400,
              background: filterStatus === 'all' ? 'var(--surface-hover)' : 'transparent',
              color: 'var(--text-primary)',
              border: filterStatus === 'all' ? '1px solid var(--border-divider)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Tất cả ({activeGroups.length})
          </button>

          {/* Tab Lọc Cần Chú Ý */}
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'needs-attention'}
            onClick={() => setFilterStatus('needs-attention')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: filterStatus === 'needs-attention' ? 600 : 400,
              background: filterStatus === 'needs-attention' ? 'var(--surface-hover)' : 'transparent',
              color: 'var(--text-primary)',
              border: filterStatus === 'needs-attention' ? '1px solid var(--border-divider)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertCircle size={13} aria-hidden="true" />
            <span>Cần chú ý ({attentionGroups.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'available'}
            onClick={() => setFilterStatus('available')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: filterStatus === 'available' ? 600 : 400,
              background: filterStatus === 'available' ? 'var(--surface-hover)' : 'transparent',
              color: 'var(--text-primary)',
              border: filterStatus === 'available' ? '1px solid var(--border-divider)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Còn trống chỗ
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'full'}
            onClick={() => setFilterStatus('full')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: filterStatus === 'full' ? 600 : 400,
              background: filterStatus === 'full' ? 'var(--surface-hover)' : 'transparent',
              color: 'var(--text-primary)',
              border: filterStatus === 'full' ? '1px solid var(--border-divider)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Đã đủ sĩ số (5/5)
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'archived'}
            onClick={() => setFilterStatus('archived')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: filterStatus === 'archived' ? 600 : 400,
              background: filterStatus === 'archived' ? 'var(--surface-hover)' : 'transparent',
              color: 'var(--text-primary)',
              border: filterStatus === 'archived' ? '1px solid var(--border-divider)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Lưu trữ ({archivedGroups.length})
          </button>
        </div>

        {/* Thanh công cụ phụ: Toggle Grid/List & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
          {/* Ô tìm kiếm tức thời */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Tìm theo tên nhóm hoặc trưởng nhóm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid var(--border-divider)',
                background: 'var(--surface-card)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              aria-label="Tìm kiếm nhóm học tập"
            />
          </div>

          {/* Toggle Chế độ Nghiệm thu / Mã tham chiếu */}
          <button
            type="button"
            onClick={() => setIsSpecMode(!isSpecMode)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              background: isSpecMode ? 'var(--text-primary)' : 'var(--surface-card)',
              color: isSpecMode ? 'var(--bg-app)' : 'var(--text-secondary)',
              border: '1px solid var(--border-divider)',
              cursor: 'pointer',
            }}
            title="Bật/Tắt hiển thị mã quy chuẩn đối chiếu tài liệu kỹ thuật (CLS, PER)"
            aria-pressed={isSpecMode}
          >
            <HelpCircle size={13} aria-hidden="true" />
            <span>{isSpecMode ? 'Mã chuẩn: Bật' : 'Mã chuẩn: Tắt'}</span>
          </button>

          {/* Toggle View Mode (Bento Grid vs List) */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '6px',
              padding: '2px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px',
                background: viewMode === 'grid' ? 'var(--surface-hover)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Xem dạng Lưới Bento"
              aria-label="Xem dạng Lưới Bento"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px',
                background: viewMode === 'list' ? 'var(--surface-hover)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Xem dạng Bảng rút gọn"
              aria-label="Xem dạng Bảng rút gọn"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* KHỐI 3: DỮ LIỆU NHÓM (GRID HOẶC COMPACT LIST) */}
      {filteredGroups.length === 0 ? (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px dashed var(--border-divider)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FolderKanban size={36} style={{ opacity: 0.5 }} aria-hidden="true" />
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              Không tìm thấy nhóm học tập phù hợp
            </h2>
            <p style={{ fontSize: '13px', margin: 0 }}>
              {searchQuery
                ? `Không có kết quả khớp với từ khóa "${searchQuery}". Hãy thử từ khóa khác.`
                : 'Chưa có nhóm nào trong bộ lọc này.'}
            </p>
          </div>
          <button
            type="button"
            style={{
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'var(--surface-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-divider)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Tạo nhóm học tập mới</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* BENTO GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredGroups.map(g => {
            const isFull = g.memberCount >= g.maxMembers;
            const progressPercent = Math.min(100, Math.round((g.memberCount / g.maxMembers) * 100));
            const needsAttention = checkNeedsAttention(g);

            return (
              <article
                key={g.id}
                style={{
                  background: 'var(--surface-card)',
                  border: needsAttention ? '2px dashed var(--text-primary)' : '1px solid var(--border-divider)',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                  opacity: g.isArchived ? 0.85 : 1,
                  boxShadow: needsAttention ? '0 2px 10px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <FolderKanban size={18} style={{ color: 'var(--text-primary)', flexShrink: 0 }} aria-hidden="true" />
                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          margin: 0,
                          lineHeight: '1.4',
                        }}
                      >
                        {g.name}
                      </h3>
                    </div>

                    {/* Quick Action Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {!g.isArchived ? (
                        <>
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-divider)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                            }}
                            title="Gửi nhắc nhở tiến độ cho nhóm"
                            aria-label={`Gửi nhắc nhở cho ${g.name}`}
                            onClick={() => handleSendReminder(g.name, g.leadName)}
                          >
                            <Bell size={13} aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-divider)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                            }}
                            title="Đổi tên nhóm"
                            aria-label={`Đổi tên ${g.name}`}
                            onClick={() => {
                              setRenamingGroup(g);
                              setRenameInputValue(g.name);
                            }}
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-divider)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                            }}
                            title="Lưu trữ nhóm"
                            aria-label={`Lưu trữ nhóm ${g.name}`}
                            onClick={() => setArchivingGroup(g)}
                          >
                            <Archive size={13} aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          style={{
                            background: 'var(--surface-hover)',
                            border: '1px solid var(--border-divider)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Khôi phục nhóm từ kho lưu trữ"
                          aria-label={`Khôi phục nhóm ${g.name}`}
                          onClick={() => handleRestoreGroup(g.id, g.name)}
                        >
                          <RotateCcw size={12} aria-hidden="true" />
                          <span>Khôi phục</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cảnh báo Cần chú ý (Nếu sĩ số <= 2 hoặc tiến độ < 50%) */}
                  {needsAttention && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-divider)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                      }}
                    >
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>Cần can thiệp: {g.memberCount <= 2 ? 'Sĩ số ít (< 3)' : 'Chậm tiến độ bài nộp'}</span>
                    </div>
                  )}

                  {/* Mô tả nhóm */}
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      margin: '0 0 14px 0',
                      lineHeight: '1.45',
                    }}
                  >
                    {g.description}
                  </p>

                  {/* Thông tin Trưởng nhóm & Nút đổi nhanh */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--surface-hover)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={15} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
                      <span style={{ color: 'var(--text-secondary)' }}>Trưởng nhóm:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{g.leadName}</strong>
                    </div>

                    {!g.isArchived && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                        onClick={() => {
                          setReassigningGroup(g);
                          setSelectedNewLead(unassignedStudents[0] || '');
                        }}
                        aria-label={`Đổi trưởng nhóm cho ${g.name}`}
                      >
                        Đổi
                      </button>
                    )}
                  </div>

                  {/* Capacity Meter */}
                  <div style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Sĩ số thành viên:</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isFull ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {g.memberCount} / {g.maxMembers} {isFull ? '(Đã đủ sĩ số)' : `(Còn ${g.maxMembers - g.memberCount} chỗ)`}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        background: 'var(--surface-hover)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-divider)',
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: 'var(--text-primary)',
                          borderRadius: '3px',
                          transition: 'width 240ms ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Tiến độ bài nộp */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <FileText size={14} aria-hidden="true" />
                    <span>
                      Tiến độ bài nộp: <strong>{g.submittedCount}/{g.totalAssignments} bài hoàn thành</strong>
                    </span>
                  </div>
                </div>

                {/* Footer Action: Vào Workspace (CUXC-03) */}
                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-divider)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Khởi tạo: {g.createdAt}
                  </span>

                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '6px 12px',
                      background: 'var(--surface-hover)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-divider)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      showNotice(`Đang mở Không gian làm việc của ${g.name}...`)
                    }
                    aria-label={`Mở Workspace của nhóm ${g.name}`}
                  >
                    <span>Vào Workspace</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-divider)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tên nhóm & Mục tiêu</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trưởng nhóm</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sĩ số</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tiến độ bài nộp</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map(g => {
                const needsAttention = checkNeedsAttention(g);

                return (
                  <tr
                    key={g.id}
                    style={{
                      borderBottom: '1px solid var(--border-divider)',
                      background: needsAttention ? 'rgba(0,0,0,0.02)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{g.description}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} aria-hidden="true" />
                        <span>{g.leadName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600 }}>{g.memberCount} / {g.maxMembers}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                        {g.memberCount >= g.maxMembers ? '(Đủ)' : `(Còn ${g.maxMembers - g.memberCount})`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span>{g.submittedCount}/{g.totalAssignments} bài</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {g.isArchived ? (
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)' }}>
                          Lưu trữ
                        </span>
                      ) : needsAttention ? (
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600 }}>
                          Cần chú ý
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ổn định</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {!g.isArchived && (
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
                            title="Gửi nhắc nhở tiến độ"
                            aria-label={`Gửi nhắc nhở cho ${g.name}`}
                            onClick={() => handleSendReminder(g.name, g.leadName)}
                          >
                            <Bell size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: 'var(--surface-hover)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-divider)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          onClick={() => showNotice(`Đang mở Không gian làm việc của ${g.name}...`)}
                        >
                          Vào Workspace
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: TẠO NHÓM MỚI (CLS-04) */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-group-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleCreateGroup}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 id="create-group-title" style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Tạo Nhóm Học Tập Mới
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Đóng cửa sổ"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Tên nhóm <span style={{ color: 'var(--text-secondary)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="vd: Nhóm 06 - Distributed Systems"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Mô tả ngắn gọn mục tiêu nhóm
                </label>
                <input
                  type="text"
                  placeholder="vd: Nghiên cứu kiến trúc đồng thuận Paxos và Raft"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Trưởng nhóm ban đầu
                </label>
                <select
                  value={newGroupLead}
                  onChange={e => setNewGroupLead(e.target.value)}
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
                  {unassignedStudents.length > 0 ? (
                    unassignedStudents.map((st, idx) => (
                      <option key={idx} value={st}>
                        {st}
                      </option>
                    ))
                  ) : (
                    <option value="Chưa chỉ định">Chưa chỉ định (Toàn bộ sinh viên đã có nhóm)</option>
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Khởi tạo nhóm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ĐỔI TÊN NHÓM */}
      {renamingGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-group-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleRenameGroup}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 id="rename-group-title" style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                Đổi Tên Nhóm Học Tập
              </h2>
              <button
                type="button"
                onClick={() => setRenamingGroup(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              value={renameInputValue}
              onChange={e => setRenameInputValue(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                marginBottom: '20px',
              }}
              autoFocus
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRenamingGroup(null)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Lưu tên mới
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ĐỔI TRƯỞNG NHÓM (CLS-04) */}
      {reassigningGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reassign-lead-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleReassignLead}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 id="reassign-lead-title" style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                Chỉ Định Trưởng Nhóm Mới
              </h2>
              <button
                type="button"
                onClick={() => setReassigningGroup(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Trưởng nhóm hiện tại của <strong>{reassigningGroup.name}</strong>:{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reassigningGroup.leadName}</span>
            </div>

            <select
              value={selectedNewLead}
              onChange={e => setSelectedNewLead(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              {unassignedStudents.map((st, idx) => (
                <option key={idx} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setReassigningGroup(null)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Xác nhận đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: XÁC NHẬN LƯU TRỮ NHÓM (CLS-16) */}
      {archivingGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-group-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
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
              maxWidth: '460px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Archive size={18} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
              <h2 id="archive-group-title" style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                Xác nhận Lưu trữ Nhóm
              </h2>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '16px' }}>
              Bạn đang chuẩn bị chuyển <strong>{archivingGroup.name}</strong> vào Kho lưu trữ.
            </p>

            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.45',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Chính sách lưu trữ:
              </div>
              <div>• Không gian làm việc nhóm sẽ chuyển sang chế độ <strong>Chỉ đọc (Read-only)</strong>.</div>
              <div>• Toàn bộ lịch sử bài nộp, tệp đính kèm và điểm số vẫn được <strong>bảo lưu gắn với lớp học</strong>.</div>
              <div>• Giáo viên có thể <strong>Khôi phục nhóm</strong> bất cứ lúc nào từ tab Lưu trữ.</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setArchivingGroup(null)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Đồng ý Lưu trữ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PHÂN BỔ NHANH HỌC SINH CHƯA CÓ NHÓM (SMART AUTO-ASSIGN) */}
      {showQuickAssignModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-assign-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
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
              maxWidth: '500px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
                <h2 id="quick-assign-title" style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  Tự Động Phân Bổ Nhóm
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAssignModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '16px' }}>
              Hệ thống đã tính toán các nhóm đang thiếu thành viên và đề xuất phân bổ <strong>{unassignedStudents.length} học sinh</strong> như sau:
            </p>

            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '14px',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-divider)', paddingBottom: '6px' }}>
                <span>• Ghép <strong>2 học sinh</strong> (Đạt, Hương) vào:</span>
                <strong>Nhóm 04 (Lên 4/5)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-divider)', paddingBottom: '6px' }}>
                <span>• Ghép <strong>1 học sinh</strong> (Triết) vào:</span>
                <strong>Nhóm 03 (Lên 4/5)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Ghép <strong>1 học sinh</strong> (Bích) vào:</span>
                <strong>Nhóm 01 (Lên 5/5 Đủ)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowQuickAssignModal(false)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmQuickAssign}
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Xác nhận Phân bổ Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
