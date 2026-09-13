import React, { useState, useEffect, useCallback } from 'react';
import { api, ApiResponse } from '../../../services/api';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { useToast } from '../../../contexts/ToastContext';
import { EventModal } from '../components/EventModal';
import { TaskModal } from '../../tasks/components/TaskModal';
import { GanttTimelineView, GanttItem, GanttTimeframe } from '../components/GanttTimelineView';
import { Plus, Sparkles, BookOpen } from 'lucide-react';

export const ScheduleWeekPage: React.FC = () => {
  const { selectedSubjectId, selectedSemesterId, subjects } = useAppFilter();
  const [currentGanttDate, setCurrentGanttDate] = useState<Date>(() => new Date());
  const [timeframe, setTimeframe] = useState<GanttTimeframe>('30_DAYS');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any | null>(null);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const year = currentGanttDate.getFullYear();
      const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      const params = new URLSearchParams();
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      if (selectedSubjectId) params.append('subjectId', selectedSubjectId);
      if (selectedSemesterId) params.append('semesterId', selectedSemesterId);

      const res = await api.get<ApiResponse<any[]>>(`/schedule?${params.toString()}`);
      setEvents(res.data || []);
    } catch {
      showToast('Không thể tải dữ liệu lịch trình học tập', 'error');
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [currentGanttDate, selectedSubjectId, selectedSemesterId, showToast]);

  useEffect(() => {
    fetchEvents(initialLoaded);
  }, [fetchEvents]);

  const handleOpenTaskDetail = async (taskId: string, fallbackItem: any) => {
    try {
      const res = await api.get<ApiResponse<any>>(`/tasks/${taskId}`);
      setSelectedTask(res.data || fallbackItem);
    } catch {
      setSelectedTask(fallbackItem);
    }
    setIsTaskModalOpen(true);
  };

  const handleGanttItemClick = (item: GanttItem) => {
    if (item.itemType === 'TASK') {
      handleOpenTaskDetail(item.id, item);
    } else if (item.itemType === 'PROJECT') {
      setSelectedTask(item);
      setIsTaskModalOpen(true);
    } else {
      setEventToEdit(item);
      setSelectedDateForNewEvent(undefined);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateForNewEvent(date);
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleGanttItemDateChange = async (item: GanttItem, newStart: Date, newEnd: Date) => {
    // 1. Optimistic update in UI
    setEvents((prev) =>
      prev.map((e) =>
        e.id === item.id
          ? {
              ...e,
              startTime: newStart.toISOString(),
              endTime: newEnd.toISOString(),
              dueDate: newEnd.toISOString()
            }
          : e
      )
    );

    try {
      if (item.itemType === 'EVENT') {
        await api.put(`/schedule/${item.id}`, {
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString()
        });
      } else if (item.itemType === 'TASK') {
        await api.put(`/tasks/${item.id}`, {
          dueDate: newEnd.toISOString()
        });
      } else if (item.itemType === 'PROJECT') {
        await api.put(`/projects/${item.id}`, {
          startDate: newStart.toISOString(),
          dueDate: newEnd.toISOString()
        });
      }
      showToast(`Đã cập nhật thời gian: ${item.title}`, 'success');
      // Background silent refetch without unmounting or flipping view
      await fetchEvents(true);
    } catch {
      showToast('Không thể cập nhật thời gian mốc lịch', 'error');
      await fetchEvents(true);
    }
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header: Context Badges & Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {currentSubjectObj ? (
            <span className="badge badge-blue" style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={13} />
              <span>[{currentSubjectObj.code || 'MÔN'}] {currentSubjectObj.name}</span>
            </span>
          ) : (
            <span className="badge badge-neutral" style={{ fontSize: '12px', padding: '5px 10px' }}>
              Tất cả môn học & đồ án
            </span>
          )}

          <span className="badge badge-green" style={{ fontSize: '12px', padding: '5px 10px' }}>
            {events.length} mốc lịch & đầu việc
          </span>
        </div>

        <button
          onClick={() => {
            setEventToEdit(null);
            setSelectedDateForNewEvent(undefined);
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ fontWeight: 700, gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Plus size={16} />
          <span>Thêm Sự Kiện Lịch</span>
        </button>
      </div>

      {/* Main Gantt Timeline View (Always mounted to preserve view mode & scroll) */}
      {!initialLoaded && loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={24} style={{ margin: '0 auto 12px auto', color: 'var(--accent-primary)' }} />
          <div>Đang đồng bộ dữ liệu sơ đồ lịch...</div>
        </div>
      ) : (
        <GanttTimelineView
          items={events}
          currentDate={currentGanttDate}
          onDateChange={(d) => setCurrentGanttDate(d)}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onItemClick={handleGanttItemClick}
          onDateClick={handleDateClick}
          onItemDateChange={handleGanttItemDateChange}
        />
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEventToEdit(null);
          setSelectedDateForNewEvent(undefined);
        }}
        onSuccess={fetchEvents}
        defaultDate={selectedDateForNewEvent}
        eventToEdit={eventToEdit}
      />

      {/* Task Detail Modal from Schedule */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={fetchEvents}
        taskToEdit={selectedTask}
        initialMode="VIEW"
      />
    </div>
  );
};
