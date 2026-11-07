import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { OutboxService } from './outbox.service';
import { NotificationService } from './notification.service';

test('OutboxService writes event to outbox and returns formatted record', async () => {
  const events: any[] = [];
  const fakeDb: any = {
    outboxEvent: {
      create: async ({ data }: any) => {
        const record = {
          id: 'evt-1',
          topic: data.topic,
          payload: data.payload,
          deliveredAt: null,
          createdAt: new Date('2026-11-08T03:00:00Z'),
        };
        events.push(record);
        return record;
      },
    },
  };

  const outbox = new OutboxService();
  const notification = new NotificationService(outbox);

  await notification.notifyAssignmentCreated(fakeDb, {
    assignmentId: 'asg-1',
    classId: 'cls-1',
    title: 'Assignment 1',
    recipientWorkspaceIds: ['ws-1', 'ws-2'],
    createdAt: '2026-11-08T03:00:00Z',
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].topic, 'assignment.created');
  assert.equal(events[0].payload.assignmentId, 'asg-1');
  assert.deepEqual(events[0].payload.recipientWorkspaceIds, ['ws-1', 'ws-2']);

  await notification.notifySubmissionCreated(fakeDb, {
    submissionId: 'sub-1',
    recipientId: 'rec-1',
    assignmentId: 'asg-1',
    workspaceId: 'ws-1',
    version: 1,
    timeliness: 'on_time',
    actorId: 'student-1',
    acceptedAt: '2026-11-08T03:10:00Z',
  });

  assert.equal(events.length, 2);
  assert.equal(events[1].topic, 'submission.created');

  await notification.notifySubmissionCreated(fakeDb, {
    submissionId: 'sub-2',
    recipientId: 'rec-1',
    assignmentId: 'asg-1',
    workspaceId: 'ws-1',
    version: 2,
    timeliness: 'late',
    actorId: 'student-1',
    acceptedAt: '2026-11-08T03:20:00Z',
  });

  assert.equal(events.length, 3);
  assert.equal(events[2].topic, 'submission.revision');
});
