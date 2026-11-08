import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
interface ResponseLike {
  setHeader(name: string, value: string): void;
}
import { DomainError, type Principal } from '../../core/authorization';
import { requestId, success, type SessionPort } from '../../core/http';
import { getSession, requireAuthAndCsrf, type Request } from '../identity/http-utils';
import { CalendarService } from './calendar.service';
import type { EventInput, EventListResult, EventResult } from './calendar.types';

@Controller()
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    @Inject('SESSION_PORT') private readonly sessionPort: SessionPort,
  ) {}

  private async getPrincipal(req: Request): Promise<Principal> {
    const session = await getSession(req, this.sessionPort);
    return { accountId: session.accountId };
  }

  private async verifyCsrf(req: Request): Promise<Principal> {
    const session = await requireAuthAndCsrf(req, this.sessionPort);
    return { accountId: session.accountId };
  }

  private handleError(error: unknown, reqId: string): never {
    if (error instanceof DomainError) {
      throw new HttpException(
        { error: { code: error.code, message: error.code, details: {} }, requestId: reqId },
        error.status,
      );
    }
    throw new HttpException(
      { error: { code: 'INTERNAL_ERROR', message: String(error), details: {} }, requestId: reqId },
      500,
    );
  }

  @Get('/me/events')
  async getMeEvents(
    @Req() req: Request,
    @Query('timeZone') timeZone?: string,
  ): Promise<EventListResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const { events } = await this.calendarService.listMyEvents(principal, timeZone);
      return success(events, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/events')
  async getEvents(
    @Req() req: Request,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<EventListResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
      const { events, nextCursor } = await this.calendarService.listEvents(principal, {
        scopeType,
        scopeId,
        from,
        to,
        cursor,
        limit: parsedLimit,
      });
      return { data: events, nextCursor, requestId: reqId };
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/events')
  @HttpCode(200)
  async postEvents(
    @Req() req: Request,
    @Body() body: EventInput,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const { event, etag } = await this.calendarService.createEvent(principal, body);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/events/:eventId')
  async getEventById(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const { event, etag } = await this.calendarService.getEvent(principal, eventId);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('/events/:eventId')
  async patchEvent(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Body() body: EventInput,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { event, etag } = await this.calendarService.updateEvent(principal, eventId, body, ifMatch);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/events/:eventId/cancel')
  @HttpCode(200)
  async cancelEvent(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { event, etag } = await this.calendarService.cancelEvent(principal, eventId, ifMatch);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }
}
