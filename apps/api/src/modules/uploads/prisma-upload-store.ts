import type { PrismaClient } from '@prisma/client';
import type { UploadStagingRecord, UploadStore } from './upload-service';

export class PrismaUploadStore implements UploadStore {
  constructor(private readonly prisma: PrismaClient) {}

  public async createStaging(record: UploadStagingRecord): Promise<void> {
    await this.prisma.uploadStaging.create({
      data: {
        id: record.id,
        actorId: record.actorId,
        scopeType: record.scopeType,
        scopeId: record.scopeId,
        storageKey: record.storageKey,
        status: record.status,
        expiresAt: record.expiresAt,
      },
    });
  }

  public async findStaging(uploadId: string): Promise<UploadStagingRecord | null> {
    const row = await this.prisma.uploadStaging.findUnique({
      where: { id: uploadId },
    });
    if (!row) return null;
    return {
      id: row.id,
      actorId: row.actorId,
      scopeType: row.scopeType,
      scopeId: row.scopeId,
      storageKey: row.storageKey,
      status: row.status,
      expiresAt: row.expiresAt,
    };
  }

  public async updateStagingStatus(uploadId: string, status: string, storageKey?: string): Promise<void> {
    await this.prisma.uploadStaging.update({
      where: { id: uploadId },
      data: {
        status,
        ...(storageKey ? { storageKey } : {}),
      },
    });
  }

  public async saveVerifiedBlob(blob: {
    id: string;
    hash: string;
    size: bigint;
    mediaType: string;
    storageKey: string;
  }): Promise<{ id: string }> {
    const existing = await this.prisma.blob.findUnique({
      where: { storageKey: blob.storageKey },
    });
    if (existing) {
      return { id: existing.id };
    }

    const created = await this.prisma.blob.create({
      data: {
        id: blob.id,
        hash: blob.hash,
        size: blob.size,
        mediaType: blob.mediaType,
        storageKey: blob.storageKey,
        status: 'verified',
      },
    });
    return { id: created.id };
  }
}
