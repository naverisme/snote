import { DomainError } from '../../core/authorization';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB (LIB-11)
export const WORKSPACE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB (LIB-11)
export const QUOTA_WARNING_RATIO = 0.8; // 80% warning threshold (LIB-11)

export interface QuotaStatus {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  warning: boolean;
  itemCount: number;
}

export interface QuotaStore {
  getActiveWorkspaceBlobs(workspaceId: string): Promise<Map<string, bigint>>;
  getPendingReservationsBytes(scopeType: string, scopeId: string): Promise<bigint>;
  createReservation(scopeType: string, scopeId: string, operationKey: string, bytes: bigint, ttlMs: number): Promise<void>;
  releaseReservation(scopeType: string, scopeId: string, operationKey: string): Promise<void>;
  addReference(scopeType: string, scopeId: string, blobId: string, reason: string): Promise<void>;
  removeReference(scopeType: string, scopeId: string, blobId: string, reason: string): Promise<void>;
  getBlobSize(blobId: string): Promise<bigint | null>;
}

export class QuotaService {
  constructor(private readonly store: QuotaStore, private readonly maxQuotaBytes: number = WORKSPACE_QUOTA_BYTES) {}

  public async getWorkspaceQuota(workspaceId: string): Promise<QuotaStatus> {
    const activeBlobs = await this.store.getActiveWorkspaceBlobs(workspaceId);
    let usedBytes = 0;
    for (const size of activeBlobs.values()) {
      usedBytes += Number(size);
    }

    const pendingBytes = Number(await this.store.getPendingReservationsBytes('workspace', workspaceId));
    const totalUsed = usedBytes + pendingBytes;
    const remaining = Math.max(0, this.maxQuotaBytes - totalUsed);
    const warning = totalUsed >= this.maxQuotaBytes * QUOTA_WARNING_RATIO;

    return {
      usedBytes: totalUsed,
      totalBytes: this.maxQuotaBytes,
      remainingBytes: remaining,
      warning,
      itemCount: activeBlobs.size,
    };
  }

  public async checkAndReserve(scopeType: string, scopeId: string, operationKey: string, sizeBytes: number, ttlMs: number = 30 * 60 * 1000): Promise<void> {
    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new DomainError('FILE_TOO_LARGE', 400);
    }

    if (scopeType === 'workspace') {
      const quota = await this.getWorkspaceQuota(scopeId);
      if (quota.usedBytes + sizeBytes > this.maxQuotaBytes) {
        throw new DomainError('QUOTA_EXCEEDED', 400);
      }
    }

    await this.store.createReservation(scopeType, scopeId, operationKey, BigInt(sizeBytes), ttlMs);
  }

  public async releaseReservation(scopeType: string, scopeId: string, operationKey: string): Promise<void> {
    await this.store.releaseReservation(scopeType, scopeId, operationKey);
  }

  public async commitBlob(workspaceId: string, blobId: string, operationKey?: string): Promise<void> {
    await this.store.addReference('workspace', workspaceId, blobId, 'library_item');
    if (operationKey) {
      await this.store.releaseReservation('workspace', workspaceId, operationKey);
    }
  }

  /**
   * QA-06: Check whether restoring an item from trash will exceed workspace quota.
   * If adding the item's blob would push workspace logical quota over 1 GB, reject!
   */
  public async checkRestore(workspaceId: string, blobId: string): Promise<void> {
    const activeBlobs = await this.store.getActiveWorkspaceBlobs(workspaceId);
    // If the blob is already active in this workspace (e.g. referenced by another item or submission),
    // deduplication rule LIB-16 means 0 additional bytes!
    if (activeBlobs.has(blobId)) {
      return;
    }

    const blobSize = await this.store.getBlobSize(blobId);
    if (!blobSize) return;

    let usedBytes = 0;
    for (const size of activeBlobs.values()) {
      usedBytes += Number(size);
    }
    const pendingBytes = Number(await this.store.getPendingReservationsBytes('workspace', workspaceId));

    if (usedBytes + pendingBytes + Number(blobSize) > this.maxQuotaBytes) {
      throw new DomainError('QUOTA_EXCEEDED', 400);
    }
  }
}
