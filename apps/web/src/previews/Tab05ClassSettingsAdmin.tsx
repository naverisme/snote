import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, AlertTriangle, Archive, RefreshCw, Check, ArrowRightLeft } from 'lucide-react';

export const Tab05ClassSettingsAdmin: React.FC = () => {
  const [className, setClassName] = useState('CS101 - Lập trình Nâng cao');
  const [classCode, setClassCode] = useState('CS101-2026');
  const [timeZone, setTimeZone] = useState('Asia/Ho_Chi_Minh');
  const [maxMembers, setMaxMembers] = useState(5);
  const [allowSelfCreate, setAllowSelfCreate] = useState(true);
  const [latePolicy, setLatePolicy] = useState<'allow' | 'lock'>('allow');
  const [joinCode, setJoinCode] = useState('SNOTE-CS101-2026');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '820px', margin: '0 auto' }}>
      {feedback && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Block 1: Thông tin học phần */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          1. Thông tin học phần cơ bản
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Tên hiển thị và định danh của lớp học trên toàn hệ thống SNOTE.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Tên lớp học</label>
            <input
              type="text"
              value={className}
              onChange={e => setClassName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Mã môn học</label>
            <input
              type="text"
              value={classCode}
              onChange={e => setClassCode(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={() => showNotice('Đã lưu thông tin học phần')}>
          Lưu thông tin
        </button>
      </div>

      {/* Block 2: Chính sách nhóm & Quy tắc nộp bài */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          2. Chính sách nhóm học tập & Bài giao
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Quy chuẩn phân bổ sĩ số nhóm và cơ chế nộp muộn (CLS-06, CLS-07, ASG-09).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Sĩ số tối đa mỗi nhóm (CLS-07)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ngăn chặn việc một nhóm nhận quá số lượng quy định</div>
            </div>
            <select
              value={maxMembers}
              onChange={e => setMaxMembers(Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            >
              <option value={3}>Tối đa 3 thành viên</option>
              <option value={4}>Tối đa 4 thành viên</option>
              <option value={5}>Tối đa 5 thành viên (Khuyên dùng)</option>
              <option value={6}>Tối đa 6 thành viên</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Cho phép học sinh tự lập nhóm (CLS-05)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Học sinh có thể tự đề xuất nhóm mới mà không cần giáo viên tạo thủ công</div>
            </div>
            <button
              type="button"
              className={`btn btn-sm ${allowSelfCreate ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setAllowSelfCreate(!allowSelfCreate)}
            >
              {allowSelfCreate ? 'Đang bật' : 'Đang tắt'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Chính sách nộp bài muộn sau hạn chót (ASG-09)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cho phép nộp kèm gắn nhãn "Nộp muộn" hay tự động khóa nộp bài</div>
            </div>
            <select
              value={latePolicy}
              onChange={e => setLatePolicy(e.target.value as any)}
              style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            >
              <option value="allow">Cho phép nộp muộn (Gắn cờ)</option>
              <option value="lock">Khóa nộp bài ngay khi hết hạn</option>
            </select>
          </div>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={() => showNotice('Đã lưu chính sách nhóm')}>
          Cập nhật chính sách
        </button>
      </div>

      {/* Block 3: Quản lý mã vào lớp (Join Code) */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          3. Mã tham gia lớp học (Join Code - CLS-03)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Mã định danh cấp tốc dùng cho học sinh gửi yêu cầu vào lớp học.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--surface-hover)', borderRadius: '6px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Mã hiện tại</div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              {joinCode}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                navigator.clipboard?.writeText(joinCode);
                showNotice('Đã sao chép mã tham gia lớp vào bộ nhớ tạm');
              }}
            >
              Sao chép mã
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setJoinCode(`SNOTE-CS101-${Math.floor(1000 + Math.random() * 9000)}`);
                showNotice('Đã tạo mã tham gia lớp mới');
              }}
            >
              <RefreshCw size={13} style={{ marginRight: '4px' }} />
              <span>Đổi mã</span>
            </button>
          </div>
        </div>
      </div>

      {/* Block 4: Khu vực nguy hiểm (Danger Zone) */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(248, 113, 113, 0.9)', marginBottom: '4px' }}>
          <AlertTriangle size={18} />
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            4. Khu vực quản trị nguy hiểm (Danger Zone)
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Các thao tác thay đổi quyền sở hữu hoặc trạng thái hoạt động của lớp học.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Chuyển giao quyền chủ lớp (CLS-10)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bàn giao toàn bộ quyền giáo viên chủ nhiệm cho một tài khoản giáo viên khác</div>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => showNotice('Mở hộp thoại chuyển giao quyền chủ lớp')}>
              <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
              <span>Chuyển chủ lớp</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Lưu trữ lớp học (CLS-14)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Đóng lớp và chuyển toàn bộ dữ liệu bài giao sang trạng thái chỉ đọc (Read-only)</div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: 'rgba(248, 113, 113, 0.9)' }}
              onClick={() => {
                if (confirm('Lưu trữ lớp học này? Toàn bộ hoạt động nộp bài sẽ dừng lại.')) {
                  showNotice('Lớp học đã được chuyển vào kho lưu trữ');
                }
              }}
            >
              <Archive size={13} style={{ marginRight: '4px' }} />
              <span>Lưu trữ lớp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
