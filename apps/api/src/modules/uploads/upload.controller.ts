import { Body, Controller, HttpException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { IncomingMessage } from 'node:http';
import { DomainError } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import { UploadService, type UploadStart } from './upload-service';
import { LibrarySessionGuard, libraryPrincipal, type LibraryRequest } from '../library/library-session.guard';

@Controller('uploads')
@UseGuards(LibrarySessionGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  async startUpload(
    @Body() body: UploadStart,
    @Req() req: LibraryRequest,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
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
    @Req() req: IncomingMessage,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req as LibraryRequest);
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
