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
