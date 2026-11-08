import React, { useEffect, useState } from 'react';
import '../shared/theme.css';
import {
  Zap,
  CheckSquare,
  Calendar,
  BookOpen,
  Users,
  FolderKanban,
  ClipboardList,
  Settings,
  Mail,
  GraduationCap,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Menu,
  X,
  PanelLeft,
  User,
  Plus,
  Mic,
  SquarePen,
} from 'lucide-react';
import type { Account, Class, Workspace } from '../shared/types';
import { getMe, listClasses, listWorkspaces, getMyInvitations, login, changeUsages, register } from '../shared/api';
import { AuthModal } from '../features/identity/AuthModal';
import { AccountSettingsModal } from '../features/identity/AccountSettingsModal';
import { WorkspaceSwitcher } from '../features/workspaces/WorkspaceSwitcher';
import { ClassSelector } from '../features/classes/ClassSelector';
import { ClassMembersView } from '../features/classes/ClassMembersView';
import { ClassGroupsView } from '../features/classes/ClassGroupsView';
import { ClassSettingsView } from '../features/classes/ClassSettingsView';
import { TasksContainer } from '../features/tasks';
import { TaskApiClient } from '../features/tasks/api';
import { CalendarContainer } from '../features/calendar';
import { LibraryView } from '../features/library';
import { AssignmentFeature } from '../features/assignments';

type AppContext =
  | { type: 'workspace'; workspaceId: string }
  | { type: 'class'; classId: string };

type ClassTab = 'members' | 'groups' | 'assignments' | 'calendar' | 'settings';
type WorkspaceTab = 'tasks' | 'calendar' | 'library';

