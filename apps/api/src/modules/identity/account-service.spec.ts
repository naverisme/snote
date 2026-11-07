import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateUsages } from './account-service';

test('self-selected usages require at least one known value and preserve combinations', () => {
  assert.deepEqual(validateUsages(['student', 'teacher', 'student']), ['student', 'teacher']);
  for (const input of [[], null, 'teacher', ['admin'], ['teacher', 42]]) assert.throws(() => validateUsages(input), { code: 'INVALID_INPUT' });
});
