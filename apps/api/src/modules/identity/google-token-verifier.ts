import { OAuth2Client } from 'google-auth-library';
import { DomainError } from '../../core/authorization';

export interface GoogleIdentity { subject: string; email: string }
export interface GoogleTokenVerifier { verify(credential: string): Promise<GoogleIdentity> }

export class GoogleIdTokenVerifier implements GoogleTokenVerifier {
  constructor(
    private readonly clientId: string,
    private readonly client: Pick<OAuth2Client, 'verifyIdToken'> = new OAuth2Client(),
  ) {}

  async verify(credential: string): Promise<GoogleIdentity> {
    if (!this.clientId) throw new DomainError('GOOGLE_NOT_CONFIGURED', 503);
    try {
      const ticket = await this.client.verifyIdToken({ idToken: credential, audience: this.clientId });
      const claims = ticket.getPayload();
      if (!claims?.sub || !claims.email || claims.email_verified !== true ||
          !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) {
        throw new DomainError('INVALID_GOOGLE_CREDENTIAL', 401);
      }
      return { subject: claims.sub, email: claims.email };
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError('INVALID_GOOGLE_CREDENTIAL', 401);
    }
  }
}
