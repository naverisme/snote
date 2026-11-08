import { useEffect, useRef, useState } from 'react';
import { GraduationCap, ChevronDown, Plus } from 'lucide-react';
import type { Class, Account } from '../../shared/types';
import { CreateClassModal } from './CreateClassModal';

interface ClassSelectorProps {
  classes: Class[];
  activeClass: Class | null;
  currentUser: Account | null;
  onSelectClass: (cls: Class) => void;
  onClassCreated: (cls: Class) => void;
}

export function ClassSelector({
  classes,
  activeClass,
  currentUser,
  onSelectClass,
  onClassCreated,
}: ClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
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

  const isTeacher = currentUser?.usages.includes('teacher');

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        className="class-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="class-picker"
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <GraduationCap size={15} />
          <span>Lớp học</span>
        </span>
        {activeClass && (
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>: {activeClass.name}</span>
        )}
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
      </button>

      {isOpen && (
        <div id="class-picker" className="class-dropdown">
          <div style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            DANH SÁCH LỚP HỌC
          </div>

          {classes.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Chưa có lớp nào
            </div>
          ) : (
            classes.map(cls => (
              <button
                type="button"
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-current={activeClass?.id === cls.id ? 'true' : undefined}
                style={{
                  width: '100%',
                  border: 'none',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: activeClass?.id === cls.id ? '#eff6ff' : 'transparent',
                  fontWeight: activeClass?.id === cls.id ? 600 : 400,
                  fontSize: '0.9rem',
                }}
              >
                <span>{cls.name}</span>
                {cls.status === 'archived' && (
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Lưu trữ</span>
                )}
              </button>
            ))
          )}

          {isTeacher && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={14} />
                <span>Tạo lớp học mới</span>
              </button>
            </div>
          )}
        </div>
      )}

      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(cls) => {
          onClassCreated(cls);
          onSelectClass(cls);
        }}
      />
    </div>
  );
}
