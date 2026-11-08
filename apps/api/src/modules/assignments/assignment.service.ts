import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DomainError } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import { NotificationService } from '../notifications/notification.service';
import { AssignmentAuthService } from './assignment-auth';
import type {
  AssignmentDto,
  AssignmentInputDto,
  RecipientDto,
} from './assignment.types';

@Injectable()
export class AssignmentService {
  private readonly auth: AssignmentAuthService;

  constructor(
    @Inject(PrismaClient) private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService
  ) {
    this.auth = new AssignmentAuthService(prisma);
  }

  async createAssignment(
    actorId: string,
    classId: string,
    input: AssignmentInputDto
  ): Promise<AssignmentDto> {
    // ASG-13: title and at least one recipient workspace are required
    if (!input.title || !input.title.trim()) {
      throw new DomainError('INVALID_INPUT', 400);
    }
    if (!input.recipientWorkspaceIds || input.recipientWorkspaceIds.length === 0) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    // Mutual exclusivity check per OpenAPI spec
    if (input.deadline && input.deadlineDate) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    // Validate authorization
    await this.auth.requireCanManageClassAssignments(actorId, classId);

    // Verify all recipient workspaces belong to class and exist
    const workspaces = await (this.prisma as any).workspace.findMany({
      where: {
        id: { in: input.recipientWorkspaceIds },
        classId,
        status: 'active',
      },
    });

    if (workspaces.length !== input.recipientWorkspaceIds.length) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    const lateFirst = input.lateFirst ?? 'inherit';
    const lateRevision = input.lateRevision ?? 'inherit';

    const deadlineVal = input.deadline ? new Date(input.deadline) : null;
    const deadlineDateVal = input.deadlineDate ? new Date(`${input.deadlineDate.date}T00:00:00Z`) : null;
    const deadlineZone = input.deadlineDate?.timeZone ?? null;

    // Transactional creation of assignment and recipients
    const result = await (this.prisma as any).$transaction(async (tx: any) => {
      const assignment = await tx.assignment.create({
        data: {
          classId,
          title: input.title.trim(),
          deadline: deadlineVal,
          deadlineDate: deadlineDateVal,
          deadlineZone,
          lateFirst,
          lateRevision,
          version: 1,
        },
      });

      for (const workspaceId of input.recipientWorkspaceIds) {
        await tx.assignmentRecipient.create({
          data: {
            assignmentId: assignment.id,
            workspaceId,
            version: 1,
          },
        });
      }

      await this.notificationService.notifyAssignmentCreated(tx, {
        assignmentId: assignment.id,
        classId,
        title: assignment.title,
        recipientWorkspaceIds: input.recipientWorkspaceIds,
        createdAt: assignment.createdAt.toISOString(),
      });

      return assignment;
    });

    return {
      id: result.id,
      classId: result.classId,
      title: result.title,
      recipientWorkspaceIds: input.recipientWorkspaceIds,
      deadline: result.deadline ? result.deadline.toISOString() : undefined,
      deadlineDate: input.deadlineDate,
      lateFirst: result.lateFirst,
      lateRevision: result.lateRevision,
      version: result.version,
    };
  }

  async getAssignment(actorId: string, assignmentId: string): Promise<AssignmentDto> {
    const assignment = await this.auth.requireCanViewAssignment(actorId, assignmentId);
    const recipients = await (this.prisma as any).assignmentRecipient.findMany({
      where: { assignmentId },
      select: { workspaceId: true },
    });

    return {
      id: assignment.id,
      classId: assignment.classId,
      title: assignment.title,
      recipientWorkspaceIds: recipients.map((r: any) => r.workspaceId),
      deadline: assignment.deadline ? assignment.deadline.toISOString() : undefined,
      deadlineDate: assignment.deadlineDate && assignment.deadlineZone ? {
        date: assignment.deadlineDate.toISOString().slice(0, 10),
        timeZone: assignment.deadlineZone,
      } : undefined,
      lateFirst: assignment.lateFirst ?? 'inherit',
      lateRevision: assignment.lateRevision ?? 'inherit',
      version: assignment.version,
    };
  }

  async listAssignments(
    actorId: string,
    classId: string,
    options: { cursor?: string; limit?: number } = {}
  ): Promise<{ data: AssignmentDto[]; nextCursor?: string }> {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);

