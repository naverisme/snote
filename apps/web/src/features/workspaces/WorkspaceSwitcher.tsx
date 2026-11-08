import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, LayoutGrid, List, Plus } from 'lucide-react';
import type { Class, Workspace } from '../../shared/types';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

interface Props {
  workspaces: Workspace[];
  classes: Class[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onWorkspaceCreated: (ws: Workspace) => void;
}

const kindLabel = (kind: Workspace['kind']) =>
  kind === 'default' ? 'Cá nhân' : kind === 'class_group' ? 'Nhóm lớp' : 'Độc lập';
const getInitials = (name: string) => name.trim().slice(0, 2).toLocaleUpperCase('vi') || 'WS';

export function WorkspaceSwitcher({ workspaces, classes, activeWorkspace, onSelectWorkspace, onWorkspaceCreated }: Props) {
  const [viewState, setViewState] = useState<'collapsed' | 'strip' | 'list'>('collapsed');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const isOpen = viewState !== 'collapsed';
  const others = workspaces.filter(ws => ws.id !== activeWorkspace?.id);
  const preview = [activeWorkspace, others[0]].filter((ws): ws is Workspace => Boolean(ws));
  const detail = (ws: Workspace) => {
    const className = ws.classId ? classes.find(cls => cls.id === ws.classId)?.name : undefined;
    return [className ?? kindLabel(ws.kind), ws.status === 'archived' ? 'Đã lưu trữ' : undefined].filter(Boolean).join(' · ');
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setViewState('collapsed');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setViewState('collapsed');
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const select = (ws: Workspace) => {
    onSelectWorkspace(ws);
    setViewState('collapsed');
    triggerRef.current?.focus();
  };
  const create = () => {
    setViewState('collapsed');
    setShowCreateModal(true);
  };
  const endDrag = () => {
    const drag = dragRef.current;
    const strip = stripRef.current;
    if (drag?.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    if (drag && strip?.hasPointerCapture(drag.pointerId)) strip.releasePointerCapture(drag.pointerId);
    dragRef.current = null;
  };

  return (
    <div className="workspace-switcher" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`workspace-cluster-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setViewState(isOpen ? 'collapsed' : 'strip')}
        title="Bấm để bung danh sách workspace"
        aria-expanded={viewState !== 'collapsed'}
        aria-controls="workspace-picker"
        aria-label={`Workspace hiện tại: ${activeWorkspace?.name ?? 'Chưa chọn'}. Mở danh sách ${workspaces.length} workspace`}
      >
        <span className="workspace-trigger-label">Workspace</span>
        <span className="stacked-icons" aria-hidden="true">
          {preview.map(ws => <span key={ws.id} className={`ws-icon-circle ws-kind-${ws.kind}`}>{getInitials(ws.name)}</span>)}
        </span>
        <span className="workspace-current-name">{activeWorkspace?.name ?? 'Chọn workspace'}</span>
        {workspaces.length > 2 && <span className="workspace-more-count" aria-hidden="true">+{workspaces.length - 2}</span>}
        <ChevronDown size={15} className="workspace-chevron" aria-hidden="true" />
      </button>

      {isOpen && (
        <div id="workspace-picker" className="workspace-expanded-panel" aria-label="Chọn workspace">
          <div className="ws-expanded-header">
            <div><p className="ws-panel-eyebrow">Không gian làm việc</p><p className="ws-panel-subtitle">Mỗi hình tròn là một workspace</p></div>
            <button type="button" className="ws-view-toggle" onClick={() => setViewState(viewState === 'strip' ? 'list' : 'strip')}>
              {viewState === 'strip' ? <List size={16} /> : <LayoutGrid size={16} />}
              <span>{viewState === 'strip' ? 'Danh sách' : 'Dãy ngang'}</span>
            </button>
          </div>
          {viewState === 'strip' ? (
            <div
              ref={stripRef}
              className="ws-strip"
              aria-label="Các workspace"
              onPointerDown={event => {
                if (event.pointerType !== 'mouse' || event.button !== 0) return;
                dragRef.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft, moved: false };
              }}
              onPointerMove={event => {
                const drag = dragRef.current;
                if (!drag || drag.pointerId !== event.pointerId) return;
                const delta = event.clientX - drag.startX;
                if (Math.abs(delta) > 5 && !drag.moved) {
                  drag.moved = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }
                if (drag.moved) {
                  event.currentTarget.scrollLeft = drag.scrollLeft - delta;
                  event.preventDefault();
                }
              }}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onLostPointerCapture={endDrag}
              onClickCapture={event => {
                if (!suppressClickRef.current) return;
                event.preventDefault();
                event.stopPropagation();
                suppressClickRef.current = false;
              }}
            >
              {/* UXR-04: Tạo workspace ở đầu trái ngoài cùng */}
              <button type="button" className="ws-strip-item ws-create-item" onClick={create}>
                <span className="ws-icon-circle ws-icon-create"><Plus size={18} aria-hidden="true" /></span>
                <span className="ws-item-name">Tạo mới</span>
              </button>
              {workspaces.map(ws => (
                <button
                  type="button"
                  key={ws.id}
                  className={`ws-strip-item ${activeWorkspace?.id === ws.id ? 'active' : ''}`}
                  onClick={() => select(ws)}
                  aria-current={activeWorkspace?.id === ws.id ? 'true' : undefined}
                  aria-label={`${ws.name}, ${detail(ws)}${activeWorkspace?.id === ws.id ? ', đang chọn' : ''}`}
                >
                  <span className={`ws-icon-circle ws-kind-${ws.kind}`} aria-hidden="true">{getInitials(ws.name)}</span>
                  <span className="ws-item-name" title={ws.name}>{ws.name}</span>
                  <span className="ws-item-kind">{ws.status === 'archived' ? 'Lưu trữ' : kindLabel(ws.kind)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="ws-list" aria-label="Danh sách workspace">
              <button type="button" className="ws-list-create" onClick={create}><Plus size={16} /> Tạo workspace độc lập</button>
              {workspaces.map(ws => (
                <button
                  type="button"
                  key={ws.id}
                  className={`ws-list-item ${activeWorkspace?.id === ws.id ? 'active' : ''}`}
                  onClick={() => select(ws)}
                  aria-current={activeWorkspace?.id === ws.id ? 'true' : undefined}
                >
                  <span className={`ws-icon-circle ws-kind-${ws.kind}`} aria-hidden="true">{getInitials(ws.name)}</span>
                  <span className="ws-list-copy"><strong>{ws.name}</strong><small>{detail(ws)}</small></span>
                  {activeWorkspace?.id === ws.id && <Check size={16} className="ws-selected-check" aria-label="Đang chọn" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={ws => { onWorkspaceCreated(ws); onSelectWorkspace(ws); }}
      />
    </div>
  );
}