export function App() {
  const [user, setUser] = useState<Account | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [context, setContext] = useState<AppContext>({ type: 'workspace', workspaceId: 'default' });
  const [classTab, setClassTab] = useState<ClassTab>('members');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('tasks');
  const [pendingInvCount, setPendingInvCount] = useState(0);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePersona, setActivePersona] = useState<'student' | 'teacher'>(() => {
    return (localStorage.getItem('snote_active_persona') as 'student' | 'teacher') || 'student';
  });

  const handleSwitchPersona = async (persona: 'student' | 'teacher') => {
    setActivePersona(persona);
    localStorage.setItem('snote_active_persona', persona);

    if (user && persona === 'teacher' && !user.usages.includes('teacher')) {
      try {
        const res = await changeUsages([...user.usages, 'teacher'], user.version);
        setUser(res.data);
      } catch (err) {
        console.error('Auto-grant teacher usage error:', err);
      }
    }
  };

  const [composerText, setComposerText] = useState('');
  const [composerSubmitting, setComposerSubmitting] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const handleComposerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = composerText.trim();
    if (!query || composerSubmitting) return;

    const lower = query.toLowerCase();
    if (lower.includes('lịch') || lower.includes('calendar') || lower.includes('hẹn')) {
      if (context.type === 'class') {
        setClassTab('calendar');
      } else {
        setWorkspaceTab('calendar');
      }
      setComposerText('');
      return;
    }
    if (lower.includes('thư viện') || lower.includes('tài liệu') || lower.includes('file')) {
      if (context.type !== 'workspace') {
        const defWs = workspaces.find(w => w.kind === 'default') || workspaces[0];
        if (defWs) handleSelectWorkspace(defWs);
      }
      setWorkspaceTab('library');
      setComposerText('');
      return;
    }
    if (lower.includes('bài tập') || lower.includes('bài giao') || lower.includes('nộp bài') || lower.includes('chấm điểm')) {
      if (context.type !== 'class' && activeClass) {
        handleSelectClass(activeClass);
      }
      setClassTab('assignments');
      setComposerText('');
      return;
    }
    if (lower.includes('lớp') || lower.includes('thành viên') || lower.includes('nhóm')) {
      if (context.type !== 'class' && activeClass) {
        handleSelectClass(activeClass);
      }
      setClassTab('members');
      setComposerText('');
      return;
    }

    // Default action: Create a new task in active workspace
    const targetWs = activeWorkspace || workspaces.find(w => w.kind === 'default') || workspaces[0];
    if (targetWs) {
      setComposerSubmitting(true);
      try {
        const taskApi = new TaskApiClient();
        await taskApi.createTask(targetWs.id, {
          title: query,
          importance: lower.includes('khẩn') || lower.includes('gấp') || lower.includes('p1') ? 'high' : 'medium',
        });
        setComposerText('');
        if (context.type !== 'workspace') {
          handleSelectWorkspace(targetWs);
        }
        setWorkspaceTab('tasks');
        setTaskRefreshKey(k => k + 1);
      } catch (err) {
        console.error('Error creating task from composer:', err);
      } finally {
        setComposerSubmitting(false);
      }
    }
  };

  // Load current session
  const checkSession = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
      await loadContextData();
    } catch {
      setUser(null);
    }
  };

  const loadContextData = async () => {
    try {
      const [wsRes, clsRes, invRes] = await Promise.all([
        listWorkspaces(),
        listClasses(),
        getMyInvitations(),
      ]);
      setWorkspaces(wsRes.data);
      setClasses(clsRes.data);
      setPendingInvCount(invRes.data.filter(i => i.status === 'pending').length);

      // Default to personal workspace if none selected
      if (wsRes.data.length > 0 && context.type === 'workspace' && context.workspaceId === 'default') {
        const defWs = wsRes.data.find(w => w.kind === 'default') || wsRes.data[0];
        setContext({ type: 'workspace', workspaceId: defWs.id });
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    void checkSession();
  }, []);

  // QA-13: Fast context switching - resolve active entities cleanly without leaking stale data
  const activeWorkspace = context.type === 'workspace'
    ? workspaces.find(w => w.id === context.workspaceId) ?? null
    : null;

  const activeClass = context.type === 'class'
    ? classes.find(c => c.id === context.classId) ?? null
    : null;

  const isClassOwner = activeClass && user && activeClass.ownerId === user.id;

  const handleSnoteLogoClick = () => {
    // UXR-01: Snote button returns to personal workspace / my tasks
    const defWs = workspaces.find(w => w.kind === 'default') || workspaces[0];
    if (defWs) {
      setContext({ type: 'workspace', workspaceId: defWs.id });
      setWorkspaceTab('tasks');
    }
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setContext({ type: 'workspace', workspaceId: ws.id });
    setWorkspaceTab('tasks');
    setMobileNavOpen(false);
  };

  const handleSelectClass = (cls: Class) => {
    setContext({ type: 'class', classId: cls.id });
    setClassTab('members'); // CUXC-06: Default to Members tab
    setMobileNavOpen(false);
  };

  const handleQuickDemoLogin = async (roleToEnter: 'student' | 'teacher') => {
    const demoEmail = roleToEnter === 'teacher'
      ? (import.meta.env.VITE_DEMO_TEACHER_EMAIL || 'teacher.demo@snote.edu.vn')
      : (import.meta.env.VITE_DEMO_STUDENT_EMAIL || 'student.demo@snote.edu.vn');
    const demoPass = import.meta.env.VITE_DEMO_PASSWORD || 'DemoPassword2026!';

    try {
      const res = await login({ email: demoEmail, password: demoPass });
      setUser(res.data);
      if (!res.data.usages.includes(roleToEnter)) {
        try {
          const up = await changeUsages([...res.data.usages, roleToEnter], res.data.version);
          setUser(up.data);
        } catch {}
      }
      void handleSwitchPersona(roleToEnter);
      await checkSession();
    } catch {
      try {
        const regRes = await register({
          email: demoEmail,
          password: demoPass,
          usages: [roleToEnter],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh',
        });
        setUser(regRes.data);
        void handleSwitchPersona(roleToEnter);
        await checkSession();
      } catch (err: any) {
        console.error('Quick demo login error:', err);
      }
    }
  };

  return (
    <div className="app-shell">
      {/* Top Application Header */}
      <header className="app-header">
        <div className="header-left">
          {user && (
            <>
              <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
                aria-label={sidebarCollapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
              >
                <PanelLeft size={18} />
              </button>
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => setMobileNavOpen(open => !open)}
                aria-label={mobileNavOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}
                aria-expanded={mobileNavOpen}
                aria-controls="app-sidebar"
              >
                {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </>
          )}
          <button className="brand-btn" onClick={handleSnoteLogoClick} title="Về Việc của tôi (Personal)">
            <Zap className="ss-icon-brand" />
            <span>Snote</span>
          </button>

          {/* Context Selector Cluster: Workspace & Class side-by-side (UXR-03 / CUXC-01) */}
          {user && (
            <div className="context-selector-cluster">
              <WorkspaceSwitcher
                workspaces={workspaces}
                classes={classes}
                activeWorkspace={activeWorkspace}
                onSelectWorkspace={handleSelectWorkspace}
                onWorkspaceCreated={ws => setWorkspaces([...workspaces, ws])}
              />

              <ClassSelector
                classes={classes}
                activeClass={activeClass}
                currentUser={user}
                isTeacher={Boolean(activePersona === 'teacher' || user.usages.includes('teacher'))}
                onSelectClass={handleSelectClass}
                onClassCreated={cls => setClasses([...classes, cls])}
                onOpenSettings={() => setShowSettingsModal(true)}
              />
            </div>
          )}
        </div>

        {/* ChatGPT Center Mode Toggle Pill */}
        {user && (
          <div className="header-center">
            <div className="chatgpt-mode-toggle" role="group" aria-label="Chế độ không gian">
              <button
                type="button"
                className={`chatgpt-mode-btn ${context.type === 'workspace' ? 'active' : ''}`}
                onClick={() => {
                  const defWs = workspaces.find(w => w.kind === 'default') || workspaces[0];
                  if (defWs) handleSelectWorkspace(defWs);
                }}
                aria-pressed={context.type === 'workspace'}
              >
                <Zap size={13} />
                <span>Việc của tôi</span>
              </button>
              <button
                type="button"
                className={`chatgpt-mode-btn ${context.type === 'class' ? 'active' : ''}`}
                onClick={() => {
                  if (activeClass) {
                    handleSelectClass(activeClass);
                  } else if (classes.length > 0) {
                    handleSelectClass(classes[0]);
                  } else {
                    setShowSettingsModal(true);
                  }
                }}
                aria-pressed={context.type === 'class'}
              >
                <GraduationCap size={13} />
                <span>Không gian Lớp</span>
              </button>
            </div>
          </div>
        )}

        <div className="header-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {pendingInvCount > 0 && (
                <span className="badge badge-warning" title={`${pendingInvCount} lời mời đang chờ`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={13} />
                  <span>{pendingInvCount} lời mời</span>
                </span>
              )}

              {/* Interactive Active Persona Switcher */}
              <div className="persona-switcher-cluster" role="radiogroup" aria-label="Tư cách làm việc">
                <button
                  type="button"
                  className={`persona-switch-btn ${activePersona === 'student' ? 'active' : ''}`}
                  onClick={() => void handleSwitchPersona('student')}
                  aria-checked={activePersona === 'student'}
                  role="radio"
                  title="Chuyển sang tư cách Học sinh (Nộp bài, xem bài tập)"
                >
                  <User size={13} />
                  <span>Học sinh</span>
                </button>
                <button
                  type="button"
                  className={`persona-switch-btn ${activePersona === 'teacher' ? 'active' : ''}`}
                  onClick={() => void handleSwitchPersona('teacher')}
                  aria-checked={activePersona === 'teacher'}
                  role="radio"
                  title="Chuyển sang tư cách Giáo viên (Tạo lớp, giao bài, chấm điểm)"
                >
                  <GraduationCap size={13} />
                  <span>Giáo viên</span>
                </button>
              </div>

              {/* ChatGPT Style User Pill */}
              <button
                type="button"
                className="chatgpt-user-pill"
                onClick={() => setShowSettingsModal(true)}
                title={`Tài khoản: ${user.id} (Bấm để mở cài đặt)`}
              >
                <div className="chatgpt-avatar">
                  {activePersona === 'teacher' ? 'G' : 'H'}
                </div>
                <span className="chatgpt-user-email">
                  {localStorage.getItem('snote_user_alias') || `ID: ${user.id.slice(0, 8)}...`}
                </span>
                <Settings size={14} className="chatgpt-settings-icon" />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAuthModal(true)}>
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="app-body">
        {/* Sidebar Navigation */}
        {user && <aside
          id="app-sidebar"
          className={`app-sidebar ${sidebarCollapsed ? 'desktop-collapsed' : ''} ${mobileNavOpen ? 'mobile-open' : ''}`}
          onClick={event => {
            if ((event.target as HTMLElement).closest('button')) setMobileNavOpen(false);
          }}
        >
          {/* ChatGPT Sidebar Top Action Button */}
          <button
            type="button"
            className="chatgpt-new-action-btn"
            onClick={() => {
              const defWs = workspaces.find(w => w.kind === 'default') || workspaces[0];
              if (defWs) handleSelectWorkspace(defWs);
              setWorkspaceTab('tasks');
              const el = document.getElementById('chatgpt-composer-input');
              if (el) el.focus();
            }}
            title="Thêm nhanh công việc hoặc ghi chú mới"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <SquarePen size={15} />
              <span>Thêm việc mới</span>
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ink-muted)', background: 'var(--surface-raised)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
              Nhanh
            </span>
          </button>

          <div className="sidebar-nav-group">
            <div className="sidebar-section-label">
              {context.type === 'workspace' ? 'KHÔNG GIAN LÀM VIỆC' : `LỚP HỌC: ${activeClass?.name ?? ''}`}
            </div>
            {context.type === 'workspace' ? (
              /* Workspace Context: 3 features (NAV-04, UXR-02) */
              <>
                <button
                  className={`nav-item-btn ${workspaceTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('tasks')}
                >
                  <CheckSquare size={16} />
                  <span>Công việc</span>
                </button>
                <button
                  className={`nav-item-btn ${workspaceTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('calendar')}
                >
                  <Calendar size={16} />
                  <span>Lịch trình</span>
                </button>
                <button
                  className={`nav-item-btn ${workspaceTab === 'library' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('library')}
                >
                  <BookOpen size={16} />
                  <span>Thư viện</span>
                </button>
              </>
            ) : (
              /* Class Context: 5 features (NAV-08, CUXC-02) */
              <>
                <button
                  className={`nav-item-btn ${classTab === 'members' ? 'active' : ''}`}
                  onClick={() => setClassTab('members')}
                >
                  <Users size={16} />
                  <span>Thành viên</span>
                </button>
                <button
                  className={`nav-item-btn ${classTab === 'groups' ? 'active' : ''}`}
                  onClick={() => setClassTab('groups')}
                >
                  <FolderKanban size={16} />
                  <span>Nhóm trong lớp</span>
                </button>
                <button
                  className={`nav-item-btn ${classTab === 'assignments' ? 'active' : ''}`}
                  onClick={() => setClassTab('assignments')}
                >
                  <ClipboardList size={16} />
                  <span>Bài giao</span>
                </button>
                <button
                  className={`nav-item-btn ${classTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setClassTab('calendar')}
                >
                  <Calendar size={16} />
                  <span>Lịch lớp</span>
                </button>
                {/* CUXC-02: Cài đặt chỉ hiện khi có quyền quản lý lớp */}
                {isClassOwner && (
                  <button
                    className={`nav-item-btn ${classTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setClassTab('settings')}
                  >
                    <Settings size={16} />
                    <span>Cài đặt lớp</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* UXR-05: Chỉ hiển thị mục lưu ý khi có dữ liệu thật theo workspace. */}
          {context.type === 'workspace' && (
            <div className="sidebar-notes-preview">
              <div className="sidebar-notes-title">Mục lưu ý</div>
              <p className="notes-preview-empty">Mục lưu ý chưa được đồng bộ</p>
            </div>
          )}

          {/* ChatGPT Style Sidebar Footer */}
          <div className="sidebar-footer">
            <button
              type="button"
              className="chatgpt-sidebar-profile"
              onClick={() => setShowSettingsModal(true)}
              title="Mở menu cài đặt tài khoản"
            >
              <div className="chatgpt-sidebar-avatar">
                {activePersona === 'teacher' ? 'G' : 'H'}
              </div>
              <div className="chatgpt-sidebar-profile-info">
                <div className="chatgpt-sidebar-profile-name">
                  {localStorage.getItem('snote_user_alias') || `Tài khoản: ${user.id.slice(0, 8)}`}
                </div>
                <div className="chatgpt-sidebar-profile-sub">
                  {activePersona === 'teacher' ? 'Giáo viên (Plus)' : 'Học sinh'}
                </div>
              </div>
              <Settings size={15} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
            </button>
          </div>
        </aside>}

        {/* Main Content Area */}
        <main className="app-main">
          {!user ? (import.meta.env.DEV ? (
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Hero Banner */}
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent-hover)', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                  <GraduationCap size={13} />
                  <span>SNOTE v2 • Phiên bản Trải nghiệm Nâng cao (Stageshow UI)</span>
                </div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--ink-title)', letterSpacing: '-0.025em', marginBottom: '12px', lineHeight: 1.2 }}>
                  Nền tảng Học tập & Cộng tác Nhóm Hiện đại
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--ink-muted)', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                  Giao diện điềm tĩnh (Quiet Modern Productivity) với quản lý công việc Gantt/List, lịch trình đa múi giờ, thư viện bảo mật và nộp bài kiểm định SHA-256.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}
                    onClick={() => setShowAuthModal(true)}
                  >
                    <span>Đăng nhập / Đăng ký tài khoản</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* One-Click Demo Access Cards */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'center' }}>
                  ⚡ Trải nghiệm Nhanh 1 Chạm (Đã nạp sẵn dữ liệu mẫu thực nghiệm)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {/* Student Card */}
                  <div
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-raised, 0 1px 3px rgba(0,0,0,0.04))',
                      transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                          <CheckSquare size={18} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'var(--surface-ground)', color: 'var(--ink-subtle)' }}>
                          Học sinh demo
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-title)', marginBottom: '6px' }}>
                        Không gian Học sinh (Student Workspace)
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                        Khám phá Bảng công việc Gantt & Danh sách (ưu tiên P1/P2/P3), Lịch trình cá nhân (Solid Disc ngày hiện tại), Hộp thu tài liệu riêng tư và Nộp bài với Dropzone 1px.
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px' }}
                      onClick={() => void handleQuickDemoLogin('student')}
                    >
                      <span>Vào vai Học sinh Demo</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Teacher Card */}
                  <div
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-raised, 0 1px 3px rgba(0,0,0,0.04))',
                      transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'var(--surface-ground)', color: 'var(--ink-title)' }}>
                          <GraduationCap size={18} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'var(--surface-ground)', color: 'var(--ink-subtle)' }}>
                          Giáo viên demo
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-title)', marginBottom: '6px' }}>
                        Không gian Giáo viên (Teacher Workspace)
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                        Quản lý Lớp học "Toán Ứng dụng & Giải thuật 2026", giao bài tập kiểm định, xem Bảng tiến độ nộp bài và chấm điểm qua Dòng thời gian phiên bản (Vertical Timeline).
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface-ground)', borderColor: 'var(--border-light)', color: 'var(--ink-title)' }}
                      onClick={() => void handleQuickDemoLogin('teacher')}
                    >
                      <span>Vào vai Giáo viên Demo</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Grid: 4 Feature Showcase Previews */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Trụ cột Thiết kế Stageshow & Năng suất Hiện đại
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent)', fontWeight: 600, fontSize: '13px' }}>
                      <CheckSquare size={14} />
                      <span>Công việc & Gantt</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                      Chuyển đổi Gantt và Danh sách tức thì, thanh trượt thời gian, nhãn ưu tiên P1/P2/P3 và checklist việc con.
                    </p>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>
                      <Calendar size={14} />
                      <span>Lịch trình Dân sự</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                      Nhận diện Solid Disc ngày hôm nay, giữ nguyên ngày dân sự cho sự kiện cả ngày và cảnh báo trùng lịch thông minh.
                    </p>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--warning)', fontWeight: 600, fontSize: '13px' }}>
                      <BookOpen size={14} />
                      <span>Thư viện Số 100MB</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                      Thanh hạn ngạch QuotaBar mảnh 6px, xem trước liên kết an toàn chống SSRF, thùng rác lưu trữ 30 ngày.
                    </p>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent)', fontWeight: 600, fontSize: '13px' }}>
                      <ClipboardList size={14} />
                      <span>Bài giao & Nộp bài</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                      Dropzone kéo thả 1px nét đứt, dòng thời gian phiên bản dọc nối điểm tròn và nhận xét giáo viên trực quan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <section className="welcome-panel">
              <div className="welcome-mark"><Zap size={24} aria-hidden="true" /></div>
              <h1>Học tập và cộng tác trong một không gian rõ ràng.</h1>
              <p>Quản lý công việc, lịch, tài liệu và bài giao theo đúng lớp hoặc workspace của bạn.</p>
              <button type="button" className="btn btn-primary" onClick={() => setShowAuthModal(true)}>Bắt đầu với Snote</button>
            </section>
          )) : context.type === 'class' && activeClass ? (
            /* Class Context Views */
            <>
              {classTab === 'members' && (
                <ClassMembersView
                  key={activeClass.id}
                  cls={activeClass}
                  currentUser={user}
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
                  onOpenGroupWorkspace={groupWs => {
                    // CUXC-03: Switching to group workspace
                    handleSelectWorkspace(groupWs);
                  }}
                />
              )}
              {classTab === 'settings' && isClassOwner && (
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
                  isTeacher={Boolean(isClassOwner || (activePersona === 'teacher' && user.usages.includes('teacher')))}
                  activeWorkspaceId={
                    workspaces.find(w => w.kind === 'class_group' && w.id.includes(activeClass.id))?.id
                  }
                />
              )}
              {classTab === 'calendar' && (
                <CalendarContainer key={activeClass.id} scopeType="class" scopeId={activeClass.id} />
              )}
            </>
          ) : activeWorkspace ? (
            /* Workspace Context Views */
            <div className="section-box">
              {/* ChatGPT Hero Greeting & Signature Composer Bar */}
              <div className="chatgpt-hero-greeting">
                <h2 className="chatgpt-hero-title">
                  Mình có thể giúp gì cho{' '}
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    title="Bấm để chỉnh sửa biệt danh trong Cài đặt"
                  >
                    {localStorage.getItem('snote_user_alias') || 'bạn'}
                  </button>
                  ?
                </h2>
                <p className="chatgpt-hero-subtitle">
                  {activeWorkspace.kind === 'default'
                    ? 'Không gian Cá nhân · Quản lý tập trung công việc, lịch trình và tài liệu'
                    : `Không gian: ${activeWorkspace.name} · Nhóm`}
                </p>

                {/* ChatGPT Signature Composer */}
                <form
                  className="chatgpt-composer-root"
                  onSubmit={handleComposerSubmit}
                  style={{ marginTop: 14 }}
                >
                  <div className="chatgpt-composer-input-row">
                    <button
                      type="button"
                      className="chatgpt-composer-action-btn"
                      onClick={() => setWorkspaceTab('library')}
                      title="Thêm tệp vào Thư viện"
                      aria-label="Thêm tệp"
                    >
                      <Plus size={18} />
                    </button>
                    <textarea
                      id="chatgpt-composer-input"
                      className="chatgpt-composer-textarea"
                      placeholder="Gõ công việc, ghi chú, bài tập hoặc hỏi Snote..."
                      rows={1}
                      value={composerText}
                      onChange={e => setComposerText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void handleComposerSubmit();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="chatgpt-composer-action-btn"
                      title="Nhập bằng giọng nói (Demo)"
                      aria-label="Giọng nói"
                    >
                      <Mic size={17} />
                    </button>
                    <button
                      type="submit"
                      className="chatgpt-composer-send-btn"
                      disabled={!composerText.trim() || composerSubmitting}
                      title="Gửi"
                      aria-label="Gửi"
                    >
                      <ArrowUp size={16} />
                    </button>
                  </div>
                </form>

                {/* ChatGPT Suggestion Chips */}
                <div className="chatgpt-chips-grid">
                  <div
                    className="chatgpt-chip-card"
                    onClick={() => setWorkspaceTab('tasks')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="chatgpt-chip-card-title">
                      <CheckSquare size={14} style={{ color: 'var(--accent)' }} />
                      <span>Công việc & Gantt</span>
                    </div>
                    <div className="chatgpt-chip-card-desc">
                      Chuyển đổi Gantt và Danh sách tức thì, nhãn ưu tiên P1/P2/P3.
                    </div>
                  </div>

                  <div
                    className="chatgpt-chip-card"
                    onClick={() => setWorkspaceTab('calendar')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="chatgpt-chip-card-title">
                      <Calendar size={14} style={{ color: 'var(--success)' }} />
                      <span>Lịch trình Dân sự</span>
                    </div>
                    <div className="chatgpt-chip-card-desc">
                      Giữ nguyên ngày cả ngày và phát hiện xung đột lịch.
                    </div>
                  </div>

                  <div
                    className="chatgpt-chip-card"
                    onClick={() => setWorkspaceTab('library')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="chatgpt-chip-card-title">
                      <BookOpen size={14} style={{ color: 'var(--warning)' }} />
                      <span>Thư viện 100MB</span>
                    </div>
                    <div className="chatgpt-chip-card-desc">
                      QuotaBar trực quan, xem trước an toàn và thùng rác 30 ngày.
                    </div>
                  </div>

                  <div
                    className="chatgpt-chip-card"
                    onClick={() => {
                      if (activeClass) {
                        handleSelectClass(activeClass);
                        setClassTab('assignments');
                      } else if (classes.length > 0) {
                        handleSelectClass(classes[0]);
                        setClassTab('assignments');
                      } else {
                        setShowSettingsModal(true);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="chatgpt-chip-card-title">
                      <ClipboardList size={14} style={{ color: 'var(--accent)' }} />
                      <span>Bài giao & Lớp học</span>
                    </div>
                    <div className="chatgpt-chip-card-desc">
                      Dropzone kéo thả 1px, theo dõi tiến độ và nộp bài kiểm định.
                    </div>
                  </div>
                </div>
              </div>

              <div className="view-header" style={{ marginTop: 20 }}>
                <div>
                  <h1 className="view-title">{activeWorkspace.name}</h1>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Workspace · {activeWorkspace.kind === 'default' ? 'Cá nhân' : activeWorkspace.kind === 'class_group' ? 'Nhóm trong lớp' : 'Độc lập'}
                  </span>
                </div>
              </div>

              {workspaceTab === 'tasks' && (
                <TasksContainer
                  key={`${activeWorkspace.id}-${taskRefreshKey}`}
                  workspaceId={activeWorkspace.kind === 'default' ? undefined : activeWorkspace.id}
                />
              )}
              {workspaceTab === 'calendar' && (
                <CalendarContainer key={activeWorkspace.id} scopeType="workspace" scopeId={activeWorkspace.id} />
              )}
              {workspaceTab === 'library' && (
                <LibraryView
                  key={activeWorkspace.id}
                  workspaceId={activeWorkspace.id}
                  isPersonalWorkspace={activeWorkspace.kind === 'default'}
                  actorId={user?.id}
                />
              )}
            </div>
          ) : (
            <div className="section-box" style={{ textAlign: 'center', padding: '40px 0' }}>
              <p>Đang tải dữ liệu ngữ cảnh...</p>
            </div>
          )}
        </main>
      </div>

      {/* Identity Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={acc => {
          setUser(acc);
          void loadContextData();
        }}
      />

      {user && (
        <AccountSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          account={user}
          activePersona={activePersona}
          onPersonaChanged={handleSwitchPersona}
          onUpdated={updated => setUser(updated)}
          onLoggedOut={() => {
            setUser(null);
            setClasses([]);
            setWorkspaces([]);
          }}
        />
      )}
    </div>
  );
}
