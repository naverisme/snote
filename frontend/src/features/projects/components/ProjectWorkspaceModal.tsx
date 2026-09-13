import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { api, ApiResponse } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { MarkdownViewer } from '../../../components/common/MarkdownViewer';
import { NoteModal } from '../../notes/components/NoteModal';
import { TaskModal } from '../../tasks/components/TaskModal';
import { NoteType, TaskStatus, TaskPriority, ProjectMemberRole } from '@snote/shared';
import {
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Clock3,
  User,
  Crown,
  Trash2,
  Eye,
  Send,
  MessageSquare,
  Sparkles,
  Tag,
  AlertCircle,
  Lock,
  ShieldCheck,
  LogOut,
  Image as ImageIcon,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  X,
  Paperclip,
  Maximize2,
  FileAudio
} from 'lucide-react';

interface ProjectWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onRefreshParent: () => void;
}

interface DiscussionMessage {
  id: string;
  projectId: string;
  userId: string;
  senderName: string;
  senderEmail?: string;
  senderAvatar?: string | null;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'FILE';
  mediaUrl?: string | null;
  mediaName?: string | null;
  mediaSize?: number | null;
  duration?: number | null;
  createdAt: string;
}

export const ProjectWorkspaceModal: React.FC<ProjectWorkspaceModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onRefreshParent
}) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'TASKS' | 'NOTES' | 'MEMBERS' | 'DISCUSSION'>('TASKS');

  // Submodals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<any | null>(null);

  // Invite member form state
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectMemberRole>(ProjectMemberRole.MEMBER);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Quick Task form state
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskAssignee, setQuickTaskAssignee] = useState('');
  const [quickTaskLoading, setQuickTaskLoading] = useState(false);

  // Team Discussion state (Persistent Chat)
  const [discussions, setDiscussions] = useState<DiscussionMessage[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedAudioDuration, setSelectedAudioDuration] = useState<number>(0);
  const [previewLightboxImg, setPreviewLightboxImg] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Audio player state for message audio items
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const fetchWorkspace = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<any>>(`/projects/${projectId}/workspace`);
      setWorkspaceData(res.data);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải không gian làm việc dự án', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  const fetchDiscussions = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await api.get<ApiResponse<DiscussionMessage[]>>(`/projects/${projectId}/discussions`);
      setDiscussions(res.data || []);
    } catch {
      // silent catch for background polling
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchWorkspace();
      setActiveTab('TASKS');
    }
  }, [isOpen, projectId, fetchWorkspace]);

  // Load discussions and poll when in DISCUSSION tab
  useEffect(() => {
    if (isOpen && projectId && activeTab === 'DISCUSSION') {
      setDiscussionsLoading(true);
      fetchDiscussions().finally(() => setDiscussionsLoading(false));

      const interval = setInterval(fetchDiscussions, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, projectId, activeTab, fetchDiscussions]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'DISCUSSION') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discussions, activeTab]);

  if (!isOpen || !projectId) return null;

  const project = workspaceData || {};
  const tasks: any[] = project.tasks || [];
  const notes: any[] = project.notes || [];
  const members: any[] = project.members || [];

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === ProjectMemberRole.OWNER || project.userId === currentUser?.id;
  const isAdmin = currentMember?.role === ProjectMemberRole.ADMIN;
  const canManageProject = isOwner || isAdmin;

  // Toggle Task Status directly with Authorization Check
  const handleToggleTaskStatus = async (task: any) => {
    const assigneesList = (task.assignees && task.assignees.length > 0)
      ? task.assignees
      : (task.assignee ? [task.assignee] : (task.user ? [task.user] : []));

    const isAssignee = assigneesList.some((u: any) => (u.id || u.userId) === currentUser?.id);
    const isCreator = task.userId === currentUser?.id;
    const canComplete = isAssignee || isCreator || isOwner || isAdmin;

    if (!canComplete) {
      showToast('🔒 Chỉ thành viên được phân công hoặc Trưởng nhóm/Quản trị viên mới có quyền hoàn thành task này', 'warning');
      return;
    }

    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await api.patch(`/tasks/${task.id}/status`, { status: nextStatus });
      showToast(nextStatus === 'DONE' ? 'Đã hoàn thành công việc!' : 'Đã mở lại công việc', 'success');
      fetchWorkspace();
      onRefreshParent();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật trạng thái việc', 'error');
    }
  };

  // Quick Create Task for Project
  const handleQuickCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    setQuickTaskLoading(true);
    try {
      await api.post('/tasks', {
        title: quickTaskTitle.trim(),
        projectId,
        assigneeIds: quickTaskAssignee ? [quickTaskAssignee] : (currentUser?.id ? [currentUser.id] : undefined),
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM
      });
      showToast('Đã thêm công việc vào dự án thành công!', 'success');
      setQuickTaskTitle('');
      fetchWorkspace();
      onRefreshParent();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo nhanh công việc', 'error');
    } finally {
      setQuickTaskLoading(false);
    }
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    setInviteLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, {
        emailOrUserId: inviteInput.trim(),
        role: inviteRole
      });
      showToast('Đã thêm thành viên vào dự án thành công!', 'success');
      setInviteInput('');
      setInviteRole(ProjectMemberRole.MEMBER);
      fetchWorkspace();
      onRefreshParent();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thêm thành viên', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  // Update Member Role
  const handleUpdateRole = async (targetUserId: string, newRole: ProjectMemberRole, name: string) => {
    if (newRole === ProjectMemberRole.OWNER) {
      if (!window.confirm(`Bạn có chắc muốn chuyển giao quyền Trưởng nhóm (OWNER) cho "${name}"?`)) return;
    }

    try {
      await api.put(`/projects/${projectId}/members/${targetUserId}`, { role: newRole });
      showToast(`Đã cập nhật vai trò của "${name}" thành ${newRole}`, 'success');
      fetchWorkspace();
      onRefreshParent();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật vai trò', 'error');
    }
  };

  // Remove / Kick Member or Leave Project
  const handleRemoveMember = async (targetUserId: string, name: string) => {
    const isSelf = targetUserId === currentUser?.id;
    if (!window.confirm(isSelf ? 'Bạn có chắc muốn rời khỏi dự án này?' : `Bạn có chắc muốn xóa (kick) thành viên "${name}" khỏi dự án?`)) return;

    try {
      await api.delete(`/projects/${projectId}/members/${targetUserId}`);
      showToast(isSelf ? 'Bạn đã rời nhóm dự án thành công' : `Đã xóa thành viên "${name}" khỏi dự án`, 'success');
      fetchWorkspace();
      onRefreshParent();
      if (isSelf) onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa thành viên', 'error');
    }
  };

  // ----------------------------------------------------
  // VOICE RECORDING & MEDIA HANDLERS
  // ----------------------------------------------------
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedAudio(reader.result as string);
          setSelectedAudioDuration(recordingSeconds);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      showToast('Không thể truy cập microphone. Vui lòng cấp quyền ghi âm.', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setSelectedAudio(null);
      setSelectedAudioDuration(0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Ảnh quá lớn (vui lòng chọn ảnh < 8MB)', 'warning');
      return;
    }

    setSelectedImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File âm thanh quá lớn (vui lòng chọn file < 15MB)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAudio(reader.result as string);
      setSelectedAudioDuration(0);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioPlayToggle = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      audio.play();
      setPlayingAudioId(msgId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  // Send Discussion Message (Text, Image, Audio)
  const handleSendDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() && !selectedImage && !selectedAudio) return;

    setSendingMessage(true);
    try {
      let type: 'TEXT' | 'IMAGE' | 'AUDIO' = 'TEXT';
      let mediaUrl: string | null = null;
      let mediaName: string | null = null;
      let duration: number | null = null;

      if (selectedImage) {
        type = 'IMAGE';
        mediaUrl = selectedImage;
        mediaName = selectedImageName || 'image.png';
      } else if (selectedAudio) {
        type = 'AUDIO';
        mediaUrl = selectedAudio;
        mediaName = 'voice_message.webm';
        duration = selectedAudioDuration || null;
      }

      const res = await api.post<ApiResponse<DiscussionMessage>>(`/projects/${projectId}/discussions`, {
        content: msgInput.trim(),
        type,
        mediaUrl,
        mediaName,
        duration
      });

      if (res.data) {
        setDiscussions((prev) => [...prev, res.data]);
      }

      setMsgInput('');
      setSelectedImage(null);
      setSelectedImageName('');
      setSelectedAudio(null);
      setSelectedAudioDuration(0);
      showToast('Đã gửi tin nhắn trao đổi', 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể gửi tin nhắn trao đổi', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteDiscussion = async (msgId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này không?')) return;
    try {
      await api.delete(`/projects/${projectId}/discussions/${msgId}`);
      setDiscussions((prev) => prev.filter((m) => m.id !== msgId));
      showToast('Đã xóa tin nhắn', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa tin nhắn', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Không Gian Làm Việc Dự Án: ${project.name || '...'}`}
      maxWidth="1100px"
      icon={<FolderKanban size={22} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Project Header Bar */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-purple" style={{ fontSize: '13px', padding: '4px 10px' }}>
                <FolderKanban size={13} />
                <span>{project.name}</span>
              </span>

              {project.subject && (
                <span className="badge badge-blue" style={{ fontSize: '12px', padding: '3px 8px' }}>
                  [{project.subject.code || 'MÔN'}] {project.subject.name}
                </span>
              )}

              {project.semester && (
                <span className="badge badge-neutral" style={{ fontSize: '12px', padding: '3px 8px' }}>
                  {project.semester.name}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isOwner && (
                <span
                  style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    color: '#eab308',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                  }}
                >
                  <Crown size={12} />
                  <span>Trưởng nhóm</span>
                </span>
              )}

              {project.dueDate && (
                <span style={{ fontSize: '12px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Calendar size={13} />
                  <span>Hạn nộp: {new Date(project.dueDate).toLocaleDateString('vi-VN')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <span>Tiến độ hoàn thành công việc:</span>
              <span style={{ fontWeight: 700, color: progressPercent === 100 ? 'var(--color-success)' : 'var(--accent-primary)' }}>
                {completedTasks}/{tasks.length} tasks ({progressPercent}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--accent-primary)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('TASKS')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'TASKS' ? 700 : 500,
              color: activeTab === 'TASKS' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'TASKS' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckSquare size={15} />
            <span>Công Việc Nhóm ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTES')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'NOTES' ? 700 : 500,
              color: activeTab === 'NOTES' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'NOTES' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={15} />
            <span>Ghi Chú & Tài Liệu ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MEMBERS')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'MEMBERS' ? 700 : 500,
              color: activeTab === 'MEMBERS' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'MEMBERS' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={15} />
            <span>Thành Viên & Quyền ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DISCUSSION')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'DISCUSSION' ? 700 : 500,
              color: activeTab === 'DISCUSSION' ? '#38bdf8' : 'var(--text-secondary)',
              borderBottom: activeTab === 'DISCUSSION' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: activeTab === 'DISCUSSION' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              borderRadius: '6px 6px 0 0',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={15} />
            <span>Trao Đổi Nhóm {discussions.length > 0 ? `(${discussions.length})` : ''}</span>
          </button>
        </div>

        {/* TAB 1: TASKS */}
        {activeTab === 'TASKS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <form onSubmit={handleQuickCreateTask} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Thêm nhanh việc cần làm cho nhóm..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="snote-input"
                style={{ flex: 1, minWidth: '220px', fontSize: '13px' }}
              />

              <select
                value={quickTaskAssignee}
                onChange={(e) => setQuickTaskAssignee(e.target.value)}
                className="snote-select"
                style={{ width: '180px', fontSize: '13px' }}
              >
                <option value="">Giao cho: (Tùy chọn)</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    👤 {m.user?.fullName || m.userId}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={quickTaskLoading || !quickTaskTitle.trim()}
                className="btn btn-primary"
                style={{ gap: '4px', fontWeight: 600, fontSize: '13px' }}
              >
                <Plus size={15} />
                <span>{quickTaskLoading ? 'Đang thêm...' : 'Thêm Task'}</span>
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <CheckSquare size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p style={{ margin: 0 }}>Chưa có công việc nào trong dự án này.</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  const assignees = task.assignees || (task.assignee ? [task.assignee] : []);

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        opacity: isDone ? 0.65 : 1,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(task)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: isDone ? 'var(--color-success)' : 'var(--text-muted)' }}
                          title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                        >
                          {isDone ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span
                            onClick={() => {
                              setTaskToEdit(task);
                              setIsTaskModalOpen(true);
                            }}
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {task.title}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {task.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            {assignees.length > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-primary)' }}>
                                <User size={11} /> {assignees.map((a: any) => a.user?.fullName || a.name || 'Thành viên').join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Xem chi tiết & Chỉnh sửa"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NOTES */}
        {activeTab === 'NOTES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setNoteToEdit(null);
                  setIsNoteModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
                style={{ gap: '5px', fontWeight: 600 }}
              >
                <Plus size={14} />
                <span>Viết Ghi Chú / Tài Liệu Mới</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <FileText size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p style={{ margin: 0 }}>Chưa có ghi chú hay tài liệu nào được liên kết với dự án.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setNoteToEdit(note);
                      setIsNoteModalOpen(true);
                    }}
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxHeight: '48px', overflow: 'hidden', lineHeight: '1.4' }}>
                      {note.content?.slice(0, 120)}...
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>
                      <span>👤 {note.user?.fullName || 'Tác giả'}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MEMBERS */}
        {activeTab === 'MEMBERS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {canManageProject && (
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nhập email hoặc ID người dùng để mời..."
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  className="snote-input"
                  style={{ flex: 1, minWidth: '220px', fontSize: '13px' }}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ProjectMemberRole)}
                  className="snote-select"
                  style={{ width: '150px', fontSize: '13px' }}
                >
                  <option value={ProjectMemberRole.MEMBER}>Thành viên</option>
                  <option value={ProjectMemberRole.ADMIN}>Quản trị viên</option>
                  <option value={ProjectMemberRole.VIEWER}>Chỉ xem</option>
                </select>
                <button type="submit" disabled={inviteLoading || !inviteInput.trim()} className="btn btn-primary" style={{ gap: '4px', fontWeight: 600 }}>
                  <Plus size={15} />
                  <span>{inviteLoading ? 'Đang mời...' : 'Thêm'}</span>
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {members.map((m) => {
                const u = m.user || {};
                const isItemOwner = m.role === ProjectMemberRole.OWNER || project.userId === m.userId;

                return (
                  <div
                    key={m.id || m.userId}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--accent-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {u.fullName?.charAt(0) || 'U'}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {u.fullName || 'Người dùng'}
                          </span>
                          {isItemOwner && (
                            <span style={{ color: '#eab308', display: 'flex' }} title="Trưởng nhóm">
                              <Crown size={14} />
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{u.email || m.userId}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                        {m.role}
                      </span>

                      {canManageProject && !isItemOwner && m.userId !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.userId, u.fullName || 'Thành viên')}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          title="Xóa thành viên"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DISCUSSION (Full persistent team chat with image & audio) */}
        {activeTab === 'DISCUSSION' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Messages Scroll Area */}
            <div
              style={{
                height: '360px',
                padding: '16px',
                backgroundColor: '#0f1218',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                overflowY: 'auto'
              }}
            >
              {discussionsLoading && discussions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '13px' }}>
                  <Sparkles className="animate-spin" size={22} style={{ margin: '0 auto 8px auto', color: '#38bdf8' }} />
                  <div>Đang tải cuộc trò chuyện nhóm...</div>
                </div>
              ) : discussions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '13px' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, margin: '0 auto 10px auto' }} />
                  <p style={{ margin: 0, fontWeight: 600, color: '#94a3b8' }}>Bảng trao đổi & thảo luận nhóm dự án</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Gửi tin nhắn văn bản, hình ảnh hoặc đoạn ghi âm giọng nói để cùng nhóm trao đổi!</p>
                </div>
              ) : (
                discussions.map((msg) => {
                  const isMe = msg.userId === currentUser?.id;
                  const timeFormatted = new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = new Date(msg.createdAt).toLocaleDateString('vi-VN');

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        gap: '3px'
                      }}
                    >
                      {/* Sender Name & Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                        <span style={{ fontWeight: 700, color: isMe ? '#38bdf8' : '#cbd5e1' }}>
                          {isMe ? 'Bạn' : msg.senderName}
                        </span>
                        <span>•</span>
                        <span>{timeFormatted} ({dateFormatted})</span>
                        {(isMe || canManageProject) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDiscussion(msg.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 2px', display: 'flex', opacity: 0.7 }}
                            title="Xóa tin nhắn"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        style={{
                          padding: '10px 14px',
                          backgroundColor: isMe ? '#1e3a8a' : '#1e293b',
                          borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          fontSize: '13px',
                          color: '#ffffff',
                          border: isMe ? '1px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.08)',
                          maxWidth: '80%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        {/* Text Content */}
                        {msg.content && (
                          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
                            {msg.content}
                          </div>
                        )}

                        {/* Image Attachment */}
                        {msg.type === 'IMAGE' && msg.mediaUrl && (
                          <div style={{ position: 'relative', marginTop: '2px', cursor: 'pointer' }} onClick={() => setPreviewLightboxImg(msg.mediaUrl!)}>
                            <img
                              src={msg.mediaUrl}
                              alt="Đính kèm"
                              style={{
                                maxWidth: '280px',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid rgba(255, 255, 255, 0.15)'
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                right: '6px',
                                bottom: '6px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Maximize2 size={10} /> Phóng to
                            </span>
                          </div>
                        )}

                        {/* Audio / Voice Message Attachment */}
                        {msg.type === 'AUDIO' && msg.mediaUrl && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              padding: '8px 12px',
                              borderRadius: '20px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              minWidth: '200px'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleAudioPlayToggle(msg.id, msg.mediaUrl!)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#38bdf8',
                                color: '#0f172a',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              {playingAudioId === msg.id ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: '#38bdf8' }}>
                                <Volume2 size={12} />
                                <span>Tin nhắn âm thanh</span>
                              </div>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {msg.duration ? `${msg.duration}s` : 'Phát âm thanh'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Media Attachment Preview Bar */}
            {(selectedImage || selectedAudio) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#1e293b',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={selectedImage} alt="Preview" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>Ảnh đính kèm: {selectedImageName || 'image.png'}</span>
                    </div>
                  )}
                  {selectedAudio && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 600 }}>
                      <FileAudio size={16} />
                      <span>Bản ghi âm đã sẵn sàng ({selectedAudioDuration}s)</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedImageName('');
                    setSelectedAudio(null);
                    setSelectedAudioDuration(0);
                  }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Voice Recording Active Bar */}
            {isRecording && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#7f1d1d',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid #ef4444',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    Đang ghi âm... {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Hoàn tất ghi âm
                  </button>
                </div>
              </div>
            )}

            {/* Input & Action Controls */}
            <form onSubmit={handleSendDiscussion} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Hidden file inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                style={{ display: 'none' }}
              />

              {/* Image Attach Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="btn btn-ghost btn-icon"
                style={{ color: '#94a3b8', borderRadius: '8px' }}
                title="Gửi hình ảnh"
              >
                <ImageIcon size={18} />
              </button>

              {/* Audio Record Button */}
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className="btn btn-ghost btn-icon"
                style={{ color: isRecording ? '#ef4444' : '#94a3b8', borderRadius: '8px' }}
                title={isRecording ? 'Dừng ghi âm' : 'Ghi âm tin nhắn thoại'}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Audio File Attach Button */}
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="btn btn-ghost btn-icon"
                style={{ color: '#94a3b8', borderRadius: '8px' }}
                title="Đính kèm file âm thanh (.mp3, .wav, .m4a)"
              >
                <Paperclip size={18} />
              </button>

              {/* Message Text Input */}
              <input
                type="text"
                placeholder="Nhập tin nhắn trao đổi với nhóm dự án..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                className="snote-input"
                style={{ flex: 1, fontSize: '13px', padding: '10px 14px' }}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sendingMessage || (!msgInput.trim() && !selectedImage && !selectedAudio)}
                className="btn btn-primary"
                style={{ padding: '0 18px', height: '40px', fontWeight: 700, gap: '6px', borderRadius: '8px' }}
              >
                <Send size={15} />
                <span>{sendingMessage ? 'Đang gửi...' : 'Gửi'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Fullsize Image Lightbox Preview Modal */}
        {previewLightboxImg && (
          <div
            onClick={() => setPreviewLightboxImg(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={previewLightboxImg}
                alt="Full preview"
                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}
              />
              <button
                onClick={() => setPreviewLightboxImg(null)}
                style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '-14px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Đóng Không Gian Làm Việc
          </button>
        </div>
      </div>

      {/* Task Modal for sub-edits */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={() => {
          fetchWorkspace();
          onRefreshParent();
        }}
        taskToEdit={taskToEdit}
      />

      {/* Note Modal for sub-edits */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setNoteToEdit(null);
        }}
        onSuccess={() => {
          fetchWorkspace();
          onRefreshParent();
        }}
        noteToEdit={noteToEdit}
        defaultProjectId={projectId}
        defaultSubjectId={project.subjectId || undefined}
      />
    </Modal>
  );
};
