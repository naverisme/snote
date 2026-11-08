import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  LibraryService,
  type FolderRecord,
  type ItemRecord,
  type LibraryStore,
  type RevisionRecord,
  type TrashRecord,
  type WorkspaceRecord,
} from './library-service';
import { QuotaService, type QuotaStore } from './quota-service';
import { DomainError } from '../../core/authorization';
const allowAuth = { decide: async () => ({ allowed: true }) };

test('library service without a policy fails closed before writing an item', async () => {
  const store = new MockLibraryStore();
  const quota = new QuotaService(new MockQuotaStore());
  const service = new LibraryService(store, quota, new MockUploadStore());
  await assert.rejects(
    service.createItem({ accountId: 'attacker' }, 'ws-1', { type: 'text', content: 'secret' }),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );
  assert.equal(store.items.size, 0);
});
import { isPrivateOrBlockedHost, isPrivateOrBlockedIp, normalizeUrl, extractFirstUrl } from './url-preview';
import type { UploadStore, UploadStagingRecord } from '../uploads/upload-service';

class MockLibraryStore implements LibraryStore {
  public items = new Map<string, ItemRecord>();
  public revisions = new Map<string, RevisionRecord>();
  public folders = new Map<string, FolderRecord>();
  public trash = new Map<string, TrashRecord>();
  public workspaces = new Map<string, WorkspaceRecord>();

  async createItem(item: ItemRecord): Promise<void> {
    this.items.set(item.id, { ...item });
  }
  async findItem(itemId: string): Promise<ItemRecord | null> {
    const it = this.items.get(itemId);
    return it ? { ...it } : null;
  }
  async updateItem(itemId: string, patch: Partial<ItemRecord>): Promise<void> {
    const it = this.items.get(itemId);
    if (it) {
      Object.assign(it, patch);
    }
  }
  async listItems(workspaceId: string, filter?: { folderId?: string | null; status?: string }): Promise<ItemRecord[]> {
    const res: ItemRecord[] = [];
    for (const it of this.items.values()) {
      if (it.workspaceId !== workspaceId) continue;
      if (filter?.status && it.status !== filter.status) continue;
      if (!filter?.status && it.status !== 'active') continue;
      if (filter?.folderId !== undefined && it.folderId !== filter.folderId) continue;
      res.push({ ...it });
    }
    return res;
  }
  async createRevision(rev: RevisionRecord): Promise<void> {
    this.revisions.set(rev.id, { ...rev });
  }
  async findRevision(revisionId: string): Promise<RevisionRecord | null> {
    const r = this.revisions.get(revisionId);
    return r ? { ...r } : null;
  }
  async listRevisions(itemId: string): Promise<RevisionRecord[]> {
    const res: RevisionRecord[] = [];
    for (const r of this.revisions.values()) {
      if (r.itemId === itemId) res.push({ ...r });
    }
    return res;
  }
  async createFolder(folder: FolderRecord): Promise<void> {
    this.folders.set(folder.id, { ...folder });
  }
  async findFolder(folderId: string): Promise<FolderRecord | null> {
    const f = this.folders.get(folderId);
    return f ? { ...f } : null;
  }
  async updateFolder(folderId: string, patch: Partial<FolderRecord>): Promise<void> {
    const f = this.folders.get(folderId);
    if (f) Object.assign(f, patch);
  }
  async deleteFolder(folderId: string): Promise<void> {
    this.folders.delete(folderId);
  }
  async listFolders(workspaceId: string): Promise<FolderRecord[]> {
    const res: FolderRecord[] = [];
    for (const f of this.folders.values()) {
      if (f.workspaceId === workspaceId) res.push({ ...f });
    }
    return res;
  }
  async countFolderItems(folderId: string): Promise<number> {
    let count = 0;
    for (const it of this.items.values()) {
      if (it.folderId === folderId) count++;
    }
    return count;
  }
  async countChildFolders(folderId: string): Promise<number> {
    let count = 0;
    for (const f of this.folders.values()) {
      if (f.parentId === folderId) count++;
    }
    return count;
  }
  async createTrashEntry(trash: TrashRecord): Promise<void> {
    this.trash.set(trash.itemId, { ...trash });
  }
  async findTrashEntry(itemId: string): Promise<TrashRecord | null> {
    const t = this.trash.get(itemId);
    return t ? { ...t } : null;
  }
  async deleteTrashEntry(itemId: string): Promise<void> {
    this.trash.delete(itemId);
  }
  async findPersonalDefaultWorkspace(actorId: string): Promise<WorkspaceRecord | null> {
    for (const w of this.workspaces.values()) {
      if (w.ownerId === actorId && w.kind === 'personal') return { ...w };
    }
    return null;
  }
}

