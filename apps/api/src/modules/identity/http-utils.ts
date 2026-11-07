import { DomainError } from '../../core/authorization';
import { authenticate, requireCsrf, requireVersion, requestId, type Session, type SessionPort } from '../../core/http';

export interface Request {
  headers: Record<string, string | string[] | undefined>;
  url?: string;
  method?: string;
}

export interface Response {
  status(code: number): this;
  json(body: unknown): this;
  setHeader(name: string, value: string): this;
  req?: Request;
}

export function parseCookie(header: string | string[] | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const cookieStr = Array.isArray(header) ? header.join('; ') : header;
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function getSession(req: Request, sessionPort: SessionPort): Promise<Session> {
  const cookieHeader = req.headers.cookie;
  const token = parseCookie(cookieHeader, 'snote_session');
  return authenticate(sessionPort, token);
}

export async function requireAuthAndCsrf(req: Request, sessionPort: SessionPort): Promise<Session> {
  const session = await getSession(req, sessionPort);
  const csrfToken = req.headers['x-csrf-token'] as string | undefined;
  requireCsrf(session, csrfToken);
  return session;
}

export function checkVersion(req: Request, currentVersion: number): void {
  const ifMatch = req.headers['if-match'] as string | undefined;
  requireVersion(currentVersion, ifMatch);
}

export function replySuccess<T>(res: Response, data: T, version?: number) {
  const id = (res.req?.headers['x-request-id'] as string) || requestId();
  if (version !== undefined) {
    res.setHeader('ETag', `"${version}"`);
  }
  return { data, requestId: id };
}

export function replyCommand(res: Response, success = true) {
  const id = (res.req?.headers['x-request-id'] as string) || requestId();
  return { data: { success }, requestId: id };
}
