import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, ApiResponse } from '../../../services/api';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { useToast } from '../../../contexts/ToastContext';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { TasksListView } from '../components/TasksListView';
import { TasksEisenhowerView } from '../components/TasksEisenhowerView';
import { getTaskDueStatus } from '../../../utils/dateUtils';
import { TaskStatus, TaskPriority } from '@snote/shared';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Flame,
  ListTodo,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
  FolderKanban,
  Columns3,
  ListFilter,
  LayoutGrid,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const TasksListPage: React.FC = () => {
  const { selectedSubjectId, selectedSemesterId, subjects } = useAppFilter();
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST' | 'EISENHOWER'>(() => {
    return (localStorage.getItem('snote_tasks_view_mode') as any) || 'KANBAN';
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterProjectId, setFilterProjectId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const { showToast } = useToast();

  const handleSelectViewMode = (mode: 'KANBAN' | 'LIST' | 'EISENHOWER') => {
    setViewMode(mode);
    localStorage.setItem('snote_tasks_view_mode', mode);
  };

  useEffect(() => {
    api.get<ApiResponse<any[]>>('/projects')
      .then((res) => setProjects(res.data || []))
      .catch(() => { });
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubjectId) params.append('subjectId', selectedSubjectId);
      if (filterPriority !== 'ALL') params.append('priority', filterPriority);
      if (filterProjectId !== 'ALL') params.append('projectId', filterProjectId);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get<ApiResponse<any[]>>(`/tasks?${params.toString()}`);
      setTasks(res.data || []);
    } catch {
      showToast('Không thể tải danh sách công việc', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId, filterPriority, filterProjectId, search, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, selectedSemesterId]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa công việc "${title}" không?`)) return;

    try {
      await api.delete(`/tasks/${id}`);
      showToast(`Đã xóa công việc "${title}"`, 'success');
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa công việc', 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus = currentStatus === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    try {
      await api.patch(`/tasks/${id}/status`, { status: nextStatus });
      if (nextStatus === TaskStatus.DONE) {
        triggerCelebration();
        showToast('🎉 Tuyệt vời! Bạn đã hoàn thành công việc!', 'success');
      } else {
        showToast('Đã chuyển công việc về danh sách Cần làm', 'info');
      }
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleMoveStatus = async (id: string, newStatus: TaskStatus) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      if (newStatus === TaskStatus.DONE) {
        triggerCelebration();
        showToast('🎉 Tuyệt vời! Đã hoàn tất bài tập!', 'success');
      } else if (newStatus === TaskStatus.IN_PROGRESS) {
        showToast('⚡ Đang thực hiện công việc...', 'info');
      } else {
        showToast('Đã cập nhật trạng thái công việc', 'info');
      }
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi chuyển trạng thái', 'error');
    }
  };

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE);
  // Count overdue tasks (Chỉ tính quá hạn khi đã vượt quá thời điểm deadline)
  const overdueCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === TaskStatus.DONE || !t.dueDate) return false;
      return getTaskDueStatus(t.dueDate, false).isOverdue;
    }).length;
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedPercent = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

  const columns = [
    {
      id: 'todo',
      title: 'Cần Làm',
      count: todoTasks.length,
      items: todoTasks,
      icon: ListTodo,
      accentColor: 'var(--color-info)',
      badgeClass: 'badge-blue'
    },
    {
      id: 'in_progress',
      title: 'Đang Thực Hiện',
      count: inProgressTasks.length,
      items: inProgressTasks,
      icon: Zap,
      accentColor: 'var(--color-warning)',
      badgeClass: 'badge-amber'
    },
    {
      id: 'done',
      title: 'Đã Hoàn Thành',
      count: doneTasks.length,
      items: doneTasks,
      icon: CheckCircle2,
      accentColor: 'var(--color-success)',
      badgeClass: 'badge-green'
    }
  ];

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 2. Top Header Toolbar: Metrics & View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left: View Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            gap: '3px'
          }}
        >
          <button
            onClick={() => handleSelectViewMode('KANBAN')}
            className={`btn btn-sm ${viewMode === 'KANBAN' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              fontSize: '12.5px',
              fontWeight: viewMode === 'KANBAN' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: viewMode === 'KANBAN' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'KANBAN' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <Columns3 size={15} />
            <span>Bảng lịch trình</span>
          </button>

        <button
          onClick={() => handleSelectViewMode('LIST')}
          className={`btn btn-sm ${viewMode === 'LIST' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            fontSize: '12.5px',
            fontWeight: viewMode === 'LIST' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: viewMode === 'LIST' ? 'var(--accent-primary)' : 'transparent',
            color: viewMode === 'LIST' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          <ListFilter size={15} />
          <span>Danh sách Hạn chót</span>
        </button>

        <button
          onClick={() => handleSelectViewMode('EISENHOWER')}
          className={`btn btn-sm ${viewMode === 'EISENHOWER' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            fontSize: '12.5px',
            fontWeight: viewMode === 'EISENHOWER' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: viewMode === 'EISENHOWER' ? 'var(--accent-primary)' : 'transparent',
            color: viewMode === 'EISENHOWER' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          <LayoutGrid size={15} />
          <span>Ma trận Eisenhower (2x2)</span>
        </button>
      </div>

      {/* Right: Metrics & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {overdueCount > 0 && (
          <span
            className="badge"
            style={{
              fontSize: '11.5px',
              padding: '4px 9px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertTriangle size={13} />
            {overdueCount} Quá hạn
          </span>
        )}

        <span className="badge badge-green" style={{ fontSize: '11.5px', padding: '4px 9px', fontWeight: 700 }}>
          {doneTasks.length}/{totalTasks} Hoàn thành ({completedPercent}%)
        </span>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm"
          style={{ padding: '7px 14px', fontWeight: 700, gap: '5px' }}
        >
          <Plus size={15} />
          <span>Thêm Chi Tiết</span>
        </button>
      </div>
    </div>

      {/* 3. Search & Filter Bar */ }
  <div
    className="snote-card"
    style={{
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      borderRadius: 'var(--radius-lg)'
    }}
  >
    {/* Search */}
    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
        <Search size={16} />
      </span>
      <input
        type="text"
        placeholder="Tìm kiếm bài tập, hạn nộp hoặc công việc..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="snote-input"
        style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '14px' }}
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          style={{
            position: 'absolute',
            right: '10px',
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
          <X size={14} />
        </button>
      )}
    </div>

    {/* Project Filter */}
    <div style={{ minWidth: '180px' }}>
      <select
        value={filterProjectId}
        onChange={(e) => setFilterProjectId(e.target.value)}
        className="snote-select"
        style={{ fontSize: '13px' }}
      >
        <option value="ALL">Tất cả dự án & việc</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            📁 {p.name}
          </option>
        ))}
      </select>
    </div>

    {/* Priority Filter */}
    <div style={{ minWidth: '180px' }}>
      <select
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value)}
        className="snote-select"
        style={{ fontSize: '13px' }}
      >
        <option value="ALL">Tất cả mức ưu tiên</option>
        <option value={TaskPriority.URGENT}>🔴 Khẩn cấp (Urgent)</option>
        <option value={TaskPriority.HIGH}>🟠 Cao (High)</option>
        <option value={TaskPriority.MEDIUM}>🟡 Trung bình (Medium)</option>
        <option value={TaskPriority.LOW}>🟢 Thấp (Low)</option>
      </select>
    </div>
  </div>

  {/* 4. Main Tasks Area: Conditional Rendering based on ViewMode */ }
  {
    loading ? (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <Sparkles size={18} className="pulse-urgent" style={{ color: 'var(--accent-primary)' }} />
          <span>Đang đồng bộ danh sách công việc...</span>
        </div>
      </div>
    ) : viewMode === 'LIST' ? (
      <TasksListView
        tasks={tasks}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onMoveStatus={handleMoveStatus}
      />
    ) : viewMode === 'EISENHOWER' ? (
      <TasksEisenhowerView
        tasks={tasks}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onMoveStatus={handleMoveStatus}
        onOpenCreate={handleOpenCreate}
      />
    ) : (
      /* Kanban Board Grid */
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="snote-card"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: 'var(--radius-xl)',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: col.accentColor, display: 'flex' }}>
                    <Icon size={18} />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {col.title}
                  </h3>
                </div>
                <span className={`badge ${col.badgeClass}`} style={{ fontSize: '12px', fontWeight: 700 }}>
                  {col.count}
                </span>
              </div>

              {/* Column Task Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {col.items.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px 16px',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      marginTop: '10px'
                    }}
                  >
                    Không có công việc nào trong mục này
                  </div>
                ) : (
                  col.items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onMoveStatus={handleMoveStatus}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  {/* Modal Form */ }
  <TaskModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSuccess={fetchTasks}
    taskToEdit={taskToEdit}
  />
    </div >
  );
};

