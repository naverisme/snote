import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IdentityModule } from '../identity/identity.module';
import { GrantsController } from './grants.controller';
import { ScopedAuthorization } from './policy';
import { PrismaPolicyReader } from './prisma-policy-reader';

@Module({
  imports: [IdentityModule],
  controllers: [GrantsController],
  providers: [
    {
      provide: ScopedAuthorization,
      useFactory: (db: PrismaClient) => new ScopedAuthorization(new PrismaPolicyReader(db)),
      inject: [PrismaClient],
    },
  ],
  exports: [ScopedAuthorization],
})
export class AuthorizationModule {}
