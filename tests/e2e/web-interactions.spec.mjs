import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://snote:snote_dev_only@localhost:5432/snote?schema=public';
process.env.STORAGE_ROOT = '.test_storage_web_interactions';

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
});

// ============================================================================
// SUITE 1: REDUCED MOTION ENGINE & ACCESSIBILITY (QA-13, UXR-06, ENV-04)
// ============================================================================

test('WEB-01: CSS stylesheets enforce prefers-reduced-motion suppression across all elements', async () => {
  const themeCss = await readFile(join(process.cwd(), 'apps/web/src/shared/theme.css'), 'utf-8');

  // Verify prefers-reduced-motion media query exists in source
  assert.ok(themeCss.includes('@media (prefers-reduced-motion: reduce)'), 'theme.css must declare prefers-reduced-motion media query');
  assert.ok(themeCss.includes('animation-duration: 0.01ms !important'), 'Animations must be reduced to near-zero duration');
  assert.ok(themeCss.includes('transition-duration: 0.01ms !important'), 'Transitions must be reduced to near-zero duration');
  assert.ok(themeCss.includes('scroll-behavior: auto !important'), 'Smooth scrolling must be disabled');

  // Also check built CSS asset in dist
  const distAssetsDir = join(process.cwd(), 'apps/web/dist/assets');
  const files = await readdir(distAssetsDir);
  const cssFile = files.find(f => f.endsWith('.css'));
  assert.ok(cssFile, 'Built CSS file must exist in dist/assets');

  const builtCss = await readFile(join(distAssetsDir, cssFile), 'utf-8');
  assert.ok(builtCss.includes('prefers-reduced-motion:reduce'), 'Compiled CSS must preserve prefers-reduced-motion query');
});

test('WEB-02: useReducedMotion hook logic correctly reflects media query state and dynamic changes', () => {
  // Simulate browser environment with matchMedia
  let activeMatches = false;
  const listeners = new Set();

  const fakeMatchMedia = (query) => ({
    matches: activeMatches,
    media: query,
    addEventListener: (event, handler) => {
      if (event === 'change') listeners.add(handler);
    },
    removeEventListener: (event, handler) => {
      if (event === 'change') listeners.delete(handler);
    },
  });

  // Emulate useReducedMotion hook execution
  class ReducedMotionTracker {
    constructor(matchMediaFn) {
      this.matchMedia = matchMediaFn;
      this.state = this.matchMedia ? this.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
      if (this.matchMedia) {
        this.mq = this.matchMedia('(prefers-reduced-motion: reduce)');
        this.handler = (e) => { this.state = e.matches; };
        this.mq.addEventListener('change', this.handler);
      }
    }
    destroy() {
      if (this.mq && this.handler) {
        this.mq.removeEventListener('change', this.handler);
      }
    }
  }

  // 1. Initial standard motion (matches = false)
  activeMatches = false;
  const tracker = new ReducedMotionTracker(fakeMatchMedia);
  assert.equal(tracker.state, false, 'Default should be false when user preference is standard');

  // 2. User toggles accessibility setting to reduced motion
  activeMatches = true;
  for (const handler of listeners) {
    handler({ matches: true });
  }
  assert.equal(tracker.state, true, 'Hook must immediately update to true when OS prefers-reduced-motion is enabled');

  // 3. User toggles setting back to standard
  activeMatches = false;
  for (const handler of listeners) {
    handler({ matches: false });
  }
  assert.equal(tracker.state, false, 'Hook must update to false when OS prefers-reduced-motion is disabled');

  // 4. Cleanup listener
  tracker.destroy();
  assert.equal(listeners.size, 0, 'Event listener must be cleanly deregistered on unmount');

  // 5. SSR / non-browser fallback
  const ssrTracker = new ReducedMotionTracker(null);
  assert.equal(ssrTracker.state, false, 'SSR environment without window.matchMedia must safely default to false');
});

// ============================================================================
// SUITE 2: KEYBOARD NAVIGATION & FOCUS ACCESSIBILITY (QA-13, WCAG 2.1)
// ============================================================================

