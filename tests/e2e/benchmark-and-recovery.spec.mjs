import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { LocalStorageAdapter } from '../../apps/api/dist/modules/storage/local-storage-adapter.js';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://snote:snote_dev_only@localhost:5432/snote?schema=public';

const TEST_STORAGE_DIR = path.resolve(process.cwd(), '.test_storage_benchmark');
const RESTORE_TARGET_DIR = path.resolve(process.cwd(), '.test_storage_recovered');

let app;
let baseUrl;

function extractAuth(res, body) {
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected Set-Cookie header in auth response');
  const sessionCookie = setCookie.split(';')[0];
  const csrfToken = body.csrfToken;
  assert.ok(csrfToken, 'Expected csrfToken in auth response body');
  return { cookie: sessionCookie, csrfToken };
}

before(async () => {
  await fs.mkdir(TEST_STORAGE_DIR, { recursive: true });
  await fs.mkdir(RESTORE_TARGET_DIR, { recursive: true });

  const { NestFactory } = await import('@nestjs/core');
  const { AppModule, ApiExceptionFilter } = await import('../../apps/api/dist/main.js');

  app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api/v2');
  const server = await app.listen(0, '127.0.0.1');
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}/api/v2`;
});

after(async () => {
  if (app) {
    await app.close();
  }
  await fs.rm(TEST_STORAGE_DIR, { recursive: true, force: true }).catch(() => {});
  await fs.rm(RESTORE_TARGET_DIR, { recursive: true, force: true }).catch(() => {});
});

// ============================================================================
// SUITE 1: LOAD & LATENCY BENCHMARK (p95 <= 1000ms Target)
// ============================================================================

test('BENCH-01: Measure p95 query latency for authorized list queries under 20 concurrent requests', async () => {
  const email = `benchmark-user-${randomUUID().slice(0, 8)}@example.com`;
  const password = 'StrongPassword123!';

  // 1. Register user & get session
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      usages: ['student', 'teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  assert.equal(regRes.status, 201);
  const regBody = await regRes.json();
  const auth = extractAuth(regRes, regBody);

  // 2. Get default workspace
  const wsRes = await fetch(`${baseUrl}/workspaces`, { headers: { cookie: auth.cookie } });
  const wsData = (await wsRes.json()).data;
  const personalWs = wsData.find(w => w.kind === 'default');
  assert.ok(personalWs);

  // 3. Pre-seed tasks in personal workspace
  for (let i = 1; i <= 10; i++) {
    await fetch(`${baseUrl}/workspaces/${personalWs.id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: auth.cookie,
        'x-csrf-token': auth.csrfToken,
      },
      body: JSON.stringify({
        title: `Seed Task ${i} for Benchmark`,
        importance: i % 2 === 0 ? 'high' : 'medium',
        urgency: 'low',
      }),
    });
  }

  // 4. Run 40 queries across 20 concurrent requests
  const endpoints = [
    `${baseUrl}/me/tasks`,
    `${baseUrl}/workspaces/${personalWs.id}/tasks`,
    `${baseUrl}/workspaces`,
  ];

  const totalRequests = 40;
  const latencies = [];

  const executeQuery = async (index) => {
    const url = endpoints[index % endpoints.length];
    const start = performance.now();
    const res = await fetch(url, { headers: { cookie: auth.cookie } });
    const duration = performance.now() - start;
    assert.equal(res.status, 200);
    latencies.push(duration);
  };

  // Dispatch in chunks of 20 concurrent queries
  const chunkSize = 20;
  for (let i = 0; i < totalRequests; i += chunkSize) {
    const chunk = Array.from({ length: Math.min(chunkSize, totalRequests - i) }, (_, k) =>
      executeQuery(i + k)
    );
    await Promise.all(chunk);
  }

  // Compute statistics
  latencies.sort((a, b) => a - b);
  const min = latencies[0];
  const max = latencies[latencies.length - 1];
  const avg = latencies.reduce((s, v) => s + v, 0) / latencies.length;
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p90 = latencies[Math.floor(latencies.length * 0.90)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  console.log(`\n--- BENCHMARK RESULTS (40 queries, 20 concurrent) ---`);
  console.log(`Min: ${min.toFixed(2)}ms | Avg: ${avg.toFixed(2)}ms | Max: ${max.toFixed(2)}ms`);
  console.log(`p50: ${p50.toFixed(2)}ms | p90: ${p90.toFixed(2)}ms | p95: ${p95.toFixed(2)}ms | p99: ${p99.toFixed(2)}ms`);

  // Target requirement: p95 <= 1000ms
  assert.ok(p95 <= 1000, `Expected p95 latency <= 1000ms, got ${p95.toFixed(2)}ms`);
  assert.ok(avg < 200, `Expected average latency < 200ms, got ${avg.toFixed(2)}ms`);
});

