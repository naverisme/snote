import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { OAuth2Client } from 'google-auth-library';
import { GoogleIdTokenVerifier } from './google-token-verifier';
import { DomainError } from '../../core/authorization';

test('Google verifier passes configured audience and requires verified Google claims', async () => {
  let audience = '';
  const payload = { sub: 'stable-subject', email: 'user@gmail.com', email_verified: true, iss: 'https://accounts.google.com' };
  const client = { verifyIdToken: async (options: { audience?: string | string[] }) => {
    audience = String(options.audience);
    return { getPayload: () => payload };
  } } as unknown as Pick<OAuth2Client, 'verifyIdToken'>;
  const verifier = new GoogleIdTokenVerifier('expected-client-id', client);
  assert.deepEqual(await verifier.verify('token'), { subject: 'stable-subject', email: 'user@gmail.com' });
  assert.equal(audience, 'expected-client-id');
  for (const changes of [{ email_verified: false }, { iss: 'https://attacker.example' }, { sub: '' }, { email: '' }]) {
    Object.assign(payload, changes);
    await assert.rejects(() => verifier.verify('token'),
      (error: unknown) => error instanceof DomainError && error.code === 'INVALID_GOOGLE_CREDENTIAL');
    Object.assign(payload, { sub: 'stable-subject', email: 'user@gmail.com', email_verified: true, iss: 'https://accounts.google.com' });
  }
});
