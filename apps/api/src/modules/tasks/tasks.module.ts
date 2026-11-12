import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IdentityModule } from '../identity/identity.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ScopedAuthorization } from '../authorization/policy';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { createPrismaTasksService } from './prisma-tasks-service';

@Module({
  imports: [IdentityModule, AuthorizationModule],
  controllers: [TasksController],
  providers: [{
    provide: TasksService,
    useFactory: (auth: ScopedAuthorization, db: PrismaClient) => createPrismaTasksService(auth, db),
    inject: [ScopedAuthorization, PrismaClient],
  }],
  exports: [TasksService],
})
export class TasksModule {}
