import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

@Module({
  imports: [NotificationsModule],
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
