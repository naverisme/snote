import {
  Controller,
  Inject,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { getSession, requireAuthAndCsrf, type Request } from '../identity/http-utils';
import type { SessionPort } from '../../core/http';
import { DomainError } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import { AssignmentService } from './assignment.service';
import type {
  AssignmentInputDto,
  AssignmentListResultDto,
  AssignmentResultDto,
  CommandResultDto,
  RecipientListResultDto,
} from './assignment.types';

@Controller()
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post('/classes/:classId/assignments')
  async createAssignment(
    @Param('classId') classId: string,
    @Body() body: AssignmentInputDto,
    @Req() req: Request
  ): Promise<AssignmentResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await requireAuthAndCsrf(req, this.sessionPort)).accountId;
      const data = await this.assignmentService.createAssignment(actorId, classId, body);
      return success(data, reqId);
    } catch (err: any) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.message, details: {} }, requestId: reqId },
          err.status
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/classes/:classId/assignments')
  async listAssignments(
    @Param('classId') classId: string,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: Request
  ): Promise<AssignmentListResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await getSession(req, this.sessionPort)).accountId;
      const parsedLimit = limit ? parseInt(limit, 10) : undefined;
      const res = await this.assignmentService.listAssignments(actorId, classId, {
        cursor,
        limit: parsedLimit,
      });
      return {
        data: res.data,
        nextCursor: res.nextCursor,
        requestId: reqId,
      };
    } catch (err: any) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.message, details: {} }, requestId: reqId },
          err.status
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/assignments/:assignmentId')
  async getAssignment(
    @Param('assignmentId') assignmentId: string,
    @Req() req: Request
  ): Promise<AssignmentResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await getSession(req, this.sessionPort)).accountId;
      const data = await this.assignmentService.getAssignment(actorId, assignmentId);
      return success(data, reqId);
    } catch (err: any) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.message, details: {} }, requestId: reqId },
          err.status
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('/assignments/:assignmentId')
  async updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() body: AssignmentInputDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Req() req: Request
  ): Promise<AssignmentResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await requireAuthAndCsrf(req, this.sessionPort)).accountId;
      const data = await this.assignmentService.updateAssignment(actorId, assignmentId, body, ifMatch);
      return success(data, reqId);
    } catch (err: any) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.message, details: {} }, requestId: reqId },
          err.status
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/assignments/:assignmentId/archive')
  async archiveAssignment(
    @Param('assignmentId') assignmentId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Req() req: Request
  ): Promise<CommandResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await requireAuthAndCsrf(req, this.sessionPort)).accountId;
      const data = await this.assignmentService.archiveAssignment(actorId, assignmentId, ifMatch);
      return success(data, reqId);
    } catch (err: any) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.message, details: {} }, requestId: reqId },
          err.status
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/assignments/:assignmentId/recipients')
  async listRecipients(
    @Param('assignmentId') assignmentId: string,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: Request
  ): Promise<RecipientListResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await getSession(req, this.sessionPort)).accountId;
      const parsedLimit = limit ? parseInt(limit, 10) : undefined;
      const res = await this.assignmentService.listRecipients(actorId, assignmentId, {
        cursor,
        limit: parsedLimit,
      });
      return {
        data: res.data,
        nextCursor: res.nextCursor,
        requestId: reqId,
      };
    } catch (err: any) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.message, details: {} }, requestId: reqId },
          err.status
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
