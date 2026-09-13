import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AdminRoute } from '../components/layout/AdminRoute';
import { LoginPage, RegisterPage } from '../features/auth';
import { PublicShareViewPage } from '../features/shares/pages/PublicShareViewPage';
import { AcademicWorkspacePage } from '../features/workspace';
import { SemesterOverviewPage } from '../features/semesters';
import { ProjectsListPage } from '../features/projects';
import { SettingsPage } from '../features/settings';
import { SystemStatusPage } from '../features/status';
import { AiChatPage } from '../features/ai';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/share/:token" element={<PublicShareViewPage />} />

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route path="/workspace" element={<AcademicWorkspacePage />} />
          <Route path="/notes" element={<Navigate to="/workspace?tab=notes" replace />} />
          <Route path="/tasks" element={<Navigate to="/workspace?tab=tasks" replace />} />
          <Route path="/schedule" element={<Navigate to="/workspace?tab=schedule" replace />} />
          <Route path="/semesters" element={<SemesterOverviewPage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/ai-chat" element={<AiChatPage />} />
          <Route path="/progress" element={<Navigate to="/semesters" replace />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/status" element={<SystemStatusPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/workspace" replace />} />
    </Routes>
  );
};
