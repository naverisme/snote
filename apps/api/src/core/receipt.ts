import { createHash } from 'node:crypto';
import { DomainError } from './authorization';

export interface Receipt<T> { fingerprint: string; result: T; }
export interface ReceiptPort<T> {
  /** Lock key and execute callback in one DB transaction; callback writes domain rows and receipt. */
  transact(key: string, fingerprint: string, work: (existing: Receipt<T> | null, save: (result: T) => Promise<void>) => Promise<T>): Promise<T>;
}

export function fingerprint(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(body)).digest('hex');
}

export async function replayOrCommit<T>(port: ReceiptPort<T>, key: string, body: unknown, commit: () => Promise<T>): Promise<T> {
  const hash = fingerprint(body);
  return port.transact(key, hash, async (existing, save) => {
    if (existing) {
      if (existing.fingerprint !== hash) throw new DomainError('IDEMPOTENCY_CONFLICT', 409);
      return existing.result;
    }
    const result = await commit();
    await save(result);
    return result;
  });
}
