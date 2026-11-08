import React, { useEffect, useState } from 'react';
import { CheckCircle2, Archive } from 'lucide-react';
import type { Class, Policy, Account } from '../../shared/types';
import {
  getClassPolicy,
  updateClassPolicy,
  archiveClass,
  restoreClass,
  transferClassOwnership,
} from '../../shared/api';

interface ClassSettingsViewProps {
  cls: Class;
  currentUser: Account | null;
  onClassUpdated: (updated: Class) => void;
}

export function ClassSettingsView({ cls, currentUser, onClassUpdated }: ClassSettingsViewProps) {
  const [activeSection, setActiveSection] = useState<number | null>(1); // 1 to 4
  const [policy, setPolicy] = useState<Policy>({
    groupLimit: 1,
    roleActions: {},
    lateFirst: 'allow',
    lateRevision: 'allow',
  });
  const [groupLimit, setGroupLimit] = useState(1);
  const [lateFirst, setLateFirst] = useState<'allow' | 'lock'>('allow');
  const [lateRevision, setLateRevision] = useState<'allow' | 'lock'>('allow');
  const [transferRecipientId, setTransferRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isOwner = currentUser?.id === cls.ownerId;

  const loadPolicy = async () => {
    try {
      const res = await getClassPolicy(cls.id);
      setPolicy(res.data);
      if (res.data.groupLimit) setGroupLimit(res.data.groupLimit);
      if (res.data.lateFirst) setLateFirst(res.data.lateFirst);
      if (res.data.lateRevision) setLateRevision(res.data.lateRevision);
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi tải cấu hình');
    }
  };

  useEffect(() => {
    void loadPolicy();
  }, [cls.id]);

  const handleSavePolicy = async (newPolicy: Policy) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateClassPolicy(cls.id, newPolicy, cls.version);
      setPolicy(res.data);
      setInfo('Đã lưu cấu hình chính sách lớp thành công!');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi lưu cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveToggle = async () => {
    const isCurrentlyArchived = cls.status === 'archived';
    const msg = isCurrentlyArchived
      ? 'Bạn có muốn khôi phục lại lớp học này?'
      : 'Bạn có chắc chắn muốn lưu trữ lớp học này? Lời mời chưa duyệt sẽ bị vô hiệu hóa.';
    if (!confirm(msg)) return;

    setLoading(true);
    setError(null);
    try {
      const res = isCurrentlyArchived
        ? await restoreClass(cls.id, cls.version)
        : await archiveClass(cls.id, cls.version);
      onClassUpdated(res.data);
      setInfo(isCurrentlyArchived ? 'Đã khôi phục lớp thành công!' : 'Đã lưu trữ lớp học.');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi lưu trữ/khôi phục');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRecipientId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await transferClassOwnership(cls.id, transferRecipientId.trim());
      setInfo('Đã gửi yêu cầu bàn giao quyền chủ lớp! Người nhận cần chấp nhận để hoàn tất.');
      setTransferRecipientId('');
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi bàn giao');
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="section-box" style={{ textAlign: 'center', padding: '40px 0' }}>
        <h2>Không có quyền truy cập</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Chỉ giáo viên chủ lớp mới có quyền xem và chỉnh sửa Cài đặt lớp.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Cài đặt lớp học: {cls.name}</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Trạng thái:</span>
            {cls.status === 'active' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: 500 }}>
                <CheckCircle2 size={13} />
                <span>Đang hoạt động</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 500 }}>
                <Archive size={13} />
                <span>Đã lưu trữ</span>
              </span>
            )}
            <span>(Phiên bản {cls.version})</span>
          </span>
        </div>

        <button
          className={`btn ${cls.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleArchiveToggle}
          disabled={loading}
        >
          {cls.status === 'active' ? 'Lưu trữ lớp học' : 'Khôi phục lớp học'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
      {info && <div style={{ color: 'var(--success)', marginBottom: 12, fontSize: '0.875rem' }}>{info}</div>}

      {/* Accordion 4 sections (CUXC-10, E5) */}
      <div className="section-box">
        {/* Phần 1: Giới hạn nhóm */}
        <div className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setActiveSection(activeSection === 1 ? null : 1)}
          >
            <span>1. Giới hạn nhóm (Group Limit)</span>
            <span>{activeSection === 1 ? '▲' : '▼'}</span>
          </button>
          {activeSection === 1 && (
            <div className="accordion-content">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Số lượng nhóm tối đa mà mỗi học sinh được phép tham gia cùng lúc trong lớp này (mặc định: 1).
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  style={{ width: 100 }}
                  value={groupLimit}
                  onChange={e => setGroupLimit(Number(e.target.value))}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSavePolicy({ ...policy, groupLimit })}
                  disabled={loading}
                >
                  Cập nhật giới hạn
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Phần 2: Quyền tạo / duyệt nhóm */}
        <div className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setActiveSection(activeSection === 2 ? null : 2)}
          >
            <span>2. Quyền tạo & duyệt nhóm</span>
            <span>{activeSection === 2 ? '▲' : '▼'}</span>
          </button>
          {activeSection === 2 && (
            <div className="accordion-content">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Quy định học sinh trong lớp có quyền tự tạo nhóm mới hay chỉ giáo viên mới được tạo nhóm. Mọi quyết định gia nhập nhóm đều được đồng bộ và kiểm tra tại thời điểm commit.
              </p>
              <div style={{ marginTop: 12 }}>
                <span className="badge badge-success">Mặc định: Thành viên lớp có quyền tạo nhóm</span>
              </div>
            </div>
          )}
        </div>

        {/* Phần 3: Quyền lớp trưởng (Monitor actions permissions) */}
        <div className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setActiveSection(activeSection === 3 ? null : 3)}
          >
            <span>3. Quyền lớp trưởng (Monitor Defaults)</span>
            <span>{activeSection === 3 ? '▲' : '▼'}</span>
          </button>
          {activeSection === 3 && (
            <div className="accordion-content">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Bảng quyền mặc định cho Lớp trưởng cấp lớp theo PER-09/10:
              </p>
              <ul style={{ fontSize: '0.85rem', paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Duyệt yêu cầu vào nhóm (<code>group.approve</code>)</li>
                <li>Chỉnh sửa nội dung ghi chú/văn bản chung (<code>task.edit_common</code>, <code>library.edit_text</code>, <code>library.edit_link</code>)</li>
                <li>Chỉnh sửa lịch sự kiện chung (<code>event.edit</code>)</li>
                <li><em>Không có quyền xóa tệp, hủy sự kiện hay mở hộp thu riêng của người khác (QA-04).</em></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phần 4: Hai mặc định nộp sau hạn */}
        <div className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setActiveSection(activeSection === 4 ? null : 4)}
          >
            <span>4. Hai mặc định nộp sau hạn (Late Submissions)</span>
            <span>{activeSection === 4 ? '▲' : '▼'}</span>
          </button>
          {activeSection === 4 && (
            <div className="accordion-content">
              <div className="form-group">
                <label className="form-label">Cho phép nộp lần đầu khi đã quá hạn</label>
                <select
                  className="form-select"
                  value={lateFirst}
                  onChange={e => setLateFirst(e.target.value as 'allow' | 'lock')}
                >
                  <option value="allow">Cho phép nộp muộn (Ghi nhận nhãn Nộp muộn)</option>
                  <option value="lock">Khóa nộp lần đầu sau hạn</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cho phép sửa bản nộp khi đã quá hạn</label>
                <select
                  className="form-select"
                  value={lateRevision}
                  onChange={e => setLateRevision(e.target.value as 'allow' | 'lock')}
                >
                  <option value="allow">Cho phép cập nhật phiên bản mới</option>
                  <option value="lock">Khóa sửa bản nộp sau hạn</option>
                </select>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSavePolicy({ ...policy, lateFirst, lateRevision })}
                disabled={loading}
              >
                Lưu cài đặt nộp bài
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bàn giao quyền sở hữu lớp */}
      <div className="section-box">
        <div className="section-title">Bàn giao quyền chủ lớp (Ownership Transfer)</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Chuyển giao toàn quyền sở hữu lớp học cho một giáo viên khác là thành viên trong lớp.
        </p>

        <form onSubmit={handleTransfer} style={{ display: 'flex', gap: 8, maxWidth: 440 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Mã tài khoản giáo viên nhận bàn giao..."
            value={transferRecipientId}
            onChange={e => setTransferRecipientId(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary">
            Bắt đầu bàn giao
          </button>
        </form>
      </div>
    </div>
  );
}
