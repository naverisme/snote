import React, { useEffect, useState } from 'react';
import '../shared/theme.css';
import type { Account, Class, Workspace } from '../shared/types';
import { getMe, listClasses, listWorkspaces, getMyInvitations } from '../shared/api';
import { AuthModal } from '../features/identity/AuthModal';
import { AccountSettingsModal } from '../features/identity/AccountSettingsModal';
import { WorkspaceSwitcher } from '../features/workspaces/WorkspaceSwitcher';
import { ClassSelector } from '../features/classes/ClassSelector';
import { ClassMembersView } from '../features/classes/ClassMembersView';
import { ClassGroupsView } from '../features/classes/ClassGroupsView';
import { ClassSettingsView } from '../features/classes/ClassSettingsView';

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
  };

  const handleSelectClass = (cls: Class) => {
    setContext({ type: 'class', classId: cls.id });
    setClassTab('members'); // CUXC-06: Default to Members tab
  };

  return (
    <div className="app-shell">
      {/* Top Application Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="brand-btn" onClick={handleSnoteLogoClick} title="Về Việc của tôi (Personal)">
            <span>⚡ Snote</span>
          </button>

          {/* Context Selector Cluster: Workspace & Class side-by-side (UXR-03 / CUXC-01) */}
          {user && (
            <div className="context-selector-cluster">
              <WorkspaceSwitcher
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                onSelectWorkspace={handleSelectWorkspace}
                onWorkspaceCreated={ws => setWorkspaces([...workspaces, ws])}
              />

              <ClassSelector
                classes={classes}
                activeClass={activeClass}
                currentUser={user}
                onSelectClass={handleSelectClass}
                onClassCreated={cls => setClasses([...classes, cls])}
              />
            </div>
          )}
        </div>

        <div className="header-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {pendingInvCount > 0 && (
                <span className="badge badge-warning" title={`${pendingInvCount} lời mời đang chờ`}>
                  {pendingInvCount} lời mời
                </span>
              )}

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSettingsModal(true)}
              >
                <span>⚙ Cài đặt ({user.usages.join(', ')})</span>
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
        <aside className="app-sidebar">
          <div className="sidebar-nav-group">
            {context.type === 'workspace' ? (
              /* Workspace Context: 3 features (NAV-04, UXR-02) */
              <>
                <button
                  className={`nav-item-btn ${workspaceTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('tasks')}
                >
                  <span>📋 Công việc (Gantt/Danh sách)</span>
                </button>
                <button
                  className={`nav-item-btn ${workspaceTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('calendar')}
                >
                  <span>📅 Lịch trình</span>
                </button>
                <button
                  className={`nav-item-btn ${workspaceTab === 'library' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('library')}
                >
                  <span>📚 Thư viện</span>
                </button>
              </>
            ) : (
              /* Class Context: 5 features (NAV-08, CUXC-02) */
              <>
                <button
                  className={`nav-item-btn ${classTab === 'members' ? 'active' : ''}`}
                  onClick={() => setClassTab('members')}
                >
                  <span>👥 Thành viên</span>
                </button>
                <button
                  className={`nav-item-btn ${classTab === 'groups' ? 'active' : ''}`}
                  onClick={() => setClassTab('groups')}
                >
                  <span>🗂 Nhóm trong lớp</span>
                </button>
                <button
                  className={`nav-item-btn ${classTab === 'assignments' ? 'active' : ''}`}
                  onClick={() => setClassTab('assignments')}
                >
                  <span>📝 Bài giao</span>
                </button>
                <button
                  className={`nav-item-btn ${classTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setClassTab('calendar')}
                >
                  <span>📅 Lịch lớp</span>
                </button>
                {/* CUXC-02: Cài đặt chỉ hiện khi có quyền quản lý lớp */}
                {isClassOwner && (
                  <button
                    className={`nav-item-btn ${classTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setClassTab('settings')}
                  >
                    <span>⚙ Cài đặt lớp</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* UXR-05: Mục lưu ý (chỉ hiện trong ngữ cảnh workspace, không hiện trong lớp - CUXC-04) */}
          {context.type === 'workspace' && (
            <div className="sidebar-notes-preview">
              <div className="sidebar-notes-title">Mục lưu ý</div>
              <div className="notes-preview-item">📌 Ghi chú nhanh cá nhân</div>
              <div className="notes-preview-item">⏰ Việc sắp đến hạn tuần này</div>
              <div className="notes-preview-item">🗓 Sự kiện sắp diễn ra</div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="app-main">
          {!user ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Chào mừng đến với SNOTE v2</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Hệ thống quản lý học tập, công việc và ngữ cảnh nhóm thế hệ mới.
              </p>
              <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                Bắt đầu ngay bằng Đăng nhập / Đăng ký
              </button>
            </div>
          ) : context.type === 'class' && activeClass ? (
            /* Class Context Views */
            <>
              {classTab === 'members' && (
                <ClassMembersView
                  cls={activeClass}
                  currentUser={user}
                  onClassUpdated={updated => {
                    setClasses(classes.map(c => (c.id === updated.id ? updated : c)));
                  }}
                />
              )}
              {classTab === 'groups' && (
                <ClassGroupsView
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
                  cls={activeClass}
                  currentUser={user}
                  onClassUpdated={updated => {
                    setClasses(classes.map(c => (c.id === updated.id ? updated : c)));
                  }}
                />
              )}
              {classTab === 'assignments' && (
                <div className="section-box" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <h2>Bài giao của lớp {activeClass.name}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Tính năng Bài giao & Nộp bài được sở hữu và phát triển bởi Worktree #32.
                  </p>
                </div>
              )}
              {classTab === 'calendar' && (
                <div className="section-box" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <h2>Lịch lớp {activeClass.name}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Tính năng Lịch trình được sở hữu và phát triển bởi Worktree #31.
                  </p>
                </div>
              )}
            </>
          ) : activeWorkspace ? (
            /* Workspace Context Views */
            <div className="section-box">
              <div className="view-header">
                <div>
                  <h1 className="view-title">Workspace: {activeWorkspace.name}</h1>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Loại: {activeWorkspace.kind === 'default' ? 'Cá nhân mặc định' : activeWorkspace.kind === 'class_group' ? 'Nhóm trong lớp' : 'Độc lập'}
                  </span>
                </div>
              </div>

              {workspaceTab === 'tasks' && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <h3>Công việc & Tiến độ (Gantt / Danh sách)</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Tính năng Công việc & Gantt được sở hữu và phát triển bởi Worktree #31.
                  </p>
                </div>
              )}
              {workspaceTab === 'calendar' && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <h3>Lịch trình Workspace</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Tính năng Lịch trình được sở hữu và phát triển bởi Worktree #31.
                  </p>
                </div>
              )}
              {workspaceTab === 'library' && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <h3>Thư viện tài liệu & Hộp thu</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Tính năng Thư viện & Uploads được sở hữu và phát triển bởi Worktree #35.
                  </p>
                </div>
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
