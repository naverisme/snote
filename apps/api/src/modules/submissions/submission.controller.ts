import {
  Controller,
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
import { SubmissionService } from './submission.service';
import type {
  FeedbackInputDto,
  SubmissionInputDto,
  SubmissionListResultDto,
  SubmissionResultDto,
  UpdateInputDto,
} from './submission.types';

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  user?: { accountId: string };
}

@Controller()
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  private extractActorId(req: RequestLike): string {
    return req.user?.accountId || (req.headers['x-actor-id'] as string) || 'student-leader-1';
  }

  @Post('/assignment-recipients/:recipientId/submissions')
  async submit(
    @Param('recipientId') recipientId: string,
    @Body() body: SubmissionInputDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-csrf-token') csrfToken: string | undefined,
    @Req() req: RequestLike
  ): Promise<SubmissionResultDto> {
    const reqId = requestId();
    const actorId = this.extractActorId(req);

    if (!idempotencyKey) {
      throw new HttpException(
        { error: { code: 'INVALID_INPUT', message: 'Missing Idempotency-Key header', details: {} }, requestId: reqId },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const data = await this.submissionService.submit(
        actorId,
        recipientId,
        body,
        idempotencyKey,
        ifMatch
      );
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

  @Get('/assignment-recipients/:recipientId/submissions')
  async getSubmissions(
    @Param('recipientId') recipientId: string,
    @Req() req: RequestLike
  ): Promise<SubmissionListResultDto> {
    const reqId = requestId();
    const actorId = this.extractActorId(req);

    try {
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
    @Req() req: RequestLike
  ): Promise<SubmissionResultDto> {
    const reqId = requestId();
    const actorId = this.extractActorId(req);

    try {
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
    @Headers('x-csrf-token') csrfToken: string | undefined,
    @Req() req: RequestLike
  ): Promise<SubmissionResultDto> {
    const reqId = requestId();
    const actorId = this.extractActorId(req);

    try {
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
    @Headers('x-csrf-token') csrfToken: string | undefined,
    @Req() req: RequestLike
  ): Promise<any> {
    const reqId = requestId();
    const actorId = this.extractActorId(req);

    try {
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
