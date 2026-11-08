import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as path from 'node:path';
import * as os from 'node:os';
import { promises as fs } from 'node:fs';
import { LocalStorageAdapter } from '../storage/local-storage-adapter';
import { UploadService, type UploadStore, type UploadStagingRecord } from './upload-service';
import { QuotaService, type QuotaStore } from '../library/quota-service';
import { DomainError } from '../../core/authorization';
const allowAuth = { decide: async () => ({ allowed: true }) };

class InMemoryQuotaStore implements QuotaStore {
  public activeBlobs = new Map<string, bigint>();
  public reservations = new Map<string, bigint>();
  public references = new Set<string>();

  async getActiveWorkspaceBlobs(workspaceId: string): Promise<Map<string, bigint>> {
    return new Map(this.activeBlobs);
  }
  async getPendingReservationsBytes(scopeType: string, scopeId: string): Promise<bigint> {
    let total = 0n;
    for (const [k, v] of this.reservations.entries()) {
      if (k.startsWith(`${scopeType}:${scopeId}:`)) total += v;
    }
    return total;
  }
  async createReservation(scopeType: string, scopeId: string, operationKey: string, bytes: bigint): Promise<void> {
    this.reservations.set(`${scopeType}:${scopeId}:${operationKey}`, bytes);
  }
  async releaseReservation(scopeType: string, scopeId: string, operationKey: string): Promise<void> {
    this.reservations.delete(`${scopeType}:${scopeId}:${operationKey}`);
  }
  async addReference(scopeType: string, scopeId: string, blobId: string, reason: string): Promise<void> {
    this.references.add(`${scopeType}:${scopeId}:${blobId}:${reason}`);
  }
  async removeReference(scopeType: string, scopeId: string, blobId: string, reason: string): Promise<void> {
    this.references.delete(`${scopeType}:${scopeId}:${blobId}:${reason}`);
  }
  async getBlobSize(blobId: string): Promise<bigint | null> {
    return this.activeBlobs.get(blobId) ?? null;
  }
}

class InMemoryUploadStore implements UploadStore {
  public stagings = new Map<string, UploadStagingRecord>();
  public savedBlobs = new Map<string, { id: string; size: bigint }>();

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
  async saveVerifiedBlob(blob: { id: string; hash: string; size: bigint; mediaType: string; storageKey: string }): Promise<{ id: string }> {
    this.savedBlobs.set(blob.id, { id: blob.id, size: blob.size });
    return { id: blob.id };
  }
}

async function* createAsyncIterable(buffer: Buffer): AsyncIterable<Uint8Array> {
  yield new Uint8Array(buffer);
}

