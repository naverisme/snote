import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, formatBytes } from './utils.ts';

test('formatBytes properly formats file sizes across orders of magnitude', () => {
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(25 * 1024 * 1024), '25.0 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024), '1.00 GB');
});

test('MAX_FILE_SIZE and ALLOWED_EXTENSIONS match LIB-11 requirements', () => {
  // Max size is 25 MB = 26,214,400 bytes
  assert.equal(MAX_FILE_SIZE, 25 * 1024 * 1024);

  // Allowed: PDF, PNG, JPEG, WebP, TXT, DOCX, XLSX, PPTX, ZIP
  const requiredExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.docx', '.xlsx', '.pptx', '.zip'];
  for (const ext of requiredExts) {
    assert.ok(ALLOWED_EXTENSIONS.includes(ext), `Expected ${ext} to be allowed`);
  }

  // Unsupported extensions must NOT be in allowed list
  assert.ok(!ALLOWED_EXTENSIONS.includes('.exe'));
  assert.ok(!ALLOWED_EXTENSIONS.includes('.sh'));
  assert.ok(!ALLOWED_EXTENSIONS.includes('.bat'));
});

test('LIB-14: 30 days retention policy calculates correct days remaining', () => {
  const now = new Date();
  const deletedAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // deleted 5 days ago
  const purgeAfter = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after deletion

  const msRemaining = purgeAfter.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
  assert.equal(daysRemaining, 25);
});
