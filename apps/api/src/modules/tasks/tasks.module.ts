import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ScopedAuthorization } from '../authorization/policy';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [IdentityModule, AuthorizationModule],
  controllers: [TasksController],
  providers: [{
    provide: TasksService,
    useFactory: (auth: ScopedAuthorization) => new TasksService(auth),
    inject: [ScopedAuthorization],
  }],
  exports: [TasksService],
})
export class TasksModule {}
