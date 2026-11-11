import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './auth.controller';
import { MeController } from './me.controller';
import { IdentityService } from './identity.service';
import { AccountService } from './account-service';
import { PrismaSessionStore } from './session-store';
import { GoogleIdTokenVerifier } from './google-token-verifier';

const prisma = new PrismaClient();
const sessionStore = new PrismaSessionStore(prisma);

@Module({
  controllers: [AuthController, MeController],
  providers: [
    { provide: PrismaClient, useValue: prisma },
    { provide: 'SESSION_PORT', useValue: sessionStore },
    { provide: 'SESSION_STORE', useValue: sessionStore },
    {
      provide: IdentityService,
      useFactory: (db: PrismaClient, store: PrismaSessionStore) =>
        new IdentityService(db, store, undefined, new GoogleIdTokenVerifier(process.env.GOOGLE_CLIENT_ID || '')),
      inject: [PrismaClient, 'SESSION_PORT'],
    },
    {
      provide: AccountService,
      useFactory: (db: PrismaClient) => new AccountService(db),
      inject: [PrismaClient],
    },
  ],
  exports: [IdentityService, AccountService, 'SESSION_PORT', PrismaClient],
})
export class IdentityModule {}
