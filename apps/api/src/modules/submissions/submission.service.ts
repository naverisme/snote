import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DomainError } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import { fingerprint } from '../../core/receipt';
import { NotificationService } from '../notifications/notification.service';
import { evaluateTimeliness } from './late-policy';
import { SubmissionAuthService } from './submission-auth';
import type {
  FeedbackDto,
  SubmissionDto,
  SubmissionInputDto,
} from './submission.types';

@Injectable()
export class SubmissionService {
  private readonly auth: SubmissionAuthService;

  constructor(
    @Inject(PrismaClient) private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService
  ) {
    this.auth = new SubmissionAuthService(prisma);
  }

  async submit(
    actorId: string,
    recipientId: string,
    input: SubmissionInputDto,
    idempotencyKey: string,
    ifMatch?: string
  ): Promise<SubmissionDto> {
    if (!idempotencyKey || !idempotencyKey.trim()) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    // ASG-14: At least one of text, links, or uploadIds must be non-empty
    const hasText = Boolean(input.text && input.text.trim().length > 0);
    const hasLinks = Boolean(input.links && input.links.length > 0);
    const hasUploads = Boolean(input.uploadIds && input.uploadIds.length > 0);

    if (!hasText && !hasLinks && !hasUploads) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    const bodyHash = fingerprint({
      text: input.text?.trim() ?? null,
      links: input.links ?? [],
      uploadIds: input.uploadIds ?? [],
    });

    // Check idempotency receipt (QA-08 & EC-05)
    const existingReceipt = await (this.prisma as any).operationReceipt.findUnique({
      where: {
        actorId_scopeType_scopeId_action_key: {
          actorId,
          scopeType: 'assignment_recipient',
          scopeId: recipientId,
          action: 'submission.send',
          key: idempotencyKey,
        },
      },
    });

    if (existingReceipt) {
      if (existingReceipt.fingerprint !== bodyHash) {
        throw new DomainError('IDEMPOTENCY_CONFLICT', 409);
      }
      return existingReceipt.result as SubmissionDto;
    }

    // Verify authorization
    const { recipient, assignment } = await this.auth.requireCanSubmit(actorId, recipientId);

    // Concurrency check: find latest revision
    const latestRevision = await (this.prisma as any).submissionRevision.findFirst({
      where: { recipientId },
      orderBy: { version: 'desc' },
    });

    const isFirstSubmission = !latestRevision;
    const currentVersion = latestRevision ? latestRevision.version : 0;
    const nextVersion = currentVersion + 1;

    // ASG-12: If revision, If-Match is required and must match current version
    if (!isFirstSubmission) {
      requireVersion(currentVersion, ifMatch);
    }

    // Evaluate late policy at the exact server acceptance time (QA-09, EC-06)
    const now = new Date();
    const classPolicy = await (this.prisma as any).classPolicy.findUnique({
      where: { classId: assignment.classId },
    });

    const timeliness = evaluateTimeliness(
      now,
      {
        deadline: assignment.deadline,
        deadlineDate: assignment.deadlineDate,
        deadlineZone: assignment.deadlineZone,
        lateFirst: assignment.lateFirst,
        lateRevision: assignment.lateRevision,
        classPolicyDefaults: classPolicy?.defaults as any,
      },
      isFirstSubmission
    );

    // Commit submission, attachments, receipt, and notification in one transaction
    const result = await (this.prisma as any).$transaction(async (tx: any) => {
      // Re-verify version in transaction to prevent race conditions
      if (!isFirstSubmission) {
        const raceCheck = await tx.submissionRevision.findFirst({
          where: { recipientId },
          orderBy: { version: 'desc' },
        });
        if (raceCheck && raceCheck.version !== currentVersion) {
          throw new DomainError('VERSION_CONFLICT', 412);
        }
      }

      const created = await tx.submissionRevision.create({
        data: {
          recipientId,
          version: nextVersion,
          actorId,
          acceptedAt: now,
          deadlineSnapshot: timeliness.deadlineSnapshot,
          latePolicySnapshot: timeliness.latePolicySnapshot,
          timeliness: timeliness.timeliness,
          text: input.text?.trim() ?? null,
          links: (input.links ?? []) as any,
        },
      });

      if (input.uploadIds && input.uploadIds.length > 0) {
        for (const blobId of input.uploadIds) {
          await tx.submissionAttachment.create({
            data: {
              submissionId: created.id,
              blobId,
            },
          });
        }
      }

      await tx.assignmentRecipient.update({
        where: { id: recipientId },
        data: {
          version: recipient.version + 1,
        },
      });

      const submissionDto: SubmissionDto = {
        id: created.id,
        recipientId: created.recipientId,
        version: created.version,
        acceptedAt: created.acceptedAt.toISOString(),
        timeliness: created.timeliness as 'on_time' | 'late',
        submittedBy: created.actorId,
        text: created.text,
        links: created.links as string[],
        uploadIds: input.uploadIds ?? [],
      };

      // Save operation receipt for idempotency
      await tx.operationReceipt.create({
        data: {
          actorId,
          scopeType: 'assignment_recipient',
          scopeId: recipientId,
          action: 'submission.send',
          key: idempotencyKey,
          fingerprint: bodyHash,
          status: 'committed',
          result: submissionDto as any,
        },
      });

      // Notify outbox
      await this.notificationService.notifySubmissionCreated(tx, {
        submissionId: created.id,
        recipientId,
        assignmentId: assignment.id,
        workspaceId: recipient.workspaceId,
        version: created.version,
        timeliness: created.timeliness as 'on_time' | 'late',
        actorId,
        acceptedAt: created.acceptedAt.toISOString(),
      });

      return submissionDto;
    });

    return result;
  }