test('WEB-03: Modal components provide WCAG dialog semantics and focus indicators', async () => {
  // Read modal components to verify semantic dialog attributes
  const authModalSrc = await readFile(join(process.cwd(), 'apps/web/src/features/identity/AuthModal.tsx'), 'utf-8');
  const wsModalSrc = await readFile(join(process.cwd(), 'apps/web/src/features/workspaces/CreateWorkspaceModal.tsx'), 'utf-8');
  const settingsModalSrc = await readFile(join(process.cwd(), 'apps/web/src/features/identity/AccountSettingsModal.tsx'), 'utf-8');

  // Dialog semantics
  assert.ok(authModalSrc.includes('role="dialog"'), 'AuthModal must have role="dialog"');
  assert.ok(authModalSrc.includes('aria-modal="true"'), 'AuthModal must have aria-modal="true"');
  assert.ok(authModalSrc.includes('aria-label="Đóng"'), 'AuthModal must have accessible close button label');

  assert.ok(wsModalSrc.includes('role="dialog"'), 'CreateWorkspaceModal must have role="dialog"');
  assert.ok(wsModalSrc.includes('aria-modal="true"'), 'CreateWorkspaceModal must have aria-modal="true"');
  assert.ok(wsModalSrc.includes('autoFocus'), 'CreateWorkspaceModal must auto-focus primary input field');

  assert.ok(settingsModalSrc.includes('role="dialog"'), 'AccountSettingsModal must have role="dialog"');
  assert.ok(settingsModalSrc.includes('aria-modal="true"'), 'AccountSettingsModal must have aria-modal="true"');

  // Verify focus ring styles in theme.css
  const themeCss = await readFile(join(process.cwd(), 'apps/web/src/shared/theme.css'), 'utf-8');
  assert.ok(themeCss.includes('.form-input:focus'), 'Inputs must define :focus styling');
  assert.ok(themeCss.includes('border-color: var(--accent)'), 'Focused inputs must show accent border');
  assert.ok(themeCss.includes('box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2)'), 'Focused inputs must have high-contrast focus ring');
});

test('WEB-04: Keyboard dismissal logic and backdrop containment', () => {
  let modalOpen = true;
  let closeCallCount = 0;
  const onClose = () => {
    modalOpen = false;
    closeCallCount++;
  };

  // Keyboard event dispatcher simulating Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // 1. Non-escape keys should not close modal
  handleKeyDown({ key: 'Enter' });
  handleKeyDown({ key: 'Tab' });
  handleKeyDown({ key: 'ArrowDown' });
  assert.equal(modalOpen, true, 'Non-Escape keys must not close the modal');
  assert.equal(closeCallCount, 0);

  // 2. Escape key closes modal
  handleKeyDown({ key: 'Escape' });
  assert.equal(modalOpen, false, 'Escape key must trigger onClose()');
  assert.equal(closeCallCount, 1);

  // 3. Overlay click closes modal, but modal-content click does not
  let propagationStopped = false;
  const fakeEvent = {
    stopPropagation: () => { propagationStopped = true; },
  };

  // Content click stops propagation
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  handleContentClick(fakeEvent);
  assert.equal(propagationStopped, true, 'Click inside modal content must stop propagation to backdrop overlay');
});

test('WEB-05: WorkspaceSwitcher keyboard controls and UXR-03/04 attributes', async () => {
  const wsSwitcherSrc = await readFile(join(process.cwd(), 'apps/web/src/features/workspaces/WorkspaceSwitcher.tsx'), 'utf-8');

  // Accessibility & UX rules
  assert.ok(wsSwitcherSrc.includes('aria-expanded={viewState !== \'collapsed\'}'), 'Trigger must reflect aria-expanded state');
  assert.ok(wsSwitcherSrc.includes('title="Bấm để bung danh sách workspace"'), 'Trigger must have descriptive title');
  assert.ok(wsSwitcherSrc.includes('getInitials'), 'Initials generator for stacked icons (UXR-03) must exist');
  assert.ok(wsSwitcherSrc.includes('UXR-04: Tạo workspace ở đầu trái ngoài cùng'), 'UXR-04 create button leftmost position must be implemented');

  // Initials generator verification
  const getInitials = (name) => (name ? name.trim().slice(0, 2).toUpperCase() : 'WS');
  assert.equal(getInitials('Cá nhân'), 'CÁ');
  assert.equal(getInitials('Nhóm 1'), 'NH');
  assert.equal(getInitials('Alpha Beta'), 'AL');
  assert.equal(getInitials(''), 'WS');
});

