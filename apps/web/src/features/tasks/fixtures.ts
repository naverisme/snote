import type { ChecklistItemViewModel, Task, WorkSessionViewModel } from './types';

export const mockTasksFixture: Task[] = [
  {
    id: 'task-overdue-1',
    workspaceId: 'ws-team-alpha',
    title: 'Nộp đề cương đồ án tốt nghiệp',
    importance: 'high',
    status: 'doing',
    dueAt: '2026-11-06T17:00:00Z',
    assigneeId: 'current-user-id',
    version: 3,
  },
  {
    id: 'task-due-today-2',
    workspaceId: 'ws-team-alpha',
    title: 'Chuẩn bị slide báo cáo giữa kỳ',
    importance: 'high',
    status: 'todo',
    dueAt: '2026-11-08T23:59:59Z',
    assigneeId: 'current-user-id',
    version: 1,
  },
  {
    id: 'task-session-today-3',
    workspaceId: 'ws-team-alpha',
    title: 'Nghiên cứu kiến trúc microservices và Kafka',
    importance: 'medium',
    status: 'todo',
    dueAt: '2026-11-20T17:00:00Z',
    assigneeId: 'current-user-id',
    version: 2,
  },
  {
    id: 'task-unscheduled-high-4',
    workspaceId: 'ws-team-alpha',
    title: 'Thiết kế cơ sở dữ liệu PostgreSQL cho module Lịch',
    importance: 'high',
    status: 'todo',
    assigneeId: 'current-user-id',
    version: 1,
  },
  {
    id: 'task-unscheduled-low-5',
    workspaceId: 'ws-team-alpha',
    title: 'Viết tài liệu hướng dẫn sử dụng API',
    importance: 'low',
    status: 'todo',
    assigneeId: 'current-user-id',
    version: 1,
  },
  {
    id: 'task-completed-6',
    workspaceId: 'ws-team-alpha',
    title: 'Khảo sát yêu cầu người dùng phiên bản 2.0',
    importance: 'medium',
    status: 'done',
    dueAt: '2026-11-05T12:00:00Z',
    assigneeId: 'current-user-id',
    version: 4,
  },
  {
    id: 'task-no-checklist-7',
    workspaceId: 'ws-team-alpha',
    title: 'Tạo tài khoản thử nghiệm trên staging',
    importance: 'low',
    status: 'todo',
    assigneeId: 'current-user-id',
    version: 1,
  },
];

export const mockChecklistFixture: Record<string, ChecklistItemViewModel[]> = {
  'task-overdue-1': [
    { id: 'chk-1', taskId: 'task-overdue-1', text: 'Viết phần mở đầu và tính cấp thiết', done: true, position: 0 },
    { id: 'chk-2', taskId: 'task-overdue-1', text: 'Tổng quan các nghiên cứu liên quan', done: true, position: 1 },
    { id: 'chk-3', taskId: 'task-overdue-1', text: 'Đặc tả phương pháp giải quyết', done: true, position: 2 },
    { id: 'chk-4', taskId: 'task-overdue-1', text: 'Dự kiến kế hoạch thực hiện', done: false, position: 3 },
    { id: 'chk-5', taskId: 'task-overdue-1', text: 'Xin chữ ký xác nhận của GVHD', done: false, position: 4 },
  ],
  'task-completed-6': [
    { id: 'chk-6', taskId: 'task-completed-6', text: 'Thiết kế bảng hỏi trực tuyến', done: true, position: 0 },
    { id: 'chk-7', taskId: 'task-completed-6', text: 'Gửi khảo sát tới 50 sinh viên', done: true, position: 1 },
    { id: 'chk-8', taskId: 'task-completed-6', text: 'Tổng hợp và phân tích biểu đồ kết quả', done: true, position: 2 },
  ],
  'task-no-checklist-7': [],
};

export const mockWorkSessionsFixture: WorkSessionViewModel[] = [
  {
    id: 'wsess-1',
    taskId: 'task-session-today-3',
    ownerId: 'current-user-id',
    startAt: '2026-11-08T14:00:00Z',
    endAt: '2026-11-08T16:00:00Z',
    isLate: false,
    version: 1,
  },
  {
    id: 'wsess-late-2',
    taskId: 'task-overdue-1',
    ownerId: 'current-user-id',
    startAt: '2026-11-07T09:00:00Z',
    endAt: '2026-11-07T11:00:00Z',
    isLate: true, // TASK-07: session after due date labeled "Làm muộn"
    version: 1,
  },
];
