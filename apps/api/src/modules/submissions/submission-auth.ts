import type { PrismaClient } from '@prisma/client';
import { DomainError } from '../../core/authorization';

export class SubmissionAuthService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Check if caller can submit/edit submission for the recipient workspace.
   * ASG-03: Trưởng nhóm chính mặc định được Nộp và sửa bản nộp. Giáo viên có thể cấp riêng cho thành viên khác.
   * Class owner does NOT submit for the group.
   */
  async requireCanSubmit(actorId: string, recipientId: string): Promise<{ recipient: any; assignment: any }> {
    const recipient = await (this.prisma as any).assignmentRecipient.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const assignment = await (this.prisma as any).assignment.findUnique({
      where: { id: recipient.assignmentId },
    });
    if (!assignment) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const workspace = await (this.prisma as any).workspace.findUnique({
      where: { id: recipient.workspaceId },
    });
    if (!workspace || workspace.status === 'archived') {
      throw new DomainError('FORBIDDEN', 403);
    }

    // Class owner does NOT submit for the group per policy:
    // allows(actor, 'submission.send', { ...recipient, classOwner: true }) === false
    const cls = await (this.prisma as any).class.findUnique({
      where: { id: assignment.classId },
    });
    if (cls && cls.ownerId === actorId) {
      throw new DomainError('FORBIDDEN', 403);
    }

    // Check if actor is workspace leader or workspace owner
    if (workspace.ownerId === actorId) {
      return { recipient, assignment };
    }

    const membership = await (this.prisma as any).workspaceMembership.findFirst({
      where: {
        workspaceId: workspace.id,
        accountId: actorId,
        status: 'active',
      },
    });

    if (membership && membership.role === 'leader') {
      return { recipient, assignment };
    }

    // Check specific grant for submission.send
    const grant = await (this.prisma as any).grant.findFirst({
      where: {
        principalId: actorId,
        action: 'submission.send',
        revokedAt: null,
        OR: [
          { scopeType: 'workspace', scopeId: workspace.id },
          { scopeType: 'assignment', scopeId: assignment.id },
        ],
      },
    });

    if (grant) {
      return { recipient, assignment };
    }

    throw new DomainError('FORBIDDEN', 403);
  }

  /**
   * Check if caller can view submission revisions of this recipient.
   * ASG-11: Teacher and group members can view. Other groups cannot without grant.
   */
  async requireCanViewSubmission(actorId: string, recipientId: string): Promise<{ recipient: any; assignment: any }> {
    const recipient = await (this.prisma as any).assignmentRecipient.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const assignment = await (this.prisma as any).assignment.findUnique({
      where: { id: recipient.assignmentId },
    });
    if (!assignment) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const cls = await (this.prisma as any).class.findUnique({
      where: { id: assignment.classId },
    });

    // Class owner / teacher can view all
    if (cls && cls.ownerId === actorId) {
      return { recipient, assignment };
    }

    // Workspace member can view their group's submissions
    const membership = await (this.prisma as any).workspaceMembership.findFirst({
      where: {
        workspaceId: recipient.workspaceId,
        accountId: actorId,
        status: 'active',
      },
    });

    if (membership) {
      return { recipient, assignment };
    }

    // Check explicit grant to view other group's data
    const grant = await (this.prisma as any).grant.findFirst({
      where: {
        principalId: actorId,
        action: 'submission.read',
        revokedAt: null,
        OR: [
          { scopeType: 'workspace', scopeId: recipient.workspaceId },
          { scopeType: 'assignment', scopeId: assignment.id },
        ],
      },
    });

    if (grant) {
      return { recipient, assignment };
    }

    throw new DomainError('FORBIDDEN', 403);
  }

  /**
   * Check if caller can give feedback (ASG-09: teacher only).
   */
  async requireCanGiveFeedback(actorId: string, submissionId: string): Promise<any> {
    const submission = await (this.prisma as any).submissionRevision.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const recipient = await (this.prisma as any).assignmentRecipient.findUnique({
      where: { id: submission.recipientId },
    });
    if (!recipient) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const assignment = await (this.prisma as any).assignment.findUnique({
      where: { id: recipient.assignmentId },
    });
    if (!assignment) {
      throw new DomainError('NOT_FOUND', 404);
    }

    const cls = await (this.prisma as any).class.findUnique({
      where: { id: assignment.classId },
    });

    if (cls && cls.ownerId === actorId) {
      return { submission, recipient, assignment };
    }

    const grant = await (this.prisma as any).grant.findFirst({
      where: {
        principalId: actorId,
        scopeType: 'class',
        scopeId: assignment.classId,
        action: { in: ['assignment.manage', 'feedback.create'] },
        revokedAt: null,
      },
    });

    if (grant) {
      return { submission, recipient, assignment };
    }

    throw new DomainError('FORBIDDEN', 403);
  }

  /**
   * Check if caller can update progress text (ASG-11).
   */
  async requireCanUpdateProgress(actorId: string, recipientId: string): Promise<any> {
    return this.requireCanSubmit(actorId, recipientId);
  }
}
