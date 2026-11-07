import type { PrismaClient } from '@prisma/client';
import type { QuotaStore } from './quota-service';

export class PrismaQuotaStore implements QuotaStore {
  constructor(private readonly prisma: PrismaClient) {}

  public async getActiveWorkspaceBlobs(workspaceId: string): Promise<Map<string, bigint>> {
    // 1. Find all active library items in workspace
    const items = await this.prisma.libraryItem.findMany({
      where: {
        workspaceId,
        status: 'active',
        currentRevisionId: { not: null },
      },
      select: { currentRevisionId: true },
    });

    const revisionIds = items
      .map((it: { currentRevisionId: string | null }) => it.currentRevisionId)
      .filter((id: string | null): id is string => id !== null);

    const blobMap = new Map<string, bigint>();
    if (revisionIds.length > 0) {
      const revisions = await this.prisma.contentRevision.findMany({
        where: { id: { in: revisionIds }, blobId: { not: null } },
        select: { blobId: true },
      });

      const blobIds = Array.from(
        new Set(revisions.map((r: { blobId: string | null }) => r.blobId).filter((b: string | null): b is string => b !== null)),
      );

      if (blobIds.length > 0) {
        const blobs = await this.prisma.blob.findMany({
          where: { id: { in: blobIds } },
          select: { id: true, size: true },
        });

        for (const blob of blobs) {
          blobMap.set(blob.id, blob.size);
        }
      }
    }

    // 2. Also check QuotaReference for submissions / snapshots in this workspace (LIB-16)
    const references = await this.prisma.quotaReference.findMany({
      where: { scopeType: 'workspace', scopeId: workspaceId },
      select: { blobId: true },
    });

    const refBlobIds = references
      .map((r: { blobId: string }) => r.blobId)
      .filter((id: string) => !blobMap.has(id));

    if (refBlobIds.length > 0) {
      const extraBlobs = await this.prisma.blob.findMany({
        where: { id: { in: refBlobIds } },
        select: { id: true, size: true },
      });
      for (const blob of extraBlobs) {
        blobMap.set(blob.id, blob.size);
      }
    }

    return blobMap;
  }

  public async getPendingReservationsBytes(scopeType: string, scopeId: string): Promise<bigint> {
    const now = new Date();
    const reservations = await this.prisma.quotaReservation.findMany({
      where: {
        scopeType,
        scopeId,
        expiresAt: { gt: now },
      },
      select: { bytes: true },
    });

    return reservations.reduce((acc: bigint, curr: { bytes: bigint }) => acc + curr.bytes, 0n);
  }

  public async createReservation(
    scopeType: string,
    scopeId: string,
    operationKey: string,
    bytes: bigint,
    ttlMs: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlMs);
    await this.prisma.quotaReservation.upsert({
      where: {
        scopeType_scopeId_operationKey: { scopeType, scopeId, operationKey },
      },
      create: {
        scopeType,
        scopeId,
        operationKey,
        bytes,
        expiresAt,
      },
      update: {
        bytes,
        expiresAt,
      },
    });
  }

  public async releaseReservation(
    scopeType: string,
    scopeId: string,
    operationKey: string,
  ): Promise<void> {
    await this.prisma.quotaReservation
      .deleteMany({
        where: { scopeType, scopeId, operationKey },
      })
      .catch(() => {});
  }

  public async addReference(
    scopeType: string,
    scopeId: string,
    blobId: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.quotaReference.upsert({
      where: {
        scopeType_scopeId_blobId_reason: {
          scopeType,
          scopeId,
          blobId,
          reason,
        },
      },
      create: {
        scopeType,
        scopeId,
        blobId,
        reason,
      },
      update: {},
    });
  }

  public async removeReference(
    scopeType: string,
    scopeId: string,
    blobId: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.quotaReference
      .deleteMany({
        where: { scopeType, scopeId, blobId, reason },
      })
      .catch(() => {});
  }

  public async getBlobSize(blobId: string): Promise<bigint | null> {
    const blob = await this.prisma.blob.findUnique({
      where: { id: blobId },
      select: { size: true },
    });
    return blob?.size ?? null;
  }
}
