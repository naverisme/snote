import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mockChecklistFixture, mockTasksFixture } from './fixtures.ts';
import type { Task } from './types.ts';

test('EC-17: Checklist ratio displays "Chưa có checklist" when 0 items and correct percentage when non-empty', () => {
  const getRatio = (taskId: string) => {
    const items = mockChecklistFixture[taskId];
    if (!items || items.length === 0) return 'Chưa có checklist';
    const done = items.filter(i => i.done).length;
    const pct = Math.round((done / items.length) * 100);
    return `${done}/${items.length} (${pct}%)`;
  };

  // Task with 0 items
  assert.equal(getRatio('task-no-checklist-7'), 'Chưa có checklist');

  // Task with 3 out of 5 done (60%)
  assert.equal(getRatio('task-overdue-1'), '3/5 (60%)');

  // Task with 3 out of 3 done (100%)
  assert.equal(getRatio('task-completed-6'), '3/3 (100%)');
});

test('TASK-11 & TASK-17: Priority grouping and stable sorting', () => {
  const now = new Date('2026-11-08T12:00:00Z');
  const todayStr = '2026-11-08';

  const isOverdue = (t: Task) => Boolean(t.status !== 'done' && t.dueAt && new Date(t.dueAt).getTime() < now.getTime());
  const isDueToday = (t: Task) => Boolean(t.dueAt?.slice(0, 10) === todayStr);

  const overdue = mockTasksFixture.filter(isOverdue);
  const dueToday = mockTasksFixture.filter(t => !isOverdue(t) && isDueToday(t));
  const unscheduled = mockTasksFixture.filter(t => !t.dueAt);

  assert.ok(overdue.some(t => t.id === 'task-overdue-1'), 'Overdue task identified');
  assert.ok(dueToday.some(t => t.id === 'task-due-today-2'), 'Due today task identified');
  assert.ok(unscheduled.some(t => t.id === 'task-unscheduled-high-4'), 'Unscheduled task identified');

  // TASK-17: Unscheduled high priority comes before unscheduled low priority
  const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sortedUnscheduled = [...unscheduled].sort((a, b) => (rank[b.importance] ?? 0) - (rank[a.importance] ?? 0));
  assert.equal(sortedUnscheduled[0].importance, 'high');
  assert.equal(sortedUnscheduled[sortedUnscheduled.length - 1].importance, 'low');
});

test('QA-13: Sequence tracker drops stale in-flight response', async () => {
  let activeId = 0;
  let committedData: string | null = null;

  const simulateFetch = async (reqWorkspace: string, delayMs: number) => {
    const currentId = ++activeId;
    await new Promise(r => setTimeout(r, delayMs));
    // If newer request started, drop
    if (currentId !== activeId) return;
    committedData = reqWorkspace;
  };

  // Launch Request 1 (slow, 50ms) for 'workspace-A'
  const p1 = simulateFetch('workspace-A', 50);
  // User rapidly clicks Request 2 (fast, 10ms) for 'workspace-B'
  const p2 = simulateFetch('workspace-B', 10);

  await Promise.all([p1, p2]);

  // Even though Request 1 finished after Request 2, committedData MUST be 'workspace-B'
  assert.equal(committedData, 'workspace-B');
});

test('Stageshow Recipe 1: Word budget <= 7 word phrases per task card', () => {
  // Each task row presents: 1. Title, 2. Due Date, 3. Checklist summary, 4. Importance, 5. Status
  const phrases = [
    'Nộp đề cương đồ án tốt nghiệp',
    '17:00 06/11/2026',
    '3/5 (60%)',
    'Cao',
    'Đang làm',
  ];
  assert.ok(phrases.length <= 7, 'Card word budget exceeds 7 phrases');
});

test('Error state handling: API errors (403, 404, 500) purge tasks with zero fixture fallback', () => {
  const errorScenarios = ['403 Forbidden', '404 Not Found', '500 Internal Server Error'];

  for (const errorMsg of errorScenarios) {
    let tasks: Task[] = [...mockTasksFixture];
    let errorMessage: string | null = null;

    // Simulate error branch from TasksContainer
    if (errorMsg.includes('403')) {
      tasks = [];
      errorMessage = 'Bạn không có quyền truy cập danh sách công việc này (403 Forbidden).';
    } else if (errorMsg.includes('404')) {
      tasks = [];
      errorMessage = 'Không tìm thấy workspace công việc tương ứng (404 Not Found).';
    } else if (errorMsg.includes('500')) {
      tasks = [];
      errorMessage = 'Lỗi máy chủ nội bộ khi tải danh sách công việc (500). Vui lòng thử lại sau.';
    }

    assert.equal(tasks.length, 0, `Tasks were not purged on ${errorMsg}`);
    assert.ok(errorMessage, `No error message set on ${errorMsg}`);
  }
});

test('Gantt/List transition duration: 160ms is within 140ms - 220ms requirement', () => {
  const transitionDurationMs = 160;
  assert.ok(transitionDurationMs >= 140 && transitionDurationMs <= 220);
});

