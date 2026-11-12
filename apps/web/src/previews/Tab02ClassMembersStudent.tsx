import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Check,
  Search,
  Copy,
  Mail,
  X,
  Info,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';

interface StudentMember {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'monitor' | 'member';
  groupName: string;
  groupId?: string;
  isCurrentUser?: boolean;
  status: 'active' | 'pending';
}

const INITIAL_MEMBERS: StudentMember[] = [
  {
    id: 'm-01',
    name: 'TS. Nguyễn Văn Toàn',
    email: 'toan.nv@hcmut.edu.vn',
    role: 'teacher',
    groupName: 'Giáo viên chủ nhiệm',
    status: 'active'
  },
  {
    id: 'm-02',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@student.edu.vn',
    role: 'monitor',
    groupName: 'Nhóm 01 - AI & Data Platform',
    groupId: 'g-01',
    status: 'active'
  },
  {
    id: 'm-03',
    name: 'Trần Thị Mai',
    email: 'mai.tran@student.edu.vn',
    role: 'member',
    groupName: 'Nhóm 01 - AI & Data Platform',
    groupId: 'g-01',
    isCurrentUser: true,
    status: 'active'
  },
  {
    id: 'm-04',
    name: 'Phạm Quỳnh Anh',
    email: 'quynhanh.pham@student.edu.vn',
    role: 'member',
    groupName: 'Nhóm 02 - Web Collaboration Engine',
    groupId: 'g-02',
    status: 'active'
  },
  {
    id: 'm-05',
    name: 'Đỗ Quốc Bảo',
    email: 'bao.do@student.edu.vn',
    role: 'member',
    groupName: 'Chưa có nhóm',
    status: 'active'
  },
  {
    id: 'm-06',
    name: 'Vũ Đức Thịnh',
    email: 'thinh.vu@student.edu.vn',
    role: 'member',
    groupName: 'Chưa có nhóm',
    status: 'active'
  },
  {
    id: 'm-07',
    name: 'Nguyễn Thanh Hằng',
    email: 'hang.nguyen@student.edu.vn',
    role: 'member',
    groupName: 'Nhóm 03 - Cloud Microservices',
    groupId: 'g-03',
    status: 'active'
  },
  {
    id: 'm-08',
    name: 'Bùi Anh Tuấn',
    email: 'tuan.bui@student.edu.vn',
    role: 'member',
    groupName: 'Nhóm 01 - AI & Data Platform',
    groupId: 'g-01',
    status: 'active'
  }
];

