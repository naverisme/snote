import React, { useState } from 'react';
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

  const isTeacher = currentUser?.usages.includes('teacher');

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="class-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>🏫 Lớp học</span>
        {activeClass && (
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>: {activeClass.name}</span>
        )}
        <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>▼</span>
      </button>

      {isOpen && (
        <div className="class-dropdown" onClick={() => setIsOpen(false)}>
          <div style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            DANH SÁCH LỚP HỌC
          </div>

          {classes.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Chưa có lớp nào
            </div>
          ) : (
            classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls);
                  setIsOpen(false);
                }}
                style={{
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
              </div>
            ))
          )}

          {isTeacher && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
              >
                + Tạo lớp học mới
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
