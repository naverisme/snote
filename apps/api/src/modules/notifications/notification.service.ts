import { Injectable } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { OutboxService, type DbClientOrTx } from './outbox.service';
import type {
  AssignmentCreatedPayload,
  FeedbackCreatedPayload,
  ProgressUpdatedPayload,
  SubmissionCreatedPayload,
} from './notification.types';

@Injectable()
export class NotificationService {
  constructor(private readonly outboxService: OutboxService) {}

  async notifyAssignmentCreated(
    db: DbClientOrTx,
    payload: AssignmentCreatedPayload
  ): Promise<void> {
    await this.outboxService.publish(db, 'assignment.created', payload as any);
  }

  async notifyAssignmentUpdated(
    db: DbClientOrTx,
    payload: { assignmentId: string; classId: string; title: string; deadline?: string | null; updatedAt: string }
  ): Promise<void> {
    await this.outboxService.publish(db, 'assignment.updated', payload as any);
  }

  async notifyAssignmentArchived(
    db: DbClientOrTx,
    payload: { assignmentId: string; classId: string; archivedAt: string }
  ): Promise<void> {
    await this.outboxService.publish(db, 'assignment.archived', payload as any);
  }

  async notifySubmissionCreated(
    db: DbClientOrTx,
    payload: SubmissionCreatedPayload
  ): Promise<void> {
    const topic = payload.version === 1 ? 'submission.created' : 'submission.revision';
    await this.outboxService.publish(db, topic, payload as any);
  }

  async notifyFeedbackCreated(
    db: DbClientOrTx,
    payload: FeedbackCreatedPayload
  ): Promise<void> {
    await this.outboxService.publish(db, 'feedback.created', payload as any);
  }

  async notifyProgressUpdated(
    db: DbClientOrTx,
    payload: ProgressUpdatedPayload
  ): Promise<void> {
    await this.outboxService.publish(db, 'progress.updated', payload as any);
  }

  async listEvents(
    db: PrismaClient,
    options: { topic?: string; limit?: number } = {}
  ) {
    const { topic, limit = 50 } = options;
    return (db as any).outboxEvent.findMany({
      where: topic ? { topic } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