export const Tab02ClassMembersStudent: React.FC = () => {
  const [members] = useState<StudentMember[]>(INITIAL_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'my-group' | 'assigned' | 'unassigned'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'group'>('default');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [hasAcknowledgedLeaveTerms, setHasAcknowledgedLeaveTerms] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const currentUser = useMemo(() => members.find(m => m.isCurrentUser), [members]);
  const teacher = useMemo(() => members.find(m => m.role === 'teacher'), [members]);
  const monitor = useMemo(() => members.find(m => m.role === 'monitor'), [members]);

  // Students list includes both monitor and members (all peers)
  const studentDirectory = useMemo(() => members.filter(m => m.role !== 'teacher'), [members]);

  const showToast = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3200);
  };

  const handleCopyEmail = (id: string, email: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
    }
    setCopiedId(id);
    showToast(`Đã sao chép email: ${email}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAndSortedStudents = useMemo(() => {
    // 1. Text Search matching
    const query = searchQuery.trim().toLowerCase();
    let result = studentDirectory.filter(student => {
      const matchesSearch =
        query === '' ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.groupName.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Category Filter matching
      if (groupFilter === 'my-group') {
        return Boolean(student.groupId && currentUser?.groupId && student.groupId === currentUser.groupId);
      }
      if (groupFilter === 'assigned') {
        return student.groupName !== 'Chưa có nhóm';
      }
      if (groupFilter === 'unassigned') {
        return student.groupName === 'Chưa có nhóm';
      }
      return true;
    });

    // 3. Sorting
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortBy === 'group') {
      result = [...result].sort((a, b) => a.groupName.localeCompare(b.groupName, 'vi'));
    }

    return result;
  }, [studentDirectory, searchQuery, groupFilter, sortBy, currentUser]);

  const myGroupCount = useMemo(
    () => studentDirectory.filter(s => s.groupId && s.groupId === currentUser?.groupId).length,
    [studentDirectory, currentUser]
  );
  const assignedCount = useMemo(
    () => studentDirectory.filter(s => s.groupName !== 'Chưa có nhóm').length,
    [studentDirectory]
  );
  const unassignedCount = useMemo(
    () => studentDirectory.filter(s => s.groupName === 'Chưa có nhóm').length,
    [studentDirectory]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', color: 'var(--text-primary)' }}>
      {/* Toast Notification */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'sticky',
            top: '12px',
            zIndex: 50,
            background: 'var(--surface-card)',
            border: '1.5px solid var(--border-strong, #52525b)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            alignSelf: 'flex-start',
            maxWidth: '480px'
          }}
        >
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={13} />
          </div>
          <span style={{ fontWeight: 600 }}>{notice}</span>
        </div>
      )}

      {/* Header Context & Personal Status Banner */}
      <section
        role="region"
        aria-labelledby="class-header-title"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '10px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600 }}>
                Học phần chính khóa
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mã lớp: <code>CS101-2026</code></span>
            </div>
            <h1 id="class-header-title" style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              CS101 - Nhập môn Công nghệ Phần mềm
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Học kỳ 1 (2026-2027) • Tổng sĩ số: <strong>{studentDirectory.length} sinh viên</strong>
            </p>
          </div>

          {/* Action: Rời lớp học */}
          <button
            type="button"
            data-spec="CLS-09"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--surface-card)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-strong, #52525b)',
              transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-card)';
            }}
            onClick={() => {
              setHasAcknowledgedLeaveTerms(false);
              setShowLeaveModal(true);
            }}
            title="Xem điều kiện và thủ tục rút khỏi lớp học"
            aria-label="Rời khỏi lớp học"
          >
            <LogOut size={14} />
            <span>Rời khỏi lớp học</span>
          </button>
        </div>

        {/* Digital Student Identity Card */}
        <div
          role="region"
          aria-labelledby="student-identity-title"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-divider)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              TM
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span id="student-identity-title">{currentUser?.name} (Bạn)</span>
                <span
                  data-spec="CLS-13"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontWeight: 600
                  }}
                >
                  Học sinh chính thức
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                MSSV: <code>2210458</code> • Nhóm học tập: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.groupName}</strong>
              </div>
            </div>
          </div>

          <div
            data-spec="PM-06"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}
          >
            <Info size={14} />
            <span>Quyền hạn: Tra cứu danh bạ thành viên lớp</span>
          </div>
        </div>
      </section>

      {/* Leadership & Staff Grid */}
      <section role="region" aria-labelledby="leadership-title" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 id="leadership-title" style={{ fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          Ban Giảng huấn & Ban Cán sự Lớp
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Teacher Card */}
          {teacher && (
            <div
              onMouseEnter={() => setHoveredCardId(teacher.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              data-spec="PER-01"
              style={{
                background: 'var(--surface-card)',
                border: hoveredCardId === teacher.id ? '1.5px solid var(--border-strong, #52525b)' : '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 160ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: hoveredCardId === teacher.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'var(--surface-hover)',
                      border: '1.5px solid var(--border-strong, #52525b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span
                      style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}
                    >
                      Giáo viên chủ nhiệm
                    </span>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>{teacher.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bộ môn Hệ thống & Nền tảng</div>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'var(--surface-card)',
                    color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-strong, #52525b)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface-card)';
                  }}
                  onClick={() => handleCopyEmail(teacher.id, teacher.email)}
                  title="Sao chép email giáo viên chủ nhiệm"
                  aria-label="Sao chép email giáo viên chủ nhiệm"
                >
                  {copiedId === teacher.id ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedId === teacher.id ? 'Đã sao chép' : 'Sao chép email'}</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-divider)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Email: <code style={{ color: 'var(--text-primary)' }}>{teacher.email}</code></span>
                <span>Tiếp SV: Thứ 3 & Thứ 5</span>
              </div>
            </div>
          )}

          {/* Class Monitor Card */}
          {monitor && (
            <div
              onMouseEnter={() => setHoveredCardId(monitor.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              data-spec="PER-02"
              style={{
                background: 'var(--surface-card)',
                border: hoveredCardId === monitor.id ? '1.5px solid var(--border-strong, #52525b)' : '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 160ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: hoveredCardId === monitor.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'var(--surface-hover)',
                      border: '1.5px solid var(--border-strong, #52525b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Award size={22} />
                  </div>
                  <div>
                    <span
                      style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}
                    >
                      Lớp trưởng
                    </span>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>{monitor.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{monitor.groupName}</div>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'var(--surface-card)',
                    color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-strong, #52525b)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface-card)';
                  }}
                  onClick={() => handleCopyEmail(monitor.id, monitor.email)}
                  title="Sao chép email lớp trưởng"
                  aria-label="Sao chép email lớp trưởng"
                >
                  {copiedId === monitor.id ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedId === monitor.id ? 'Đã sao chép' : 'Sao chép email'}</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-divider)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Email: <code style={{ color: 'var(--text-primary)' }}>{monitor.email}</code></span>
                <span>Hỗ trợ điều phối nhóm & lớp</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Classmates Directory Section */}
      <section role="region" aria-labelledby="directory-title" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 id="directory-title" style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 2px 0' }}>
              Danh bạ bạn học trong lớp
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Hiển thị {filteredAndSortedStudents.length} / {studentDirectory.length} sinh viên (Tra cứu liên hệ & nhóm học tập)
            </div>
          </div>

          {/* View Mode & Sorter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'default' | 'name' | 'group')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border-strong, #52525b)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Tiêu chí sắp xếp danh bạ"
              >
                <option value="default">Mặc định</option>
                <option value="name">Tên sinh viên (A → Z)</option>
                <option value="group">Theo Nhóm học tập</option>
              </select>
            </div>

            {/* View Switcher (Refined Segmented Control) */}
            <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border-divider)' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Hiển thị dạng Bảng chi tiết"
                aria-label="Chế độ xem dạng Bảng"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: viewMode === 'table' ? 600 : 500,
                  border: viewMode === 'table' ? '1px solid var(--border-divider)' : 'none',
                  cursor: 'pointer',
                  background: viewMode === 'table' ? 'var(--surface-card)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 120ms ease'
                }}
              >
                <List size={14} />
                <span>Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Hiển thị dạng Lưới Thẻ sinh viên"
                aria-label="Chế độ xem dạng Thẻ"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: viewMode === 'cards' ? 600 : 500,
                  border: viewMode === 'cards' ? '1px solid var(--border-divider)' : 'none',
                  cursor: 'pointer',
                  background: viewMode === 'cards' ? 'var(--surface-card)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 120ms ease'
                }}
              >
                <LayoutGrid size={14} />
                <span>Thẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Search input & Filter Chips */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Instant Search Bar */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sinh viên, email, hoặc tên nhóm..."
              style={{
                width: '100%',
                background: 'var(--surface-card)',
                border: '1.5px solid var(--border-strong, #52525b)',
                borderRadius: '6px',
                padding: '8px 34px 8px 36px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              aria-label="Tìm kiếm sinh viên trong lớp"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Xóa từ khóa tìm kiếm"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Chips (Refined Segmented Control) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={13} />
              Lọc:
            </span>

            <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border-divider)' }}>
              {(
                [
                  { id: 'all', label: `Tất cả (${studentDirectory.length})` },
                  { id: 'my-group', label: `Cùng nhóm (${myGroupCount})` },
                  { id: 'assigned', label: `Đã có nhóm (${assignedCount})` },
                  { id: 'unassigned', label: `Chưa có nhóm (${unassignedCount})` }
                ] as const
              ).map(filterItem => (
                <button
                  key={filterItem.id}
                  type="button"
                  onClick={() => setGroupFilter(filterItem.id)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: groupFilter === filterItem.id ? '1px solid var(--border-divider)' : 'none',
                    background: groupFilter === filterItem.id ? 'var(--surface-card)' : 'transparent',
                    color: groupFilter === filterItem.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: groupFilter === filterItem.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    fontWeight: groupFilter === filterItem.id ? 600 : 500,
                    transition: 'all 120ms ease'
                  }}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIEW 1: Directory Table */}
        {viewMode === 'table' ? (
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)', background: 'var(--surface-hover)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600, width: '35%' }}>Học sinh / Sinh viên</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, width: '20%' }}>Vai trò</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, width: '30%' }}>Nhóm học tập</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, width: '15%', textAlign: 'right' }}>Liên hệ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Users size={28} style={{ opacity: 0.5 }} />
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Không tìm thấy sinh viên phù hợp</div>
                        <div style={{ fontSize: '12px' }}>Vui lòng thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả".</div>
                        <button
                          type="button"
                          style={{
                            marginTop: '8px',
                            background: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            border: '1.5px solid var(--border-strong, #52525b)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--surface-hover)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--surface-card)';
                          }}
                          onClick={() => {
                            setSearchQuery('');
                            setGroupFilter('all');
                          }}
                        >
                          Đặt lại bộ lọc
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStudents.map(student => {
                    const isCurrent = student.isCurrentUser;
                    const isMonitor = student.role === 'monitor';
                    const hasNoGroup = student.groupName === 'Chưa có nhóm';
                    const isSameGroup = Boolean(student.groupId && currentUser?.groupId && student.groupId === currentUser.groupId);

                    return (
                      <tr
                        key={student.id}
                        style={{
                          borderBottom: '1px solid var(--border-divider)',
                          background: isCurrent ? 'var(--surface-hover)' : 'transparent',
                          transition: 'background 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        {/* Name & Avatar */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--surface-hover)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-divider)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                flexShrink: 0
                              }}
                            >
                              {student.name.split(' ').slice(-1)[0][0]}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {student.name}
                                </span>
                                {isCurrent && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      padding: '1px 6px',
                                      borderRadius: '3px',
                                      background: 'var(--surface-hover)',
                                      border: '1px solid var(--border-divider)',
                                      color: 'var(--text-primary)',
                                      fontWeight: 600
                                    }}
                                  >
                                    Bạn
                                  </span>
                                )}
                                {isSameGroup && !isCurrent && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      padding: '1px 6px',
                                      borderRadius: '3px',
                                      background: 'var(--surface-card)',
                                      border: '1.5px solid var(--border-strong, #52525b)',
                                      color: 'var(--text-primary)',
                                      fontWeight: 600
                                    }}
                                  >
                                    Cùng nhóm
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Class Role */}
                        <td style={{ padding: '14px 16px' }}>
                          {isMonitor ? (
                            <span
                              data-spec="PER-02"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'var(--surface-hover)',
                                border: '1px solid var(--border-divider)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <Award size={12} />
                              Lớp trưởng
                            </span>
                          ) : (
                            <span
                              data-spec="CLS-13"
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-divider)'
                              }}
                            >
                              Học sinh
                            </span>
                          )}
                        </td>

                        {/* Group Assignment */}
                        <td style={{ padding: '14px 16px' }}>
                          {hasNoGroup ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px dashed var(--border-divider)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              Chưa tham gia nhóm
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: isSameGroup ? 600 : 500,
                                color: 'var(--text-primary)'
                              }}
                            >
                              {student.groupName}
                            </span>
                          )}
                        </td>

                        {/* Actions: Copy & Mailto */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              style={{
                                padding: '5px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: 'var(--surface-card)',
                                color: 'var(--text-primary)',
                                border: '1.5px solid var(--border-strong, #52525b)',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                                transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--surface-hover)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--surface-card)';
                              }}
                              onClick={() => handleCopyEmail(student.id, student.email)}
                              title={`Sao chép email của ${student.name}`}
                              aria-label={`Sao chép email của ${student.name}`}
                            >
                              {copiedId === student.id ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                            <a
                              href={`mailto:${student.email}`}
                              style={{
                                padding: '5px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: 'var(--surface-card)',
                                color: 'var(--text-primary)',
                                border: '1.5px solid var(--border-strong, #52525b)',
                                textDecoration: 'none',
                                transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--surface-hover)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--surface-card)';
                              }}
                              title={`Gửi email cho ${student.name}`}
                              aria-label={`Gửi email cho ${student.name}`}
                            >
                              <Mail size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW 2: Directory Cards Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {filteredAndSortedStudents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '36px 20px', textAlign: 'center', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px' }}>
                <Users size={28} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Không tìm thấy sinh viên phù hợp</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vui lòng thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả".</div>
              </div>
            ) : (
              filteredAndSortedStudents.map(student => {
                const isCurrent = student.isCurrentUser;
                const isMonitor = student.role === 'monitor';
                const hasNoGroup = student.groupName === 'Chưa có nhóm';
                const isSameGroup = Boolean(student.groupId && currentUser?.groupId && student.groupId === currentUser.groupId);

                return (
                  <article
                    key={student.id}
                    style={{
                      background: isCurrent ? 'var(--surface-hover)' : 'var(--surface-card)',
                      border: isCurrent ? '1.5px solid var(--border-strong, #52525b)' : '1px solid var(--border-divider)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--surface-hover)',
                              color: 'var(--text-primary)',
                              border: isCurrent ? '1.5px solid var(--border-strong, #52525b)' : '1px solid var(--border-divider)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              flexShrink: 0
                            }}
                          >
                            {student.name.split(' ').slice(-1)[0][0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {isCurrent && (
                            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>
                              Bạn
                            </span>
                          )}
                          {isSameGroup && !isCurrent && (
                            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>
                              Cùng nhóm
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Role & Group Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {isMonitor ? (
                          <span
                            data-spec="PER-02"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--surface-hover)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-divider)'
                            }}
                          >
                            <Award size={12} />
                            Lớp trưởng
                          </span>
                        ) : (
                          <span
                            data-spec="CLS-13"
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-divider)'
                            }}
                          >
                            Học sinh
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: hasNoGroup ? 'transparent' : 'var(--surface-hover)',
                            border: hasNoGroup ? '1px dashed var(--border-divider)' : '1px solid var(--border-divider)',
                            color: hasNoGroup ? 'var(--text-secondary)' : 'var(--text-primary)',
                            fontWeight: hasNoGroup ? 400 : 500
                          }}
                        >
                          {hasNoGroup ? 'Chưa có nhóm' : student.groupName}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-divider)', paddingTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(student.id, student.email)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong, #52525b)',
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--surface-hover)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--surface-card)';
                        }}
                      >
                        {copiedId === student.id ? <Check size={13} style={{ color: 'inherit' }} /> : <Copy size={13} style={{ color: 'inherit' }} />}
                        <span style={{ color: 'inherit' }}>{copiedId === student.id ? 'Đã sao chép' : 'Sao chép email'}</span>
                      </button>
                      <a
                        href={`mailto:${student.email}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          border: '1.5px solid var(--border-strong, #52525b)',
                          textDecoration: 'none',
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--surface-hover)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--surface-card)';
                        }}
                        title={`Gửi email cho ${student.name}`}
                        aria-label={`Gửi email cho ${student.name}`}
                      >
                        <Mail size={13} />
                      </a>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Modal: Xác nhận rời khỏi lớp học (CLS-09, CLS-12) */}
      {showLeaveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowLeaveModal(false)}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '10px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--surface-hover)',
                    border: '1.5px solid var(--border-strong, #52525b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 id="leave-modal-title" data-spec="CLS-09" style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    Xác nhận điều kiện rời lớp học
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Quy chế học phần: Yêu cầu hoàn tất bàn giao và bảo lưu lịch sử
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                aria-label="Đóng cửa sổ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning & Prerequisites Explanation */}
            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '13px',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Điều kiện tiên quyết trước khi rời lớp:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                <li data-spec="CLS-09">
                  <strong>Tư cách nhóm:</strong> Bạn phải rời tất cả các workspace nhóm thuộc lớp trước khi rời lớp. (Hiện tại: Bạn đang tham gia <em>{currentUser?.groupName}</em>).
                </li>
                <li>
                  <strong>Bàn giao công việc:</strong> Hoàn tất bàn giao các công việc và checklist đang phụ trách trong nhóm.
                </li>
                <li data-spec="CLS-12">
                  <strong>Bảo lưu lịch sử:</strong> Quyền truy cập các nội dung lớp chấm dứt ngay lập tức, nhưng toàn bộ lịch sử nộp bài và đóng góp công việc được bảo lưu nguyên vẹn tại lớp.
                </li>
              </ul>
            </div>

            {/* Checkbox Acknowledgment */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={hasAcknowledgedLeaveTerms}
                onChange={e => setHasAcknowledgedLeaveTerms(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>
                Tôi đã đọc và hiểu các điều kiện theo quy định của học phần. Tôi đồng ý gửi yêu cầu rời lớp tới Giáo viên chủ nhiệm.
              </span>
            </label>

            {/* Notice if still in a group */}
            {currentUser?.groupId && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border-strong, #52525b)',
                  background: 'var(--surface-card)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Info size={14} style={{ flexShrink: 0 }} />
                <span>
                  Lưu ý: Hệ thống sẽ tự động gửi yêu cầu rút khỏi <strong>{currentUser.groupName}</strong> đồng thời với yêu cầu rời lớp.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: '1px solid var(--border-divider)', paddingTop: '16px' }}>
              <button
                type="button"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border-strong, #52525b)',
                  transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--surface-card)';
                }}
                onClick={() => setShowLeaveModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!hasAcknowledgedLeaveTerms}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: hasAcknowledgedLeaveTerms ? 'pointer' : 'not-allowed',
                  background: hasAcknowledgedLeaveTerms ? 'var(--text-primary)' : 'var(--surface-hover)',
                  color: hasAcknowledgedLeaveTerms ? 'var(--bg-app)' : 'var(--text-secondary)',
                  border: hasAcknowledgedLeaveTerms ? '1.5px solid var(--text-primary)' : '1.5px solid var(--border-divider)',
                  boxShadow: hasAcknowledgedLeaveTerms ? '0 2px 8px rgba(0, 0, 0, 0.18)' : 'none',
                  opacity: hasAcknowledgedLeaveTerms ? 1 : 0.6,
                  transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={() => {
                  setShowLeaveModal(false);
                  showToast('Đã gửi yêu cầu rút khỏi lớp học tới Giáo viên chủ nhiệm');
                }}
              >
                <LogOut size={13} style={{ color: 'inherit' }} />
                <span style={{ color: 'inherit' }}>Gửi yêu cầu rời lớp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};