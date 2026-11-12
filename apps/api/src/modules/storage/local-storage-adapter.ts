import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, promises as fs } from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { DomainError } from '../../core/authorization';
import type { StoragePort, VerifiedBlob } from '../../core/storage';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB (LIB-11)
export const DEFAULT_WORKSPACE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB (LIB-11)

export interface LocalStorageOptions {
  rootDir?: string;
  maxPhysicalBytes?: number; // Server physical storage budget (QA-06, QA-07)
}

export function detectMediaType(buffer: Buffer, declaredType?: string): string | null {
  if (buffer.length < 4) {
    // Check if plain text
    if (isUtf8Text(buffer)) return 'text/plain';
    return null;
  }

  // 1. PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // 3. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // 4. WebP: RIFF (bytes 0..3) ... WEBP (bytes 8..11)
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  // 5. ZIP or Office OpenXML (DOCX, XLSX, PPTX): PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    if (declaredType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return declaredType;
    }
    if (declaredType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return declaredType;
    }
    if (declaredType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return declaredType;
    }
    return 'application/zip';
  }

  // 6. Plain Text (TXT)
  if (isUtf8Text(buffer)) {
    return 'text/plain';
  }

  return null;
}

function isUtf8Text(buffer: Buffer): boolean {
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    // Reject binary null byte and non-whitespace control characters
    if (byte === 0x00) return false;
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) return false;
  }
  return true;
}

export class LocalStorageAdapter implements StoragePort {
  private readonly rootDir: string;
  private readonly stagingDir: string;
  private readonly blobsDir: string;
  private maxPhysicalBytes?: number;
  private stageTail: Promise<void> = Promise.resolve();

  constructor(options: LocalStorageOptions = {}) {
    this.rootDir = options.rootDir ?? path.resolve(process.cwd(), 'data', 'storage');
    this.stagingDir = path.join(this.rootDir, 'staging');
    this.blobsDir = path.join(this.rootDir, 'blobs');
    this.maxPhysicalBytes = options.maxPhysicalBytes;
  }

  public setMaxPhysicalBytes(bytes?: number): void {
    this.maxPhysicalBytes = bytes;
  }

  public async init(): Promise<void> {
    await fs.mkdir(this.stagingDir, { recursive: true });
    await fs.mkdir(this.blobsDir, { recursive: true });
  }

