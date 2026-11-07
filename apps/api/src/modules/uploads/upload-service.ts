import { randomUUID } from 'node:crypto';
import type { components } from '@snote/contracts';
import { DomainError, type AuthorizationPort, type Principal } from '../../core/authorization';
import type { StoragePort, VerifiedBlob } from '../../core/storage';
import type { QuotaService } from '../library/quota-service';

export type UploadStart = components['schemas']['UploadStart'];
export type Upload = components['schemas']['Upload'];

export interface UploadStagingRecord {
  id: string;
  actorId: string;
  scopeType: string;
  scopeId: string;
  storageKey: string;
  status: string; // 'staged' | 'verified' | 'committed' | 'aborted'
  size?: number;
  declaredType?: string;
  expiresAt: Date;
}

export interface UploadStore {
  createStaging(record: UploadStagingRecord): Promise<void>;
  findStaging(uploadId: string): Promise<UploadStagingRecord | null>;
  updateStagingStatus(uploadId: string, status: string, storageKey?: string): Promise<void>;
  saveVerifiedBlob(blob: {
    id: string;
    hash: string;
    size: bigint;
    mediaType: string;
    storageKey: string;
  }): Promise<{ id: string }>;
}

export class UploadService {
  constructor(
    private readonly storage: StoragePort,
    private readonly store: UploadStore,
    private readonly quota: QuotaService,
    private readonly auth?: AuthorizationPort,
  ) {}

  public async start(principal: Principal, body: UploadStart): Promise<Upload> {
    if (this.auth) {
      const decision = await this.auth.decide(principal, 'library.create', {
        type: body.scopeType as 'workspace' | 'class',
        id: body.scopeId,
      });
      if (!decision.allowed) {
        throw new DomainError('FORBIDDEN', 403);
      }
    }

    const uploadId = randomUUID();
    const opKey = `upload:${uploadId}`;

    // Quota check & reservation (QA-06, LIB-11, LIB-16)
    await this.quota.checkAndReserve(body.scopeType, body.scopeId, opKey, body.size);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes TTL
    await this.store.createStaging({
      id: uploadId,
      actorId: principal.accountId,
      scopeType: body.scopeType,
      scopeId: body.scopeId,
      storageKey: uploadId,
      status: 'staged',
      size: body.size,
      declaredType: body.declaredType,
      expiresAt,
    });

    return {
      id: uploadId,
      scopeId: body.scopeId,
      status: 'staged',
      size: body.size,
    };
  }

  public async putContent(
    principal: Principal,
    uploadId: string,
    bytes: AsyncIterable<Uint8Array>,
  ): Promise<Upload> {
    const staging = await this.store.findStaging(uploadId);
    if (!staging) {
      throw new DomainError('UPLOAD_NOT_FOUND', 404);
    }

    if (staging.status !== 'staged') {
      throw new DomainError('INVALID_UPLOAD_STATE', 409);
    }

    if (staging.expiresAt <= new Date()) {
      await this.abort(uploadId);
      throw new DomainError('UPLOAD_EXPIRED', 410);
    }

    let verified: VerifiedBlob;
    try {
      await this.storage.stage(uploadId, bytes);
      verified = await this.storage.verify(uploadId);
    } catch (err) {
      await this.abort(uploadId);
      throw err;
    }

    const blobRecord = await this.store.saveVerifiedBlob({
      id: randomUUID(),
      hash: verified.digest,
      size: BigInt(verified.size),
      mediaType: verified.mediaType,
      storageKey: verified.id,
    });

    await this.store.updateStagingStatus(uploadId, 'verified', blobRecord.id);

    return {
      id: uploadId,
      scopeId: staging.scopeId,
      status: 'verified',
      size: verified.size,
    };
  }

  public async abort(uploadId: string): Promise<void> {
    const staging = await this.store.findStaging(uploadId);
    if (staging) {
      await this.store.updateStagingStatus(uploadId, 'aborted');
      await this.quota.releaseReservation(staging.scopeType, staging.scopeId, `upload:${uploadId}`);
      await this.storage.markForDeletion(uploadId).catch(() => {});
    }
  }
}
