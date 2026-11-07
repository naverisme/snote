import type { PrismaClient } from '@prisma/client';
import { DomainError } from '../../core/authorization';

export class AssignmentAuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async requireCanManageClassAssignments(actorId: string, classId: string): Promise<void> {
    const cls = await (this.prisma as any).class.findUnique({
      where: { id: classId },
      include: {
        memberships: {
          where: { accountId: actorId, status: 'active' },
        },
      },
    });

    if (!cls) {
      throw new DomainError('NOT_FOUND', 404);
    }

    if (cls.status === 'archived') {
      throw new DomainError('ARCHIVED', 409);
    }

    // Owner always has management rights
    if (cls.ownerId === actorId) {
      return;
    }

    // Check grants
    const grant = await (this.prisma as any).grant.findFirst({
      where: {
        principalId: actorId,
        scopeType: 'class',
        scopeId: classId,
        action: { in: ['assignment.create', 'assignment.manage'] },
        revokedAt: null,
      },
    });

    if (grant) {
      return;
    }

    throw new DomainError('FORBIDDEN', 403);
  }

  async requireCanViewAssignment(actorId: string, assignmentId: string): Promise<any> {
    const assignment = await (this.prisma as any).assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const cls = await (this.prisma as any).class.findUnique({
      where: { id: assignment.classId },
    });

    if (!cls) {
      throw new DomainError('NOT_FOUND', 404);
    }

    // Class owner can view
    if (cls.ownerId === actorId) {
      return assignment;
    }

    // Class active member can view assignments
    const classMember = await (this.prisma as any).classMembership.findFirst({
      where: {
        classId: cls.id,
        accountId: actorId,
        status: 'active',
      },
    });

    if (classMember) {
      return assignment;
    }

    // Workspace member of any recipient workspace
    const recipient = await (this.prisma as any).assignmentRecipient.findFirst({
      where: { assignmentId },
    });

    if (recipient) {
      const wsMember = await (this.prisma as any).workspaceMembership.findFirst({
        where: {
          workspaceId: recipient.workspaceId,
          accountId: actorId,
          status: 'active',
        },
      });
      if (wsMember) {
        return assignment;
      }
    }

    throw new DomainError('FORBIDDEN', 403);
  }
}
