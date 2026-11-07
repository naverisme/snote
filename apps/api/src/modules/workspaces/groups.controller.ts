import { Body, Controller, Get, Inject, Param, Patch, Post, Req, Res } from '@nestjs/common';
import type { components } from '@snote/contracts';
import { WorkspaceService } from './workspace-service';
import { AdmissionService } from '../classes/admission';
import { getSession, replySuccess, requireAuthAndCsrf, type Request, type Response } from '../identity/http-utils';
import type { SessionPort } from '../../core/http';

type GroupCreate = components['schemas']['GroupCreate'];
type InvitationCreate = components['schemas']['InvitationCreate'];
type LeaderChange = components['schemas']['LeaderChange'];
type Handover = components['schemas']['Handover'];
type RemoveMember = components['schemas']['RemoveMember'];

@Controller('classes/:classId/groups')
export class ClassGroupsController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Get()
  async list(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const groups = await this.workspaceService.listClassGroups(session.accountId, classId);
    return replySuccess(res, groups);
  }

  @Post()
  async create(
    @Param('classId') classId: string,
    @Body() body: GroupCreate,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const group = await this.workspaceService.createClassGroup(session.accountId, classId, body);
    return replySuccess(res, group, group.version);
  }
}

@Controller('groups/:groupId')
export class GroupsController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Get('members')
  async listMembers(@Param('groupId') groupId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const members = await this.workspaceService.listWorkspaceMembers(session.accountId, groupId);
    return replySuccess(res, members);
  }

  @Post('invitations')
  async createInvitation(
    @Param('groupId') groupId: string,
    @Body() body: InvitationCreate,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const inv = await this.workspaceService.createGroupInvitation(session.accountId, groupId, body.inviteeId);
    return replySuccess(res, inv, inv.version);
  }

  @Post('join-requests')
  async createJoinRequest(@Param('groupId') groupId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const reqResult = await this.workspaceService.createGroupJoinRequest(session.accountId, groupId);
    return replySuccess(res, reqResult, reqResult.version);
  }

  @Get('join-requests')
  async listJoinRequests(@Param('groupId') groupId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const list = await this.workspaceService.listGroupJoinRequests(session.accountId, groupId);
    return replySuccess(res, list);
  }

  @Patch('leader')
  async changeLeader(
    @Param('groupId') groupId: string,
    @Body() body: LeaderChange,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const member = await this.workspaceService.changeGroupLeader(session.accountId, groupId, body.leaderId, ifMatch);
    return replySuccess(res, member, member.version);
  }

  @Post('leave')
  async leave(
    @Param('groupId') groupId: string,
    @Body() body: Handover,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const member = await this.workspaceService.leaveGroup(session.accountId, groupId, body.handoverTo, ifMatch);
    return replySuccess(res, member, member.version);
  }

  @Post('remove-member')
  async removeMember(
    @Param('groupId') groupId: string,
    @Body() body: RemoveMember,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const member = await this.workspaceService.removeGroupMember(session.accountId, groupId, body.memberId, body.handoverTo, ifMatch);
    return replySuccess(res, member, member.version);
  }
}

@Controller('group-invitations')
export class GroupInvitationsController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly admissionService: AdmissionService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post(':invitationId/accept')
  async accept(@Param('invitationId') invitationId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const membership = await this.admissionService.acceptInvitation({ accountId: session.accountId }, invitationId);
    const inv = {
      id: invitationId,
      targetType: 'workspace' as const,
      targetId: (membership as { workspaceId?: string }).workspaceId ?? '',
      initiatorId: session.accountId,
      recipientId: session.accountId,
      status: 'accepted' as const,
      version: (membership as { version?: number }).version ?? 1,
    };
    return replySuccess(res, inv, inv.version);
  }

  @Post(':invitationId/decline')
  async decline(@Param('invitationId') invitationId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const inv = await this.workspaceService.declineGroupInvitation(session.accountId, invitationId, ifMatch);
    return replySuccess(res, inv, inv.version);
  }
}

@Controller('group-join-requests')
export class GroupJoinRequestsController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly admissionService: AdmissionService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post(':requestId/approve')
  async approve(@Param('requestId') requestId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const membership = await this.admissionService.approveRequest({ accountId: session.accountId }, requestId);
    const reqResult = {
      id: requestId,
      targetType: 'workspace' as const,
      targetId: (membership as { workspaceId?: string }).workspaceId ?? '',
      initiatorId: membership.accountId,
      status: 'approved' as const,
      version: (membership as { version?: number }).version ?? 1,
    };
    return replySuccess(res, reqResult, reqResult.version);
  }

  @Post(':requestId/decline')
  async decline(@Param('requestId') requestId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const reqResult = await this.workspaceService.declineGroupJoinRequest(session.accountId, requestId, ifMatch);
    return replySuccess(res, reqResult, reqResult.version);
  }
}