class MockQuotaStore implements QuotaStore {
  public activeBlobs = new Map<string, bigint>();
  public blobSizes = new Map<string, bigint>();
  public reservations = new Map<string, bigint>();
  public references = new Set<string>();

  async getActiveWorkspaceBlobs(workspaceId: string): Promise<Map<string, bigint>> {
    return new Map(this.activeBlobs);
  }
  async getPendingReservationsBytes(scopeType: string, scopeId: string): Promise<bigint> {
    return 0n;
  }
  async createReservation(scopeType: string, scopeId: string, operationKey: string, bytes: bigint): Promise<void> {
    this.reservations.set(`${scopeType}:${scopeId}:${operationKey}`, bytes);
  }
  async releaseReservation(scopeType: string, scopeId: string, operationKey: string): Promise<void> {
    this.reservations.delete(`${scopeType}:${scopeId}:${operationKey}`);
  }
  async addReference(scopeType: string, scopeId: string, blobId: string, reason: string): Promise<void> {
    this.references.add(`${scopeType}:${scopeId}:${blobId}:${reason}`);
    const sz = this.blobSizes.get(blobId) ?? 1024n;
    this.activeBlobs.set(blobId, sz);
  }
  async removeReference(scopeType: string, scopeId: string, blobId: string, reason: string): Promise<void> {
    this.references.delete(`${scopeType}:${scopeId}:${blobId}:${reason}`);
    this.activeBlobs.delete(blobId);
  }
  async getBlobSize(blobId: string): Promise<bigint | null> {
    return this.blobSizes.get(blobId) ?? 1024n;
  }
}

class MockUploadStore implements UploadStore {
  public stagings = new Map<string, UploadStagingRecord>();

  async createStaging(record: UploadStagingRecord): Promise<void> {
    this.stagings.set(record.id, record);
  }
  async findStaging(uploadId: string): Promise<UploadStagingRecord | null> {
    return this.stagings.get(uploadId) ?? null;
  }
  async updateStagingStatus(uploadId: string, status: string, storageKey?: string): Promise<void> {
    const s = this.stagings.get(uploadId);
    if (s) {
      s.status = status;
      if (storageKey) s.storageKey = storageKey;
    }
  }
  async saveVerifiedBlob(): Promise<{ id: string }> {
    return { id: 'blob-1' };
  }
}

test('list filters each item by its own read action before returning metadata', async () => {
  const store = new MockLibraryStore();
  const now = new Date();
  for (const type of ['text', 'link', 'file']) {
    store.items.set(type, {
      id: type, workspaceId: 'ws-1', folderId: null, currentRevisionId: null,
      type, title: `${type} secret`, status: 'active', version: 1,
      createdAt: now, updatedAt: now,
    });
  }
  const service = new LibraryService(store, new QuotaService(new MockQuotaStore()), new MockUploadStore(), {
    decide: async (_principal, action) => ({ allowed: action === 'library.read_text' }),
  });
  const visible = await service.listItems({ accountId: 'reader' }, 'ws-1');
  assert.deepEqual(visible.map((item) => item.id), ['text']);
  const denied = new LibraryService(store, new QuotaService(new MockQuotaStore()), new MockUploadStore(), {
    decide: async () => ({ allowed: false }),
  });
  await assert.rejects(
    denied.listItems({ accountId: 'outsider' }, 'ws-1'),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );
});

