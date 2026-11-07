import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DomainError, type AuthorizationPort, type Principal } from '../../core/authorization';
import { CalendarService } from './calendar.service';

test('QA-10 & EC-13: All-day event civil date remains stable across timezones without drift', async () => {
  const service = new CalendarService();
  const teacher: Principal = { accountId: 'teacher-1' };

  // Create an all-day event for 2026-11-10 (civil date) with source timezone Asia/Ho_Chi_Minh
  const { event } = await service.createEvent(teacher, {
    title: 'Hoi thao Khoa hoc',
    scope: { type: 'workspace', id: 'ws-class' },
    allDay: {
      startDate: '2026-11-10',
      endDateExclusive: '2026-11-11',
      timeZone: 'Asia/Ho_Chi_Minh',
    },
  });

  assert.ok(event.allDay);
  assert.equal(event.allDay.startDate, '2026-11-10');
  assert.equal(event.allDay.endDateExclusive, '2026-11-11');

  // Verify across viewers: Asia/Ho_Chi_Minh (UTC+7), America/New_York (UTC-5), and UTC
  // Civil dates must NOT drift to 2026-11-09 or 2026-11-11
  const timezones = ['Asia/Ho_Chi_Minh', 'America/New_York', 'UTC', 'Europe/London'];
  for (const tz of timezones) {
    const { events } = await service.listMyEvents(teacher, tz, ['ws-class']);
    const found = events.find(e => e.id === event.id);
    assert.ok(found);
    assert.equal(found.allDay?.startDate, '2026-11-10', `Failed civil date in ${tz}`);
    assert.equal(found.allDay?.endDateExclusive, '2026-11-11', `Failed civil end in ${tz}`);
  }
});

test('QA-10 & CAL-03: Class event with specific audience delivers only to targeted groups', async () => {
  const service = new CalendarService();
  const teacher: Principal = { accountId: 'teacher-1' };
  const studentGroup1: Principal = { accountId: 'student-g1' };
  const studentGroup2: Principal = { accountId: 'student-g2' };

  // Teacher creates event targeted ONLY to group 1 ('ws-group-1')
  const { event } = await service.createEvent(teacher, {
    title: 'Hop Huong dan Nhom 1',
    scope: { type: 'class', id: 'class-101' },
    timed: {
      startsAt: '2026-11-12T08:00:00Z',
      endsAt: '2026-11-12T09:30:00Z',
    },
    audience: ['ws-group-1'],
  });

  // Student in Group 1 sees the event
  const { events: eventsG1 } = await service.listMyEvents(studentGroup1, 'UTC', ['ws-group-1']);
  assert.equal(eventsG1.some(e => e.id === event.id), true);

  // Student in Group 2 does NOT see the event
  const { events: eventsG2 } = await service.listMyEvents(studentGroup2, 'UTC', ['ws-group-2']);
  assert.equal(eventsG2.some(e => e.id === event.id), false);
});

test('QA-10, CAL-08 & EC-24: Cancel event marks status as cancelled with audit trail and remains visible to audience', async () => {
  const service = new CalendarService();
  const teacher: Principal = { accountId: 'teacher-1' };
  const student: Principal = { accountId: 'student-1' };

  const { event, etag } = await service.createEvent(teacher, {
    title: 'Kiem tra 15 phut',
    scope: { type: 'workspace', id: 'ws-class' },
    timed: {
      startsAt: '2026-11-14T02:00:00Z',
      endsAt: '2026-11-14T02:15:00Z',
    },
  });
  assert.equal(event.status, 'active');

  // Teacher cancels event
  const { event: cancelledEvent } = await service.cancelEvent(teacher, event.id, etag);
  assert.equal(cancelledEvent.status, 'cancelled');
  assert.equal(cancelledEvent.version, 2);

  // Audience still sees the event with 'cancelled' status (Đã hủy)
  const { events } = await service.listMyEvents(student, 'UTC', ['ws-class']);
  const visibleCancelled = events.find(e => e.id === event.id);
  assert.ok(visibleCancelled);
  assert.equal(visibleCancelled.status, 'cancelled');

  // Audit trail contains cancellation
  const audit = service.getAuditTrail(event.id);
  assert.ok(audit.some(a => a.action === 'event.cancel' && a.actorId === teacher.accountId));
});

test('EC-14 & Validations: Timed events reject endsAt <= startsAt; All-day events reject invalid dates', async () => {
  const service = new CalendarService();
  const user: Principal = { accountId: 'user-val' };

  // Timed event where endsAt <= startsAt must throw 400
  await assert.rejects(
    service.createEvent(user, {
      title: 'Loi thoi gian',
      scope: { type: 'private' },
      timed: {
        startsAt: '2026-11-10T10:00:00Z',
        endsAt: '2026-11-10T09:00:00Z', // invalid!
      },
    }),
    (err: unknown) => err instanceof DomainError && err.status === 400,
  );

  // All-day event where startDate >= endDateExclusive must throw 400
  await assert.rejects(
    service.createEvent(user, {
      title: 'Loi ngay',
      scope: { type: 'private' },
      allDay: {
        startDate: '2026-11-10',
        endDateExclusive: '2026-11-10', // must be exclusive end date > startDate
        timeZone: 'UTC',
      },
    }),
    (err: unknown) => err instanceof DomainError && err.status === 400,
  );
});

test('CAL-06: Overlapping event returns conflictWarning = true without blocking save', async () => {
  const service = new CalendarService();
  const user: Principal = { accountId: 'user-overlap' };

  // First event: 09:00 - 11:00
  await service.createEvent(user, {
    title: 'Su kien 1',
    scope: { type: 'private' },
    timed: {
      startsAt: '2026-11-15T09:00:00Z',
      endsAt: '2026-11-15T11:00:00Z',
    },
  });

  // Second event: 10:00 - 12:00 (overlaps with first)
  const { event: ev2, conflictWarning } = await service.createEvent(user, {
    title: 'Su kien 2 (trung gio)',
    scope: { type: 'private' },
    timed: {
      startsAt: '2026-11-15T10:00:00Z',
      endsAt: '2026-11-15T12:00:00Z',
    },
  });

  assert.equal(conflictWarning, true);
  assert.equal(ev2.title, 'Su kien 2 (trung gio)');
  assert.equal(ev2.status, 'active'); // Saved successfully!
});
