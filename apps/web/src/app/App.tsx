import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../shared/theme.css';
import '../shared/feature-sync.css';
import '../shared/review-tab-ui.css';
import {
  Zap,
  CheckSquare,
  Calendar,
  BookOpen,
  Users,
  FolderKanban,
  ClipboardList,
  Settings,
  PanelLeft,
  Plus,
  Sun,
  Moon,
  Bell,
  FileText,
} from 'lucide-react';
import type { Account, Class, Workspace } from '../shared/types';
import { getMe, listClasses, listWorkspaces } from '../shared/api';
import { AuthModal } from '../features/identity/AuthModal';
import { AccountSettingsModal } from '../features/identity/AccountSettingsModal';
import { CreateWorkspaceModal } from '../features/workspaces/CreateWorkspaceModal';
import { CreateClassModal } from '../features/classes/CreateClassModal';
import { ClassMembersView } from '../features/classes/ClassMembersView';
import { ClassGroupsView } from '../features/classes/ClassGroupsView';
import { ClassSettingsView } from '../features/classes/ClassSettingsView';
import { TasksContainer } from '../features/tasks';
import { CalendarContainer } from '../features/calendar';
import { LibraryView } from '../features/library';
import { AssignmentFeature } from '../features/assignments';
import { GroupMembersView } from '../features/workspaces/GroupMembersView';
import { WorkspaceNotesView } from '../features/notes/WorkspaceNotesView';
import { PreviewHarness } from '../previews/PreviewHarness';
import { Tab01ClassMembersAdmin } from '../previews/Tab01ClassMembersAdmin';
import { Tab02ClassMembersStudent } from '../previews/Tab02ClassMembersStudent';
import { Tab03ClassGroupsAdmin } from '../previews/Tab03ClassGroupsAdmin';
import { Tab04ClassGroupsStudent } from '../previews/Tab04ClassGroupsStudent';
import { Tab05ClassSettingsAdmin } from '../previews/Tab05ClassSettingsAdmin';
import { Tab06GroupMembersOwner } from '../previews/Tab06GroupMembersOwner';
import { Tab07GroupMembersStudent } from '../previews/Tab07GroupMembersStudent';
import { Tab08TasksGantt } from '../previews/Tab08TasksGantt';
import { Tab09TasksList } from '../previews/Tab09TasksList';
import { Tab10CalendarGrid } from '../previews/Tab10CalendarGrid';
import { Tab11LibraryExplorer } from '../previews/Tab11LibraryExplorer';
import { Tab12AssignmentsTeacher } from '../previews/Tab12AssignmentsTeacher';
import { Tab13AssignmentsStudent } from '../previews/Tab13AssignmentsStudent';
import { Tab14WorkspaceNotes } from '../previews/Tab14WorkspaceNotes';

interface Tab14Item {
  id: number;
  label: string;
  badge: string;
  contextType: 'class' | 'workspace';
  targetTab: string;
  roleOverride?: 'teacher' | 'student' | 'leader' | 'member';
  taskMode?: 'gantt' | 'list';
  needsGroup?: boolean;
}

const TABS_14_LIST: Tab14Item[] = [
  { id: 1, label: 'Thành viên lớp', badge: 'Giáo viên', contextType: 'class', targetTab: 'members', roleOverride: 'teacher' },
  { id: 2, label: 'Thành viên lớp', badge: 'Học sinh', contextType: 'class', targetTab: 'members', roleOverride: 'student' },
  { id: 3, label: 'Nhóm trong lớp', badge: 'Giáo viên', contextType: 'class', targetTab: 'groups', roleOverride: 'teacher' },
  { id: 4, label: 'Nhóm trong lớp', badge: 'Học sinh', contextType: 'class', targetTab: 'groups', roleOverride: 'student' },
  { id: 5, label: 'Cài đặt lớp', badge: 'Giáo viên', contextType: 'class', targetTab: 'settings', roleOverride: 'teacher' },
  { id: 6, label: 'Thành viên nhóm', badge: 'Trưởng nhóm', contextType: 'workspace', targetTab: 'members', roleOverride: 'leader', needsGroup: true },
  { id: 7, label: 'Thành viên nhóm', badge: 'Thành viên', contextType: 'workspace', targetTab: 'members', roleOverride: 'member', needsGroup: true },
  { id: 8, label: 'Tiến độ Gantt', badge: 'Timeline', contextType: 'workspace', targetTab: 'tasks', taskMode: 'gantt' },
  { id: 9, label: 'Công việc List', badge: 'Checklist', contextType: 'workspace', targetTab: 'tasks', taskMode: 'list' },
  { id: 10, label: 'Lịch biểu', badge: 'Lưới tháng', contextType: 'workspace', targetTab: 'calendar' },
  { id: 11, label: 'Thư viện tệp', badge: 'Quản lý file', contextType: 'workspace', targetTab: 'library' },
  { id: 12, label: 'Quản lý bài giao', badge: 'Giáo viên', contextType: 'class', targetTab: 'assignments', roleOverride: 'teacher' },
  { id: 13, label: 'Bài tập của tôi', badge: 'Học sinh', contextType: 'class', targetTab: 'assignments', roleOverride: 'student' },
  { id: 14, label: 'Mục lưu ý', badge: 'Ghi chú', contextType: 'workspace', targetTab: 'notes' },
];

