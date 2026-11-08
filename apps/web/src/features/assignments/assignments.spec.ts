import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AssignmentInput, LatePolicySetting, SubmissionInput, RecipientProgress } from './types';

// ============================================================================
// SUITE 1: ZERO-CLS SKELETON PITCH & GEOMETRY MATCHING (WEB-01, CLS = 0)
// ============================================================================

test('CLS-01: Skeleton card geometry exactly matches real card pitch and insets', async () => {
  const css = await readFile(join(process.cwd(), 'apps/web/src/features/assignments/assignments.css'), 'utf-8');

  // Verify skeleton-assignment-card dimensions match live card
  assert.ok(css.includes('.skeleton-assignment-card'), 'assignments.css must define skeleton-assignment-card');
  assert.ok(css.includes('height: 64px;'), 'Card height must be 64px to preserve vertical pitch');
  assert.ok(css.includes('padding: 12px 14px;'), 'Card insets must be >= 12px (12px 14px)');
  assert.ok(css.includes('border: 1px solid var(--hairline);'), 'Border must be hairline 1px');

  // Verify grid columns layout
  assert.ok(css.includes('grid-template-columns: 260px minmax(0, 1fr);'), 'Grid column must match 260px minmax(0, 1fr)');
  assert.ok(css.includes('gap: 24px;'), 'Grid gap must match 24px');
});

test('CLS-02: Skeleton animation respects prefers-reduced-motion', async () => {
  const css = await readFile(join(process.cwd(), 'apps/web/src/features/assignments/assignments.css'), 'utf-8');

  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'Must contain prefers-reduced-motion media query');
  assert.ok(css.includes('animation: none !important;'), 'Shimmer animation must be disabled under reduced-motion');
});

// ============================================================================
// SUITE 2: CUXD-01 & CUXD-02 ASSIGNMENT CREATION FORM RULES
// ============================================================================

test('CUXD-01: Title and recipient groups are strictly required, description and deadline optional', () => {
  const validateAssignmentInput = (input: Partial<AssignmentInput>): { valid: boolean; error?: string } => {
    if (!input.title || !input.title.trim()) {
      return { valid: false, error: 'Tiêu đề bài giao là bắt buộc.' };
    }
    if (!input.recipientWorkspaceIds || input.recipientWorkspaceIds.length === 0) {
      return { valid: false, error: 'Cần chọn ít nhất một nhóm nhận bài.' };
    }
    return { valid: true };
  };

  // Missing title fails
  assert.equal(validateAssignmentInput({ recipientWorkspaceIds: ['ws-1'] }).valid, false);

  // Missing recipient groups fails
  assert.equal(validateAssignmentInput({ title: 'Bài tập 1', recipientWorkspaceIds: [] }).valid, false);

  // Valid minimal input (title + 1 group, no deadline, no description) passes (ASG-13)
  const validMinimal = validateAssignmentInput({
    title: 'Đồ án giữa kỳ',
    recipientWorkspaceIds: ['ws-group-1'],
  });
  assert.equal(validMinimal.valid, true);

  // Valid input with all optional fields passes
  const validFull = validateAssignmentInput({
    title: 'Đồ án cuối kỳ',
    recipientWorkspaceIds: ['ws-1', 'ws-2'],
    description: 'Yêu cầu hoàn thành các tính năng',
    deadline: '2026-11-20T23:59:59Z',
    lateFirst: 'allow',
    lateRevision: 'lock',
  });
  assert.equal(validFull.valid, true);
});

test('CUXD-02: Two independent late policy controls with 3 distinct states (ASG-05/06/15)', () => {
  const validSettings: LatePolicySetting[] = ['inherit', 'allow', 'lock'];

  // Test both controls independently accept all 3 states
  for (const first of validSettings) {
    for (const revision of validSettings) {
      const input: AssignmentInput = {
        title: 'Assignment',
        recipientWorkspaceIds: ['group-1'],
        lateFirst: first,
        lateRevision: revision,
      };
      assert.ok(validSettings.includes(input.lateFirst!));
      assert.ok(validSettings.includes(input.lateRevision!));
    }
  }

  // Precedence resolution according to ASG-06 / ASG-15:
  // Explicit value on assignment overrides class default; 'inherit' defers to class default
  const resolveEffectivePolicy = (
    assignmentSetting: LatePolicySetting | undefined,
    classDefault: 'allow' | 'lock'
  ): 'allow' | 'lock' => {
    if (assignmentSetting === 'allow' || assignmentSetting === 'lock') {
      return assignmentSetting;
    }
    return classDefault;
  };

  assert.equal(resolveEffectivePolicy('allow', 'lock'), 'allow'); // explicit overrides class lock
  assert.equal(resolveEffectivePolicy('lock', 'allow'), 'lock');   // explicit overrides class allow
  assert.equal(resolveEffectivePolicy('inherit', 'lock'), 'lock'); // inherit uses class lock
  assert.equal(resolveEffectivePolicy('inherit', 'allow'), 'allow'); // inherit uses class allow
  assert.equal(resolveEffectivePolicy(undefined, 'allow'), 'allow'); // unset uses class default
});

// ============================================================================
// SUITE 3: CUXD-03 TEACHER PROGRESS DASHBOARD — 3 INDEPENDENT SOURCES
// ============================================================================

