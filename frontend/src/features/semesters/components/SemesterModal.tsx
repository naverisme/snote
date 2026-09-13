import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { api, ApiResponse } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAppFilter, SemesterOption } from '../../../contexts/AppFilterContext';
import { Layers, Calendar, Save } from 'lucide-react';

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSemester?: SemesterOption) => void;
  initialData?: SemesterOption | null;
}

export const SemesterModal: React.FC<SemesterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [isCurrent, setIsCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { refreshFilterData } = useAppFilter();

  const isEditing = Boolean(initialData?.id);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAcademicYear(initialData.academicYear || '2025-2026');
      setIsCurrent(Boolean(initialData.isCurrent));
    } else {
      setName('');
      setAcademicYear('2025-2026');
      setIsCurrent(false);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên học kỳ', 'error');
      return;
    }

    setLoading(true);
    try {
      let savedSemester: any;
      if (isEditing && initialData?.id) {
        const res = await api.put<ApiResponse<any>>(`/semesters/${initialData.id}`, {
          name: name.trim(),
          academicYear: academicYear.trim(),
          isCurrent
        });
        savedSemester = res.data;
        showToast('Cập nhật học kỳ thành công!', 'success');
      } else {
        const res = await api.post<ApiResponse<any>>('/semesters', {
          name: name.trim(),
          academicYear: academicYear.trim(),
          isCurrent
        });
        savedSemester = res.data;
        showToast('Tạo học kỳ mới thành công!', 'success');
      }

      await refreshFilterData();
      onSuccess(savedSemester);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu học kỳ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Học Kỳ' : 'Thêm Học Kỳ Mới'}
      maxWidth="500px"
      icon={<Layers size={20} />}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Tên học kỳ *
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Học kỳ 1 (2025 - 2026)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="snote-input"
            style={{ fontSize: '14.5px', fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Năm học *
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: 2025-2026"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="snote-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
          <input
            type="checkbox"
            id="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            style={{ width: '17px', height: '17px', cursor: 'pointer' }}
          />
          <label htmlFor="isCurrent" style={{ fontSize: '13.5px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500 }}>
            Đặt làm học kỳ hiện tại (Active Semester)
          </label>
        </div>

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
            <span>{loading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Tạo Học Kỳ'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
