import { Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { NotificationTopic, OutboxEventRecord } from './notification.types';

export type DbClientOrTx = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class OutboxService {
  async publish(
    db: DbClientOrTx,
    topic: NotificationTopic,
    payload: Record<string, unknown>
  ): Promise<OutboxEventRecord> {
    const record = await (db as any).outboxEvent.create({
      data: {
        topic,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      id: record.id,
      topic: record.topic,
      payload: record.payload as Record<string, unknown>,
      deliveredAt: record.deliveredAt,
      createdAt: record.createdAt,
    };
  }
}
