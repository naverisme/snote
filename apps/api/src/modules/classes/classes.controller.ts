import { Body, Controller, Get, Inject, Param, Patch, Post, Req, Res } from '@nestjs/common';
import type { components } from '@snote/contracts';
import { ClassService } from './class-service';
import { AdmissionService } from './admission';
import { getSession, replySuccess, requireAuthAndCsrf, type Request, type Response } from '../identity/http-utils';
import type { SessionPort } from '../../core/http';

type ClassCreate = components['schemas']['ClassCreate'];
type ClassRoleChange = components['schemas']['ClassRoleChange'];
type JoinCode = components['schemas']['JoinCode'];
type JoinClass = components['schemas']['JoinClass'];
type InvitationCreate = components['schemas']['InvitationCreate'];
type Transfer = components['schemas']['Transfer'];
type Policy = components['schemas']['Policy'];
type Handover = components['schemas']['Handover'];
type RemoveMember = components['schemas']['RemoveMember'];

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classService: ClassService,
    private readonly admissionService: AdmissionService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Get()
  async list(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const classes = await this.classService.list(session.accountId);
    return replySuccess(res, classes);
  }

  @Post()
  async create(@Body() body: ClassCreate, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const cls = await this.classService.create(session.accountId, body);
    return replySuccess(res, cls, cls.version);
  }

  @Get(':classId')
  async get(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const cls = await this.classService.get(session.accountId, classId);
    return replySuccess(res, cls, cls.version);
  }

  @Get(':classId/members')
  async listMembers(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const members = await this.classService.listMembers(session.accountId, classId);
    return replySuccess(res, members);
  }

  @Patch(':classId/members/:membershipId/role')
  async changeMemberRole(
    @Param('classId') classId: string,
    @Param('membershipId') membershipId: string,
    @Body() body: ClassRoleChange,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const member = await this.classService.changeMemberRole(session.accountId, classId, membershipId, body.role, ifMatch);
    return replySuccess(res, member, member.version);
  }

  @Get(':classId/join-requests')
  async listJoinRequests(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const requests = await this.classService.listJoinRequests(session.accountId, classId);
    return replySuccess(res, requests);
  }

  @Post(':classId/join-requests')
  async createJoinRequest(
    @Param('classId') classId: string,
    @Body() body: JoinClass,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const request = await this.classService.createJoinRequest(session.accountId, classId, body.code);
    return replySuccess(res, request, request.version);
  }

  @Post(':classId/archive')
  async archive(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const cls = await this.classService.setArchived(session.accountId, classId, true, ifMatch);
    return replySuccess(res, cls, cls.version);
  }

  @Post(':classId/restore')
  async restore(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const cls = await this.classService.setArchived(session.accountId, classId, false, ifMatch);
    return replySuccess(res, cls, cls.version);
  }

  @Get(':classId/join-code')
  async getJoinCode(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const state = await this.classService.getJoinCode(session.accountId, classId);
    return replySuccess(res, state, state.version);
  }

  @Post(':classId/join-code')
  async setJoinCode(
    @Param('classId') classId: string,
    @Body() body: JoinCode,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const state = await this.classService.setJoinCode(session.accountId, classId, body.enabled, ifMatch);
    return replySuccess(res, state, state.version);
  }

  @Post(':classId/invitations')
  async createInvitation(
    @Param('classId') classId: string,
    @Body() body: InvitationCreate,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const invitation = await this.classService.createInvitation(session.accountId, classId, body.inviteeId);
    return replySuccess(res, invitation, invitation.version);
  }

  @Post(':classId/leave')
  async leave(
    @Param('classId') classId: string,
    @Body() body: Handover,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const membership = await this.classService.leaveClass(session.accountId, classId, body.handoverTo, ifMatch);
    return replySuccess(res, membership, membership.version);
  }

  @Post(':classId/remove-member')
  async removeMember(
    @Param('classId') classId: string,
    @Body() body: RemoveMember,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const membership = await this.classService.removeMember(session.accountId, classId, body.memberId, ifMatch);
    return replySuccess(res, membership, membership.version);
  }

  @Post(':classId/ownership-transfers')
  async createTransfer(
    @Param('classId') classId: string,
    @Body() body: Transfer,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const transfer = await this.classService.createOwnershipTransfer(session.accountId, classId, body.recipientId);
    return replySuccess(res, transfer, transfer.version);
  }

  @Get(':classId/policy')
  async getPolicy(@Param('classId') classId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const policy = await this.classService.getPolicy(session.accountId, classId);
    return replySuccess(res, policy);
  }

  @Patch(':classId/policy')
  async updatePolicy(
    @Param('classId') classId: string,
    @Body() body: Policy,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const policy = await this.classService.updatePolicy(session.accountId, classId, body, ifMatch);
    return replySuccess(res, policy);
  }
}

@Controller('class-invitations')
export class ClassInvitationsController {
  constructor(
    private readonly classService: ClassService,
    private readonly admissionService: AdmissionService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post(':invitationId/accept')
  async accept(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const membership = await this.admissionService.acceptInvitation({ accountId: session.accountId }, invitationId);
    const inv = {
      id: invitationId,
      targetType: 'class' as const,
      targetId: (membership as { classId?: string }).classId ?? '',
      initiatorId: session.accountId,
      recipientId: session.accountId,
      status: 'accepted' as const,
      version: (membership as { version?: number }).version ?? 1,
    };
    return replySuccess(res, inv, inv.version);
  }

  @Post(':invitationId/decline')
  async decline(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const inv = await this.classService.declineInvitation(session.accountId, invitationId, ifMatch);
    return replySuccess(res, inv, inv.version);
  }
}

@Controller('class-join-requests')
export class ClassJoinRequestsController {
  constructor(
    private readonly classService: ClassService,
    private readonly admissionService: AdmissionService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post(':requestId/approve')
  async approve(
    @Param('requestId') requestId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const membership = await this.admissionService.approveRequest({ accountId: session.accountId }, requestId);
    const joinReq = {
      id: requestId,
      targetType: 'class' as const,
      targetId: (membership as { classId?: string }).classId ?? '',
      initiatorId: membership.accountId,
      status: 'approved' as const,
      version: (membership as { version?: number }).version ?? 1,
    };
    return replySuccess(res, joinReq, joinReq.version);
  }

  @Post(':requestId/decline')
  async decline(
    @Param('requestId') requestId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const reqResult = await this.classService.declineJoinRequest(session.accountId, requestId, ifMatch);
    return replySuccess(res, reqResult, reqResult.version);
  }
}
