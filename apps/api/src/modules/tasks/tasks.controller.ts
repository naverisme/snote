import {
  Body,
  Controller,
  Delete,
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
import { TasksService } from './tasks.service';
import type {
  BulkTasks,
  Checklist,
  Reassign,
  TaskCreate,
  TaskListResult,
  TaskResult,
  TaskUpdate,
  WorkSession,
  WorksessionListResult,
  WorksessionResult,
} from './tasks.types';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
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

  @Get('/me/tasks')
  async getMeTasks(
    @Req() req: Request,
    @Query('filter') filter?: 'all' | 'today' | 'tomorrow' | 'important' | 'upcoming',
    @Query('timeZone') timeZone?: string,
  ): Promise<TaskListResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const { tasks } = await this.tasksService.listMyTasks(principal, { filter, timeZone });
      return success(tasks, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/workspaces/:workspaceId/tasks')
  async getWorkspaceTasks(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<TaskListResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
      const { tasks, nextCursor } = await this.tasksService.listWorkspaceTasks(principal, workspaceId, cursor, parsedLimit);
      return { data: tasks, nextCursor, requestId: reqId };
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/workspaces/:workspaceId/tasks')
  @HttpCode(200)
  async createTask(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Body() body: TaskCreate,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const { task, etag } = await this.tasksService.createTask(principal, workspaceId, body);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/tasks/:taskId')
  async getTask(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const { task, etag } = await this.tasksService.getTask(principal, taskId);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('/tasks/:taskId')
  async patchTask(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() body: TaskUpdate,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.updateTask(principal, taskId, body, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/tasks/bulk-actions')
  @HttpCode(200)
  async bulkActions(
    @Req() req: Request,
    @Body() body: BulkTasks,
  ): Promise<TaskListResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const { tasks } = await this.tasksService.bulkActions(principal, body);
      return success(tasks, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/tasks/:taskId/reassign')
  @HttpCode(200)
  async reassignTask(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() body: Reassign,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.reassignTask(principal, taskId, body, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/tasks/:taskId/complete')
  @HttpCode(200)
  async completeTask(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.completeTask(principal, taskId, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/tasks/:taskId/reopen')
  @HttpCode(200)
  async reopenTask(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.reopenTask(principal, taskId, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/tasks/:taskId/checklist-items')
  @HttpCode(200)
  async addChecklistItem(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() body: Checklist,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.addChecklistItem(principal, taskId, body, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('/tasks/:taskId/checklist-items/:itemId')
  async patchChecklistItem(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Param('itemId') itemId: string,
    @Body() body: Checklist,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.updateChecklistItem(principal, taskId, itemId, body, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Delete('/tasks/:taskId/checklist-items/:itemId')
  async deleteChecklistItem(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Param('itemId') itemId: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<TaskResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { task, etag } = await this.tasksService.deleteChecklistItem(principal, taskId, itemId, ifMatch);
      res.setHeader('ETag', etag);
      return success(task, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('/me/work-sessions')
  async getMeWorkSessions(
    @Req() req: Request,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<WorksessionListResult> {
    const reqId = requestId();
    try {
      const principal = await this.getPrincipal(req);
      const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
      const { sessions, nextCursor } = await this.tasksService.listWorkSessions(principal, cursor, parsedLimit);
      return { data: sessions, nextCursor, requestId: reqId };
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('/me/work-sessions')
  @HttpCode(200)
  async postMeWorkSessions(
    @Req() req: Request,
    @Body() body: WorkSession,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<WorksessionResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const { session, etag } = await this.tasksService.createWorkSession(principal, body);
      res.setHeader('ETag', etag);
      return success(session, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('/me/work-sessions/:sessionId')
  async patchMeWorkSessions(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Body() body: WorkSession,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<WorksessionResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { session, etag } = await this.tasksService.updateWorkSession(principal, sessionId, body, ifMatch);
      res.setHeader('ETag', etag);
      return success(session, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Delete('/me/work-sessions/:sessionId')
  async deleteMeWorkSessions(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
  ): Promise<WorksessionResult> {
    const reqId = requestId();
    try {
      const principal = await this.verifyCsrf(req);
      const ifMatch = req.headers['if-match'] as string | undefined;
      const { session } = await this.tasksService.deleteWorkSession(principal, sessionId, ifMatch);
      return success(session, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }
}
