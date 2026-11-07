import type { PrismaClient } from '@prisma/client';
import type { Session, SessionPort, SessionStore } from '../../core/http';

export class PrismaSessionStore implements SessionStore, SessionPort {
  constructor(private readonly db: PrismaClient) {}

  async insert(accountId: string, tokenHash: string, csrfHash: string, expiresAt: Date): Promise<void> {
    await this.db.session.create({
      data: {
        accountId,
        tokenHash,
        csrfHash,
        expiresAt,
      },
    });
  }

  async load(tokenHash: string): Promise<Session | null> {
    const s = await this.db.session.findFirst({
      where: { tokenHash, revokedAt: null },
    });
    if (!s || s.expiresAt <= new Date()) return null;
    return {
      accountId: s.accountId,
      csrfHash: s.csrfHash,
      expiresAt: s.expiresAt,
    };
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.db.session.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }
}

export class InMemorySessionStore implements SessionStore, SessionPort {
  private sessions = new Map<string, Session & { revoked: boolean }>();

  async insert(accountId: string, tokenHash: string, csrfHash: string, expiresAt: Date): Promise<void> {
    this.sessions.set(tokenHash, { accountId, csrfHash, expiresAt, revoked: false });
  }

  async load(tokenHash: string): Promise<Session | null> {
    const s = this.sessions.get(tokenHash);
    if (!s || s.revoked || s.expiresAt <= new Date()) return null;
    return { accountId: s.accountId, csrfHash: s.csrfHash, expiresAt: s.expiresAt };
  }

  async revoke(tokenHash: string): Promise<void> {
    const s = this.sessions.get(tokenHash);
    if (s) s.revoked = true;
  }
}
