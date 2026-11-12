import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Users,
  Plus,
  ArrowRight,
  Check,
  Search,
  LogOut,
  Clock,
  Inbox,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  UserCheck,
  UserPlus,
} from 'lucide-react';

interface Teammate {
  id: string;
  name: string;
  email: string;
  role: 'leader' | 'member';
  avatarInitials: string;
  isMe?: boolean;
}

interface GroupItem {
  id: string;
  name: string;
  topic: string;
  description: string;
  leadName: string;
  memberCount: number;
  maxMembers: number;
  members: Teammate[];
  tags: string[];
}

interface OutgoingRequest {
  id: string;
  groupId: string;
  groupName: string;
  sentAt: string;
  status: 'pending';
}

interface IncomingInvitation {
  id: string;
  groupId: string;
  groupName: string;
  inviterName: string;
  sentAt: string;
}

const INITIAL_MY_GROUP: GroupItem = {
  id: 'g-01',
  name: 'Nhóm 01 - AI & Data Platform',
  topic: 'Nền tảng phân tích dữ liệu lớn và thị giác máy tính',
  description: 'Xây dựng pipeline xử lý dữ liệu phân tán, tích hợp nhận diện vật thể và trích xuất đặc trưng thời gian thực.',
  leadName: 'Lê Hoàng Nam',
  memberCount: 4,
  maxMembers: 5,
  tags: ['Python', 'Dataproc', 'FastAPI'],
  members: [
    { id: 'u-01', name: 'Lê Hoàng Nam', email: 'nam.le@student.edu.vn', role: 'leader', avatarInitials: 'LN' },
    { id: 'u-02', name: 'Trần Thị Mai', email: 'mai.tran@student.edu.vn', role: 'member', avatarInitials: 'TM', isMe: true },
    { id: 'u-03', name: 'Nguyễn Văn Bình', email: 'binh.nv@student.edu.vn', role: 'member', avatarInitials: 'NB' },
    { id: 'u-04', name: 'Hoàng Hải Đăng', email: 'dang.hh@student.edu.vn', role: 'member', avatarInitials: 'HĐ' },
  ],
};

