import { Body, Controller, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { components } from '@snote/contracts';
import { IdentityService } from './identity.service';
import { getSession, parseCookie, replyCommand, requireAuthAndCsrf } from './http-utils';
import type { SessionPort } from '../../core/http';

type Register = components['schemas']['Register'];
type Login = components['schemas']['Login'];
type PasswordResetRequest = components['schemas']['PasswordResetRequest'];
type PasswordReset = components['schemas']['PasswordReset'];

@Controller('auth')
export class AuthController {
  constructor(
    private readonly identityService: IdentityService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post('register')
  async register(@Body() body: Register, @Res({ passthrough: true }) res: Response) {
    const { account, session } = await this.identityService.register(body);
    res.setHeader('Set-Cookie', session.cookie);
    res.setHeader('ETag', `"${account.version}"`);
    return {
      data: account,
      csrfToken: session.csrfToken,
      requestId: session.token.slice(0, 16),
    };
  }

  @Post('login')
  async login(@Body() body: Login, @Res({ passthrough: true }) res: Response) {
    const { account, session } = await this.identityService.login(body);
    res.setHeader('Set-Cookie', session.cookie);
    res.setHeader('ETag', `"${account.version}"`);
    return {
      data: account,
      csrfToken: session.csrfToken,
      requestId: session.token.slice(0, 16),
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const token = parseCookie(req.headers.cookie, 'snote_session');
    await this.identityService.logout(token);
    res.setHeader('Set-Cookie', 'snote_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    return replyCommand(res, true);
  }

  @Post('password-reset-request')
  async passwordResetRequest(@Body() body: PasswordResetRequest, @Res({ passthrough: true }) res: Response) {
    await this.identityService.passwordResetRequest(body);
    return replyCommand(res, true);
  }

  @Post('password-reset')
  async passwordReset(@Body() body: PasswordReset, @Res({ passthrough: true }) res: Response) {
    await this.identityService.passwordReset(body);
    return replyCommand(res, true);
  }
}