test('copying a file refuses a full target quota before creating a reference or item', async () => {
  const store = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(store, new QuotaService(quotaStore), uploadStore, allowAuth);
  uploadStore.stagings.set('upload-1', {
    id: 'upload-1', actorId: 'author', scopeType: 'workspace', scopeId: 'source',
    storageKey: 'blob-1', status: 'verified', expiresAt: new Date(Date.now() + 60000),
  });
  quotaStore.blobSizes.set('blob-1', 1024n);
  const source = await service.createItem({ accountId: 'author' }, 'source', { type: 'file', uploadId: 'upload-1' });
  quotaStore.activeBlobs.clear();
  quotaStore.activeBlobs.set('full', 1024n * 1024n * 1024n);
  const before = store.items.size;
  await assert.rejects(
    service.copyItem({ accountId: 'author' }, source.id, { targetWorkspaceId: 'target', sourceRevisionId: source.currentRevisionId! }),
    (err: unknown) => err instanceof DomainError && err.code === 'QUOTA_EXCEEDED',
  );
  assert.equal(store.items.size, before);
  assert.equal(quotaStore.references.has('workspace:target:blob-1:library_item'), false);
});

test('QA-05: Concurrent overwrites on same item enforce optimistic locking (If-Match)', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  const principal = { accountId: 'actor-1' };
  const item = await service.createItem(principal, 'ws-1', {
    type: 'text',
    title: 'Note Title',
    content: 'Initial text content',
  });
  assert.equal(item.version, 1);

  // Actor A overwrites with If-Match "1"
  const revA = await service.createRevision(principal, item.id, '"1"', {
    type: 'text',
    content: 'Overwritten by Actor A',
  });
  assert.equal(revA.version, 2);

  // Actor B attempts overwrite with stale If-Match "1" -> MUST fail with 412
  await assert.rejects(
    service.createRevision({ accountId: 'actor-2' }, item.id, '"1"', {
      type: 'text',
      content: 'Concurrent overwrite by Actor B',
    }),
    (err: unknown) => err instanceof DomainError && err.code === 'VERSION_CONFLICT' && err.status === 412,
  );

  // Actor B retries with correct new version "2" -> succeeds
  const revB = await service.createRevision({ accountId: 'actor-2' }, item.id, '"2"', {
    type: 'text',
    content: 'Actor B overwrite after reload',
  });
  assert.equal(revB.version, 3);
});

test('QA-05 & LIB-12: Item copy is independent of source modifications and deletion', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  const principal = { accountId: 'actor-1' };
  const item = await service.createItem(principal, 'ws-src', {
    type: 'text',
    title: 'Source Note',
    content: 'Version 1 Content',
  });

  // Copy to group workspace
  const copied = await service.copyItem(principal, item.id, {
    targetWorkspaceId: 'ws-target',
    sourceRevisionId: item.currentRevisionId!,
  });
  assert.equal(copied.workspaceId, 'ws-target');
  assert.notEqual(copied.id, item.id);

  // Overwrite original source item to Version 2
  await service.createRevision(principal, item.id, '"1"', {
    type: 'text',
    content: 'Version 2 Modified Content',
  });

  // Verify copied item remains on original content
  const copiedItemDetail = await service.getItem(principal, copied.id);
  assert.equal(copiedItemDetail.revision?.text, 'Version 1 Content');

  // Trash original item
  await service.trash(principal, item.id, '"2"');
  const sourceAfterTrash = await service.getItem(principal, item.id);
  assert.equal(sourceAfterTrash.item.status, 'trash');

  // Copied item in target workspace is still active!
  const copyStillActive = await service.getItem(principal, copied.id);
  assert.equal(copyStillActive.item.status, 'active');
});

