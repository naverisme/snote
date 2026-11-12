import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Check,
  Clock,
  AlertTriangle,
  RotateCcw,
  Calendar,
  User,
  X,
  ChevronDown,
  ChevronRight,
  ListTodo,
  CheckCircle2,
  Trash2,
  AlertCircle,
  TrendingUp,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  Hourglass,
  Layers,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  FileText,
  CalendarCheck,
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

export interface TaskItem {
  id: string;
  wbs: string;
  title: string;
  description?: string;
  startDay?: number;
  durationDays?: number;
  status: TaskStatus;
  priority: PriorityLevel;
  assignee: string;
  dueDateStr?: string;
  checklist: ChecklistItem[];
  workSessions?: WorkSession[];
}

// Mốc thời gian tham chiếu: Ngày 10 là "Hôm nay" (đồng bộ tuyệt đối với Tab 08 Gantt)
const CURRENT_DAY = 10;

// Tập dữ liệu đồng bộ 100% với sơ đồ Gantt (Tab 08)
const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    wbs: '1.1',
    title: 'Thu thập yêu cầu & Thiết kế Kiến trúc SNOTE v2',
    description: 'Xác lập tài liệu đặc tả 8 trụ cột kỹ thuật, kiến trúc module phân tán và mô hình dữ liệu quan hệ cho nền tảng.',
    startDay: 1,
    durationDays: 5,
    status: 'done',
    priority: 'urgent',
    assignee: 'Lê Hoàng Nam',
    dueDateStr: 'Ngày 05',
    checklist: [
      { id: 'c-1', text: 'Khảo sát đặc tả 8 trụ cột kỹ thuật', done: true },
      { id: 'c-2', text: 'Xác lập sơ đồ phân rã module', done: true },
      { id: 'c-3', text: 'Thiết kế ranh giới bảo mật & Auth gate', done: true },
    ],
    workSessions: [
      { id: 'ws-1', day: 3, label: 'Phiên thiết kế kiến trúc' },
    ],
  },
  {
    id: 't-2',
    wbs: '1.2',
    title: 'Đặc tả OpenAPI Contracts & DTOs',
    description: 'Thiết kế chuẩn hóa hợp đồng dữ liệu RESTful, schemas kiểm soát request/response và code generation cho client.',
    startDay: 4,
    durationDays: 5,
    status: 'done',
    priority: 'high',
    assignee: 'Trần Thị Mai',
    dueDateStr: 'Ngày 09',
    checklist: [
      { id: 'c-4', text: 'Đặc tả 42 API endpoints trong openapi.yaml', done: true },
      { id: 'c-5', text: 'Generate TypeScript DTO types', done: true },
    ],
  },
  {
    id: 't-3',
    wbs: '2.1',
    title: 'Triển khai Core Engine & Auth Gatekeeper',
    description: 'Xây dựng module xác thực phân quyền đa tầng: JWT tokens, Session cookie HttpOnly, CSRF tokens và middleware bảo vệ.',
    startDay: 7,
    durationDays: 4, // Kết thúc N10 (Hôm nay!)
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Nguyễn Văn Minh',
    dueDateStr: 'Hôm nay (Ngày 10)',
    checklist: [
      { id: 'c-6', text: 'Cài đặt JWT & Session Cookie HttpOnly', done: true },
      { id: 'c-7', text: 'Xử lý CSRF protection middleware', done: true },
      { id: 'c-8', text: 'Unit test 12 ca kiểm thử bảo mật', done: false },
    ],
    workSessions: [
      { id: 'ws-2', day: 10, label: 'Code Auth middleware' },
    ],
  },
  {
    id: 't-4',
    wbs: '2.2',
    title: 'Xây dựng UI Web Shell & 14 Viewports',
    description: 'Triển khai khung giao diện đơn sắc Monochrome theo chuẩn B&W, tối ưu hóa 14 viewports kiểm duyệt tương tác tức thời.',
    startDay: 9,
    durationDays: 8, // Kết thúc N16 (Còn 6 ngày)
    status: 'in_progress',
    priority: 'high',
    assignee: 'Phạm Quỳnh Anh',
    dueDateStr: 'Ngày 16 (Còn 6 ngày)',
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
  },
  {
    id: 't-5',
    wbs: '2.3',
    title: 'Kiểm định bảo mật phụ thuộc & Quét mã tĩnh SAST',
    description: 'Chạy kiểm thử lỗ hổng bảo mật thư viện bên thứ ba và quét phân tích mã nguồn tĩnh trước khi tích hợp sâu.',
    startDay: 6,
    durationDays: 3, // Kết thúc N8 (Quá hạn 2 ngày!)
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Đỗ Quốc Bảo',
    dueDateStr: 'Quá hạn 2 ngày (Ngày 08)',
    checklist: [
      { id: 'c-12a', text: 'Chạy npm audit & Snyk scan', done: true },
      { id: 'c-12b', text: 'Vá lỗ hổng phụ thuộc cấp cao', done: false },
    ],
  },
  {
    id: 't-6',
    wbs: '3.1',
    title: 'Kiểm thử E2E & Tối ưu WCAG AA Contrast',
    description: 'Xây dựng bộ kịch bản kiểm thử tích hợp đầu cuối tự động, xác minh độ tương phản màu sắc đạt chuẩn tiếp cận quốc tế.',
    startDay: 14,
    durationDays: 5,
    status: 'pending',
    priority: 'medium',
    assignee: 'Đỗ Quốc Bảo',
    dueDateStr: 'Ngày 18',
    checklist: [
      { id: 'c-13', text: 'Chạy automated test suite Playwright', done: false },
      { id: 'c-14', text: 'Xóa bỏ toàn bộ mã nội bộ thừa khỏi UI', done: false },
    ],
  },
  {
    id: 't-7',
    wbs: '3.2',
    title: 'Đóng gói Docker & Cấu hình CI/CD Pipeline',
    description: 'Thiết lập Dockerfile đa giai đoạn tối ưu dung lượng và kịch bản GitHub Actions tự động kiểm thử mỗi khi tạo PR.',
    startDay: 17,
    durationDays: 5,
    status: 'pending',
    priority: 'low',
    assignee: 'Lê Hoàng Nam',
    dueDateStr: 'Ngày 21',
    checklist: [
      { id: 'c-15', text: 'Build production image multi-stage', done: false },
      { id: 'c-16', text: 'Kiểm thử docker compose up pilot', done: false },
    ],
  },
  {
    id: 't-8',
    wbs: '4.1',
    title: 'Thử nghiệm Pilot diện hẹp & Thu thập phản hồi',
    description: 'Triển khai bản thử nghiệm cho nhóm người dùng thử nghiệm nội bộ, theo dõi chỉ số hiệu năng và lỗi giao diện phát sinh.',
    startDay: 22,
    durationDays: 4,
    status: 'pending',
    priority: 'medium',
    assignee: 'Trần Thị Mai',
    dueDateStr: 'Ngày 25',
    checklist: [
      { id: 'c-17a', text: 'Tạo tài khoản thử nghiệm cho giáo viên', done: false },
      { id: 'c-17b', text: 'Thu thập bảng đánh giá độ trễ và UX', done: false },
    ],
  },
  {
    id: 't-9',
    wbs: '4.2',
    title: 'Nghiệm thu tổng thể & Bàn giao đồ án SNOTE v2',
    description: 'Tổng kết đánh giá đối chiếu với đặc tả 8 trụ cột kỹ thuật và hoàn tất hồ sơ bàn giao mã nguồn dự án.',
    startDay: 25,
    durationDays: 4,
    status: 'pending',
    priority: 'high',
    assignee: 'Phạm Quỳnh Anh',
    dueDateStr: 'Ngày 28',
    checklist: [
      { id: 'c-18a', text: 'Kiểm tra checklist 8 trụ cột kỹ thuật', done: false },
      { id: 'c-18b', text: 'Đóng gói mã nguồn và báo cáo nghiệm thu', done: false },
    ],
  },
  // Nhóm việc chưa có mốc thời gian
  {
    id: 't-10',
    wbs: '5.1',
    title: 'Soạn thảo tài liệu bàn giao Pilot & Hướng dẫn sử dụng',
    description: 'Tài liệu hướng dẫn thao tác chi tiết cho Giáo viên chủ nhiệm, Lớp trưởng và Học sinh trong lớp học.',
    status: 'pending',
    priority: 'high',
    assignee: 'Trần Thị Mai',
    checklist: [
      { id: 'c-19', text: 'Biên soạn hướng dẫn cho Giáo viên', done: false },
      { id: 'c-20', text: 'Biên soạn hướng dẫn cho Học sinh', done: false },
    ],
  },
  {
    id: 't-11',
    wbs: '5.2',
    title: 'Tối ưu hóa hiệu năng nén tài nguyên thư viện tĩnh',
    description: 'Cấu hình nén gzip và brotli trên tầng reverse proxy web server nhằm tăng tốc độ tải trang trên mạng di động.',
    status: 'pending',
    priority: 'low',
    assignee: 'Đỗ Quốc Bảo',
    checklist: [
      { id: 'c-21', text: 'Bật nén gzip/brotli trên Nginx server', done: false },
    ],
  },
];

