import React, { useEffect, useState } from 'react';
import { X, Plus, FolderKanban, ArrowRight } from 'lucide-react';
import type { Class, Workspace, Account } from '../../shared/types';
import {
  listClassGroups,
  createClassGroup,
  createGroupJoinRequest,
  createGroupInvitation,
  leaveGroup,
} from '../../shared/api';

interface ClassGroupsViewProps {
  cls: Class;
  currentUser: Account | null;
  onOpenGroupWorkspace: (ws: Workspace) => void;
}

export function ClassGroupsView({ cls, currentUser, onOpenGroupWorkspace }: ClassGroupsViewProps) {
  const [groups, setGroups] = useState<Workspace[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isOwner = currentUser?.id === cls.ownerId;

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listClassGroups(cls.id);
      if (!res.data || res.data.length === 0) {
        setGroups([
          { id: 'ws-team-01', name: 'Nhóm 01 - AI Research', kind: 'class_group', classId: cls.id, ownerId: 'u-lead-01', status: 'active', timeZone: cls.timeZone, version: 1 },
          { id: 'ws-team-02', name: 'Nhóm 02 - Web Platform', kind: 'class_group', classId: cls.id, ownerId: 'u-lead-02', status: 'active', timeZone: cls.timeZone, version: 1 },
          { id: 'ws-team-03', name: 'Nhóm 03 - Cloud Engine', kind: 'class_group', classId: cls.id, ownerId: 'u-lead-03', status: 'active', timeZone: cls.timeZone, version: 1 },
        ]);
      } else {
        setGroups(res.data);
      }
    } catch {
      // Giữ mock groups cho preview UI
      setGroups([
        { id: 'ws-team-01', name: 'Nhóm 01 - AI Research', kind: 'class_group', classId: cls.id, ownerId: 'u-lead-01', status: 'active', timeZone: cls.timeZone, version: 1 },
        { id: 'ws-team-02', name: 'Nhóm 02 - Web Platform', kind: 'class_group', classId: cls.id, ownerId: 'u-lead-02', status: 'active', timeZone: cls.timeZone, version: 1 },
        { id: 'ws-team-03', name: 'Nhóm 03 - Cloud Engine', kind: 'class_group', classId: cls.id, ownerId: 'u-lead-03', status: 'active', timeZone: cls.timeZone, version: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, [cls.id]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await createClassGroup(cls.id, { name: newGroupName.trim() });
      setInfo(`Đã tạo nhóm "${newGroupName}" thành công!`);
      setNewGroupName('');
      setShowCreateModal(false);
      await loadGroups();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi tạo nhóm');
    }
  };

  const handleJoinRequest = async (groupId: string) => {
    try {
      await createGroupJoinRequest(groupId);
      setInfo('Đã gửi yêu cầu tham gia nhóm!');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi gửi yêu cầu');
    }
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Nhóm trong lớp: {cls.name}</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Chọn một nhóm để chuyển sang Workspace của nhóm đó
          </span>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Tạo nhóm mới
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
      {info && <div style={{ color: 'var(--success)', marginBottom: 12, fontSize: '0.875rem' }}>{info}</div>}

      <div className="section-box">
        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            Chưa có nhóm nào được tạo trong lớp này.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên nhóm</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.name}</strong>
                    </td>
                    <td><span className="badge badge-info">Nhóm lớp</span></td>
                    <td>
                      {g.status === 'active' ? (
                        <span className="badge badge-success">Hoạt động</span>
                      ) : (
                        <span className="badge badge-warning">Đã lưu trữ</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginRight: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => onOpenGroupWorkspace(g)}
                      >
                        <span>Vào Workspace nhóm</span>
                        <ArrowRight size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleJoinRequest(g.id)}
                      >
                        Xin vào
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tạo nhóm mới trong lớp</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)} aria-label="Đóng"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label className="form-label">Tên nhóm</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Ví dụ: Nhóm 1, Nhóm Robot..."
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
