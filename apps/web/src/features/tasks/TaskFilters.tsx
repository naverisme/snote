import React from 'react';
import { GanttChart, List, Plus } from 'lucide-react';
import type { TaskFilter, TaskSortMode, TaskViewMode } from './types';

interface TaskFiltersProps {
  viewMode: TaskViewMode;
  onViewModeChange: (mode: TaskViewMode) => void;
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  sortMode: TaskSortMode;
  onSortModeChange: (mode: TaskSortMode) => void;
  upcomingCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateTaskClick: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  viewMode,
  onViewModeChange,
  activeFilter,
  onFilterChange,
  sortMode,
  onSortModeChange,
  upcomingCount,
  searchQuery,
  onSearchChange,
  onCreateTaskClick,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '16px',
      }}
    >
      {/* View Switcher (UXR-06, VIEW-01/02) */}
      <div className="task-segmented-control" role="group" aria-label="Chế độ xem">
        <button
          type="button"
          onClick={() => onViewModeChange('gantt')}
          className={`task-segmented-btn ${viewMode === 'gantt' ? 'active' : ''}`}
          aria-pressed={viewMode === 'gantt'}
        >
          <GanttChart size={14} />
          <span>Gantt</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`task-segmented-btn ${viewMode === 'list' ? 'active' : ''}`}
          aria-pressed={viewMode === 'list'}
        >
          <List size={14} />
          <span>Danh sách</span>
        </button>
      </div>

      {/* Filter Pills (UXR-08, VIEW-04) */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {(
          [
            { id: 'all', label: 'Tất cả' },
            { id: 'today', label: 'Hôm nay' },
            { id: 'tomorrow', label: 'Ngày mai' },
            { id: 'important', label: 'Quan trọng' },
            { id: 'upcoming', label: `Sắp tới (${upcomingCount})` },
          ] as { id: TaskFilter; label: string }[]
        ).map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`task-filter-pill-btn ${activeFilter === f.id ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort Selector (UXR-09, TASK-11) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label
          htmlFor="task-sort-select"
          style={{ fontSize: '12px', color: 'var(--ink-muted)' }}
        >
          Sắp xếp:
        </label>
        <select
          id="task-sort-select"
          value={sortMode}
          onChange={e => onSortModeChange(e.target.value as TaskSortMode)}
          style={{
            padding: '5px 8px',
            fontSize: '12px',
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--hairline)',
            background: 'var(--surface-raised, #ffffff)',
            color: 'var(--ink-body)',
            cursor: 'pointer',
          }}
        >
          <option value="next_tasks">Việc tiếp theo (Mặc định)</option>
          <option value="importance">Mức quan trọng</option>
          <option value="due_date">Hạn chót</option>
        </select>
      </div>

      {/* Search Input */}
      <input
        type="search"
        placeholder="Tìm kiếm công việc..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid var(--hairline)',
          background: 'var(--surface-raised, #ffffff)',
          color: 'var(--ink-title)',
          minWidth: '180px',
        }}
        aria-label="Tìm kiếm công việc"
      />

      <div style={{ marginLeft: 'auto' }}>
        {/* Create Task Button (UXR-07) */}
        <button
          type="button"
          onClick={onCreateTaskClick}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--accent)',
            background: 'var(--accent)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-raised)',
            transition: 'background var(--transition-fast, 0.16s ease)',
          }}
        >
          <Plus size={14} />
          <span>Tạo việc</span>
        </button>
      </div>
    </div>
  );
};
