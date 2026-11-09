import React, { useState } from 'react';
import { FolderKanban, Users, Plus, ArrowRight, Check, Send, Sparkles } from 'lucide-react';

interface GroupInfo {
  id: string;
  name: string;
  leadName: string;
  memberCount: number;
  maxMembers: number;
  isMyGroup?: boolean;
}

const GROUPS_DATA: GroupInfo[] = [
  { id: 'g-01', name: 'Nhóm 01 - AI & Data Platform', leadName: 'Lê Hoàng Nam', memberCount: 4, maxMembers: 5, isMyGroup: true },
  { id: 'g-02', name: 'Nhóm 02 - Web Collaboration Engine', leadName: 'Phạm Quỳnh Anh', memberCount: 5, maxMembers: 5 },
  { id: 'g-03', name: 'Nhóm 03 - Cloud Microservices', leadName: 'Vũ Đức Thịnh', memberCount: 3, maxMembers: 5 },
  { id: 'g-04', name: 'Nhóm 04 - Mobile Native Client', leadName: 'Đỗ Quốc Bảo', memberCount: 2, maxMembers: 5 },
];

export const Tab04ClassGroupsStudent: React.FC = () => {
  const [requestedGroupId, setRequestedGroupId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const myGroup = GROUPS_DATA.find(g => g.isMyGroup);
  const otherGroups = GROUPS_DATA.filter(g => !g.isMyGroup);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRequestJoin = (groupId: string, groupName: string) => {
    setRequestedGroupId(groupId);
    showNotice(`Đã gửi yêu cầu gia nhập ${groupName} tới Trưởng nhóm và Giáo viên (UC-04)`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Pinned Card: Nhóm của bạn */}
      {myGroup && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '2px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '20px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '4px', background: 'var(--text-primary)', color: 'var(--bg-app)', fontWeight: 700 }}>
              Nhóm của bạn
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giới hạn 1 nhóm/học sinh (CLS-06)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                {myGroup.name}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Trưởng nhóm: <strong style={{ color: 'var(--text-primary)' }}>{myGroup.leadName}</strong> • Sĩ số: <strong>{myGroup.memberCount}/{myGroup.maxMembers} thành viên</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
              onClick={() => showNotice(`Đang mở Workspace độc lập của ${myGroup.name}`)}
            >
              <span>Vào Workspace nhóm</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Danh sách các nhóm khác trong lớp */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Tất cả các nhóm khác trong lớp ({otherGroups.length} nhóm)
          </h2>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} />
            <span>Đề xuất tạo nhóm mới</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {otherGroups.map(g => {
            const isFull = g.memberCount >= g.maxMembers;
            const hasRequested = requestedGroupId === g.id;

            return (
              <div
                key={g.id}
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-divider)',
                  borderRadius: '8px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FolderKanban size={16} style={{ color: 'var(--text-primary)' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {g.name}
                    </h3>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Trưởng nhóm: <span style={{ color: 'var(--text-primary)' }}>{g.leadName}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: isFull ? 'rgba(248, 113, 113, 0.9)' : 'var(--text-secondary)' }}>
                    Sĩ số: {g.memberCount}/{g.maxMembers} {isFull ? '(Đã đủ số lượng)' : `(Còn ${g.maxMembers - g.memberCount} chỗ)`}
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-divider)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={isFull || hasRequested}
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                    onClick={() => handleRequestJoin(g.id, g.name)}
                  >
                    {hasRequested ? 'Đã gửi yêu cầu' : isFull ? 'Đã đủ người' : 'Xin vào nhóm (UC-04)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal đề xuất tạo nhóm */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '440px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>Đề xuất lập nhóm mới</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Khi bạn tạo nhóm, bạn sẽ trở thành Trưởng nhóm (PER-03). Theo quy tắc CLS-06, nếu đã thuộc nhóm khác bạn sẽ cần rời nhóm hiện tại trước.
            </p>
            <input
              type="text"
              placeholder="vd: Nhóm 05 - Microservices"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (newGroupName.trim()) {
                    showNotice(`Đã gửi yêu cầu lập "${newGroupName}" tới Giáo viên phê duyệt`);
                    setShowCreateModal(false);
                    setNewGroupName('');
                  }
                }}
              >
                Gửi đề xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
