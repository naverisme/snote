import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ScopedAuthorization } from '../authorization/policy';
import { PrismaClient } from '@prisma/client';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { createPrismaCalendarService } from './prisma-calendar-service';

@Module({
  imports: [IdentityModule, AuthorizationModule],
  controllers: [CalendarController],
  providers: [{
    provide: CalendarService,
    useFactory: (auth: ScopedAuthorization, db: PrismaClient) => createPrismaCalendarService(auth, db),
    inject: [ScopedAuthorization, PrismaClient],
  }],
  exports: [CalendarService],
})
export class CalendarModule {}
