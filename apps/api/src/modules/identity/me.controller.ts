import { Body, Controller, Get, Inject, Patch, Req, Res } from '@nestjs/common';
import type { components } from '@snote/contracts';
import { IdentityService } from './identity.service';
import { AccountService } from './account-service';
import { getSession, replySuccess, requireAuthAndCsrf, type Request, type Response } from './http-utils';
import type { SessionPort } from '../../core/http';

type UsageUpdate = components['schemas']['UsageUpdate'];

@Controller('me')
export class MeController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly accountService: AccountService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Get()
  async getMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const account = await this.identityService.getMe(session.accountId);
    return replySuccess(res, account, account.version);
  }

  @Patch('usages')
  async changeUsages(@Body() body: UsageUpdate, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const account = await this.accountService.changeUsages(session.accountId, body.usages, ifMatch);
    const full = await this.identityService.getMe(session.accountId);
    return replySuccess(res, full, account.version);
  }

  @Get('invitations')
  async getInvitations(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const invitations = await this.identityService.getInvitations(session.accountId);
    return replySuccess(res, invitations);
  }

  @Get('ownership-transfers')
  async getOwnershipTransfers(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const transfers = await this.identityService.getOwnershipTransfers(session.accountId);
    return replySuccess(res, transfers);
  }
}
