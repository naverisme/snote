import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiResponse } from '../../../services/api';
import { useAppFilter, SemesterOption } from '../../../contexts/AppFilterContext';
import { useToast } from '../../../contexts/ToastContext';
import { SemesterModal } from '../components/SemesterModal';
import { SubjectModal } from '../components/SubjectModal';
import {
  Layers,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Edit3,
  User,
  Award,
  CheckSquare,
  FileText,
  Sparkles,
  Zap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Settings2,
  ExternalLink
} from 'lucide-react';

export const SemesterOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedSemesterId,
    setSelectedSemesterId,
    setSelectedSubjectId,
    semesters,
    refreshFilterData
  } = useAppFilter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterOption | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const { showToast } = useToast();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedSemesterId ? `/subjects?semesterId=${selectedSemesterId}` : '/subjects';
      const res = await api.get<ApiResponse<any[]>>(url);
      setSubjects(res.data || []);
    } catch {
      showToast('Không thể tải danh sách môn học', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedSemesterId, showToast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const currentSemesterObj = semesters.find((s) => s.id === selectedSemesterId);

  // Xóa môn học
  const handleDeleteSubject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học "${name}" không? Toàn bộ ghi chú và bài tập liên kết sẽ bị gỡ môn học này.`)) {
      return;
    }

    try {
      await api.delete(`/subjects/${id}`);
      showToast(`Đã xóa môn học "${name}"`, 'success');
      await refreshFilterData();
      fetchSubjects();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa môn học', 'error');
    }
  };

  // Xóa học kỳ
  const handleDeleteSemester = async (semester: SemesterOption) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học kỳ "${semester.name}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await api.delete(`/semesters/${semester.id}`);
      showToast(`Đã xóa học kỳ "${semester.name}"`, 'success');
      setSelectedSemesterId(null);
      await refreshFilterData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa học kỳ', 'error');
    }
  };

  // Đặt học kỳ làm Active
  const handleSetActiveSemester = async (semester: SemesterOption) => {
    try {
      await api.put(`/semesters/${semester.id}`, {
        name: semester.name,
        academicYear: semester.academicYear,
        isCurrent: true
      });
      showToast(`Đã đặt "${semester.name}" làm học kỳ hiện tại`, 'success');
      await refreshFilterData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật học kỳ', 'error');
    }
  };

  // Chuyển nhanh sang trang Ghi chú của môn học
  const handleNavigateToNotes = (e: React.MouseEvent, subjectId: string) => {
    e.stopPropagation();
    setSelectedSubjectId(subjectId);
    navigate('/workspace?tab=notes');
  };

  // Chuyển nhanh sang trang Công việc của môn học
  const handleNavigateToTasks = (e: React.MouseEvent, subjectId: string) => {
    e.stopPropagation();
    setSelectedSubjectId(subjectId);
    navigate('/workspace?tab=tasks');
  };

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
  const totalNotes = subjects.reduce((sum, s) => sum + (s.notesCount || 0), 0);
  const totalTasks = subjects.reduce((sum, s) => sum + (s.tasksCount || 0), 0);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Stats Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-accent)'
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Môn & Học Kỳ
            </h1>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Quản lý cấu trúc học phần, tín chỉ, đề cương và bài tập theo từng kỳ học
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              setEditingSemester(null);
              setIsSemesterModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, padding: '8px 14px', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Thêm Học Kỳ</span>
          </button>
          <button
            onClick={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, padding: '8px 16px', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Thêm Môn Học</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div
          className="snote-card"
          style={{
            padding: '14px 18px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Môn Học
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {subjects.length} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>môn</span>
            </div>
          </div>
        </div>

        <div
          className="snote-card"
          style={{
            padding: '14px 18px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Tổng Tín Chỉ
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalCredits} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>tín</span>
            </div>
          </div>
        </div>

        <div
          className="snote-card"
          style={{
            padding: '14px 18px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Ghi Chú Đã Tạo
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalNotes} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>bài</span>
            </div>
          </div>
        </div>

        <div
          className="snote-card"
          style={{
            padding: '14px 18px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Công Việc & Bài Tập
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalTasks} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>việc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Selection Tabs & Current Semester Details Bar */}
      <div
        className="snote-card"
        style={{
          padding: '14px 18px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedSemesterId(null)}
              className={`btn ${selectedSemesterId === null ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: 'var(--radius-md)' }}
            >
              <Layers size={13} />
              <span>Tất cả học kỳ</span>
            </button>

            {semesters.map((sem) => {
              const isSelected = selectedSemesterId === sem.id;
              return (
                <button
                  key={sem.id}
                  onClick={() => setSelectedSemesterId(sem.id)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span>{sem.name}</span>
                  {sem.isCurrent && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--accent-primary)',
                        color: '#ffffff',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}
                    >
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Semester Management Bar */}
        {currentSemesterObj && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentSemesterObj.name}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                Năm học: {currentSemesterObj.academicYear}
              </span>
              {currentSemesterObj.isCurrent ? (
                <span className="badge badge-purple" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} />
                  <span>Học kỳ Hiện Tại</span>
                </span>
              ) : (
                <button
                  onClick={() => handleSetActiveSemester(currentSemesterObj)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11.5px', padding: '3px 8px', color: 'var(--accent-primary)', fontWeight: 600 }}
                  title="Đặt làm học kỳ mặc định đang diễn ra"
                >
                  ⚡ Đặt làm Active
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => {
                  setEditingSemester(currentSemesterObj);
                  setIsSemesterModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '12px', padding: '5px 10px', gap: '5px' }}
                title="Sửa tên hoặc năm học của học kỳ này"
              >
                <Edit3 size={13} />
                <span>Sửa Học Kỳ</span>
              </button>
              <button
                onClick={() => handleDeleteSemester(currentSemesterObj)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px', padding: '5px 8px', color: 'var(--color-danger)' }}
                title="Xóa học kỳ này"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Sparkles size={18} className="pulse-urgent" style={{ color: 'var(--accent-primary)' }} />
            <span>Đang tải danh sách môn học...</span>
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <div
          className="snote-card"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <BookOpen size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Chưa có môn học nào trong danh sách
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
            Môn học là trục liên kết thông minh giúp phân loại ghi chú, bài tập và đề cương thi theo đúng tiến độ học phần.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {semesters.length === 0 && (
              <button
                onClick={() => {
                  setEditingSemester(null);
                  setIsSemesterModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontWeight: 600 }}
              >
                <Plus size={16} />
                <span>Tạo Học Kỳ Đầu Tiên</span>
              </button>
            )}
            <button
              onClick={() => {
                setEditingSubject(null);
                setIsSubjectModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Thêm Môn Học Mới</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {subjects.map((sub) => {
            const subColor = sub.color || 'var(--accent-primary)';
            return (
              <div
                key={sub.id}
                onClick={() => {
                  setEditingSubject(sub);
                  setIsSubjectModalOpen(true);
                }}
                className="snote-card animate-fade-in"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderTop: `4px solid ${subColor}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '210px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  {/* Top Badges & Edit Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${subColor}18`,
                          color: subColor,
                          border: `1px solid ${subColor}35`,
                          fontWeight: 700,
                          fontSize: '11px'
                        }}
                      >
                        {sub.code || 'CODE'}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                        <Award size={11} />
                        <span>{sub.credits} Tín chỉ</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSubject(sub);
                        setIsSubjectModalOpen(true);
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--text-muted)', padding: '4px' }}
                      title="Chỉnh sửa thông tin môn học"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>

                  {/* Subject Name */}
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16.5px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.35
                    }}
                  >
                    {sub.name}
                  </h3>

                  {/* Lecturer */}
                  {sub.lecturer && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      <User size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{sub.lecturer}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Stats & Quick Navigate Action Links */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {/* Quick navigation tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleNavigateToNotes(e, sub.id)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: '11.5px',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Xem toàn bộ ghi chú của môn này"
                      >
                        <FileText size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span><b>{sub.notesCount || 0}</b> ghi chú</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleNavigateToTasks(e, sub.id)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: '11.5px',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Xem toàn bộ công việc của môn này"
                      >
                        <CheckSquare size={12} style={{ color: 'var(--color-warning)' }} />
                        <span><b>{sub.tasksCount || 0}</b> việc</span>
                      </button>
                    </div>

                    {/* Delete Subject Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSubject(e, sub.id, sub.name)}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--color-danger)', padding: '4px' }}
                      title="Xóa môn học này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Semester Modal (Create & Edit) */}
      <SemesterModal
        isOpen={isSemesterModalOpen}
        onClose={() => {
          setIsSemesterModalOpen(false);
          setEditingSemester(null);
        }}
        onSuccess={(savedSemester) => {
          if (savedSemester?.id) {
            setSelectedSemesterId(savedSemester.id);
          }
          fetchSubjects();
        }}
        initialData={editingSemester}
      />

      {/* Subject Modal (Create & Edit) */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSuccess={fetchSubjects}
        defaultSemesterId={selectedSemesterId}
        initialData={editingSubject}
      />
    </div>
  );
};
