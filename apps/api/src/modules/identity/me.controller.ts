import { Body, Controller, Get, Inject, Patch, Post, Req, Res } from '@nestjs/common';
import type { components } from '@snote/contracts';
import type { ChangePasswordWithOtpInput } from '@snote/contracts/password-change-otp';
import { IdentityService } from './identity.service';
import { AccountService } from './account-service';
import { getSession, replyCommand, replySuccess, requireAuthAndCsrf, type Request, type Response } from './http-utils';
import type { SessionPort } from '../../core/http';

type UsageUpdate = components['schemas']['UsageUpdate'];
type ProfileUpdate = components['schemas']['ProfileUpdate'];

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

  @Post('password-change-otp')
  async requestPasswordChangeOtp(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const result = await this.identityService.requestPasswordChangeOtp(session.accountId);
    return replySuccess(res, result);
  }

  @Post('verify-password-change-otp')
  async verifyPasswordChangeOtp(@Body() body: { code: string },
    @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const valid = await this.identityService.verifyPasswordChangeOtp(session.accountId, body?.code);
    return replySuccess(res, { valid });
  }

  @Post('change-password')
  async changePasswordWithOtp(@Body() body: ChangePasswordWithOtpInput,
    @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    await this.identityService.changePasswordWithOtp(session.accountId, body?.code, body?.newPassword);
    return replyCommand(res, true);
  }

  @Patch('usages')
  async changeUsages(@Body() body: UsageUpdate, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const account = await this.accountService.changeUsages(session.accountId, body.usages, ifMatch);
    const full = await this.identityService.getMe(session.accountId);
    return replySuccess(res, full, account.version);
  }

  @Patch('profile')
  async changeProfile(@Body() body: ProfileUpdate, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const account = await this.accountService.changeProfile(session.accountId, body.displayName, ifMatch);
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