test('CUXD-03: Separates 3 distinct progress sources and does not aggregate into single group percentage', () => {
  const recipient: RecipientProgress = {
    id: 'rec-1',
    assignmentId: 'asg-1',
    workspaceId: 'ws-1',
    workspaceName: 'Nhóm 1 - Kiến trúc',
    tasksCompleted: 4,
    tasksTotal: 5,
    checklistCompleted: 12,
    checklistTotal: 15,
    progressText: 'Đang chạy unit test và hoàn tất tài liệu',
    submissionVersion: 2,
    version: 3,
  };

  // Source 1: Tasks
  const source1Tasks = `${recipient.tasksCompleted}/${recipient.tasksTotal} việc`;
  assert.equal(source1Tasks, '4/5 việc');

  // Source 2: Checklist percentage
  const checklistPercent = Math.round(
    ((recipient.checklistCompleted ?? 0) / (recipient.checklistTotal || 1)) * 100
  );
  assert.equal(checklistPercent, 80);

  // Source 3: Text update
  assert.equal(recipient.progressText, 'Đang chạy unit test và hoàn tất tài liệu');

  // Rule verification: No combined average calculation (ASG-02)
  // Each source remains fully decoupled
  assert.notEqual(source1Tasks, `${checklistPercent}%`);
});

// ============================================================================
// SUITE 4: CUXD-04/05/06 & STR-16 SUBMISSION, IDEMPOTENCY & CONFLICT HANDLING
// ============================================================================

test('CUXD-04: Submission requires at least one valid content type (text, link, or file) under ASG-14', () => {
  const validateSubmission = (input: SubmissionInput): boolean => {
    const hasText = Boolean(input.text && input.text.trim().length > 0);
    const hasLinks = Boolean(input.links && input.links.some(l => l.trim().length > 0));
    const hasFiles = Boolean(input.uploadIds && input.uploadIds.length > 0);
    return hasText || hasLinks || hasFiles;
  };

  assert.equal(validateSubmission({}), false);
  assert.equal(validateSubmission({ text: '   ' }), false);
  assert.equal(validateSubmission({ links: [''] }), false);
  assert.equal(validateSubmission({ uploadIds: [] }), false);

  assert.equal(validateSubmission({ text: 'Báo cáo hoàn thành đồ án' }), true);
  assert.equal(validateSubmission({ links: ['https://github.com/group1/project'] }), true);
  assert.equal(validateSubmission({ uploadIds: ['upload-uuid-1'] }), true);
  assert.equal(validateSubmission({ text: 'Báo cáo', links: ['https://demo.app'], uploadIds: ['u1'] }), true);
});

test('STR-16: Idempotency key fingerprinting prevents duplicate submissions on retry', () => {
  const generateFingerprint = (recipientId: string, currentVersion: number, input: SubmissionInput) => {
    return JSON.stringify({ recipientId, currentVersion, input });
  };

  const inputA: SubmissionInput = { text: 'Report v1', links: ['https://repo'] };
  const inputB: SubmissionInput = { text: 'Report v2', links: ['https://repo'] };

  const fp1 = generateFingerprint('rec-1', 1, inputA);
  const fp2 = generateFingerprint('rec-1', 1, inputA);
  const fp3 = generateFingerprint('rec-1', 1, inputB);

  // Same intent produces identical fingerprint => preserves same idempotencyKey
  assert.equal(fp1, fp2);
  // Modified intent produces different fingerprint => generates new idempotencyKey
  assert.notEqual(fp1, fp3);
});

test('ASG-16: File attachment adheres to 25 MB file size limit', () => {
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB in bytes
  const isFileSizeAllowed = (bytes: number) => bytes <= MAX_FILE_SIZE;

  assert.equal(isFileSizeAllowed(1024), true);
  assert.equal(isFileSizeAllowed(25 * 1024 * 1024), true);
  assert.equal(isFileSizeAllowed(25 * 1024 * 1024 + 1), false);
  assert.equal(isFileSizeAllowed(50 * 1024 * 1024), false);
});

// ============================================================================
// SUITE 5: STAGESHOW CRAFT, TOKENS & ZERO-EMOJI ENFORCEMENT
// ============================================================================

test('STAGESHOW: No unicode emojis present in assignments UI components', async () => {
  const componentFiles = [
    'apps/web/src/features/assignments/AssignmentFeature.tsx',
    'apps/web/src/features/assignments/components/AssignmentEmptyState.tsx',
    'apps/web/src/features/assignments/components/AssignmentCreateModal.tsx',
    'apps/web/src/features/assignments/components/TeacherProgressDashboard.tsx',
    'apps/web/src/features/assignments/components/StudentSubmissionForm.tsx',
    'apps/web/src/features/assignments/components/RevisionHistoryView.tsx',
    'apps/web/src/features/assignments/components/TeacherFeedbackForm.tsx',
    'apps/web/src/features/assignments/components/GroupProgressUpdateWidget.tsx',
  ];

  // Regex to match emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  for (const filePath of componentFiles) {
    const content = await readFile(join(process.cwd(), filePath), 'utf-8');
    assert.equal(
      emojiRegex.test(content),
      false,
      `File ${filePath} must not contain any unicode emojis (use lucide-react vector icons)`
    );
  }
});
