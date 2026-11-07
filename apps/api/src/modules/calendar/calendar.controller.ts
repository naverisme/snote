import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
interface ResponseLike {
  setHeader(name: string, value: string): void;
}
import { DomainError, type Principal } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import { CalendarService } from './calendar.service';
import type { EventInput, EventListResult, EventResult } from './calendar.types';

@Controller()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  private getPrincipal(headers: Record<string, string | undefined>): Principal {
    const accountId = headers['x-account-id'] ?? 'user-mock';
    return { accountId };
  }

  private verifyCsrf(headers: Record<string, string | undefined>): void {
    const token = headers['x-csrf-token'];
    if (!token || token.trim().length === 0) {
      throw new DomainError('FORBIDDEN', 403);
    }
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
    @Headers() headers: Record<string, string | undefined>,
    @Query('timeZone') timeZone?: string,
  ): Promise<EventListResult> {
    const reqId = requestId();
    try {
      const principal = this.getPrincipal(headers);
      const userWorkspaces = (headers['x-workspace-ids'] ?? '').split(',').filter(Boolean);
      const { events } = await this.calendarService.listMyEvents(principal, timeZone, userWorkspaces);
      return success(events, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/events')
  async getEvents(
    @Headers() headers: Record<string, string | undefined>,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<EventListResult> {
    const reqId = requestId();
    try {
      const principal = this.getPrincipal(headers);
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
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: EventInput,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      this.verifyCsrf(headers);
      const principal = this.getPrincipal(headers);
      const { event, etag } = await this.calendarService.createEvent(principal, body);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/events/:eventId')
  async getEventById(
    @Headers() headers: Record<string, string | undefined>,
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      const principal = this.getPrincipal(headers);
      const { event, etag } = await this.calendarService.getEvent(principal, eventId);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('/events/:eventId')
  async patchEvent(
    @Headers() headers: Record<string, string | undefined>,
    @Param('eventId') eventId: string,
    @Body() body: EventInput,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      this.verifyCsrf(headers);
      const ifMatch = headers['if-match'];
      const principal = this.getPrincipal(headers);
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
    @Headers() headers: Record<string, string | undefined>,
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EventResult> {
    const reqId = requestId();
    try {
      this.verifyCsrf(headers);
      const ifMatch = headers['if-match'];
      const principal = this.getPrincipal(headers);
      const { event, etag } = await this.calendarService.cancelEvent(principal, eventId, ifMatch);
      res.setHeader('ETag', etag);
      return success(event, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }
}
