export interface VerifiedBlob {
  id: string;
  size: number;
  digest: string;
  mediaType: string;
}

/** A storage key never authorizes access; callers must check scope before download. */
export interface StoragePort {
  stage(operationId: string, bytes: AsyncIterable<Uint8Array>): Promise<string>;
  verify(stagedId: string): Promise<VerifiedBlob>;
  open(blobId: string): Promise<AsyncIterable<Uint8Array>>;
  markForDeletion(blobId: string): Promise<void>;
}
