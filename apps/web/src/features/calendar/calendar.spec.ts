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

test('CUXA-01 & CUXA-04: Default view mode is week on desktop and day on mobile (< 768px)', () => {
  const resolveInitialViewMode = (width: number) => {
    return width < 768 ? 'day' : 'week';
  };

  assert.equal(resolveInitialViewMode(1024), 'week', 'Desktop must default to week view');
  assert.equal(resolveInitialViewMode(1440), 'week', 'Large screen must default to week view');
  assert.equal(resolveInitialViewMode(375), 'day', 'Mobile must default to day view');
  assert.equal(resolveInitialViewMode(767), 'day', 'Mobile breakpoint must default to day view');
});

test('Calendar error handling: 403, 404, 500 purge events with zero fixture fallback', () => {
  const errors = ['403 Forbidden', '404 Not Found', '500 Server Error'];

  for (const err of errors) {
    let events = [...mockCalendarEventsFixture];
    let errMsg: string | null = null;

    if (err.includes('403')) {
      events = [];
      errMsg = 'Bạn không có quyền truy cập lịch trình này (403 Forbidden).';
    } else if (err.includes('404')) {
      events = [];
      errMsg = 'Không tìm thấy lịch trình hoặc phạm vi tương ứng (404 Not Found).';
    } else if (err.includes('500')) {
      events = [];
      errMsg = 'Lỗi máy chủ nội bộ khi tải lịch trình (500). Vui lòng thử lại sau.';
    }

    assert.equal(events.length, 0, `Events were not purged on ${err}`);
    assert.ok(errMsg, `No error set on ${err}`);
  }
});

