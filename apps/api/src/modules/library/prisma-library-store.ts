import type { PrismaClient } from '@prisma/client';
import type {
  FolderRecord,
  ItemRecord,
  LibraryStore,
  RevisionRecord,
  TrashRecord,
  WorkspaceRecord,
} from './library-service';

export class PrismaLibraryStore implements LibraryStore {
  constructor(private readonly prisma: PrismaClient) {}

  public async createItem(item: ItemRecord): Promise<void> {
    await this.prisma.libraryItem.create({
      data: {
        id: item.id,
        workspaceId: item.workspaceId,
        folderId: item.folderId,
        currentRevisionId: item.currentRevisionId,
        type: item.type,
        title: item.title,
        pinned: item.pinned ?? false,
        status: item.status,
        version: item.version,
      },
    });
  }

  public async findItem(itemId: string): Promise<ItemRecord | null> {
    const row = await this.prisma.libraryItem.findUnique({
      where: { id: itemId },
    });
    if (!row) return null;
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      folderId: row.folderId,
      currentRevisionId: row.currentRevisionId,
      type: row.type,
      title: row.title,
      pinned: row.pinned,
      status: row.status,
      version: row.version,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  public async updateItem(itemId: string, patch: Partial<ItemRecord>): Promise<void> {
    await this.prisma.libraryItem.update({
      where: { id: itemId },
      data: {
        ...(patch.folderId !== undefined ? { folderId: patch.folderId } : {}),
        ...(patch.currentRevisionId !== undefined ? { currentRevisionId: patch.currentRevisionId } : {}),
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.pinned !== undefined ? { pinned: patch.pinned } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.version !== undefined ? { version: patch.version } : {}),
      },
    });
  }

  public async listItems(
    workspaceId: string,
    filter?: { folderId?: string | null; status?: string },
  ): Promise<ItemRecord[]> {
    const rows = await this.prisma.libraryItem.findMany({
      where: {
        workspaceId,
        ...(filter?.status ? { status: filter.status } : { status: 'active' }),
        ...(filter?.folderId !== undefined ? { folderId: filter.folderId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r: { id: string; workspaceId: string; folderId: string | null; currentRevisionId: string | null; type: string; title: string | null; pinned: boolean; status: string; version: number; createdAt: Date; updatedAt: Date }) => ({
      id: r.id,
      workspaceId: r.workspaceId,
      folderId: r.folderId,
      currentRevisionId: r.currentRevisionId,
      type: r.type,
      title: r.title,
      pinned: r.pinned,
      status: r.status,
      version: r.version,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  public async createRevision(rev: RevisionRecord): Promise<void> {
    await this.prisma.contentRevision.create({
      data: {
        id: rev.id,
        itemId: rev.itemId,
        blobId: rev.blobId,
        text: rev.text,
        url: rev.url,
        actorId: rev.actorId,
        at: rev.at,
      },
    });
  }

  public async findRevision(revisionId: string): Promise<RevisionRecord | null> {
    const row = await this.prisma.contentRevision.findUnique({
      where: { id: revisionId },
    });
    if (!row) return null;
    return {
      id: row.id,
      itemId: row.itemId,
      blobId: row.blobId,
      text: row.text,
      url: row.url,
      actorId: row.actorId,
      at: row.at,
    };
  }

  public async listRevisions(itemId: string): Promise<RevisionRecord[]> {
    const rows = await this.prisma.contentRevision.findMany({
      where: { itemId },
      orderBy: { at: 'desc' },
    });
    return rows.map((r: { id: string; itemId: string | null; blobId: string | null; text: string | null; url: string | null; actorId: string; at: Date }) => ({
      id: r.id,
      itemId: r.itemId,
      blobId: r.blobId,
      text: r.text,
      url: r.url,
      actorId: r.actorId,
      at: r.at,
    }));
  }

  public async createFolder(folder: FolderRecord): Promise<void> {
    await this.prisma.folder.create({
      data: {
        id: folder.id,
        workspaceId: folder.workspaceId,
        parentId: folder.parentId,
        name: folder.name,
        version: folder.version,
      },
    });
  }

  public async findFolder(folderId: string): Promise<FolderRecord | null> {
    const row = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });
    if (!row) return null;
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      parentId: row.parentId,
      name: row.name,
      version: row.version,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  public async updateFolder(folderId: string, patch: Partial<FolderRecord>): Promise<void> {
    await this.prisma.folder.update({
      where: { id: folderId },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.parentId !== undefined ? { parentId: patch.parentId } : {}),
        ...(patch.version !== undefined ? { version: patch.version } : {}),
      },
    });
  }

  public async deleteFolder(folderId: string): Promise<void> {
    await this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  public async listFolders(workspaceId: string): Promise<FolderRecord[]> {
    const rows = await this.prisma.folder.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r: { id: string; workspaceId: string; parentId: string | null; name: string; version: number; createdAt: Date; updatedAt: Date }) => ({
      id: r.id,
      workspaceId: r.workspaceId,
      parentId: r.parentId,
      name: r.name,
      version: r.version,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  public async countFolderItems(folderId: string): Promise<number> {
    return this.prisma.libraryItem.count({
      where: { folderId },
    });
  }

  public async countChildFolders(folderId: string): Promise<number> {
    return this.prisma.folder.count({
      where: { parentId: folderId },
    });
  }

  public async createTrashEntry(trash: TrashRecord): Promise<void> {
    await this.prisma.trashEntry.upsert({
      where: { itemId: trash.itemId },
      create: {
        itemId: trash.itemId,
        deletedAt: trash.deletedAt,
        purgeAfter: trash.purgeAfter,
      },
      update: {
        deletedAt: trash.deletedAt,
        purgeAfter: trash.purgeAfter,
      },
    });
  }

  public async findTrashEntry(itemId: string): Promise<TrashRecord | null> {
    const row = await this.prisma.trashEntry.findUnique({
      where: { itemId },
    });
    if (!row) return null;
    return {
      itemId: row.itemId,
      deletedAt: row.deletedAt,
      purgeAfter: row.purgeAfter,
    };
  }

  public async deleteTrashEntry(itemId: string): Promise<void> {
    await this.prisma.trashEntry.deleteMany({
      where: { itemId },
    });
  }

  public async findPersonalDefaultWorkspace(actorId: string): Promise<WorkspaceRecord | null> {
    const row = await this.prisma.workspace.findFirst({
      where: { ownerId: actorId, kind: 'personal' },
    });
    if (!row) return null;
    return {
      id: row.id,
      ownerId: row.ownerId,
      kind: row.kind,
      name: row.name,
    };
  }
}
