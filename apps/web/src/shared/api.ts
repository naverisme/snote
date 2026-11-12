import { request, ApiError } from '../api/generated/client';
import type {
  Account,
  Class,
  Workspace,
  Membership,
  Invitation,
  JoinRequest,
  Policy,
  JoinCodeState,
  OwnershipTransfer,
  Grant,
} from './types';

const CSRF_STORAGE_KEY = 'snote_csrf_token';

let currentCsrfToken: string | undefined = typeof window !== 'undefined'
  ? window.sessionStorage?.getItem(CSRF_STORAGE_KEY) || window.localStorage?.getItem(CSRF_STORAGE_KEY) || undefined
  : undefined;

export function setCsrfToken(token: string | undefined) {
  currentCsrfToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        window.sessionStorage?.setItem(CSRF_STORAGE_KEY, token);
        window.localStorage?.setItem(CSRF_STORAGE_KEY, token);
      } else {
        window.sessionStorage?.removeItem(CSRF_STORAGE_KEY);
        window.localStorage?.removeItem(CSRF_STORAGE_KEY);
      }
    } catch {}
  }
}

export function getCsrfToken(): string | undefined {
  if (!currentCsrfToken && typeof window !== 'undefined') {
    try {
      currentCsrfToken = window.sessionStorage?.getItem(CSRF_STORAGE_KEY) || window.localStorage?.getItem(CSRF_STORAGE_KEY) || undefined;
    } catch {}
  }
  return currentCsrfToken;
}

export interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export interface AuthSessionResponse {
  data: Account;
  csrfToken: string;
  requestId: string;
}

// Auth API
export async function register(body: { email: string; password: string; usages: Account['usages']; timeZone: string }) {
  const res = await request<AuthSessionResponse>('/auth/register', 'POST', body);
  setCsrfToken(res.csrfToken);
  return res;
}

export async function login(body: { email: string; password: string }) {
  const res = await request<AuthSessionResponse>('/auth/login', 'POST', body);
  setCsrfToken(res.csrfToken);
  return res;
}

export async function googleSignIn(body: { credential: string; usages: Account['usages']; timeZone: string }) {
  const res = await request<AuthSessionResponse>('/auth/google', 'POST', body);
  setCsrfToken(res.csrfToken);
  return res;
}

export async function logout() {
  const res = await request<ApiResponse<{ success: boolean }>>('/auth/logout', 'POST', undefined, {
    csrfToken: currentCsrfToken,
  });
  setCsrfToken(undefined);
  return res;
}

export async function passwordResetRequest(email: string) {
  return request<ApiResponse<{ success: boolean }>>('/auth/password-reset-request', 'POST', { email });
}

export async function passwordReset(token: string, newPassword: string) {
  return request<ApiResponse<{ success: boolean }>>('/auth/password-reset', 'POST', { token, newPassword });
}

// Me API
export async function getMe() {
  return request<ApiResponse<Account>>('/me', 'GET');
}