  public async getPhysicalUsage(): Promise<{ totalBytes: number; fileCount: number }> {
    await this.init();
    let totalBytes = 0;
    let fileCount = 0;

    const dirs = [this.blobsDir, this.stagingDir];
    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const stats = await fs.stat(path.join(dir, file));
          if (stats.isFile()) {
            totalBytes += stats.size;
            fileCount++;
          }
        }
      } catch {
        // ignore missing directory
      }
    }

    return { totalBytes, fileCount };
  }

  public async stage(operationId: string, bytes: AsyncIterable<Uint8Array>): Promise<string> {
    const previousStage = this.stageTail;
    let releaseStage!: () => void;
    this.stageTail = new Promise<void>(resolve => { releaseStage = resolve; });
    await previousStage;
    try {
      return await this.stageUnlocked(operationId, bytes);
    } finally {
      releaseStage();
    }
  }

  private async stageUnlocked(operationId: string, bytes: AsyncIterable<Uint8Array>): Promise<string> {
    await this.init();

    // Check physical storage budget before staging if configured
    if (this.maxPhysicalBytes !== undefined) {
      const { totalBytes } = await this.getPhysicalUsage();
      if (totalBytes >= this.maxPhysicalBytes) {
        throw new DomainError('PHYSICAL_STORAGE_EXHAUSTED', 507);
      }
    }

    const tempFilePath = path.join(this.stagingDir, `${operationId}.tmp`);
    const writeStream = createWriteStream(tempFilePath, { flags: 'w' });

    let bytesWritten = 0;
    try {
      for await (const chunk of bytes) {
        bytesWritten += chunk.byteLength;

        if (bytesWritten > MAX_FILE_SIZE_BYTES) {
          writeStream.destroy();
          await fs.unlink(tempFilePath).catch(() => {});
          throw new DomainError('FILE_TOO_LARGE', 400);
        }

        if (this.maxPhysicalBytes !== undefined) {
          const { totalBytes } = await this.getPhysicalUsage();
          // totalBytes already includes bytes written to this staging file.
          if (totalBytes + chunk.byteLength > this.maxPhysicalBytes) {
            writeStream.destroy();
            await fs.unlink(tempFilePath).catch(() => {});
            throw new DomainError('PHYSICAL_STORAGE_EXHAUSTED', 507);
          }
        }

        if (!writeStream.write(Buffer.from(chunk))) {
          await new Promise<void>((resolve, reject) => {
            writeStream.once('drain', resolve);
            writeStream.once('error', reject);
          });
        }
      }

      await new Promise<void>((resolve, reject) => {
        writeStream.end(resolve);
        writeStream.once('error', reject);
      });

      return operationId;
    } catch (err) {
      writeStream.destroy();
      await fs.unlink(tempFilePath).catch(() => {});
      throw err;
    }
  }

  public async verify(stagedId: string, declaredType?: string): Promise<VerifiedBlob> {
    await this.init();
    const tempFilePath = path.join(this.stagingDir, `${stagedId}.tmp`);

    let fileStat;
    try {
      fileStat = await fs.stat(tempFilePath);
    } catch {
      throw new DomainError('STAGED_FILE_NOT_FOUND', 404);
    }

    if (fileStat.size === 0) {
      await fs.unlink(tempFilePath).catch(() => {});
      throw new DomainError('EMPTY_FILE', 400);
    }

    if (fileStat.size > MAX_FILE_SIZE_BYTES) {
      await fs.unlink(tempFilePath).catch(() => {});
      throw new DomainError('FILE_TOO_LARGE', 400);
    }

    // Read initial slice for media type sniffing
    const headerBuffer = Buffer.alloc(Math.min(fileStat.size, 1024));
    const handle = await fs.open(tempFilePath, 'r');
    try {
      await handle.read(headerBuffer, 0, headerBuffer.length, 0);
    } finally {
      await handle.close();
    }

    const detectedType = detectMediaType(headerBuffer, declaredType);
    if (!detectedType) {
      await fs.unlink(tempFilePath).catch(() => {});
      throw new DomainError('UNSUPPORTED_MEDIA_TYPE', 415);
    }

    // Compute SHA-256 hash of entire file
    const hash = createHash('sha256');
    const readStream = createReadStream(tempFilePath);
    for await (const chunk of readStream) {
      hash.update(chunk);
    }
    const digest = hash.digest('hex');

    // Move from staging to blobs/<digest>
    const destinationPath = path.join(this.blobsDir, digest);
    try {
      await fs.rename(tempFilePath, destinationPath);
    } catch {
      // In case cross-device move or destination exists
      await fs.copyFile(tempFilePath, destinationPath);
      await fs.unlink(tempFilePath).catch(() => {});
    }

    return {
      id: digest,
      size: fileStat.size,
      digest,
      mediaType: detectedType,
    };
  }

  public async open(blobId: string): Promise<AsyncIterable<Uint8Array>> {
    await this.init();
    const blobPath = path.join(this.blobsDir, blobId);
    try {
      await fs.access(blobPath);
    } catch {
      throw new DomainError('BLOB_NOT_FOUND', 404);
    }

    const stream = createReadStream(blobPath);
    return stream as unknown as AsyncIterable<Uint8Array>;
  }

  public async markForDeletion(blobId: string): Promise<void> {
    await this.init();
    const blobPath = path.join(this.blobsDir, blobId);
    await fs.unlink(blobPath).catch(() => {});
  }
}
