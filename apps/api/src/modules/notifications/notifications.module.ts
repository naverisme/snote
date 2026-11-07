import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { NotificationService } from './notification.service';

@Module({
  providers: [OutboxService, NotificationService],
  exports: [OutboxService, NotificationService],
})
export class NotificationsModule {}
