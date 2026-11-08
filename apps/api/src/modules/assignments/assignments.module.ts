import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationsModule } from '../notifications/notifications.module';
import { IdentityModule } from '../identity/identity.module';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';

@Module({
  imports: [NotificationsModule, IdentityModule],
  controllers: [AssignmentController],
  providers: [
    AssignmentService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
  ],
  exports: [AssignmentService],
})
export class AssignmentsModule {}
