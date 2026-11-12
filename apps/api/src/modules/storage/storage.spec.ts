import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as path from 'node:path';
import * as os from 'node:os';
import { promises as fs } from 'node:fs';
import { LocalStorageAdapter, detectMediaType } from './local-storage-adapter';
import { DomainError } from '../../core/authorization';

async function* createAsyncIterable(buffer: Buffer): AsyncIterable<Uint8Array> {
  yield new Uint8Array(buffer);
}

test('detectMediaType accurately sniffs allowed formats and rejects others', () => {
  // PDF
  assert.equal(detectMediaType(Buffer.from('%PDF-1.4 sample content')), 'application/pdf');
  // PNG
  assert.equal(
    detectMediaType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01])),
    'image/png',
  );
  // JPEG
  assert.equal(detectMediaType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])), 'image/jpeg');
  // WebP
  assert.equal(
    detectMediaType(
      Buffer.concat([
        Buffer.from('RIFF', 'ascii'),
        Buffer.from([0x00, 0x00, 0x00, 0x00]),
        Buffer.from('WEBP', 'ascii'),
      ]),
    ),
    'image/webp',
  );
  // ZIP
  assert.equal(detectMediaType(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00])), 'application/zip');
  // Text
  assert.equal(detectMediaType(Buffer.from('Hello world! SNOTE v2 text content')), 'text/plain');
  // Unsupported executable (MZ)
  assert.equal(detectMediaType(Buffer.from([0x4d, 0x5a, 0x90, 0x00])), null);
});

test('LocalStorageAdapter stage and verify lifecycle for valid files', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-storage-test-'));
  try {
    const adapter = new LocalStorageAdapter({ rootDir: tempDir });
    const content = Buffer.from('%PDF-1.5 test pdf document');
    const opId = 'op-pdf-123';

    const stagedId = await adapter.stage(opId, createAsyncIterable(content));
    assert.equal(stagedId, opId);

    const verified = await adapter.verify(stagedId);
    assert.equal(verified.mediaType, 'application/pdf');
    assert.equal(verified.size, content.length);
    assert.ok(verified.digest.length === 64);

    // Open blob
    const chunks: Uint8Array[] = [];
    for await (const chunk of await adapter.open(verified.id)) {
      chunks.push(chunk);
    }
    assert.equal(Buffer.concat(chunks).toString(), content.toString());

    // Mark for deletion
    await adapter.markForDeletion(verified.id);
    await assert.rejects(adapter.open(verified.id), { code: 'BLOB_NOT_FOUND', status: 404 });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('LocalStorageAdapter rejects files larger than 25 MB (QA-06)', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-storage-large-'));
  try {
    const adapter = new LocalStorageAdapter({ rootDir: tempDir });
    // Simulate chunk stream exceeding 25 MB
    const chunk26MB = Buffer.alloc(26 * 1024 * 1024);

    await assert.rejects(
      adapter.stage('op-large', createAsyncIterable(chunk26MB)),
      (err: unknown) => err instanceof DomainError && err.code === 'FILE_TOO_LARGE' && err.status === 400,
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('LocalStorageAdapter rejects unsupported media types on verify (QA-06)', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-storage-invalid-'));
  try {
    const adapter = new LocalStorageAdapter({ rootDir: tempDir });
    const invalidExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

    await adapter.stage('op-exe', createAsyncIterable(invalidExe));
    await assert.rejects(
      adapter.verify('op-exe'),
      (err: unknown) => err instanceof DomainError && err.code === 'UNSUPPORTED_MEDIA_TYPE' && err.status === 415,
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('LocalStorageAdapter enforces physical server budget (QA-06, QA-07)', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-storage-phys-'));
  try {
    // Set low budget of 100 bytes
    const adapter = new LocalStorageAdapter({ rootDir: tempDir, maxPhysicalBytes: 100 });
    const chunk120 = Buffer.from('A'.repeat(120));

    await assert.rejects(
      adapter.stage('op-phys-overflow', createAsyncIterable(chunk120)),
      (err: unknown) =>
        err instanceof DomainError &&
        err.code === 'PHYSICAL_STORAGE_EXHAUSTED' &&
        err.status === 507,
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('LocalStorageAdapter counts staged bytes once and serializes the physical budget', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'snote-storage-budget-'));
  try {
    const adapter = new LocalStorageAdapter({ rootDir: tempDir, maxPhysicalBytes: 100 });
    async function* chunks() {
      yield Buffer.alloc(25, 65);
      yield Buffer.alloc(25, 65);
    }
    await adapter.stage('first', chunks());
    await adapter.stage('second', chunks());
    assert.equal((await adapter.getPhysicalUsage()).totalBytes, 100);
    await assert.rejects(() => adapter.stage('third', createAsyncIterable(Buffer.from('A'))),
      (err: unknown) => err instanceof DomainError && err.code === 'PHYSICAL_STORAGE_EXHAUSTED');

    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });
    const concurrent = new LocalStorageAdapter({ rootDir: tempDir, maxPhysicalBytes: 60 });
    const outcomes = await Promise.allSettled([
      concurrent.stage('a', createAsyncIterable(Buffer.alloc(40, 65))),
      concurrent.stage('b', createAsyncIterable(Buffer.alloc(40, 65))),
    ]);
    assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await concurrent.getPhysicalUsage()).totalBytes, 40);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
