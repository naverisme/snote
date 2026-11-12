import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { TestDb } from '../test-db';
import { ClassService } from './class-service';

test('join code read returns current state only to class owner', async () => {
  const db = new TestDb();
  db.classes.set('class-1', { id: 'class-1', ownerId: 'owner-1', version: 3 });
  const service = new ClassService(db.client);

  assert.deepEqual(await service.getJoinCode('owner-1', 'class-1'), {
    classId: 'class-1', enabled: false, version: 3,
  });
  db.classJoinCodes.set('code-1', { classId: 'class-1', enabled: true, codeHash: 'AB12CD34' });
  assert.deepEqual(await service.getJoinCode('owner-1', 'class-1'), {
    classId: 'class-1', enabled: true, code: 'AB12CD34', version: 3,
  });
  await assert.rejects(service.getJoinCode('other-1', 'class-1'), { code: 'NOT_FOUND' });
});
