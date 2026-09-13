import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api, ApiResponse } from '../../../services/api';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { useToast } from '../../../contexts/ToastContext';
import { NoteCard } from '../components/NoteCard';
import { NoteModal, NoteModalMode } from '../components/NoteModal';
import { TaskModal } from '../../tasks/components/TaskModal';
import { NotesGraphView } from '../components/NotesGraphView';
import { MarkdownViewer } from '../../../components/common/MarkdownViewer';
import { UnifiedQuickBar } from '../../../components/common/UnifiedQuickBar';
import { toggleChecklistItem, detectNoteType } from '../utils/smartNoteParser';
import { NoteType } from '@snote/shared';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Archive,
  Filter,
  X,
  Grid,
  List,
  LayoutGrid,
  Columns,
  Kanban,
  Sparkles,
  Folder,
  FolderKanban,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Eye,
  Tag,
  Bookmark,
  Copy,
  Check,
  CheckSquare,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Network
} from 'lucide-react';

export type NoteViewDensity = 'GRID' | 'COMPACT' | 'LIST' | 'SPLIT' | 'GRAPH' | 'KANBAN';

export const NotesListPage: React.FC = () => {
  const { selectedSubjectId, selectedSemesterId, subjects } = useAppFilter();
  const [notes, setNotes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort State
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL'); // 'ALL' | 'FREE' | `sub_${id}` | `proj_${id}`
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL'); // 'ALL' | NoteType
  const [activeTab, setActiveTab] = useState<'ALL' | 'PINNED' | 'ARCHIVED'>('ALL');
  const [sortBy, setSortBy] = useState<'PINNED_FIRST' | 'NEWEST' | 'OLDEST' | 'TITLE'>('PINNED_FIRST');
  const [viewDensity, setViewDensity] = useState<NoteViewDensity>('GRID');
  const [selectedNoteForSplit, setSelectedNoteForSplit] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<NoteModalMode>('PREVIEW');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskPrefillData, setTaskPrefillData] = useState<any | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const { showToast } = useToast();

  // Keyboard shortcut: '/' for Search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    api.get<ApiResponse<any[]>>('/projects')
      .then((res) => setProjects(res.data || []))
      .catch(() => { });
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubjectId) params.append('subjectId', selectedSubjectId);
      if (search.trim()) params.append('search', search.trim());
      if (activeTab === 'PINNED') params.append('isPinned', 'true');
      if (activeTab === 'ARCHIVED') {
        params.append('isArchived', 'true');
      } else {
        params.append('isArchived', 'false');
      }

      const res = await api.get<ApiResponse<any[]>>(`/notes?${params.toString()}`);
      const fetchedNotes = res.data || [];
      setNotes(fetchedNotes);

      setSelectedNoteForSplit((prev: any) => {
        if (prev && fetchedNotes.some((n: any) => n.id === prev.id)) {
          return prev;
        }
        return fetchedNotes[0] || null;
      });
    } catch {
      showToast('Không thể tải danh sách ghi chú bài học', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId, search, activeTab, showToast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, selectedSemesterId]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ghi chú "${title}" không?`)) return;

    try {
      await api.delete(`/notes/${id}`);
      showToast(`Đã xóa ghi chú "${title}"`, 'success');
      if (selectedNoteForSplit?.id === id) {
        setSelectedNoteForSplit(null);
      }
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa ghi chú', 'error');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const res = await api.patch<ApiResponse<any>>(`/notes/${id}/pin`);
      showToast(res.message || 'Đã cập nhật trạng thái ghim', 'success');
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật ghim', 'error');
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      const res = await api.patch<ApiResponse<any>>(`/notes/${id}/archive`);
      showToast(res.message || 'Đã cập nhật trạng thái lưu trữ', 'success');
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật lưu trữ', 'error');
    }
  };

  const handleCopyContent = (note: any) => {
    if (!note?.content) return;
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    showToast('Đã sao chép nội dung ghi chú!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleNoteTodo = async (noteId: string, todoIndex: number, newContent: string) => {
    // Optimistic UI state update
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, content: newContent } : n)));
    if (selectedNoteForSplit && selectedNoteForSplit.id === noteId) {
      setSelectedNoteForSplit((prev: any) => ({ ...prev, content: newContent }));
    }

    try {
      await api.put(`/notes/${noteId}`, { content: newContent });
    } catch {
      showToast('Lỗi cập nhật trạng thái việc cần làm', 'error');
      fetchNotes();
    }
  };

  const handleOpenCreate = () => {
    setNoteToEdit(null);
    setModalMode('WRITE');
    setIsModalOpen(true);
  };

  const handleOpenView = (note: any) => {
    if (viewDensity === 'SPLIT') {
      setSelectedNoteForSplit(note);
    } else {
      setNoteToEdit(note);
      setModalMode('PREVIEW');
      setIsModalOpen(true);
    }
  };

  const handleOpenEdit = (note: any) => {
    setNoteToEdit(note);
    setModalMode('WRITE');
    setIsModalOpen(true);
  };

  const handleConvertToTask = (note: any) => {
    if (!note) return;
    setTaskPrefillData({
      title: note.title,
      description: note.content || '',
      subjectId: note.subjectId || '',
      projectId: note.projectId || '',
      tags: note.tags || []
    });
    setIsTaskModalOpen(true);
  };

  const handleToggleSelectNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedNoteIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        if (next.length === 0) setIsSelectionMode(false);
        return next;
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedNoteIds(filteredNotes.map((n) => n.id));
      setIsSelectionMode(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedNoteIds([]);
    setIsSelectionMode(false);
  };

  const handleBatchDelete = async () => {
    if (selectedNoteIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedNoteIds.length} bài ghi đã chọn không?`)) return;

    setLoading(true);
    try {
      await Promise.all(selectedNoteIds.map((id) => api.delete(`/notes/${id}`)));
      showToast(`Đã xóa ${selectedNoteIds.length} bài ghi thành công!`, 'success');
      setSelectedNoteIds([]);
      setIsSelectionMode(false);
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa hàng loạt ghi chú', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchPin = async () => {
    if (selectedNoteIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(selectedNoteIds.map((id) => api.patch(`/notes/${id}/pin`)));
      showToast(`Đã ghim ${selectedNoteIds.length} bài ghi!`, 'success');
      setSelectedNoteIds([]);
      setIsSelectionMode(false);
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi ghim hàng loạt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchArchive = async () => {
    if (selectedNoteIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(selectedNoteIds.map((id) => api.patch(`/notes/${id}/archive`)));
      showToast(`Đã lưu trữ ${selectedNoteIds.length} bài ghi!`, 'success');
      setSelectedNoteIds([]);
      setIsSelectionMode(false);
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu trữ hàng loạt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchConvertToTasks = async () => {
    if (selectedNoteIds.length === 0) return;
    const selectedNotes = notes.filter((n) => selectedNoteIds.includes(n.id));
    setLoading(true);
    try {
      await Promise.all(
        selectedNotes.map((note) =>
          api.post('/tasks', {
            title: note.title,
            description: note.content || '',
            subjectId: note.subjectId || undefined,
            projectId: note.projectId || undefined,
            status: 'TODO',
            priority: 'MEDIUM'
          })
        )
      );
      showToast(`Đã tạo thành công ${selectedNotes.length} công việc từ các ghi chú đã chọn!`, 'success');
      setSelectedNoteIds([]);
      setIsSelectionMode(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi chuyển đổi hàng loạt sang công việc', 'error');
    } finally {
      setLoading(false);
    }
  };


  // Filtered and Sorted Notes Calculation
  const filteredNotes = useMemo(() => {
    const list = notes.filter((n) => {
      // 1. Source Filter (Môn học / Đồ án / Tự do)
      if (selectedSourceFilter !== 'ALL') {
        if (selectedSourceFilter === 'FREE') {
          if (n.subjectId || n.projectId) return false;
        } else if (selectedSourceFilter.startsWith('sub_')) {
          const subId = selectedSourceFilter.replace('sub_', '');
          if (n.subjectId !== subId) return false;
        } else if (selectedSourceFilter.startsWith('proj_')) {
          const projId = selectedSourceFilter.replace('proj_', '');
          if (n.projectId !== projId) return false;
        }
      }

      // 2. Note Type Filter
      if (selectedTypeFilter !== 'ALL') {
        if (n.noteType !== selectedTypeFilter) return false;
      }

      return true;
    });

    // Sort Calculation
    return list.sort((a, b) => {
      if (sortBy === 'PINNED_FIRST') {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'TITLE') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [notes, selectedSourceFilter, selectedTypeFilter, sortBy]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  // Compute Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSourceFilter !== 'ALL') count++;
    if (selectedTypeFilter !== 'ALL') count++;
    if (activeTab !== 'ALL') count++;
    if (sortBy !== 'PINNED_FIRST') count++;
    return count;
  }, [selectedSourceFilter, selectedTypeFilter, activeTab, sortBy]);

  // Source Pills for Collapsible Drawer
  const sourcePills = useMemo(() => {
    const pills: { id: string; label: string; count: number; icon: any; color?: string }[] = [
      { id: 'ALL', label: 'Tất cả nguồn', count: notes.length, icon: Folder }
    ];

    subjects.forEach((sub) => {
      const count = notes.filter((n) => n.subjectId === sub.id).length;
      if (count > 0 || selectedSubjectId === sub.id) {
        pills.push({
          id: `sub_${sub.id}`,
          label: sub.code ? `[${sub.code}] ${sub.name}` : sub.name,
          count,
          icon: Folder,
          color: sub.color || 'var(--color-info)'
        });
      }
    });

    projects.forEach((proj) => {
      const count = notes.filter((n) => n.projectId === proj.id).length;
      if (count > 0) {
        pills.push({
          id: `proj_${proj.id}`,
          label: `📁 ${proj.name}`,
          count,
          icon: FolderKanban,
          color: 'var(--color-purple)'
        });
      }
    });

    const freeCount = notes.filter((n) => !n.subjectId && !n.projectId).length;
    if (freeCount > 0) {
      pills.push({
        id: 'FREE',
        label: '📝 Ghi chú tự do',
        count: freeCount,
        icon: Bookmark,
        color: 'var(--text-muted)'
      });
    }

    return pills;
  }, [notes, subjects, projects, selectedSubjectId]);

  const typePills = [
    { id: 'ALL', label: 'Tất cả loại bài' },
    { id: NoteType.LECTURE, label: '📖 Bài giảng' },
    { id: NoteType.LAB_REPORT, label: '🧪 Thực hành' },
    { id: NoteType.EXAM_PREP, label: '🎯 Ôn thi' },
    { id: NoteType.PROJECT_LOG, label: '🛠️ Dự án & BTL' },
    { id: NoteType.MEETING_MINUTES, label: '👥 Họp nhóm' },
    { id: NoteType.GENERAL, label: '📝 Tự do' }
  ];

  const kanbanColumns = [
    { type: NoteType.LECTURE, title: '📖 Bài Giảng Lý Thuyết', color: 'var(--color-info)' },
    { type: NoteType.LAB_REPORT, title: '🧪 Báo Cáo Thực Hành', color: 'var(--color-success)' },
    { type: NoteType.EXAM_PREP, title: '🎯 Đề Cương Ôn Thi', color: 'var(--color-warning)' },
    { type: NoteType.PROJECT_LOG, title: '🛠️ Nhật Ký Dự Án / BTL', color: 'var(--color-purple)' },
    { type: NoteType.GENERAL, title: '📝 Ghi Chú Tự Do', color: 'var(--text-muted)' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Ultra-Clean Minimalist Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '2px'
        }}
      >
        {/* Left: Title + Count + View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Ghi Chú
            </h1>
            <span className="badge badge-neutral" style={{ fontSize: '11px', padding: '2px 8px' }}>
              {filteredNotes.length}{filteredNotes.length !== notes.length ? ` / ${notes.length}` : ''} bài ghi
            </span>
          </div>

          {/* 3 Chế Độ Xem Ghi Chú */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => setViewDensity('GRID')}
              className={`btn btn-sm ${viewDensity === 'GRID' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: viewDensity === 'GRID' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Chế độ xem Lưới thẻ (Bento Grid)"
            >
              <LayoutGrid size={13} />
              <span>Lưới thẻ</span>
            </button>

            <button
              type="button"
              onClick={() => setViewDensity('LIST')}
              className={`btn btn-sm ${viewDensity === 'LIST' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: viewDensity === 'LIST' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Chế độ xem Bảng danh sách"
            >
              <List size={13} />
              <span>Danh sách</span>
            </button>

            <button
              type="button"
              onClick={() => setViewDensity('GRAPH')}
              className={`btn btn-sm ${viewDensity === 'GRAPH' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: viewDensity === 'GRAPH' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: 'var(--radius-sm)',
                color: viewDensity === 'GRAPH' ? '#ffffff' : '#38bdf8'
              }}
              title="Chế độ xem Bản đồ Mạng lưới Tri Thức (Knowledge Graph)"
            >
              <Network size={13} />
              <span>Mạng lưới</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Search + Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Search Input with '/' Shortcut */}
          <div style={{ position: 'relative', width: '230px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <Search size={14} />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm ghi chú... (Phím /)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="snote-input"
              style={{ paddingLeft: '32px', paddingRight: search ? '30px' : '10px', height: '34px', fontSize: '13px' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 0
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ height: '34px', padding: '0 14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Thêm Ghi Chú</span>
          </button>
        </div>
      </div>

      {/* 3. Horizontal Scroll Tab Bar: Sources + Status Tabs + Sort Dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {/* Scrollable Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', flex: 1, padding: '2px 0' }}>
          {sourcePills.map((pill) => {
            const isActive = selectedSourceFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedSourceFilter(pill.id)}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <span>{pill.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    opacity: 0.75,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-tertiary)',
                    padding: '1px 5px',
                    borderRadius: '999px'
                  }}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Status Tabs + Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Status Tabs: Tất cả | Ghim | Lưu trữ */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('PINNED')}
              className={`btn btn-sm ${activeTab === 'PINNED' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Pin size={11} style={{ fill: activeTab === 'PINNED' ? 'currentColor' : 'none' }} />
              <span>Ghim</span>
            </button>
            <button
              onClick={() => setActiveTab('ARCHIVED')}
              className={`btn btn-sm ${activeTab === 'ARCHIVED' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Archive size={11} />
              <span>Lưu trữ</span>
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="snote-select"
            style={{ fontSize: '11.5px', padding: '4px 8px', height: '28px' }}
          >
            <option value="PINNED_FIRST">📌 Ghim lên đầu</option>
            <option value="NEWEST">🕒 Mới nhất</option>
            <option value="OLDEST">⏳ Cũ nhất</option>
            <option value="TITLE">🔤 Tên A-Z</option>
          </select>
        </div>
      </div>

      {/* 3. Main Notes Content Area (Tập trung toàn bộ không gian cho bài ghi) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Sparkles size={18} className="pulse-urgent" style={{ color: 'var(--accent-primary)' }} />
            <span>Đang tải các bài ghi chép...</span>
          </div>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div
          className="snote-card stagger-card"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}
          >
            <BookOpen size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Không tìm thấy bài ghi chép nào
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Thử tìm kiếm với từ khóa khác hoặc tạo một ghi chú mới ngay bây giờ.
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            <Plus size={14} />
            <span>Tạo Ghi Chú Mới</span>
          </button>
        </div>
      ) : viewDensity === 'GRAPH' ? (
        /* GRAPH VIEW: Interactive Knowledge Network Graph (Obsidian-Style) */
        <NotesGraphView
          notes={notes}
          subjects={subjects}
          projects={projects}
          onSelectNote={handleOpenView}
          onEditNote={handleOpenEdit}
        />
      ) : viewDensity === 'SPLIT' ? (
        /* SPLIT VIEW: Dual-Pane IDE Notebook Reader */
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Note List Tree */}
          <div
            className="snote-card"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-lg)',
              maxHeight: 'calc(100vh - 160px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {filteredNotes.map((note) => {
              const isSelected = selectedNoteForSplit?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteForSplit(note)}
                  className="snote-card stagger-card"
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                    border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                      {note.noteType}
                    </span>
                    {note.subject ? (
                      <span className="badge badge-blue" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                        {note.subject.code || note.subject.name}
                      </span>
                    ) : note.project ? (
                      <span className="badge badge-purple" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                        📁 {note.project.name}
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                        📝 Tự do
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', lineHeight: 1.3 }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Markdown Reader */}
          <div
            className="snote-card"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              minHeight: '600px',
              maxHeight: 'calc(100vh - 160px)',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            {selectedNoteForSplit ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {selectedNoteForSplit.title}
                    </h2>
                    {/* Subtle Metadata String */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span>📅 {new Date(selectedNoteForSplit.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {selectedNoteForSplit.subject && (
                        <>
                          <span>•</span>
                          <span style={{ color: selectedNoteForSplit.subject.color || 'var(--accent-primary)', fontWeight: 600 }}>
                            📖 [{selectedNoteForSplit.subject.code}] {selectedNoteForSplit.subject.name}
                          </span>
                        </>
                      )}
                      {selectedNoteForSplit.project && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--color-purple)', fontWeight: 600 }}>📁 {selectedNoteForSplit.project.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>🏷️ {selectedNoteForSplit.noteType}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleConvertToTask(selectedNoteForSplit)}
                      className="btn btn-secondary btn-sm"
                      title="Chuyển ghi chú thành công việc (Task)"
                      style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--color-success)', fontWeight: 600 }}
                    >
                      <CheckSquare size={13} />
                      <span>Tạo Task</span>
                    </button>
                    <button
                      onClick={() => handleCopyContent(selectedNoteForSplit)}
                      className="btn btn-secondary btn-sm"
                      title="Sao chép nội dung bài ghi"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      {copiedId === selectedNoteForSplit.id ? <Check size={13} style={{ color: 'var(--color-success)' }} /> : <Copy size={13} />}
                      <span>{copiedId === selectedNoteForSplit.id ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(selectedNoteForSplit)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', padding: '4px 10px', fontWeight: 600 }}
                    >
                      <Edit3 size={13} />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedNoteForSplit.id, selectedNoteForSplit.title)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      title="Xóa bài ghi"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '8px 0' }}>
                  <MarkdownViewer
                    content={selectedNoteForSplit.content}
                    onToggleTodo={(todoIndex) => {
                      const newContent = toggleChecklistItem(selectedNoteForSplit.content || '', todoIndex);
                      handleToggleNoteTodo(selectedNoteForSplit.id, todoIndex, newContent);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
                Chọn một ghi chú ở cột bên trái để xem nội dung chi tiết
              </div>
            )}
          </div>
        </div>
      ) : viewDensity === 'COMPACT' ? (
        /* COMPACT BENTO VIEW: 4-5 Column Dense Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '12px' }}>
          {filteredNotes.map((note: any) => (
            <div
              key={note.id}
              onClick={() => handleOpenView(note)}
              className="snote-card stagger-card"
              style={{
                padding: '14px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                border: note.isPinned ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '160px',
                boxShadow: note.isPinned ? 'var(--shadow-accent)' : 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                      {note.noteType}
                    </span>
                    {note.subject ? (
                      <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 4px' }}>
                        {note.subject.code || note.subject.name}
                      </span>
                    ) : note.project ? (
                      <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 4px' }}>
                        📁 {note.project.name}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleConvertToTask(note)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ padding: '2px', color: 'var(--color-success)' }}
                      title="Chuyển thành Task"
                    >
                      <CheckSquare size={12} />
                    </button>
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ padding: '2px', color: note.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                      title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}
                    >
                      <Pin size={12} style={{ fill: note.isPinned ? 'currentColor' : 'none' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ padding: '2px', color: 'var(--color-danger)' }}
                      title="Xóa"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.title}
                </h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.35 }}>
                  {note.content.replace(/[#*`_]/g, '')}
                </p>
              </div>

              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : viewDensity === 'KANBAN' ? (
        /* KANBAN FLOW VIEW: Categorized by Note Types */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', alignItems: 'start' }}>
          {kanbanColumns.map((col) => {
            const columnNotes = filteredNotes.filter((n) => n.noteType === col.type);
            return (
              <div
                key={col.type}
                className="snote-card"
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: '380px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {col.title}
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                    {columnNotes.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                  {columnNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                      Chưa có bài ghi
                    </div>
                  ) : (
                    columnNotes.map((note: any) => (
                      <div
                        key={note.id}
                        onClick={() => handleOpenView(note)}
                        className="snote-card stagger-card"
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-primary)',
                          cursor: 'pointer',
                          border: note.isPinned ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                          {note.title}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                          {note.subject && <span style={{ color: 'var(--accent-primary)' }}>{note.subject.code || note.subject.name}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewDensity === 'GRID' ? (
        /* GRID VIEW: Responsive Dynamic Masonry Multi-Column Layout (Zero wasted space for small/large notes) */
        activeTab === 'ALL' && !search.trim() && pinnedNotes.length > 0 && otherNotes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Pinned Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px'
                }}
              >
                <Pin size={12} style={{ fill: 'currentColor' }} />
                <span>Đã ghim ({pinnedNotes.length})</span>
              </div>
              <div className="notes-bento-grid">
                {pinnedNotes.map((note: any) => (
                  <div key={note.id} className="note-bento-item">
                    <NoteCard
                      note={note}
                      onView={handleOpenView}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                      onConvertToTask={handleConvertToTask}
                      isSelected={selectedNoteIds.includes(note.id)}
                      onToggleSelect={handleToggleSelectNote}
                      isSelectionMode={selectedNoteIds.length > 0 || isSelectionMode}
                      onToggleTodo={handleToggleNoteTodo}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Other Notes Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px'
                }}
              >
                <BookOpen size={12} />
                <span>Ghi chú khác ({otherNotes.length})</span>
              </div>
              <div className="notes-bento-grid">
                {otherNotes.map((note: any) => (
                  <div key={note.id} className="note-bento-item">
                    <NoteCard
                      note={note}
                      onView={handleOpenView}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                      onConvertToTask={handleConvertToTask}
                      isSelected={selectedNoteIds.includes(note.id)}
                      onToggleSelect={handleToggleSelectNote}
                      isSelectionMode={selectedNoteIds.length > 0 || isSelectionMode}
                      onToggleTodo={handleToggleNoteTodo}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="notes-bento-grid">
            {filteredNotes.map((note: any) => (
              <div key={note.id} className="note-bento-item">
                <NoteCard
                  note={note}
                  onView={handleOpenView}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                  onToggleArchive={handleToggleArchive}
                  onConvertToTask={handleConvertToTask}
                  isSelected={selectedNoteIds.includes(note.id)}
                  onToggleSelect={handleToggleSelectNote}
                  isSelectionMode={selectedNoteIds.length > 0 || isSelectionMode}
                  onToggleTodo={handleToggleNoteTodo}
                />
              </div>
            ))}
          </div>
        )
      ) : (
        /* LIST VIEW: Full-width Table Rows with Multi-select Checkboxes */
        <div className="snote-card" style={{ padding: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                <th style={{ padding: '10px 14px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedNoteIds.length > 0 && selectedNoteIds.length === filteredNotes.length}
                    onChange={handleSelectAll}
                    style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    title="Chọn tất cả"
                  />
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Tiêu đề ghi chú</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Phân loại</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Môn học / Dự án</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Ngày tạo</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note: any) => {
                const isSelected = selectedNoteIds.includes(note.id);
                return (
                  <tr
                    key={note.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                      transition: 'var(--transition-fast)'
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelectNote(note.id, e as any)}
                        style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => handleOpenView(note)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {note.isPinned && <Pin size={12} style={{ color: 'var(--accent-primary)', fill: 'currentColor' }} />}
                        <span>{note.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{note.noteType}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {note.subject ? (
                        <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                          {note.subject.code ? `[${note.subject.code}] ` : ''}{note.subject.name}
                        </span>
                      ) : note.project ? (
                        <span className="badge badge-purple" style={{ fontSize: '10px' }}>📁 {note.project.name}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>📝 Tự do</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          onClick={() => handleConvertToTask(note)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Chuyển thành công việc (Task)"
                          style={{ color: 'var(--color-success)' }}
                        >
                          <CheckSquare size={13} />
                        </button>
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title={note.isPinned ? 'Bỏ ghim' : 'Ghim bài ghi'}
                          style={{ color: note.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                        >
                          <Pin size={13} style={{ fill: note.isPinned ? 'currentColor' : 'none' }} />
                        </button>
                        <button
                          onClick={() => handleOpenView(note)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Xem trước"
                          style={{ color: 'var(--color-info)' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(note)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Chỉnh sửa"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id, note.title)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Xóa"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={13} />
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

      {/* Floating Batch Action Bar (Xuất hiện khi chọn nhiều bài ghi) */}
      {selectedNoteIds.length > 0 && (
        <div className="floating-batch-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '10px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
              Đã chọn {selectedNoteIds.length} bài ghi
            </span>
            <button
              onClick={handleSelectAll}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '2px 8px', color: 'var(--accent-primary)', fontWeight: 700 }}
            >
              {selectedNoteIds.length === filteredNotes.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleBatchConvertToTasks}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', color: 'var(--color-success)', fontWeight: 700 }}
              title="Tạo công việc từ các ghi chú đã chọn"
            >
              <CheckSquare size={13} />
              <span>Chuyển thành Task</span>
            </button>
            <button
              onClick={handleBatchPin}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
              title="Ghim các ghi chú đã chọn"
            >
              <Pin size={13} />
              <span>Ghim</span>
            </button>
            <button
              onClick={handleBatchArchive}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
              title="Lưu trữ các ghi chú đã chọn"
            >
              <Archive size={13} />
              <span>Lưu trữ</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', color: 'var(--color-danger)', fontWeight: 700 }}
              title="Xóa các ghi chú đã chọn"
            >
              <Trash2 size={13} />
              <span>Xóa ({selectedNoteIds.length})</span>
            </button>
            <button
              onClick={handleClearSelection}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ color: 'var(--text-muted)', marginLeft: '4px' }}
              title="Đóng thanh thao tác"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Note Edit / Create / View Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNoteToEdit(null);
        }}
        onSuccess={() => {
          fetchNotes();
        }}
        noteToEdit={noteToEdit}
        initialMode={modalMode}
      />

      {/* Convert Note to Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskPrefillData(null);
        }}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          setTaskPrefillData(null);
          showToast('Đã tạo công việc từ ghi chú thành công!', 'success');
        }}
        taskToEdit={taskPrefillData}
        initialMode="EDIT"
      />
    </div>
  );
};
