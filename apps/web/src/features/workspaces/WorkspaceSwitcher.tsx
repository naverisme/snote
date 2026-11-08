import React, { useState } from 'react';
import { ChevronDown, Plus, List, LayoutGrid, Check } from 'lucide-react';
import type { Workspace } from '../../shared/types';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onWorkspaceCreated: (ws: Workspace) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onWorkspaceCreated,
}: WorkspaceSwitcherProps) {
  const [viewState, setViewState] = useState<'collapsed' | 'strip' | 'list'>('collapsed');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getInitials = (name: string) => {
    return name ? name.trim().slice(0, 2).toUpperCase() : 'WS';
  };

  const otherWorkspaces = workspaces.filter(w => w.id !== activeWorkspace?.id);

  return (
    <div className="workspace-switcher">
      {/* Trigger: Collapsed state (UXR-03: Max 2 stacked icons) */}
      <button
        className="workspace-cluster-trigger"
        onClick={() => setViewState(viewState === 'collapsed' ? 'strip' : 'collapsed')}
        title="Bấm để bung danh sách workspace"
        aria-expanded={viewState !== 'collapsed'}
      >
        <div className="stacked-icons">
          <div className="ws-icon-circle">
            {activeWorkspace ? getInitials(activeWorkspace.name) : 'CN'}
          </div>
          {otherWorkspaces.length > 0 && (
            <div className="ws-icon-circle secondary">
              {getInitials(otherWorkspaces[0].name)}
            </div>
          )}
        </div>
        <span style={{ fontWeight: 600 }}>{activeWorkspace?.name || 'Cá nhân'}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Expanded Horizontal Strip or List (UXR-03, UXR-04) */}
      {viewState !== 'collapsed' && (
        <div className="workspace-expanded-panel">
          <div className="ws-expanded-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {viewState === 'strip' ? 'WORKSPACE (DÃY NGANG)' : 'DANH SÁCH WORKSPACE'}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setViewState(viewState === 'strip' ? 'list' : 'strip')}
              title="Đổi góc nhìn danh sách"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {viewState === 'strip' ? (
                <>
                  <List size={13} />
                  <span>Dạng danh sách</span>
                </>
              ) : (
                <>
                  <LayoutGrid size={13} />
                  <span>Dạng dãy ngang</span>
                </>
              )}
            </button>
          </div>

          {viewState === 'strip' ? (
            <div className="ws-strip">
              {/* UXR-04: Tạo workspace ở đầu trái ngoài cùng */}
              <button
                className="ws-strip-item"
                onClick={() => {
                  setViewState('collapsed');
                  setShowCreateModal(true);
                }}
                title="Tạo workspace mới"
              >
                <div className="ws-icon-circle" style={{ backgroundColor: '#e4e4e7', color: 'var(--text-primary)' }}>
                  <Plus size={14} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tạo mới</span>
              </button>

              {/* Workspace icons in horizontal strip */}
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  className={`ws-strip-item ${activeWorkspace?.id === ws.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setViewState('collapsed');
                  }}
                  title={ws.name}
                >
                  <div className="ws-icon-circle" style={{ backgroundColor: ws.kind === 'default' ? '#10b981' : ws.kind === 'class_group' ? '#8b5cf6' : 'var(--accent)' }}>
                    {getInitials(ws.name)}
                  </div>
                  <span style={{ fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 64 }}>
                    {ws.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => {
                  setViewState('collapsed');
                  setShowCreateModal(true);
                }}
              >
                <Plus size={14} />
                <span>Tạo workspace độc lập</span>
              </button>

              {workspaces.map(ws => (
                <div
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setViewState('collapsed');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: activeWorkspace?.id === ws.id ? '#eff6ff' : 'transparent',
                    fontWeight: activeWorkspace?.id === ws.id ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ws-icon-circle" style={{ width: 18, height: 18, fontSize: '0.65rem', backgroundColor: ws.kind === 'default' ? '#10b981' : ws.kind === 'class_group' ? '#8b5cf6' : 'var(--accent)' }}>
                      {getInitials(ws.name)}
                    </div>
                    <span>{ws.name}</span>
                  </div>

                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    {ws.kind === 'default' ? 'Cá nhân' : ws.kind === 'class_group' ? 'Nhóm lớp' : 'Độc lập'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(ws) => {
          onWorkspaceCreated(ws);
          onSelectWorkspace(ws);
        }}
      />
    </div>
  );
}
