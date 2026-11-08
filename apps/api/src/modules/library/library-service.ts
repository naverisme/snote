import { randomUUID } from 'node:crypto';
import type { components } from '@snote/contracts';
import { DomainError, type AuthorizationPort, type Principal } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import type { QuotaService } from './quota-service';
import { extractFirstUrl, fetchUrlPreview, normalizeUrl, type UrlPreview } from './url-preview';
import type { UploadStore } from '../uploads/upload-service';

export type LibraryItemInput = components['schemas']['LibraryItem'];
export type Library = components['schemas']['Library'];
export type CopyInput = components['schemas']['Copy'];
export type FolderInput = components['schemas']['FolderInput'];
export type Folder = components['schemas']['Folder'];
export type Download = components['schemas']['Download'];

export interface ItemRecord {
  id: string;
  workspaceId: string;
  folderId: string | null;
  currentRevisionId: string | null;
  type: string;
  title?: string | null;
  status: string; // 'active' | 'trash'
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevisionRecord {
  id: string;
  itemId: string | null;
  blobId: string | null;
  text: string | null;
  url: string | null;
  actorId: string;
  at: Date;
}

export interface FolderRecord {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrashRecord {
  itemId: string;
  deletedAt: Date;
  purgeAfter: Date;
}

export interface WorkspaceRecord {
  id: string;
  ownerId: string | null;
  kind: string; // 'personal' | 'group'
  name: string;
}

export interface LibraryStore {
  createItem(item: ItemRecord): Promise<void>;
  findItem(itemId: string): Promise<ItemRecord | null>;
  updateItem(itemId: string, patch: Partial<ItemRecord>): Promise<void>;
  listItems(workspaceId: string, filter?: { folderId?: string | null; status?: string }): Promise<ItemRecord[]>;
  createRevision(rev: RevisionRecord): Promise<void>;
  findRevision(revisionId: string): Promise<RevisionRecord | null>;
  listRevisions(itemId: string): Promise<RevisionRecord[]>;
  createFolder(folder: FolderRecord): Promise<void>;
  findFolder(folderId: string): Promise<FolderRecord | null>;
  updateFolder(folderId: string, patch: Partial<FolderRecord>): Promise<void>;
  deleteFolder(folderId: string): Promise<void>;
  listFolders(workspaceId: string): Promise<FolderRecord[]>;
  countFolderItems(folderId: string): Promise<number>;
  countChildFolders(folderId: string): Promise<number>;
  createTrashEntry(trash: TrashRecord): Promise<void>;
  findTrashEntry(itemId: string): Promise<TrashRecord | null>;
  deleteTrashEntry(itemId: string): Promise<void>;
  findPersonalDefaultWorkspace(actorId: string): Promise<WorkspaceRecord | null>;
}

export class LibraryService {
  constructor(
    private readonly store: LibraryStore,
    private readonly quota: QuotaService,
    private readonly uploadStore: UploadStore,
    private readonly auth?: AuthorizationPort,
  ) {}

  private async requireAuth(
    principal: Principal,
    action: string,
    scope: { type: 'class' | 'workspace' | 'assignment'; id: string },
  ): Promise<void> {
    if (!this.auth) {
      throw new DomainError('FORBIDDEN', 403);
    }
    const decision = await this.auth.decide(principal, action, scope);
    if (!decision.allowed) {
      throw new DomainError('FORBIDDEN', 403);
    }
  }