    const assignments = await (this.prisma as any).assignment.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: options.cursor ? { id: options.cursor } : undefined,
      skip: options.cursor ? 1 : 0,
    });

    const hasNext = assignments.length > limit;
    const items = hasNext ? assignments.slice(0, limit) : assignments;
    const nextCursor = hasNext ? items[items.length - 1].id : undefined;

    const assignmentDtos: AssignmentDto[] = await Promise.all(
      items.map(async (asg: any) => {
        const recipients = await (this.prisma as any).assignmentRecipient.findMany({
          where: { assignmentId: asg.id },
          select: { workspaceId: true },
        });
        return {
          id: asg.id,
          classId: asg.classId,
          title: asg.title,
          recipientWorkspaceIds: recipients.map((r: any) => r.workspaceId),
          deadline: asg.deadline ? asg.deadline.toISOString() : undefined,
          deadlineDate: asg.deadlineDate && asg.deadlineZone ? {
            date: asg.deadlineDate.toISOString().slice(0, 10),
            timeZone: asg.deadlineZone,
          } : undefined,
          lateFirst: asg.lateFirst ?? 'inherit',
          lateRevision: asg.lateRevision ?? 'inherit',
          version: asg.version,
        };
      })
    );

    return { data: assignmentDtos, nextCursor };
  }

  async updateAssignment(
    actorId: string,
    assignmentId: string,
    input: AssignmentInputDto,
    ifMatch: string | undefined
  ): Promise<AssignmentDto> {
    const existing = await (this.prisma as any).assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!existing) {
      throw new DomainError('NOT_FOUND', 404);
    }

    requireVersion(existing.version, ifMatch);
    await this.auth.requireCanManageClassAssignments(actorId, existing.classId);

    if (input.deadline && input.deadlineDate) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    const updated = await (this.prisma as any).$transaction(async (tx: any) => {
      const dataToUpdate: any = {
        version: existing.version + 1,
      };

      if (input.title && input.title.trim()) {
        dataToUpdate.title = input.title.trim();
      }

      if (input.deadline !== undefined) {
        dataToUpdate.deadline = input.deadline ? new Date(input.deadline) : null;
        dataToUpdate.deadlineDate = null;
        dataToUpdate.deadlineZone = null;
      } else if (input.deadlineDate !== undefined) {
        dataToUpdate.deadlineDate = input.deadlineDate ? new Date(`${input.deadlineDate.date}T00:00:00Z`) : null;
        dataToUpdate.deadlineZone = input.deadlineDate?.timeZone ?? null;
        dataToUpdate.deadline = null;
      }

      if (input.lateFirst !== undefined) {
        dataToUpdate.lateFirst = input.lateFirst;
      }
      if (input.lateRevision !== undefined) {
        dataToUpdate.lateRevision = input.lateRevision;
      }

      const res = await tx.assignment.update({
        where: { id: assignmentId },
        data: dataToUpdate,
      });

      // If recipientWorkspaceIds provided, update recipients
      if (input.recipientWorkspaceIds && input.recipientWorkspaceIds.length > 0) {
        // Find existing recipients
        const currentRecipients = await tx.assignmentRecipient.findMany({
          where: { assignmentId },
        });
        const currentWsIds = new Set(currentRecipients.map((r: any) => r.workspaceId));
        for (const wsId of input.recipientWorkspaceIds) {
          if (!currentWsIds.has(wsId)) {
            await tx.assignmentRecipient.create({
              data: {
                assignmentId,
                workspaceId: wsId,
                version: 1,
              },
            });
          }
        }
      }

      // ASG-08: Log audit if deadline changed
      if (
        (dataToUpdate.deadline !== undefined && dataToUpdate.deadline?.getTime() !== existing.deadline?.getTime()) ||
        (dataToUpdate.deadlineDate !== undefined && dataToUpdate.deadlineDate?.getTime() !== existing.deadlineDate?.getTime())
      ) {
        await tx.auditEvent.create({
          data: {
            actorId,
            scopeType: 'assignment',
            scopeId: assignmentId,
            action: 'assignment.deadline_changed',
            targetId: assignmentId,
          },
        });
      }

      await this.notificationService.notifyAssignmentUpdated(tx, {
        assignmentId,
        classId: existing.classId,
        title: res.title,
        deadline: res.deadline?.toISOString() ?? null,
        updatedAt: res.updatedAt.toISOString(),
      });

      return res;
    });

    const recipients = await (this.prisma as any).assignmentRecipient.findMany({
      where: { assignmentId },
      select: { workspaceId: true },
    });

    return {
      id: updated.id,
      classId: updated.classId,
      title: updated.title,
      recipientWorkspaceIds: recipients.map((r: any) => r.workspaceId),
      deadline: updated.deadline ? updated.deadline.toISOString() : undefined,
      deadlineDate: updated.deadlineDate && updated.deadlineZone ? {
        date: updated.deadlineDate.toISOString().slice(0, 10),
        timeZone: updated.deadlineZone,
      } : undefined,
      lateFirst: updated.lateFirst ?? 'inherit',
      lateRevision: updated.lateRevision ?? 'inherit',
      version: updated.version,
    };
  }

  async archiveAssignment(
    actorId: string,
    assignmentId: string,
    ifMatch: string | undefined
  ): Promise<{ ok: boolean }> {
    const existing = await (this.prisma as any).assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!existing) {
      throw new DomainError('NOT_FOUND', 404);
    }

    requireVersion(existing.version, ifMatch);
    await this.auth.requireCanManageClassAssignments(actorId, existing.classId);

    // ASG-10: Keep assignment and submissions in DB for history lookup
    await (this.prisma as any).$transaction(async (tx: any) => {
      await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          version: existing.version + 1,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId,
          scopeType: 'assignment',
          scopeId: assignmentId,
          action: 'assignment.archived',
          targetId: assignmentId,
        },
      });

      await this.notificationService.notifyAssignmentArchived(tx, {
        assignmentId,
        classId: existing.classId,
        archivedAt: new Date().toISOString(),
      });
    });

    return { ok: true };
  }

  async listRecipients(
    actorId: string,
    assignmentId: string,
    options: { cursor?: string; limit?: number } = {}
  ): Promise<{ data: RecipientDto[]; nextCursor?: string }> {
    await this.auth.requireCanViewAssignment(actorId, assignmentId);

    const recipients = await (this.prisma as any).assignmentRecipient.findMany({
      where: { assignmentId },
      orderBy: { createdAt: 'asc' },
    });

    const dtos: RecipientDto[] = await Promise.all(
      recipients.map(async (r: any) => {
        // Find latest submission revision if any
        const latestRev = await (this.prisma as any).submissionRevision.findFirst({
          where: { recipientId: r.id },
          orderBy: { version: 'desc' },
          select: { version: true },
        });

        return {
          id: r.id,
          assignmentId: r.assignmentId,
          workspaceId: r.workspaceId,
          submissionVersion: latestRev ? latestRev.version : undefined,
          progressText: r.progressText ?? undefined,
          version: r.version,
        };
      })
    );

    return { data: dtos };
  }
}
