import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createClass } from '../../shared/api';
import type { Class } from '../../shared/types';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (cls: Class) => void;
}

export function CreateClassModal({ isOpen, onClose, onCreated }: CreateClassModalProps) {
  const [name, setName] = useState('');
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createClass({ name: name.trim(), timeZone });
      onCreated(res.data);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi tạo lớp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo lớp học mới</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng"><X size={16} /></button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên lớp học</label>
            <input
              className="form-input"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Lớp 10A Toán..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Múi giờ lớp</label>
            <input
              className="form-input"
              type="text"
              required
              value={timeZone}
              onChange={e => setTimeZone(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo lớp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
