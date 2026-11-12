import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  AlertTriangle,
  Archive,
  RefreshCw,
  Check,
  ArrowRightLeft,
  Copy,
  Lock,
  Unlock,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Trash2,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  ShieldAlert,
  History,
  Clock,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface ClassProfile {
  name: string;
  code: string;
  semester: string;
  description: string;
}

interface SettingsLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'join_code' | 'profile' | 'policy' | 'lifecycle';
}

export const Tab05ClassSettingsAdmin: React.FC = () => {
  // 1. Quản lý thông tin học phần
  const [profile, setProfile] = useState<ClassProfile>({
    name: 'CS101 - Lập trình Nâng cao',
    code: 'CS101-2026',
    semester: 'Học kỳ 1 • 2026-2027',
    description: 'Học phần thực hành kiến trúc phần mềm và lập trình ứng dụng cộng tác thời gian thực SNOTE v2.',
  });

  // 2. Trạng thái vòng đời lớp học
  const [classStatus, setClassStatus] = useState<'active' | 'archived'>('active');

  // 3. Quản lý mã tham gia lớp
  const [joinCode, setJoinCode] = useState('CS-9A4F');
  const [isAcceptingStudents, setIsAcceptingStudents] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // 4. Accordion 4 phân vùng cấu hình (Single-open)
  const [activeSection, setActiveSection] = useState<number | null>(1);

  // 5. Cấu hình phân vùng 1: Giới hạn nhóm
  const [minMembers, setMinMembers] = useState(3);
  const [maxMembers, setMaxMembers] = useState(5);
  const [maxGroupsPerStudent, setMaxGroupsPerStudent] = useState(1);

  // 6. Cấu hình phân vùng 2: Quyền tạo & duyệt nhóm
  const [allowSelfCreateGroup, setAllowSelfCreateGroup] = useState(true);
  const [groupApprovalAuthority, setGroupApprovalAuthority] = useState<'default_trio' | 'teacher_only'>('default_trio');

  // 7. Cấu hình phân vùng 3: Bảng ma trận quyền Lớp trưởng
  const [monitorPerms, setMonitorPerms] = useState({
    approveJoin: true,
    editCommonTasks: true,
    editCommonCalendar: true,
    editCommonNotes: true,
    manageGroupMembers: false,
  });

  // 8. Cấu hình phân vùng 4: Mặc định nộp bài sau hạn
  const [lateFirstSubmission, setLateFirstSubmission] = useState<'allow' | 'lock'>('allow');
  const [lateRevision, setLateRevision] = useState<'allow' | 'lock'>('allow');

  // 9. Quản lý Modal & Hộp thoại xác nhận an toàn (Zero-slip safety)
  const [activeModal, setActiveModal] = useState<'none' | 'transfer' | 'delete' | 'archive_confirm'>('none');
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 10. Thông báo tương tác (Feedback Toast)
  const [feedback, setFeedback] = useState<string | null>(null);

  // 11. Nhật ký kiểm toán cấu hình học phần (Settings Audit Log)
  const [auditLogs, setAuditLogs] = useState<SettingsLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '10/11/2026 02:30',
      actor: 'TS. Nguyễn Văn Toàn',
      action: 'Khởi tạo cấu hình học phần & Kích hoạt mã mời tham gia CS-9A4F',
      category: 'lifecycle',
    },
    {
      id: 'log-2',
      timestamp: '10/11/2026 02:35',
      actor: 'TS. Nguyễn Văn Toàn',
      action: 'Thiết lập quy chuẩn nhóm: 3 - 5 thành viên (Mặc định: 1 nhóm/học sinh)',
      category: 'policy',
    },
    {
      id: 'log-3',
      timestamp: '10/11/2026 02:40',
      actor: 'TS. Nguyễn Văn Toàn',
      action: 'Cấp quyền Lớp trưởng: Duyệt vào nhóm, sửa việc/lịch/ghi chú chung',
      category: 'policy',
    },
  ]);

  const addLogEntry = (action: string, category: SettingsLogEntry['category']) => {
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: SettingsLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      actor: 'TS. Nguyễn Văn Toàn',
      action,
      category,
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => {
      setFeedback(null);
    }, 3200);
  };

  // Đóng modal khi bấm Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal !== 'none') {
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  // Sinh mã Join Code ngẫu nhiên 6 ký tự
  const handleRegenerateCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let codePart = '';
    for (let i = 0; i < 4; i++) {
      codePart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `CS-${codePart}`;
    setJoinCode(newCode);
    showToast(`Đã tạo mã tham gia mới: ${newCode}`);
    addLogEntry(`Đổi mã mời tham gia mới: ${newCode}`, 'join_code');
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(joinCode);
      setCopiedCode(true);
      showToast('Đã sao chép mã mời vào bộ nhớ tạm');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleToggleAccepting = () => {
    if (isArchived) return;
    const nextState = !isAcceptingStudents;
    setIsAcceptingStudents(nextState);
    showToast(nextState ? 'Đã mở tiếp nhận học sinh mới' : 'Đã khóa tiếp nhận học sinh mới (Mã mời tạm vô hiệu)');
    addLogEntry(nextState ? 'Mở tiếp nhận học sinh mới qua mã mời' : 'Khóa tiếp nhận học sinh mới (Vô hiệu mã mời)', 'join_code');
  };

  const handleToggleAccordion = (sectionId: number) => {
    setActiveSection(prev => (prev === sectionId ? null : sectionId));
  };

  const handleToggleArchive = () => {
    if (classStatus === 'active') {
      setClassStatus('archived');
      setActiveModal('none');
      showToast('Lớp học đã được chuyển sang kho lưu trữ (Chế độ chỉ đọc)');
      addLogEntry('Chuyển lớp học sang kho lưu trữ (Chế độ chỉ đọc)', 'lifecycle');
    } else {
      setClassStatus('active');
      showToast('Đã khôi phục lớp học sang trạng thái hoạt động');
      addLogEntry('Khôi phục lớp học sang trạng thái hoạt động', 'lifecycle');
    }
  };

  const handleSaveProfile = () => {
    showToast('Đã lưu thông tin học phần');
    addLogEntry(`Cập nhật thông tin học phần: "${profile.name}" (${profile.code})`, 'profile');
  };

  const handleSaveGroupLimits = () => {
    showToast('Đã cập nhật quy mô nhóm');
    addLogEntry(`Cập nhật quy mô nhóm: Sĩ số ${minMembers}-${maxMembers} thành viên, tối đa ${maxGroupsPerStudent} nhóm/học sinh`, 'policy');
  };

  const handleSaveGroupRights = () => {
    showToast('Đã lưu cấu hình quyền tạo và duyệt nhóm');
    addLogEntry(`Cập nhật quyền tạo/duyệt nhóm: Tự lập nhóm=${allowSelfCreateGroup ? 'Bật' : 'Tắt'}, Thẩm quyền duyệt=${groupApprovalAuthority === 'default_trio' ? 'Bộ ba' : 'Chỉ Giáo viên'}`, 'policy');
  };

  const handleSaveMonitorPerms = () => {
    showToast('Đã lưu phân quyền Lớp trưởng');
    addLogEntry('Cập nhật ma trận phân quyền Lớp trưởng', 'policy');
  };

  const handleSaveSubmissionPolicy = () => {
    showToast('Đã lưu chính sách nộp bài');
    addLogEntry(`Cập nhật chính sách nộp bài: Nộp muộn=${lateFirstSubmission === 'allow' ? 'Cho phép' : 'Khóa'}, Sửa sau hạn=${lateRevision === 'allow' ? 'Cho phép' : 'Khóa'}`, 'policy');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetEmail.trim()) return;
    const target = transferTargetEmail.trim();
    setActiveModal('none');
    showToast(`Đã gửi yêu cầu bàn giao chủ lớp cho ${target}`);
    addLogEntry(`Gửi đề nghị bàn giao quyền chủ lớp cho ${target}`, 'lifecycle');
    setTransferTargetEmail('');
  };

  const handleExecuteDelete = () => {
    if (deleteConfirmText.trim() !== profile.name.trim()) return;
    const deletedName = profile.name;
    setActiveModal('none');
    setDeleteConfirmText('');
    showToast(`Đã xóa vĩnh viễn lớp học "${deletedName}"`);
    addLogEntry(`Xóa vĩnh viễn lớp học "${deletedName}"`, 'lifecycle');
  };

  const isArchived = classStatus === 'archived';

  // =========================================================================
  // HỆ THỐNG STYLES NÚT BẤM & TƯƠNG TÁC ĐẠT CHUẨN WCAG AAA (15.8:1)
  // =========================================================================

  // 1. Nút Hành động Chính (Solid Primary - Đen đặc chữ trắng tinh)
  const btnPrimaryStyle: React.CSSProperties = {
    background: 'var(--text-primary)',
    color: 'var(--bg-app)',
    border: '1px solid var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'opacity var(--transition-fast)',
  };

  // 2. Nút Viền Thứ cấp (Outline Secondary - Nền thẻ, viền đậm, chữ đen đậm tương phản cao)
  const btnOutlineStyle: React.CSSProperties = {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'background var(--transition-fast), border-color var(--transition-fast)',
  };

  // 3. Nút Thao tác Trọng yếu (Danger Zone - Trắng đen thuần khiết)
  const btnDangerStyle: React.CSSProperties = {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '860px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-overlay)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
          }}
        >
          <Check size={16} style={{ color: 'var(--text-primary)' }} />
          <span style={{ fontWeight: 600 }}>{feedback}</span>
        </div>
      )}

      {/* Banner thông báo trạng thái Lưu trữ */}
      {isArchived && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Archive size={20} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Lớp học đang trong trạng thái Lưu trữ (Chế độ chỉ đọc)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Mọi hoạt động tạo, sửa nội dung hoặc nộp bài đều tạm dừng. Bạn có thể khôi phục bất cứ lúc nào.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleArchive}
            style={btnOutlineStyle}
          >
            <RotateCcw size={14} />
            <span>Khôi phục lớp học</span>
          </button>
        </div>
      )}

      {/* Header cấp trang */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-divider)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Cài đặt lớp học
          </h1>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid var(--border-strong)',
              background: isArchived ? 'var(--surface-hover)' : 'var(--surface-card)',
              color: 'var(--text-primary)',
            }}
          >
            {isArchived ? 'Đã lưu trữ' : 'Đang hoạt động'}
          </span>
        </div>

        {/* Nút thao tác nhanh chuyển đổi trạng thái */}
        <button
          type="button"
          onClick={() => {
            if (isArchived) {
              handleToggleArchive();
            } else {
              setActiveModal('archive_confirm');
            }
          }}
          title={isArchived ? 'Khôi phục lớp học sang trạng thái hoạt động' : 'Lưu trữ lớp học vào kho'}
          style={btnOutlineStyle}
        >
          <Archive size={14} />
          <span>{isArchived ? 'Khôi phục lớp' : 'Lưu trữ lớp'}</span>
        </button>
      </div>

      {/* TẦNG 1: MÃ MỜI THAM GIA */}
      <section
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}
        aria-labelledby="section-join-code-title"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <Key size={16} />
            </div>
            <h2 id="section-join-code-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Mã mời tham gia
            </h2>
          </div>

          {/* Toggle Switch: Tiếp nhận học sinh mới */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {isAcceptingStudents ? 'Đang mở tiếp nhận' : 'Đã khóa tiếp nhận'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAcceptingStudents}
              aria-label="Bật tắt tiếp nhận học sinh mới tham gia lớp"
              onClick={handleToggleAccepting}
              disabled={isArchived}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: isAcceptingStudents ? 'var(--text-primary)' : 'var(--surface-hover)',
                border: '1px solid var(--border-strong)',
                cursor: isArchived ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'background var(--transition-fast)',
                padding: '2px',
                opacity: isArchived ? 0.4 : 1,
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isAcceptingStudents ? 'var(--bg-app)' : 'var(--text-secondary)',
                  transform: isAcceptingStudents ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform var(--transition-fast)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Khối hiển thị mã OTP & Các nút hành động */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-divider)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            gap: '14px',
            opacity: isAcceptingStudents && !isArchived ? 1 : 0.6,
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Mã mời hiện tại
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '0.12em', marginTop: '2px' }}>
              {isAcceptingStudents ? joinCode : '•••••• (ĐÃ KHÓA)'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyCode}
              disabled={!isAcceptingStudents || isArchived}
              aria-label="Sao chép mã tham gia lớp học"
              style={{
                ...btnOutlineStyle,
                opacity: !isAcceptingStudents || isArchived ? 0.4 : 1,
                cursor: !isAcceptingStudents || isArchived ? 'not-allowed' : 'pointer',
              }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedCode ? 'Đã chép' : 'Sao chép mã'}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerateCode}
              disabled={!isAcceptingStudents || isArchived}
              aria-label="Đổi mã tham gia lớp học mới"
              style={{
                ...btnOutlineStyle,
                opacity: !isAcceptingStudents || isArchived ? 0.4 : 1,
                cursor: !isAcceptingStudents || isArchived ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Đổi mã mới</span>
            </button>
          </div>
        </div>
      </section>

      {/* TẦNG 2: THÔNG TIN HỌC PHẦN */}
      <section
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}
        aria-labelledby="section-profile-title"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BookOpen size={16} style={{ color: 'var(--text-primary)' }} />
          <h2 id="section-profile-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Thông tin học phần
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Tên lớp học
            </label>
            <input
              type="text"
              value={profile.name}
              disabled={isArchived}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Mã môn học
            </label>
            <input
              type="text"
              value={profile.code}
              disabled={isArchived}
              onChange={e => setProfile({ ...profile, code: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Học kỳ & Niên khóa
            </label>
            <input
              type="text"
              value={profile.semester}
              disabled={isArchived}
              onChange={e => setProfile({ ...profile, semester: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Mô tả tóm tắt học phần
          </label>
          <textarea
            rows={2}
            value={profile.description}
            disabled={isArchived}
            onChange={e => setProfile({ ...profile, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="button"
          disabled={isArchived}
          onClick={handleSaveProfile}
          style={{
            ...btnOutlineStyle,
            opacity: isArchived ? 0.4 : 1,
            cursor: isArchived ? 'not-allowed' : 'pointer',
          }}
        >
          Lưu thông tin học phần
        </button>
      </section>

      {/* TẦNG 3: CHÍNH SÁCH LỚP HỌC (SINGLE-OPEN ACCORDION) */}
      <section aria-labelledby="section-policy-title">
        <div style={{ marginBottom: '10px' }}>
          <h2 id="section-policy-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Chính sách học phần
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* PHÂN VÙNG 1: GIỚI HẠN NHÓM */}
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleAccordion(1)}
              aria-expanded={activeSection === 1}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--surface-card)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} style={{ color: 'var(--text-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  1. Giới hạn quy mô nhóm
                </span>
              </div>
              {activeSection === 1 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {activeSection === 1 && (
              <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-divider)', paddingTop: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Sĩ số tối thiểu
                    </label>
                    <select
                      value={minMembers}
                      disabled={isArchived}
                      onChange={e => setMinMembers(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value={2}>Tối thiểu 2 thành viên</option>
                      <option value={3}>Tối thiểu 3 thành viên (Khuyên dùng)</option>
                      <option value={4}>Tối thiểu 4 thành viên</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Sĩ số tối đa
                    </label>
                    <select
                      value={maxMembers}
                      disabled={isArchived}
                      onChange={e => setMaxMembers(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value={3}>Tối đa 3 thành viên</option>
                      <option value={4}>Tối đa 4 thành viên</option>
                      <option value={5}>Tối đa 5 thành viên (Mặc định)</option>
                      <option value={6}>Tối đa 6 thành viên</option>
                      <option value={8}>Tối đa 8 thành viên</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Giới hạn nhóm trên mỗi học sinh
                    </label>
                    <select
                      value={maxGroupsPerStudent}
                      disabled={isArchived}
                      onChange={e => setMaxGroupsPerStudent(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value={1}>Tối đa 1 nhóm đang hoạt động (Mặc định)</option>
                      <option value={2}>Tối đa 2 nhóm</option>
                      <option value={3}>Tối đa 3 nhóm</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isArchived}
                  onClick={handleSaveGroupLimits}
                  style={{
                    ...btnOutlineStyle,
                    opacity: isArchived ? 0.4 : 1,
                    cursor: isArchived ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cập nhật quy mô nhóm
                </button>
              </div>
            )}
          </div>

          {/* PHÂN VÙNG 2: QUYỀN TẠO & DUYỆT NHÓM */}
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleAccordion(2)}
              aria-expanded={activeSection === 2}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--surface-card)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--text-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  2. Quyền tạo & duyệt nhóm
                </span>
              </div>
              {activeSection === 2 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {activeSection === 2 && (
              <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-divider)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Học sinh tự tạo nhóm mới</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Người lập nhóm trở thành Trưởng nhóm kiêm quản trị viên workspace nhóm</div>
                    </div>
                    <button
                      type="button"
                      disabled={isArchived}
                      onClick={() => setAllowSelfCreateGroup(!allowSelfCreateGroup)}
                      style={btnOutlineStyle}
                    >
                      {allowSelfCreateGroup ? 'Đang bật' : 'Đang tắt'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Thẩm quyền duyệt yêu cầu vào nhóm</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Xét duyệt các yêu cầu xin gia nhập nhóm của học sinh</div>
                    </div>
                    <select
                      value={groupApprovalAuthority}
                      disabled={isArchived}
                      onChange={e => setGroupApprovalAuthority(e.target.value as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="default_trio">Giáo viên + Lớp trưởng + Trưởng nhóm</option>
                      <option value="teacher_only">Chỉ riêng Giáo viên chủ lớp</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isArchived}
                  onClick={handleSaveGroupRights}
                  style={{
                    ...btnOutlineStyle,
                    opacity: isArchived ? 0.4 : 1,
                    cursor: isArchived ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cập nhật quyền nhóm
                </button>
              </div>
            )}
          </div>

          {/* PHÂN VÙNG 3: BẢNG MA TRẬN QUYỀN LỚP TRƯỞNG */}
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleAccordion(3)}
              aria-expanded={activeSection === 3}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--surface-card)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={16} style={{ color: 'var(--text-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  3. Phân quyền Lớp trưởng
                </span>
              </div>
              {activeSection === 3 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {activeSection === 3 && (
              <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-divider)', paddingTop: '14px' }}>
                <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '14px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-divider)' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Hành vi được cấp phép</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', width: '110px', textAlign: 'center' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                          <strong>Duyệt yêu cầu vào nhóm</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phê duyệt học sinh gửi yêu cầu gia nhập các nhóm học tập</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={monitorPerms.approveJoin}
                            disabled={isArchived}
                            onChange={e => setMonitorPerms({ ...monitorPerms, approveJoin: e.target.checked })}
                            aria-label="Cho phép Lớp trưởng duyệt yêu cầu vào nhóm"
                          />
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                          <strong>Chỉnh sửa công việc chung mọi nhóm</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Xem và cập nhật tiến độ công việc chung (không gồm quyền xóa mục của người khác)</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={monitorPerms.editCommonTasks}
                            disabled={isArchived}
                            onChange={e => setMonitorPerms({ ...monitorPerms, editCommonTasks: e.target.checked })}
                            aria-label="Cho phép Lớp trưởng sửa công việc chung"
                          />
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                          <strong>Chỉnh sửa sự kiện lịch chung</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cập nhật các mốc lịch chung của lớp học</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={monitorPerms.editCommonCalendar}
                            disabled={isArchived}
                            onChange={e => setMonitorPerms({ ...monitorPerms, editCommonCalendar: e.target.checked })}
                            aria-label="Cho phép Lớp trưởng sửa lịch chung"
                          />
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                          <strong>Chỉnh sửa ghi chú văn bản chung</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sửa nội dung văn bản trong thư viện tài liệu chung</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={monitorPerms.editCommonNotes}
                            disabled={isArchived}
                            onChange={e => setMonitorPerms({ ...monitorPerms, editCommonNotes: e.target.checked })}
                            aria-label="Cho phép Lớp trưởng sửa ghi chú chung"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                          <strong>Mời hoặc đề nghị đưa người ra khỏi nhóm</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ủy quyền điều phối nhân sự nhóm học tập</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={monitorPerms.manageGroupMembers}
                            disabled={isArchived}
                            onChange={e => setMonitorPerms({ ...monitorPerms, manageGroupMembers: e.target.checked })}
                            aria-label="Cho phép Lớp trưởng quản lý thành viên nhóm"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', gap: '8px' }}>
                  <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-primary)' }} />
                  <span>
                    Lớp trưởng không có quyền truy cập Hộp thu riêng hoặc xóa tài liệu của người khác.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isArchived}
                  onClick={handleSaveMonitorPerms}
                  style={{
                    ...btnOutlineStyle,
                    opacity: isArchived ? 0.4 : 1,
                    cursor: isArchived ? 'not-allowed' : 'pointer',
                  }}
                >
                  Lưu phân quyền Lớp trưởng
                </button>
              </div>
            )}
          </div>

          {/* PHÂN VÙNG 4: CHÍNH SÁCH NỘP BÀI SAU HẠN */}
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleAccordion(4)}
              aria-expanded={activeSection === 4}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--surface-card)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={16} style={{ color: 'var(--text-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  4. Chính sách nộp bài sau hạn
                </span>
              </div>
              {activeSection === 4 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {activeSection === 4 && (
              <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-divider)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Cho phép nộp lần đầu khi quá hạn</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Học sinh nộp muộn sẽ được hệ thống tự động gắn nhãn "Nộp muộn"</div>
                    </div>
                    <select
                      value={lateFirstSubmission}
                      disabled={isArchived}
                      onChange={e => setLateFirstSubmission(e.target.value as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="allow">Cho phép nộp muộn (Gắn nhãn)</option>
                      <option value="lock">Khóa nộp bài ngay khi hết hạn</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Cho phép chỉnh sửa bản nộp khi quá hạn</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cho phép cập nhật phiên bản mới sau thời hạn chốt</div>
                    </div>
                    <select
                      value={lateRevision}
                      disabled={isArchived}
                      onChange={e => setLateRevision(e.target.value as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="allow">Cho phép cập nhật phiên bản mới</option>
                      <option value="lock">Khóa sửa bản nộp sau hạn</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isArchived}
                  onClick={handleSaveSubmissionPolicy}
                  style={{
                    ...btnOutlineStyle,
                    opacity: isArchived ? 0.4 : 1,
                    cursor: isArchived ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cập nhật chính sách nộp bài
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TẦNG 4: QUẢN TRỊ TRỌNG YẾU (DANGER ZONE) */}
      <section
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}
        aria-labelledby="section-danger-zone-title"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertTriangle size={16} style={{ color: 'var(--text-primary)' }} />
          <h2 id="section-danger-zone-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Quản trị trọng yếu (Danger Zone)
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 1. Bàn giao quyền chủ lớp */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Bàn giao quyền chủ lớp</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bàn giao toàn bộ quyền Giáo viên chủ nhiệm cho một tài khoản Giáo viên khác</div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('transfer')}
              style={btnOutlineStyle}
            >
              <ArrowRightLeft size={13} />
              <span>Bàn giao chủ lớp</span>
            </button>
          </div>

          {/* 2. Lưu trữ hoặc Khôi phục lớp học */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isArchived ? 'Khôi phục lớp học' : 'Lưu trữ lớp học'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isArchived
                  ? 'Mở lại lớp học từ kho lưu trữ. Cho phép học sinh tiếp tục tương tác và nộp bài.'
                  : 'Đưa lớp vào kho lưu trữ. Toàn bộ nội dung chuyển sang chế độ chỉ đọc.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isArchived) {
                  handleToggleArchive();
                } else {
                  setActiveModal('archive_confirm');
                }
              }}
              style={btnOutlineStyle}
            >
              {isArchived ? <RotateCcw size={13} /> : <Archive size={13} />}
              <span>{isArchived ? 'Khôi phục' : 'Lưu trữ lớp'}</span>
            </button>
          </div>

          {/* 3. Xóa lớp học vĩnh viễn */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-divider)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Xóa lớp học vĩnh viễn</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Xóa hoàn toàn mọi dữ liệu nhóm, điểm số và bài giao. Thao tác không thể hoàn tác.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setActiveModal('delete');
              }}
              style={btnDangerStyle}
            >
              <Trash2 size={13} />
              <span>Xóa vĩnh viễn</span>
            </button>
          </div>
        </div>
      </section>

      {/* TẦNG 5: NHẬT KÝ KIỂM TOÁN CẤU HÌNH (SETTINGS AUDIT LOG) */}
      <section
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
        }}
        aria-labelledby="section-audit-log-title"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} style={{ color: 'var(--text-primary)' }} />
            <h2 id="section-audit-log-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Nhật ký kiểm toán cấu hình học phần
            </h2>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid var(--border-divider)',
              background: 'var(--surface-hover)',
              color: 'var(--text-primary)',
            }}
          >
            {auditLogs.length} sự kiện ghi nhận
          </span>
        </div>

        <div style={{ border: '1px solid var(--border-divider)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-divider)' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)', width: '130px' }}>Thời gian</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)', width: '160px' }}>Tác nhân</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>Nội dung thay đổi</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)', width: '90px', textAlign: 'center' }}>Phân loại</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: idx < auditLogs.length - 1 ? '1px solid var(--border-divider)' : 'none',
                    background: idx % 2 === 0 ? 'var(--surface-card)' : 'var(--surface-hover)',
                  }}
                >
                  <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {log.actor}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--surface-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {log.category === 'join_code' && 'MÃ MỜI'}
                      {log.category === 'profile' && 'HỌC PHẦN'}
                      {log.category === 'policy' && 'CHÍNH SÁCH'}
                      {log.category === 'lifecycle' && 'VÒNG ĐỜI'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL DIALOGS AN TOÀN (ZERO-SLIP SAFETY PATTERN) */}
      {/* ========================================================================= */}

      {/* MODAL 1: BÀN GIAO QUYỀN CHỦ LỚP */}
      {activeModal === 'transfer' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-transfer-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
          onClick={() => setActiveModal('none')}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '460px',
              padding: '22px',
              boxShadow: 'var(--shadow-overlay)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightLeft size={16} style={{ color: 'var(--text-primary)' }} />
                <h3 id="modal-transfer-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Bàn giao quyền chủ lớp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                aria-label="Đóng hộp thoại bàn giao"
                style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Nhập mã định danh tài khoản hoặc email của Giáo viên đồng nghiệp để gửi đề nghị bàn giao quyền chủ nhiệm lớp học.
            </p>

            <form onSubmit={handleExecuteTransfer}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Email / Mã tài khoản Giáo viên nhận bàn giao
                </label>
                <input
                  type="text"
                  required
                  placeholder="vi_du: giaovien.lan@hcmut.edu.vn"
                  value={transferTargetEmail}
                  onChange={e => setTransferTargetEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  style={btnOutlineStyle}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!transferTargetEmail.trim()}
                  style={{
                    ...btnPrimaryStyle,
                    opacity: !transferTargetEmail.trim() ? 0.4 : 1,
                    cursor: !transferTargetEmail.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  Gửi đề nghị bàn giao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XÁC NHẬN LƯU TRỮ LỚP HỌC */}
      {activeModal === 'archive_confirm' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-archive-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
          onClick={() => setActiveModal('none')}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '460px',
              padding: '22px',
              boxShadow: 'var(--shadow-overlay)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Archive size={16} style={{ color: 'var(--text-primary)' }} />
              <h3 id="modal-archive-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Xác nhận lưu trữ lớp học?
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Khi lớp học chuyển sang trạng thái <strong>Lưu trữ</strong>:
              <br />• Toàn bộ học sinh và nhóm chỉ còn quyền xem lịch sử.
              <br />• Các hoạt động nộp bài và chỉnh sửa tài liệu sẽ tạm dừng.
              <br />• Mã tham gia lớp học sẽ tạm thời bị vô hiệu.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                style={btnOutlineStyle}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleToggleArchive}
                style={btnPrimaryStyle}
              >
                Xác nhận lưu trữ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XÓA LỚP HỌC VĨNH VIỄN (ZERO-SLIP RE-TYPING CONFIRMATION) */}
      {activeModal === 'delete' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
          onClick={() => setActiveModal('none')}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '480px',
              padding: '22px',
              boxShadow: 'var(--shadow-overlay)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--text-primary)' }} />
              <h3 id="modal-delete-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Xác nhận xóa vĩnh viễn lớp học
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Hành động này <strong>không thể hoàn tác</strong>. Toàn bộ tài liệu, công việc, danh sách nhóm và các bản nộp bài của sinh viên sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Để xác nhận, vui lòng gõ lại chính xác tên lớp: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-strong)' }}>{profile.name}</code>
              </label>
              <input
                type="text"
                placeholder={profile.name}
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveModal('none');
                  setDeleteConfirmText('');
                }}
                style={btnOutlineStyle}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim() !== profile.name.trim()}
                onClick={handleExecuteDelete}
                style={{
                  ...btnDangerStyle,
                  opacity: deleteConfirmText.trim() === profile.name.trim() ? 1 : 0.35,
                  cursor: deleteConfirmText.trim() === profile.name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Xóa lớp học vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