// ============================================================================
// SUITE 2: CONCURRENT WRITES & OPTIMISTIC LOCKING
// ============================================================================

test('BENCH-02: 20 concurrent task creations maintain transactional integrity', async () => {
  const email = `concurrent-user-${randomUUID().slice(0, 8)}@example.com`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'StrongPassword123!',
      usages: ['student'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const auth = extractAuth(regRes, await regRes.json());

  const wsRes = await fetch(`${baseUrl}/workspaces`, { headers: { cookie: auth.cookie } });
  const personalWs = (await wsRes.json()).data.find(w => w.kind === 'default');

  // Launch 20 concurrent writes simultaneously
  const writePromises = Array.from({ length: 20 }, (_, i) =>
    fetch(`${baseUrl}/workspaces/${personalWs.id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: auth.cookie,
        'x-csrf-token': auth.csrfToken,
      },
      body: JSON.stringify({
        title: `Concurrent Write Task ${i + 1}`,
        importance: 'medium',
      }),
    })
  );

  const results = await Promise.all(writePromises);
  for (const res of results) {
    assert.ok(res.status === 200 || res.status === 201, `Write failed with status ${res.status}`);
  }

  // Verify exactly 20 distinct tasks were created without collision
  const listRes = await fetch(`${baseUrl}/workspaces/${personalWs.id}/tasks`, {
    headers: { cookie: auth.cookie },
  });
  const tasks = (await listRes.json()).data;
  const createdConcurrentTasks = tasks.filter(t => t.title.startsWith('Concurrent Write Task'));
  assert.equal(createdConcurrentTasks.length, 20, 'All 20 concurrent tasks must be created cleanly');

  // Verify unique task IDs
  const uniqueIds = new Set(createdConcurrentTasks.map(t => t.id));
  assert.equal(uniqueIds.size, 20, 'All 20 tasks must have distinct IDs');
});

// ============================================================================
// SUITE 3: DISASTER RECOVERY DRILL & BYTE RECONCILIATION (QA-14)
// ============================================================================

test('RECOV-01: Full backup and recovery drill restores metadata and blobs with 100% SHA-256 fidelity', async () => {
  // 1. Initialize local storage adapter with dedicated test directory
  const storage = new LocalStorageAdapter({ rootDir: TEST_STORAGE_DIR });
  await storage.init();

  // 2. Stage and commit multiple test blobs (PDF, PNG, plain text)
  const sampleFiles = [
    {
      name: 'math-assignment-solution.pdf',
      data: Buffer.concat([Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'), Buffer.alloc(1024, 0x41)]),
      type: 'application/pdf',
      context: 'submission_rev_1',
    },
    {
      name: 'diagram.png',
      data: Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(2048, 0x20),
      ]),
      type: 'image/png',
      context: 'submission_rev_2',
    },
    {
      name: 'student_notes.txt',
      data: Buffer.from('Detailed research notes for assignment v2\nAnalysis and ground truth.', 'utf-8'),
      type: 'text/plain',
      context: 'library_doc_1',
    },
  ];

  const committedBlobs = [];
  const checksumMap = new Map();

  for (const file of sampleFiles) {
    const opId = `op-${randomUUID()}`;
    const stagedId = await storage.stage(opId, (async function* () {
      yield new Uint8Array(file.data);
    })());

    const verified = await storage.verify(stagedId, file.type);
    assert.ok(verified.id);
    assert.equal(verified.size, file.data.length);

    // Compute expected SHA-256 hash directly
    const expectedSha = createHash('sha256').update(file.data).digest('hex');
    assert.equal(verified.digest, expectedSha, 'Digest must match SHA-256');

    checksumMap.set(verified.id, {
      expectedSha,
      size: file.data.length,
      name: file.name,
      context: file.context,
    });

    committedBlobs.push(verified);
  }

  // 3. Construct metadata snapshot representing DB state
  const metadataSnapshot = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    submissions: committedBlobs.map((b, idx) => ({
      submissionId: `sub-${idx + 1}`,
      assignmentId: 'assign-alpha',
      studentId: `student-${idx + 1}`,
      revisionId: `rev-${idx + 1}`,
      blobDigest: b.id,
      fileSize: b.size,
      status: 'submitted',
    })),
  };

  // 4. PERFORM BACKUP: Save metadata manifest and copy blob archive
  const backupDir = path.join(TEST_STORAGE_DIR, 'backup_archive');
  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(path.join(backupDir, 'manifest.json'), JSON.stringify(metadataSnapshot, null, 2), 'utf-8');

  // Copy blobs from storage/blobs to backup_archive/blobs
  const backupBlobsDir = path.join(backupDir, 'blobs');
  await fs.mkdir(backupBlobsDir, { recursive: true });
  const sourceBlobsDir = path.join(TEST_STORAGE_DIR, 'blobs');
  const sourceFiles = await fs.readdir(sourceBlobsDir);
  for (const f of sourceFiles) {
    await fs.copyFile(path.join(sourceBlobsDir, f), path.join(backupBlobsDir, f));
  }

  // 5. SIMULATE DISASTER: Wipe original storage directory
  await fs.rm(sourceBlobsDir, { recursive: true, force: true });
  assert.rejects(async () => {
    await fs.readdir(sourceBlobsDir);
  }, 'Original blob directory must be wiped after disaster simulation');

  // 6. RESTORE DRILL: Restore to fresh target directory
  const recoveredStorage = new LocalStorageAdapter({ rootDir: RESTORE_TARGET_DIR });
  await recoveredStorage.init();

  const restoredManifest = JSON.parse(
    await fs.readFile(path.join(backupDir, 'manifest.json'), 'utf-8')
  );

  const targetBlobsDir = path.join(RESTORE_TARGET_DIR, 'blobs');
  const backupFiles = await fs.readdir(backupBlobsDir);
  for (const f of backupFiles) {
    await fs.copyFile(path.join(backupBlobsDir, f), path.join(targetBlobsDir, f));
  }

  // 7. EXHAUSTIVE RECONCILIATION AUDIT (QA-14)
  console.log(`\n--- RECOVERY AUDIT (QA-14 Reconciliation) ---`);
  console.log(`Restoring ${restoredManifest.submissions.length} submissions across independent target volume...`);

  let matchedFiles = 0;
  for (const sub of restoredManifest.submissions) {
    const meta = checksumMap.get(sub.blobDigest);
    assert.ok(meta, `Metadata entry must exist for blob ${sub.blobDigest}`);

    // Verify blob file exists in recovered storage
    const recoveredBlobPath = path.join(targetBlobsDir, sub.blobDigest);
    const stat = await fs.stat(recoveredBlobPath);
    assert.equal(stat.size, meta.size, `Restored file size must match original metadata size for ${meta.name}`);

    // Verify SHA-256 bit-for-bit checksum
    const hash = createHash('sha256');
    const content = await fs.readFile(recoveredBlobPath);
    hash.update(content);
    const restoredDigest = hash.digest('hex');

    assert.equal(restoredDigest, meta.expectedSha, `Restored file hash must strictly equal original SHA-256 for ${meta.name}`);
    matchedFiles++;
    console.log(`[VERIFIED] ${meta.name}: ${stat.size} bytes | SHA-256: ${restoredDigest.slice(0, 16)}...`);
  }

  assert.equal(matchedFiles, sampleFiles.length, '100% of sample files must be restored with bit-level fidelity');

  // 8. Open recovered blob through LocalStorageAdapter stream
  const testBlobId = committedBlobs[0].id;
  const chunks = [];
  for await (const chunk of await recoveredStorage.open(testBlobId)) {
    chunks.push(chunk);
  }
  const restoredBuffer = Buffer.concat(chunks);
  assert.equal(restoredBuffer.length, sampleFiles[0].data.length);
  assert.equal(createHash('sha256').update(restoredBuffer).digest('hex'), checksumMap.get(testBlobId).expectedSha);
});
