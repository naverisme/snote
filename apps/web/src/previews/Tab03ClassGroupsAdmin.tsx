import React, { useState } from 'react';
import { FolderKanban, Users, Plus, ArrowRight, ShieldCheck, MoreVertical, Archive, Check } from 'lucide-react';

interface GroupCardItem {
  id: string;
  name: string;
  leadName: string;
  memberCount: number;
  maxMembers: number;
  submittedCount: number;
  totalAssignments: number;
}

const INITIAL_GROUPS: GroupCardItem[] = [
  { id: 'g-01', name: 'Nhóm 01 - AI & Data Platform', leadName: 'Lê Hoàng Nam', memberCount: 4, maxMembers: 5, submittedCount: 3, totalAssignments: 4 },
  { id: 'g-02', name: 'Nhóm 02 - Web Collaboration Engine', leadName: 'Phạm Quỳnh Anh', memberCount: 5, maxMembers: 5, submittedCount: 4, totalAssignments: 4 },
  { id: 'g-03', name: 'Nhóm 03 - Cloud Microservices', leadName: 'Vũ Đức Thịnh', memberCount: 3, maxMembers: 5, submittedCount: 2, totalAssignments: 4 },
  { id: 'g-04', name: 'Nhóm 04 - Mobile Native Client', leadName: 'Đỗ Quốc Bảo', memberCount: 2, maxMembers: 5, submittedCount: 1, totalAssignments: 4 },
];

export const Tab03ClassGroupsAdmin: React.FC = () => {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newGroup: GroupCardItem = {
      id: `g-0${groups.length + 1}`,
      name: newGroupName.trim(),
      leadName: 'Chưa chỉ định',
      memberCount: 1,
      maxMembers: 5,
      submittedCount: 0,
      totalAssignments: 4,
    };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setShowCreateModal(false);
    showNotice(`Đã khởi tạo "${newGroup.name}" thành công`);
  };

  const handleArchiveGroup = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn lưu trữ ${name} (CLS-16)?`)) {
      setGroups(groups.filter(g => g.id !== id));
      showNotice(`Đã chuyển ${name} vào kho lưu trữ`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Toolbar */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Quản trị Nhóm trong lớp (Giáo viên chủ lớp - PER-01)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Tổng cộng: {groups.length} nhóm học tập • Giới hạn sĩ số tối đa: 5 thành viên/nhóm (CLS-07)
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={15} />
          <span>Tạo nhóm mới</span>
        </button>
      </div>

      {/* Bento Groups Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {groups.map(g => {
          const isFull = g.memberCount >= g.maxMembers;
          const progressPercent = Math.round((g.memberCount / g.maxMembers) * 100);

          return (
            <div
              key={g.id}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderKanban size={18} style={{ color: 'var(--text-primary)' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {g.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
                    title="Lưu trữ nhóm"
                    onClick={() => handleArchiveGroup(g.id, g.name)}
                  >
                    <Archive size={15} />
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Trưởng nhóm: <strong style={{ color: 'var(--text-primary)' }}>{g.leadName}</strong>
                </div>

                {/* Sĩ số Capacity Meter */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sĩ số thành viên (CLS-07):</span>
                    <span style={{ fontWeight: 600, color: isFull ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {g.memberCount} / {g.maxMembers} {isFull ? '(Đã đủ)' : ''}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--text-primary)', borderRadius: '3px' }} />
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Tiến độ nộp bài: <strong>{g.submittedCount}/{g.totalAssignments} bài giao</strong>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-divider)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  onClick={() => showNotice(`Đang chuyển hướng vào Workspace của ${g.name}`)}
                >
                  <span>Kiểm tra Workspace</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tạo nhóm mới */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <form onSubmit={handleCreateGroup} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '440px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Tạo nhóm học tập mới</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Mỗi nhóm khi tạo sẽ sở hữu một Workspace độc lập thuộc lớp học (CLS-16).
            </p>
            <input
              type="text"
              placeholder="vd: Nhóm 05 - Cloud Architecture"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '20px' }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary btn-sm">Tạo nhóm</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
