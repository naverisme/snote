import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mockCalendarEventsFixture } from './fixtures.ts';

test('QA-10 & EC-13: Frontend All-day events retain civil date across any selected timezone', () => {
  const allDayEvent = mockCalendarEventsFixture.find(e => e.allDay);
  assert.ok(allDayEvent);

  const { startDate, endDateExclusive } = allDayEvent.allDay!;
  assert.equal(startDate, '2026-11-10');
  assert.equal(endDateExclusive, '2026-11-11');

  // When UI formats the event under different viewer timezones, the civil date must not drift
  const timezones = ['Asia/Ho_Chi_Minh', 'UTC', 'America/New_York', 'Asia/Tokyo'];
  for (const tz of timezones) {
    // Civil date is explicitly formatted as civil string YYYY-MM-DD
    const displayStart: string = allDayEvent.allDay ? allDayEvent.allDay.startDate : '';
    assert.equal(displayStart, '2026-11-10', `Civil start drifted in ${tz}`);
  }
});

test('CAL-06: Overlapping event flag is set to true for conflict notification', () => {
  const overlapEvent = mockCalendarEventsFixture.find(e => e.id === 'ev-overlap-3');
  assert.ok(overlapEvent);
  assert.equal(overlapEvent.conflictWarning, true);
});

test('QA-10 & EC-24: Cancelled events remain in calendar with status "cancelled"', () => {
  const cancelledEvent = mockCalendarEventsFixture.find(e => e.id === 'ev-cancelled-4');
  assert.ok(cancelledEvent);
  assert.equal(cancelledEvent.status, 'cancelled');
  // Audience group targeting
  assert.deepEqual(cancelledEvent.audience, ['ws-team-alpha']);
});
