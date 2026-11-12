import React, { useState, useMemo, useRef } from 'react';
import {
  GanttChart,
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Clock,
  Filter,
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  User,
  ArrowUp,
  ArrowDown,
  Minus,
  Diamond,
  ListTodo,
  Layers,
  Flame,
  Hourglass,
  Eye,
  Maximize2,
  Trash2,
  History,
  FileText,
} from 'lucide-react';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface WorkSession {
  id: string;
  day: number;
  label: string;
  isLate?: boolean;
}

export interface TaskHistoryItem {
  id: string;
  timeStr: string;
  actor: string;
  action: string;
}

export interface GanttTask {
  id: string;
  wbs: string;
  title: string;
  description?: string;
  startDay?: number; // undefined nếu chưa có mốc (UXR-12)
  durationDays?: number;
  status: TaskStatus;
  priority: PriorityLevel;
  assignee: string;
  dueDateStr?: string;
  milestoneTitle?: string;
  checklist: ChecklistItem[];
  workSessions?: WorkSession[];
  history?: TaskHistoryItem[];
}

export interface Milestone {
  id: string;
  day: number;
  title: string;
}

const INITIAL_MILESTONES: Milestone[] = [
  { id: 'm-1', day: 5, title: 'M1: Chốt Thiết kế & DB Schema' },
  { id: 'm-2', day: 9, title: 'M2: Đóng gói OpenAPI Contracts' },
  { id: 'm-3', day: 16, title: 'M3: Hoàn thành 14 Viewports Web' },
  { id: 'm-4', day: 22, title: 'M4: Triển khai Staging & Pilot' },
  { id: 'm-5', day: 28, title: 'M5: Nghiệm thu Đồ án SNOTE v2' },
];

