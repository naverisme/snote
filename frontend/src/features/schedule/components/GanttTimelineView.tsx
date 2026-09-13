import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User as UserIcon,
  CheckCircle2,
  ListTodo,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Target,
  Layers,
  ChevronDown,
  Filter,
  MapPin,
  BookOpen,
  X
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export interface GanttItem {
  id: string;
  itemType: 'EVENT' | 'TASK' | 'PROJECT';
  title: string;
  description?: string | null;
  location?: string | null;
  eventType?: string;
  startTime: string | Date;
  endTime: string | Date;
  dueDate?: string | Date | null;
  createdAt?: string | Date;
  status?: string | null;
  priority?: string | null;
  subjectId?: string | null;
  projectId?: string | null;
  assignees?: Array<{ id: string; name: string; avatarUrl?: string | null }>;
  subject?: {
    id: string;
    name: string;
    code?: string | null;
    color?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface GanttTimelineViewProps {
  items: GanttItem[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  timeframe?: GanttTimeframe;
  onTimeframeChange?: (tf: GanttTimeframe) => void;
  onItemClick: (item: GanttItem) => void;
  onDateClick?: (date: Date) => void;
  onItemDateChange?: (item: GanttItem, newStart: Date, newEnd: Date) => Promise<void>;
}

export type GanttTimeframe = '3_DAYS' | '7_DAYS' | '30_DAYS' | 'YEAR';
type StatusFilter = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'PENDING' | 'DONE';

const HOUR_HEIGHT = 56; // Chiều cao mỗi ô giờ trong Time Grid (px)
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0h đến 23h

interface DragState {
  item: GanttItem;
  action: 'MOVE' | 'RESIZE_START' | 'RESIZE_END';
  startX: number;
  startY: number;
  initialStart: Date;
  initialEnd: Date;
  currentStart: Date;
  currentEnd: Date;
  targetDayIndex: number;
}

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({
  items,
  currentDate,
  onDateChange,
  timeframe: externalTimeframe,
  onTimeframeChange,
  onItemClick,
  onDateClick,
  onItemDateChange
}) => {
  const { user } = useAuth();
  const [internalTimeframe, setInternalTimeframe] = useState<GanttTimeframe>('30_DAYS');
  const timeframe = externalTimeframe !== undefined ? externalTimeframe : internalTimeframe;
  const setTimeframe = onTimeframeChange || setInternalTimeframe;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{ item: GanttItem; x: number; y: number } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [timeEditorData, setTimeEditorData] = useState<{
    item: GanttItem;
    startHour: string;
    endHour: string;
    x: number;
    y: number;
  } | null>(null);
  const [moreEventsModal, setMoreEventsModal] = useState<{
    date: Date;
    items: GanttItem[];
  } | null>(null);

  // Drag and drop state for Month View
  const [monthDraggedItem, setMonthDraggedItem] = useState<GanttItem | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const latestDragStateRef = useRef<DragState | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bodyGridRef = useRef<HTMLDivElement>(null);

  // Status counts
  const counts = useMemo(() => {
    let todo = 0;
    let inProgress = 0;
    let pending = 0;
    let done = 0;

    items.forEach((item) => {
      const s = (item.status || '').toUpperCase();
      if (s === 'DONE' || s === 'COMPLETED') done++;
      else if (s === 'IN_PROGRESS') inProgress++;
      else if (s === 'PENDING' || s === 'REVIEW' || s === 'IN_REVIEW') pending++;
      else todo++;
    });

    return { all: items.length, todo, inProgress, pending, done };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (statusFilter === 'ALL') return items;
    return items.filter((item) => {
      const s = (item.status || '').toUpperCase();
      if (statusFilter === 'DONE') return s === 'DONE' || s === 'COMPLETED';
      if (statusFilter === 'IN_PROGRESS') return s === 'IN_PROGRESS';
      if (statusFilter === 'PENDING') return s === 'PENDING' || s === 'REVIEW' || s === 'IN_REVIEW';
      if (statusFilter === 'TODO') return s === 'TODO' || !s || s === 'CANCELLED';
      return true;
    });
  }, [items, statusFilter]);

  const dayOfWeekNamesLong = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
  const dayOfWeekNamesShort = ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const formatHHmm = (d: Date) => {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatTime12h = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mStr = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
    return `${h}${mStr}${ampm}`;
  };

  // Helper lấy giờ bắt đầu & kết thúc chuẩn xác
  const getItemExactDates = (item: GanttItem) => {
    let start: Date;
    let end: Date;

    if (item.itemType === 'EVENT') {
      start = new Date(item.startTime || new Date());
      end = new Date(item.endTime || new Date(start.getTime() + 90 * 60 * 1000));
      if (isNaN(start.getTime())) start = new Date();
      if (isNaN(end.getTime())) end = new Date(start.getTime() + 90 * 60 * 1000);
      if (end.getTime() <= start.getTime()) {
        end = new Date(start.getTime() + 90 * 60 * 1000);
      }
    } else {
      // TASK or PROJECT
      end = new Date(item.dueDate || item.endTime || item.startTime || new Date());
      if (isNaN(end.getTime())) end = new Date();

      if (item.startTime && !isNaN(new Date(item.startTime).getTime())) {
        start = new Date(item.startTime);
      } else {
        start = new Date(end.getTime() - 60 * 60 * 1000);
      }

      if (end.getTime() <= start.getTime()) {
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }
    }

    return { start, end };
  };

  // ----------------------------------------------------
  // 1. DỮ LIỆU LỊCH THÁNG (MONTH VIEW GRID)
  // ----------------------------------------------------
  const monthViewData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = CN, 1 = T2, ...

    const startDate = new Date(year, month, 1 - startDayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }

    let visibleDates = dates;
    if (dates[35].getMonth() !== month) {
      visibleDates = dates.slice(0, 35);
    }

    const itemsByDay = new Map<string, GanttItem[]>();
    visibleDates.forEach((d) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      itemsByDay.set(key, []);
    });

    filteredItems.forEach((item) => {
      const { start } = getItemExactDates(item);
      const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
      if (itemsByDay.has(key)) {
        itemsByDay.get(key)!.push(item);
      }
    });

    itemsByDay.forEach((list) => {
      list.sort((a, b) => {
        const dateA = getItemExactDates(a).start.getTime();
        const dateB = getItemExactDates(b).start.getTime();
        return dateA - dateB;
      });
    });

    return { visibleDates, itemsByDay, currentMonth: month, currentYear: year };
  }, [currentDate, filteredItems]);

  // ----------------------------------------------------
  // 2. DỮ LIỆU LỊCH NĂM (YEAR VIEW - 12 THÁNG)
  // ----------------------------------------------------
  const yearViewData = useMemo(() => {
    const year = currentDate.getFullYear();

    // Bản đồ items theo ngày trong toàn bộ năm
    const yearItemsMap = new Map<string, GanttItem[]>();
    filteredItems.forEach((item) => {
      const { start } = getItemExactDates(item);
      const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
      if (!yearItemsMap.has(key)) {
        yearItemsMap.set(key, []);
      }
      yearItemsMap.get(key)!.push(item);
    });

    const months = Array.from({ length: 12 }, (_, m) => {
      const firstDay = new Date(year, m, 1);
      const startDayOfWeek = firstDay.getDay();

      const startDate = new Date(year, m, 1 - startDayOfWeek);
      startDate.setHours(0, 0, 0, 0);

      const days: Date[] = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        days.push(d);
      }

      return {
        monthIndex: m,
        monthName: `Tháng ${m + 1}`,
        days
      };
    });

    return { year, months, yearItemsMap };
  }, [currentDate, filteredItems]);

  // ----------------------------------------------------
  // 3. DỮ LIỆU LỊCH TUẦN / 3 NGÀY (TIME GRID VIEW)
  // ----------------------------------------------------
  const weekDates = useMemo(() => {
    const count = timeframe === '3_DAYS' ? 3 : 7;
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);

    if (timeframe === '7_DAYS') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
    }

    const dates: Date[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate, timeframe]);

  useEffect(() => {
    if ((timeframe === '7_DAYS' || timeframe === '3_DAYS') && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [timeframe]);

  // Layout map cho Week View
  const weekDayItemsMap = useMemo(() => {
    type WeekCard = {
      item: GanttItem;
      start: Date;
      end: Date;
      top: number;
      height: number;
      colIndex: number;
      totalCols: number;
    };

    if (timeframe === '30_DAYS' || timeframe === 'YEAR') {
      return new Map<number, WeekCard[]>();
    }

    const map = new Map<number, WeekCard[]>();
    weekDates.forEach((_, idx) => map.set(idx, []));

    filteredItems.forEach((item) => {
      let start: Date;
      let end: Date;
      let dayIndex = -1;

      if (dragState && dragState.item.id === item.id) {
        start = dragState.currentStart;
        end = dragState.currentEnd;
        dayIndex = dragState.targetDayIndex;
      } else {
        const dates = getItemExactDates(item);
        start = dates.start;
        end = dates.end;

        dayIndex = weekDates.findIndex(
          (d) =>
            d.getDate() === start.getDate() &&
            d.getMonth() === start.getMonth() &&
            d.getFullYear() === start.getFullYear()
        );
      }

      if (dayIndex >= 0 && dayIndex < weekDates.length) {
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        const durationMinutes = Math.max(endMinutes - startMinutes, 20);

        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 28);

        map.get(dayIndex)?.push({
          item,
          start,
          end,
          top,
          height,
          colIndex: 0,
          totalCols: 1
        });
      }
    });

    map.forEach((dayList) => {
      dayList.sort((a, b) => a.top - b.top || b.height - a.height);
      const columns: Array<Array<{ top: number; bottom: number }>> = [];

      dayList.forEach((ev) => {
        const bottom = ev.top + ev.height;
        let placedCol = -1;

        for (let i = 0; i < columns.length; i++) {
          const lastInCol = columns[i][columns[i].length - 1];
          if (ev.top >= lastInCol.bottom - 2) {
            placedCol = i;
            columns[i].push({ top: ev.top, bottom });
            break;
          }
        }

        if (placedCol === -1) {
          placedCol = columns.length;
          columns.push([{ top: ev.top, bottom }]);
        }

        ev.colIndex = placedCol;
      });

      const total = Math.max(columns.length, 1);
      dayList.forEach((ev) => {
        ev.totalCols = total;
      });
    });

    return map;
  }, [filteredItems, weekDates, dragState, timeframe]);

  // Card color styling
  const getItemCardStyle = (item: GanttItem) => {
    const s = (item.status || '').toUpperCase();
    let bg = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    let border = '#334155';
    let accent = '#38bdf8';

    if (s === 'DONE' || s === 'COMPLETED') {
      bg = 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)';
      border = '#059669';
      accent = '#10b981';
    } else if (s === 'IN_PROGRESS') {
      bg = 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)';
      border = '#0284c7';
      accent = '#38bdf8';
    } else if (s === 'PENDING' || s === 'REVIEW' || s === 'IN_REVIEW') {
      bg = 'linear-gradient(135deg, #581c87 0%, #3b0764 100%)';
      border = '#7e22ce';
      accent = '#c084fc';
    } else if (item.itemType === 'EVENT') {
      bg = 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)';
      border = '#2563eb';
      accent = '#60a5fa';
    }

    if (item.subject?.color) {
      accent = item.subject.color;
    }

    return { bg, border, accent };
  };

  // Drag in Week View
  const handleStartDragWeek = (
    e: React.MouseEvent,
    item: GanttItem,
    action: 'MOVE' | 'RESIZE_START' | 'RESIZE_END',
    initialStart: Date,
    initialEnd: Date,
    initialDayIndex: number
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    hasMovedRef.current = false;
    isDraggingRef.current = true;

    const initialDragState: DragState = {
      item,
      action,
      startX,
      startY,
      initialStart,
      initialEnd,
      currentStart: new Date(initialStart),
      currentEnd: new Date(initialEnd),
      targetDayIndex: initialDayIndex
    };

    latestDragStateRef.current = initialDragState;
    setDragState(initialDragState);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        hasMovedRef.current = true;
      }

      const pxPer15Min = HOUR_HEIGHT / 4;
      const steps = Math.round(deltaY / pxPer15Min);
      const deltaMinutes = steps * 15;

      let targetDayIdx = initialDayIndex;
      if (action === 'MOVE' && bodyGridRef.current) {
        const gridRect = bodyGridRef.current.getBoundingClientRect();
        const mouseX = moveEvent.clientX - gridRect.left;
        const colWidth = gridRect.width / weekDates.length;
        const computedIdx = Math.floor(mouseX / colWidth);
        targetDayIdx = Math.max(0, Math.min(weekDates.length - 1, computedIdx));
      }

      const targetDay = weekDates[targetDayIdx];
      let newStart = new Date(initialStart);
      let newEnd = new Date(initialEnd);

      newStart.setFullYear(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());
      newEnd.setFullYear(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());

      if (action === 'MOVE') {
        const durationMs = initialEnd.getTime() - initialStart.getTime();
        const curStartMins = initialStart.getHours() * 60 + initialStart.getMinutes() + deltaMinutes;
        const clampedStartMins = Math.max(0, Math.min(24 * 60 - 30, curStartMins));

        newStart.setHours(Math.floor(clampedStartMins / 60), clampedStartMins % 60, 0, 0);
        newEnd = new Date(newStart.getTime() + durationMs);

        const dayEnd = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 23, 59, 59, 999);
        if (newEnd.getTime() > dayEnd.getTime()) {
          newEnd = dayEnd;
        }
      } else if (action === 'RESIZE_START') {
        const curStartMins = initialStart.getHours() * 60 + initialStart.getMinutes() + deltaMinutes;
        const endMins = initialEnd.getHours() * 60 + initialEnd.getMinutes();
        const clampedStartMins = Math.max(0, Math.min(endMins - 15, curStartMins));

        newStart.setHours(Math.floor(clampedStartMins / 60), clampedStartMins % 60, 0, 0);
      } else if (action === 'RESIZE_END') {
        const startMins = initialStart.getHours() * 60 + initialStart.getMinutes();
        const curEndMins = initialEnd.getHours() * 60 + initialEnd.getMinutes() + deltaMinutes;
        const clampedEndMins = Math.max(startMins + 15, Math.min(24 * 60 - 1, curEndMins));

        newEnd.setHours(Math.floor(clampedEndMins / 60), clampedEndMins % 60, 0, 0);
      }

      const updatedState: DragState = {
        item,
        action,
        startX,
        startY,
        initialStart,
        initialEnd,
        currentStart: newStart,
        currentEnd: newEnd,
        targetDayIndex: targetDayIdx
      };

      latestDragStateRef.current = updatedState;
      setDragState(updatedState);
    };

    const onMouseUp = async () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const wasMoved = hasMovedRef.current;
      const latest = latestDragStateRef.current;

      setTimeout(() => {
        isDraggingRef.current = false;
      }, 80);

      setDragState(null);

      if (wasMoved && latest && onItemDateChange) {
        await onItemDateChange(latest.item, latest.currentStart, latest.currentEnd);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Month Drag & Drop handlers
  const handleMonthDragStart = (e: React.DragEvent, item: GanttItem) => {
    e.stopPropagation();
    setMonthDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleMonthDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    setDragOverDate(null);
    if (!monthDraggedItem || !onItemDateChange) return;

    const { start, end } = getItemExactDates(monthDraggedItem);
    const durationMs = end.getTime() - start.getTime();

    const newStart = new Date(targetDate);
    newStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

    const newEnd = new Date(newStart.getTime() + durationMs);

    await onItemDateChange(monthDraggedItem, newStart, newEnd);
    setMonthDraggedItem(null);
  };

  // Mini Popover chỉnh giờ trực tiếp
  const handleOpenTimeEditor = (e: React.MouseEvent, item: GanttItem) => {
    e.stopPropagation();
    const { start, end } = getItemExactDates(item);
    const rect = e.currentTarget.getBoundingClientRect();
    setTimeEditorData({
      item,
      startHour: formatHHmm(start),
      endHour: formatHHmm(end),
      x: Math.min(window.innerWidth - 320, Math.max(20, rect.left - 40)),
      y: Math.min(window.innerHeight - 300, rect.bottom + 10)
    });
  };

  const handleSaveTimeEditor = async () => {
    if (!timeEditorData || !onItemDateChange) return;
    const { item, startHour, endHour } = timeEditorData;
    const { start, end } = getItemExactDates(item);

    const [sH, sM] = startHour.split(':').map(Number);
    const [eH, eM] = endHour.split(':').map(Number);

    const newStart = new Date(start);
    newStart.setHours(isNaN(sH) ? 8 : sH, isNaN(sM) ? 0 : sM, 0, 0);

    const newEnd = new Date(end);
    newEnd.setFullYear(newStart.getFullYear(), newStart.getMonth(), newStart.getDate());
    newEnd.setHours(isNaN(eH) ? 10 : eH, isNaN(eM) ? 0 : eM, 0, 0);

    if (newEnd.getTime() <= newStart.getTime()) {
      newEnd.setTime(newStart.getTime() + 60 * 60 * 1000);
    }

    setTimeEditorData(null);
    await onItemDateChange(item, newStart, newEnd);
  };

  // Header range label
  const rangeHeaderLabel = useMemo(() => {
    if (timeframe === 'YEAR') {
      return `Năm ${currentDate.getFullYear()}`;
    }
    if (timeframe === '30_DAYS') {
      return `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
    }
    const startStr = `${weekDates[0]?.getDate()}/${weekDates[0]?.getMonth() + 1}`;
    const endStr = `${weekDates[weekDates.length - 1]?.getDate()}/${weekDates[weekDates.length - 1]?.getMonth() + 1}/${weekDates[weekDates.length - 1]?.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  }, [currentDate, timeframe, weekDates]);

  // Navigation handlers
  const handlePrev = () => {
    const prev = new Date(currentDate);
    if (timeframe === 'YEAR') {
      prev.setFullYear(prev.getFullYear() - 1);
    } else if (timeframe === '30_DAYS') {
      prev.setMonth(prev.getMonth() - 1);
    } else {
      prev.setDate(prev.getDate() - (timeframe === '3_DAYS' ? 3 : 7));
    }
    onDateChange(prev);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (timeframe === 'YEAR') {
      next.setFullYear(next.getFullYear() + 1);
    } else if (timeframe === '30_DAYS') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + (timeframe === '3_DAYS' ? 3 : 7));
    }
    onDateChange(next);
  };

  // Switch to specific month from Year view
  const handleSelectMonthFromYear = (monthIndex: number) => {
    const targetDate = new Date(currentDate);
    targetDate.setMonth(monthIndex);
    onDateChange(targetDate);
    setTimeframe('30_DAYS');
  };

  // Current time line indicator (Week View)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#111318',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* 1. TOP TOOLBAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#171a21'
        }}
      >
        {/* Left: Today + Prev/Next + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onDateChange(new Date())}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Hôm nay
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handlePrev}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Lùi thời gian"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Tiến thời gian"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <span style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>
            {rangeHeaderLabel}
          </span>
        </div>

        {/* Right: Timeframe Switcher (3 Ngày / Tuần / Tháng / Năm) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '2px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {(['3_DAYS', '7_DAYS', '30_DAYS', 'YEAR'] as GanttTimeframe[]).map((tf) => {
              const isActive = timeframe === tf;
              const labels: Record<GanttTimeframe, string> = {
                '3_DAYS': '3 Ngày',
                '7_DAYS': 'Tuần',
                '30_DAYS': 'Tháng',
                'YEAR': 'Năm'
              };
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    border: 'none',
                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                >
                  {labels[tf]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. SUB-HEADER: Status Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 20px',
          fontSize: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#14171f'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} /> Lọc:
          </span>
          {[
            { id: 'ALL', label: `Tất cả (${counts.all})` },
            { id: 'TODO', label: `Cần làm (${counts.todo})` },
            { id: 'IN_PROGRESS', label: `Đang làm (${counts.inProgress})` },
            { id: 'PENDING', label: `Chờ duyệt (${counts.pending})` },
            { id: 'DONE', label: `Hoàn thành (${counts.done})` }
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as StatusFilter)}
                style={{
                  padding: '2px 9px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid #3b82f6' : '1px solid transparent',
                  backgroundColor: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: active ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '11px', color: '#64748b' }}>
          {timeframe === 'YEAR'
            ? 'Nhấp vào tiêu đề tháng để vào lịch tháng • Nhấp vào ngày để xem chi tiết sự kiện'
            : timeframe === '30_DAYS'
            ? 'Kéo thả sự kiện giữa các ô ngày để dời ngày • Nhấp vào ngày để thêm sự kiện mới'
            : 'Kéo thẻ lên/xuống để đổi giờ • Kéo 2 núm mép để co giãn khoảng thời gian'}
        </div>
      </div>

      {/* 3. MAIN BODY VIEW */}
      {timeframe === 'YEAR' ? (
        /* ========================================================
           YEAR VIEW (Lưới 12 mini tháng 4x3 chuẩn hình mẫu)
           ======================================================== */
        <div
          style={{
            padding: '24px 20px',
            backgroundColor: '#0f1218',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px 20px',
            overflowY: 'auto',
            maxHeight: '720px'
          }}
        >
          {yearViewData.months.map((mObj) => (
            <div
              key={mObj.monthIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                padding: '4px'
              }}
            >
              {/* Month Header (Click to open Month view) */}
              <div
                onClick={() => handleSelectMonthFromYear(mObj.monthIndex)}
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Nhấp để xem chi tiết tháng này"
              >
                <span>{mObj.monthName}</span>
              </div>

              {/* Day of Week Row: Cn T2 T3 T4 T5 T6 T7 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '6px'
                }}
              >
                {dayOfWeekNamesShort.map((dayName, idx) => (
                  <div key={idx}>{dayName}</div>
                ))}
              </div>

              {/* 7x6 Mini Days Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gridAutoRows: '28px',
                  rowGap: '2px',
                  textAlign: 'center'
                }}
              >
                {mObj.days.map((d, dIdx) => {
                  const isCurMonth = d.getMonth() === mObj.monthIndex;
                  const today = isToday(d);
                  const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                  const dayEvents = yearViewData.yearItemsMap.get(dateKey) || [];
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <div
                      key={dIdx}
                      onClick={() => {
                        if (hasEvents) {
                          setMoreEventsModal({ date: d, items: dayEvents });
                        } else if (onDateClick) {
                          onDateClick(d);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        position: 'relative'
                      }}
                      title={hasEvents ? `${dayEvents.length} sự kiện` : undefined}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: '11.5px',
                          fontWeight: today || hasEvents ? 700 : 500,
                          color: today
                            ? '#ffffff'
                            : isCurMonth
                            ? hasEvents
                              ? '#38bdf8'
                              : '#cbd5e1'
                            : '#475569',
                          backgroundColor: today
                            ? '#3b82f6'
                            : hasEvents && isCurMonth
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'transparent',
                          border: hasEvents && !today && isCurMonth ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                          boxShadow: today ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : timeframe === '30_DAYS' ? (
        /* ========================================================
           MONTH VIEW (Giao diện lịch tháng chuẩn Google Calendar)
           ======================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#0f1218' }}>
          {/* Day of Week Header Row: CN, THỨ 2, THỨ 3, THỨ 4, THỨ 5, THỨ 6, THỨ 7 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#14171f'
            }}
          >
            {dayOfWeekNamesLong.map((dayName, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  padding: '8px 0',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '0.5px'
                }}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Month 7x5 / 7x6 Grid Cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: 'minmax(110px, 1fr)',
              backgroundColor: '#0f1218'
            }}
          >
            {monthViewData.visibleDates.map((dateObj, cellIdx) => {
              const today = isToday(dateObj);
              const isCurrentMonth = dateObj.getMonth() === monthViewData.currentMonth;
              const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
              const dayItems = monthViewData.itemsByDay.get(dateKey) || [];
              const isDragOver = dragOverDate === dateKey;

              const isFirstOfMonth = dateObj.getDate() === 1;
              const dayLabel = isFirstOfMonth
                ? `1 thg ${dateObj.getMonth() + 1}`
                : `${dateObj.getDate()}`;

              const maxVisible = 3;
              const visibleItems = dayItems.slice(0, maxVisible);
              const remainingCount = dayItems.length - maxVisible;

              return (
                <div
                  key={cellIdx}
                  onClick={() => onDateClick?.(dateObj)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDate(dateKey);
                  }}
                  onDragLeave={() => setDragOverDate(null)}
                  onDrop={(e) => handleMonthDrop(e, dateObj)}
                  style={{
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: isDragOver
                      ? 'rgba(59, 130, 246, 0.15)'
                      : today
                      ? 'rgba(59, 130, 246, 0.05)'
                      : !isCurrentMonth
                      ? 'rgba(0, 0, 0, 0.25)'
                      : 'transparent',
                    cursor: onDateClick ? 'pointer' : 'default',
                    minHeight: '110px',
                    transition: 'background-color 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {/* Date Header Number */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: today ? 800 : isFirstOfMonth ? 700 : 600,
                        color: today
                          ? '#ffffff'
                          : isCurrentMonth
                          ? '#e2e8f0'
                          : '#475569',
                        backgroundColor: today ? '#3b82f6' : 'transparent',
                        width: today ? '24px' : 'auto',
                        height: today ? '24px' : 'auto',
                        borderRadius: today ? '50%' : '0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: today ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none'
                      }}
                    >
                      {dayLabel}
                    </span>
                  </div>

                  {/* List of Events / Tasks in Day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden' }}>
                    {visibleItems.map((item) => {
                      const { start } = getItemExactDates(item);
                      const timeStr = formatTime12h(start);
                      const cardStyle = getItemCardStyle(item);
                      const isHovered = hoveredItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          draggable={true}
                          onDragStart={(e) => handleMonthDragStart(e, item)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemClick(item);
                          }}
                          onMouseEnter={() => setHoveredItemId(item.id)}
                          onMouseLeave={() => setHoveredItemId(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                            color: '#cbd5e1',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transition: 'background-color 0.1s ease',
                            userSelect: 'none'
                          }}
                          title={`${timeStr} ${item.title}`}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: cardStyle.accent,
                              flexShrink: 0
                            }}
                          />
                          <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '11px', flexShrink: 0 }}>
                            {timeStr}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {item.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* "+N mục khác" Button */}
                    {remainingCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMoreEventsModal({ date: dateObj, items: dayItems });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#60a5fa',
                          fontSize: '11px',
                          fontWeight: 600,
                          textAlign: 'left',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          marginTop: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span>{remainingCount} mục khác</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
           WEEK / 3-DAY TIME GRID VIEW (Trục giờ cạnh trái 00:00-23:00)
           ======================================================== */
        <div
          ref={scrollContainerRef}
          style={{
            height: '650px',
            overflowY: 'auto',
            overflowX: 'auto',
            position: 'relative',
            backgroundColor: '#0f1218'
          }}
        >
          {/* Top Sticky Header */}
          <div
            style={{
              display: 'flex',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              backgroundColor: '#171a21',
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
              minWidth: `${64 + weekDates.length * 150}px`
            }}
          >
            {/* Top Left Clock Label */}
            <div
              style={{
                width: '64px',
                minWidth: '64px',
                height: '52px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '2px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#171a21',
                position: 'sticky',
                left: 0,
                zIndex: 35,
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <Clock size={15} style={{ marginBottom: '2px', color: '#3b82f6' }} />
              <span>Giờ</span>
            </div>

            {/* Day Header Cells */}
            {weekDates.map((d, idx) => {
              const today = isToday(d);
              const dayNum = d.getDate();
              const dayOfWeek = dayOfWeekNamesLong[d.getDay()];

              return (
                <div
                  key={idx}
                  onClick={() => onDateClick?.(d)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    height: '52px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: today ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    cursor: onDateClick ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: today ? 800 : 700,
                        color: today ? '#60a5fa' : '#ffffff',
                        backgroundColor: today ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                        padding: today ? '2px 8px' : '0',
                        borderRadius: '8px'
                      }}
                    >
                      {dayNum}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: today ? 700 : 500,
                        color: today ? '#60a5fa' : '#94a3b8'
                      }}
                    >
                      {dayOfWeek}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    Tháng {d.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Grid Canvas */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              minWidth: `${64 + weekDates.length * 150}px`,
              height: `${24 * HOUR_HEIGHT}px`
            }}
          >
            {/* Left Time Axis (Sticky Left) */}
            <div
              style={{
                width: '64px',
                minWidth: '64px',
                height: `${24 * HOUR_HEIGHT}px`,
                borderRight: '2px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#171a21',
                position: 'sticky',
                left: 0,
                zIndex: 25,
                userSelect: 'none'
              }}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{
                    height: `${HOUR_HEIGHT}px`,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: '#64748b'
                    }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            <div
              ref={bodyGridRef}
              style={{
                flex: 1,
                display: 'flex',
                position: 'relative',
                height: `${24 * HOUR_HEIGHT}px`
              }}
            >
              {weekDates.map((dayDate, dayIdx) => {
                const today = isToday(dayDate);
                const dayCards = weekDayItemsMap.get(dayIdx) || [];

                return (
                  <div
                    key={dayIdx}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      height: '100%',
                      position: 'relative',
                      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                      backgroundColor: today ? 'rgba(59, 130, 246, 0.03)' : 'transparent'
                    }}
                    onDoubleClick={() => onDateClick?.(dayDate)}
                  >
                    {/* Hourly Lines */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        style={{
                          position: 'absolute',
                          top: `${h * HOUR_HEIGHT}px`,
                          left: 0,
                          right: 0,
                          height: `${HOUR_HEIGHT}px`,
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none'
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: `${HOUR_HEIGHT / 2}px`,
                            left: 0,
                            right: 0,
                            borderBottom: '1px dashed rgba(255, 255, 255, 0.03)'
                          }}
                        />
                      </div>
                    ))}

                    {/* Current Time Indicator */}
                    {today && (
                      <div
                        style={{
                          position: 'absolute',
                          top: `${currentTimeTop}px`,
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: '#ef4444',
                          boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                          zIndex: 20,
                          pointerEvents: 'none'
                        }}
                      />
                    )}

                    {/* Render Week Event Cards */}
                    {dayCards.map(({ item, start, end, top, height, colIndex, totalCols }) => {
                      const cardStyle = getItemCardStyle(item);
                      const isHovered = hoveredItemId === item.id;
                      const isDragging = dragState?.item.id === item.id;

                      const widthPercent = 100 / totalCols;
                      const leftPercent = colIndex * widthPercent;

                      return (
                        <div
                          key={item.id}
                          onMouseDown={(e) => handleStartDragWeek(e, item, 'MOVE', start, end, dayIdx)}
                          onClick={() => {
                            if (!hasMovedRef.current) {
                              onItemClick(item);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (!dragState) {
                              setHoveredItemId(item.id);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipData({ item, x: rect.left + rect.width / 2, y: rect.top - 8 });
                            }
                          }}
                          onMouseLeave={() => {
                            if (!dragState) {
                              setHoveredItemId(null);
                              setTooltipData(null);
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: `${top + 1}px`,
                            left: `calc(${leftPercent}% + 2px)`,
                            width: `calc(${widthPercent}% - 4px)`,
                            height: `${height - 2}px`,
                            minHeight: '26px',
                            background: cardStyle.bg,
                            border: `1.5px solid ${cardStyle.border}`,
                            borderLeft: `4px solid ${cardStyle.accent}`,
                            borderRadius: '6px',
                            boxShadow: isDragging
                              ? '0 12px 28px rgba(0, 0, 0, 0.6), 0 0 0 2px #ffffff, 0 0 16px rgba(59, 130, 246, 0.6)'
                              : isHovered
                              ? '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 0 1px #ffffff'
                              : '0 2px 6px rgba(0, 0, 0, 0.25)',
                            zIndex: isDragging ? 50 : isHovered ? 15 : 5,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '3px 6px',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            userSelect: 'none',
                            transform: isDragging ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'none'
                          }}
                        >
                          {/* Top Resize Handle */}
                          <div
                            onMouseDown={(e) => handleStartDragWeek(e, item, 'RESIZE_START', start, end, dayIdx)}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '6px',
                              cursor: 'ns-resize',
                              zIndex: 10,
                              backgroundColor: isHovered || isDragging ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                              borderRadius: '6px 6px 0 0'
                            }}
                            title="Kéo mép trên để chỉnh giờ bắt đầu"
                          />

                          {/* Content */}
                          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            <div
                              style={{
                                fontSize: height < 40 ? '11px' : '12px',
                                fontWeight: 700,
                                color: '#ffffff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: '1.2',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: cardStyle.accent,
                                  flexShrink: 0
                                }}
                              />
                              <span>{item.title}</span>
                            </div>

                            {height >= 50 && item.subject && (
                              <div style={{ fontSize: '10px', color: cardStyle.accent, marginTop: '2px', fontWeight: 600 }}>
                                {item.subject.name}
                              </div>
                            )}
                          </div>

                          {/* Time Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                            <button
                              type="button"
                              onClick={(e) => handleOpenTimeEditor(e, item)}
                              onMouseDown={(e) => e.stopPropagation()}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                fontSize: '9.5px',
                                fontWeight: 700,
                                color: '#e2e8f0',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                cursor: 'pointer'
                              }}
                              title="Nhấp để nhập giờ bắt đầu & kết thúc"
                            >
                              <Clock size={9} />
                              <span>{formatHHmm(start)} - {formatHHmm(end)}</span>
                            </button>
                          </div>

                          {/* Bottom Resize Handle */}
                          <div
                            onMouseDown={(e) => handleStartDragWeek(e, item, 'RESIZE_END', start, end, dayIdx)}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '6px',
                              cursor: 'ns-resize',
                              zIndex: 10,
                              backgroundColor: isHovered || isDragging ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                              borderRadius: '0 0 6px 6px'
                            }}
                            title="Kéo mép dưới để chỉnh giờ kết thúc"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. REALTIME FLOATING DRAG PREVIEW PILL (Week View) */}
      {dragState && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '28px',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 12px 36px rgba(0,0,0,0.8), 0 0 0 2px rgba(56, 189, 248, 0.5)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <Clock size={16} />
          <span>
            {dragState.item.title}: {formatHHmm(dragState.currentStart)} - {formatHHmm(dragState.currentEnd)} (
            {dayOfWeekNamesLong[dragState.currentStart.getDay()]}, {dragState.currentStart.getDate()}/{dragState.currentStart.getMonth() + 1})
          </span>
        </div>
      )}

      {/* 5. MORE EVENTS MODAL (Khi bấm vào ngày ở lịch năm hoặc "+N mục khác" ở lịch tháng) */}
      {moreEventsModal && (
        <div
          onClick={() => setMoreEventsModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '380px',
              maxHeight: '80vh',
              backgroundColor: '#171a21',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  {dayOfWeekNamesLong[moreEventsModal.date.getDay()]}, {moreEventsModal.date.getDate()} Tháng {moreEventsModal.date.getMonth() + 1}, {moreEventsModal.date.getFullYear()}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {moreEventsModal.items.length} sự kiện & công việc
                </div>
              </div>

              <button
                onClick={() => setMoreEventsModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div style={{ padding: '12px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {moreEventsModal.items.map((item) => {
                const { start, end } = getItemExactDates(item);
                const cardStyle = getItemCardStyle(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setMoreEventsModal(null);
                      onItemClick(item);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: cardStyle.bg,
                      border: `1px solid ${cardStyle.border}`,
                      borderLeft: `4px solid ${cardStyle.accent}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'transform 0.1s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {formatHHmm(start)} - {formatHHmm(end)}
                      </span>
                      {item.subject && (
                        <span style={{ color: cardStyle.accent, fontWeight: 600 }}>• {item.subject.name}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. MINI INLINE TIME EDITOR POPOVER */}
      {timeEditorData && (
        <>
          <div
            onClick={() => setTimeEditorData(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 110,
              backgroundColor: 'rgba(0,0,0,0.1)'
            }}
          />

          <div
            style={{
              position: 'fixed',
              left: `${timeEditorData.x}px`,
              top: `${timeEditorData.y}px`,
              zIndex: 120,
              width: '290px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
              <Clock size={16} />
              <span>Chỉnh Giờ Bắt Đầu & Kết Thúc</span>
            </div>

            <div style={{ fontSize: '11.5px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {timeEditorData.item.title}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Giờ Bắt Đầu
                </label>
                <input
                  type="time"
                  value={timeEditorData.startHour}
                  onChange={(e) => setTimeEditorData({ ...timeEditorData, startHour: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Giờ Kết Thúc
                </label>
                <input
                  type="time"
                  value={timeEditorData.endHour}
                  onChange={(e) => setTimeEditorData({ ...timeEditorData, endHour: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setTimeEditorData(null)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTimeEditor}
                style={{
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                }}
              >
                Lưu Giờ
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