const INITIAL_OTHER_GROUPS: GroupItem[] = [
  {
    id: 'g-02',
    name: 'Nhóm 02 - Web Collaboration Engine',
    topic: 'Workspace cộng tác thời gian thực & CRDT sync',
    description: 'Hệ thống soạn thảo đồng thời, đồng bộ phân tán không xung đột dữ liệu trên nền WebSocket.',
    leadName: 'Phạm Quỳnh Anh',
    memberCount: 5,
    maxMembers: 5,
    tags: ['React', 'CRDT', 'WebSocket'],
    members: [
      { id: 'u-05', name: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@student.edu.vn', role: 'leader', avatarInitials: 'QA' },
      { id: 'u-06', name: 'Bùi Tuấn Hưng', email: 'hung.bt@student.edu.vn', role: 'member', avatarInitials: 'TH' },
      { id: 'u-07', name: 'Trương Ngọc Ánh', email: 'anh.tn@student.edu.vn', role: 'member', avatarInitials: 'NÁ' },
      { id: 'u-08', name: 'Phan Minh Trí', email: 'tri.pm@student.edu.vn', role: 'member', avatarInitials: 'MT' },
      { id: 'u-09', name: 'Vũ Lan Hương', email: 'huong.vl@student.edu.vn', role: 'member', avatarInitials: 'LH' },
    ],
  },
  {
    id: 'g-03',
    name: 'Nhóm 03 - Cloud Microservices & DevOps',
    topic: 'Kiến trúc Service Mesh & Tự động hóa CI/CD',
    description: 'Triển khai hạ tầng microservices trên Kubernetes, giám sát tải với Prometheus và Grafana.',
    leadName: 'Vũ Đức Thịnh',
    memberCount: 3,
    maxMembers: 5,
    tags: ['Kubernetes', 'Golang', 'Docker'],
    members: [
      { id: 'u-10', name: 'Vũ Đức Thịnh', email: 'thinh.vu@student.edu.vn', role: 'leader', avatarInitials: 'ĐT' },
      { id: 'u-11', name: 'Đoàn Gia Bảo', email: 'bao.dg@student.edu.vn', role: 'member', avatarInitials: 'GB' },
      { id: 'u-12', name: 'Lê Thảo My', email: 'my.lt@student.edu.vn', role: 'member', avatarInitials: 'TM' },
    ],
  },
  {
    id: 'g-04',
    name: 'Nhóm 04 - Mobile Native Client',
    topic: 'Client đa nền tảng tối ưu hóa ngoại tuyến (Offline-First)',
    description: 'Phát triển client native với bộ nhớ đệm SQLite cục bộ, đồng bộ nền khi có kết nối mạng.',
    leadName: 'Đỗ Quốc Bảo',
    memberCount: 2,
    maxMembers: 5,
    tags: ['Kotlin', 'Swift', 'SQLite'],
    members: [
      { id: 'u-13', name: 'Đỗ Quốc Bảo', email: 'bao.do@student.edu.vn', role: 'leader', avatarInitials: 'QB' },
      { id: 'u-14', name: 'Hồ Quang Hiếu', email: 'hieu.hq@student.edu.vn', role: 'member', avatarInitials: 'QH' },
    ],
  },
  {
    id: 'g-05',
    name: 'Nhóm 05 - IoT Smart Campus Monitor',
    topic: 'Mạng cảm biến giám sát thông minh khuôn viên trường học',
    description: 'Thu thập chỉ số nhiệt độ, độ ẩm, chất lượng không khí qua giao thức MQTT về cụm Time-series DB.',
    leadName: 'Nguyễn Phương Thảo',
    memberCount: 3,
    maxMembers: 5,
    tags: ['MQTT', 'ESP32', 'TimescaleDB'],
    members: [
      { id: 'u-15', name: 'Nguyễn Phương Thảo', email: 'thao.np@student.edu.vn', role: 'leader', avatarInitials: 'PT' },
      { id: 'u-16', name: 'Cao Minh Khang', email: 'khang.cm@student.edu.vn', role: 'member', avatarInitials: 'MK' },
      { id: 'u-17', name: 'Phùng Thu Trang', email: 'trang.pt@student.edu.vn', role: 'member', avatarInitials: 'TT' },
    ],
  },
];

const INITIAL_INCOMING_INVITATIONS: IncomingInvitation[] = [
  {
    id: 'inv-01',
    groupId: 'g-03',
    groupName: 'Nhóm 03 - Cloud Microservices & DevOps',
    inviterName: 'Vũ Đức Thịnh (Trưởng nhóm)',
    sentAt: '10:30 Hôm nay',
  },
];

export const Tab04ClassGroupsStudent: React.FC = () => {
  // Trạng thái tư cách học sinh: Đã vào nhóm hay chưa
  const [userHasGroup, setUserHasGroup] = useState<boolean>(true);
  const [myGroup, setMyGroup] = useState<GroupItem | null>(INITIAL_MY_GROUP);
  const [otherGroups, setOtherGroups] = useState<GroupItem[]>(INITIAL_OTHER_GROUPS);

  // Yêu cầu gửi đi & Lời mời nhận được
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);
  const [incomingInvitations, setIncomingInvitations] = useState<IncomingInvitation[]>(INITIAL_INCOMING_INVITATIONS);

  // Bộ lọc & Tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'full'>('all');

  // Thông báo Toast
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [switchTargetGroup, setSwitchTargetGroup] = useState<GroupItem | null>(null);

  // Form Đề xuất tạo nhóm mới
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTopic, setNewGroupTopic] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState(5);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Đếm số lượng nhóm theo trạng thái sĩ số cho Segmented Control
  const groupCounts = useMemo(() => {
    const all = otherGroups.length;
    const available = otherGroups.filter(g => g.memberCount < g.maxMembers).length;
    const full = otherGroups.filter(g => g.memberCount >= g.maxMembers).length;
    return { all, available, full };
  }, [otherGroups]);

  // Lọc danh sách nhóm khác theo thanh tìm kiếm và bộ lọc sĩ số
  const filteredOtherGroups = useMemo(() => {
    return otherGroups.filter(g => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const isFull = g.memberCount >= g.maxMembers;
      if (statusFilter === 'available') return matchesSearch && !isFull;
      if (statusFilter === 'full') return matchesSearch && isFull;
      return matchesSearch;
    });
  }, [otherGroups, searchQuery, statusFilter]);

  // Hành vi xin vào nhóm
  const handleInitiateJoin = (group: GroupItem) => {
    if (userHasGroup) {
      setSwitchTargetGroup(group);
      return;
    }
    executeSendJoinRequest(group);
  };

  const executeSendJoinRequest = (group: GroupItem) => {
    const newReq: OutgoingRequest = {
      id: `req-${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      sentAt: 'Vừa xong',
      status: 'pending',
    };
    setOutgoingRequests(prev => [...prev, newReq]);
    showToast(`Đã gửi yêu cầu gia nhập ${group.name} tới Trưởng nhóm`);
  };

  // Hủy yêu cầu đã gửi
  const handleCancelRequest = (requestId: string, groupName: string) => {
    setOutgoingRequests(prev => prev.filter(r => r.id !== requestId));
    showToast(`Đã hủy yêu cầu gia nhập ${groupName}`);
  };

  // Chấp nhận lời mời
  const handleAcceptInvitation = (invite: IncomingInvitation) => {
    const targetGroup = otherGroups.find(g => g.id === invite.groupId);
    if (!targetGroup) return;

    setUserHasGroup(true);
    setMyGroup({
      ...targetGroup,
      memberCount: targetGroup.memberCount + 1,
      members: [
        ...targetGroup.members,
        {
          id: 'u-me',
          name: 'Trần Thị Mai',
          email: 'mai.tran@student.edu.vn',
          role: 'member',
          avatarInitials: 'TM',
          isMe: true,
        },
      ],
    });

    // Khi vào một nhóm, các lời mời và yêu cầu khác trong lớp tự động được lưu trữ
    setIncomingInvitations([]);
    setOutgoingRequests([]);
    setOtherGroups(prev => prev.filter(g => g.id !== invite.groupId));

    showToast(`Bạn đã chính thức gia nhập ${invite.groupName}. Các lời mời khác đã được tự động lưu trữ.`);
  };

  // Từ chối lời mời
  const handleDeclineInvitation = (inviteId: string, groupName: string) => {
    setIncomingInvitations(prev => prev.filter(i => i.id !== inviteId));
    showToast(`Đã từ chối lời mời từ ${groupName}`);
  };

  // Xác nhận rời nhóm hiện tại
  const handleConfirmLeaveGroup = () => {
    if (!myGroup) return;
    const oldGroupName = myGroup.name;
    setUserHasGroup(false);
    setMyGroup(null);
    setShowLeaveModal(false);
    showToast(`Đã rời khỏi ${oldGroupName}. Bạn có thể xin gia nhập nhóm khác hoặc tạo nhóm mới.`);
  };

  // Xác nhận chuyển nhóm từ modal cảnh báo
  const handleConfirmSwitchGroup = () => {
    if (!switchTargetGroup) return;
    executeSendJoinRequest(switchTargetGroup);
    setSwitchTargetGroup(null);
  };

  // Xử lý nộp form đề xuất tạo nhóm mới
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupTopic.trim()) return;

    const createdGroup: GroupItem = {
      id: `g-${Date.now()}`,
      name: newGroupName.trim(),
      topic: newGroupTopic.trim(),
      description: newGroupDesc.trim() || 'Nhóm học tập mới khởi tạo.',
      leadName: 'Trần Thị Mai (Bạn)',
      memberCount: 1,
      maxMembers: newGroupMaxMembers,
      tags: ['Dự án mới'],
      members: [
        {
          id: 'u-me',
          name: 'Trần Thị Mai',
          email: 'mai.tran@student.edu.vn',
          role: 'leader',
          avatarInitials: 'TM',
          isMe: true,
        },
      ],
    };

    setUserHasGroup(true);
    setMyGroup(createdGroup);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupTopic('');
    setNewGroupDesc('');
    showToast(`Đã gửi đề xuất thành lập "${createdGroup.name}" tới Giáo viên phê duyệt`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        animation: 'tabEnter 160ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes tabEnter {
          from { opacity: 0.94; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
      {/* Toast Notification */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-divider)',
            padding: '12px 18px',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--text-primary)' }} />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* TẦNG 1: HEADER & THANH CÔNG CỤ TỔNG QUAN */}
      <header
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Nhóm học tập trong lớp
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                Học sinh
              </span>

              {/* Pending Invites Counter Badge */}
              {incomingInvitations.length > 0 && (
                <span
                  title={`${incomingInvitations.length} lời mời tham gia nhóm đang chờ bạn phản hồi`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  <Inbox size={11} />
                  <span>{incomingInvitations.length} lời mời mới</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Tra cứu danh bạ nhóm, theo dõi lời mời và quản lý yêu cầu gia nhập nhóm học tập.
            </p>
          </div>

          {/* Action Toolbar: Simulation Switcher & Create Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Simulation state switcher */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                borderRadius: '6px',
                padding: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setUserHasGroup(true);
                  if (!myGroup) setMyGroup(INITIAL_MY_GROUP);
                  showToast('Đã chuyển sang chế độ: Học sinh đã có nhóm');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: userHasGroup ? 600 : 500,
                  border: userHasGroup ? '1px solid var(--border-divider)' : '1px solid transparent',
                  background: userHasGroup ? 'var(--surface-card)' : 'transparent',
                  color: 'var(--text-primary)',
                  boxShadow: userHasGroup ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                Mô phỏng: Đã có nhóm
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserHasGroup(false);
                  setMyGroup(null);
                  showToast('Đã chuyển sang chế độ: Học sinh chưa có nhóm');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: !userHasGroup ? 600 : 500,
                  border: !userHasGroup ? '1px solid var(--border-divider)' : '1px solid transparent',
                  background: !userHasGroup ? 'var(--surface-card)' : 'transparent',
                  color: 'var(--text-primary)',
                  boxShadow: !userHasGroup ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                Mô phỏng: Chưa có nhóm
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                background: '#18181b',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid #18181b',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}
            >
              <Plus size={15} />
              <span>Đề xuất tạo nhóm</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Segmented Control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-divider)' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhóm, đề tài hoặc trưởng nhóm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm nhóm học tập"
              style={{
                width: '100%',
                padding: '7px 12px 7px 36px',
                borderRadius: '6px',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-divider)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Segmented Filter Control */}
          <div
            role="group"
            aria-label="Bộ lọc sĩ số nhóm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-divider)',
              borderRadius: '24px',
              padding: '3px',
              gap: '2px',
            }}
          >
            {(
              [
                { key: 'all', label: 'Tất cả', count: groupCounts.all },
                { key: 'available', label: 'Còn chỗ trống', count: groupCounts.available },
                { key: 'full', label: 'Đã đủ người', count: groupCounts.full },
              ] as const
            ).map(tab => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    border: tab.key === statusFilter ? '1px solid var(--border-divider)' : '1px solid transparent',
                    background: tab.key === statusFilter ? 'var(--surface-card)' : 'transparent',
                    color: 'var(--text-primary)',
                    boxShadow: tab.key === statusFilter ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    fontWeight: tab.key === statusFilter ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: tab.key === statusFilter ? 'var(--surface-hover)' : 'var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* TẦNG 2: KHỐI PINNED - NHÓM CỦA BẠN (KHI ĐANG CÓ NHÓM) */}
      {userHasGroup && myGroup && (
        <section
          aria-labelledby="my-group-heading"
          style={{
            background: 'var(--surface-card)',
            border: '2px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header nhóm của bạn */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  fontWeight: 700,
                }}
              >
                Nhóm của bạn
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Đang tham gia chính thức
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                title="Rời nhóm và bàn giao trách nhiệm"
                aria-label="Rời nhóm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={13} />
                <span>Rời nhóm</span>
              </button>

              <button
                type="button"
                onClick={() => showToast(`Đang mở không gian làm việc của ${myGroup.name}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: '#18181b',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid #18181b',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                }}
              >
                <span>Vào Workspace nhóm</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Chi tiết nhóm */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
            <div>
              <h2 id="my-group-heading" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                {myGroup.name}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Đề tài:</strong> {myGroup.topic}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {myGroup.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'var(--surface-hover)',
                      border: '1px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Sĩ số & Tiến độ phân bổ */}
            <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sĩ số nhóm:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {myGroup.memberCount}/{myGroup.maxMembers} thành viên
                </span>
              </div>

              {/* Monochrome Progress Bar */}
              <div style={{ height: '6px', width: '100%', background: 'var(--border-divider)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(myGroup.memberCount / myGroup.maxMembers) * 100}%`,
                    background: 'var(--text-primary)',
                    borderRadius: '3px',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {myGroup.memberCount >= myGroup.maxMembers ? 'Nhóm đã chốt sĩ số tối đa' : `Còn ${myGroup.maxMembers - myGroup.memberCount} vị trí tuyển thêm`}
              </div>
            </div>
          </div>

          {/* Teammates mini-roster */}
          <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Danh sách thành viên ({myGroup.members.length} người)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {myGroup.members.map(member => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--surface-card)',
                      border: '1px solid var(--border-divider)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {member.avatarInitials}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                      {member.isMe && (
                        <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: 'var(--text-primary)', color: 'var(--bg-app)', fontWeight: 600 }}>
                          Bạn
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {member.role === 'leader' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <ShieldCheck size={12} /> Trưởng nhóm
                        </span>
                      ) : (
                        <span>Thành viên</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TẦNG 3: TRUNG TÂM LỜI MỜI & YÊU CẦU ĐANG XỬ LÝ (INBOX / PENDING SECTION) */}
      {(incomingInvitations.length > 0 || outgoingRequests.length > 0) && (
        <section
          aria-labelledby="inbox-heading"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-divider)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Inbox size={16} style={{ color: 'var(--text-primary)' }} />
              <h2 id="inbox-heading" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Lời mời & Yêu cầu gia nhập của bạn
              </h2>
            </div>

            {incomingInvitations.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                }}
              >
                {incomingInvitations.length} lời mời cần phản hồi
              </span>
            )}
          </div>

          {/* Lời mời nhận được (Incoming Invitations) */}
          {incomingInvitations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                Lời mời tham gia nhóm
              </div>
              {incomingInvitations.map(inv => (
                <div
                  key={inv.id}
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inv.groupName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Người mời: {inv.inviterName} • {inv.sentAt}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleDeclineInvitation(inv.id, inv.groupName)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '5px',
                        background: 'transparent',
                        border: '1px solid var(--border-divider)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptInvitation(inv)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '5px',
                        background: 'var(--text-primary)',
                        color: 'var(--bg-app)',
                        border: '1px solid var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Chấp nhận vào nhóm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Yêu cầu đã gửi đi (Outgoing Requests) */}
          {outgoingRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: incomingInvitations.length > 0 ? '6px' : 0 }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                Yêu cầu đã gửi đang chờ phê duyệt
              </div>
              {outgoingRequests.map(req => (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} style={{ color: 'var(--text-primary)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {req.groupName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Đã gửi: {req.sentAt} • Trạng thái: Chờ Trưởng nhóm duyệt
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCancelRequest(req.id, req.groupName)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      background: 'transparent',
                      border: '1px solid var(--border-divider)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Hủy yêu cầu
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TẦNG 4: DANH BẠ CÁC NHÓM TRONG LỚP (BENTO DIRECTORY GRID) */}
      <section aria-labelledby="directory-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 id="directory-heading" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Tất cả các nhóm khác trong lớp ({filteredOtherGroups.length} nhóm)
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Mỗi học sinh tham gia tối đa 1 nhóm trong lớp
          </span>
        </div>

        {filteredOtherGroups.length === 0 ? (
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px dashed var(--border-divider)',
              borderRadius: '8px',
              padding: '36px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <FolderKanban size={28} style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Không tìm thấy nhóm phù hợp
            </div>
            <div style={{ fontSize: '12px' }}>
              Thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc sang &quot;Tất cả&quot;.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredOtherGroups.map(group => {
              const isFull = group.memberCount >= group.maxMembers;
              const hasRequested = outgoingRequests.some(r => r.groupId === group.id);

              return (
                <article
                  key={group.id}
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-divider)',
                    borderRadius: '8px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-divider)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Header Card */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderKanban size={17} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          {group.name}
                        </h3>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: isFull ? 'var(--surface-hover)' : 'transparent',
                          border: '1px solid var(--border-divider)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isFull ? 'Đã đủ' : `Còn ${group.maxMembers - group.memberCount} chỗ`}
                      </span>
                    </div>

                    {/* Topic & Description */}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Đề tài:</strong> {group.topic}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                      {group.description}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                      {group.tags.map(t => (
                        <span
                          key={t}
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            background: 'var(--surface-hover)',
                            border: '1px solid var(--border-divider)',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Trưởng nhóm & Avatar Stack */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-divider)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Trưởng nhóm: <strong style={{ color: 'var(--text-primary)' }}>{group.leadName}</strong>
                      </span>

                      {/* Stack mini avatar */}
                      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                        {group.members.slice(0, 3).map((m, idx) => (
                          <div
                            key={m.id}
                            title={m.name}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: 'var(--surface-card)',
                              border: '1px solid var(--border-divider)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              marginLeft: idx > 0 ? '-6px' : 0,
                              zIndex: 3 - idx,
                            }}
                          >
                            {m.avatarInitials}
                          </div>
                        ))}
                        {group.members.length > 3 && (
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: 'var(--surface-hover)',
                              border: '1px solid var(--border-divider)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              marginLeft: '-6px',
                            }}
                          >
                            +{group.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Sĩ số: {group.memberCount}/{group.maxMembers}
                    </div>

                    {hasRequested ? (
                      <span
                        style={{
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          padding: '5px 10px',
                          background: 'var(--surface-hover)',
                          borderRadius: '5px',
                          border: '1px solid var(--border-divider)',
                        }}
                      >
                        <Clock size={13} />
                        <span>Đã gửi yêu cầu</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isFull}
                        onClick={() => handleInitiateJoin(group)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: isFull ? 'var(--surface-hover)' : 'var(--surface-card)',
                          color: isFull ? 'var(--text-secondary)' : 'var(--text-primary)',
                          border: isFull ? '1px dashed var(--border-divider)' : '1px solid var(--border-divider)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          boxShadow: isFull ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={e => {
                          if (!isFull) {
                            e.currentTarget.style.background = 'var(--text-primary)';
                            e.currentTarget.style.color = 'var(--bg-app)';
                            e.currentTarget.style.borderColor = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isFull) {
                            e.currentTarget.style.background = 'var(--surface-card)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.borderColor = 'var(--border-divider)';
                          }
                        }}
                      >
                        <UserPlus size={13} />
                        <span>{isFull ? 'Đã đủ số lượng' : 'Xin vào nhóm'}</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL 1: ĐỀ XUẤT TẠO NHÓM MỚI */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 id="create-modal-title" style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Đề xuất lập nhóm học tập mới
              </h2>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Khi đề xuất được giáo viên phê duyệt, bạn sẽ trở thành <strong>Trưởng nhóm</strong>. Nếu bạn đang ở nhóm khác, hệ thống sẽ yêu cầu hoàn tất bàn giao trước khi chuyển.
            </p>

            <form onSubmit={handleCreateGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Tên nhóm <span style={{ color: 'var(--text-secondary)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: Nhóm 06 - Autonomous Robotics"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Đề tài nghiên cứu dự kiến <span style={{ color: 'var(--text-secondary)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: Điều khiển robot tự hành trong nhà kho thông minh"
                  value={newGroupTopic}
                  onChange={e => setNewGroupTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Mô tả mục tiêu ngắn gọn
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả công nghệ cốt lõi hoặc định hướng phát triển nhóm..."
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Sĩ số thành viên tối đa
                </label>
                <select
                  value={newGroupMaxMembers}
                  onChange={e => setNewGroupMaxMembers(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value={3}>3 thành viên</option>
                  <option value={4}>4 thành viên</option>
                  <option value={5}>5 thành viên (Mặc định)</option>
                  <option value={6}>6 thành viên</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-divider)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '7px 16px',
                    borderRadius: '6px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    border: '1px solid var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gửi đề xuất tới Giáo viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XÁC NHẬN RỜI NHÓM HIỆN TẠI */}
      {showLeaveModal && myGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertCircle size={20} style={{ color: 'var(--text-primary)' }} />
              <h2 id="leave-modal-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Xác nhận rời khỏi {myGroup.name}?
              </h2>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Nếu bạn đang phụ trách các công việc hoặc đầu mục nộp bài, vui lòng hoàn tất bàn giao trước khi rời nhóm. Lịch sử công việc và bản nộp bài cũ vẫn được lưu trữ tại nhóm.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveGroup}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: '1px solid var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Xác nhận rời nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CẢNH BÁO CHUYỂN NHÓM */}
      {switchTargetGroup && myGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertCircle size={20} style={{ color: 'var(--text-primary)' }} />
              <h2 id="switch-modal-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Xác nhận đổi nhóm học tập
              </h2>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Bạn hiện đang là thành viên của <strong>{myGroup.name}</strong>. Mỗi học sinh chỉ được tham gia tối đa 1 nhóm trong lớp.
              <br /><br />
              Nếu bạn gửi yêu cầu và được duyệt vào <strong>{switchTargetGroup.name}</strong>, tư cách của bạn tại nhóm cũ sẽ tự động kết thúc sau khi hoàn tất bàn giao.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSwitchTargetGroup(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-divider)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitchGroup}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  border: '1px solid var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tôi hiểu, hãy gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
