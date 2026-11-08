import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { SessionPort } from '../../core/http';
import { getSession, requireAuthAndCsrf, type Request } from '../identity/http-utils';

export interface LibraryRequest extends Request {
  user?: { accountId: string };
}

@Injectable()
export class LibrarySessionGuard implements CanActivate {
  constructor(@Inject('SESSION_PORT') private readonly sessions: SessionPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<LibraryRequest>();
    const method = req.method?.toUpperCase();
    const session = method === 'GET' || method === 'HEAD'
      ? await getSession(req, this.sessions)
      : await requireAuthAndCsrf(req, this.sessions);
    req.user = { accountId: session.accountId };
    return true;
  }
}

export function libraryPrincipal(req: LibraryRequest): { accountId: string } {
  if (!req.user) throw new Error('LibrarySessionGuard was not applied');
  return { accountId: req.user.accountId };
}
