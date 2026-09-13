import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { MarkdownViewer } from '../../../components/common/MarkdownViewer';
import { ShareModal } from '../../../components/common/ShareModal';
import { api, ApiResponse } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { NoteType } from '@snote/shared';
import { autoFormatPlainTextToMarkdown, detectNoteType, extractNoteFeatures, toggleChecklistItem } from '../utils/smartNoteParser';
import { handleSmartListKeyDown } from '../utils/smartKeyboard';
import {
  BookOpen,
  ListOrdered,
  CheckSquare,
  Edit3,
  Sparkles,
  Save,
  Tag,
  Trash2,
  Share2,
  Check
} from 'lucide-react';

export type NoteModalMode = 'VIEW' | 'EDIT' | 'WRITE' | 'PREVIEW' | 'SPLIT';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  noteToEdit?: any | null;
  initialMode?: NoteModalMode;
  defaultProjectId?: string;
  defaultSubjectId?: string;
  onConvertToTask?: (note: any) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  noteToEdit,
  initialMode,
  defaultProjectId,
  defaultSubjectId,
  onConvertToTask
}) => {
  const { subjects, selectedSubjectId } = useAppFilter();
  const [projects, setProjects] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [noteType, setNoteType] = useState<NoteType>(NoteType.GENERAL);
  const [tagsInput, setTagsInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAutoFormatted, setIsAutoFormatted] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      api.get<ApiResponse<any[]>>('/projects')
        .then((res) => setProjects(res.data || []))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setContent(noteToEdit.content || '');
      setSubjectId(noteToEdit.subjectId || '');
      setProjectId(noteToEdit.projectId || '');
      setNoteType(noteToEdit.noteType || NoteType.GENERAL);
      setTagsInput((noteToEdit.tags || []).map((t: any) => t.name).join(', '));
      setIsEditing(initialMode === 'WRITE' || initialMode === 'EDIT');
    } else {
      setTitle('');
      setContent('');
      setSubjectId(defaultSubjectId || selectedSubjectId || '');
      setProjectId(defaultProjectId || '');
      setNoteType(defaultProjectId ? NoteType.PROJECT_LOG : (selectedSubjectId ? NoteType.LECTURE : NoteType.GENERAL));
      setTagsInput('');
      setIsEditing(true);
    }
  }, [noteToEdit, selectedSubjectId, subjects, isOpen, initialMode, defaultProjectId, defaultSubjectId]);

  // Insert natural plain text helper at cursor position
  const insertPlainText = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const textBefore = content.substring(0, start);
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const isAtStartOfLine = start === lineStart;

    // Tìm số thứ tự gần nhất ở các dòng phía trước
    const lines = textBefore.split('\n');
    let nextNum = 1;
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].trim().match(/^(\d+)\.\s/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
        break;
      }
    }

    const prefix = isAtStartOfLine ? `${nextNum}. ` : `\n${nextNum}. `;
    const selectedText = content.substring(start, end) || 'Mục danh sách';
    const newContent = content.substring(0, start) + prefix + selectedText + content.substring(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagNames = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (!content.trim()) {
      showToast('Vui lòng nhập nội dung ghi chú', 'warning');
      return;
    }

    setLoading(true);
    try {
      const finalTitle = title.trim() || undefined;
      if (noteToEdit) {
        await api.put(`/notes/${noteToEdit.id}`, {
          title: finalTitle,
          content,
          subjectId: subjectId || null,
          projectId: projectId || null,
          noteType,
          tagNames
        });
        showToast('Đã lưu ghi chú thành công!', 'success');
      } else {
        await api.post('/notes', {
          title: finalTitle,
          content,
          subjectId: subjectId || undefined,
          projectId: projectId || undefined,
          noteType,
          tagNames
        });
        showToast('Tạo ghi chú mới thành công!', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu ghi chú', 'error');
    } finally {
      setLoading(false);
    }
  };

  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  const features = useMemo(() => extractNoteFeatures(content), [content]);

  const handleToggleTodoInModal = async (todoIndex: number) => {
    const newContent = toggleChecklistItem(content, todoIndex);
    setContent(newContent);
    if (noteToEdit) {
      noteToEdit.content = newContent;
      try {
        await api.put(`/notes/${noteToEdit.id}`, { content: newContent });
        onSuccess();
      } catch {
        showToast('Lỗi cập nhật tiến độ công việc', 'error');
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
      onClose={onClose}
      title={
        noteToEdit
          ? isEditing
            ? 'Chỉnh Sửa Ghi Chú'
            : 'Chi Tiết Ghi Chú'
          : 'Tạo Ghi Chú Mới'
      }
      maxWidth="850px"
      icon={<BookOpen size={20} />}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* VIEW MODE: Direct clean note reader with metadata */}
        {!isEditing ? (
          <div>
            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.35
              }}
            >
              {title || 'Ghi chú chưa đặt tiêu đề'}
            </h2>

            {/* Subtle Metadata String */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '14px'
              }}
            >
              <span>
                📅 {noteToEdit?.createdAt ? new Date(noteToEdit.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Vừa tạo'}
              </span>
              {noteToEdit?.updatedAt && noteToEdit.updatedAt !== noteToEdit.createdAt && (
                <>
                  <span>•</span>
                  <span>✏️ Cập nhật: {new Date(noteToEdit.updatedAt).toLocaleDateString('vi-VN')}</span>
                </>
              )}
              {subjectId && (
                <>
                  <span>•</span>
                  <span style={{ color: subjects.find((s) => s.id === subjectId)?.color || 'var(--accent-primary)', fontWeight: 600 }}>
                    📖 {subjects.find((s) => s.id === subjectId)?.code ? `[${subjects.find((s) => s.id === subjectId)?.code}] ` : ''}
                    {subjects.find((s) => s.id === subjectId)?.name}
                  </span>
                </>
              )}
              {projectId && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--color-purple)', fontWeight: 600 }}>
                    📁 {projects.find((p) => p.id === projectId)?.name}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                {noteType === NoteType.LECTURE ? 'Bài giảng' : noteType === NoteType.LAB_REPORT ? 'Thực hành' : noteType === NoteType.EXAM_PREP ? 'Ôn thi' : noteType === NoteType.PROJECT_LOG ? 'Dự án / BTL' : noteType === NoteType.MEETING_MINUTES ? 'Họp nhóm' : 'Ghi chú'}
              </span>
              <span>•</span>
              <span>📝 {words} từ</span>
              {tagsInput.trim() && (
                <>
                  <span>•</span>
                  <span>🏷️ {tagsInput}</span>
                </>
              )}
            </div>

            {/* List Progress Bar (If note contains checklist items) */}
            {features.checklist.active && (
              <div className="note-progress-container" style={{ marginBottom: '12px' }}>
                <CheckSquare size={13} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Tiến độ: {features.checklist.done}/{features.checklist.total} ({Math.round((features.checklist.done / features.checklist.total) * 100)}%)
                </span>
                <div className="note-progress-bar-bg">
                  <div
                    className="note-progress-bar-fill"
                    style={{ width: `${(features.checklist.done / features.checklist.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Formatted Content Body with interactive checklist */}
            <div
              className="snote-card"
              style={{
                minHeight: '260px',
                maxHeight: '480px',
                overflowY: 'auto',
                padding: '20px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {content.trim() ? (
                <MarkdownViewer content={content} onToggleTodo={handleToggleTodoInModal} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  <i>Chưa có nội dung ghi chú. Nhấp <b>"Chỉnh sửa ghi chú"</b> để thêm nội dung.</i>
                </div>
              )}
            </div>

            {/* View Mode Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={15} />
                  <span>Chỉnh Sửa Ghi Chú</span>
                </button>
                {noteToEdit && (
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="btn btn-secondary"
                    style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Chia sẻ ghi chú này cho bạn học hoặc tạo link công khai"
                  >
                    <Share2 size={15} />
                    <span>Chia sẻ</span>
                  </button>
                )}
                {onConvertToTask && noteToEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onConvertToTask(noteToEdit);
                    }}
                    className="btn btn-secondary"
                    style={{ fontWeight: 600, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Chuyển ghi chú này thành một công việc (Task)"
                  >
                    <CheckSquare size={15} />
                    <span>Chuyển thành Task</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* EDIT / CREATE MODE: Natural Plaintext Note Editor */
          <>
            {/* Title Input (Optional - Google Keep / Apple Notes style) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Tiêu đề ghi chú
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tùy chọn (để trống sẽ tự lấy dòng đầu tiên)
                </span>
              </div>
              <input
                type="text"
                placeholder="Nhập tiêu đề hoặc để trống và gõ trực tiếp nội dung bên dưới..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="snote-input"
                style={{ fontSize: '14.5px', fontWeight: 600 }}
              />
            </div>

            {/* Subject & Project Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Môn học liên quan (Tùy chọn)
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="snote-select"
                >
                  <option value="">📝 Ghi chú tự do / Cá nhân (Không thuộc môn học)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `[${sub.code}] ` : ''}{sub.name} ({sub.credits} TC)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Dự án / Đồ án liên kết (Tùy chọn)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="snote-select"
                >
                  <option value="">-- Không gắn dự án --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note Type & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Phân loại ghi chú
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const detected = detectNoteType(title, content);
                      setNoteType(detected);
                      showToast(`Đã tự động nhận diện loại: ${detected}`, 'info');
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', padding: '1px 6px', color: 'var(--accent-primary)', fontWeight: 600 }}
                    title="Tự động nhận diện loại ghi chú dựa trên tiêu đề & nội dung"
                  >
                    ✨ Tự nhận diện
                  </button>
                </div>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as NoteType)}
                  className="snote-select"
                >
                  <option value={NoteType.GENERAL}>📝 Ghi chú chung / Ý tưởng tự do (General)</option>
                  <option value={NoteType.LECTURE}>📖 Bài giảng lý thuyết (Lecture)</option>
                  <option value={NoteType.LAB_REPORT}>🧪 Báo cáo thực hành (Lab)</option>
                  <option value={NoteType.EXAM_PREP}>🎯 Ôn thi / Đề cương (Exam Prep)</option>
                  <option value={NoteType.PROJECT_LOG}>🛠️ Nhật ký dự án / BTL (Project Log)</option>
                  <option value={NoteType.MEETING_MINUTES}>👥 Biên bản họp nhóm (Meeting)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Thẻ phân loại tags (Phân cách bằng dấu phẩy)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                    <Tag size={15} />
                  </span>
                  <input
                    type="text"
                    placeholder="Kế hoạch, Bài tập, Ôn tập, Tài liệu..."
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="snote-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </div>

            {/* Plaintext Content Field with Natural Quick Actions */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                {/* Natural Plaintext Quick Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={insertNumberedList}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Chèn danh sách đánh số thứ tự (1., 2., 3...)"
                  >
                    <ListOrdered size={13} />
                    <span>Danh sách</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertPlainText('[ ] ', '', 'Công việc cần làm')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Chèn ô việc cần làm (Checkbox)"
                  >
                    <CheckSquare size={13} />
                    <span>Việc cần làm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const formatted = autoFormatPlainTextToMarkdown(content);
                      setContent(formatted);
                      setIsAutoFormatted(true);
                      showToast('✨ Đã tự động chuẩn hóa danh sách & liên kết!', 'success');
                      setTimeout(() => setIsAutoFormatted(false), 2000);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '12px',
                      padding: '3px 10px',
                      color: isAutoFormatted ? 'var(--color-success)' : 'var(--accent-primary)',
                      backgroundColor: isAutoFormatted ? 'rgba(16, 185, 129, 0.15)' : undefined,
                      borderColor: isAutoFormatted ? 'var(--color-success)' : undefined,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all var(--transition-fast)'
                    }}
                    title="Tự động nhận diện thụt lề, danh sách, checklist, liên kết từ văn bản thuần túy"
                  >
                    {isAutoFormatted ? <Check size={12} /> : <Sparkles size={12} />}
                    <span>{isAutoFormatted ? 'Đã nhận diện' : 'Tự nhận diện'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>📝 {words} từ</span>
                </div>
              </div>

              {/* Natural Textarea with Smart List Keyboard Controller */}
              <textarea
                ref={textareaRef}
                rows={12}
                placeholder="Nhập nội dung ghi chú tự nhiên (bạn có thể gõ danh sách với dấu • hoặc 1., ô việc cần làm [ ], đường link web, các mục thụt lề... hệ thống sẽ tự động hiển thị đẹp mắt)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  } else {
                    handleSmartListKeyDown(e, content, setContent);
                  }
                }}
                className="snote-textarea"
                style={{
                  lineHeight: '1.65',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '260px'
                }}
              />
            </div>

            {/* Edit Mode Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <div>
                {noteToEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontWeight: 600, color: 'var(--text-secondary)' }}
                  >
                    ← Quay lại xem chi tiết
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  <Save size={15} />
                  <span>{loading ? 'Đang lưu trữ...' : noteToEdit ? 'Lưu Thay Đổi' : 'Tạo Ghi Chú'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>

    {noteToEdit && (
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        targetType="NOTE"
        targetId={noteToEdit.id}
        targetTitle={noteToEdit.title || 'Ghi chú'}
      />
    )}
  </>
);
};
