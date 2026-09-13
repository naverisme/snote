import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken, ApiResponse } from '../services/api';
import { UserRole } from '@snote/shared';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  timezone?: string;
  role: UserRole;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (data: { credential?: string; accessToken?: string; email?: string; fullName?: string; avatarUrl?: string; googleId?: string }) => Promise<void>;
  register: (fullName: string, email: string, password: string, timezone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { fullName?: string; timezone?: string; avatarUrl?: string | null }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get<ApiResponse<User>>('/auth/me');
      if (res.data) {
        setUser(res.data);
      }
    } catch {
      // Token hết hạn hoặc không hợp lệ -> xóa token
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setStoredToken(null);
    };

    window.addEventListener('snote:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('snote:auth-expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', {
      email,
      password
    });
    const { user: userData, accessToken } = res.data;
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const loginWithGoogle = async (payload: { credential?: string; accessToken?: string; email?: string; fullName?: string; avatarUrl?: string; googleId?: string }) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/google', payload);
    const { user: userData, accessToken } = res.data;
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const register = async (fullName: string, email: string, password: string, timezone?: string) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', {
      fullName,
      email,
      password,
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const { user: userData, accessToken } = res.data;
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore network errors during logout
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  const updateProfile = async (data: { fullName?: string; timezone?: string; avatarUrl?: string | null }) => {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    if (res.data) {
      setUser(res.data);
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await api.put('/auth/change-password', data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === UserRole.ADMIN,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
