import React, { useState } from 'react';
import { Pin, Plus, Trash2, Tag, Check, Sparkles } from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'architecture' | 'deadline' | 'meeting' | 'general';
  isPinned: boolean;
  updatedAt: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n-1',
    title: 'Quy ước thiết kế: Monochrome B&W và Không chèn màu accent',
    content: 'Tuyệt đối không chèn mã màu xanh Indigo, Mint hay các màu rực rỡ ngoài token chuẩn. Độ tương phản chữ phụ luôn đảm bảo > 4.5:1 (WCAG AA).',
    category: 'architecture',
    isPinned: true,
    updatedAt: '08/11/2026',
  },
  {
    id: 'n-2',
    title: 'Hạn chót bảo vệ đồ án chuyên ngành',
    content: 'Buổi bảo vệ đồ án diễn ra vào 20/11/2026 tại phòng Lab H1. Tất cả các nhóm phải nộp phiên bản cuối cùng trước 23:59 ngày 15/11/2026.',
    category: 'deadline',
    isPinned: true,
    updatedAt: '07/11/2026',
  },
  {
    id: 'n-3',
    title: 'Ghi chú kỹ thuật: Zero-Reflow với will-change',
    content: 'Áp dụng will-change: width, min-width, max-width cho sidebar 240ms để GPU tính toán trước compositing, tránh hiện tượng Reflow và lag giao diện.',
    category: 'architecture',
    isPinned: false,
    updatedAt: '06/11/2026',
  },
  {
    id: 'n-4',
    title: 'Lịch họp trực tuyến với Giáo viên hướng dẫn',
    content: 'Thứ Ba hàng tuần lúc 08:30 sáng trên Google Meet. Trưởng nhóm cần tổng hợp báo cáo tiến độ 3 trục trước buổi họp.',
    category: 'meeting',
    isPinned: false,
    updatedAt: '04/11/2026',
  },
];

export const Tab14WorkspaceNotes: React.FC = () => {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: 'general',
      isPinned: false,
      updatedAt: 'Hôm nay',
    };
    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    showNotice(`Đã thêm ghi chú "${newNote.title}"`);
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    showNotice('Đã xóa ghi chú');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview & Quick Composer */}
      <form onSubmit={handleAddNote} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Ghi chú & Mục lưu ý Workspace (UXR-12)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Lưu trữ các ghi chú quan sát nhanh, tiêu chuẩn kỹ thuật hoặc thông báo nội bộ cho không gian làm việc.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="Tiêu đề mục lưu ý..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            required
          />
          <textarea
            rows={2}
            placeholder="Nội dung chi tiết..."
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} />
          <span>Ghi lại mục này</span>
        </button>
      </form>

      {/* Notes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {notes.map(note => (
          <div
            key={note.id}
            style={{
              background: 'var(--surface-card)',
              border: note.isPinned ? '2px solid var(--text-primary)' : '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '160px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                  {note.title}
                </h3>

                <button
                  type="button"
                  onClick={() => handleTogglePin(note.id)}
                  style={{ background: 'none', border: 'none', color: note.isPinned ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
                  title={note.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                >
                  <Pin size={15} style={{ transform: note.isPinned ? 'rotate(45deg)' : 'none' }} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                {note.content}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-divider)', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Cập nhật: {note.updatedAt}</span>

              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                style={{ background: 'none', border: 'none', color: 'rgba(248, 113, 113, 0.8)', cursor: 'pointer' }}
                title="Xóa ghi chú"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
