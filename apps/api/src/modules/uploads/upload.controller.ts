import { Body, Controller, Headers, HttpException, Param, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DomainError } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import { UploadService, type UploadStart } from './upload-service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  async startUpload(
    @Body() body: UploadStart,
    @Headers('X-CSRF-Token') csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
      const data = await this.uploadService.start(principal, body);
      return success(data, reqId);
    } catch (err) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.code, details: {} }, requestId: reqId },
          err.status,
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        500,
      );
    }
  }

  @Put(':uploadId/content')
  async uploadContent(
    @Param('uploadId') uploadId: string,
    @Req() req: Request,
    @Headers('X-CSRF-Token') csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
      // Stream request body chunks
      const data = await this.uploadService.putContent(
        principal,
        uploadId,
        req as unknown as AsyncIterable<Uint8Array>,
      );
      return success(data, reqId);
    } catch (err) {
      if (err instanceof DomainError) {
        throw new HttpException(
          { error: { code: err.code, message: err.code, details: {} }, requestId: reqId },
          err.status,
        );
      }
      throw new HttpException(
        { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
        500,
      );
    }
  }
}
