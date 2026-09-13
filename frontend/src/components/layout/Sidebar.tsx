import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  Settings,
  Activity,
  LogOut,
  Sun,
  Moon,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Pin,
  PinOff,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredNavKey, setHoveredNavKey] = useState<string | null>(null);
  const [isThemeHovered, setIsThemeHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const baseNavItems = [
    { to: '/workspace', label: 'Không Gian Học Tập', icon: LayoutDashboard, desc: 'Ghi chú • Việc làm • Lịch' },
    { to: '/semesters', label: 'Môn & Học kỳ', icon: Layers, desc: 'Cấu trúc học phần' },
    { to: '/projects', label: 'Dự án & BTL', icon: FolderKanban, desc: 'Đồ án & Nhóm' },
    { to: '/ai-chat', label: 'Trợ lý AI Copilot', icon: Sparkles, badge: 'AI', desc: 'Hỏi đáp bài học thông minh' },
    { to: '/settings', label: 'Cài đặt & Sao lưu', icon: Settings, desc: 'Cấu hình hệ thống' }
  ];

  // Chỉ hiển thị mục Trạng thái hệ thống khi là Admin
  const adminNavItems = isAdmin
    ? [{ to: '/status', label: 'Trạng thái Hệ thống', icon: Activity, badge: 'ADMIN', desc: 'Giám sát hạ tầng' }]
    : [];

  const navItems = [...baseNavItems, ...adminNavItems];

  return (
    <>
      {/* Invisible fixed rail placeholder to prevent layout shifts */}
      <div
        style={{
          width: isPinned ? '260px' : '68px',
          flexShrink: 0,
          transition: 'width 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* Floating / Expanding Sidebar on Hover */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredNavKey(null);
        }}
        className="glass-panel"
        style={{
          width: isExpanded ? '264px' : '68px',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 100,
          transition: 'width 0.26s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.26s ease',
          boxShadow: isExpanded
            ? '0 12px 48px rgba(0, 0, 0, 0.38), 0 0 28px rgba(99, 102, 241, 0.18)'
            : 'var(--shadow-sm)',
          overflowX: 'visible',
          backgroundColor: isExpanded ? 'var(--bg-card)' : 'var(--bg-secondary)',
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '16px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            minHeight: '70px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {/* Fixed-position Logo Box with Pulsing Hover Aura */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: isExpanded ? '0 0 16px rgba(99, 102, 241, 0.45)' : 'var(--shadow-accent)',
                flexShrink: 0,
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
              }}
            >
              <GraduationCap size={22} />
            </div>

            {/* Brand Title (Fades in smoothly to the right of fixed icon) */}
            <div
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                pointerEvents: isExpanded ? 'auto' : 'none'
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                SNOTE
              </h2>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                ACADEMIC BRAIN
              </span>
            </div>
          </div>

          {/* Pin Toggle Button */}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className="btn btn-ghost btn-icon btn-sm animate-fade-in"
              style={{
                padding: '4px',
                color: isPinned ? 'var(--accent-primary)' : 'var(--text-muted)',
                flexShrink: 0,
                transition: 'transform var(--transition-fast), color var(--transition-fast)'
              }}
              title={isPinned ? 'Bỏ ghim (Tự động ẩn menu)' : 'Ghim cố định menu'}
            >
              {isPinned ? <Pin size={15} /> : <PinOff size={15} />}
            </button>
          )}
        </div>

        {/* Navigation Links with Micro-Interactions & Hover Popovers */}
        <nav
          style={{
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'visible'
          }}
        >

          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemHovered = hoveredNavKey === item.to;

            return (
              <div
                key={item.to}
                onMouseEnter={() => setHoveredNavKey(item.to)}
                onMouseLeave={() => setHoveredNavKey(null)}
                style={{ position: 'relative', width: '100%' }}
              >
                <NavLink
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '9px 8px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive
                      ? '#ffffff'
                      : isItemHovered
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                    backgroundColor: isActive
                      ? 'var(--accent-primary)'
                      : isItemHovered
                      ? 'var(--accent-subtle)'
                      : 'transparent',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: isActive || isItemHovered ? 600 : 500,
                    boxShadow: isActive
                      ? 'var(--shadow-accent)'
                      : isItemHovered
                      ? '0 2px 10px rgba(99, 102, 241, 0.12)'
                      : 'none',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    width: '100%',
                    boxSizing: 'border-box',
                    border: isItemHovered && !isActive ? '1px solid var(--accent-primary)' : '1px solid transparent'
                  })}
                >
                  {/* Fixed-width Icon Anchor Container with Hover Elevation */}
                  <div
                    style={{
                      width: '32px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transform: isItemHovered ? 'scale(1.15)' : 'scale(1)',
                      color: isItemHovered ? 'var(--accent-primary)' : 'inherit',
                      transition: 'transform 0.18s ease, color 0.18s ease'
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Text Label & Badges with Slide Hover Motion */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      minWidth: 0,
                      marginLeft: '8px',
                      opacity: isExpanded ? 1 : 0,
                      transform: isExpanded
                        ? isItemHovered
                          ? 'translateX(4px)'
                          : 'translateX(0)'
                        : 'translateX(-8px)',
                      transition: 'opacity 0.2s ease, transform 0.18s ease',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.label}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.badge && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: item.badge === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: item.badge === 'ADMIN' ? 'var(--color-danger)' : 'var(--accent-primary)',
                            border: `1px solid ${item.badge === 'ADMIN' ? 'var(--color-danger)' : 'var(--accent-primary)'}`,
                            flexShrink: 0
                          }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Subtle hover right chevron */}
                      <ChevronRight
                        size={13}
                        style={{
                          color: 'var(--accent-primary)',
                          opacity: isItemHovered ? 0.9 : 0,
                          transform: isItemHovered ? 'translateX(0)' : 'translateX(-4px)',
                          transition: 'opacity 0.18s ease, transform 0.18s ease'
                        }}
                      />
                    </div>
                  </div>
                </NavLink>

                {/* Floating Tooltip Pill (Appears when sidebar is collapsed & item is hovered) */}
                {!isExpanded && isItemHovered && (
                  <div
                    className="animate-scale-in"
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 10px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid var(--accent-primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '7px 12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 16px rgba(99, 102, 241, 0.25)',
                      zIndex: 9999,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: 'var(--accent-primary)',
                            backgroundColor: 'var(--accent-subtle)',
                            padding: '1px 4px',
                            borderRadius: '3px'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.desc && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Theme & User Controls Footer */}
        <div
          style={{
            padding: '14px 10px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'var(--bg-card)',
            boxSizing: 'border-box'
          }}
        >
          {/* Quick Theme Toggle with Rotating Hover Effect */}
          <button
            type="button"
            onClick={toggleTheme}
            onMouseEnter={() => setIsThemeHovered(true)}
            onMouseLeave={() => setIsThemeHovered(false)}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '7px 8px',
              boxSizing: 'border-box',
              border: isThemeHovered ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: isThemeHovered ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
              transition: 'all 0.18s ease'
            }}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {/* Fixed Icon Container with Micro-Rotation on Hover */}
            <div
              style={{
                width: '32px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: isThemeHovered ? 'rotate(24deg) scale(1.15)' : 'rotate(0deg) scale(1)',
                color: isThemeHovered ? 'var(--accent-primary)' : 'inherit',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease'
              }}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </div>

            {/* Label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
                minWidth: 0,
                marginLeft: '8px',
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isExpanded ? 'auto' : 'none',
                fontSize: '12px'
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>Giao diện: {theme === 'dark' ? 'Tối' : 'Sáng'}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đổi</span>
            </div>
          </button>

          {/* User Profile with Elevating Hover Card */}
          {user && (
            <div
              onMouseEnter={() => setIsUserHovered(true)}
              onMouseLeave={() => setIsUserHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '6px 8px',
                borderRadius: 'var(--radius-md)',
                boxSizing: 'border-box',
                border: isUserHovered ? '1px solid var(--accent-primary)' : '1px solid transparent',
                backgroundColor: isUserHovered ? 'var(--accent-subtle)' : 'transparent',
                transition: 'all 0.18s ease'
              }}
            >
              {/* Fixed User Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isAdmin ? 'var(--color-danger)' : 'var(--accent-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  flexShrink: 0,
                  transform: isUserHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.18s ease'
                }}
                title={user.fullName || user.email}
              >
                {isAdmin ? <ShieldCheck size={16} /> : (user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
              </div>

              {/* User info & logout button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                  minWidth: 0,
                  marginLeft: '8px',
                  opacity: isExpanded ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: isExpanded ? 'auto' : 'none'
                }}
              >
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{user.fullName}</span>
                    {isAdmin && (
                      <span style={{ fontSize: '8.5px', backgroundColor: 'var(--color-danger)', color: '#fff', padding: '1px 3px', borderRadius: '3px', fontWeight: 800 }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                  >
                    {user.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-ghost btn-icon btn-sm"
                  title="Đăng xuất"
                  style={{
                    color: 'var(--text-muted)',
                    padding: '4px',
                    flexShrink: 0,
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
