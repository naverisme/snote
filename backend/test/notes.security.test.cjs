const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/snote_test';
process.env.JWT_SECRET ||= 'test-access-secret-at-least-32-characters';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-at-least-32-characters';

const prismaModule = require('../dist/shared/db/prismaClient');
const { NotesRepository } = require('../dist/modules/notes/notes.repository');
const { NotesService } = require('../dist/modules/notes/notes.service');
const { SharesService } = require('../dist/modules/shares/shares.service');

const noteId = 'note-id';
const ownerId = 'owner-id';
const readerId = 'reader-id';

// Evaluate the scalar filters used by these queries without connecting to a database.
function matches(row, where) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR') return value.some((condition) => matches(row, condition));
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      assert.deepEqual(Object.keys(value), ['gt']);
      return row[key] !== null && row[key] > value.gt;
    }
    return row[key] === value;
  });
}

function fixture(shares = [], overrides = {}) {
  const note = {
    id: noteId, userId: ownerId, title: 'Private note', content: 'Private content',
    deletedAt: null, isPinned: false, isArchived: false, noteTags: [], ...overrides
  };
  const writes = [];
  const db = {
    resourceShare: {
      findFirst: async ({ where }) => shares.find((share) => matches(share, where)) || null
    },
    note: {
      findFirst: async ({ where }) => matches(note, where) ? { ...note } : null,
      update: async ({ where, data }) => {
        writes.push({ where, data });
        if (!matches(note, where)) throw Object.assign(new Error('No matching note'), { code: 'P2025' });
        Object.assign(note, Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)));
        return { ...note };
      },
      updateMany: async ({ where, data }) => {
        writes.push({ where, data });
        if (!matches(note, where)) return { count: 0 };
        Object.assign(note, data);
        return { count: 1 };
      }
    }
  };
  const repository = new NotesRepository(db);
  return { note, db, writes, repository, service: new NotesService(repository) };
}

function directShare(overrides = {}) {
  return {
    targetType: 'NOTE', targetId: noteId, sharedWithUserId: readerId,
    isPublic: false, expiresAt: null, accessLevel: 'VIEW', ...overrides
  };
}

function stubPrisma(t, db) {
  const original = prismaModule.prisma;
  prismaModule.prisma = db;
  t.after(() => { prismaModule.prisma = original; });
}

test('note ID access requires the owner or a live direct recipient share', async (t) => {
  const cases = [
    ['owner without a share', [], ownerId, {}, true],
    ['stranger without a share', [], readerId, {}, false],
    ['direct VIEW recipient', [directShare()], readerId, {}, true],
    ['direct EDIT recipient', [directShare({ accessLevel: 'EDIT' })], readerId, {}, true],
    ['future direct share', [directShare({ expiresAt: new Date('2999-01-01') })], readerId, {}, true],
    ['expired direct share', [directShare({ expiresAt: new Date('2000-01-01') })], readerId, {}, false],
    ['public link without recipient', [directShare({ isPublic: true, sharedWithUserId: null })], readerId, {}, false],
    ['expired public link', [directShare({ isPublic: true, sharedWithUserId: null, expiresAt: new Date('2000-01-01') })], readerId, {}, false],
    ['another recipient', [directShare({ sharedWithUserId: 'another-user' })], readerId, {}, false],
    ['another target', [directShare({ targetId: 'another-note' })], readerId, {}, false],
    ['another target type', [directShare({ targetType: 'TASK' })], readerId, {}, false],
    ['deleted owner note', [], ownerId, { deletedAt: new Date() }, false],
    ['deleted shared note', [directShare()], readerId, { deletedAt: new Date() }, false]
  ];

  for (const [name, shares, userId, overrides, allowed] of cases) {
    await t.test(name, async () => {
      const { service } = fixture(shares, overrides);
      if (allowed) {
        assert.equal((await service.getNoteById(noteId, userId)).content, 'Private content');
      } else {
        await assert.rejects(service.getNoteById(noteId, userId), { statusCode: 404 });
      }
    });
  }
});

test('share expiry uses a strict future boundary and an authenticated recipient', async () => {
  let shareWhere;
  const { db } = fixture();
  db.resourceShare.findFirst = async ({ where }) => { shareWhere = where; return null; };
  const before = Date.now();
  await new NotesRepository(db).findById(noteId, readerId);
  assert.equal(shareWhere.sharedWithUserId, readerId);
  assert.deepEqual(shareWhere.OR[0], { expiresAt: null });
  assert.deepEqual(Object.keys(shareWhere.OR[1].expiresAt), ['gt']);
  assert.ok(shareWhere.OR[1].expiresAt.gt.getTime() >= before);
  assert.ok(shareWhere.OR[1].expiresAt.gt.getTime() <= Date.now());
});

