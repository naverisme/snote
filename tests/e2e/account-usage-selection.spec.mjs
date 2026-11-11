import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toAccountUsages, toggleClassroomUsage } from '../../apps/web/src/features/identity/usage-selection.ts';

test('account usage selection preserves personal-only, student, teacher and combined registration', () => {
  assert.deepEqual(toAccountUsages([]), ['personal']);
  assert.deepEqual(toAccountUsages(['student']), ['student']);
  assert.deepEqual(toAccountUsages(['teacher']), ['teacher']);
  assert.deepEqual(toAccountUsages(['teacher', 'student']), ['student', 'teacher']);
});

test('settings toggle falls back to personal and normalizes older mixed usages', () => {
  assert.deepEqual(toggleClassroomUsage(['student'], 'student'), ['personal']);
  assert.deepEqual(toggleClassroomUsage(['personal'], 'teacher'), ['teacher']);
  assert.deepEqual(toggleClassroomUsage(['personal', 'teacher'], 'student'), ['student', 'teacher']);
  assert.deepEqual(toggleClassroomUsage(['student', 'teacher'], 'teacher'), ['student']);
});
