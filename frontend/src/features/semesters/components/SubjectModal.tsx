import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { BookOpen, User, Tag, Palette, Save, Award } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultSemesterId?: string | null;
  initialData?: any | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultSemesterId,
  initialData
}) => {
  const { semesters, refreshFilterData } = useAppFilter();
  const [semesterId, setSemesterId] = useState<string>('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [lecturer, setLecturer] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isEditing = Boolean(initialData?.id);

  const colorPresets = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f97316', // Orange
    '#ef4444', // Red
    '#a855f7', // Purple
    '#ec4899'  // Pink
  ];

  useEffect(() => {
    if (initialData) {
      setSemesterId(initialData.semesterId || defaultSemesterId || (semesters[0]?.id ?? ''));
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setCredits(initialData.credits || 3);
      setLecturer(initialData.lecturer || '');
      setColor(initialData.color || '#6366f1');
    } else {
      if (defaultSemesterId) {
        setSemesterId(defaultSemesterId);
      } else if (semesters.length > 0) {
        setSemesterId(semesters[0].id);
      }
      setName('');
      setCode('');
      setCredits(3);
      setLecturer('');
      setColor('#6366f1');
    }
  }, [defaultSemesterId, semesters, isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên môn học', 'error');
      return;
    }
    if (!semesterId) {
      showToast('Vui lòng chọn học kỳ tương ứng', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/subjects/${initialData.id}`, {
          semesterId,
          name: name.trim(),
          code: code.trim() || undefined,
          credits: Number(credits),
          lecturer: lecturer.trim() || undefined,
          color
        });
        showToast('Cập nhật môn học thành công!', 'success');
      } else {
        await api.post('/subjects', {
          semesterId,
          name: name.trim(),
          code: code.trim() || undefined,
          credits: Number(credits),
          lecturer: lecturer.trim() || undefined,
          color
        });
        showToast('Tạo môn học mới thành công!', 'success');
      }

      await refreshFilterData();
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu môn học', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Môn Học' : 'Thêm Môn Học Mới'}
      maxWidth="620px"
      icon={<BookOpen size={20} />}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Học kỳ đào tạo *
          </label>
          <select
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            required
            className="snote-select"
          >
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name} {sem.isCurrent ? '⚡ (Hiện tại)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Tên môn học *
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Cơ sở dữ liệu nâng cao & Thiết kế Hệ thống"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="snote-input"
            style={{ fontSize: '14.5px', fontWeight: 600 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Mã học phần
            </label>
            <input
              type="text"
              placeholder="IT4020"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="snote-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Số tín chỉ *
            </label>
            <input
              type="number"
              min="1"
              max="12"
              required
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value, 10) || 1)}
              className="snote-input"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Giảng viên giảng dạy / Hướng dẫn
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <User size={15} />
            </span>
            <input
              type="text"
              placeholder="TS. Nguyễn Văn B"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              className="snote-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Color presets */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Mã màu nhận diện môn học
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {colorPresets.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: c,
                  border: color === c ? '3px solid #ffffff' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: color === c ? '0 0 0 2px var(--accent-primary)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '36px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                cursor: 'pointer',
                padding: '2px'
              }}
              title="Chọn màu tùy biến"
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{color}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Save size={15} />
            <span>{loading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Tạo Môn Học'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