test('VIEW and EDIT recipients can read but cannot update, delete, pin or archive', async () => {
  for (const accessLevel of ['VIEW', 'EDIT']) {
    const { service, repository, writes } = fixture([directShare({ accessLevel })]);
    assert.equal((await service.getNoteById(noteId, readerId)).id, noteId);
    await assert.rejects(service.updateNote(noteId, readerId, { title: 'Changed' }), { statusCode: 404 });
    await assert.rejects(service.deleteNote(noteId, readerId), { statusCode: 404 });
    await assert.rejects(service.togglePin(noteId, readerId), { statusCode: 404 });
    await assert.rejects(service.toggleArchive(noteId, readerId), { statusCode: 404 });
    assert.equal(await repository.togglePin(noteId, readerId), null);
    assert.equal(await repository.toggleArchive(noteId, readerId), null);
    assert.equal(writes.length, 0);
  }
});

test('owner note mutations succeed and every write includes owner and active state', async () => {
  const { service, repository, writes, note } = fixture();
  assert.equal((await service.updateNote(noteId, ownerId, { title: 'Changed' })).title, 'Changed');
  assert.equal((await service.togglePin(noteId, ownerId)).isPinned, true);
  assert.equal((await service.toggleArchive(noteId, ownerId)).isArchived, true);
  assert.equal((await repository.togglePin(noteId, ownerId)).isPinned, false);
  assert.equal((await repository.toggleArchive(noteId, ownerId)).isArchived, false);
  await service.deleteNote(noteId, ownerId);
  assert.ok(note.deletedAt instanceof Date);
  assert.equal(writes.length, 6);
  for (const write of writes) {
    assert.deepEqual(write.where, { id: noteId, userId: ownerId, deletedAt: null });
  }
});

test('repository write predicates reject another owner and already deleted notes', async () => {
  for (const [userId, overrides] of [[readerId, {}], [ownerId, { deletedAt: new Date() }]]) {
    const { repository, note } = fixture([], overrides);
    const originalDeletedAt = note.deletedAt;
    await assert.rejects(repository.update(noteId, userId, { title: 'Changed' }), { code: 'P2025' });
    await repository.softDelete(noteId, userId);
    assert.equal(note.title, 'Private note');
    assert.equal(note.deletedAt, originalDeletedAt);
  }
});

test('public notes remain available through their live public token', async (t) => {
  const { note } = fixture();
  const share = {
    ...directShare({ sharedWithUserId: null, isPublic: true }),
    id: 'share-id', shareToken: 'public-token', owner: { id: ownerId }
  };
  stubPrisma(t, {
    resourceShare: { findUnique: async ({ where }) => where.shareToken === share.shareToken ? share : null },
    note: { findFirst: async ({ where }) => matches(note, where) ? note : null }
  });
  const service = new SharesService();
  assert.equal((await service.getPublicShare('public-token')).targetItem.content, 'Private content');
  await assert.rejects(service.getPublicShare('wrong-token'), { statusCode: 404 });
  share.expiresAt = new Date('2000-01-01');
  await assert.rejects(service.getPublicShare('public-token'), { statusCode: 403 });
  share.expiresAt = null;
  share.isPublic = false;
  await assert.rejects(service.getPublicShare('public-token'), { statusCode: 404 });
  share.isPublic = true;
  note.deletedAt = new Date();
  await assert.rejects(service.getPublicShare('public-token'), { statusCode: 404 });
});

test('note create/update preserve v3 classroom project and subject authorization', async (t) => {
  const { note } = fixture([], { projectId: 'class-project', subjectId: 'class-subject' });
  let writable = true;
  let writes = 0;
  const projectQueries = [];
  stubPrisma(t, {
    project: { findFirst: async ({ where }) => {
      projectQueries.push(where);
      return writable ? { id: 'class-project', subjectId: 'class-subject', members: [] } : null;
    } },
    subject: { findFirst: async () => null }
  });
  const service = new NotesService({
    findOwnedById: async () => note,
    create: async (_, dto) => { writes += 1; return { ...note, ...dto }; },
    update: async (_, userId, dto) => { assert.equal(userId, ownerId); writes += 1; return { ...note, ...dto }; }
  });

  const dto = { projectId: 'class-project', subjectId: 'class-subject', title: 'Class note', content: 'Text' };
  assert.equal((await service.createNote(ownerId, dto)).subjectId, 'class-subject');
  // Omitting projectId on update must still authorize the note's existing project.
  assert.equal((await service.updateNote(noteId, ownerId, { subjectId: 'class-subject' })).subjectId, 'class-subject');
  assert.equal(projectQueries.length, 2);
  for (const where of projectQueries) {
    assert.equal(where.id, 'class-project');
    assert.ok(where.OR.some((condition) => condition.courseClass?.teacherId === ownerId));
    assert.ok(where.OR.some((condition) => condition.courseClass?.members?.some?.role === 'CLASS_ADMIN'));
  }

  await assert.rejects(service.createNote(ownerId, { ...dto, subjectId: 'foreign-subject' }), { statusCode: 403 });
  await assert.rejects(service.updateNote(noteId, ownerId, { subjectId: 'foreign-subject' }), { statusCode: 403 });
  writable = false;
  await assert.rejects(service.createNote(ownerId, dto), { statusCode: 403 });
  await assert.rejects(service.updateNote(noteId, ownerId, { title: 'Changed' }), { statusCode: 403 });
  assert.equal(writes, 2);
});