  async getSubmissions(actorId: string, recipientId: string): Promise<SubmissionDto[]> {
    await this.auth.requireCanViewSubmission(actorId, recipientId);

    const revisions = await (this.prisma as any).submissionRevision.findMany({
      where: { recipientId },
      orderBy: { version: 'desc' },
    });

    const results: SubmissionDto[] = await Promise.all(
      revisions.map(async (rev: any) => {
        const attachments = await (this.prisma as any).submissionAttachment.findMany({
          where: { submissionId: rev.id },
          select: { blobId: true },
        });

        const feedbacks = await (this.prisma as any).feedback.findMany({
          where: { submissionId: rev.id },
          orderBy: { createdAt: 'asc' },
        });

        return {
          id: rev.id,
          recipientId: rev.recipientId,
          version: rev.version,
          acceptedAt: rev.acceptedAt.toISOString(),
          timeliness: rev.timeliness as 'on_time' | 'late',
          submittedBy: rev.actorId,
          text: rev.text,
          links: rev.links as string[],
          uploadIds: attachments.map((a: any) => a.blobId),
          feedback: feedbacks.map((f: any) => ({
            id: f.id,
            submissionId: f.submissionId,
            teacherId: f.teacherId,
            text: f.text,
            createdAt: f.createdAt.toISOString(),
          })),
        };
      })
    );

    return results;
  }

  async getSubmission(actorId: string, submissionId: string): Promise<SubmissionDto> {
    const revision = await (this.prisma as any).submissionRevision.findUnique({
      where: { id: submissionId },
    });
    if (!revision) {
      throw new DomainError('NOT_FOUND', 404);
    }

    await this.auth.requireCanViewSubmission(actorId, revision.recipientId);

    const attachments = await (this.prisma as any).submissionAttachment.findMany({
      where: { submissionId: revision.id },
      select: { blobId: true },
    });

    const feedbacks = await (this.prisma as any).feedback.findMany({
      where: { submissionId: revision.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      id: revision.id,
      recipientId: revision.recipientId,
      version: revision.version,
      acceptedAt: revision.acceptedAt.toISOString(),
      timeliness: revision.timeliness as 'on_time' | 'late',
      submittedBy: revision.actorId,
      text: revision.text,
      links: revision.links as string[],
      uploadIds: attachments.map((a: any) => a.blobId),
      feedback: feedbacks.map((f: any) => ({
        id: f.id,
        submissionId: f.submissionId,
        teacherId: f.teacherId,
        text: f.text,
        createdAt: f.createdAt.toISOString(),
      })),
    };
  }

  async addFeedback(actorId: string, submissionId: string, text: string): Promise<SubmissionDto> {
    if (!text || !text.trim()) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    const { submission, recipient } = await this.auth.requireCanGiveFeedback(actorId, submissionId);

    await (this.prisma as any).$transaction(async (tx: any) => {
      const fb = await tx.feedback.create({
        data: {
          submissionId,
          teacherId: actorId,
          text: text.trim(),
        },
      });

      await this.notificationService.notifyFeedbackCreated(tx, {
        feedbackId: fb.id,
        submissionId,
        recipientId: recipient.id,
        teacherId: actorId,
        text: fb.text,
        createdAt: fb.createdAt.toISOString(),
      });
    });

    return this.getSubmission(actorId, submissionId);
  }

  async updateProgress(
    actorId: string,
    recipientId: string,
    text: string,
    ifMatch: string | undefined
  ): Promise<any> {
    if (!text || !text.trim()) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    const { recipient, assignment } = await this.auth.requireCanUpdateProgress(actorId, recipientId);
    requireVersion(recipient.version, ifMatch);

    const updated = await (this.prisma as any).$transaction(async (tx: any) => {
      const rec = await tx.assignmentRecipient.update({
        where: { id: recipientId },
        data: {
          progressText: text.trim(),
          version: recipient.version + 1,
        },
      });

      await this.notificationService.notifyProgressUpdated(tx, {
        recipientId,
        assignmentId: assignment.id,
        workspaceId: rec.workspaceId,
        progressText: rec.progressText,
        updatedAt: rec.updatedAt.toISOString(),
      });

      return rec;
    });

    return {
      id: updated.id,
      assignmentId: updated.assignmentId,
      workspaceId: updated.workspaceId,
      progressText: updated.progressText,
      version: updated.version,
    };
  }
}
