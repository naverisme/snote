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
  onOpenSettings?: () => void;
}

export function ClassSelector({
  classes,
  activeClass,
  currentUser,
  onSelectClass,
  onClassCreated,
  onOpenSettings,
}: ClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      const activeBtn = dropdownRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]') ||
        dropdownRef.current?.querySelector<HTMLButtonElement>('button');
      activeBtn?.focus();
    }
  }, [isOpen]);

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const buttons = dropdownRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons || buttons.length === 0) return;
      const index = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement);
      e.preventDefault();
      if (index === -1) {
        buttons[0]?.focus();
      } else if (e.key === 'ArrowDown') {
        const next = (index + 1) % buttons.length;
        buttons[next]?.focus();
      } else {
        const prev = (index - 1 + buttons.length) % buttons.length;
        buttons[prev]?.focus();
      }
    } else if (e.key === 'Home') {
      const buttons = dropdownRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (buttons && buttons[0]) {
        e.preventDefault();
        buttons[0].focus();
      }
    } else if (e.key === 'End') {
      const buttons = dropdownRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (buttons && buttons[buttons.length - 1]) {
        e.preventDefault();
        buttons[buttons.length - 1].focus();
      }
    }
  };

  const isTeacher = currentUser?.usages.includes('teacher');

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        className="class-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={e => {
          if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          } else if (e.key === 'Escape' && isOpen) {
            e.preventDefault();
            setIsOpen(false);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="class-picker"
        aria-label={`Lớp học: ${activeClass?.name ?? 'Chưa chọn'}. Bấm để mở danh sách lớp (CUXC-01)`}
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
        <div
          ref={dropdownRef}
          id="class-picker"
          className="class-dropdown"
          role="listbox"
          aria-label="Danh sách lớp học"
          tabIndex={-1}
          onKeyDown={handleDropdownKeyDown}
        >
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
                role="option"
                onClick={() => {
                  onSelectClass(cls);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-current={activeClass?.id === cls.id ? 'true' : undefined}
                aria-selected={activeClass?.id === cls.id}
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
                  backgroundColor: activeClass?.id === cls.id ? 'var(--accent-light)' : 'transparent',
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

          {isTeacher ? (
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
          ) : currentUser ? (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.8rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                title="Bật quyền Giáo viên trong Cài đặt để tạo lớp mới"
              >
                <GraduationCap size={13} />
                <span>Bật quyền Giáo viên để tạo lớp</span>
              </button>
            </div>
          ) : null}
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