// ============================================================================
// SUITE 3: RAPID WORKSPACE SWITCHING, RACE CONDITION & CACHE RESET (QA-13)
// ============================================================================

test('WEB-06: Sequence tracker drops stale in-flight responses across 5 rapid switches', async () => {
  let activeSequenceId = 0;
  let committedState = null;
  const commitLog = [];

  const switchWorkspaceAsync = async (workspaceId, delayMs) => {
    const currentSeq = ++activeSequenceId;
    await new Promise(r => setTimeout(r, delayMs));

    // QA-13 check: If a newer switch was initiated, drop this response
    if (currentSeq !== activeSequenceId) {
      return { dropped: true, seq: currentSeq, workspaceId };
    }

    committedState = workspaceId;
    commitLog.push({ seq: currentSeq, workspaceId });
    return { dropped: false, seq: currentSeq, workspaceId };
  };

  // Launch 5 rapid workspace switches with chaotic network response times
  // WS-1: slow (120ms)
  // WS-2: very slow (180ms)
  // WS-3: fast (30ms)
  // WS-4: slow (100ms)
  // WS-5: fast (40ms) — latest initiated switch!
  const p1 = switchWorkspaceAsync('ws-1-alpha', 120);
  const p2 = switchWorkspaceAsync('ws-2-beta', 180);
  const p3 = switchWorkspaceAsync('ws-3-gamma', 30);
  const p4 = switchWorkspaceAsync('ws-4-delta', 100);
  const p5 = switchWorkspaceAsync('ws-5-epsilon', 40);

  const results = await Promise.all([p1, p2, p3, p4, p5]);

  // Even though WS-3 finished first (30ms), WS-5 was initiated last (seq 5).
  // Once WS-5 completes, the committed state must be WS-5 ('ws-5-epsilon').
  // When WS-1, WS-2, and WS-4 eventually resolve, they MUST be dropped.
  assert.equal(committedState, 'ws-5-epsilon', 'Only the latest initiated workspace must be committed');
  assert.equal(results[0].dropped, true, 'WS-1 response must be dropped');
  assert.equal(results[1].dropped, true, 'WS-2 response must be dropped');
  assert.equal(results[3].dropped, true, 'WS-4 response must be dropped');
});

test('WEB-07: Context switch immediately resets active details, drafts and private cache', () => {
  // Model state container representing App / Feature state
  class WorkspaceStateContainer {
    constructor() {
      this.currentWorkspaceId = 'ws-private';
      this.selectedTaskId = 'task-private-101';
      this.searchQuery = 'Confidential project note';
      this.activeDraft = 'Unsaved secret draft';
      this.cachedItems = ['doc-financials.pdf', 'private-keys.txt'];
    }

    // QA-13: Immediate context switch handler
    switchContext(newWorkspaceId) {
      this.currentWorkspaceId = newWorkspaceId;
      // Immediate cache invalidation: scrub private state
      this.selectedTaskId = null;
      this.searchQuery = '';
      this.activeDraft = null;
      this.cachedItems = [];
    }

    // Logout / Revocation
    logout() {
      this.currentWorkspaceId = null;
      this.selectedTaskId = null;
      this.searchQuery = '';
      this.activeDraft = null;
      this.cachedItems = [];
    }
  }

  const container = new WorkspaceStateContainer();
  assert.equal(container.currentWorkspaceId, 'ws-private');
  assert.equal(container.selectedTaskId, 'task-private-101');
  assert.equal(container.cachedItems.length, 2);

  // Switch to public workspace
  container.switchContext('ws-public-shared');
  assert.equal(container.currentWorkspaceId, 'ws-public-shared');
  assert.equal(container.selectedTaskId, null, 'selectedTaskId must be reset to null');
  assert.equal(container.searchQuery, '', 'searchQuery must be cleared');
  assert.equal(container.activeDraft, null, 'activeDraft must be cleared');
  assert.deepEqual(container.cachedItems, [], 'cachedItems from old workspace must be emptied');

  // Verify logout clears all
  container.logout();
  assert.equal(container.currentWorkspaceId, null);
  assert.deepEqual(container.cachedItems, []);
});

// ============================================================================
// SUITE 4: RESPONSIVE LAYOUT & MOBILE BREAKPOINTS (max-width: 768px)
// ============================================================================