test('UploadService happy path: start, putContent, verify', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-upload-test-'));
  try {
    const storage = new LocalStorageAdapter({ rootDir: tempDir });
    const quotaStore = new InMemoryQuotaStore();
    const quota = new QuotaService(quotaStore);
    const uploadStore = new InMemoryUploadStore();
    const uploadService = new UploadService(storage, uploadStore, quota, allowAuth);

    const principal = { accountId: 'user-1' };
    const validPdf = Buffer.from('%PDF-1.4 test document body');

    const started = await uploadService.start(principal, {
      fileName: 'doc.pdf',
      size: validPdf.length,
      declaredType: 'application/pdf',
      scopeType: 'workspace',
      scopeId: 'ws-1',
    });

    assert.equal(started.status, 'staged');
    assert.equal(started.size, validPdf.length);

    // Reservation was made
    const pending = await quotaStore.getPendingReservationsBytes('workspace', 'ws-1');
    assert.equal(pending, BigInt(validPdf.length));

    // Put content
    const verified = await uploadService.putContent(principal, started.id, createAsyncIterable(validPdf));
    assert.equal(verified.status, 'verified');
    assert.equal(verified.size, validPdf.length);

    const staging = await uploadStore.findStaging(started.id);
    assert.equal(staging?.status, 'verified');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('UploadService rejects another actor before accepting staged bytes', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-upload-ownership-'));
  try {
    const store = new InMemoryUploadStore();
    const service = new UploadService(new LocalStorageAdapter({ rootDir: tempDir }), store,
      new QuotaService(new InMemoryQuotaStore()), allowAuth);
    const bytes = Buffer.from('%PDF-1.4 private document');
    const started = await service.start({ accountId: 'owner' }, {
      fileName: 'private.pdf', size: bytes.length, declaredType: 'application/pdf',
      scopeType: 'workspace', scopeId: 'ws-1',
    });
    await assert.rejects(
      service.putContent({ accountId: 'other' }, started.id, createAsyncIterable(bytes)),
      (err: unknown) => err instanceof DomainError && err.code === 'UPLOAD_NOT_FOUND',
    );
    assert.equal(store.stagings.get(started.id)?.status, 'staged');
    assert.equal(store.savedBlobs.size, 0);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('UploadService rejects files > 25 MB on start (LIB-11, QA-06)', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-upload-25mb-'));
  try {
    const storage = new LocalStorageAdapter({ rootDir: tempDir });
    const quotaStore = new InMemoryQuotaStore();
    const quota = new QuotaService(quotaStore);
    const uploadStore = new InMemoryUploadStore();
    const uploadService = new UploadService(storage, uploadStore, quota, allowAuth);

    await assert.rejects(
      uploadService.start({ accountId: 'user-1' }, {
        fileName: 'huge.bin',
        size: 26 * 1024 * 1024,
        declaredType: 'application/pdf',
        scopeType: 'workspace',
        scopeId: 'ws-1',
      }),
      (err: unknown) => err instanceof DomainError && err.code === 'FILE_TOO_LARGE' && err.status === 400,
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('UploadService rejects start when workspace quota is full (QA-06)', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-upload-quota-'));
  try {
    const storage = new LocalStorageAdapter({ rootDir: tempDir });
    const quotaStore = new InMemoryQuotaStore();
    // Fill workspace with 1 GB of existing active blobs
    quotaStore.activeBlobs.set('blob-full', BigInt(1024 * 1024 * 1024));
    const quota = new QuotaService(quotaStore);
    const uploadStore = new InMemoryUploadStore();
    const uploadService = new UploadService(storage, uploadStore, quota, allowAuth);

    await assert.rejects(
      uploadService.start({ accountId: 'user-1' }, {
        fileName: 'sample.pdf',
        size: 1024,
        declaredType: 'application/pdf',
        scopeType: 'workspace',
        scopeId: 'ws-full',
      }),
      (err: unknown) => err instanceof DomainError && err.code === 'QUOTA_EXCEEDED' && err.status === 400,
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('UploadService aborts and cleans up reservation on invalid MIME content (QA-06)', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-upload-abort-'));
  try {
    const storage = new LocalStorageAdapter({ rootDir: tempDir });
    const quotaStore = new InMemoryQuotaStore();
    const quota = new QuotaService(quotaStore);
    const uploadStore = new InMemoryUploadStore();
    const uploadService = new UploadService(storage, uploadStore, quota, allowAuth);

    const started = await uploadService.start({ accountId: 'user-1' }, {
      fileName: 'fake.pdf',
      size: 100,
      declaredType: 'application/pdf',
      scopeType: 'workspace',
      scopeId: 'ws-1',
    });

    const invalidContent = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ executable
    await assert.rejects(
      uploadService.putContent({ accountId: 'user-1' }, started.id, createAsyncIterable(invalidContent)),
      (err: unknown) => err instanceof DomainError && err.code === 'UNSUPPORTED_MEDIA_TYPE',
    );

    // Staging was marked aborted and reservation was cleared
    const staging = await uploadStore.findStaging(started.id);
    assert.equal(staging?.status, 'aborted');
    const pending = await quotaStore.getPendingReservationsBytes('workspace', 'ws-1');
    assert.equal(pending, 0n);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('upload identifier cannot be used by another account to publish bytes', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-upload-owner-'));
  try {
    const storage = new LocalStorageAdapter({ rootDir: tempDir });
    const quotaStore = new InMemoryQuotaStore();
    const quota = new QuotaService(quotaStore);
    const uploadStore = new InMemoryUploadStore();
    const service = new UploadService(storage, uploadStore, quota, allowAuth);
    const started = await service.start({ accountId: 'owner' }, {
      fileName: 'document.pdf', size: 24, declaredType: 'application/pdf',
      scopeType: 'workspace', scopeId: 'ws-1',
    });

    await assert.rejects(
      service.putContent({ accountId: 'attacker' }, started.id,
        createAsyncIterable(Buffer.from('%PDF-1.4 test document'))),
      (err: unknown) => err instanceof DomainError && err.status === 404,
    );
    assert.equal((await uploadStore.findStaging(started.id))?.status, 'staged');
    assert.equal(uploadStore.savedBlobs.size, 0);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
