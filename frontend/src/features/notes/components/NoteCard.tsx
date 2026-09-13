import React, { useMemo, useState } from 'react';
import { NoteType } from '@snote/shared';
import { MarkdownViewer } from '../../../components/common/MarkdownViewer';
import { extractNoteFeatures, toggleChecklistItem } from '../utils/smartNoteParser';
import {
  Pin,
  Archive,
  Trash2,
  BookOpen,
  Tag,
  FileText,
  FlaskConical,
  GraduationCap,
  FolderKanban,
  Users,
  ExternalLink,
  CheckSquare,
  Image as ImageIcon,
  Code,
  Paperclip,
  Edit3
} from 'lucide-react';

interface NoteCardProps {
  note: any;
  onView: (note: any) => void;
  onEdit: (note: any) => void;
  onDelete: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onConvertToTask?: (note: any) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  isSelectionMode?: boolean;
  onToggleTodo?: (noteId: string, todoIndex: number, newContent: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onConvertToTask,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false,
  onToggleTodo
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getNoteTypeConfig = (type: NoteType) => {
    switch (type) {
      case NoteType.LECTURE:
        return { label: 'Bài giảng', badgeClass: 'badge-blue', icon: BookOpen };
      case NoteType.LAB_REPORT:
        return { label: 'Thực hành', badgeClass: 'badge-green', icon: FlaskConical };
      case NoteType.EXAM_PREP:
        return { label: 'Ôn thi', badgeClass: 'badge-amber', icon: GraduationCap };
      case NoteType.PROJECT_LOG:
        return { label: 'Dự án', badgeClass: 'badge-purple', icon: FolderKanban };
      case NoteType.MEETING_MINUTES:
        return { label: 'Họp nhóm', badgeClass: 'badge-rose', icon: Users };
      default:
        return null;
    }
  };

  const typeConfig = getNoteTypeConfig(note.noteType);

  // Extract multi-features from note content via smart parser
  const features = useMemo(() => {
    return extractNoteFeatures(note.content || '');
  }, [note.content]);

  // Clean note title logic
  const isTitleGenericOrRepeated =
    !note.title ||
    note.title === 'Ghi chú không tiêu đề' ||
    note.content?.trim().startsWith(note.title);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isSelectionMode && onToggleSelect) {
          onToggleSelect(note.id, e);
        } else {
          onView(note);
        }
      }}
      className={`snote-bento-card stagger-bento-card ${note.isPinned ? 'is-pinned' : ''}`}
      style={{
        '--card-glow-color': note.subject?.color ? `${note.subject.color}40` : 'rgba(99, 102, 241, 0.25)'
      } as any}
      title={isSelectionMode ? 'Nhấp để chọn/bỏ chọn ghi chú' : 'Nhấp để xem chi tiết hoặc chỉnh sửa'}
    >
      <div>
        {/* Row 1: Streamlined Header (Context & Pin) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            marginBottom: '8px',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {/* Left: Context Tags (Subject / Project / Type / Date) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            {/* Multi-Select Checkbox */}
            {onToggleSelect && (isSelectionMode || isSelected) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(note.id, e);
                }}
                className="btn btn-ghost btn-icon"
                style={{
                  padding: '2px',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)'
                }}
                title={isSelected ? 'Bỏ chọn bài ghi' : 'Chọn bài ghi'}
              >
                <CheckSquare
                  size={14}
                  style={{
                    fill: isSelected ? 'var(--accent-primary)' : 'none',
                    color: isSelected ? '#ffffff' : 'currentColor'
                  }}
                />
              </button>
            )}

            {/* Subject Badge */}
            {note.subject ? (
              <span
                className="badge"
                style={{
                  fontSize: '10.5px',
                  padding: '1.5px 7px',
                  backgroundColor: note.subject.color ? `${note.subject.color}18` : 'rgba(255, 255, 255, 0.06)',
                  color: note.subject.color || 'var(--text-secondary)',
                  border: `1px solid ${note.subject.color ? `${note.subject.color}35` : 'var(--border-color)'}`,
                  fontWeight: 600
                }}
              >
                📖 {note.subject.code || note.subject.name}
              </span>
            ) : note.project ? (
              <span className="badge badge-purple" style={{ fontSize: '10.5px', padding: '1.5px 7px', fontWeight: 600 }}>
                📁 {note.project.name}
              </span>
            ) : typeConfig ? (
              <span className={`badge ${typeConfig.badgeClass}`} style={{ fontSize: '10.5px', padding: '1.5px 7px' }}>
                <typeConfig.icon size={10} />
                <span>{typeConfig.label}</span>
              </span>
            ) : null}

            {/* Date */}
            <span style={{ fontSize: '10.5px', opacity: 0.8 }}>
              {new Date(note.updatedAt || note.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Right: Pin Button (Always visible if pinned, visible on hover if not) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              title={note.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
              className="btn btn-ghost btn-icon"
              style={{
                padding: '4px',
                color: note.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)',
                opacity: note.isPinned || isHovered ? 1 : 0.25,
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Pin size={13} style={{ fill: note.isPinned ? 'currentColor' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Row 2: Note Title (if distinct) */}
        {!isTitleGenericOrRepeated && (
          <h3
            style={{
              margin: '0 0 6px 0',
              fontSize: '14.5px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              transition: 'color var(--transition-fast)'
            }}
          >
            {note.title}
          </h3>
        )}

        {/* Row 3: Single Mini Progress Bar (Only when note has checklists) */}
        {features.checklist.active && (
          <div className="note-progress-container" style={{ margin: '0 0 8px 0', padding: '3px 8px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ☑️ {features.checklist.done}/{features.checklist.total} ({Math.round((features.checklist.done / features.checklist.total) * 100)}%)
            </span>
            <div className="note-progress-bar-bg" style={{ height: '4px' }}>
              <div
                className="note-progress-bar-fill"
                style={{ width: `${(features.checklist.done / features.checklist.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Row 4: Main Content Area - Maximized Space & Live Scrollable Preview */}
        <div
          className="snote-card-content-scroll"
          style={{
            margin: '0 0 6px 0',
            maxHeight: '160px',
            backgroundColor: 'var(--bg-primary)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {note.content ? (
            <MarkdownViewer
              content={note.content}
              className="markdown-preview-compact"
              onToggleTodo={
                onToggleTodo
                  ? (todoIndex) => {
                      const newContent = toggleChecklistItem(note.content || '', todoIndex);
                      onToggleTodo(note.id, todoIndex, newContent);
                    }
                  : undefined
              }
            />
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
              Chưa có nội dung ghi chép.
            </span>
          )}
        </div>
      </div>

      {/* Row 5: Footer with Tags, Direct Link Chip & Hover Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid var(--border-subtle)',
          minHeight: '28px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Quick Link Chip or Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {features.firstLink ? (
            <a
              href={features.firstLink}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                fontWeight: 600
              }}
              title={`Mở liên kết: ${features.firstLink}`}
            >
              <ExternalLink size={11} />
              <span>{features.firstLink.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
            </a>
          ) : note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 2).map((tag: any) => (
              <span
                key={tag.id || tag.name}
                className="badge badge-neutral"
                style={{ fontSize: '9.5px', padding: '1px 5px' }}
              >
                #{tag.name}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', opacity: 0.6 }}>
              {features.checklist.active ? 'Checklist' : 'Ghi chú'}
            </span>
          )}
        </div>

        {/* Right: Hover Action Toolbar (Zero visual clutter until hovered) */}
        <div
          className="note-card-hover-actions"
          style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          {onConvertToTask && (
            <button
              type="button"
              onClick={() => onConvertToTask(note)}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ padding: '3px 5px', color: 'var(--color-success)' }}
              title="Tạo Task từ ghi chú này"
            >
              <CheckSquare size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(note)}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ padding: '3px 5px', color: 'var(--accent-primary)' }}
            title="Chỉnh sửa bài ghi"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={() => onToggleArchive(note.id)}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ padding: '3px 5px', color: note.isArchived ? 'var(--color-warning)' : 'var(--text-muted)' }}
            title={note.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ bài ghi'}
          >
            <Archive size={13} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(note.id, note.title)}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ padding: '3px 5px', color: 'var(--color-danger)' }}
            title="Xóa bài ghi"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

