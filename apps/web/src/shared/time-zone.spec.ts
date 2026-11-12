import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { VIETNAM_TIME_ZONE, vietnamDateTimeParts, vietnamLocalToIso } from './time-zone.ts';

test('Vietnam date and time remain fixed across a UTC day boundary', () => {
  assert.equal(VIETNAM_TIME_ZONE, 'Asia/Ho_Chi_Minh');
  assert.deepEqual(vietnamDateTimeParts('2026-11-12T20:30:00Z'), {
    date: '2026-11-13', time: '03:30',
  });
});

test('Vietnam wall-clock deadline becomes the correct UTC instant', () => {
  assert.equal(vietnamLocalToIso('2026-11-13T03:30'), '2026-11-12T20:30:00.000Z');
});
