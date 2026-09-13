const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export function getStoredToken(): string | null {
  return localStorage.getItem('snote_token');
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem('snote_token', token);
  } else {
    localStorage.removeItem('snote_token');
  }
}

// Queue quản lý các request bị 401 đang chờ Refresh Token mới (Single-flight Pattern)
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailedSubscribers: Array<(err: any) => void> = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

function onTokenRefreshFailed(err: any) {
  refreshFailedSubscribers.forEach((cb) => cb(err));
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

/**
 * Tự động sao lưu dữ liệu chưa lưu và chuyển hướng về màn đăng nhập khi phiên thực sự hết hạn
 */
export function handleSessionExpired() {
  // 1. Thu thập và sao lưu bất kỳ nội dung draft nào còn lưu trong các ô nhập textarea
  try {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((ta, idx) => {
      if (ta.value && ta.value.trim().length > 0) {
        localStorage.setItem(`snote_emergency_draft_${idx}`, ta.value);
      }
    });
  } catch {
    // ignore local storage quota / access issues
  }

  setStoredToken(null);
  localStorage.setItem(
    'snote_session_expired_notice',
    'Phiên làm việc đã hết hạn sau thời gian dài không hoạt động. Các thay đổi và bản nháp gần nhất của bạn đã được sao lưu an toàn.'
  );

  window.dispatchEvent(new CustomEvent('snote:auth-expired'));

  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login?expired=1';
  }
}

async function requestNewAccessToken(): Promise<string> {
  const refreshUrl = `${API_BASE_URL}/auth/refresh`;
  const response = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Gửi kèm cookie httpOnly snote_refresh_token
  });

  if (!response.ok) {
    throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
  }

  const json = await response.json();
  const newToken = json.data?.accessToken;
  if (!newToken) {
    throw new Error('Không nhận được accessToken mới từ phản hồi');
  }

  setStoredToken(newToken);
  return newToken;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Gửi kèm cookie httpOnly
    });
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch' || err.message?.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ Backend (Port 4000). Vui lòng kiểm tra dịch vụ máy chủ backend.');
    }
    throw err;
  }

  const isAuthEndpoint =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/google');

  // Nếu gặp lỗi 401 (Unauthorized) và không phải request đăng nhập/làm mới
  if (response.status === 401 && !isAuthEndpoint && !isRetry) {
    if (isRefreshing) {
      // Đang có một tiến trình refresh chạy -> Đưa vào hàng đợi, chờ hoàn tất rồi retry
      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push((newToken: string) => {
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`
          };
          resolve(request<T>(path, { ...options, headers: newHeaders }, true));
        });
        refreshFailedSubscribers.push((err: any) => {
          reject(err);
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await requestNewAccessToken();
      isRefreshing = false;
      onTokenRefreshed(newToken);

      // Thử lại request ban đầu với token mới một cách mượt mà
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`
      };
      return request<T>(path, { ...options, headers: newHeaders }, true);
    } catch (refreshErr) {
      isRefreshing = false;
      onTokenRefreshFailed(refreshErr);
      handleSessionExpired();
      throw refreshErr;
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      errorBody.error?.message || errorBody.message || `Lỗi máy chủ (Mã: ${response.status})`;
    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).code = errorBody.error?.code;
    (error as any).details = errorBody.error?.details;
    throw error;
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: any) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  // Helper download raw blob (cho Export JSON)
  download: async (path: string, defaultFilename: string): Promise<void> => {
    const url = `${API_BASE_URL}${path}`;
    const token = getStoredToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const response = await fetch(url, { headers, credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Tải tệp thất bại: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }
};