export async function changeUsages(usages: Account['usages'], version: number) {
  return request<ApiResponse<Account>>('/me/usages', 'PATCH', { usages }, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function changeProfile(displayName: string, version: number) {
  return request<ApiResponse<Account>>('/me/profile', 'PATCH', { displayName }, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function getMyInvitations() {
  return request<ApiResponse<Invitation[]>>('/me/invitations', 'GET');
}

export async function getMyTransfers() {
  return request<ApiResponse<OwnershipTransfer[]>>('/me/ownership-transfers', 'GET');
}

// Classes API
export async function listClasses() {
  return request<ApiResponse<Class[]>>('/classes', 'GET');
}

export async function createClass(body: { name: string; timeZone: string }) {
  return request<ApiResponse<Class>>('/classes', 'POST', body, {
    csrfToken: currentCsrfToken,
  });
}

export async function getClass(classId: string) {
  return request<ApiResponse<Class>>(`/classes/${encodeURIComponent(classId)}`, 'GET');
}

export async function listClassMembers(classId: string) {
  return request<ApiResponse<Membership[]>>(`/classes/${encodeURIComponent(classId)}/members`, 'GET');
}

export async function changeMemberRole(classId: string, membershipId: string, role: 'member' | 'monitor', version: number) {
  return request<ApiResponse<Membership>>(
    `/classes/${encodeURIComponent(classId)}/members/${encodeURIComponent(membershipId)}/role`,
    'PATCH',
    { role },
    { csrfToken: currentCsrfToken, etag: `"${version}"` },
  );
}

export async function getClassJoinCode(classId: string) {
  return request<ApiResponse<JoinCodeState>>(`/classes/${encodeURIComponent(classId)}/join-code`, 'GET');
}

export async function setClassJoinCode(classId: string, enabled: boolean, version: number) {
  return request<ApiResponse<JoinCodeState>>(`/classes/${encodeURIComponent(classId)}/join-code`, 'POST', { enabled }, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function createClassJoinRequest(classId: string, code: string) {
  return request<ApiResponse<JoinRequest>>(`/classes/${encodeURIComponent(classId)}/join-requests`, 'POST', { code }, {
    csrfToken: currentCsrfToken,
  });
}

export async function listClassJoinRequests(classId: string) {
  return request<ApiResponse<JoinRequest[]>>(`/classes/${encodeURIComponent(classId)}/join-requests`, 'GET');
}

export async function approveClassJoinRequest(requestId: string, version: number) {
  return request<ApiResponse<JoinRequest>>(`/class-join-requests/${encodeURIComponent(requestId)}/approve`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function declineClassJoinRequest(requestId: string, version: number) {
  return request<ApiResponse<JoinRequest>>(`/class-join-requests/${encodeURIComponent(requestId)}/decline`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function createClassInvitation(classId: string, inviteeId: string) {
  return request<ApiResponse<Invitation>>(`/classes/${encodeURIComponent(classId)}/invitations`, 'POST', { inviteeId }, {
    csrfToken: currentCsrfToken,
  });
}

export async function acceptClassInvitation(invitationId: string, version: number) {
  return request<ApiResponse<Invitation>>(`/class-invitations/${encodeURIComponent(invitationId)}/accept`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function declineClassInvitation(invitationId: string, version: number) {
  return request<ApiResponse<Invitation>>(`/class-invitations/${encodeURIComponent(invitationId)}/decline`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function archiveClass(classId: string, version: number) {
  return request<ApiResponse<Class>>(`/classes/${encodeURIComponent(classId)}/archive`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function restoreClass(classId: string, version: number) {
  return request<ApiResponse<Class>>(`/classes/${encodeURIComponent(classId)}/restore`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function leaveClass(classId: string, handoverTo?: string, version?: number) {
  return request<ApiResponse<Membership>>(`/classes/${encodeURIComponent(classId)}/leave`, 'POST', { handoverTo }, {
    csrfToken: currentCsrfToken,
    etag: version !== undefined ? `"${version}"` : undefined,
  });
}

export async function removeClassMember(classId: string, memberId: string, version?: number) {
  return request<ApiResponse<Membership>>(`/classes/${encodeURIComponent(classId)}/remove-member`, 'POST', { memberId }, {
    csrfToken: currentCsrfToken,
    etag: version !== undefined ? `"${version}"` : undefined,
  });
}

export async function getClassPolicy(classId: string) {
  return request<ApiResponse<Policy>>(`/classes/${encodeURIComponent(classId)}/policy`, 'GET');
}

export async function updateClassPolicy(classId: string, policy: Policy, version?: number) {
  return request<ApiResponse<Policy>>(`/classes/${encodeURIComponent(classId)}/policy`, 'PATCH', policy, {
    csrfToken: currentCsrfToken,
    etag: version !== undefined ? `"${version}"` : undefined,
  });
}

export async function transferClassOwnership(classId: string, recipientId: string) {
  return request<ApiResponse<OwnershipTransfer>>(`/classes/${encodeURIComponent(classId)}/ownership-transfers`, 'POST', { recipientId }, {
    csrfToken: currentCsrfToken,
  });
}

// Workspaces and Groups API
export async function listWorkspaces() {
  return request<ApiResponse<Workspace[]>>('/workspaces', 'GET');
}

export async function createWorkspace(body: { name: string }) {
  return request<ApiResponse<Workspace>>('/workspaces', 'POST', body, {
    csrfToken: currentCsrfToken,
  });
}

export async function getWorkspace(workspaceId: string) {
  return request<ApiResponse<Workspace>>(`/workspaces/${encodeURIComponent(workspaceId)}`, 'GET');
}

export async function listWorkspaceMembers(workspaceId: string) {
  return request<ApiResponse<Membership[]>>(`/workspaces/${encodeURIComponent(workspaceId)}/members`, 'GET');
}

export async function createWorkspaceInvitation(workspaceId: string, inviteeId: string) {
  return request<ApiResponse<Invitation>>(`/workspaces/${encodeURIComponent(workspaceId)}/invitations`, 'POST', { inviteeId }, {
    csrfToken: currentCsrfToken,
  });
}

export async function transferWorkspaceOwnership(workspaceId: string, recipientId: string) {
  return request<ApiResponse<OwnershipTransfer>>(`/workspaces/${encodeURIComponent(workspaceId)}/ownership-transfers`, 'POST', { recipientId }, {
    csrfToken: currentCsrfToken,
  });
}

export async function listClassGroups(classId: string) {
  return request<ApiResponse<Workspace[]>>(`/classes/${encodeURIComponent(classId)}/groups`, 'GET');
}

export async function createClassGroup(classId: string, body: { name: string; leaderId?: string }) {
  return request<ApiResponse<Workspace>>(`/classes/${encodeURIComponent(classId)}/groups`, 'POST', body, {
    csrfToken: currentCsrfToken,
  });
}

export async function listGroupMembers(groupId: string) {
  return request<ApiResponse<Membership[]>>(`/groups/${encodeURIComponent(groupId)}/members`, 'GET');
}

export async function changeGroupLeader(groupId: string, leaderId: string, version: number) {
  return request<ApiResponse<Membership>>(`/groups/${encodeURIComponent(groupId)}/leader`, 'PATCH', { leaderId }, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function createGroupInvitation(groupId: string, inviteeId: string) {
  return request<ApiResponse<Invitation>>(`/groups/${encodeURIComponent(groupId)}/invitations`, 'POST', { inviteeId }, {
    csrfToken: currentCsrfToken,
  });
}

export async function acceptGroupInvitation(invitationId: string, version: number) {
  return request<ApiResponse<Invitation>>(`/group-invitations/${encodeURIComponent(invitationId)}/accept`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function declineGroupInvitation(invitationId: string, version: number) {
  return request<ApiResponse<Invitation>>(`/group-invitations/${encodeURIComponent(invitationId)}/decline`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function createGroupJoinRequest(groupId: string) {
  return request<ApiResponse<JoinRequest>>(`/groups/${encodeURIComponent(groupId)}/join-requests`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
  });
}

export async function listGroupJoinRequests(groupId: string) {
  return request<ApiResponse<JoinRequest[]>>(`/groups/${encodeURIComponent(groupId)}/join-requests`, 'GET');
}

export async function approveGroupJoinRequest(requestId: string, version: number) {
  return request<ApiResponse<JoinRequest>>(`/group-join-requests/${encodeURIComponent(requestId)}/approve`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function declineGroupJoinRequest(requestId: string, version: number) {
  return request<ApiResponse<JoinRequest>>(`/group-join-requests/${encodeURIComponent(requestId)}/decline`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function leaveGroup(groupId: string, handoverTo?: string, version?: number) {
  return request<ApiResponse<Membership>>(`/groups/${encodeURIComponent(groupId)}/leave`, 'POST', { handoverTo }, {
    csrfToken: currentCsrfToken,
    etag: version !== undefined ? `"${version}"` : undefined,
  });
}

export async function removeGroupMember(groupId: string, memberId: string, handoverTo?: string, version?: number) {
  return request<ApiResponse<Membership>>(`/groups/${encodeURIComponent(groupId)}/remove-member`, 'POST', { memberId, handoverTo }, {
    csrfToken: currentCsrfToken,
    etag: version !== undefined ? `"${version}"` : undefined,
  });
}

export async function archiveWorkspace(workspaceId: string, version: number) {
  return request<ApiResponse<Workspace>>(`/workspaces/${encodeURIComponent(workspaceId)}/archive`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function restoreWorkspace(workspaceId: string, version: number) {
  return request<ApiResponse<Workspace>>(`/workspaces/${encodeURIComponent(workspaceId)}/restore`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export async function acceptTransfer(transferId: string, version: number) {
  return request<ApiResponse<OwnershipTransfer>>(`/ownership-transfers/${encodeURIComponent(transferId)}/accept`, 'POST', undefined, {
    csrfToken: currentCsrfToken,
    etag: `"${version}"`,
  });
}

export { ApiError };