const TEAM_MEMBERS = [
  'Lê Hoàng Nam',
  'Trần Thị Mai',
  'Nguyễn Văn Minh',
  'Phạm Quỳnh Anh',
  'Đỗ Quốc Bảo',
  'Vũ Đức Thịnh',
];

export const Tab09TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'overdue' | 'urgent' | 'done' | 'unscheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'wbs' | 'priority' | 'due' | 'progress'>('wbs');
  const [feedback, setFeedback] = useState<string | null>(null);

  // State Ngăn kéo Chi tiết công việc (Task Details Drawer - UXR-13)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('t-3');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // State Modal Xác nhận hoàn tất công việc (VT-07 / TASK-08)
  const [confirmTask, setConfirmTask] = useState<TaskItem | null>(null);

  // State Modal Thêm công việc mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newWbs, setNewWbs] = useState('2.4');
  const [newAssignee, setNewAssignee] = useState(TEAM_MEMBERS[0]);
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newDueDay, setNewDueDay] = useState<string>('12');
  const [isUndatedChecked, setIsUndatedChecked] = useState(false);
  const [newChecklistRaw, setNewChecklistRaw] = useState('');

  // State nhập nhanh checklist theo từng task card
  const [inlineChecklistText, setInlineChecklistText] = useState<{ [taskId: string]: string }>({});

  // State thêm buổi làm việc trong Drawer
  const [newSessionDay, setNewSessionDay] = useState<string>('11');
  const [newSessionLabel, setNewSessionLabel] = useState<string>('');

  // Collapsible cho nhóm chưa có mốc thời gian
  const [isUndatedCollapsed, setIsUndatedCollapsed] = useState(false);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3200);
  };

  // Helper tính toán hạn chót & quá hạn
  const isTaskOverdue = (task: TaskItem) => {
    if (task.status === 'done' || !task.startDay || !task.durationDays) return false;
    const endDay = task.startDay + task.durationDays - 1;
    return endDay < CURRENT_DAY;
  };

  const isTaskToday = (task: TaskItem) => {
    if (task.status === 'done') return false;
    const endDay = task.startDay && task.durationDays ? task.startDay + task.durationDays - 1 : null;
    const hasTodaySession = task.workSessions?.some(ws => ws.day === CURRENT_DAY);
    return endDay === CURRENT_DAY || hasTodaySession;
  };

  // Helper thông tin thời lượng còn lại (đồng bộ với Tab 08)
  const getTimeRemainingInfo = (task: TaskItem) => {
    if (task.status === 'done') {
      return {
        label: 'Đã hoàn tất',
        colorVar: 'var(--text-muted)',
        bgVar: 'var(--surface-hover)',
        borderVar: 'var(--border-divider)',
      };
    }
    if (!task.startDay || !task.durationDays) {
      return {
        label: 'Chưa lên lịch',
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
        colorVar: 'var(--danger)',
        bgVar: 'rgba(239, 68, 68, 0.08)',
        borderVar: 'rgba(239, 68, 68, 0.35)',
      };
    }
    if (diff === 0) {
      return {
        label: 'Đến hạn Hôm nay',
        colorVar: 'var(--warning)',
        bgVar: 'rgba(245, 158, 11, 0.08)',
        borderVar: 'rgba(245, 158, 11, 0.35)',
      };
    }
    return {
      label: `Còn ${diff} ngày`,
      colorVar: 'var(--text-primary)',
      bgVar: 'var(--surface-hover)',
      borderVar: 'var(--border-divider)',
    };
  };

  // 1. Thao tác Checklist: Thay đổi trạng thái item
  const handleToggleChecklist = (taskId: string, checkId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedChecklist = targetTask.checklist.map(item =>
      item.id === checkId ? { ...item, done: !item.done } : item
    );

    const willAllBeDone = updatedChecklist.length > 0 && updatedChecklist.every(item => item.done);
    const wasAlreadyDone = targetTask.checklist.every(item => item.done);

    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? { ...t, checklist: updatedChecklist } : t))
    );

    // QUY TẮC VT-07: Nếu đánh dấu xong hết mà task chưa được chốt hoàn thành -> mở Modal xác nhận
    if (willAllBeDone && !wasAlreadyDone && targetTask.status !== 'done') {
      setConfirmTask({ ...targetTask, checklist: updatedChecklist });
    } else {
      showNotice('Đã cập nhật tiêu chí kiểm tra');
    }
  };

  // 2. Chốt hoàn thành công việc sau khi xác nhận trên Modal
  const handleConfirmTaskCompletion = () => {
    if (!confirmTask) return;
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === confirmTask.id ? { ...t, status: 'done', checklist: confirmTask.checklist } : t
      )
    );
    showNotice(`Đã chốt hoàn thành công việc: ${confirmTask.title}`);
    setConfirmTask(null);
  };

  // 3. Mở lại công việc (TASK-09)
  const handleReopenTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? { ...t, status: 'in_progress' } : t))
    );
    showNotice('Đã mở lại công việc sang trạng thái Đang thực hiện');
  };

  // 4. Thay đổi mức độ ưu tiên trực tiếp (TASK-04 / TASK-12)
  const handleChangePriority = (taskId: string, priority: PriorityLevel) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? { ...t, priority } : t))
    );
    showNotice('Đã cập nhật mức độ ưu tiên công việc');
  };

  // 5. Thêm buổi làm việc riêng (TASK-07)
  const handleAddWorkSession = (taskId: string) => {
    if (!newSessionLabel.trim()) return;
    const day = parseInt(newSessionDay, 10);
    const session: WorkSession = {
      id: `ws-${Date.now()}`,
      day,
      label: newSessionLabel.trim(),
    };

    setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          workSessions: [...(t.workSessions || []), session],
        };
      })
    );
    setNewSessionLabel('');
    showNotice(`Đã thêm buổi làm việc riêng (Ngày ${day})`);
  };

  // 6. Xóa công việc
  const handleDeleteTask = (taskId: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa công việc "${title}" khỏi Workspace?`)) {
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      showNotice('Đã xóa công việc khỏi danh sách');
    }
  };

  // 7. Thêm nhanh checklist item trực tiếp
  const handleAddInlineChecklist = (taskId: string, customText?: string) => {
    const text = customText || inlineChecklistText[taskId]?.trim();
    if (!text) return;

    setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.id !== taskId) return t;
        const newItem: ChecklistItem = {
          id: `c-inline-${Date.now()}`,
          text,
          done: false,
        };
        return {
          ...t,
          checklist: [...t.checklist, newItem],
        };
      })
    );

    if (!customText) {
      setInlineChecklistText(prev => ({ ...prev, [taskId]: '' }));
    }
    showNotice('Đã thêm tiêu chí kiểm tra mới');
  };

  // 8. Xóa checklist item
  const handleDeleteChecklistItem = (taskId: string, checkId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checklist: t.checklist.filter(c => c.id !== checkId),
        };
      })
    );
    showNotice('Đã xóa tiêu chí kiểm tra');
  };

  // 9. Tạo công việc mới (Quick Add Modal)
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedDue = isUndatedChecked ? undefined : parseInt(newDueDay, 10);
    const initialChecklist: ChecklistItem[] = newChecklistRaw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `c-new-${Date.now()}-${idx}`,
        text,
        done: false,
      }));

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      wbs: newWbs.trim() || '2.4',
      title: newTitle.trim(),
      description: newDesc.trim() || 'Công việc mới được thêm vào workspace.',
      priority: newPriority,
      assignee: newAssignee,
      status: 'pending',
      startDay: isUndatedChecked ? undefined : CURRENT_DAY,
      durationDays: parsedDue ? Math.max(1, parsedDue - CURRENT_DAY + 1) : undefined,
      dueDateStr: isUndatedChecked ? undefined : `Ngày ${newDueDay}`,
      checklist: initialChecklist.length > 0 ? initialChecklist : [
        { id: `c-def-${Date.now()}`, text: 'Nghiệm thu tiêu chí ban đầu', done: false }
      ],
    };

    setTasks(prev => [newTask, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewChecklistRaw('');
    setSelectedTaskId(newTask.id);
    setIsDrawerOpen(true);
    showNotice(`Đã tạo công việc mới: ${newTask.title}`);
  };

  // Task đang được chọn xem chi tiết
  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Thống kê tổng hợp Bento
  const metrics = useMemo(() => {
    const total = tasks.length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const overdueCount = tasks.filter(isTaskOverdue).length;
    const todayCount = tasks.filter(isTaskToday).length;
    const urgentCount = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

    const totalChecklist = tasks.reduce((acc, t) => acc + t.checklist.length, 0);
    const doneChecklist = tasks.reduce((acc, t) => acc + t.checklist.filter(c => c.done).length, 0);
    const checklistPercent = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;
    const overallTaskPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    return {
      total,
      doneCount,
      inProgressCount,
      pendingCount,
      overdueCount,
      todayCount,
      urgentCount,
      totalChecklist,
      doneChecklist,
      checklistPercent,
      overallTaskPercent,
    };
  }, [tasks]);

  // Bộ lọc & Tìm kiếm & Sắp xếp
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchAssignee = t.assignee.toLowerCase().includes(q);
          const matchWbs = t.wbs.toLowerCase().includes(q);
          if (!matchTitle && !matchAssignee && !matchWbs) return false;
        }

        if (activeFilter === 'today') return isTaskToday(t);
        if (activeFilter === 'overdue') return isTaskOverdue(t);
        if (activeFilter === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
        if (activeFilter === 'done') return t.status === 'done';
        if (activeFilter === 'unscheduled') return !t.startDay;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weight: Record<PriorityLevel, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'progress') {
          const ratioA = a.checklist.length > 0 ? a.checklist.filter(c => c.done).length / a.checklist.length : 0;
          const ratioB = b.checklist.length > 0 ? b.checklist.filter(c => c.done).length / b.checklist.length : 0;
          return ratioB - ratioA;
        }
        if (sortBy === 'due') {
          const dayA = a.startDay && a.durationDays ? a.startDay + a.durationDays : 999;
          const dayB = b.startDay && b.durationDays ? b.startDay + b.durationDays : 999;
          return dayA - dayB;
        }
        return a.wbs.localeCompare(b.wbs, undefined, { numeric: true });
      });
  }, [tasks, activeFilter, searchQuery, sortBy]);

  const scheduledTasks = filteredAndSortedTasks.filter(t => !!t.startDay);
  const undatedTasks = filteredAndSortedTasks.filter(t => !t.startDay);

  // Render nhãn priority ĐỒNG BỘ 100% VỚI TAB 08 GANTT
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

  // Helper tính border-left màu sắc đồng bộ với Gantt
  const getTaskCardLeftBorder = (task: TaskItem) => {
    if (isTaskOverdue(task)) return '3px solid var(--danger)';
    if (task.priority === 'urgent') return '3px solid var(--danger)';
    if (task.priority === 'high') return '3px solid var(--warning)';
    if (task.priority === 'medium') return '3px solid var(--accent)';
    return '3px solid var(--border-divider)';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '8px 0 40px 0',
      }}
    >
      {/* 1. Phản hồi thông báo Toast */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-strong)',
            padding: '12px 18px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            animation: 'fadeIn 160ms ease',
          }}
        >
          <Check size={16} style={{ color: 'var(--text-primary)' }} />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Tiêu đề Trang & Đồng bộ Workspace */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '10px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <ListTodo size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Công việc & Tiêu chí kiểm tra
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                Đồng bộ Gantt • Hôm nay: N{CURRENT_DAY}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Theo dõi danh sách công việc, quản lý checklist từng phần và xem chi tiết ngăn kéo bên phải theo UXR-13.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Thêm công việc mới vào workspace"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-app)',
              border: '1px solid var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'opacity 160ms ease',
            }}
          >
            <Plus size={16} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* 3. Bento Task Metrics Strip (4 Thẻ thống kê tổng quan) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Metric 1: Tổng công việc */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Tổng công việc
            </span>
            <Layers size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {metrics.total} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>đầu việc</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {metrics.doneCount} đã xong • {metrics.inProgressCount} đang làm • {metrics.pendingCount} chờ làm
          </div>
        </div>

        {/* Metric 2: Hôm nay & Quá hạn */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: metrics.overdueCount > 0 ? '1px solid var(--border-strong)' : '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Hôm nay & Quá hạn
            </span>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span>{metrics.todayCount} đến hạn</span>
            {metrics.overdueCount > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.14)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.40)' }}>
                {metrics.overdueCount} trễ hạn
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tiến độ chuẩn tại mốc Ngày {CURRENT_DAY}
          </div>
        </div>

        {/* Metric 3: Ưu tiên cao */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Trọng tâm khẩn cấp
            </span>
            <Flame size={16} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {metrics.urgentCount} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>việc cần ưu tiên</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Chiếm {metrics.total > 0 ? Math.round((metrics.urgentCount / metrics.total) * 100) : 0}% khối lượng toàn đồ án
          </div>
        </div>

        {/* Metric 4: Tỷ lệ hoàn thành */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Tiến độ kiểm tra
            </span>
            <TrendingUp size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {metrics.checklistPercent}% <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>({metrics.doneChecklist}/{metrics.totalChecklist} mục)</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--border-divider)',
              overflow: 'hidden',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                width: `${metrics.checklistPercent}%`,
                height: '100%',
                background: 'var(--text-primary)',
                transition: 'width 240ms ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Controls Toolbar */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Tất cả việc', count: metrics.total },
              { id: 'today', label: 'Hôm nay', count: metrics.todayCount },
              { id: 'overdue', label: 'Quá hạn', count: metrics.overdueCount },
              { id: 'urgent', label: 'Quan trọng', count: metrics.urgentCount },
              { id: 'done', label: 'Đã hoàn thành', count: metrics.doneCount },
              { id: 'unscheduled', label: 'Chưa có mốc', count: tasks.filter(t => !t.startDay).length },
            ].map(tab => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  aria-pressed={isActive}
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isActive ? 'var(--text-primary)' : 'transparent',
                    color: isActive ? 'var(--bg-app)' : 'var(--text-primary)',
                    border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-divider)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: isActive ? 'var(--bg-app)' : 'var(--surface-hover)',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="Sắp xếp danh sách công việc"
              style={{
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-divider)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="wbs">Thứ tự WBS dự án</option>
              <option value="priority">Mức ưu tiên (Cao → Thấp)</option>
              <option value="due">Hạn chót gần nhất</option>
              <option value="progress">Tiến độ Checklist (%)</option>
            </select>
          </div>
        </div>

        {/* Tìm kiếm */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên công việc, WBS (1.1, 2.1) hoặc người phụ trách..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '6px',
              background: 'var(--surface-input)',
              border: '1px solid var(--border-divider)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa tìm kiếm"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 5. KHUNG BỐ CỤC CHÍNH: DANH SÁCH BÊN TRÁI & NGĂN KÉO CHI TIẾT BÊN PHẢI (UXR-13) */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
        {/* Cột chính: Danh sách công việc */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {scheduledTasks.length === 0 && undatedTasks.length === 0 ? (
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px dashed var(--border-strong)',
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <ListTodo size={36} style={{ margin: '0 auto 12px auto', color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Không tìm thấy công việc nào phù hợp
              </div>
              <p style={{ fontSize: '13px', margin: '6px 0 0 0' }}>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem các nhiệm vụ khác trong workspace.
              </p>
            </div>
          ) : (
            scheduledTasks.map(task => {
              const isSelected = selectedTaskId === task.id;
              const isDone = task.status === 'done';
              const isOverdue = isTaskOverdue(task);
              const isToday = isTaskToday(task);
              const doneChecklistCount = task.checklist.filter(c => c.done).length;
              const totalChecklistCount = task.checklist.length;
              const checklistPercentage = totalChecklistCount > 0 ? Math.round((doneChecklistCount / totalChecklistCount) * 100) : 0;

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsDrawerOpen(true);
                  }}
                  style={{
                    background: 'var(--surface-card)',
                    border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-divider)',
                    borderLeft: getTaskCardLeftBorder(task),
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 1px var(--text-primary)' : 'none',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Header Card */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDone) {
                            handleReopenTask(task.id);
                          } else {
                            setConfirmTask(task);
                          }
                        }}
                        title={isDone ? 'Bấm để mở lại công việc' : 'Bấm để chốt hoàn tất công việc'}
                        aria-label={isDone ? 'Mở lại công việc' : 'Hoàn tất công việc'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={19} style={{ color: 'var(--text-primary)' }} />
                        ) : (
                          <Square size={19} />
                        )}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'var(--surface-hover)',
                              border: '1px solid var(--border-divider)',
                              color: 'var(--text-primary)',
                              fontFamily: 'monospace',
                            }}
                          >
                            WBS {task.wbs}
                          </span>

                          {/* Render đồng bộ màu Priority */}
                          {renderPriorityBadge(task.priority)}

                          {isOverdue && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: 'rgba(239, 68, 68, 0.14)',
                                border: '1px solid rgba(239, 68, 68, 0.40)',
                                color: 'var(--danger)',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <AlertTriangle size={12} />
                              Trễ hạn
                            </span>
                          )}

                          {isToday && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: 'rgba(245, 158, 11, 0.14)',
                                border: '1px solid rgba(245, 158, 11, 0.40)',
                                color: 'var(--warning)',
                                fontWeight: 600,
                              }}
                            >
                              Hôm nay
                            </span>
                          )}

                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Hạn: <strong style={{ color: 'var(--text-primary)' }}>{task.dueDateStr}</strong>
                          </span>
                        </div>

                        <h2
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                            margin: 0,
                            textDecoration: isDone ? 'line-through' : 'none',
                            lineHeight: '1.4',
                          }}
                        >
                          {task.title}
                        </h2>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--surface-hover)',
                          padding: '3px 8px',
                          borderRadius: '16px',
                          border: '1px solid var(--border-divider)',
                        }}
                      >
                        <User size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {task.assignee}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskId(task.id);
                          setIsDrawerOpen(true);
                        }}
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          background: isSelected ? 'var(--text-primary)' : 'transparent',
                          color: isSelected ? 'var(--bg-app)' : 'var(--text-secondary)',
                          border: '1px solid var(--border-divider)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>Chi tiết</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Tiến độ checklist card */}
                  <div
                    style={{
                      background: 'var(--surface-hover)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Checklist ({doneChecklistCount}/{totalChecklistCount})
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {checklistPercentage}% hoàn thành
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        background: 'var(--border-divider)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${checklistPercentage}%`,
                          height: '100%',
                          background: 'var(--text-primary)',
                          transition: 'width 200ms ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* 6. Nhóm công việc chưa có mốc thời gian */}
          {undatedTasks.length > 0 && (
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => setIsUndatedCollapsed(!isUndatedCollapsed)}
                style={{
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: 'var(--surface-hover)',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUndatedCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Công việc chưa có mốc thời gian ({undatedTasks.length})
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: 'var(--surface-card)',
                      border: '1px solid var(--border-divider)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Chuẩn bị & Backlog
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {isUndatedCollapsed ? 'Mở rộng' : 'Thu gọn'}
                </span>
              </div>

              {!isUndatedCollapsed && (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {undatedTasks.map(task => {
                    const isSelected = selectedTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setIsDrawerOpen(true);
                        }}
                        style={{
                          background: 'var(--surface-card)',
                          border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-divider)',
                          borderLeft: getTaskCardLeftBorder(task),
                          borderRadius: '6px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              WBS {task.wbs}
                            </span>
                            {renderPriorityBadge(task.priority)}
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              • {task.assignee}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {task.title}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {task.checklist.filter(c => c.done).length}/{task.checklist.length} mục
                          </span>
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7. NGĂN KÉO XEM CHI TIẾT CÔNG VIỆC (UXR-13 - Width: 420px) */}
        {isDrawerOpen && selectedTask && (
          <div
            style={{
              width: '420px',
              flexShrink: 0,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              position: 'sticky',
              top: '20px',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header Drawer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    WBS {selectedTask.wbs}
                  </span>
                  {renderPriorityBadge(selectedTask.priority)}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>
                  {selectedTask.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Đóng ngăn kéo chi tiết"
                title="Đóng ngăn kéo chi tiết"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Trạng thái & Nút đổi hoàn thành (TASK-08, TASK-09) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  if (selectedTask.status === 'done') {
                    handleReopenTask(selectedTask.id);
                  } else {
                    setConfirmTask(selectedTask);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
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

              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id, selectedTask.title)}
                title="Xóa công việc"
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Tình trạng thời hạn (Countdown / Overdue) */}
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

            {/* Bảng thuộc tính chi tiết (Grid Attributes) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '10px',
                fontSize: '12px',
                padding: '12px',
                background: 'var(--surface-hover)',
                borderRadius: '6px',
                border: '1px solid var(--border-divider)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Người phụ trách:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedTask.assignee}</strong>

              <span style={{ color: 'var(--text-secondary)' }}>Hạn chót:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {selectedTask.dueDateStr || 'Chưa lên lịch'}
              </strong>

              <span style={{ color: 'var(--text-secondary)' }}>Thời lượng:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {selectedTask.durationDays ? `${selectedTask.durationDays} ngày` : 'Chưa xác định'}
              </span>

              <span style={{ color: 'var(--text-secondary)' }}>Mức độ ưu tiên:</span>
              <div>
                <select
                  value={selectedTask.priority}
                  onChange={e => handleChangePriority(selectedTask.id, e.target.value as PriorityLevel)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="medium">Vừa</option>
                  <option value="low">Thấp</option>
                </select>
              </div>
            </div>

            {/* Mô tả công việc */}
            {selectedTask.description && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Mô tả chi tiết:
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* Checklist tương tác chi tiết */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Tiêu chí kiểm tra ({selectedTask.checklist.filter(c => c.done).length}/{selectedTask.checklist.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {selectedTask.checklist.length > 0
                    ? Math.round((selectedTask.checklist.filter(c => c.done).length / selectedTask.checklist.length) * 100)
                    : 0}% hoàn tất
                </span>
              </div>

              {/* Danh sách items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedTask.checklist.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      background: 'var(--surface-hover)',
                      fontSize: '12px',
                    }}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.done}
                      onClick={() => handleToggleChecklist(selectedTask.id, item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: item.done ? 'line-through' : 'none',
                        padding: 0,
                        flex: 1,
                      }}
                    >
                      {item.done ? (
                        <CheckSquare size={15} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
                      ) : (
                        <Square size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      )}
                      <span>{item.text}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(selectedTask.id, item.id)}
                      aria-label="Xóa mục checklist"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form thêm nhanh checklist item */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="+ Thêm tiêu chí kiểm tra..."
                  value={inlineChecklistText[selectedTask.id] || ''}
                  onChange={e =>
                    setInlineChecklistText({
                      ...inlineChecklistText,
                      [selectedTask.id]: e.target.value,
                    })
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddInlineChecklist(selectedTask.id);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddInlineChecklist(selectedTask.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    border: '1px solid var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Lịch làm việc riêng (TASK-07 Work Sessions) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Buổi làm việc riêng của bạn
              </span>
              {selectedTask.workSessions && selectedTask.workSessions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedTask.workSessions.map(ws => (
                    <div
                      key={ws.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'var(--surface-hover)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontWeight: 600 }}>Ngày {ws.day}:</span>
                        <span>{ws.label}</span>
                      </div>
                      {ws.day < CURRENT_DAY && (
                        <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                          Làm muộn
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Chưa có lịch làm việc riêng cho nhiệm vụ này.
                </div>
              )}

              {/* Form thêm buổi làm */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={newSessionDay}
                  onChange={e => setNewSessionDay(e.target.value)}
                  placeholder="Ngày"
                  style={{
                    width: '60px',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Nội dung buổi làm..."
                  value={newSessionLabel}
                  onChange={e => setNewSessionLabel(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddWorkSession(selectedTask.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-divider)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Modal Xác nhận Hoàn tất Công việc (Theo quy chuẩn VT-07 / TASK-08) */}
      {confirmTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 id="confirm-modal-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Xác nhận hoàn tất công việc
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Xác nhận kiểm toán và cập nhật tiến độ Workspace
                </span>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              Bạn vừa đánh dấu hoàn thành toàn bộ các tiêu chí kiểm tra cho công việc:{' '}
              <strong style={{ textDecoration: 'underline' }}>{confirmTask.title}</strong> (WBS {confirmTask.wbs}).
            </div>

            <div
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '140px',
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Danh sách tiêu chí đã nghiệm thu ({confirmTask.checklist.length}/{confirmTask.checklist.length}):
              </div>
              {confirmTask.checklist.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <Check size={13} style={{ color: 'var(--text-primary)' }} />
                  <span>{c.text}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Bạn có chắc chắn muốn chốt hoàn tất công việc này không? Trạng thái sẽ được lưu vào lịch sử tiến độ dự án.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setConfirmTask(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Giữ trạng thái Đang làm
              </button>
              <button
                type="button"
                onClick={handleConfirmTaskCompletion}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: '1px solid var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Xác nhận Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal Thêm Công việc Mới */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <form
            onSubmit={handleCreateTask}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '24px',
              maxWidth: '540px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 id="create-modal-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Thêm công việc mới vào Workspace
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Đóng cửa sổ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tên công việc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Tên công việc <span style={{ color: 'var(--text-muted)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Triển khai WebSocket Gateway cho Canvas..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Mô tả tóm tắt */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Mô tả chi tiết công việc
              </label>
              <textarea
                rows={2}
                placeholder="Nêu rõ phạm vi, mục tiêu và yêu cầu kỹ thuật..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Mã WBS & Người phụ trách */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Mã WBS
                </label>
                <input
                  type="text"
                  value={newWbs}
                  onChange={e => setNewWbs(e.target.value)}
                  placeholder="2.4"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Người phụ trách chính
                </label>
                <select
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mức độ ưu tiên & Hạn chót */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Mức độ ưu tiên
                </label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Ưu tiên cao</option>
                  <option value="medium">Bình thường</option>
                  <option value="low">Thấp</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Hạn chót (Theo ngày dự án)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  disabled={isUndatedChecked}
                  value={newDueDay}
                  onChange={e => setNewDueDay(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: isUndatedChecked ? 'var(--surface-hover)' : 'var(--surface-input)',
                    border: '1px solid var(--border-divider)',
                    color: isUndatedChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Checkbox chưa có mốc */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isUndatedChecked}
                onChange={e => setIsUndatedChecked(e.target.checked)}
              />
              <span>Đánh dấu là công việc chưa có mốc thời gian (Chuẩn bị / Backlog)</span>
            </label>

            {/* Tiêu chí nghiệm thu ban đầu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Tiêu chí kiểm tra ban đầu (Checklist - mỗi dòng 1 mục)
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ:&#10;Đặc tả schema DTO&#10;Viết test case kiểm thử&#10;Review code cùng nhóm"
                value={newChecklistRaw}
                onChange={e => setNewChecklistRaw(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: '1px solid var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Lưu công việc
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
