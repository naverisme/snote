import React, { useState, useRef, useEffect } from 'react';
import { api, ApiResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { NoteType, TaskPriority } from '@snote/shared';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  FolderKanban,
  Tag,
  Clock,
  Flame,
  MapPin,
  X,
  ChevronDown,
  Plus
} from 'lucide-react';

export type QuickMode = 'NOTE' | 'TASK' | 'EVENT';

interface UnifiedQuickBarProps {
  initialMode?: QuickMode;
  subjects?: any[];
  projects?: any[];
  defaultSubjectId?: string;
  defaultProjectId?: string;
  onItemCreated?: (type: QuickMode, data?: any) => void;
  className?: string;
}

export const UnifiedQuickBar: React.FC<UnifiedQuickBarProps> = ({
  initialMode = 'NOTE',
  subjects = [],
  projects = [],
  defaultSubjectId,
  defaultProjectId,
  onItemCreated,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<QuickMode>(initialMode);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Note Fields ---
  const [noteSubjectId, setNoteSubjectId] = useState(defaultSubjectId || '');
  const [noteProjectId, setNoteProjectId] = useState(defaultProjectId || '');
  const [noteType, setNoteType] = useState<NoteType>(NoteType.GENERAL);

  // --- Task Fields ---
  const [taskSubjectId, setTaskSubjectId] = useState(defaultSubjectId || '');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [taskDueDate, setTaskDueDate] = useState<string>('');

  // --- Event Fields ---
  const [eventSubjectId, setEventSubjectId] = useState(defaultSubjectId || '');
  const [eventType, setEventType] = useState<'CLASS' | 'EXAM' | 'DEADLINE' | 'GROUP_MEETING' | 'PERSONAL'>('CLASS');
  const [eventDate, setEventDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [eventStartTime, setEventStartTime] = useState('08:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventLocation, setEventLocation] = useState('');

  // Mode Theme Configuration (Dựa trên tâm lý học màu sắc)
  const modeConfig = {
    NOTE: {
      label: 'Ghi chú',
      icon: FileText,
      color: '#6366f1',
      bgSubtle: 'rgba(99, 102, 241, 0.12)',
      borderSubtle: 'rgba(99, 102, 241, 0.35)',
      placeholder: 'Ghi nhanh ý tưởng, nội dung bài học hoặc dán liên kết...',
      submitText: 'Lưu Ghi Chú'
    },
    TASK: {
      label: 'Công việc',
      icon: CheckCircle2,
      color: '#10b981',
      bgSubtle: 'rgba(16, 185, 129, 0.12)',
      borderSubtle: 'rgba(16, 185, 129, 0.35)',
      placeholder: 'Thêm công việc, deadline hoặc bài tập cần làm...',
      submitText: 'Tạo Công Việc'
    },
    EVENT: {
      label: 'Lịch trình',
      icon: Calendar,
      color: '#f59e0b',
      bgSubtle: 'rgba(245, 158, 11, 0.12)',
      borderSubtle: 'rgba(245, 158, 11, 0.35)',
      placeholder: 'Thêm tiết học, lịch thi hoặc buổi họp nhóm...',
      submitText: 'Thêm Lịch Trình'
    }
  };

  const currentTheme = modeConfig[activeMode];

  const handleFocus = (mode?: QuickMode) => {
    if (mode) setActiveMode(mode);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    if (!text.trim()) {
      setText('');
    }
  };

  // Click outside & Escape listener to exit quick capture
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const setTaskQuickDueDate = (type: 'TODAY' | 'TOMORROW' | 'NEXT_WEEK') => {
    const d = new Date();
    if (type === 'TOMORROW') d.setDate(d.getDate() + 1);
    else if (type === 'NEXT_WEEK') d.setDate(d.getDate() + 7);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setTaskDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      if (activeMode === 'NOTE') {
        const res = await api.post<ApiResponse<any>>('/notes', {
          content: text.trim(),
          subjectId: noteSubjectId || undefined,
          projectId: noteProjectId || undefined,
          noteType
        });
        showToast('✨ Đã lưu ghi chú thành công!', 'success');
        onItemCreated?.('NOTE', res.data);
      } else if (activeMode === 'TASK') {
        const res = await api.post<ApiResponse<any>>('/tasks', {
          title: text.trim(),
          subjectId: taskSubjectId || undefined,
          priority: taskPriority,
          dueDate: taskDueDate ? new Date(`${taskDueDate}T23:59:59.000Z`).toISOString() : undefined,
          status: 'TODO'
        });
        showToast('🎯 Đã tạo công việc mới!', 'success');
        onItemCreated?.('TASK', res.data);
      } else if (activeMode === 'EVENT') {
        const startIso = new Date(`${eventDate}T${eventStartTime}:00.000Z`).toISOString();
        const endIso = new Date(`${eventDate}T${eventEndTime}:00.000Z`).toISOString();
        const res = await api.post<ApiResponse<any>>('/schedule', {
          title: text.trim(),
          subjectId: eventSubjectId || undefined,
          eventType,
          startTime: startIso,
          endTime: endIso,
          location: eventLocation.trim() || undefined
        });
        showToast('📅 Đã thêm lịch trình mới!', 'success');
        onItemCreated?.('EVENT', res.data);
      }

      setText('');
      setIsExpanded(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo dữ liệu nhanh', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`snote-card ${className}`}
      style={{
        padding: isExpanded ? '14px 18px' : '10px 16px',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--bg-secondary)',
        border: isExpanded ? `1.5px solid ${currentTheme.color}` : '1px solid var(--border-color)',
        boxShadow: isExpanded ? `0 8px 24px -4px ${currentTheme.bgSubtle}` : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      {/* 1. EXPANDED SEGMENTED MODE SELECTOR (Tâm lý học màu sắc 3 nhóm chức năng) */}
      {isExpanded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {(['NOTE', 'TASK', 'EVENT'] as QuickMode[]).map((mode) => {
            const cfg = modeConfig[mode];
            const Icon = cfg.icon;
            const isActive = activeMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setActiveMode(mode);
                  inputRef.current?.focus();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? `1.5px solid ${cfg.color}` : '1px solid transparent',
                  backgroundColor: isActive ? cfg.bgSubtle : 'transparent',
                  color: isActive ? cfg.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? cfg.color : 'currentColor'} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. MAIN INPUT ROW */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              color: currentTheme.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              backgroundColor: currentTheme.bgSubtle,
              flexShrink: 0
            }}
          >
            <Sparkles size={15} />
          </span>

          <input
            ref={inputRef}
            type="text"
            placeholder={isExpanded ? currentTheme.placeholder : '✨ Thu thập nhanh ý tưởng, việc cần làm, lịch học...'}
            value={text}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              } else if (e.key === 'Escape') {
                handleClose();
              }
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 500
            }}
          />

          {/* Quick switcher icons on collapsed state */}
          {!isExpanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => handleFocus('NOTE')}
                title="Ghi chú nhanh"
                style={{
                  background: modeConfig.NOTE.bgSubtle,
                  color: modeConfig.NOTE.color,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <FileText size={12} />
                <span>Ghi chú</span>
              </button>

              <button
                type="button"
                onClick={() => handleFocus('TASK')}
                title="Tạo việc nhanh"
                style={{
                  background: modeConfig.TASK.bgSubtle,
                  color: modeConfig.TASK.color,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={12} />
                <span>Việc làm</span>
              </button>

              <button
                type="button"
                onClick={() => handleFocus('EVENT')}
                title="Thêm lịch nhanh"
                style={{
                  background: modeConfig.EVENT.bgSubtle,
                  color: modeConfig.EVENT.color,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Calendar size={12} />
                <span>Lịch</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. CONTEXTUAL QUICK CHIPS (Chỉ hiển thị các trường liên quan đến Mode được chọn) */}
        {isExpanded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            {/* --- NOTE SPECIFIC CHIPS --- */}
            {activeMode === 'NOTE' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={noteSubjectId}
                  onChange={(e) => setNoteSubjectId(e.target.value)}
                  className="snote-select"
                  style={{ height: '30px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value="">📖 Môn học (Tùy chọn)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                    </option>
                  ))}
                </select>

                <select
                  value={noteProjectId}
                  onChange={(e) => setNoteProjectId(e.target.value)}
                  className="snote-select"
                  style={{ height: '30px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value="">📁 Đồ án / BTL (Tùy chọn)</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>

                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="snote-select"
                  style={{ height: '30px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value={NoteType.GENERAL}>📝 Ghi chú chung</option>
                  <option value={NoteType.LECTURE}>📖 Bài giảng</option>
                  <option value={NoteType.LAB_REPORT}>🧪 Thực hành</option>
                  <option value={NoteType.EXAM_PREP}>🎯 Ôn thi</option>
                  <option value={NoteType.PROJECT_LOG}>🛠️ Dự án</option>
                  <option value={NoteType.MEETING_MINUTES}>👥 Họp nhóm</option>
                </select>
              </div>
            )}

            {/* --- TASK SPECIFIC CHIPS --- */}
            {activeMode === 'TASK' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setTaskQuickDueDate('TODAY')}
                    className={`btn btn-sm ${taskDueDate === new Date().toISOString().split('T')[0] ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '2px 8px', height: '28px' }}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskQuickDueDate('TOMORROW')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px', height: '28px' }}
                  >
                    Ngày mai
                  </button>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="snote-input"
                    style={{ height: '28px', fontSize: '11.5px', padding: '2px 6px', width: '120px' }}
                  />
                </div>

                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="snote-select"
                  style={{ height: '30px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value={TaskPriority.LOW}>🟢 Thấp</option>
                  <option value={TaskPriority.MEDIUM}>🟡 Vừa</option>
                  <option value={TaskPriority.HIGH}>🔴 Cao</option>
                  <option value={TaskPriority.URGENT}>🔥 Khẩn cấp</option>
                </select>

                <select
                  value={taskSubjectId}
                  onChange={(e) => setTaskSubjectId(e.target.value)}
                  className="snote-select"
                  style={{ height: '30px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value="">📖 Gắn môn học</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* --- EVENT SPECIFIC CHIPS --- */}
            {activeMode === 'EVENT' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="snote-input"
                  style={{ height: '28px', fontSize: '11.5px', padding: '2px 6px', width: '120px' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="snote-input"
                    style={{ height: '28px', fontSize: '11.5px', padding: '2px 4px', width: '80px' }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="snote-input"
                    style={{ height: '28px', fontSize: '11.5px', padding: '2px 4px', width: '80px' }}
                  />
                </div>

                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="snote-select"
                  style={{ height: '30px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value="CLASS">🎓 Tiết học</option>
                  <option value="EXAM">🎯 Lịch thi</option>
                  <option value="DEADLINE">⏰ Hạn nộp bài</option>
                  <option value="GROUP_MEETING">👥 Họp nhóm</option>
                  <option value="PERSONAL">⭐ Cá nhân</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Phòng học / Địa điểm..."
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="snote-input"
                    style={{ height: '28px', fontSize: '12px', padding: '2px 8px', width: '130px' }}
                  />
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={!text.trim() || loading}
                className="btn btn-sm"
                style={{
                  fontSize: '12px',
                  padding: '4px 14px',
                  fontWeight: 700,
                  backgroundColor: currentTheme.color,
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                {loading ? 'Đang lưu...' : currentTheme.submitText}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