const INITIAL_TASKS: GanttTask[] = [
  {
    id: 't-1',
    wbs: '1.1',
    title: 'Thu thập yêu cầu & Thiết kế Kiến trúc SNOTE v2',
    description: 'Khảo sát và chuẩn hóa 8 trụ cột kỹ thuật của đồ án SNOTE v2, phân rã ranh giới module, thiết kế Access Control Matrix và xác lập quy chế kiểm soát dữ liệu.',
    startDay: 1,
    durationDays: 5,
    status: 'done',
    priority: 'urgent',
    assignee: 'Lê Hoàng Nam',
    dueDateStr: 'Ngày 05',
    milestoneTitle: 'M1: Chốt Thiết kế & DB Schema',
    checklist: [
      { id: 'c-1', text: 'Khảo sát đặc tả 8 trụ cột kỹ thuật', done: true },
      { id: 'c-2', text: 'Xác lập sơ đồ phân rã module', done: true },
      { id: 'c-3', text: 'Thiết kế ranh giới bảo mật & Auth gate', done: true },
    ],
    workSessions: [
      { id: 'ws-1', day: 3, label: 'Phiên thiết kế kiến trúc' },
    ],
    history: [
      { id: 'h-1', timeStr: 'N01 08:30', actor: 'Lê Hoàng Nam', action: 'Khởi tạo công việc WBS 1.1' },
      { id: 'h-2', timeStr: 'N05 17:00', actor: 'Lê Hoàng Nam', action: 'Xác nhận hoàn thành toàn bộ checklist' },
    ],
  },
  {
    id: 't-2',
    wbs: '1.2',
    title: 'Đặc tả OpenAPI Contracts & DTOs',
    description: 'Đặc tả 42 API endpoints trong openapi.yaml, thiết kế cấu trúc DTOs, sinh code tự động cho client types và thống nhất mã lỗi chuẩn RFC 7807.',
    startDay: 4,
    durationDays: 5,
    status: 'done',
    priority: 'high',
    assignee: 'Trần Thị Mai',
    dueDateStr: 'Ngày 09',
    milestoneTitle: 'M2: Đóng gói OpenAPI Contracts',
    checklist: [
      { id: 'c-4', text: 'Đặc tả 42 API endpoints trong openapi.yaml', done: true },
      { id: 'c-5', text: 'Generate TypeScript DTO types', done: true },
    ],
    history: [
      { id: 'h-3', timeStr: 'N04 09:15', actor: 'Trần Thị Mai', action: 'Nhận việc và thiết lập checklist' },
      { id: 'h-4', timeStr: 'N09 16:30', actor: 'Trần Thị Mai', action: 'Xác nhận nghiệm thu hợp đồng API' },
    ],
  },
  {
    id: 't-3',
    wbs: '2.1',
    title: 'Triển khai Core Engine & Auth Gatekeeper',
    description: 'Triển khai máy chủ xác thực JWT, bảo vệ chống giả mạo CSRF, gắn cookie HttpOnly và thiết lập Auth Gatekeeper để kiểm soát quyền theo đối tượng và thời điểm.',
    startDay: 7,
    durationDays: 4, // Kết thúc N10 (Hôm nay!)
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Nguyễn Văn Minh',
    dueDateStr: 'Ngày 10',
    milestoneTitle: 'M2: Đóng gói OpenAPI Contracts',
    checklist: [
      { id: 'c-6', text: 'Cài đặt JWT & Session Cookie HttpOnly', done: true },
      { id: 'c-7', text: 'Xử lý CSRF protection middleware', done: true },
      { id: 'c-8', text: 'Unit test 12 ca kiểm thử bảo mật', done: false },
    ],
    workSessions: [
      { id: 'ws-2', day: 10, label: 'Code Auth middleware' },
    ],
    history: [
      { id: 'h-5', timeStr: 'N07 08:00', actor: 'Nguyễn Văn Minh', action: 'Bắt đầu triển khai Auth middleware' },
      { id: 'h-6', timeStr: 'Hôm nay 08:30', actor: 'Nguyễn Văn Minh', action: 'Hoàn thành 2/3 mục checklist' },
    ],
  },
  {
    id: 't-4',
    wbs: '2.2',
    title: 'Xây dựng UI Web Shell & 14 Viewports',
    description: 'Xây dựng UI Web Shell và 14 Viewports giao diện cho đồ án SNOTE v2, áp dụng theme Monochrome chuẩn mực, kiểm toán tỷ lệ tương phản WCAG AA > 4.5:1.',
    startDay: 9,
    durationDays: 8, // Kết thúc N16 (Còn 6 ngày)
    status: 'in_progress',
    priority: 'high',
    assignee: 'Phạm Quỳnh Anh',
    dueDateStr: 'Ngày 16',
    milestoneTitle: 'M3: Hoàn thành 14 Viewports Web',
    checklist: [
      { id: 'c-9', text: 'Chuẩn hóa theme.css Monochrome tokens', done: true },
      { id: 'c-10', text: 'Hoàn thiện PreviewHarness 14 tabs', done: true },
      { id: 'c-11', text: 'Tối ưu transition 160ms mượt mà', done: false },
      { id: 'c-12', text: 'Kiểm toán WCAG AA Contrast > 4.5:1', done: false },
    ],
    workSessions: [
      { id: 'ws-3', day: 11, label: 'Làm giao diện Preview Harness' },
      { id: 'ws-4', day: 14, label: 'Chỉnh sửa Contrast Dark/Light' },
    ],
    history: [
      { id: 'h-7', timeStr: 'N09 10:00', actor: 'Phạm Quỳnh Anh', action: 'Khởi tạo UI shell' },
      { id: 'h-8', timeStr: 'Hôm nay 09:00', actor: 'Phạm Quỳnh Anh', action: 'Hoàn thành PreviewHarness 14 tabs' },
    ],
  },
  {
    id: 't-5',
    wbs: '2.3',
    title: 'Kiểm định bảo mật phụ thuộc & Quét mã tĩnh SAST',
    description: 'Quét toàn bộ lỗ hổng phụ thuộc cấp cao (High / Critical) trong node_modules bằng npm audit và Snyk, vá lỗ hổng bảo mật thư viện bên thứ ba.',
    startDay: 6,
    durationDays: 3, // Kết thúc N8 (Quá hạn 2 ngày!)
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Đỗ Quốc Bảo',
    dueDateStr: 'Ngày 08',
    milestoneTitle: 'M2: Đóng gói OpenAPI Contracts',
    checklist: [
      { id: 'c-12a', text: 'Chạy npm audit & Snyk scan', done: true },
      { id: 'c-12b', text: 'Vá lỗ hổng phụ thuộc cấp cao', done: false },
    ],
    history: [
      { id: 'h-9', timeStr: 'N06 14:00', actor: 'Đỗ Quốc Bảo', action: 'Chạy công cụ phân tích SAST' },
      { id: 'h-10', timeStr: 'Hôm nay 07:30', actor: 'Hệ thống', action: 'Cảnh báo: Đã quá hạn 2 ngày' },
    ],
  },
  {
    id: 't-6',
    wbs: '3.1',
    title: 'Kiểm thử E2E & Tối ưu WCAG AA Contrast',
    description: 'Viết bộ kiểm thử tự động E2E bằng Playwright cho 14 tabs, kiểm tra tính toàn vẹn của dữ liệu và tuân thủ nguyên tắc Single File Isolation.',
    startDay: 14,
    durationDays: 5,
    status: 'pending',
    priority: 'medium',
    assignee: 'Đỗ Quốc Bảo',
    dueDateStr: 'Ngày 18',
    milestoneTitle: 'M3: Hoàn thành 14 Viewports Web',
    checklist: [
      { id: 'c-13', text: 'Chạy automated test suite Playwright', done: false },
      { id: 'c-14', text: 'Xóa bỏ toàn bộ mã nội bộ thừa khỏi UI', done: false },
    ],
    history: [
      { id: 'h-11', timeStr: 'N08 11:00', actor: 'Đỗ Quốc Bảo', action: 'Lập dàn ý kịch bản test E2E' },
    ],
  },
  {
    id: 't-7',
    wbs: '3.2',
    title: 'Đóng gói Docker & Cấu hình CI/CD Pipeline',
    description: 'Viết Dockerfile multi-stage tối ưu dung lượng, cấu hình docker-compose và kịch bản CI/CD trên GitHub Actions để tự động kiểm thử và build image.',
    startDay: 17,
    durationDays: 5,
    status: 'pending',
    priority: 'low',
    assignee: 'Lê Hoàng Nam',
    dueDateStr: 'Ngày 21',
    milestoneTitle: 'M4: Triển khai Staging & Pilot',
    checklist: [
      { id: 'c-15', text: 'Build production image multi-stage', done: false },
      { id: 'c-16', text: 'Kiểm thử docker compose up pilot', done: false },
    ],
    history: [
      { id: 'h-12', timeStr: 'N10 09:00', actor: 'Lê Hoàng Nam', action: 'Tạo kế hoạch cấu hình container' },
    ],
  },
  {
    id: 't-8',
    wbs: '4.1',
    title: 'Thử nghiệm Pilot diện hẹp & Thu thập phản hồi',
    description: 'Mở môi trường Staging thử nghiệm diện hẹp cho 30 giáo viên và 200 học sinh, đo đạc độ trễ tải trang và ghi nhận góp ý cải tiến công thái học.',
    startDay: 22,
    durationDays: 4,
    status: 'pending',
    priority: 'medium',
    assignee: 'Trần Thị Mai',
    dueDateStr: 'Ngày 25',
    milestoneTitle: 'M4: Triển khai Staging & Pilot',
    checklist: [
      { id: 'c-17a', text: 'Tạo tài khoản thử nghiệm cho giáo viên', done: false },
      { id: 'c-17b', text: 'Thu thập bảng đánh giá độ trễ và UX', done: false },
    ],
    history: [
      { id: 'h-13', timeStr: 'N10 10:00', actor: 'Trần Thị Mai', action: 'Lên danh sách người dùng pilot' },
    ],
  },
  {
    id: 't-9',
    wbs: '4.2',
    title: 'Nghiệm thu tổng thể & Bàn giao đồ án SNOTE v2',
    description: 'Rà soát 8 trụ cột kỹ thuật, đối chiếu bảng truy vết yêu cầu, đóng gói mã nguồn và chuẩn bị slide thuyết trình cho buổi bảo vệ đồ án tốt nghiệp.',
    startDay: 25,
    durationDays: 4,
    status: 'pending',
    priority: 'high',
    assignee: 'Phạm Quỳnh Anh',
    dueDateStr: 'Ngày 28',
    milestoneTitle: 'M5: Nghiệm thu Đồ án SNOTE v2',
    checklist: [
      { id: 'c-18a', text: 'Kiểm tra checklist 8 trụ cột kỹ thuật', done: false },
      { id: 'c-18b', text: 'Đóng gói mã nguồn và báo cáo nghiệm thu', done: false },
    ],
    history: [
      { id: 'h-14', timeStr: 'N10 10:30', actor: 'Phạm Quỳnh Anh', action: 'Tạo phiếu giao việc nghiệm thu' },
    ],
  },
  // Nhiệm vụ chưa có mốc thời gian (UXR-12, TASK-17)
  {
    id: 't-10',
    wbs: '5.1',
    title: 'Soạn thảo tài liệu bàn giao Pilot & Hướng dẫn sử dụng',
    description: 'Biên soạn hướng dẫn sử dụng chi tiết có hình ảnh minh họa cho cả 2 nhóm đối tượng: Giáo viên quản lý lớp và Học sinh tham gia học tập.',
    status: 'pending',
    priority: 'high',
    assignee: 'Trần Thị Mai',
    checklist: [
      { id: 'c-19', text: 'Biên soạn hướng dẫn cho Giáo viên', done: false },
      { id: 'c-20', text: 'Biên soạn hướng dẫn cho Học sinh', done: false },
    ],
    history: [
      { id: 'h-15', timeStr: 'N09 15:00', actor: 'Trần Thị Mai', action: 'Tạo việc chờ lên lịch' },
    ],
  },
  {
    id: 't-11',
    wbs: '5.2',
    title: 'Tối ưu hóa hiệu năng nén tài nguyên thư viện tĩnh',
    description: 'Cấu hình nén gzip và brotli trên reverse proxy Nginx, phân phát tệp tĩnh với cache-control bất biến để giảm 70% thời gian tải trang đầu tiên.',
    status: 'pending',
    priority: 'low',
    assignee: 'Đỗ Quốc Bảo',
    checklist: [
      { id: 'c-21', text: 'Bật nén gzip/brotli trên Nginx server', done: false },
    ],
    history: [
      { id: 'h-16', timeStr: 'N09 15:30', actor: 'Đỗ Quốc Bảo', action: 'Tạo việc chờ lên lịch' },
    ],
  },
];