type AppContext =
  | { type: 'workspace'; workspaceId: string }
  | { type: 'class'; classId: string };

type ClassTab = 'members' | 'groups' | 'assignments' | 'calendar' | 'settings';
type WorkspaceTab = 'members' | 'tasks' | 'calendar' | 'library' | 'notes';

export function App() {
  const [user, setUser] = useState<Account | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [context, setContext] = useState<AppContext>({ type: 'workspace', workspaceId: '' });
  const [checkingSession, setCheckingSession] = useState(true);
  const [contextError, setContextError] = useState(false);
  const [classTab, setClassTab] = useState<ClassTab>('members');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('tasks');

  // 14-Tab integration states
  const [activeTab14, setActiveTab14] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (p) {
        const n = parseInt(p, 10);
        if (n >= 1 && n <= 14) return n;
      }
    }
    return null;
  });

  const [viewMode14, setViewMode14] = useState<'live' | 'preview'>(() => {
    if (typeof window !== 'undefined') {
      const m = new URLSearchParams(window.location.search).get('mode');
      if (m === 'preview') return 'preview';
    }
    return 'live';
  });

  const [roleOverride, setRoleOverride] = useState<'teacher' | 'student' | 'leader' | 'member' | null>(null);
  const [taskViewOverride, setTaskViewOverride] = useState<'gantt' | 'list' | null>(null);

  // Shell states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [spacePickerOpen, setSpacePickerOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  });

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  const spacePickerRef = useRef<HTMLDivElement>(null);

  // Toggle Theme Light / Dark
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('snote_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('snote_theme', 'light');
    }
  };

  // Load current session
  const checkSession = async () => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#reset=')) {
      setCheckingSession(false);
      return;
    }
    try {
      const res = await getMe();
      setUser(res.data);
      await loadContextData();
    } catch {
      setUser(null);
      setWorkspaces([]);
      setClasses([]);
    } finally {
      setCheckingSession(false);
    }
  };

  const loadContextData = async () => {
    try {
      const [wsRes, clsRes] = await Promise.all([
        listWorkspaces(),
        listClasses(),
      ]);
      const nextWorkspaces = wsRes.data ?? [];
      const nextClasses = clsRes.data ?? [];
      setWorkspaces(nextWorkspaces);
      setClasses(nextClasses);
      setContext(current => {
        if (current.type === 'workspace' && nextWorkspaces.some(ws => ws.id === current.workspaceId)) return current;
        if (current.type === 'class' && nextClasses.some(cls => cls.id === current.classId)) return current;
        const personal = nextWorkspaces.find(ws => ws.kind === 'default') ?? nextWorkspaces[0];
        if (personal) return { type: 'workspace', workspaceId: personal.id };
        if (nextClasses[0]) return { type: 'class', classId: nextClasses[0].id };
        return { type: 'workspace', workspaceId: '' };
      });
      setContextError(false);
    } catch {
      setContextError(true);
    }
  };

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setWorkspaces([]);
    setClasses([]);
    setContext({ type: 'workspace', workspaceId: '' });
    setShowSettingsModal(false);
    setMobileNavOpen(false);
  }, []);

  useEffect(() => {
    const handleResetLink = () => {
      if (!window.location.hash.startsWith('#reset=')) return;
      handleUnauthorized();
      setCheckingSession(false);
    };
    window.addEventListener('hashchange', handleResetLink);
    return () => window.removeEventListener('hashchange', handleResetLink);
  }, [handleUnauthorized]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('snote_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
    void checkSession();
  }, []);

  // Dismiss space picker on outside click or Escape key
  useEffect(() => {
    if (!spacePickerOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (spacePickerRef.current && !spacePickerRef.current.contains(e.target as Node)) {
        setSpacePickerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSpacePickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [spacePickerOpen]);

  // Dismiss mobile drawer on Escape key
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileNavOpen]);

  const activeWorkspace = context.type === 'workspace'
    ? workspaces.find(w => w.id === context.workspaceId) ?? null
    : null;

  const activeClass = context.type === 'class'
    ? classes.find(c => c.id === context.classId) ?? null
    : null;

  const canCreateClass = Boolean(user?.usages.includes('teacher'));
  const isClassOwner = Boolean(activeClass && user && activeClass.ownerId === user.id);

  const handleSelectWorkspace = (ws: Workspace) => {
    setContext({ type: 'workspace', workspaceId: ws.id });
    setWorkspaceTab('tasks');
    setSpacePickerOpen(false);
    setMobileNavOpen(false);
  };

  const handleSelectClass = (cls: Class) => {
    setContext({ type: 'class', classId: cls.id });
    setClassTab('members');
    setSpacePickerOpen(false);
    setMobileNavOpen(false);
  };

  const classGroupWs = activeClass
    ? workspaces.find(w => w.kind === 'class_group' && w.classId === activeClass.id) ?? null
    : null;

  // Space acronym for 30px circular button
  const currentSpaceInitial = context.type === 'workspace'
    ? (activeWorkspace ? activeWorkspace.name.trim().slice(0, 2).toUpperCase() : 'WS')
    : (activeClass ? activeClass.name.trim().slice(0, 2).toUpperCase() : 'LH');

  const currentSpaceFullName = context.type === 'workspace'
    ? (activeWorkspace?.name ?? 'Workspace')
    : (`Lớp: ${activeClass?.name ?? ''}`);

  const handleSelectTab14 = (tabId: number) => {
    setActiveTab14(tabId);
    const item = TABS_14_LIST.find(t => t.id === tabId);
    if (!item) return;

    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId.toString());
      if (viewMode14 === 'preview') {
        url.searchParams.set('mode', 'preview');
      } else {
        url.searchParams.delete('mode');
      }
      window.history.replaceState({}, '', url.toString());
    }

    if (item.contextType === 'class') {
      if (classes.length > 0 && (context.type !== 'class' || !activeClass)) {
        setContext({ type: 'class', classId: classes[0].id });
      }
      setClassTab(item.targetTab as ClassTab);
      setRoleOverride(item.roleOverride ?? null);
    } else {
      if (item.needsGroup) {
        const gw = workspaces.find(w => w.kind !== 'default') || workspaces[0];
        if (gw && (context.type !== 'workspace' || activeWorkspace?.id !== gw.id)) {
          setContext({ type: 'workspace', workspaceId: gw.id });
        }
      } else {
        if (workspaces.length > 0 && (context.type !== 'workspace' || !activeWorkspace)) {
          setContext({ type: 'workspace', workspaceId: workspaces[0].id });
        }
      }
      setWorkspaceTab(item.targetTab as WorkspaceTab);
      setRoleOverride(item.roleOverride ?? null);
      if (item.taskMode) {
        setTaskViewOverride(item.taskMode);
      }
    }
  };

  useEffect(() => {
    if (activeTab14 && (classes.length > 0 || workspaces.length > 0)) {
      const item = TABS_14_LIST.find(t => t.id === activeTab14);
      if (!item) return;
      if (item.contextType === 'class' && classes.length > 0) {
        if (context.type !== 'class') {
          setContext({ type: 'class', classId: classes[0].id });
        }
        setClassTab(item.targetTab as ClassTab);
        setRoleOverride(item.roleOverride ?? null);
      } else if (item.contextType === 'workspace' && workspaces.length > 0) {
        if (item.needsGroup) {
          const gw = workspaces.find(w => w.kind !== 'default') || workspaces[0];
          if (gw) setContext({ type: 'workspace', workspaceId: gw.id });
        } else if (context.type !== 'workspace') {
          setContext({ type: 'workspace', workspaceId: workspaces[0].id });
        }
        setWorkspaceTab(item.targetTab as WorkspaceTab);
        setRoleOverride(item.roleOverride ?? null);
        if (item.taskMode) setTaskViewOverride(item.taskMode);
      }
    }
  }, [classes.length, workspaces.length, activeTab14]);

  const renderPreview14Component = (tabId: number) => {
    switch (tabId) {
      case 1: return <Tab01ClassMembersAdmin />;
      case 2: return <Tab02ClassMembersStudent />;
      case 3: return <Tab03ClassGroupsAdmin />;
      case 4: return <Tab04ClassGroupsStudent />;
      case 5: return <Tab05ClassSettingsAdmin />;
      case 6: return <Tab06GroupMembersOwner />;
      case 7: return <Tab07GroupMembersStudent />;
      case 8: return <Tab08TasksGantt />;
      case 9: return <Tab09TasksList />;
      case 10: return <Tab10CalendarGrid />;
      case 11: return <Tab11LibraryExplorer />;
      case 12: return <Tab12AssignmentsTeacher />;
      case 13: return <Tab13AssignmentsStudent />;
      case 14: return <Tab14WorkspaceNotes />;
      default: return <Tab01ClassMembersAdmin />;
    }
  };

  const isHarnessMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('preview') === 'harness' ||
    new URLSearchParams(window.location.search).get('mode') === 'preview_harness'
  );

  if (isHarnessMode) {
    return <PreviewHarness />;
  }

  if (checkingSession) {
    return <main className="auth-page"><div className="auth-page-status" role="status">Đang mở không gian SNOTE…</div></main>;
  }

  if (!user) {
    return (
      <AuthModal
        isOpen
        presentation="page"
        onAuthenticated={account => {
          setUser(account);
          void loadContextData();
        }}
      />
    );
  }

  return (
    <div className="app-shell v2-shell">
      {/* ===================================================================
          2. SIDEBAR (aside): Rộng 260px (Co lại 56px thành cột icon tính năng)
          =================================================================== */}
      <aside
        id="app-sidebar"
        className={`app-sidebar v2-sidebar ${sidebarCollapsed ? 'sidebar-collapsed desktop-collapsed' : ''} ${mobileNavOpen ? 'mobile-open' : ''}`}
      >
        {/* 3.1 Header Sidebar: Chiều cao 56px (Mở rộng) hoặc Cột Icon Top (Thu gọn) */}
        <div className="sb-header" ref={spacePickerRef}>
          {sidebarCollapsed ? (
            <>
              {/* Nút mở rộng Sidebar: Nằm TRÊN CÙNG của cột icon thu gọn (chuẩn xác theo mẫu ảnh) */}
              <button
                type="button"
                className="sb-toggle-btn collapsed-top-toggle"
                onClick={() => setSidebarCollapsed(false)}
                title="Mở rộng thanh điều hướng"
                aria-label="Mở rộng thanh điều hướng"
              >
                <PanelLeft size={18} />
              </button>

              {/* Nút Không gian / Lớp học: Dưới nút toggle, dạng khối bo góc có nền hover */}
              <div className="sb-space-cluster">
                <div
                  className="sb-blur-stack"
                  onClick={() => setSpacePickerOpen(!spacePickerOpen)}
                  title={`Không gian hiện tại: ${currentSpaceFullName} (Bấm để đổi)`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSpacePickerOpen(!spacePickerOpen);
                  }}
                >
                  <div className="sb-top-btn" aria-label={`Không gian hiện tại: ${currentSpaceFullName}`}>
                    {currentSpaceInitial}
                  </div>
                </div>

                {/* Dải chọn nhanh trải ngang [SB-POP] mở rộng sang phải của sb-top-btn */}
                {spacePickerOpen && (
                  <div className="sb-pop-strip pop-from-collapsed" role="menu">
                    <div className="pop-itm-wrapper">
                      <button
                        type="button"
                        className="pop-itm-btn pop-add-btn"
                        onClick={() => {
                          setSpacePickerOpen(false);
                          if (canCreateClass) setShowCreateClassModal(true);
                          else setShowCreateWsModal(true);
                        }}
                        title="Thêm mới không gian..."
                      >
                        <Plus size={16} />
                      </button>
                      <div className="pop-lbl-tooltip">Thêm mới...</div>
                    </div>

                    {workspaces.map(ws => (
                      <div key={ws.id} className="pop-itm-wrapper">
                        <button
                          type="button"
                          className={`pop-itm-btn ${context.type === 'workspace' && activeWorkspace?.id === ws.id ? 'active' : ''}`}
                          onClick={() => handleSelectWorkspace(ws)}
                        >
                          {ws.name.trim().slice(0, 2).toUpperCase()}
                        </button>
                        <div className="pop-lbl-tooltip">{ws.name}</div>
                      </div>
                    ))}

                    {classes.map(cls => (
                      <div key={cls.id} className="pop-itm-wrapper">
                        <button
                          type="button"
                          className={`pop-itm-btn ${context.type === 'class' && activeClass?.id === cls.id ? 'active' : ''}`}
                          onClick={() => handleSelectClass(cls)}
                        >
                          {cls.name.trim().slice(0, 2).toUpperCase()}
                        </button>
                        <div className="pop-lbl-tooltip">Lớp {cls.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Khi mở rộng: sb-top-btn ở bên trái, 2 blur chạy sang phải, toggle btn ở bên phải */}
              <div className="sb-space-cluster">
                <div
                  className="sb-blur-stack"
                  onClick={() => setSpacePickerOpen(!spacePickerOpen)}
                  title="Bấm để mở rộng dải chọn Không gian / Lớp học"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSpacePickerOpen(!spacePickerOpen);
                  }}
                >
                  <div className="sb-top-btn" aria-label={`Không gian hiện tại: ${currentSpaceFullName}`}>
                    {currentSpaceInitial}
                  </div>

                  {!spacePickerOpen && (
                    <div className="sb-blurs-track">
                      <div className="sb-blur-circle sb-blur-1" aria-hidden="true" />
                      <div className="sb-blur-circle sb-blur-2" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {spacePickerOpen && (
                  <div className="sb-pop-strip" role="menu">
                    <div className="pop-itm-wrapper">
                      <button
                        type="button"
                        className="pop-itm-btn pop-add-btn"
                        onClick={() => {
                          setSpacePickerOpen(false);
                          if (canCreateClass) setShowCreateClassModal(true);
                          else setShowCreateWsModal(true);
                        }}
                        title="Thêm mới không gian..."
                      >
                        <Plus size={16} />
                      </button>
                      <div className="pop-lbl-tooltip">Thêm mới...</div>
                    </div>

                    {workspaces.map(ws => (
                      <div key={ws.id} className="pop-itm-wrapper">
                        <button
                          type="button"
                          className={`pop-itm-btn ${context.type === 'workspace' && activeWorkspace?.id === ws.id ? 'active' : ''}`}
                          onClick={() => handleSelectWorkspace(ws)}
                        >
                          {ws.name.trim().slice(0, 2).toUpperCase()}
                        </button>
                        <div className="pop-lbl-tooltip">{ws.name}</div>
                      </div>
                    ))}

                    {classes.map(cls => (
                      <div key={cls.id} className="pop-itm-wrapper">
                        <button
                          type="button"
                          className={`pop-itm-btn ${context.type === 'class' && activeClass?.id === cls.id ? 'active' : ''}`}
                          onClick={() => handleSelectClass(cls)}
                        >
                          {cls.name.trim().slice(0, 2).toUpperCase()}
                        </button>
                        <div className="pop-lbl-tooltip">Lớp {cls.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="sb-toggle-btn"
                onClick={() => setSidebarCollapsed(true)}
                title="Thu gọn thanh điều hướng"
                aria-label="Thu gọn thanh điều hướng"
              >
                <PanelLeft size={16} />
              </button>
            </>
          )}
        </div>

        {/* Danh mục điều hướng: Mỗi mục cao 36px, khi thu gọn căn giữa icon chuẩn 18px */}
        <div className="sb-body">
          {/* CẤU HÌNH 1: WORKSPACE CÁ NHÂN */}
          {context.type === 'workspace' && activeWorkspace?.kind === 'default' && (
            <>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('tasks')}
                title="Công việc"
              >
                <CheckSquare size={18} className="nav-block-icon" />
                <span>Công việc</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('calendar')}
                title="Lịch trình"
              >
                <Calendar size={18} className="nav-block-icon" />
                <span>Lịch trình</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'library' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('library')}
                title="Thư viện"
              >
                <BookOpen size={18} className="nav-block-icon" />
                <span>Thư viện</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'notes' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('notes')}
                title="Ghi chú"
              >
                <FileText size={18} className="nav-block-icon" />
                <span>Ghi chú</span>
              </button>
            </>
          )}

          {/* CẤU HÌNH 2: WORKSPACE NHÓM */}
          {context.type === 'workspace' && activeWorkspace && activeWorkspace.kind !== 'default' && (
            <>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'members' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('members')}
                title="Thành viên"
              >
                <Users size={18} className="nav-block-icon" />
                <span>Thành viên</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('tasks')}
                title="Công việc"
              >
                <CheckSquare size={18} className="nav-block-icon" />
                <span>Công việc</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('calendar')}
                title="Lịch trình"
              >
                <Calendar size={18} className="nav-block-icon" />
                <span>Lịch trình</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'library' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('library')}
                title="Thư viện"
              >
                <BookOpen size={18} className="nav-block-icon" />
                <span>Thư viện</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${workspaceTab === 'notes' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('notes')}
                title="Ghi chú"
              >
                <FileText size={18} className="nav-block-icon" />
                <span>Ghi chú</span>
              </button>
            </>
          )}

          {/* CẤU HÌNH 3A: LỚP (GIÁO VIÊN) */}
          {context.type === 'class' && isClassOwner && (
            <>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'members' ? 'active' : ''}`}
                onClick={() => setClassTab('members')}
                title="Thành viên"
              >
                <Users size={18} className="nav-block-icon" />
                <span>Thành viên</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'groups' ? 'active' : ''}`}
                onClick={() => setClassTab('groups')}
                title="Nhóm trong lớp"
              >
                <FolderKanban size={18} className="nav-block-icon" />
                <span>Nhóm trong lớp</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setClassTab('assignments')}
                title="Bài giao"
              >
                <ClipboardList size={18} className="nav-block-icon" />
                <span>Bài giao</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setClassTab('calendar')}
                title="Lịch lớp"
              >
                <Calendar size={18} className="nav-block-icon" />
                <span>Lịch lớp</span>
              </button>
              {isClassOwner && (
                <button
                  type="button"
                  className={`nav-block-item ${classTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setClassTab('settings')}
                  title="Cài đặt lớp"
                >
                  <Settings size={18} className="nav-block-icon" />
                  <span>Cài đặt lớp</span>
                </button>
              )}
            </>
          )}

          {/* CẤU HÌNH 3B: LỚP (HỌC SINH) */}
          {context.type === 'class' && !isClassOwner && (
            <>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'members' ? 'active' : ''}`}
                onClick={() => setClassTab('members')}
                title="Thành viên"
              >
                <Users size={18} className="nav-block-icon" />
                <span>Thành viên</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'groups' ? 'active' : ''}`}
                onClick={() => setClassTab('groups')}
                title="Nhóm trong lớp"
              >
                <FolderKanban size={18} className="nav-block-icon" />
                <span>Nhóm trong lớp</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setClassTab('assignments')}
                title="Bài giao"
              >
                <ClipboardList size={18} className="nav-block-icon" />
                <span>Bài giao</span>
              </button>
              <button
                type="button"
                className={`nav-block-item ${classTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setClassTab('calendar')}
                title="Lịch lớp"
              >
                <Calendar size={18} className="nav-block-icon" />
                <span>Lịch lớp</span>
              </button>
            </>
          )}

          {/* MỤC LƯU Ý: THÔNG BÁO CỦA TOÀN HỆ THỐNG (Header + Content Box) */}
          <div className="sb-system-notice-container">
            {!sidebarCollapsed ? (
              <>
                <div className="sb-notice-header">
                  <div className="sb-notice-header-left">
                    <Bell size={13} className="sb-notice-header-icon" />
                    <span>Mục lưu ý</span>
                  </div>
                  <span className="sb-notice-badge">Hệ thống</span>
                </div>
                <div className="sb-notice-content-box">
                  <div className="sb-notice-title">Thông báo nền tảng v2</div>
                  <div className="sb-notice-body">
                    Hệ thống đã chuẩn hóa kiến trúc giao diện màu lạnh, hỗ trợ đồng bộ theo thời gian thực.
                  </div>
                  <div className="sb-notice-footer">
                    <span className="sb-notice-time">Toàn hệ thống</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="sb-notice-collapsed-icon" title="Mục lưu ý toàn hệ thống">
                <Bell size={18} />
                <span className="sb-notice-dot" />
              </div>
            )}
          </div>
        </div>

        {/* 3.1 Footer Sidebar: Chiều cao 56px, chỉ có theme-toggle-btn và sb-avt-circle */}
        <div className="sb-footer">
          <a
            href="/?tab=1"
            className="theme-toggle-btn"
            title="Xem 14 Tab Giao diện (Mẫu ảnh chụp)"
            aria-label="Xem 14 Tab Giao diện"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'inherit' }}
          >
            14T
          </a>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Chuyển sang Chế độ sáng (Light Mode)" : "Chuyển sang Chế độ tối (Dark Mode)"}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            className="sb-avt-circle"
            onClick={() => setShowSettingsModal(true)}
            title="Tài khoản & Cài đặt hệ thống"
            aria-label="Tài khoản & Cài đặt hệ thống"
          >
            {user.usages.includes('teacher') ? 'G' : 'H'}
          </button>
        </div>
      </aside>

      {/* Lớp phủ mờ nền khi mở Drawer trên Tablet/Mobile */}
      {mobileNavOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===================================================================
          2. MAIN CONTENT VIEWPORT: Chiều cao 100vh, flex: 1
          =================================================================== */}
      <main className="main-content-viewport">
        {/* Nút mở rộng Sidebar nổi (khi Sidebar bị thu gọn hoặc trên mobile) */}
        {(sidebarCollapsed || mobileNavOpen === false) && (
          <button
            type="button"
            className={`canvas-floating-toggle ${!sidebarCollapsed ? 'mobile-only-toggle' : ''}`}
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setMobileNavOpen(true);
              } else {
                setSidebarCollapsed(false);
              }
            }}
            title="Mở rộng thanh điều hướng"
            aria-label="Mở rộng thanh điều hướng"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {/* Nội dung bên trong Main Viewport: Cuộn dọc trực tiếp (overflow-y: auto) */}
        <div className="main-content-canvas">
          {/* ===================================================================
              14 TAB QUICK SELECTOR & ROLE / LIVE SWITCHER
              =================================================================== */}
          <div
            className="tab14-top-bar"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  14 Tab Tính Năng:
                </span>
                {activeTab14 && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    #{activeTab14 < 10 ? `0${activeTab14}` : activeTab14} · {TABS_14_LIST.find(t => t.id === activeTab14)?.label} ({TABS_14_LIST.find(t => t.id === activeTab14)?.badge})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Mode Toggle: Live API vs Preview Mock */}
                <div style={{ display: 'inline-flex', padding: '2px', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border-divider)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode14('live');
                      if (typeof window !== 'undefined' && window.history) {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('mode');
                        window.history.replaceState({}, '', url.toString());
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 0,
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: viewMode14 === 'live' ? 'var(--text-primary)' : 'transparent',
                      color: viewMode14 === 'live' ? 'var(--bg-app)' : 'var(--text-secondary)',
                      transition: 'all 120ms ease',
                    }}
                  >
                    ● Dữ liệu thật (Live API)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode14('preview');
                      if (typeof window !== 'undefined' && window.history) {
                        const url = new URL(window.location.href);
                        url.searchParams.set('mode', 'preview');
                        window.history.replaceState({}, '', url.toString());
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 0,
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: viewMode14 === 'preview' ? 'var(--text-primary)' : 'transparent',
                      color: viewMode14 === 'preview' ? 'var(--bg-app)' : 'var(--text-secondary)',
                      transition: 'all 120ms ease',
                    }}
                  >
                    ◈ Mẫu thiết kế (Preview Mock)
                  </button>
                </div>

                <a
                  href={`/?preview=harness${activeTab14 ? `&tab=${activeTab14}` : ''}`}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    whiteSpace: 'nowrap',
                  }}
                  title="Mở bảng Preview Harness chuyên dụng"
                >
                  Harness ↗
                </a>
              </div>
            </div>

            {/* 14 Tabs horizontal scrollable list */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '2px',
              }}
            >
              {TABS_14_LIST.map(tab => {
                const isActive = activeTab14 === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab14(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--text-primary)' : 'var(--border-divider)',
                      background: isActive ? 'var(--surface-hover)' : 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 100ms ease',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '10px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      #{tab.id < 10 ? `0${tab.id}` : tab.id}
                    </span>
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: isActive ? 'var(--surface-card)' : 'var(--surface-hover)',
                        border: '1px solid var(--border-divider)',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {viewMode14 === 'preview' && activeTab14 ? (
            /* Nội dung Preview Mẫu thiết kế */
            <div className="section-box feature-page" style={{ padding: '20px 24px' }}>
              {renderPreview14Component(activeTab14)}
            </div>
          ) : context.type === 'class' && activeClass ? (
            /* Nội dung Context Lớp học */
            <div className="section-box feature-page" data-feature={classTab}>
              {classTab === 'members' && (
                <ClassMembersView
                  key={activeClass.id}
                  cls={activeClass}
                  currentUser={user}
                  viewRole={roleOverride === 'teacher' || roleOverride === 'student' ? roleOverride : undefined}
                  onClassUpdated={updated => {
                    setClasses(classes.map(c => (c.id === updated.id ? updated : c)));
                  }}
                />
              )}
              {classTab === 'groups' && (
                <ClassGroupsView
                  key={activeClass.id}
                  cls={activeClass}
                  currentUser={user}
                  viewRole={roleOverride === 'teacher' || roleOverride === 'student' ? roleOverride : undefined}
                  accessibleGroupIds={workspaces.filter(ws => ws.classId === activeClass.id).map(ws => ws.id)}
                  onMembershipChanged={() => void loadContextData()}
                  onOpenGroupWorkspace={groupWs => {
                    setWorkspaces(current => current.some(ws => ws.id === groupWs.id) ? current : [...current, groupWs]);
                    handleSelectWorkspace(groupWs);
                  }}
                />
              )}
              {classTab === 'settings' && (
                <ClassSettingsView
                  key={activeClass.id}
                  cls={activeClass}
                  currentUser={user}
                  onClassUpdated={updated => {
                    setClasses(classes.map(c => (c.id === updated.id ? updated : c)));
                  }}
                />
              )}
              {classTab === 'assignments' && (
                <AssignmentFeature
                  key={activeClass.id}
                  classId={activeClass.id}
                  classTimeZone={activeClass.timeZone}
                  isTeacher={roleOverride === 'teacher' ? true : roleOverride === 'student' ? false : isClassOwner}
                  activeWorkspaceId={classGroupWs?.id}
                />
              )}
              {classTab === 'calendar' && (
                <CalendarContainer key={activeClass.id} scopeType="class" scopeId={activeClass.id} eventTimeZone={activeClass.timeZone} />
              )}
            </div>
          ) : activeWorkspace ? (
            /* Nội dung Context Workspace */
            <div className="section-box feature-page" data-feature={workspaceTab}>
              <div className="view-header">
                <div>
                  <h1 className="view-title">{activeWorkspace.name}</h1>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Workspace · {activeWorkspace.kind === 'default' ? 'Cá nhân mặc định' : activeWorkspace.kind === 'class_group' ? 'Nhóm trong lớp' : 'Độc lập'}
                  </span>
                </div>
              </div>

              {workspaceTab === 'tasks' && (
                <TasksContainer
                  key={activeWorkspace.id}
                  workspaceId={activeWorkspace.id}
                  isPersonalWorkspace={activeWorkspace.kind === 'default'}
                  initialViewMode={taskViewOverride ?? undefined}
                  onUnauthorized={handleUnauthorized}
                />
              )}
              {workspaceTab === 'calendar' && (
                <CalendarContainer key={activeWorkspace.id} scopeType="workspace" scopeId={activeWorkspace.id} eventTimeZone={activeWorkspace.timeZone} />
              )}
              {workspaceTab === 'library' && (
                <LibraryView
                  key={activeWorkspace.id}
                  workspaceId={activeWorkspace.id}
                  isPersonalWorkspace={activeWorkspace.kind === 'default'}
                  actorId={user?.id}
                />
              )}
              {workspaceTab === 'members' && (
                <GroupMembersView
                  workspace={activeWorkspace}
                  currentUser={user}
                  classOwnerId={classes.find(cls => cls.id === activeWorkspace.classId)?.ownerId}
                  viewRole={roleOverride === 'leader' || roleOverride === 'member' ? roleOverride : undefined}
                  onMembershipChanged={() => void loadContextData()}
                />
              )}
              {workspaceTab === 'notes' && (
                <WorkspaceNotesView key={activeWorkspace.id} workspaceId={activeWorkspace.id} actorId={user?.id} />
              )}
            </div>
          ) : (
            <div className="section-box" style={{ textAlign: 'center', padding: '40px 0' }}>
              <p>{contextError ? 'Không thể tải không gian làm việc. Vui lòng tải lại trang.' : 'Đang tải dữ liệu không gian làm việc...'}</p>
            </div>
          )}
        </div>
      </main>

      {/* ===================================================================
          MODALS
          =================================================================== */}
      <AccountSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          account={user}
          onUpdated={updated => setUser(updated)}
          onLoggedOut={handleUnauthorized}
        />

      <CreateWorkspaceModal
        isOpen={showCreateWsModal}
        onClose={() => setShowCreateWsModal(false)}
        onCreated={ws => {
          setWorkspaces([...workspaces, ws]);
          handleSelectWorkspace(ws);
        }}
      />

      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        onCreated={cls => {
          setClasses([...classes, cls]);
          handleSelectClass(cls);
        }}
      />
    </div>
  );
}
