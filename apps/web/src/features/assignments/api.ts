import type {
  Assignment,
  AssignmentInput,
  Feedback,
  RecipientProgress,
  Submission,
  SubmissionInput,
} from './types';
import { getCsrfToken } from '../../shared/api';

export interface RequestOptions {
  csrfToken?: string;
  etag?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly details: unknown
  ) {
    super(`API Error ${status}: ${code}`);
  }
}

async function apiRequest<T>(
  path: string,
  method: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers();
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const csrfToken = options.csrfToken ?? getCsrfToken();
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  if (options.etag) {
    headers.set('If-Match', options.etag);
  }
  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  const response = await fetch(`/api/v2${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    signal: options.signal,
  });

  const payload: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    const code = payload?.error?.code || `HTTP_${response.status}`;
    throw new ApiError(response.status, code, payload?.error?.details || payload);
  }

  return payload.data as T;
}

export async function fetchClassAssignments(
  classId: string,
  signal?: AbortSignal
): Promise<Assignment[]> {
  return apiRequest<Assignment[]>(`/classes/${encodeURIComponent(classId)}/assignments`, 'GET', undefined, { signal });
}

export async function createAssignment(
  classId: string,
  input: AssignmentInput,
  options: RequestOptions = {}
): Promise<Assignment> {
  return apiRequest<Assignment>(`/classes/${encodeURIComponent(classId)}/assignments`, 'POST', input, options);
}

export async function updateAssignment(
  assignmentId: string,
  input: AssignmentInput,
  options: RequestOptions = {}
): Promise<Assignment> {
  return apiRequest<Assignment>(`/assignments/${encodeURIComponent(assignmentId)}`, 'PATCH', input, options);
}

export async function archiveAssignment(
  assignmentId: string,
  options: RequestOptions = {}
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/assignments/${encodeURIComponent(assignmentId)}/archive`, 'POST', undefined, options);
}

export async function fetchAssignmentRecipients(
  assignmentId: string,
  signal?: AbortSignal
): Promise<RecipientProgress[]> {
  return apiRequest<RecipientProgress[]>(`/assignments/${encodeURIComponent(assignmentId)}/recipients`, 'GET', undefined, { signal });
}

export async function fetchSubmissions(
  recipientId: string,
  signal?: AbortSignal
): Promise<Submission[]> {
  return apiRequest<Submission[]>(`/assignment-recipients/${encodeURIComponent(recipientId)}/submissions`, 'GET', undefined, { signal });
}

export async function fetchSubmission(
  submissionId: string,
  signal?: AbortSignal
): Promise<Submission> {
  return apiRequest<Submission>(`/submissions/${encodeURIComponent(submissionId)}`, 'GET', undefined, { signal });
}

export async function submitWork(
  recipientId: string,
  input: SubmissionInput,
  options: RequestOptions & { idempotencyKey: string }
): Promise<Submission> {
  return apiRequest<Submission>(`/assignment-recipients/${encodeURIComponent(recipientId)}/submissions`, 'POST', input, options);
}

export async function addFeedback(
  submissionId: string,
  text: string,
  options: RequestOptions = {}
): Promise<Submission> {
  return apiRequest<Submission>(`/submissions/${encodeURIComponent(submissionId)}/feedback`, 'POST', { text }, options);
}

export async function updateProgressText(
  recipientId: string,
  text: string,
  options: RequestOptions = {}
): Promise<RecipientProgress> {
  return apiRequest<RecipientProgress>(`/assignment-recipients/${encodeURIComponent(recipientId)}/updates`, 'POST', { text }, options);
}