  public async createItem(
    principal: Principal,
    workspaceId: string,
    input: LibraryItemInput,
  ): Promise<Library> {
    await this.requireAuth(principal, 'library.create', {
      type: 'workspace',
      id: workspaceId,
    });

    if (input.folderId) {
      const folder = await this.store.findFolder(input.folderId);
      if (!folder || folder.workspaceId !== workspaceId) {
        throw new DomainError('INVALID_FOLDER', 400);
      }
    }

    const itemId = randomUUID();
    const revisionId = randomUUID();
    let blobId: string | null = null;
    let textContent: string | null = null;
    let urlContent: string | null = null;

    if (input.type === 'file') {
      if (!input.uploadId) throw new DomainError('MISSING_UPLOAD_ID', 400);
      const staging = await this.uploadStore.findStaging(input.uploadId);
      if (!staging || staging.status !== 'verified' || staging.actorId !== principal.accountId ||
          staging.scopeType !== 'workspace' || staging.scopeId !== workspaceId) {
        throw new DomainError('UPLOAD_NOT_VERIFIED', 400);
      }

      blobId = staging.storageKey;
      await this.uploadStore.updateStagingStatus(input.uploadId, 'committed');
      await this.quota.commitBlob(workspaceId, blobId, `upload:${input.uploadId}`);
    } else if (input.type === 'link') {
      if (!input.url) throw new DomainError('MISSING_URL', 400);
      urlContent = normalizeUrl(input.url);
    } else if (input.type === 'text') {
      textContent = input.content ?? '';
    }

    const now = new Date();
    await this.store.createRevision({
      id: revisionId,
      itemId,
      blobId,
      text: textContent,
      url: urlContent,
      actorId: principal.accountId,
      at: now,
    });

    const itemRecord: ItemRecord = {
      id: itemId,
      workspaceId,
      folderId: input.folderId ?? null,
      currentRevisionId: revisionId,
      type: input.type,
      title: input.title ?? null,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await this.store.createItem(itemRecord);

    return {
      id: itemId,
      workspaceId,
      type: input.type as 'text' | 'link' | 'file',
      title: input.title ?? undefined,
      currentRevisionId: revisionId,
      status: 'active',
      version: 1,
    };
  }

  public async createInboxItem(principal: Principal, input: LibraryItemInput): Promise<Library> {
    const personalWorkspace = await this.store.findPersonalDefaultWorkspace(principal.accountId);
    if (!personalWorkspace) {
      throw new DomainError('DEFAULT_WORKSPACE_NOT_FOUND', 404);
    }

    // Force folderId to null for personal inbox (LIB-02, LIB-05)
    return this.createItem(principal, personalWorkspace.id, {
      ...input,
      folderId: undefined,
    });
  }

  public async getItem(
    principal: Principal,
    itemId: string,
  ): Promise<{ item: Library; revision: RevisionRecord | null; preview?: UrlPreview }> {
    const item = await this.store.findItem(itemId);
    if (!item) throw new DomainError('ITEM_NOT_FOUND', 404);

    const readAction =
      item.type === 'text'
        ? 'library.read_text'
        : item.type === 'link'
          ? 'library.read_link'
          : 'library.read_file';
    await this.requireAuth(principal, readAction, {
      type: 'workspace',
      id: item.workspaceId,
    });

    let revision: RevisionRecord | null = null;
    let preview: UrlPreview | undefined;
    if (item.currentRevisionId) {
      revision = await this.store.findRevision(item.currentRevisionId);
      if (revision?.text) {
        const firstUrl = extractFirstUrl(revision.text);
        if (firstUrl) {
          preview = await fetchUrlPreview(firstUrl);
        }
      } else if (revision?.url) {
        preview = await fetchUrlPreview(revision.url);
      }
    }

    return {
      item: {
        id: item.id,
        workspaceId: item.workspaceId,
        type: item.type as 'text' | 'link' | 'file',
        title: item.title ?? undefined,
        currentRevisionId: item.currentRevisionId ?? undefined,
        status: item.status as 'active' | 'trash',
        version: item.version,
      },
      revision,
      preview,
    };
  }

  public async listItems(
    principal: Principal,
    workspaceId: string,
    filter?: { folderId?: string | null; status?: string },
  ): Promise<Library[]> {
    const items = await this.store.listItems(workspaceId, filter);
    const visible: ItemRecord[] = [];
    for (const item of items) {
      const action = item.type === 'text' ? 'library.read_text'
        : item.type === 'link' ? 'library.read_link'
          : item.type === 'file' ? 'library.read_file' : null;
      if (!action || !this.auth) continue;
      if ((await this.auth.decide(principal, action, { type: 'workspace', id: workspaceId })).allowed) {
        visible.push(item);
      }
    }
    return visible.map((it) => ({
      id: it.id,
      workspaceId: it.workspaceId,
      type: it.type as 'text' | 'link' | 'file',
      title: it.title ?? undefined,
      currentRevisionId: it.currentRevisionId ?? undefined,
      status: it.status as 'active' | 'trash',
      version: it.version,
    }));
  }

  public async updateItem(
    principal: Principal,
    itemId: string,
    ifMatch: string | undefined,
    input: Partial<LibraryItemInput>,
  ): Promise<Library> {
    const item = await this.store.findItem(itemId);
    if (!item) throw new DomainError('ITEM_NOT_FOUND', 404);

    requireVersion(item.version, ifMatch);

    const editAction =
      item.type === 'text'
        ? 'library.edit_text'
        : item.type === 'link'
          ? 'library.edit_link'
          : 'library.edit_file';
    await this.requireAuth(principal, editAction, {
      type: 'workspace',
      id: item.workspaceId,
    });

    // Moving between folders: must stay within the same workspace (LIB-06)
    if (input.folderId !== undefined) {
      if (input.folderId !== null) {
        const folder = await this.store.findFolder(input.folderId);
        if (!folder || folder.workspaceId !== item.workspaceId) {
          throw new DomainError('CROSS_WORKSPACE_MOVE_NOT_ALLOWED', 400);
        }
      }
    }

    const nextVersion = item.version + 1;
    await this.store.updateItem(itemId, {
      title: input.title !== undefined ? input.title : item.title,
      folderId: input.folderId !== undefined ? input.folderId : item.folderId,
      version: nextVersion,
      updatedAt: new Date(),
    });

    return {
      id: item.id,
      workspaceId: item.workspaceId,
      type: item.type as 'text' | 'link' | 'file',
      title: (input.title !== undefined ? input.title : item.title) ?? undefined,
      currentRevisionId: item.currentRevisionId ?? undefined,
      status: item.status as 'active' | 'trash',
      version: nextVersion,
    };
  }

  public async createRevision(
    principal: Principal,
    itemId: string,
    ifMatch: string | undefined,
    input: LibraryItemInput,
  ): Promise<Library> {
    const item = await this.store.findItem(itemId);
    if (!item) throw new DomainError('ITEM_NOT_FOUND', 404);

    // Optimistic concurrency check (QA-05)
    requireVersion(item.version, ifMatch);

    const editAction =
      item.type === 'text'
        ? 'library.edit_text'
        : item.type === 'link'
          ? 'library.edit_link'
          : 'library.edit_file';
    await this.requireAuth(principal, editAction, {
      type: 'workspace',
      id: item.workspaceId,
    });

    const revisionId = randomUUID();
    let blobId: string | null = null;
    let textContent: string | null = null;
    let urlContent: string | null = null;

    if (item.type === 'file') {
      if (!input.uploadId) throw new DomainError('MISSING_UPLOAD_ID', 400);
      const staging = await this.uploadStore.findStaging(input.uploadId);
      if (!staging || staging.status !== 'verified' || staging.actorId !== principal.accountId ||
          staging.scopeType !== 'workspace' || staging.scopeId !== item.workspaceId) {
        throw new DomainError('UPLOAD_NOT_VERIFIED', 400);
      }
      blobId = staging.storageKey;
      await this.uploadStore.updateStagingStatus(input.uploadId, 'committed');
      await this.quota.commitBlob(item.workspaceId, blobId, `upload:${input.uploadId}`);
    } else if (item.type === 'link') {
      if (!input.url) throw new DomainError('MISSING_URL', 400);
      urlContent = normalizeUrl(input.url);
    } else if (item.type === 'text') {
      textContent = input.content ?? '';
    }

    const now = new Date();
    await this.store.createRevision({
      id: revisionId,
      itemId,
      blobId,
      text: textContent,
      url: urlContent,
      actorId: principal.accountId,
      at: now,
    });

    const nextVersion = item.version + 1;
    await this.store.updateItem(itemId, {
      currentRevisionId: revisionId,
      title: input.title !== undefined ? input.title : item.title,
      version: nextVersion,
      updatedAt: now,
    });

    return {
      id: item.id,
      workspaceId: item.workspaceId,
      type: item.type as 'text' | 'link' | 'file',
      title: (input.title !== undefined ? input.title : item.title) ?? undefined,
      currentRevisionId: revisionId,
      status: item.status as 'active' | 'trash',
      version: nextVersion,
    };
  }

  public async copyItem(principal: Principal, itemId: string, copy: CopyInput): Promise<Library> {
    const sourceItem = await this.store.findItem(itemId);
    if (!sourceItem) throw new DomainError('ITEM_NOT_FOUND', 404);

    const readAction = sourceItem.type === 'text' ? 'library.read_text'
      : sourceItem.type === 'link' ? 'library.read_link' : 'library.read_file';
    await this.requireAuth(principal, readAction, { type: 'workspace', id: sourceItem.workspaceId });

    await this.requireAuth(principal, 'library.create', {
      type: 'workspace',
      id: copy.targetWorkspaceId,
    });

    const revisionToCopyId = copy.sourceRevisionId ?? sourceItem.currentRevisionId;
    if (!revisionToCopyId) throw new DomainError('REVISION_NOT_FOUND', 404);

    const sourceRevision = await this.store.findRevision(revisionToCopyId);
    if (!sourceRevision || sourceRevision.itemId !== sourceItem.id) throw new DomainError('REVISION_NOT_FOUND', 404);

    if (copy.folderId) {
      const folder = await this.store.findFolder(copy.folderId);
      if (!folder || folder.workspaceId !== copy.targetWorkspaceId) throw new DomainError('INVALID_FOLDER', 400);
    }

    // If copying file to target workspace, track quota in target workspace (LIB-16)
    if (sourceItem.type === 'file' && sourceRevision.blobId) {
      await this.quota.checkRestore(copy.targetWorkspaceId, sourceRevision.blobId);
      await this.quota.commitBlob(copy.targetWorkspaceId, sourceRevision.blobId);
    }

    const newItemId = randomUUID();
    const newRevisionId = randomUUID();
    const now = new Date();

    await this.store.createRevision({
      id: newRevisionId,
      itemId: newItemId,
      blobId: sourceRevision.blobId,
      text: sourceRevision.text,
      url: sourceRevision.url,
      actorId: principal.accountId,
      at: now,
    });

    const newItem: ItemRecord = {
      id: newItemId,
      workspaceId: copy.targetWorkspaceId,
      folderId: copy.folderId ?? null,
      currentRevisionId: newRevisionId,
      type: sourceItem.type,
      title: sourceItem.title,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await this.store.createItem(newItem);

    return {
      id: newItemId,
      workspaceId: copy.targetWorkspaceId,
      type: sourceItem.type as 'text' | 'link' | 'file',
      title: sourceItem.title ?? undefined,
      currentRevisionId: newRevisionId,
      status: 'active',
      version: 1,
    };
  }

  public async trash(
    principal: Principal,
    itemId: string,
    ifMatch: string | undefined,
  ): Promise<Library> {
    const item = await this.store.findItem(itemId);
    if (!item) throw new DomainError('ITEM_NOT_FOUND', 404);

    requireVersion(item.version, ifMatch);

    await this.requireAuth(principal, 'library.delete', {
      type: 'workspace',
      id: item.workspaceId,
    });

    const now = new Date();
    const purgeAfter = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days (LIB-14)
    await this.store.createTrashEntry({
      itemId,
      deletedAt: now,
      purgeAfter,
    });

    const nextVersion = item.version + 1;
    await this.store.updateItem(itemId, {
      status: 'trash',
      version: nextVersion,
      updatedAt: now,
    });

    return {
      id: item.id,
      workspaceId: item.workspaceId,
      type: item.type as 'text' | 'link' | 'file',
      title: item.title ?? undefined,
      currentRevisionId: item.currentRevisionId ?? undefined,
      status: 'trash',
      version: nextVersion,
    };
  }

  public async restore(
    principal: Principal,
    itemId: string,
    ifMatch: string | undefined,
  ): Promise<Library> {
    const item = await this.store.findItem(itemId);
    if (!item) throw new DomainError('ITEM_NOT_FOUND', 404);

    requireVersion(item.version, ifMatch);

    await this.requireAuth(principal, 'library.create', {
      type: 'workspace',
      id: item.workspaceId,
    });

    // QA-06: Check whether restoring this item exceeds quota
    if (item.type === 'file' && item.currentRevisionId) {
      const rev = await this.store.findRevision(item.currentRevisionId);
      if (rev?.blobId) {
        await this.quota.checkRestore(item.workspaceId, rev.blobId);
      }
    }

    await this.store.deleteTrashEntry(itemId);

    const nextVersion = item.version + 1;
    await this.store.updateItem(itemId, {
      status: 'active',
      version: nextVersion,
      updatedAt: new Date(),
    });

    return {
      id: item.id,
      workspaceId: item.workspaceId,
      type: item.type as 'text' | 'link' | 'file',
      title: item.title ?? undefined,
      currentRevisionId: item.currentRevisionId ?? undefined,
      status: 'active',
      version: nextVersion,
    };
  }

  public async getDownload(principal: Principal, itemId: string): Promise<Download> {
    const item = await this.store.findItem(itemId);
    if (!item) throw new DomainError('ITEM_NOT_FOUND', 404);

    await this.requireAuth(principal, 'library.read_file', {
      type: 'workspace',
      id: item.workspaceId,
    });

    if (!item.currentRevisionId) throw new DomainError('NO_CONTENT', 404);
    const rev = await this.store.findRevision(item.currentRevisionId);
    if (!rev?.blobId) throw new DomainError('NO_BLOB', 404);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      url: `/api/v2/blobs/${rev.blobId}/content`,
      expiresAt,
    };
  }

  // Folder management
  public async createFolder(
    principal: Principal,
    workspaceId: string,
    input: FolderInput,
  ): Promise<Folder> {
    await this.requireAuth(principal, 'folder.manage', {
      type: 'workspace',
      id: workspaceId,
    });

    if (input.parentId) {
      const parent = await this.store.findFolder(input.parentId);
      if (!parent || parent.workspaceId !== workspaceId) {
        throw new DomainError('INVALID_PARENT_FOLDER', 400);
      }
    }

    const folderId = randomUUID();
    const now = new Date();
    const folderRecord: FolderRecord = {
      id: folderId,
      workspaceId,
      parentId: input.parentId ?? null,
      name: input.name,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await this.store.createFolder(folderRecord);

    return {
      id: folderId,
      workspaceId,
      name: input.name,
      parentId: input.parentId ?? undefined,
      version: 1,
    };
  }

  public async updateFolder(
    principal: Principal,
    folderId: string,
    ifMatch: string | undefined,
    input: FolderInput,
  ): Promise<Folder> {
    const folder = await this.store.findFolder(folderId);
    if (!folder) throw new DomainError('FOLDER_NOT_FOUND', 404);

    requireVersion(folder.version, ifMatch);

    await this.requireAuth(principal, 'folder.manage', {
      type: 'workspace',
      id: folder.workspaceId,
    });

    if (input.parentId === folderId) {
      throw new DomainError('CIRCULAR_PARENT', 400);
    }

    const nextVersion = folder.version + 1;
    await this.store.updateFolder(folderId, {
      name: input.name,
      parentId: input.parentId !== undefined ? input.parentId : folder.parentId,
      version: nextVersion,
      updatedAt: new Date(),
    });

    return {
      id: folder.id,
      workspaceId: folder.workspaceId,
      name: input.name,
      parentId: (input.parentId !== undefined ? input.parentId : folder.parentId) ?? undefined,
      version: nextVersion,
    };
  }

  public async deleteFolder(
    principal: Principal,
    folderId: string,
    ifMatch: string | undefined,
  ): Promise<Folder> {
    const folder = await this.store.findFolder(folderId);
    if (!folder) throw new DomainError('FOLDER_NOT_FOUND', 404);

    requireVersion(folder.version, ifMatch);

    await this.requireAuth(principal, 'folder.manage', {
      type: 'workspace',
      id: folder.workspaceId,
    });

    // STRICT LIB-07 ENFORCEMENT:
    // Only delete folder when it contains NO items and NO child folders!
    const itemCount = await this.store.countFolderItems(folderId);
    if (itemCount > 0) {
      throw new DomainError('FOLDER_NOT_EMPTY', 400);
    }

    const childFolderCount = await this.store.countChildFolders(folderId);
    if (childFolderCount > 0) {
      throw new DomainError('FOLDER_NOT_EMPTY', 400);
    }

    await this.store.deleteFolder(folderId);

    return {
      id: folder.id,
      workspaceId: folder.workspaceId,
      name: folder.name,
      parentId: folder.parentId ?? undefined,
      version: folder.version,
    };
  }

  public async listFolders(principal: Principal, workspaceId: string): Promise<Folder[]> {
    await this.requireAuth(principal, 'library.read_text', {
      type: 'workspace',
      id: workspaceId,
    });

    const folders = await this.store.listFolders(workspaceId);
    return folders.map((f) => ({
      id: f.id,
      workspaceId: f.workspaceId,
      name: f.name,
      parentId: f.parentId ?? undefined,
      version: f.version,
    }));
  }
}
