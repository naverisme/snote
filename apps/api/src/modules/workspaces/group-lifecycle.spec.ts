import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { requireRestorable } from './group-lifecycle';

test('restore checks all members; a single full quota blocks the entire group', () => {
  const members = [{ accountId: 'a', classMember: true, activeGroups: 0 }, { accountId: 'b', classMember: true, activeGroups: 1 }];
  assert.throws(() => requireRestorable(members, 1), { code: 'GROUP_LIMIT' });
  assert.doesNotThrow(() => requireRestorable(members, 2));
});
test('restore cannot revive group rights for someone who has left the class', () => {
  assert.throws(() => requireRestorable([{ accountId: 'a', classMember: false, activeGroups: 0 }], 1), { code: 'FORBIDDEN' });
});
