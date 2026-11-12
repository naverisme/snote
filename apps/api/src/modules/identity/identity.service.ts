import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { Prisma, type PrismaClient } from '@prisma/client';
import type { components } from '@snote/contracts';
import { DomainError } from '../../core/authorization';
import { createSession, hashSecret, type SessionPort, type SessionStore } from '../../core/http';
import { validateUsages } from './account-service';
import type { GoogleTokenVerifier } from './google-token-verifier';
import type { PasswordResetMailer } from './password-reset-mailer';

type Register = components['schemas']['Register'];
type Login = components['schemas']['Login'];
type PasswordResetRequest = components['schemas']['PasswordResetRequest'];
type PasswordReset = components['schemas']['PasswordReset'];
type AccountSchema = components['schemas']['Account'];
type InvitationSchema = components['schemas']['Invitation'];
type OwnershipTransferSchema = components['schemas']['OwnershipTransfer'];

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export class IdentityService {
  constructor(
    private readonly db: PrismaClient,
    private readonly sessionStore: SessionStore & SessionPort,
    private readonly ttlMs = 7 * 24 * 60 * 60 * 1000,
    private readonly googleVerifier?: GoogleTokenVerifier,
    private readonly passwordResetMailer?: PasswordResetMailer,
  ) {}

  async register(input: Register) {
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new DomainError('INVALID_INPUT', 422);
    }
    if (!input.password || input.password.length < 12) {
      throw new DomainError('INVALID_INPUT', 422);
    }
    const usages = validateUsages(input.usages);
    if (!input.timeZone) {
      throw new DomainError('INVALID_INPUT', 422);
    }
    try {
      new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format();
    } catch {
      throw new DomainError('INVALID_INPUT', 422);
    }

    const passwordHash = hashPassword(input.password);

    const account = await this.db.$transaction(async tx => {
      const existing = await tx.account.findUnique({ where: { email: input.email.toLowerCase() } });
      if (existing) throw new DomainError('CONFLICT', 409);

      const acc = await tx.account.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          timeZone: input.timeZone,
          usages: {
            create: usages.map(usage => ({ usage })),
          },
        },
      });

      // Default personal workspace (STR-01, ACC-01)
      const ws = await tx.workspace.create({
        data: {
          name: 'Cá nhân',
          kind: 'default',
          timeZone: input.timeZone,
          ownerId: acc.id,
          status: 'active',
        },
      });

      await tx.workspaceMembership.create({
        data: {
          workspaceId: ws.id,
          accountId: acc.id,
          role: 'leader',
          status: 'active',
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: acc.id,
          scopeType: 'account',
          scopeId: acc.id,
          action: 'account.register',
          targetId: acc.id,
        },
      });

      return acc;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

    const session = await createSession(this.sessionStore, account.id, this.ttlMs);
    const accountData: AccountSchema = {
      id: account.id,
      usages,
      timeZone: account.timeZone,
      version: account.version,
    };

    return { account: accountData, session };
  }

  async login(input: Login) {
    if (!input.email || !input.password) {
      throw new DomainError('INVALID_INPUT', 422);
    }

    const account = await this.db.account.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { usages: true },
    });

    if (!account?.passwordHash || !verifyPassword(input.password, account.passwordHash)) {
      throw new DomainError('UNAUTHENTICATED', 401);
    }

    const session = await createSession(this.sessionStore, account.id, this.ttlMs);
    const usages = account.usages.map(u => u.usage) as AccountSchema['usages'];
    const accountData: AccountSchema = {
      id: account.id,
      usages,
      timeZone: account.timeZone,
      version: account.version,
    };

    return { account: accountData, session };
  }

  async googleSignIn(input: { credential: string; usages: AccountSchema['usages']; timeZone: string }) {
    if (typeof input?.credential !== 'string' || input.credential.length > 8192 || !this.googleVerifier) {
      throw new DomainError('INVALID_INPUT', 422);
    }
    const identity = await this.googleVerifier.verify(input.credential);
    let account = await this.db.account.findUnique({
      where: { googleSubject: identity.subject }, include: { usages: true },
    });
    if (!account) {
      const email = identity.email.toLowerCase();
      if (await this.db.account.findUnique({ where: { email } })) {
        throw new DomainError('ACCOUNT_LINK_REQUIRED', 409);
      }
      const usages = validateUsages(input.usages);
      if (!input.timeZone) throw new DomainError('INVALID_INPUT', 422);
      try { new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format(); }
      catch { throw new DomainError('INVALID_INPUT', 422); }
      try {
        account = await this.db.$transaction(async tx => {
          const created = await tx.account.create({
            data: { email, googleSubject: identity.subject, passwordHash: null, timeZone: input.timeZone,
              usages: { create: usages.map(usage => ({ usage })) } },
            include: { usages: true },
          });
          const workspace = await tx.workspace.create({
            data: { name: 'Cá nhân', kind: 'default', timeZone: input.timeZone,
              ownerId: created.id, status: 'active' },
          });
          await tx.workspaceMembership.create({ data: {
            workspaceId: workspace.id, accountId: created.id, role: 'leader', status: 'active',
          } });
          await tx.auditEvent.create({ data: {
            actorId: created.id, scopeType: 'account', scopeId: created.id,
            action: 'account.register_google', targetId: created.id,
          } });
          return created;
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          account = await this.db.account.findUnique({
            where: { googleSubject: identity.subject }, include: { usages: true },
          });
          if (!account) throw new DomainError('ACCOUNT_LINK_REQUIRED', 409);
        } else throw error;
      }
    }
    const session = await createSession(this.sessionStore, account.id, this.ttlMs);
    const accountData: AccountSchema = {
      id: account.id, usages: account.usages.map(u => u.usage) as AccountSchema['usages'],
      timeZone: account.timeZone, version: account.version,
    };
    return { account: accountData, session };
  }

  async logout(sessionCookie: string | undefined): Promise<void> {
    if (sessionCookie) {
      await this.sessionStore.revoke(hashSecret(sessionCookie));
    }
  }

  async passwordResetRequest(input: PasswordResetRequest): Promise<void> {
    if (!this.passwordResetMailer) throw new DomainError('EMAIL_NOT_CONFIGURED', 503);
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      return; // Do not reveal email existence
    }
    const account = await this.db.account.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!account) return;

    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashSecret(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const record = await this.db.passwordResetToken.create({
      data: {
        accountId: account.id,
        tokenHash,
        expiresAt,
      },
    });
    try {
      await this.passwordResetMailer.send(account.email, token);
    } catch {
      await this.db.passwordResetToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
      console.error('Password reset delivery failed');
    }
  }

  async passwordReset(input: PasswordReset): Promise<void> {
    if (!input.token || !input.newPassword || input.newPassword.length < 12) {
      throw new DomainError('INVALID_INPUT', 422);
    }
    const tokenHash = hashSecret(input.token);
    const now = new Date();

    await this.db.$transaction(async tx => {
      const record = await tx.passwordResetToken.findFirst({
        where: {
          tokenHash,
          consumedAt: null,
          expiresAt: { gt: now },
        },
      });
      if (!record) throw new DomainError('INVALID_INPUT', 422);

      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, consumedAt: null },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) throw new DomainError('INVALID_INPUT', 422);

      const passwordHash = hashPassword(input.newPassword);
      await tx.account.update({
        where: { id: record.accountId },
        data: {
          passwordHash,
          version: { increment: 1 },
        },
      });

      await tx.passwordResetToken.updateMany({
        where: { accountId: record.accountId, consumedAt: null },
        data: { consumedAt: now },
      });
      await tx.session.updateMany({
        where: { accountId: record.accountId, revokedAt: null },
        data: { revokedAt: now },
      });

      await tx.auditEvent.create({
        data: {
          actorId: record.accountId,
          scopeType: 'account',
          scopeId: record.accountId,
          action: 'account.password_reset',
          targetId: record.accountId,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async getMe(accountId: string): Promise<AccountSchema> {
    const account = await this.db.account.findUnique({
      where: { id: accountId },
      include: { usages: true },
    });
    if (!account) throw new DomainError('NOT_FOUND', 404);
    return {
      id: account.id,
      usages: account.usages.map(u => u.usage) as AccountSchema['usages'],
      timeZone: account.timeZone,
      version: account.version,
    };
  }

  async getInvitations(accountId: string): Promise<InvitationSchema[]> {
    const invitations = await this.db.invitation.findMany({
      where: { recipientId: accountId },
      orderBy: { createdAt: 'desc' },
    });
    return invitations.map(i => ({
      id: i.id,
      targetType: i.targetType as 'class' | 'workspace',
      targetId: i.targetId,
      initiatorId: i.initiatorId,
      recipientId: i.recipientId,
      status: i.status as InvitationSchema['status'],
      expiresAt: i.expiresAt?.toISOString(),
      acceptedAt: i.acceptedAt?.toISOString(),
      version: i.version,
    }));
  }

  async getOwnershipTransfers(accountId: string): Promise<OwnershipTransferSchema[]> {
    const transfers = await this.db.transferRequest.findMany({
      where: { recipientId: accountId },
      orderBy: { createdAt: 'desc' },
    });
    return transfers.map(t => ({
      id: t.id,
      targetType: t.targetType as 'class' | 'workspace',
      targetId: t.targetId,
      initiatorId: t.initiatorId,
      recipientId: t.recipientId,
      status: t.status as OwnershipTransferSchema['status'],
      acceptedAt: t.acceptedAt?.toISOString(),
      version: t.version,
    }));
  }
}
