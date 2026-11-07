import { Body, Controller, Get, Inject, Param, Post, Req, Res } from '@nestjs/common';
import type { components } from '@snote/contracts';
import { WorkspaceService } from './workspace-service';
import { AdmissionService } from '../classes/admission';
import { getSession, replySuccess, requireAuthAndCsrf, type Request, type Response } from '../identity/http-utils';
import type { SessionPort } from '../../core/http';

type GroupCreate = components['schemas']['GroupCreate'];
type InvitationCreate = components['schemas']['InvitationCreate'];
type Transfer = components['schemas']['Transfer'];
type Handover = components['schemas']['Handover'];

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Get()
  async list(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const list = await this.workspaceService.listWorkspaces(session.accountId);
    return replySuccess(res, list);
  }

  @Post()
  async create(@Body() body: GroupCreate, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ws = await this.workspaceService.createWorkspace(session.accountId, body);
    return replySuccess(res, ws, ws.version);
  }

  @Get(':workspaceId')
  async get(@Param('workspaceId') workspaceId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const ws = await this.workspaceService.getWorkspace(session.accountId, workspaceId);
    return replySuccess(res, ws, ws.version);
  }

  @Get(':workspaceId/members')
  async listMembers(@Param('workspaceId') workspaceId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await getSession(req, this.sessionPort);
    const members = await this.workspaceService.listWorkspaceMembers(session.accountId, workspaceId);
    return replySuccess(res, members);
  }

  @Post(':workspaceId/invitations')
  async createInvitation(
    @Param('workspaceId') workspaceId: string,
    @Body() body: InvitationCreate,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const inv = await this.workspaceService.createWorkspaceInvitation(session.accountId, workspaceId, body.inviteeId);
    return replySuccess(res, inv, inv.version);
  }

  @Post(':workspaceId/leave')
  async leave(
    @Param('workspaceId') workspaceId: string,
    @Body() body: Handover,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string | undefined;
    const member = await this.workspaceService.leaveGroup(session.accountId, workspaceId, body.handoverTo, ifMatch);
    return replySuccess(res, member, member.version);
  }

  @Post(':workspaceId/archive')
  async archive(
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const ws = await this.workspaceService.archiveWorkspace(session.accountId, workspaceId, ifMatch);
    return replySuccess(res, ws, ws.version);
  }

  @Post(':workspaceId/restore')
  async restore(
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const ws = await this.workspaceService.restoreWorkspace(session.accountId, workspaceId, ifMatch);
    return replySuccess(res, ws, ws.version);
  }

  @Post(':workspaceId/ownership-transfers')
  async createTransfer(
    @Param('workspaceId') workspaceId: string,
    @Body() body: Transfer,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const transfer = await this.workspaceService.createWorkspaceTransfer(session.accountId, workspaceId, body.recipientId);
    return replySuccess(res, transfer, transfer.version);
  }
}

@Controller('workspace-invitations')
export class WorkspaceInvitationsController {
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

@Controller('ownership-transfers')
export class OwnershipTransfersController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post(':transferId/accept')
  async accept(@Param('transferId') transferId: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    const ifMatch = req.headers['if-match'] as string;
    const transfer = await this.workspaceService.acceptTransfer(session.accountId, transferId, ifMatch);
    return replySuccess(res, transfer, transfer.version);
  }
}
