import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createWorkspace } from '../../shared/api';
import type { Workspace } from '../../shared/types';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ws: Workspace) => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createWorkspace({ name: name.trim() });
      onCreated(res.data);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi tạo workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo Workspace độc lập</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng"><X size={16} /></button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên Workspace</label>
            <input
              className="form-input"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Dự án nghiên cứu..."
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
