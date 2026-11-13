export type Scope = { type: 'class' | 'workspace' | 'assignment'; id: string };
export type Principal = { accountId: string };
export type Decision = { allowed: boolean };

/** Implementations must query current membership and grants in the same transaction as a write. */
export interface AuthorizationPort {
  decide(principal: Principal, action: string, scope: Scope): Promise<Decision>;
}

export async function requireAction(port: AuthorizationPort, principal: Principal, action: string, scope: Scope): Promise<void> {
  const decision = await port.decide(principal, action, scope);
  if (!decision.allowed) throw new DomainError('FORBIDDEN', 403);
}

export class DomainError extends Error {
  constructor(public readonly code: string, public readonly status: number) { super(code); }
}

export class RateLimitError extends DomainError {
  constructor(code: string, public readonly retryAfterSeconds: number) { super(code, 429); }
}
