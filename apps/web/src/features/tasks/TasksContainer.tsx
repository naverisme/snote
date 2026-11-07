import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { taskApi } from './api';
import { mockChecklistFixture, mockTasksFixture, mockWorkSessionsFixture } from './fixtures';
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
  timeZone?: string;
  onUnauthorized?: () => void;
}

export const TasksContainer: React.FC<TasksContainerProps> = ({
  workspaceId,
  timeZone = 'Asia/Ho_Chi_Minh',
  onUnauthorized,
}) => {
  const [viewMode, setViewMode] = useState<TaskViewMode>('gantt');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [sortMode, setSortMode] = useState<TaskSortMode>('next_tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checklistMap, setChecklistMap] = useState<Record<string, ChecklistItemViewModel[]>>(mockChecklistFixture);
  const [workSessions, setWorkSessions] = useState<WorkSessionViewModel[]>(mockWorkSessionsFixture);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QA-13: Request sequence tracker to discard stale in-flight responses
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // QA-13: Detect reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

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

      const loadedSessions = await taskApi.listWorkSessions({ signal: controller.signal });
      if (reqId !== activeRequestIdRef.current) return;

      setTasks(loadedTasks);
      setWorkSessions(loadedSessions);
    } catch (err: unknown) {
      if (reqId !== activeRequestIdRef.current) return;
      if (err instanceof Error && err.name === 'AbortError') return;

      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('403') || msg.includes('FORBIDDEN')) {
        // QA-13: Immediate purge on revoked access
        setTasks([]);
        setWorkSessions([]);
        setSelectedTaskId(undefined);
        onUnauthorized?.();
      }
      setError('Không thể tải danh sách công việc. Vui lòng thử lại.');
      // Fallback to fixture for preview
      setTasks(workspaceId ? mockTasksFixture.filter(t => t.workspaceId === workspaceId) : mockTasksFixture);
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
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    if (activeFilter === 'today') {
      result = result.filter(t => {
        const isDueToday = t.dueAt?.slice(0, 10) === todayStr;
        const hasSessionToday = workSessions.some(s => s.taskId === t.id && s.startAt.slice(0, 10) === todayStr);
        return isDueToday || hasSessionToday;
      });
    } else if (activeFilter === 'tomorrow') {
      result = result.filter(t => {
        const isDueTomorrow = t.dueAt?.slice(0, 10) === tomorrowStr;
        const hasSessionTomorrow = workSessions.some(s => s.taskId === t.id && s.startAt.slice(0, 10) === tomorrowStr);
        return isDueTomorrow || hasSessionTomorrow;
      });
    } else if (activeFilter === 'important') {
      result = result.filter(t => t.importance === 'high');
    } else if (activeFilter === 'upcoming') {
      result = result.filter(t => t.dueAt && t.dueAt.slice(0, 10) > tomorrowStr);
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
      const isDueToday = (t: Task) => Boolean(t.dueAt?.slice(0, 10) === todayStr);
      const hasSessionToday = (t: Task) => workSessions.some(s => s.taskId === t.id && s.startAt.slice(0, 10) === todayStr);

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
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    return tasks.filter(t => t.dueAt && t.dueAt.slice(0, 10) > tomorrowStr).length;
  }, [tasks]);

  // Actions
  const handleCreateTask = async () => {
    const title = prompt('Nhập tiêu đề công việc mới:');
    if (!title || !title.trim()) return;
    const newTask = await taskApi.createTask(workspaceId ?? 'default-workspace', {
      title: title.trim(),
      importance: 'medium',
    });
    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTaskId) return;
    const updated = await taskApi.updateTask(selectedTaskId, updates);
    setTasks(prev => prev.map(t => (t.id === selectedTaskId ? updated : t)));
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;
    const completed = await taskApi.completeTask(selectedTaskId);
    setTasks(prev => prev.map(t => (t.id === selectedTaskId ? completed : t)));
  };

  const handleReopenTask = async () => {
    if (!selectedTaskId) return;
    const reopened = await taskApi.reopenTask(selectedTaskId);
    setTasks(prev => prev.map(t => (t.id === selectedTaskId ? reopened : t)));
  };

  const handleReassignTask = async (newAssigneeId: string) => {
    if (!selectedTaskId) return;
    const reassigned = await taskApi.reassignTask(selectedTaskId, { assigneeId: newAssigneeId });
    setTasks(prev => prev.map(t => (t.id === selectedTaskId ? reassigned : t)));
  };

  const handleAddChecklistItem = async (text: string) => {
    if (!selectedTaskId) return;
    const newItem: ChecklistItemViewModel = {
      id: `chk-${Date.now()}`,
      taskId: selectedTaskId,
      text,
      done: false,
      position: (checklistMap[selectedTaskId] ?? []).length,
    };
    setChecklistMap(prev => ({
      ...prev,
      [selectedTaskId]: [...(prev[selectedTaskId] ?? []), newItem],
    }));
  };

  const handleToggleChecklistItem = async (itemId: string, done: boolean) => {
    if (!selectedTaskId) return;
    setChecklistMap(prev => ({
      ...prev,
      [selectedTaskId]: (prev[selectedTaskId] ?? []).map(i => (i.id === itemId ? { ...i, done } : i)),
    }));
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!selectedTaskId) return;
    setChecklistMap(prev => ({
      ...prev,
      [selectedTaskId]: (prev[selectedTaskId] ?? []).filter(i => i.id !== itemId),
    }));
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: prefersReducedMotion ? 'none' : 'opacity 0.15s ease',
      }}
    >
      {/* Filters & Actions Bar */}
      <TaskFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        upcomingCount={upcomingCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateTaskClick={handleCreateTask}
      />

      {error && (
        <div style={{ padding: '8px 12px', background: '#ffebe9', color: '#cf222e', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {viewMode === 'gantt' ? (
            <TaskGanttView
              tasks={filteredTasks}
              workSessions={workSessions}
              onSelectTask={t => setSelectedTaskId(t.id)}
              selectedTaskId={selectedTaskId}
            />
          ) : (
            <TaskListView
              tasks={filteredTasks}
              checklistItems={checklistMap}
              onSelectTask={t => setSelectedTaskId(t.id)}
              selectedTaskId={selectedTaskId}
              onBulkArchive={handleBulkArchive}
              onBulkTrash={handleBulkTrash}
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
    </div>
  );
};
