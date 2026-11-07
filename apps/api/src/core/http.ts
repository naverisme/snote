import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { DomainError } from './authorization';

export interface Session { accountId: string; csrfHash: string; expiresAt: Date; }
export interface SessionPort { load(tokenHash: string): Promise<Session | null>; revoke(tokenHash: string): Promise<void>; }
export interface SessionStore {
  insert(accountId: string, tokenHash: string, csrfHash: string, expiresAt: Date): Promise<void>;
}

export function hashSecret(value: string): string { return createHash('sha256').update(value).digest('hex'); }
export async function createSession(store: SessionStore, accountId: string, ttlMs: number) {
  if (ttlMs <= 0) throw new Error('Invalid session lifetime');
  const token = randomBytes(32).toString('base64url');
  const csrfToken = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + ttlMs);
  await store.insert(accountId, hashSecret(token), hashSecret(csrfToken), expiresAt);
  return { token, csrfToken, cookie: `snote_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(ttlMs / 1000)}` };
}

export function requestId(): string { return randomUUID(); }
export function success<T>(data: T, id: string) { return { data, requestId: id }; }
export function failure(error: unknown, id: string) {
  const domain = error instanceof DomainError ? error : new DomainError('RETRYABLE', 503);
  return { status: domain.status, body: { error: { code: domain.code, message: domain.code, details: {} }, requestId: id } };
}

export async function authenticate(port: SessionPort, cookie: string | undefined): Promise<Session> {
  if (!cookie) throw new DomainError('UNAUTHENTICATED', 401);
  const session = await port.load(hashSecret(cookie));
  if (!session || session.expiresAt <= new Date()) throw new DomainError('UNAUTHENTICATED', 401);
  return session;
}

export function requireCsrf(session: Session, provided: string | undefined): void {
  if (!provided) throw new DomainError('FORBIDDEN', 403);
  const expected = Buffer.from(session.csrfHash, 'hex');
  const actual = Buffer.from(hashSecret(provided), 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new DomainError('FORBIDDEN', 403);
}

export function requireVersion(current: number, ifMatch: string | undefined): void {
  if (!ifMatch) throw new DomainError('VERSION_CONFLICT', 412);
  if (ifMatch !== `"${current}"`) throw new DomainError('VERSION_CONFLICT', 412);
}