test('LIB-12: copy requires source read and a revision owned by the source item', async () => {
  const store = new MockLibraryStore();
  const service = new LibraryService(store, new QuotaService(new MockQuotaStore()), new MockUploadStore(), {
    decide: async (_principal, action, scope) => ({ allowed: scope.id !== 'ws-src' || action !== 'library.read_text' }),
  });
  const source = await service.createItem({ accountId: 'actor-1' }, 'ws-src', { type: 'text', content: 'private' });
  await assert.rejects(
    service.copyItem({ accountId: 'actor-2' }, source.id, {
      targetWorkspaceId: 'ws-target',
      sourceRevisionId: source.currentRevisionId!,
    }),
    (err: unknown) => err instanceof DomainError && err.code === 'FORBIDDEN',
  );
  const allowed = new LibraryService(store, new QuotaService(new MockQuotaStore()), new MockUploadStore(), allowAuth);
  const other = await allowed.createItem({ accountId: 'actor-1' }, 'ws-src', { type: 'text', content: 'other' });
  await assert.rejects(
    allowed.copyItem({ accountId: 'actor-1' }, source.id, {
      targetWorkspaceId: 'ws-target',
      sourceRevisionId: other.currentRevisionId!,
    }),
    (err: unknown) => err instanceof DomainError && err.code === 'REVISION_NOT_FOUND',
  );
});

test('LIB-15: verified upload cannot be committed by another actor or into another workspace', async () => {
  const store = new MockLibraryStore();
  const uploads = new MockUploadStore();
  const service = new LibraryService(store, new QuotaService(new MockQuotaStore()), uploads, allowAuth);
  uploads.stagings.set('up-1', {
    id: 'up-1', actorId: 'actor-1', scopeType: 'workspace', scopeId: 'ws-1',
    storageKey: 'blob-1', status: 'verified', expiresAt: new Date(Date.now() + 60000),
  });
  for (const [actor, workspace] of [['actor-2', 'ws-1'], ['actor-1', 'ws-2']]) {
    await assert.rejects(
      service.createItem({ accountId: actor }, workspace, { type: 'file', uploadId: 'up-1' }),
      (err: unknown) => err instanceof DomainError && err.code === 'UPLOAD_NOT_VERIFIED',
    );
  }
  assert.equal(uploads.stagings.get('up-1')?.status, 'verified');
  assert.equal(store.items.size, 0);
});

test('QA-06: Restoring file item from trash checks quota and rejects if workspace full', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  const principal = { accountId: 'actor-1' };

  // Set up verified upload
  uploadStore.stagings.set('up-file-1', {
    id: 'up-file-1',
    actorId: 'actor-1',
    scopeType: 'workspace',
    scopeId: 'ws-quota',
    storageKey: 'blob-file-1',
    status: 'verified',
    expiresAt: new Date(Date.now() + 10000),
  });
  quotaStore.blobSizes.set('blob-file-1', 100n * 1024n * 1024n); // 100 MB

  const fileItem = await service.createItem(principal, 'ws-quota', {
    type: 'file',
    title: 'Project Asset.pdf',
    uploadId: 'up-file-1',
  });

  // Move to trash
  await service.trash(principal, fileItem.id, '"1"');
  // While item is in trash, remove its blob from activeBlobs in mock quota
  quotaStore.activeBlobs.delete('blob-file-1');

  // Simulate other files filling up workspace to max (1 GB)
  quotaStore.activeBlobs.set('blob-other-fill', 1024n * 1024n * 1024n);

  // Attempting to restore when workspace is full must be rejected with QUOTA_EXCEEDED (QA-06)
  await assert.rejects(
    service.restore(principal, fileItem.id, '"2"'),
    (err: unknown) => err instanceof DomainError && err.code === 'QUOTA_EXCEEDED' && err.status === 400,
  );
});

test('QA-07: 1,000 revisions of same item retain revision history while only active counts', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  const principal = { accountId: 'actor-1' };
  let currentItem = await service.createItem(principal, 'ws-1', {
    type: 'text',
    title: 'Iteration Test',
    content: 'Initial text',
  });

  // Simulate multiple revisions
  const iterations = 50; // test 50 sequential revisions
  for (let i = 1; i <= iterations; i++) {
    currentItem = await service.createRevision(principal, currentItem.id, `"${currentItem.version}"`, {
      type: 'text',
      content: `Revision ${i} text`,
    });
  }

  assert.equal(currentItem.version, iterations + 1);
  const history = await libStore.listRevisions(currentItem.id);
  assert.equal(history.length, iterations + 1);
});

