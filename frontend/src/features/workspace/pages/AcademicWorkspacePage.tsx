import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { NotesListPage } from '../../notes/pages/NotesListPage';
import { TasksListPage } from '../../tasks/pages/TasksListPage';
import { ScheduleWeekPage } from '../../schedule/pages/ScheduleWeekPage';
import { UnifiedQuickBar, QuickMode } from '../../../components/common/UnifiedQuickBar';
import {
  FileText,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export type WorkspaceTab = 'notes' | 'tasks' | 'schedule';

export const AcademicWorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { subjects, selectedSubjectId } = useAppFilter();

  const initialTab = (searchParams.get('tab') as WorkspaceTab) || 'notes';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    ['notes', 'tasks', 'schedule'].includes(initialTab) ? initialTab : 'notes'
  );

  // Key để trigger re-fetch nội dung con khi tạo item thành công
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Đồng bộ URL search params khi đổi tab
  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // Cập nhật khi URL param thay đổi (ví dụ navigate từ bên ngoài)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as WorkspaceTab;
    if (tabParam && ['notes', 'tasks', 'schedule'].includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabsConfig = [
    {
      id: 'notes' as WorkspaceTab,
      mode: 'NOTE' as QuickMode,
      label: 'Ghi Chú',
      icon: FileText,
      color: '#6366f1',
      bgSubtle: 'rgba(99, 102, 241, 0.12)',
      borderSubtle: 'rgba(99, 102, 241, 0.35)',
      description: 'Soạn thảo đề cương, bài giảng & trích xuất AI'
    },
    {
      id: 'tasks' as WorkspaceTab,
      mode: 'TASK' as QuickMode,
      label: 'Việc Làm & Deadline',
      icon: CheckCircle2,
      color: '#10b981',
      bgSubtle: 'rgba(16, 185, 129, 0.12)',
      borderSubtle: 'rgba(16, 185, 129, 0.35)',
      description: 'Kanban board, danh sách nhiệm vụ & ma trận ưu tiên'
    },
    {
      id: 'schedule' as WorkspaceTab,
      mode: 'EVENT' as QuickMode,
      label: 'Lịch & Timeline',
      icon: Calendar,
      color: '#f59e0b',
      bgSubtle: 'rgba(245, 158, 11, 0.12)',
      borderSubtle: 'rgba(245, 158, 11, 0.35)',
      description: 'Thời khóa biểu, lịch thi & sơ đồ Gantt trực quan'
    }
  ];

  const currentTabConfig = tabsConfig.find((t) => t.id === activeTab) || tabsConfig[0];

  const handleItemCreated = (type: QuickMode) => {
    setRefreshKey((k) => k + 1);
    if (type === 'NOTE' && activeTab !== 'notes') {
      handleTabChange('notes');
    } else if (type === 'TASK' && activeTab !== 'tasks') {
      handleTabChange('tasks');
    } else if (type === 'EVENT' && activeTab !== 'schedule') {
      handleTabChange('schedule');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP ALL-IN-ONE WORKSPACE SEGMENTED CONTROLLER */}
      <div
        className="glass-panel"
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Left: 3 Core Tabs (Tâm lý học màu sắc) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? tab.color : 'transparent',
                  border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
                  boxShadow: isActive ? `0 4px 14px ${tab.bgSubtle}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Active Tab Subtitle Info */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingRight: '6px'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: currentTabConfig.color
            }}
          />
          <span style={{ fontWeight: 500 }}>{currentTabConfig.description}</span>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTENT AREA + QUICK CAPTURE */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* UNIFIED QUICK CAPTURE BAR (Chỉ 1 thanh duy nhất) */}
        <UnifiedQuickBar
          key={`quickbar_${activeTab}`}
          initialMode={currentTabConfig.mode}
          subjects={subjects}
          defaultSubjectId={selectedSubjectId || undefined}
          onItemCreated={handleItemCreated}
        />

        {/* DYNAMIC WORKSPACE BODY */}
        <div className="animate-fade-in" key={`${activeTab}_${refreshKey}`}>
          {activeTab === 'notes' && <NotesListPage />}
          {activeTab === 'tasks' && <TasksListPage />}
          {activeTab === 'schedule' && <ScheduleWeekPage />}
        </div>
      </div>
    </div>
  );
};
