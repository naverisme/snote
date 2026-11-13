import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { taskApi } from './api';
import { listWorkspaces } from '../../shared/api';
import { vietnamDateTimeParts } from '../../shared/time-zone';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskFilters } from './TaskFilters';
import { TaskGanttView } from './TaskGanttView';
import { TaskListView } from './TaskListView';
import type {
  ChecklistItemViewModel,
  Task,
  TaskFilter,
  TaskSortMode,
  TaskViewMode,
  WorkSessionViewModel,
} from './types';

interface TasksContainerProps {
  workspaceId?: string; // If undefined, represents "Việc của tôi" (TASK-01)
  isPersonalWorkspace?: boolean;
  timeZone?: string;
  onUnauthorized?: () => void;
  initialViewMode?: TaskViewMode;
}

export const TasksContainer: React.FC<TasksContainerProps> = ({
  workspaceId,
  isPersonalWorkspace = false,
  timeZone = 'Asia/Ho_Chi_Minh',
  onUnauthorized,
  initialViewMode,
}) => {
  const [viewMode, setViewMode] = useState<TaskViewMode>(initialViewMode ?? 'gantt');

  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);
  const [isTransitioningView, setIsTransitioningView] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [sortMode, setSortMode] = useState<TaskSortMode>('next_tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checklistMap, setChecklistMap] = useState<Record<string, ChecklistItemViewModel[]>>({});
  const [workSessions, setWorkSessions] = useState<WorkSessionViewModel[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // QA-13: Request sequence tracker to discard stale in-flight responses
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // QA-13: Detect reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleViewModeChange = (newMode: TaskViewMode) => {
    if (newMode === viewMode) return;
    if (prefersReducedMotion) {
      setViewMode(newMode);
      return;
    }
    // 140ms - 220ms smooth layout transition (CLS = 0)
    setIsTransitioningView(true);
    setTimeout(() => {
      setViewMode(newMode);
      setIsTransitioningView(false);
    }, 160);
  };

  const loadData = useCallback(async () => {
    // Abort previous in-flight request (QA-13)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const reqId = ++activeRequestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      let loadedTasks: Task[];
      if (workspaceId) {
        loadedTasks = await taskApi.listWorkspaceTasks(workspaceId, { signal: controller.signal });
      } else {
        loadedTasks = await taskApi.listMyTasks(activeFilter, timeZone, { signal: controller.signal });
      }

      // If a newer request has started, discard this result (QA-13)
      if (reqId !== activeRequestIdRef.current) return;

      const [sessionResult, checklistResults] = await Promise.all([
        taskApi.listWorkSessions({ signal: controller.signal }).then(data => ({ data, failed: false }), () => ({ data: [] as WorkSessionViewModel[], failed: true })),
        Promise.allSettled(loadedTasks.map(task => taskApi.listChecklistItems(task.id, { signal: controller.signal }))),
      ]);
      if (reqId !== activeRequestIdRef.current) return;

      setTasks(loadedTasks);
      setChecklistMap(Object.fromEntries(loadedTasks.map((task, index) => [task.id,
        checklistResults[index].status === 'fulfilled' ? checklistResults[index].value : [],
      ])));
      setWorkSessions(sessionResult.data);
      setError(sessionResult.failed || checklistResults.some(result => result.status === 'rejected')
        ? 'Một số checklist hoặc buổi làm chưa tải được. Hãy thử làm mới.' : null);
    } catch (err: unknown) {
      if (reqId !== activeRequestIdRef.current) return;
      if (err instanceof Error && err.name === 'AbortError') return;

      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('401') || msg.includes('UNAUTHENTICATED')) {
        setTasks([]);
        setChecklistMap({});
        setWorkSessions([]);
        setSelectedTaskId(undefined);
        onUnauthorized?.();
      } else if (msg.includes('403') || msg.includes('FORBIDDEN')) {
        // QA-13: Immediate purge on revoked access
        setTasks([]);
        setChecklistMap({});
        setWorkSessions([]);
        setSelectedTaskId(undefined);
        onUnauthorized?.();
        setError('Bạn không có quyền truy cập danh sách công việc này (403 Forbidden).');
      } else if (msg.includes('404') || msg.includes('NOT_FOUND')) {
        setTasks([]);
        setChecklistMap({});
        setWorkSessions([]);
        setSelectedTaskId(undefined);
        setError('Không tìm thấy workspace công việc tương ứng (404 Not Found).');
      } else if (msg.includes('500')) {
        setTasks([]);
        setChecklistMap({});
        setWorkSessions([]);
        setSelectedTaskId(undefined);
        setError('Lỗi máy chủ nội bộ khi tải danh sách công việc (500). Vui lòng thử lại sau.');
      } else {
        setTasks([]);
        setChecklistMap({});
        setWorkSessions([]);
        setSelectedTaskId(undefined);
        setError('Không thể tải danh sách công việc. Vui lòng thử lại.');
      }
    } finally {
      if (reqId === activeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [workspaceId, activeFilter, timeZone, onUnauthorized]);

  useEffect(() => {
    void loadData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  // Selected task object
  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId);
  }, [tasks, selectedTaskId]);

  // Filter & Search logic
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }

    // Filters
    const now = new Date();
    const todayStr = vietnamDateTimeParts(now).date;
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowStr = vietnamDateTimeParts(tomorrow).date;

    if (activeFilter === 'today') {
      result = result.filter(t => {
        const isDueToday = t.dueAt ? vietnamDateTimeParts(t.dueAt).date === todayStr : false;
        const hasSessionToday = workSessions.some(s => s.taskId === t.id && vietnamDateTimeParts(s.startAt).date === todayStr);
        return isDueToday || hasSessionToday;
      });
    } else if (activeFilter === 'tomorrow') {
      result = result.filter(t => {
        const isDueTomorrow = t.dueAt ? vietnamDateTimeParts(t.dueAt).date === tomorrowStr : false;
        const hasSessionTomorrow = workSessions.some(s => s.taskId === t.id && vietnamDateTimeParts(s.startAt).date === tomorrowStr);
        return isDueTomorrow || hasSessionTomorrow;
      });
    } else if (activeFilter === 'important') {
      result = result.filter(t => t.importance === 'high');
    } else if (activeFilter === 'upcoming') {
      result = result.filter(t => t.dueAt && vietnamDateTimeParts(t.dueAt).date > tomorrowStr);
    }

    // Sorting (TASK-11, TASK-17)
    if (sortMode === 'importance') {
      const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
      result = [...result].sort((a, b) => (rank[b.importance] ?? 0) - (rank[a.importance] ?? 0));
    } else if (sortMode === 'due_date') {
      result = [...result].sort((a, b) => {
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
    } else {
      // Default: "Việc tiếp theo" (TASK-11, TASK-17)
      const isOverdue = (t: Task) => Boolean(t.status !== 'done' && t.dueAt && new Date(t.dueAt).getTime() < now.getTime());
      const isDueToday = (t: Task) => Boolean(t.dueAt && vietnamDateTimeParts(t.dueAt).date === todayStr);
      const hasSessionToday = (t: Task) => workSessions.some(s => s.taskId === t.id && vietnamDateTimeParts(s.startAt).date === todayStr);

      const gOverdue: Task[] = [];
      const gToday: Task[] = [];
      const gSession: Task[] = [];
      const gUnscheduled: Task[] = [];
      const gOther: Task[] = [];

      for (const t of result) {
        if (isOverdue(t)) gOverdue.push(t);
        else if (isDueToday(t)) gToday.push(t);
        else if (hasSessionToday(t)) gSession.push(t);
        else if (!t.dueAt) gUnscheduled.push(t);
        else gOther.push(t);
      }

      gOverdue.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
      gToday.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
      const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
      gUnscheduled.sort((a, b) => (rank[b.importance] ?? 0) - (rank[a.importance] ?? 0));

      result = [...gOverdue, ...gToday, ...gSession, ...gUnscheduled, ...gOther];
    }

    return result;
  }, [tasks, searchQuery, activeFilter, sortMode, workSessions]);

  const upcomingCount = useMemo(() => {
    const tomorrowStr = vietnamDateTimeParts(new Date(Date.now() + 86400000)).date;
    return tasks.filter(t => t.dueAt && vietnamDateTimeParts(t.dueAt).date > tomorrowStr).length;
  }, [tasks]);

  // Actions
  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      let targetWorkspaceId = workspaceId;
      if (!targetWorkspaceId) {
        try {
          targetWorkspaceId = (await listWorkspaces()).data.find(ws => ws.kind === 'default')?.id;
        } catch {
          setError('Không thể xác định workspace cá nhân. Vui lòng thử lại.');
          return;
        }
      }
      if (!targetWorkspaceId) {
        setError('Chưa xác định được workspace để tạo việc. Vui lòng chọn lại workspace.');
        return;
      }
      const newTask = await taskApi.createTask(targetWorkspaceId, {
        title: newTitle.trim(),
        importance: 'medium',
      });
      setTasks(prev => [newTask, ...prev]);
      setSelectedTaskId(newTask.id);
      setNewTitle('');
      setCreateOpen(false);
    } catch {
      setError('Không thể tạo công việc. Nội dung đã nhập vẫn được giữ để thử lại.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTaskId) return;
    try {
      const updated = await taskApi.updateTask(selectedTaskId, updates);
      setTasks(prev => prev.map(t => (t.id === selectedTaskId ? updated : t)));
    } catch {
      setError('Không thể cập nhật công việc. Vui lòng tải lại và thử tiếp.');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;
    try {
      const completed = await taskApi.completeTask(selectedTaskId);
      setTasks(prev => prev.map(t => (t.id === selectedTaskId ? completed : t)));
    } catch {
      setError('Chưa thể hoàn thành công việc. Vui lòng thử lại.');
    }
  };

  const handleReopenTask = async () => {
    if (!selectedTaskId) return;
    try {
      const reopened = await taskApi.reopenTask(selectedTaskId);
      setTasks(prev => prev.map(t => (t.id === selectedTaskId ? reopened : t)));
    } catch {
      setError('Chưa thể mở lại công việc. Vui lòng thử lại.');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'done') {
        const reopened = await taskApi.reopenTask(taskId);
        setTasks(prev => prev.map(t => (t.id === taskId ? reopened : t)));
      } else {
        const completed = await taskApi.completeTask(taskId);
        setTasks(prev => prev.map(t => (t.id === taskId ? completed : t)));
      }
    } catch {
      setError('Chưa thể cập nhật trạng thái công việc. Vui lòng thử lại.');
    }
  };

  const handleReassignTask = async (newAssigneeId: string) => {
    if (!selectedTaskId) return;
    try {
      const reassigned = await taskApi.reassignTask(selectedTaskId, { assigneeId: newAssigneeId });
      setTasks(prev => prev.map(t => (t.id === selectedTaskId ? reassigned : t)));
    } catch {
      setError('Chưa thể giao lại công việc. Vui lòng thử lại.');
    }
  };

  const handleAddChecklistItem = async (text: string) => {
    if (!selectedTaskId) return;
    const task = tasks.find(item => item.id === selectedTaskId);
    if (!task) return;
    const updated = await taskApi.addChecklistItem(task.id, { text }, { etag: `"${task.version}"` });
    const items = await taskApi.listChecklistItems(task.id);
    setTasks(prev => prev.map(item => item.id === task.id ? updated : item));
    setChecklistMap(prev => ({ ...prev, [task.id]: items }));
  };

  const handleToggleChecklistItem = async (itemId: string, done: boolean) => {
    if (!selectedTaskId) return;
    const task = tasks.find(item => item.id === selectedTaskId);
    const checklistItem = (checklistMap[selectedTaskId] ?? []).find(item => item.id === itemId);
    if (!task || !checklistItem) return;
    try {
      const updated = await taskApi.updateChecklistItem(task.id, itemId, { text: checklistItem.text, done }, { etag: `"${task.version}"` });
      const items = await taskApi.listChecklistItems(task.id);
      setTasks(prev => prev.map(item => item.id === task.id ? updated : item));
      setChecklistMap(prev => ({ ...prev, [task.id]: items }));
    } catch {
      setError('Chưa thể cập nhật checklist. Vui lòng tải lại và thử lại.');
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!selectedTaskId) return;
    const task = tasks.find(item => item.id === selectedTaskId);
    if (!task) return;
    try {
      const updated = await taskApi.deleteChecklistItem(task.id, itemId, { etag: `"${task.version}"` });
      const items = await taskApi.listChecklistItems(task.id);
      setTasks(prev => prev.map(item => item.id === task.id ? updated : item));
      setChecklistMap(prev => ({ ...prev, [task.id]: items }));
    } catch {
      setError('Chưa thể xóa mục checklist. Vui lòng tải lại và thử lại.');
    }
  };

  const handleAddWorkSession = async (startAt: string, endAt: string) => {
    if (!selectedTaskId) return;
    const newSession = await taskApi.createWorkSession({
      taskId: selectedTaskId,
      startAt,
      endAt,
    });
    setWorkSessions(prev => [...prev, newSession]);
  };

  const handleBulkArchive = async (items: { id: string; version: number }[]) => {
    await taskApi.bulkActions({ items, action: 'archive' });
    const ids = new Set(items.map(i => i.id));
    setTasks(prev => prev.map(t => (ids.has(t.id) ? { ...t, status: 'done', version: t.version + 1 } : t)));
  };

  const handleBulkTrash = async (items: { id: string; version: number }[]) => {
    await taskApi.bulkActions({ items, action: 'trash' });
    const ids = new Set(items.map(i => i.id));
    setTasks(prev => prev.filter(t => !ids.has(t.id)));
    if (selectedTaskId && ids.has(selectedTaskId)) {
      setSelectedTaskId(undefined);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Filters & Actions Bar */}
      <TaskFilters
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        upcomingCount={upcomingCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateTaskClick={() => {
          setError(null);
          setCreateOpen(true);
        }}
      />

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            background: '#fff4f2',
            color: '#9f2d20',
            border: '1px solid #f2cbc5',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '12px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadData()}
            style={{
              border: '1px solid currentColor',
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'transparent',
              color: 'inherit',
              padding: '5px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main Content Area with CLS = 0 layout container */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '16px',
          overflow: 'hidden',
          minHeight: '440px',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            opacity: isTransitioningView ? 0.3 : 1,
            transition: prefersReducedMotion
              ? 'none'
              : 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {isLoading ? (
            /* Pitch-preserving Skeleton Loader for CLS = 0 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  style={{
                    height: '62px',
                    borderRadius: 'var(--radius-md, 10px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-raised)',
                    opacity: 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: 'var(--surface-ground, #f4f4f5)',
                      }}
                    />
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--surface-ground, #f4f4f5)',
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        style={{
                          width: '180px',
                          height: '14px',
                          borderRadius: '4px',
                          background: 'var(--surface-ground, #f4f4f5)',
                        }}
                      />
                      <div
                        style={{
                          width: '100px',
                          height: '10px',
                          borderRadius: '3px',
                          background: 'var(--surface-ground, #f4f4f5)',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '20px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        background: 'var(--surface-ground, #f4f4f5)',
                      }}
                    />
                    <div
                      style={{
                        width: '54px',
                        height: '20px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        background: 'var(--surface-ground, #f4f4f5)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'gantt' ? (
            <TaskGanttView
              tasks={filteredTasks}
              workSessions={workSessions}
              checklistMap={checklistMap}
              isPersonalWorkspace={isPersonalWorkspace}
              onSelectTask={t => setSelectedTaskId(t.id)}
              selectedTaskId={selectedTaskId}
              onCreateTaskClick={() => {
                setError(null);
                setCreateOpen(true);
              }}
            />
          ) : (
            <TaskListView
              tasks={filteredTasks}
              checklistItems={checklistMap}
              onSelectTask={t => setSelectedTaskId(t.id)}
              selectedTaskId={selectedTaskId}
              onBulkArchive={handleBulkArchive}
              onBulkTrash={handleBulkTrash}
              onToggleTaskStatus={handleToggleTaskStatus}
              onCreateTaskClick={() => {
                setError(null);
                setCreateOpen(true);
              }}
            />
          )}
        </div>

        {/* Task Detail Panel (UXR-13) */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            checklistItems={checklistMap[selectedTask.id] ?? []}
            workSessions={workSessions.filter(s => s.taskId === selectedTask.id)}
            onClose={() => setSelectedTaskId(undefined)}
            onUpdateTask={handleUpdateTask}
            onCompleteTask={handleCompleteTask}
            onReopenTask={handleReopenTask}
            onReassignTask={handleReassignTask}
            onAddChecklistItem={handleAddChecklistItem}
            onToggleChecklistItem={handleToggleChecklistItem}
            onDeleteChecklistItem={handleDeleteChecklistItem}
            onAddWorkSession={handleAddWorkSession}
          />
        )}
      </div>

      {createOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !creating) setCreateOpen(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
            onKeyDown={event => {
              if (event.key === 'Escape' && !creating) setCreateOpen(false);
            }}
            style={{
              background: 'var(--surface-overlay, #ffffff)',
              borderRadius: 'var(--radius-md, 10px)',
              border: '1px solid var(--hairline)',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              boxShadow: 'var(--shadow-overlay)',
              outline: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2
                id="create-task-title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--ink-title)',
                }}
              >
                Tạo công việc mới
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                aria-label="Đóng"
                style={{
                  border: 'none',
                  background: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink-muted)',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  color: 'var(--danger)',
                  fontSize: '13px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  background: '#fff4f2',
                  border: '1px solid #f2cbc5',
                  borderRadius: 'var(--radius-sm, 6px)',
                }}
              >
                {error}
              </p>
            )}

            <form onSubmit={event => void handleCreateTask(event)}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="new-task-title"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-body)',
                    marginBottom: '6px',
                  }}
                >
                  Tên công việc *
                </label>
                <input
                  id="new-task-title"
                  value={newTitle}
                  onChange={event => setNewTitle(event.target.value)}
                  required
                  autoFocus
                  placeholder="Ví dụ: Chuẩn bị bài thuyết trình"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-title)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                  style={{
                    padding: '6px 14px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-body)',
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  style={{
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--accent)',
                    background: 'var(--accent)',
                    color: 'var(--bg-app)',
                    cursor: (creating || !newTitle.trim()) ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-raised)',
                  }}
                >
                  {creating ? 'Đang tạo...' : 'Tạo công việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
