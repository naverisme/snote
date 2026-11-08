import {
  Controller,
  Inject,
  Get,
  Post,
  Param,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { DomainError } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import type { SessionPort } from '../../core/http';
import { getSession, requireAuthAndCsrf, type Request } from '../identity/http-utils';
import { SubmissionService } from './submission.service';
import type {
  FeedbackInputDto,
  SubmissionInputDto,
  SubmissionListResultDto,
  SubmissionResultDto,
  UpdateInputDto,
} from './submission.types';

@Controller()
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  @Post('/assignment-recipients/:recipientId/submissions')
  async submit(
    @Param('recipientId') recipientId: string,
    @Body() body: SubmissionInputDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
    @Req() req: Request
  ): Promise<SubmissionResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await requireAuthAndCsrf(req, this.sessionPort)).accountId;
      if (!idempotencyKey) {
        throw new HttpException(
          { error: { code: 'INVALID_INPUT', message: 'Missing Idempotency-Key header', details: {} }, requestId: reqId },
          HttpStatus.BAD_REQUEST
        );
      }
      const data = await this.submissionService.submit(
        actorId,
        recipientId,
        body,
        idempotencyKey,
        ifMatch
      );
      return success(data, reqId);
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
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

  @Get('/assignment-recipients/:recipientId/submissions')
  async getSubmissions(
    @Param('recipientId') recipientId: string,
    @Req() req: Request
  ): Promise<SubmissionListResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await getSession(req, this.sessionPort)).accountId;
      const data = await this.submissionService.getSubmissions(actorId, recipientId);
      return {
        data,
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

  @Get('/submissions/:submissionId')
  async getSubmission(
    @Param('submissionId') submissionId: string,
    @Req() req: Request
  ): Promise<SubmissionResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await getSession(req, this.sessionPort)).accountId;
      const data = await this.submissionService.getSubmission(actorId, submissionId);
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

  @Post('/submissions/:submissionId/feedback')
  async addFeedback(
    @Param('submissionId') submissionId: string,
    @Body() body: FeedbackInputDto,
    @Req() req: Request
  ): Promise<SubmissionResultDto> {
    const reqId = requestId();
    try {
      const actorId = (await requireAuthAndCsrf(req, this.sessionPort)).accountId;
      const data = await this.submissionService.addFeedback(actorId, submissionId, body.text);
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

  @Post('/assignment-recipients/:recipientId/updates')
  async updateProgress(
    @Param('recipientId') recipientId: string,
    @Body() body: UpdateInputDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Req() req: Request
  ): Promise<any> {
    const reqId = requestId();
    try {
      const actorId = (await requireAuthAndCsrf(req, this.sessionPort)).accountId;
      const data = await this.submissionService.updateProgress(actorId, recipientId, body.text, ifMatch);
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
}