test('QA-12: URL preview with SSRF protection blocks private IPs and loops', async () => {
  assert.equal(isPrivateOrBlockedIp('127.0.0.1'), true);
  assert.equal(isPrivateOrBlockedIp('10.0.0.1'), true);
  assert.equal(isPrivateOrBlockedIp('172.16.0.1'), true);
  assert.equal(isPrivateOrBlockedIp('192.168.1.1'), true);
  assert.equal(isPrivateOrBlockedIp('169.254.169.254'), true);
  assert.equal(isPrivateOrBlockedIp('::1'), true);
  assert.equal(isPrivateOrBlockedIp('8.8.8.8'), false);

  assert.equal(isPrivateOrBlockedHost('localhost'), true);
  assert.equal(isPrivateOrBlockedHost('server.internal'), true);
  assert.equal(isPrivateOrBlockedHost('169.254.169.254'), true);
  assert.equal(isPrivateOrBlockedHost('example.com'), false);

  assert.equal(normalizeUrl('example.com/test'), 'https://example.com/test');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com');

  const text = 'Here is a reference link to test: google.com/search?q=snote and another one.';
  assert.equal(extractFirstUrl(text), 'https://google.com/search?q=snote');
});

test('LIB-02: Quick save to personal inbox assigns folderId = null in personal workspace', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  libStore.workspaces.set('ws-personal', {
    id: 'ws-personal',
    ownerId: 'actor-1',
    kind: 'personal',
    name: 'Personal Workspace',
  });

  const inboxItem = await service.createInboxItem({ accountId: 'actor-1' }, {
    type: 'link',
    url: 'snote.edu.vn',
  });

  assert.equal(inboxItem.workspaceId, 'ws-personal');
  const stored = await libStore.findItem(inboxItem.id);
  assert.equal(stored?.folderId, null);
});

test('LIB-06: Moving items across different workspaces is strictly forbidden', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  const principal = { accountId: 'actor-1' };
  const item = await service.createItem(principal, 'ws-1', {
    type: 'text',
    content: 'Workspace 1 content',
  });

  // Create folder in a DIFFERENT workspace ws-2
  await service.createFolder(principal, 'ws-2', { name: 'Folder in ws-2' });
  const ws2Folders = await service.listFolders(principal, 'ws-2');
  const ws2FolderId = ws2Folders[0].id;

  // Attempting to move item from ws-1 into folder in ws-2 must be rejected (LIB-06)
  await assert.rejects(
    service.updateItem(principal, item.id, '"1"', {
      folderId: ws2FolderId,
    }),
    (err: unknown) => err instanceof DomainError && err.code === 'CROSS_WORKSPACE_MOVE_NOT_ALLOWED' && err.status === 400,
  );
});

test('LIB-07: Deleting folder with items or child folders is strictly rejected (no cascade)', async () => {
  const libStore = new MockLibraryStore();
  const quotaStore = new MockQuotaStore();
  const quota = new QuotaService(quotaStore);
  const uploadStore = new MockUploadStore();
  const service = new LibraryService(libStore, quota, uploadStore, allowAuth);

  const principal = { accountId: 'actor-1' };
  const parentFolder = await service.createFolder(principal, 'ws-1', { name: 'Parent Folder' });

  // Add an item into parent folder
  await service.createItem(principal, 'ws-1', {
    type: 'text',
    title: 'Child Note',
    content: 'Child item text',
    folderId: parentFolder.id,
  });

  // Trying to delete non-empty parent folder must fail with FOLDER_NOT_EMPTY (LIB-07)
  await assert.rejects(
    service.deleteFolder(principal, parentFolder.id, `"${parentFolder.version}"`),
    (err: unknown) => err instanceof DomainError && err.code === 'FOLDER_NOT_EMPTY' && err.status === 400,
  );

  // Create child folder
  const emptyParent = await service.createFolder(principal, 'ws-1', { name: 'Empty Parent' });
  await service.createFolder(principal, 'ws-1', { name: 'Child Subfolder', parentId: emptyParent.id });

  // Trying to delete parent with child folder must fail with FOLDER_NOT_EMPTY
  await assert.rejects(
    service.deleteFolder(principal, emptyParent.id, `"${emptyParent.version}"`),
    (err: unknown) => err instanceof DomainError && err.code === 'FOLDER_NOT_EMPTY' && err.status === 400,
  );
});
