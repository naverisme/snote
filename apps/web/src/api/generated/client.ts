import type { paths } from '@snote/contracts';

type RegisterBody = paths['/auth/register']['post']['requestBody']['content']['application/json'];
type RegisterResult = paths['/auth/register']['post']['responses'][200]['content']['application/json'];
type CreateTaskBody = paths['/workspaces/{workspaceId}/tasks']['post']['requestBody']['content']['application/json'];
type CreateTaskResult = paths['/workspaces/{workspaceId}/tasks']['post']['responses'][200]['content']['application/json'];
type SubmitBody = paths['/assignment-recipients/{recipientId}/submissions']['post']['requestBody']['content']['application/json'];
type SubmitResult = paths['/assignment-recipients/{recipientId}/submissions']['post']['responses'][200]['content']['application/json'];
type AssignmentBody = paths['/classes/{classId}/assignments']['post']['requestBody']['content']['application/json'];
type AssignmentResult = paths['/classes/{classId}/assignments']['post']['responses'][200]['content']['application/json'];

export interface RequestOptions {
  csrfToken?: string;
  etag?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly body: unknown) { super(`API ${status}`); }
}

export async function request<T>(path: string, method: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (options.csrfToken) headers.set('X-CSRF-Token', options.csrfToken);
  if (options.etag) headers.set('If-Match', options.etag);
  if (options.idempotencyKey) headers.set('Idempotency-Key', options.idempotencyKey);
  const response = await fetch(`/api/v2${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'include', signal: options.signal });
  const payload: unknown = await response.json();
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export const register = (body: RegisterBody) => request<RegisterResult>('/auth/register', 'POST', body);
export const createTask = (workspaceId: string, body: CreateTaskBody, options: RequestOptions) =>
  request<CreateTaskResult>(`/workspaces/${encodeURIComponent(workspaceId)}/tasks`, 'POST', body, options);
export const createAssignment = (classId: string, body: AssignmentBody, options: RequestOptions) =>
  request<AssignmentResult>(`/classes/${encodeURIComponent(classId)}/assignments`, 'POST', body, options);
export const submit = (recipientId: string, body: SubmitBody, options: RequestOptions & { idempotencyKey: string }) =>
  request<SubmitResult>(`/assignment-recipients/${encodeURIComponent(recipientId)}/submissions`, 'POST', body, options);
