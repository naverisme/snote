import { Body, Controller, Delete, Inject, Param, Post, Req, Res } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { components } from '@snote/contracts';
import { DomainError } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import { getSession, replySuccess, requireAuthAndCsrf, type Request, type Response } from '../identity/http-utils';
import type { SessionPort } from '../../core/http';

type GrantInput = components['schemas']['GrantInput'];
type GrantSchema = components['schemas']['Grant'];

@Controller('grants')
export class GrantsController {
  constructor(
    private readonly db: PrismaClient,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post()
  async createGrant(@Body() body: GrantInput, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);

    // Permission check: actor must own the target scope
    if (body.scopeType === 'class') {
      const cls = await this.db.class.findUnique({ where: { id: body.scopeId } });
      if (!cls || cls.ownerId !== session.accountId) throw new DomainError('FORBIDDEN', 403);
    } else if (body.scopeType === 'workspace') {
      const ws = await this.db.workspace.findUnique({ where: { id: body.scopeId } });
      if (!ws || ws.ownerId !== session.accountId) throw new DomainError('FORBIDDEN', 403);
    }

    const grant = await this.db.grant.create({
      data: {
        principalId: body.principalId,
        action: body.action,
        scopeType: body.scopeType,
        scopeId: body.scopeId,
      },
    });

    await this.db.auditEvent.create({
      data: {
        actorId: session.accountId,
        scopeType: body.scopeType,
        scopeId: body.scopeId,
        action: 'grant.create',
        targetId: grant.id,
      },
    });

    const result: GrantSchema = {
      id: grant.id,
      principalId: grant.principalId,
      action: grant.action,
      scopeType: grant.scopeType,
      scopeId: grant.scopeId,
      version: grant.version,
    };
    return replySuccess(res, result, result.version);
  }

  @Delete(':grantId')
  async deleteGrant(@Param('grantId') grantId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;

    const grant = await this.db.grant.findUnique({ where: { id: grantId } });
    if (!grant) throw new DomainError('NOT_FOUND', 404);
    requireVersion(grant.version, ifMatch);

    // Permission check
    if (grant.scopeType === 'class') {
      const cls = await this.db.class.findUnique({ where: { id: grant.scopeId } });
      if (!cls || cls.ownerId !== session.accountId) throw new DomainError('FORBIDDEN', 403);
    } else if (grant.scopeType === 'workspace') {
      const ws = await this.db.workspace.findUnique({ where: { id: grant.scopeId } });
      if (!ws || ws.ownerId !== session.accountId) throw new DomainError('FORBIDDEN', 403);
    }

    const updated = await this.db.grant.update({
      where: { id: grantId },
      data: { revokedAt: new Date(), version: { increment: 1 } },
    });

    await this.db.auditEvent.create({
      data: {
        actorId: session.accountId,
        scopeType: grant.scopeType,
        scopeId: grant.scopeId,
        action: 'grant.revoke',
        targetId: grant.id,
      },
    });

    const result: GrantSchema = {
      id: updated.id,
      principalId: updated.principalId,
      action: updated.action,
      scopeType: updated.scopeType,
      scopeId: updated.scopeId,
      version: updated.version,
    };
    return replySuccess(res, result, result.version);
  }
}
