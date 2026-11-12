import React, { useState, useEffect } from 'react';
import { Tab01ClassMembersAdmin } from './Tab01ClassMembersAdmin';
import { Tab02ClassMembersStudent } from './Tab02ClassMembersStudent';
import { Tab03ClassGroupsAdmin } from './Tab03ClassGroupsAdmin';
import { Tab04ClassGroupsStudent } from './Tab04ClassGroupsStudent';
import { Tab05ClassSettingsAdmin } from './Tab05ClassSettingsAdmin';
import { Tab06GroupMembersOwner } from './Tab06GroupMembersOwner';
import { Tab07GroupMembersStudent } from './Tab07GroupMembersStudent';
import { Tab08TasksGantt } from './Tab08TasksGantt';
import { Tab09TasksList } from './Tab09TasksList';
import { Tab10CalendarGrid } from './Tab10CalendarGrid';
import { Tab11LibraryExplorer } from './Tab11LibraryExplorer';
import { Tab12AssignmentsTeacher } from './Tab12AssignmentsTeacher';
import { Tab13AssignmentsStudent } from './Tab13AssignmentsStudent';
import { Tab14WorkspaceNotes } from './Tab14WorkspaceNotes';

export interface PreviewTabDefinition {
  id: number;
  slug: string;
  label: string;
  roleBadge: string;
  category: 'Lớp học' | 'Nhóm' | 'Nghiệp vụ';
}

export const PREVIEW_TABS: PreviewTabDefinition[] = [
  { id: 1, slug: 'class-members-admin', label: 'Thành viên lớp', roleBadge: 'Giáo viên', category: 'Lớp học' },
  { id: 2, slug: 'class-members-student', label: 'Thành viên lớp', roleBadge: 'Học sinh', category: 'Lớp học' },
  { id: 3, slug: 'class-groups-admin', label: 'Nhóm trong lớp', roleBadge: 'Giáo viên', category: 'Lớp học' },
  { id: 4, slug: 'class-groups-student', label: 'Nhóm trong lớp', roleBadge: 'Học sinh', category: 'Lớp học' },
  { id: 5, slug: 'class-settings-admin', label: 'Cài đặt lớp', roleBadge: 'Giáo viên', category: 'Lớp học' },
  { id: 6, slug: 'group-members-owner', label: 'Thành viên nhóm', roleBadge: 'Trưởng nhóm', category: 'Nhóm' },
  { id: 7, slug: 'group-members-student', label: 'Thành viên nhóm', roleBadge: 'Thành viên', category: 'Nhóm' },
  { id: 8, slug: 'tasks-gantt', label: 'Công việc Gantt', roleBadge: 'Timeline', category: 'Nghiệp vụ' },
  { id: 9, slug: 'tasks-list', label: 'Công việc List', roleBadge: 'Checklist', category: 'Nghiệp vụ' },
  { id: 10, slug: 'calendar-grid', label: 'Lịch biểu', roleBadge: 'Tháng/Tuần', category: 'Nghiệp vụ' },
  { id: 11, slug: 'library-explorer', label: 'Thư viện file', roleBadge: 'Cây thư mục', category: 'Nghiệp vụ' },
  { id: 12, slug: 'assignments-teacher', label: 'Bài giao', roleBadge: 'Giáo viên', category: 'Nghiệp vụ' },
  { id: 13, slug: 'assignments-student', label: 'Bài giao', roleBadge: 'Học sinh', category: 'Nghiệp vụ' },
  { id: 14, slug: 'workspace-notes', label: 'Mục lưu ý', roleBadge: 'Ghi chú', category: 'Nghiệp vụ' },
];

export const PreviewHarness: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);

  // Sync with URL query parameter ?tab=1..14 or ?view=slug
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const viewParam = params.get('view');

    if (tabParam) {
      const num = parseInt(tabParam, 10);
      if (num >= 1 && num <= 14) {
        setActiveTab(num);
        return;
      }
    }

    if (viewParam) {
      const matched = PREVIEW_TABS.find(t => t.slug === viewParam);
      if (matched) {
        setActiveTab(matched.id);
      }
    }
  }, []);

  const handleSelectTab = (tabId: number) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId.toString());
      window.history.replaceState({}, '', url.toString());
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 1: return <Tab01ClassMembersAdmin />;
      case 2: return <Tab02ClassMembersStudent />;
      case 3: return <Tab03ClassGroupsAdmin />;
      case 4: return <Tab04ClassGroupsStudent />;
      case 5: return <Tab05ClassSettingsAdmin />;
      case 6: return <Tab06GroupMembersOwner />;
      case 7: return <Tab07GroupMembersStudent />;
      case 8: return <Tab08TasksGantt />;
      case 9: return <Tab09TasksList />;
      case 10: return <Tab10CalendarGrid />;
      case 11: return <Tab11LibraryExplorer />;
      case 12: return <Tab12AssignmentsTeacher />;
      case 13: return <Tab13AssignmentsStudent />;
      case 14: return <Tab14WorkspaceNotes />;
      default: return <Tab01ClassMembersAdmin />;
    }
  };

  const currentDef = PREVIEW_TABS.find(t => t.id === activeTab) || PREVIEW_TABS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* 14 Tabs Navigation Bar */}
      <div
        style={{
          background: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-divider)',
          padding: '8px 12px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {PREVIEW_TABS.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isActive ? 'var(--text-primary)' : 'var(--border-divider)',
                background: isActive ? 'var(--surface-hover)' : 'transparent',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>#{tab.id < 10 ? `0${tab.id}` : tab.id}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: isActive ? 'var(--surface-card)' : 'var(--surface-hover)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-divider)',
                  fontWeight: 600,
                }}
              >
                {tab.roleBadge}
              </span>
            </button>
          );
        })}

        <a
          href="/"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            background: 'var(--text-primary)',
            color: 'var(--bg-app)',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Về Ứng dụng Thực tế ➔
        </a>
      </div>

      {/* Sub-Header Breadcrumb for current tab */}
      <div
        style={{
          padding: '10px 20px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Màn hình phụ thuộc:</span>
          <strong style={{ color: 'var(--text-primary)' }}>Tab {currentDef.id < 10 ? `0${currentDef.id}` : currentDef.id}. {currentDef.label}</strong>
          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '4px', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>
            {currentDef.roleBadge}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          URL mở tab riêng: <code style={{ color: 'var(--text-primary)', background: 'var(--surface-card)', padding: '2px 6px', borderRadius: '4px' }}>?tab={currentDef.id}</code>
        </div>
      </div>

      {/* Active Tab Viewport Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {renderActiveView()}
      </div>
    </div>
  );
};
