import type {
  Copy,
  Download,
  Folder,
  FolderInput,
  ItemDetail,
  Library,
  LibraryItem,
  QuotaInfo,
  Upload,
  UploadStart,
} from './types';
import { getCsrfToken } from '../../shared/api';

export class LibraryApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly details: unknown = {},
  ) {
    super(`Library API Error [${status}]: ${code}`);
  }
}

export interface RequestOptions {
  csrfToken?: string;
  etag?: string;
  signal?: AbortSignal;
  actorId?: string;
}

async function requestJson<T>(
  path: string,
  method: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<{ data: T; etag?: string; requestId?: string }> {
  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const csrfToken = options.csrfToken ?? getCsrfToken();
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  if (options.etag) headers.set('If-Match', options.etag);
  if (options.actorId) headers.set('x-actor-id', options.actorId);

  const response = await fetch(`/api/v2${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal: options.signal,
  });

  const etagHeader = response.headers.get('ETag') ?? undefined;
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const code = payload?.error?.code ?? `HTTP_${response.status}`;
    const details = payload?.error?.details ?? {};
    throw new LibraryApiError(response.status, code, details);
  }

  return {
    data: (payload?.data !== undefined ? payload.data : payload) as T,
    etag: etagHeader,
    requestId: payload?.requestId,
  };
}

export const libraryApi = {
  // Items
  async listItems(
    workspaceId: string,
    options: { folderId?: string | null; status?: string } = {},
    reqOptions: RequestOptions = {},
  ): Promise<Library[]> {
    const params = new URLSearchParams();
    if (options.folderId !== undefined && options.folderId !== null) params.set('folderId', options.folderId);
    if (options.status) params.set('status', options.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await requestJson<Library[]>(
      `/workspaces/${encodeURIComponent(workspaceId)}/library/items${query}`,
      'GET',
      undefined,
      reqOptions,
    );
    return res.data;
  },

  async getItem(itemId: string, reqOptions: RequestOptions = {}): Promise<{ item: ItemDetail; etag?: string }> {
    const res = await requestJson<ItemDetail>(
      `/library/items/${encodeURIComponent(itemId)}`,
      'GET',
      undefined,
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async createItem(
    workspaceId: string,
    item: LibraryItem,
    reqOptions: RequestOptions = {},
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>(
      `/workspaces/${encodeURIComponent(workspaceId)}/library/items`,
      'POST',
      item,
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async quickSaveToInbox(
    item: LibraryItem,
    reqOptions: RequestOptions = {},
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>('/me/inbox/items', 'POST', item, reqOptions);
    return { item: res.data, etag: res.etag };
  },

  async updateItem(
    itemId: string,
    patch: Partial<LibraryItem>,
    reqOptions: RequestOptions & { etag: string },
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>(
      `/library/items/${encodeURIComponent(itemId)}`,
      'PATCH',
      patch,
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async createRevision(
    itemId: string,
    input: LibraryItem,
    reqOptions: RequestOptions & { etag: string },
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>(
      `/library/items/${encodeURIComponent(itemId)}/revisions`,
      'POST',
      input,
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async copyItem(
    itemId: string,
    copy: Copy,
    reqOptions: RequestOptions = {},
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>(
      `/library/items/${encodeURIComponent(itemId)}/copies`,
      'POST',
      copy,
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async trashItem(
    itemId: string,
    reqOptions: RequestOptions & { etag: string },
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>(
      `/library/items/${encodeURIComponent(itemId)}/trash`,
      'POST',
      {},
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async restoreItem(
    itemId: string,
    reqOptions: RequestOptions & { etag: string },
  ): Promise<{ item: Library; etag?: string }> {
    const res = await requestJson<Library>(
      `/library/items/${encodeURIComponent(itemId)}/restore`,
      'POST',
      {},
      reqOptions,
    );
    return { item: res.data, etag: res.etag };
  },

  async getDownload(itemId: string, reqOptions: RequestOptions = {}): Promise<Download> {
    const res = await requestJson<Download>(
      `/library/items/${encodeURIComponent(itemId)}/download`,
      'GET',
      undefined,
      reqOptions,
    );
    return res.data;
  },

  // Folders
  async listFolders(workspaceId: string, reqOptions: RequestOptions = {}): Promise<Folder[]> {
    const res = await requestJson<Folder[]>(
      `/workspaces/${encodeURIComponent(workspaceId)}/folders`,
      'GET',
      undefined,
      reqOptions,
    );
    return res.data;
  },

  async createFolder(
    workspaceId: string,
    input: FolderInput,
    reqOptions: RequestOptions = {},
  ): Promise<{ folder: Folder; etag?: string }> {
    const res = await requestJson<Folder>(
      `/workspaces/${encodeURIComponent(workspaceId)}/folders`,
      'POST',
      input,
      reqOptions,
    );
    return { folder: res.data, etag: res.etag };
  },

  async updateFolder(
    folderId: string,
    input: FolderInput,
    reqOptions: RequestOptions & { etag: string },
  ): Promise<{ folder: Folder; etag?: string }> {
    const res = await requestJson<Folder>(
      `/folders/${encodeURIComponent(folderId)}`,
      'PATCH',
      input,
      reqOptions,
    );
    return { folder: res.data, etag: res.etag };
  },

  async deleteFolder(
    folderId: string,
    reqOptions: RequestOptions & { etag: string },
  ): Promise<Folder> {
    const res = await requestJson<Folder>(
      `/folders/${encodeURIComponent(folderId)}`,
      'DELETE',
      undefined,
      reqOptions,
    );
    return res.data;
  },

  // Quota
  async getWorkspaceQuota(workspaceId: string, reqOptions: RequestOptions = {}): Promise<QuotaInfo> {
    const res = await requestJson<QuotaInfo>(
      `/workspaces/${encodeURIComponent(workspaceId)}/quota`,
      'GET',
      undefined,
      reqOptions,
    );
    return res.data;
  },

  // Uploads
  async startUpload(body: UploadStart, reqOptions: RequestOptions = {}): Promise<Upload> {
    const res = await requestJson<Upload>('/uploads', 'POST', body, reqOptions);
    return res.data;
  },

  async uploadContent(
    uploadId: string,
    file: File | Blob | Uint8Array,
    reqOptions: RequestOptions = {},
  ): Promise<Upload> {
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    const csrfToken = reqOptions.csrfToken ?? getCsrfToken();
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
    if (reqOptions.actorId) headers.set('x-actor-id', reqOptions.actorId);

    const bodyInit: any =
      file instanceof Uint8Array ? new Blob([file as any]) : file;

    const res = await fetch(`/api/v2/uploads/${encodeURIComponent(uploadId)}/content`, {
      method: 'PUT',
      headers,
      body: bodyInit,
      credentials: 'include',
      signal: reqOptions.signal,
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = payload?.error?.code ?? `HTTP_${res.status}`;
      throw new LibraryApiError(res.status, code, payload?.error?.details);
    }
    return payload.data as Upload;
  },
};