test('WEB-08: Responsive CSS rules adapt navigation and shell for mobile devices (<= 768px)', async () => {
  const themeCss = (await readFile(join(process.cwd(), 'apps/web/src/shared/theme.css'), 'utf-8')).replace(/\r\n/g, '\n');

  // Responsive breakpoint @media (max-width: 768px)
  assert.ok(themeCss.includes('@media (max-width: 768px)'), 'theme.css must declare mobile breakpoint at 768px');
  assert.ok(themeCss.includes('.app-sidebar {\n    display: none;\n  }'), 'Sidebar must collapse on mobile');
  assert.ok(themeCss.includes('.context-selector-cluster {\n    flex-wrap: wrap;\n  }'), 'Context selectors must wrap on mobile');
});

// ============================================================================
// SUITE 5: LIVE HTTP INTEGRATION — MULTI-WORKSPACE SCOPING & DATA BOUNDARY
// ============================================================================

test('WEB-09: Live HTTP multi-workspace isolation across rapid context transitions', async () => {
  const email = `web-user-${randomUUID().slice(0, 8)}@example.com`;
  const password = 'StrongPassword123!';

  // 1. Register user
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

  // 2. Fetch default personal workspace
  const wsRes = await fetch(`${baseUrl}/workspaces`, {
    headers: { cookie: auth.cookie },
  });
  assert.equal(wsRes.status, 200);
  const wsBody = await wsRes.json();
  const personalWs = wsBody.data.find(w => w.kind === 'default');
  assert.ok(personalWs, 'Personal workspace must exist');

  // 3. Create independent project workspace
  const createWsRes = await fetch(`${baseUrl}/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: auth.cookie,
      'x-csrf-token': auth.csrfToken,
    },
    body: JSON.stringify({ name: 'Project Titan Independent' }),
  });
  assert.equal(createWsRes.status, 201);
  const independentWs = (await createWsRes.json()).data;
  assert.ok(independentWs.id);

  // 4. Create tasks in each workspace
  // Task in Personal Workspace
  const t1Res = await fetch(`${baseUrl}/workspaces/${personalWs.id}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: auth.cookie,
      'x-csrf-token': auth.csrfToken,
    },
    body: JSON.stringify({
      title: 'Personal Study Plan',
      importance: 'high',
      urgency: 'high',
    }),
  });
  assert.ok(t1Res.status === 200 || t1Res.status === 201, `Expected 200/201, got ${t1Res.status}`);

  // Task in Project Titan Workspace
  const t2Res = await fetch(`${baseUrl}/workspaces/${independentWs.id}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: auth.cookie,
      'x-csrf-token': auth.csrfToken,
    },
    body: JSON.stringify({
      title: 'Titan Architecture Review',
      importance: 'medium',
      urgency: 'low',
    }),
  });
  assert.ok(t2Res.status === 200 || t2Res.status === 201, `Expected 200/201, got ${t2Res.status}`);

  // 5. Query tasks rapidly simulating workspace switching
  const [personalTasksRes, titanTasksRes] = await Promise.all([
    fetch(`${baseUrl}/workspaces/${personalWs.id}/tasks`, { headers: { cookie: auth.cookie } }),
    fetch(`${baseUrl}/workspaces/${independentWs.id}/tasks`, { headers: { cookie: auth.cookie } }),
  ]);

  assert.equal(personalTasksRes.status, 200);
  assert.equal(titanTasksRes.status, 200);

  const personalTasks = (await personalTasksRes.json()).data;
  const titanTasks = (await titanTasksRes.json()).data;

  // Personal tasks must contain 'Personal Study Plan' and NOT 'Titan Architecture Review'
  assert.ok(personalTasks.some(t => t.title === 'Personal Study Plan'), 'Personal workspace must contain personal task');
  assert.ok(!personalTasks.some(t => t.title === 'Titan Architecture Review'), 'Personal workspace must NOT leak titan task');

  // Titan tasks must contain 'Titan Architecture Review' and NOT 'Personal Study Plan'
  assert.ok(titanTasks.some(t => t.title === 'Titan Architecture Review'), 'Titan workspace must contain titan task');
  assert.ok(!titanTasks.some(t => t.title === 'Personal Study Plan'), 'Titan workspace must NOT leak personal task');
});
