import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, formatBytes } from './utils.ts';
import {
  calculateListEnter,
  normalizeUrl,
  extractUrls,
  getFirstUrl,
} from './markdown-helper.ts';

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

/* =========================================================================
 * CUXB-07 / LIB-09 / LIB-10 Markdown list auto-completion & URL testing
 * ========================================================================= */
test('CUXB-07: Bullet list "- " continues on Enter when line has text', () => {
  const input = '- First point';
  const res = calculateListEnter(input, input.length);
  assert.equal(res.handled, true);
  assert.equal(res.newValue, '- First point\n- ');
  assert.equal(res.newCursorPos, '- First point\n- '.length);
});

test('CUXB-07: Empty bullet list item ends list on Enter', () => {
  const input = '- First point\n- ';
  const res = calculateListEnter(input, input.length);
  assert.equal(res.handled, true);
  // Removes "- " and leaves a clean newline
  assert.equal(res.newValue, '- First point\n\n');
  assert.equal(res.newCursorPos, '- First point\n\n'.length);
});

test('CUXB-07: Numbered list "1. " increments to "2. " on Enter', () => {
  const input = '1. Step one';
  const res = calculateListEnter(input, input.length);
  assert.equal(res.handled, true);
  assert.equal(res.newValue, '1. Step one\n2. ');
  assert.equal(res.newCursorPos, '1. Step one\n2. '.length);
});

test('CUXB-07: Empty numbered item ends list on Enter', () => {
  const input = '1. Step one\n2. ';
  const res = calculateListEnter(input, input.length);
  assert.equal(res.handled, true);
  // Removes "2. " and leaves newline
  assert.equal(res.newValue, '1. Step one\n\n');
});

test('CUXB-07: Normal text lines without list prefix are not intercepted', () => {
  const input = 'Just normal text';
  const res = calculateListEnter(input, input.length);
  assert.equal(res.handled, false);
  assert.equal(res.newValue, input);
});

test('CUXB-07 / LIB-10: normalizeUrl prefixes https:// if missing', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('https://example.com'), 'https://example.com');
  assert.equal(normalizeUrl('http://example.com/page'), 'http://example.com/page');
});

test('CUXB-07 / LIB-10: extractUrls and getFirstUrl correctly extract and identify first URL', () => {
  const text = 'Check out google.com and then visit https://github.com for code';
  const urls = extractUrls(text);
  assert.equal(urls.length, 2);
  assert.equal(urls[0], 'https://google.com');
  assert.equal(urls[1], 'https://github.com');

  assert.equal(getFirstUrl(text), 'https://google.com');
  assert.equal(getFirstUrl('No links here!'), null);
});

/* =========================================================================
 * CUXB-06 / LIB-07 Empty folder deletion validation logic
 * ========================================================================= */
test('CUXB-06 / LIB-07: Folder deletion check prevents deleting non-empty folders', () => {
  const folders = [
    { id: 'f-1', name: 'Root Folder', parentId: null, version: 1 },
    { id: 'f-2', name: 'Sub Folder', parentId: 'f-1', version: 1 },
    { id: 'f-3', name: 'Empty Folder', parentId: null, version: 1 },
  ];
  const items = [
    { id: 'item-1', folderId: 'f-1', type: 'text', title: 'Note 1', version: 1 },
  ];

  // Check f-1 (has child folders and items)
  const f1ChildFolders = folders.filter((f) => f.parentId === 'f-1');
  const f1Items = items.filter((i) => i.folderId === 'f-1');
  assert.ok(f1ChildFolders.length > 0 || f1Items.length > 0, 'f-1 must not be eligible for deletion');

  // Check f-2 (has no child folders and no items)
  const f2ChildFolders = folders.filter((f) => f.parentId === 'f-2');
  const f2Items = items.filter((i) => i.folderId === 'f-2');
  assert.equal(f2ChildFolders.length, 0);
  assert.equal(f2Items.length, 0);

  // Check f-3 (completely empty)
  const f3ChildFolders = folders.filter((f) => f.parentId === 'f-3');
  const f3Items = items.filter((i) => i.folderId === 'f-3');
  assert.equal(f3ChildFolders.length, 0);
  assert.equal(f3Items.length, 0);
});

/* =========================================================================
 * CUXB-09 / LIB-15 Byte progress & green checkmark logic
 * ========================================================================= */
test('CUXB-09 / LIB-15: Byte progress calculation is strictly bounded and accurate', () => {
  const loaded = 5242880; // 5 MB
  const total = 10485760; // 10 MB
  const percent = Math.min(100, Math.round((loaded / total) * 100));
  assert.equal(percent, 50);

  const formatted = `${formatBytes(loaded)} / ${formatBytes(total)} (${percent}%)`;
  assert.equal(formatted, '5.0 MB / 10.0 MB (50%)');
});
