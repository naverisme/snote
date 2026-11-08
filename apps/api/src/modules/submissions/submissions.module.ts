import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationsModule } from '../notifications/notifications.module';
import { IdentityModule } from '../identity/identity.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

@Module({
  imports: [NotificationsModule, IdentityModule],
  controllers: [SubmissionController],
  providers: [
    SubmissionService,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
  ],
  exports: [SubmissionService],
})
export class SubmissionsModule {}