const TOTAL_DAYS = 28;
const CURRENT_DAY = 10; // "Hôm nay" tại ngày 10

const WEEKS = [
  { week: 1, label: 'Tuần 1', days: [1, 2, 3, 4, 5, 6, 7] },
  { week: 2, label: 'Tuần 2', days: [8, 9, 10, 11, 12, 13, 14] },
  { week: 3, label: 'Tuần 3', days: [15, 16, 17, 18, 19, 20, 21] },
  { week: 4, label: 'Tuần 4', days: [22, 23, 24, 25, 26, 27, 28] },
];

export const Tab08TasksGantt: React.FC = () => {
  const [tasks, setTasks] = useState<GanttTask[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('t-5');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'overdue' | 'urgent'>('all');
  const [zoomMode, setZoomMode] = useState<'day' | 'week'>('day');
  const [timelineOffset, setTimelineOffset] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [showUnscheduled, setShowUnscheduled] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states cho tạo việc mới
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Lê Hoàng Nam');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newStartDay, setNewStartDay] = useState<string>('10');
  const [newDuration, setNewDuration] = useState<string>('4');
  const [isUnscheduledChecked, setIsUnscheduledChecked] = useState(false);

  // Checklist input in drawer
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newSessionDay, setNewSessionDay] = useState('11');
  const [newSessionLabel, setNewSessionLabel] = useState('');

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const ganttScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollToToday = () => {
    setTimelineOffset(0);
    if (ganttScrollRef.current) {
      const container = ganttScrollRef.current;
      // Cột Ngày 10: 340px (Master) + 9 * 36px + 18px (tâm) = 682px
      const targetX = 682 - container.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, targetX), behavior: 'smooth' });
    }
    showNotification('Đã định vị trục thời gian về ngày Hôm nay (N10)');
  };

  const handleScrollPrev = () => {
    setTimelineOffset(prev => Math.max(prev - 3, -6));
    if (ganttScrollRef.current) {
      ganttScrollRef.current.scrollBy({ left: -108, behavior: 'smooth' });
    }
  };

  const handleScrollNext = () => {
    setTimelineOffset(prev => Math.min(prev + 3, 6));
    if (ganttScrollRef.current) {
      ganttScrollRef.current.scrollBy({ left: 108, behavior: 'smooth' });
    }
  };

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Hàm tính toán thời gian làm còn lại (TASK-06)
  const getTimeRemainingInfo = (task: GanttTask) => {
    if (task.status === 'done') {
      return {
        label: 'Đã hoàn thành',
        type: 'done' as const,
        colorVar: 'var(--success)',
        bgVar: 'rgba(16, 185, 129, 0.12)',
        borderVar: 'rgba(16, 185, 129, 0.35)',
      };
    }
    if (task.startDay === undefined || task.durationDays === undefined) {
      return {
        label: 'Chưa đặt hạn',
        type: 'unscheduled' as const,
        colorVar: 'var(--text-secondary)',
        bgVar: 'var(--surface-hover)',
        borderVar: 'var(--border-divider)',
      };
    }

    const endDay = task.startDay + task.durationDays - 1;
    const diff = endDay - CURRENT_DAY;

    if (diff < 0) {
      return {
        label: `Quá hạn ${Math.abs(diff)} ngày`,
        type: 'overdue' as const,
        colorVar: 'var(--danger)',
        bgVar: 'rgba(239, 68, 68, 0.15)',
        borderVar: 'rgba(239, 68, 68, 0.45)',
      };
    }
    if (diff === 0) {
      return {
        label: 'Hạn hôm nay!',
        type: 'today' as const,
        colorVar: 'var(--warning)',
        bgVar: 'rgba(245, 158, 11, 0.16)',
        borderVar: 'rgba(245, 158, 11, 0.45)',
      };
    }
    if (diff <= 2) {
      return {
        label: `Còn ${diff} ngày`,
        type: 'urgent_time' as const,
        colorVar: 'var(--warning)',
        bgVar: 'rgba(245, 158, 11, 0.12)',
        borderVar: 'rgba(245, 158, 11, 0.35)',
      };
    }
    return {
      label: `Còn ${diff} ngày`,
      type: 'normal' as const,
      colorVar: 'var(--accent)',
      bgVar: 'rgba(37, 99, 235, 0.10)',
      borderVar: 'rgba(37, 99, 235, 0.28)',
    };
  };

  // Helper render Badge Thời gian làm còn lại (TASK-06)
  const renderRemainingTimeBadge = (task: GanttTask) => {
    const info = getTimeRemainingInfo(task);
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '10.5px',
          fontWeight: 650,
          background: info.bgVar,
          border: `1px solid ${info.borderVar}`,
          color: info.colorVar,
          whiteSpace: 'nowrap',
        }}
        title={`Thời lượng còn lại: ${info.label}`}
      >
        <Clock size={11} />
        <span>{info.label}</span>
      </span>
    );
  };

  // Helper render Priority Badge với tín hiệu màu sắc nổi bật
  const renderPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: 'var(--danger)',
              fontSize: '11px',
              fontWeight: 700,
            }}
            title="Mức ưu tiên: Khẩn cấp (Critical)"
          >
            <Flame size={12} style={{ color: 'var(--danger)' }} />
            <span>Khẩn cấp</span>
          </span>
        );
      case 'high':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: '4px',
              background: 'rgba(245, 158, 11, 0.14)',
              border: '1px solid rgba(245, 158, 11, 0.40)',
              color: 'var(--warning)',
              fontSize: '11px',
              fontWeight: 650,
            }}
            title="Mức ưu tiên: Cao"
          >
            <ArrowUp size={12} style={{ color: 'var(--warning)' }} />
            <span>Cao</span>
          </span>
        );
      case 'medium':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(37, 99, 235, 0.10)',
              border: '1px solid rgba(37, 99, 235, 0.30)',
              color: 'var(--accent)',
              fontSize: '11px',
              fontWeight: 500,
            }}
            title="Mức ưu tiên: Vừa / Trung bình"
          >
            <Minus size={11} style={{ color: 'var(--accent)' }} />
            <span>Vừa</span>
          </span>
        );
      case 'low':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-divider)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
            }}
            title="Mức ưu tiên: Thấp"
          >
            <ArrowDown size={11} />
            <span>Thấp</span>
          </span>
        );
    }
  };

  // Tách biệt việc có lịch và chưa có lịch (UXR-12, TASK-17)
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled: GanttTask[] = [];
    const unscheduled: GanttTask[] = [];

    tasks.forEach(t => {
      if (t.startDay !== undefined && t.durationDays !== undefined) {
        scheduled.push(t);
      } else {
        unscheduled.push(t);
      }
    });

    const priorityWeight: Record<PriorityLevel, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    unscheduled.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [tasks]);

  // Bộ lọc danh sách
  const filteredScheduledTasks = useMemo(() => {
    return scheduledTasks.filter(t => {
      if (activeFilter === 'today') {
        const endDay = (t.startDay ?? 0) + (t.durationDays ?? 0) - 1;
        return (t.startDay ?? 0) <= CURRENT_DAY && endDay >= CURRENT_DAY;
      }
      if (activeFilter === 'overdue') {
        const endDay = (t.startDay ?? 0) + (t.durationDays ?? 0) - 1;
        return endDay < CURRENT_DAY && t.status !== 'done';
      }
      if (activeFilter === 'urgent') {
        return t.priority === 'urgent' || t.priority === 'high';
      }
      return true;
    });
  }, [scheduledTasks, activeFilter]);

  // Đếm số lượng task quá hạn
  const overdueCount = useMemo(() => {
    return scheduledTasks.filter(t => {
      const endDay = (t.startDay ?? 0) + (t.durationDays ?? 0) - 1;
      return endDay < CURRENT_DAY && t.status !== 'done';
    }).length;
  }, [scheduledTasks]);

  // Toggle trạng thái hoàn thành task
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newStatus: TaskStatus = t.status === 'done' ? 'in_progress' : 'done';
        return {
          ...t,
          status: newStatus,
          checklist: newStatus === 'done'
            ? t.checklist.map(c => ({ ...c, done: true }))
            : t.checklist,
        };
      })
    );
    showNotification('Đã cập nhật trạng thái công việc');
  };

  // Toggle checklist item
  const handleToggleChecklist = (taskId: string, checkId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map(c =>
          c.id === checkId ? { ...c, done: !c.done } : c
        );
        const allDone = updatedChecklist.length > 0 && updatedChecklist.every(c => c.done);
        return {
          ...t,
          checklist: updatedChecklist,
          status: allDone ? 'done' : t.status === 'done' ? 'in_progress' : t.status,
        };
      })
    );
  };

  // Thêm checklist item
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedTaskId) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id !== selectedTaskId) return t;
        const newItem: ChecklistItem = {
          id: `c-${Date.now()}`,
          text: newChecklistText.trim(),
          done: false,
        };
        return {
          ...t,
          checklist: [...t.checklist, newItem],
          status: t.status === 'done' ? 'in_progress' : t.status,
        };
      })
    );
    setNewChecklistText('');
    showNotification('Đã thêm mục checklist mới');
  };

  // Xóa mục checklist (TASK-15)
  const handleDeleteChecklistItem = (taskId: string, checkId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updated = t.checklist.filter(c => c.id !== checkId);
        const allDone = updated.length > 0 && updated.every(c => c.done);
        return {
          ...t,
          checklist: updated,
          status: allDone ? 'done' : t.status === 'done' ? 'in_progress' : t.status,
        };
      })
    );
    showNotification('Đã xóa mục checklist');
  };

  // Thêm buổi làm việc riêng (TASK-07)
  const handleAddWorkSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionLabel.trim() || !selectedTaskId) return;

    const dayNum = parseInt(newSessionDay, 10);
    const endDay = (selectedTask?.startDay ?? 0) + (selectedTask?.durationDays ?? 0) - 1;
    const isLate = endDay > 0 && dayNum > endDay;

    setTasks(prev =>
      prev.map(t => {
        if (t.id !== selectedTaskId) return t;
        const newSession: WorkSession = {
          id: `ws-${Date.now()}`,
          day: dayNum,
          label: newSessionLabel.trim(),
          isLate,
        };
        return {
          ...t,
          workSessions: [...(t.workSessions || []), newSession],
        };
      })
    );
    setNewSessionLabel('');
    showNotification(isLate ? 'Đã thêm buổi làm riêng (Cảnh báo: Làm muộn)' : 'Đã thêm buổi làm việc riêng');
  };

  // Tạo công việc mới
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nextWbs = `5.${tasks.length + 1}`;
    const newTask: GanttTask = {
      id: `t-${Date.now()}`,
      wbs: nextWbs,
      title: newTitle.trim(),
      status: 'pending',
      priority: newPriority,
      assignee: newAssignee,
      startDay: isUnscheduledChecked ? undefined : parseInt(newStartDay, 10),
      durationDays: isUnscheduledChecked ? undefined : parseInt(newDuration, 10),
      dueDateStr: isUnscheduledChecked ? undefined : `Ngày ${parseInt(newStartDay, 10) + parseInt(newDuration, 10) - 1}`,
      checklist: [{ id: `c-${Date.now()}`, text: 'Khởi tạo công việc', done: false }],
    };

    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setIsDrawerOpen(true);
    setIsCreateModalOpen(false);
    setNewTitle('');
    showNotification('Đã tạo công việc mới thành công');
  };

  const daysList = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', position: 'relative' }}>
      {/* Toast Notification */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 1000,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            borderRadius: '6px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Check size={16} style={{ color: 'var(--success)' }} />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. TOP TOOLBAR: Clean Title, View Switcher & Action */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <GanttChart size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Tiến độ công việc & Thời hạn
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Trục thời gian 4 tuần (28 ngày) • Tín hiệu cảnh báo khẩn cấp & Đếm ngược thời gian còn lại (TASK-06)
            </div>
          </div>
        </div>

        {/* Legend & Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Zoom toggle: Ngày / Tuần */}
          <div
            style={{
              display: 'inline-flex',
              borderRadius: '6px',
              border: '1px solid var(--border-divider)',
              overflow: 'hidden',
              background: 'var(--surface-hover)',
            }}
          >
            <button
              type="button"
              onClick={() => setZoomMode('day')}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                border: 'none',
                background: zoomMode === 'day' ? 'var(--text-primary)' : 'transparent',
                color: zoomMode === 'day' ? 'var(--bg-app)' : 'var(--text-primary)',
                fontWeight: zoomMode === 'day' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Ngày
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('week')}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                border: 'none',
                borderLeft: '1px solid var(--border-divider)',
                background: zoomMode === 'week' ? 'var(--text-primary)' : 'transparent',
                color: zoomMode === 'week' ? 'var(--bg-app)' : 'var(--text-primary)',
                fontWeight: zoomMode === 'week' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Tuần
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'var(--text-primary)',
              color: 'var(--bg-app)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-label="Thêm công việc mới"
          >
            <Plus size={14} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-BAR: Legend Bar MÀU SẮC & Timeline Navigation (UXR-10) */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Filter Chips với Badge đếm số lượng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '4px' }}>Bộ lọc:</span>
          {(
            [
              { id: 'all' as const, label: `Tất cả (${scheduledTasks.length})`, isAlert: false },
              { id: 'today' as const, label: 'Hôm nay', isAlert: false },
              { id: 'overdue' as const, label: `Quá hạn (${overdueCount})`, isAlert: overdueCount > 0 },
              { id: 'urgent' as const, label: 'Khẩn cấp', isAlert: false },
            ]
          ).map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  border: '1px solid',
                  borderColor: isActive
                    ? 'var(--text-primary)'
                    : tab.isAlert
                    ? 'rgba(239, 68, 68, 0.4)'
                    : 'var(--border-divider)',
                  background: isActive
                    ? 'var(--surface-hover)'
                    : tab.isAlert
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'transparent',
                  color: tab.isAlert ? 'var(--danger)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {tab.isAlert && <AlertCircle size={12} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Chú thích Màu sắc Mức độ & Trạng thái */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Khẩn cấp / Quá hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Cao / Gần hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ color: 'var(--accent)' }}>Vừa / Còn hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ color: 'var(--success)' }}>Hoàn thành</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Diamond size={11} style={{ color: 'var(--warning)' }} />
            <span>Mốc Milestone</span>
          </div>
        </div>

        {/* Timeline Offset Controls (UXR-10) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleScrollPrev}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid var(--border-divider)',
              background: 'var(--surface-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            aria-label="Tuần trước"
            title="Cuộn lùi 3 ngày trên trục thời gian"
          >
            <ChevronLeft size={13} />
            <span>Trước</span>
          </button>
          <button
            type="button"
            onClick={handleScrollToToday}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 650,
              borderRadius: '4px',
              border: '1px solid var(--warning)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--warning)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Đưa trục quan sát căn giữa vạch Hôm nay (N10)"
          >
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)' }} />
            <span>Hôm nay (N{CURRENT_DAY})</span>
          </button>
          <button
            type="button"
            onClick={handleScrollNext}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid var(--border-divider)',
              background: 'var(--surface-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            aria-label="Tuần sau"
            title="Cuộn tiến 3 ngày trên trục thời gian"
          >
            <span>Sau</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 3. SPLIT MAIN CONTAINER: Gantt Grid (flex: 1) + Sliding Drawer (380px) */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
        {/* VÙNG BẢNG GANTT & CHƯA CÓ MỐC */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Lưới Ma trận Gantt 2 Tầng */}
          <div
            ref={ganttScrollRef}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              overflowX: 'auto',
              padding: '0',
            }}
          >
            {/* WRAPPER ĐỊNH VỊ TRỤC VÀ VẠCH CHỈ BÁO HÔM NAY */}
            <div style={{ minWidth: '1348px', position: 'relative' }}>
              {/* CỘT NỀN HIGHLIGHT NGÀY HÔM NAY (N10) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${340 + (CURRENT_DAY - 1) * 36}px`,
                  width: '36px',
                  top: 0,
                  bottom: 0,
                  background: 'rgba(245, 158, 11, 0.05)',
                  pointerEvents: 'none',
                  zIndex: 0,
                  borderLeft: '1px solid rgba(245, 158, 11, 0.20)',
                  borderRight: '1px solid rgba(245, 158, 11, 0.20)',
                }}
              />

              {/* VẠCH CHỈ BÁO THẲNG ĐỨNG HÔM NAY (VERTICAL TODAY GUIDE LINE) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${340 + (CURRENT_DAY - 1) * 36 + 17}px`,
                  width: '2px',
                  top: 0,
                  bottom: 0,
                  background: 'var(--warning)',
                  boxShadow: '0 0 8px rgba(245, 158, 11, 0.60)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                {/* Pin Badge ở đỉnh Header */}
                <div
                  style={{
                    position: 'sticky',
                    top: '2px',
                    left: 0,
                    transform: 'translateX(-50%)',
                    background: 'var(--warning)',
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                    lineHeight: '13px',
                    letterSpacing: '0.3px',
                  }}
                >
                  HÔM NAY
                </div>
              </div>

              {/* TẦNG 1 HEADER: WEEKS 1..4 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '340px repeat(28, 36px)',
                  borderBottom: '1px solid var(--border-divider)',
                  background: 'var(--surface-hover)',
                  minWidth: '1348px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ padding: '8px 16px', position: 'sticky', left: 0, background: 'var(--surface-hover)', zIndex: 4, borderRight: '1px solid var(--border-divider)' }}>
                  PHÂN ĐOẠN DỰ ÁN & ĐẦU VIỆC
                </div>
                {WEEKS.map(w => (
                  <div
                    key={w.week}
                    style={{
                      gridColumn: `span ${w.days.length}`,
                      textAlign: 'center',
                      padding: '8px 0',
                      borderLeft: '1px solid var(--border-divider)',
                    }}
                  >
                    {w.label} ({w.days.length} ngày)
                  </div>
                ))}
              </div>

              {/* TẦNG 2 HEADER: CỘT MASTER & CÁC NGÀY N1..N28 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '340px repeat(28, 36px)',
                  borderBottom: '1px solid var(--border-divider)',
                  minWidth: '1348px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    fontWeight: 600,
                    position: 'sticky',
                    left: 0,
                    background: 'var(--surface-card)',
                    zIndex: 4,
                    borderRight: '1px solid var(--border-divider)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>WBS • TÊN CÔNG VIỆC</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ƯU TIÊN / THỜI HẠN</span>
                </div>

                {daysList.map(d => {
                  const isCurrent = d === CURRENT_DAY;
                  return (
                    <div
                      key={d}
                      style={{
                        textAlign: 'center',
                        padding: '10px 0',
                        borderLeft: '1px solid var(--border-divider)',
                        background: isCurrent ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                        color: isCurrent ? 'var(--warning)' : 'var(--text-secondary)',
                        fontWeight: isCurrent ? 750 : 400,
                        position: 'relative',
                      }}
                    >
                      <span>N{d}</span>
                      {isCurrent && (
                        <div
                          style={{
                            fontSize: '8.5px',
                            fontWeight: 800,
                            color: 'var(--warning)',
                            lineHeight: 1,
                            marginTop: '2px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Nay
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* HÀNG MỐC MILESTONE TRACK */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '340px repeat(28, 36px)',
                  borderBottom: '1px solid var(--border-divider)',
                  minWidth: '1348px',
                  padding: '8px 0',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div
                  style={{
                    padding: '0 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'sticky',
                    left: 0,
                    background: 'var(--surface-card)',
                    zIndex: 4,
                    borderRight: '1px solid var(--border-divider)',
                  }}
                >
                  <Diamond size={13} style={{ color: 'var(--warning)' }} />
                  <span>Mốc chuyển giao (Milestones)</span>
              </div>

              {INITIAL_MILESTONES.map(m => (
                <div
                  key={m.id}
                  style={{
                    gridColumn: `${m.day + 1} / span 1`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                  title={m.title}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '3px',
                      background: 'var(--warning)',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transform: 'rotate(45deg)',
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    <span style={{ transform: 'rotate(-45deg)', fontSize: '9px', fontWeight: 800 }}>◆</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DANH SÁCH CÁC HÀNG TASK (GANTT ROWS) */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '1348px' }}>
              {filteredScheduledTasks.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Không tìm thấy công việc phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredScheduledTasks.map(task => {
                  const isSelected = selectedTaskId === task.id;
                  const leftCol = task.startDay ?? 1;
                  const spanCols = task.durationDays ?? 1;
                  const endDay = leftCol + spanCols - 1;
                  const timeInfo = getTimeRemainingInfo(task);
                  const isOverdue = timeInfo.type === 'overdue';

                  const doneCount = task.checklist.filter(c => c.done).length;
                  const totalCount = task.checklist.length;
                  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsDrawerOpen(true);
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '340px repeat(28, 36px)',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-divider)',
                        background: isSelected
                          ? 'var(--surface-hover)'
                          : isOverdue
                          ? 'rgba(239, 68, 68, 0.03)'
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                        minHeight: '52px',
                      }}
                    >
                      {/* Cột Master (Sticky Left) */}
                      <div
                        style={{
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          overflow: 'hidden',
                          position: 'sticky',
                          left: 0,
                          background: isSelected
                            ? 'var(--surface-hover)'
                            : 'var(--surface-card)',
                          zIndex: 4,
                          borderRight: '1px solid var(--border-divider)',
                          borderLeft: isOverdue
                            ? '3px solid var(--danger)'
                            : task.priority === 'urgent'
                            ? '3px solid var(--danger)'
                            : task.priority === 'high'
                            ? '3px solid var(--warning)'
                            : '3px solid transparent',
                        }}
                      >
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                              {task.wbs}
                            </span>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 500,
                                color: task.status === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)',
                                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                              }}
                            >
                              {task.title}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                            <span>{task.assignee}</span>
                            <span>•</span>
                            <span>{doneCount}/{totalCount} mục ({progressPct}%)</span>
                          </div>
                        </div>

                        {/* Badges bên phải cột Master: Mức độ ưu tiên + Thời lượng còn lại */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {renderPriorityBadge(task.priority)}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskId(task.id);
                                setIsDetailModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-divider)',
                                background: 'var(--surface-hover)',
                                color: 'var(--text-primary)',
                                fontSize: '10px',
                                fontWeight: 550,
                                cursor: 'pointer',
                                transition: 'all 120ms ease',
                              }}
                              title="Xem chi tiết công việc"
                            >
                              <Eye size={11} />
                              <span>Chi tiết</span>
                            </button>
                          </div>
                          {renderRemainingTimeBadge(task)}
                        </div>
                      </div>

                      {/* Timeline Bar Col (Độ dài span ngày) */}
                      <div
                        style={{
                          gridColumn: `${leftCol + 1} / span ${spanCols}`,
                          height: '28px',
                          borderRadius: '4px',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          boxShadow: isSelected ? '0 0 0 1px var(--text-primary)' : 'none',
                          border: isOverdue
                            ? '1.5px dashed var(--danger)'
                            : task.priority === 'urgent'
                            ? '1px solid rgba(239, 68, 68, 0.45)'
                            : task.priority === 'high'
                            ? '1px solid rgba(245, 158, 11, 0.40)'
                            : task.priority === 'medium'
                            ? '1px solid rgba(37, 99, 235, 0.35)'
                            : '1px solid var(--border-divider)',
                          background: task.status === 'done'
                            ? 'var(--surface-hover)'
                            : isOverdue
                            ? 'rgba(239, 68, 68, 0.08)'
                            : task.priority === 'urgent'
                            ? 'rgba(239, 68, 68, 0.06)'
                            : task.priority === 'high'
                            ? 'rgba(245, 158, 11, 0.06)'
                            : 'var(--surface-card)',
                          color: 'var(--text-primary)',
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {/* Thanh progress fill bên trong khi in_progress */}
                        {task.status !== 'done' && (
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${progressPct}%`,
                              background: isOverdue
                                ? 'rgba(239, 68, 68, 0.25)'
                                : task.priority === 'urgent'
                                ? 'rgba(239, 68, 68, 0.20)'
                                : task.priority === 'high'
                                ? 'rgba(245, 158, 11, 0.22)'
                                : task.priority === 'medium'
                                ? 'rgba(37, 99, 235, 0.18)'
                                : 'var(--surface-hover)',
                              zIndex: 0,
                              transition: 'width 200ms ease',
                            }}
                          />
                        )}

                        <div
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            fontSize: '11px',
                            fontWeight: 600,
                            gap: '6px',
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isOverdue && <AlertTriangle size={12} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
                            <span>{task.durationDays} ngày</span>
                          </span>

                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: task.status === 'done'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : isOverdue
                                ? 'rgba(239, 68, 68, 0.25)'
                                : timeInfo.type === 'today'
                                ? 'rgba(245, 158, 11, 0.25)'
                                : 'var(--surface-hover)',
                              color: task.status === 'done'
                                ? 'var(--success)'
                                : isOverdue
                                ? 'var(--danger)'
                                : timeInfo.type === 'today'
                                ? 'var(--warning)'
                                : 'var(--text-secondary)',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {task.status === 'done'
                              ? 'Xong'
                              : isOverdue
                              ? 'Quá hạn'
                              : timeInfo.type === 'today'
                              ? 'Hạn hôm nay'
                              : `${progressPct}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* HẾT WRAPPER ĐỊNH VỊ TRỤC VÀ VẠCH CHỈ BÁO HÔM NAY */}
            </div>
          </div>

          {/* 4. KHỐI CÔNG VIỆC CHƯA CÓ MỐC THỜI GIAN (UXR-12, TASK-17) */}
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '16px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setShowUnscheduled(prev => !prev)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListTodo size={16} style={{ color: 'var(--text-primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Công việc chưa có mốc thời gian ({unscheduledTasks.length})
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  (Xếp theo mức ưu tiên: Khẩn cấp → Cao → Vừa → Thấp)
                </span>
              </div>
              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {showUnscheduled ? 'Thu gọn' : 'Bung ra'}
              </button>
            </div>

            {showUnscheduled && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '10px',
                  marginTop: '14px',
                }}
              >
                {unscheduledTasks.map(task => {
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsDrawerOpen(true);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-divider)',
                        borderLeft: task.priority === 'urgent'
                          ? '3px solid var(--danger)'
                          : task.priority === 'high'
                          ? '3px solid var(--warning)'
                          : task.priority === 'medium'
                          ? '3px solid var(--accent)'
                          : '3px solid var(--border-divider)',
                        background: isSelected ? 'var(--surface-hover)' : 'var(--bg-app)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 140ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {task.wbs}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {renderPriorityBadge(task.priority)}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                              setIsDetailModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-divider)',
                              background: 'var(--surface-hover)',
                              color: 'var(--text-primary)',
                              fontSize: '10px',
                              fontWeight: 550,
                              cursor: 'pointer',
                            }}
                            title="Xem chi tiết công việc"
                          >
                            <Eye size={11} />
                            <span>Chi tiết</span>
                          </button>
                          {renderRemainingTimeBadge(task)}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Phụ trách: {task.assignee}</span>
                        <span>{task.checklist.length} mục việc</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 5. RIGHT TASK DRAWER (UXR-13 - Width: 380px, Transition: 160ms) */}
        {isDrawerOpen && selectedTask && (
          <div
            style={{
              width: '380px',
              flexShrink: 0,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    WBS {selectedTask.wbs}
                  </span>
                  {renderPriorityBadge(selectedTask.priority)}
                  {renderRemainingTimeBadge(selectedTask)}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedTask.title}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(true)}
                  style={{
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                  aria-label="Xem chi tiết toàn cảnh"
                  title="Mở hộp thoại xem chi tiết toàn màn hình"
                >
                  <Maximize2 size={12} />
                  <span>Toàn cảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                  aria-label="Đóng ngăn kéo chi tiết"
                  title="Đóng ngăn kéo chi tiết"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Trạng thái & Nút đổi hoàn thành (TASK-08, TASK-09) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleToggleTaskStatus(selectedTask.id)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: '1px solid var(--border-divider)',
                  background: selectedTask.status === 'done' ? 'var(--surface-hover)' : 'var(--text-primary)',
                  color: selectedTask.status === 'done' ? 'var(--text-primary)' : 'var(--bg-app)',
                  transition: 'all 140ms ease',
                }}
              >
                {selectedTask.status === 'done' ? (
                  <>
                    <RotateCcw size={14} />
                    <span>Mở lại công việc</span>
                  </>
                ) : (
                  <>
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    <span>Xác nhận hoàn thành việc</span>
                  </>
                )}
              </button>
            </div>

            {/* Hộp Cảnh báo Thời gian còn lại (TASK-06 Highlight) */}
            {(() => {
              const info = getTimeRemainingInfo(selectedTask);
              return (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: info.bgVar,
                    border: `1px solid ${info.borderVar}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Hourglass size={15} style={{ color: info.colorVar }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      Tình trạng thời hạn:
                    </span>
                  </div>
                  <strong style={{ fontSize: '12px', color: info.colorVar }}>
                    {info.label}
                  </strong>
                </div>
              );
            })()}

            {/* Mô tả chi tiết công việc */}
            {selectedTask.description && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-divider)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} />
                  <span>Mô tả công việc</span>
                </div>
                {selectedTask.description}
              </div>
            )}

            {/* Thuộc tính cơ bản: Người nhận & Thời hạn */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr',
                gap: '8px',
                fontSize: '12px',
                padding: '12px',
                background: 'var(--bg-app)',
                borderRadius: '6px',
                border: '1px solid var(--border-divider)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Người phụ trách:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedTask.assignee}</strong>

              <span style={{ color: 'var(--text-secondary)' }}>Thời hạn chót:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {selectedTask.dueDateStr ? selectedTask.dueDateStr : 'Chưa đặt hạn'}
              </strong>

              <span style={{ color: 'var(--text-secondary)' }}>Thời lượng:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {selectedTask.durationDays ? `${selectedTask.durationDays} ngày` : 'Chưa lên lịch'}
              </span>

              {selectedTask.milestoneTitle && (
                <>
                  <span style={{ color: 'var(--text-secondary)' }}>Mốc liên quan:</span>
                  <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Diamond size={11} />
                    {selectedTask.milestoneTitle}
                  </span>
                </>
              )}
            </div>

            {/* Checklist tương tác (TASK-08, TASK-15) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Checklist công việc
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {selectedTask.checklist.filter(c => c.done).length}/{selectedTask.checklist.length} hoàn thành
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {selectedTask.checklist.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-divider)',
                      fontSize: '12px',
                    }}
                  >
                    <label
                      onClick={() => handleToggleChecklist(selectedTask.id, item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        flex: 1,
                      }}
                    >
                      {item.done ? (
                        <CheckSquare size={14} style={{ color: 'var(--success)' }} />
                      ) : (
                        <Square size={14} />
                      )}
                      <span
                        style={{
                          textDecoration: item.done ? 'line-through' : 'none',
                          color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                        }}
                      >
                        {item.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(selectedTask.id, item.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '3px',
                      }}
                      title="Xóa mục checklist"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form thêm checklist item */}
              <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Thêm mục checklist..."
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Thêm
                </button>
              </form>
            </div>

            {/* Lịch làm việc riêng (TASK-07, Buổi làm riêng) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Lịch làm việc riêng của tôi
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent)' }}>Chỉ bạn nhìn thấy</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {selectedTask.workSessions && selectedTask.workSessions.length > 0 ? (
                  selectedTask.workSessions.map(ws => (
                    <div
                      key={ws.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-divider)',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} style={{ color: ws.isLate ? 'var(--danger)' : 'var(--accent)' }} />
                        <span>Ngày {ws.day}: {ws.label}</span>
                      </div>
                      {ws.isLate && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: 'var(--danger)',
                            fontWeight: 600,
                          }}
                        >
                          Làm muộn
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Chưa xếp buổi làm riêng cho công việc này.
                  </div>
                )}
              </div>

              {/* Form thêm buổi làm */}
              <form onSubmit={handleAddWorkSession} style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={newSessionDay}
                  onChange={e => setNewSessionDay(e.target.value)}
                  style={{
                    padding: '6px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {daysList.map(d => (
                    <option key={d} value={d}>Ngày {d}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ghi chú buổi làm..."
                  value={newSessionLabel}
                  onChange={e => setNewSessionLabel(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Gán
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 6. MODAL TẠO CÔNG VIỆC MỚI */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '440px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Tạo công việc mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Đóng modal"
                title="Đóng modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Tên công việc *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Triển khai kiểm thử tải k6"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Người phụ trách
                  </label>
                  <select
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-divider)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="Lê Hoàng Nam">Lê Hoàng Nam</option>
                    <option value="Trần Thị Mai">Trần Thị Mai</option>
                    <option value="Nguyễn Văn Minh">Nguyễn Văn Minh</option>
                    <option value="Phạm Quỳnh Anh">Phạm Quỳnh Anh</option>
                    <option value="Đỗ Quốc Bảo">Đỗ Quốc Bảo</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as PriorityLevel)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-divider)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="urgent">Khẩn cấp (Đỏ)</option>
                    <option value="high">Cao (Vàng)</option>
                    <option value="medium">Trung bình (Xanh)</option>
                    <option value="low">Thấp (Xám)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="chk-unscheduled"
                  checked={isUnscheduledChecked}
                  onChange={e => setIsUnscheduledChecked(e.target.checked)}
                />
                <label htmlFor="chk-unscheduled" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Chưa có mốc thời gian cụ thể (Đưa vào nhóm việc chờ lên lịch)
                </label>
              </div>

              {!isUnscheduledChecked && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Ngày bắt đầu (N1 - N28)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={newStartDay}
                      onChange={e => setNewStartDay(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-primary)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Số ngày thực hiện
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={newDuration}
                      onChange={e => setNewDuration(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-primary)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: '1px solid var(--border-divider)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    cursor: 'pointer',
                  }}
                >
                  Tạo công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL XEM CHI TIẾT CÔNG VIỆC TOÀN DIỆN (FULL TASK DETAIL MODAL) */}
      {isDetailModalOpen && selectedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-divider)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: 'var(--surface-hover)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'var(--bg-app)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-divider)' }}>
                    WBS {selectedTask.wbs}
                  </span>
                  {renderPriorityBadge(selectedTask.priority)}
                  {renderRemainingTimeBadge(selectedTask)}
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background: selectedTask.status === 'done' ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-app)',
                      border: '1px solid',
                      borderColor: selectedTask.status === 'done' ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-divider)',
                      color: selectedTask.status === 'done' ? 'var(--success)' : 'var(--text-secondary)',
                    }}
                  >
                    {selectedTask.status === 'done' ? 'Đã hoàn thành' : selectedTask.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ xử lý'}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 650, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Đóng chi tiết"
                title="Đóng chi tiết"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr',
                gap: '24px',
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {/* Left Column: Description, Checklist & History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Mô tả công việc */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span>Mô tả công việc & Yêu cầu kỹ thuật</span>
                  </h4>
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-divider)',
                      fontSize: '12.5px',
                      color: 'var(--text-primary)',
                      lineHeight: '1.6',
                    }}
                  >
                    {selectedTask.description || 'Chưa có mô tả kỹ thuật chi tiết cho công việc này.'}
                  </div>
                </div>

                {/* Checklist công việc */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckSquare size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span>Checklist công việc ({selectedTask.checklist.filter(c => c.done).length}/{selectedTask.checklist.length})</span>
                    </h4>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {selectedTask.checklist.length > 0 ? Math.round((selectedTask.checklist.filter(c => c.done).length / selectedTask.checklist.length) * 100) : 0}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-divider)', overflow: 'hidden', marginBottom: '12px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${selectedTask.checklist.length > 0 ? (selectedTask.checklist.filter(c => c.done).length / selectedTask.checklist.length) * 100 : 0}%`,
                        background: selectedTask.status === 'done' ? 'var(--success)' : 'var(--accent)',
                        transition: 'width 200ms ease',
                      }}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {selectedTask.checklist.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-divider)',
                          fontSize: '12.5px',
                        }}
                      >
                        <label
                          onClick={() => handleToggleChecklist(selectedTask.id, item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            flex: 1,
                            userSelect: 'none',
                          }}
                        >
                          {item.done ? (
                            <CheckSquare size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          ) : (
                            <Square size={15} style={{ flexShrink: 0 }} />
                          )}
                          <span
                            style={{
                              textDecoration: item.done ? 'line-through' : 'none',
                              color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                            }}
                          >
                            {item.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteChecklistItem(selectedTask.id, item.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '3px',
                          }}
                          title="Xóa mục checklist này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Form thêm checklist */}
                  <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Thêm mục checklist mới..."
                      value={newChecklistText}
                      onChange={e => setNewChecklistText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--surface-hover)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      Thêm mục
                    </button>
                  </form>
                </div>

                {/* Nhật ký & Lịch sử hoạt động (TASK-04, TASK-16) */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <History size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span>Lịch sử thao tác & Nhật ký kiểm toán</span>
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '6px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-divider)',
                      fontSize: '11.5px',
                    }}
                  >
                    {(selectedTask.history && selectedTask.history.length > 0) ? (
                      selectedTask.history.map(h => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span><strong>{h.actor}</strong>: {h.action}</span>
                          <span style={{ fontSize: '10.5px' }}>{h.timeStr}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span><strong>{selectedTask.assignee}</strong>: Cập nhật tiến độ checklist</span>
                          <span style={{ fontSize: '10.5px' }}>Hôm nay 08:30</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span><strong>Hệ thống</strong>: Khởi tạo công việc WBS {selectedTask.wbs}</span>
                          <span style={{ fontSize: '10.5px' }}>Giai đoạn 1</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Meta Attributes & Work Sessions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Trạng thái & Toggle Button */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-divider)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    HÀNH ĐỘNG TRẠNG THÁI
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(selectedTask.id)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      border: '1px solid var(--border-divider)',
                      background: selectedTask.status === 'done' ? 'var(--surface-hover)' : 'var(--text-primary)',
                      color: selectedTask.status === 'done' ? 'var(--text-primary)' : 'var(--bg-app)',
                      transition: 'all 140ms ease',
                    }}
                  >
                    {selectedTask.status === 'done' ? (
                      <>
                        <RotateCcw size={15} />
                        <span>Mở lại công việc</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} style={{ color: 'var(--success)' }} />
                        <span>Xác nhận hoàn thành việc</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Hộp Countdown Thời gian */}
                {(() => {
                  const info = getTimeRemainingInfo(selectedTask);
                  return (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: info.bgVar,
                        border: `1px solid ${info.borderVar}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Hourglass size={14} style={{ color: info.colorVar }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: info.colorVar, textTransform: 'uppercase' }}>
                          Thời hạn đếm ngược (TASK-06)
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: info.colorVar }}>
                        {info.label}
                      </div>
                    </div>
                  );
                })()}

                {/* Bảng Siêu dữ liệu */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-divider)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Người phụ trách:</span>
                    <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                        {selectedTask.assignee.split(' ').pop()?.[0]}
                      </span>
                      {selectedTask.assignee}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mức độ ưu tiên:</span>
                    {renderPriorityBadge(selectedTask.priority)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ngày bắt đầu:</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {selectedTask.startDay ? `Ngày ${selectedTask.startDay}` : 'Chưa xếp lịch'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Thời lượng:</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {selectedTask.durationDays ? `${selectedTask.durationDays} ngày` : 'Chưa xếp lịch'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hạn chót hoàn thành:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {selectedTask.dueDateStr ? selectedTask.dueDateStr : 'Chưa đặt hạn'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mốc Milestone:</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Diamond size={12} />
                      {selectedTask.milestoneTitle || 'Theo phân đoạn chung'}
                    </span>
                  </div>
                </div>

                {/* Lịch làm việc riêng của tôi (TASK-07) */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-divider)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Lịch làm việc riêng</strong>
                    <span style={{ fontSize: '10.5px', color: 'var(--accent)' }}>Chỉ bạn thấy</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {(selectedTask.workSessions && selectedTask.workSessions.length > 0) ? (
                      selectedTask.workSessions.map(ws => (
                        <div
                          key={ws.id}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-divider)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={11} style={{ color: ws.isLate ? 'var(--danger)' : 'var(--accent)' }} />
                            <span>Ngày {ws.day}: {ws.label}</span>
                          </div>
                          {ws.isLate && (
                            <span style={{ fontSize: '9.5px', padding: '1px 4px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', fontWeight: 600 }}>
                              Làm muộn
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '11px' }}>
                        Chưa xếp buổi làm việc riêng.
                      </div>
                    )}
                  </div>

                  {/* Form thêm buổi làm nhanh */}
                  <form onSubmit={handleAddWorkSession} style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={newSessionDay}
                      onChange={e => setNewSessionDay(e.target.value)}
                      style={{
                        padding: '6px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--surface-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {daysList.map(d => (
                        <option key={d} value={d}>N{d}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Ghi chú buổi làm..."
                      value={newSessionLabel}
                      onChange={e => setNewSessionLabel(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--surface-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid var(--border-divider)',
                        background: 'var(--surface-hover)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      Lưu
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border-divider)',
                background: 'var(--surface-hover)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Tất cả dữ liệu checklist và trạng thái được tự động đồng bộ thời gian thực sang biểu đồ Gantt.
              </span>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: '1px solid var(--border-divider)',
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
