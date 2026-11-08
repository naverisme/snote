import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { HttpException } from '@nestjs/common';
import type { Principal } from '../../core/authorization';
import { hashSecret, type SessionPort } from '../../core/http';
import type { Request } from '../identity/http-utils';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

test('PM-04: calendar requires cookie session and ignores spoofed account/workspace headers', async () => {
  let actor: string | undefined;
  let suppliedWorkspaceIds: string[] | undefined;
  const service = {
    listMyEvents: async (principal: Principal, _zone?: string, ids?: string[]) => {
      actor = principal.accountId; suppliedWorkspaceIds = ids; return { events: [] };
    },
  } as unknown as CalendarService;
  const sessions: SessionPort = {
    load: async tokenHash => tokenHash === hashSecret('valid-cookie')
      ? { accountId: 'real-account', csrfHash: hashSecret('valid-csrf'), expiresAt: new Date(Date.now() + 60_000) }
      : null,
    revoke: async () => {},
  };
  const controller = new CalendarController(service, sessions);
  const anonymous: Request = { headers: { 'x-account-id': 'victim', 'x-workspace-ids': 'victim-workspace' } };
  await assert.rejects(controller.getMeEvents(anonymous), (err: unknown) =>
    err instanceof HttpException && err.getStatus() === 401);
  await controller.getMeEvents({ headers: {
    cookie: 'snote_session=valid-cookie', 'x-account-id': 'victim', 'x-workspace-ids': 'victim-workspace',
  } });
  assert.equal(actor, 'real-account');
  assert.equal(suppliedWorkspaceIds, undefined);
});
