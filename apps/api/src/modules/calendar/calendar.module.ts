import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ScopedAuthorization } from '../authorization/policy';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  imports: [IdentityModule, AuthorizationModule],
  controllers: [CalendarController],
  providers: [{
    provide: CalendarService,
    useFactory: (auth: ScopedAuthorization) => new CalendarService(auth),
    inject: [ScopedAuthorization],
  }],
  exports: [CalendarService],
})
export class CalendarModule {}
