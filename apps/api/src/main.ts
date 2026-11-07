import 'reflect-metadata';
import { ArgumentsHost, Catch, Controller, ExceptionFilter, Get, HttpException, HttpStatus, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { DomainError } from './core/authorization';
import { requestId } from './core/http';
import { IdentityModule } from './modules/identity';
import { ClassesModule } from './modules/classes';
import { WorkspacesModule } from './modules/workspaces';
import { AuthorizationModule } from './modules/authorization';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { LibraryModule } from './modules/library';
import { AssignmentsModule } from './modules/assignments';
import { SubmissionsModule } from './modules/submissions';
import { NotificationsModule } from './modules/notifications/notifications.module';
import type { Request, Response } from './modules/identity/http-utils';

const database = new PrismaClient();

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const reqId = (request.headers['x-request-id'] as string) || requestId();

    if (exception instanceof DomainError) {
      response.status(exception.status).json({
        error: { code: exception.code, message: exception.code, details: {} },
        requestId: reqId,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const code = typeof res === 'object' && res !== null && 'error' in res
        ? (res as { error: string }).error
        : exception.name;
      response.status(status).json({
        error: { code, message: exception.message, details: {} },
        requestId: reqId,
      });
      return;
    }

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      error: { code: 'RETRYABLE', message: 'Service failure', details: {} },
      requestId: reqId,
    });
  }
}

@Controller()
class HealthController {
  @Get('/health') health() { return { status: 'ok' }; }
  @Get('/ready') async ready() {
    try {
      await database.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new HttpException({ status: 'unavailable' }, 503);
    }
  }
}

@Module({
  imports: [
    IdentityModule,
    ClassesModule,
    WorkspacesModule,
    AuthorizationModule,
    TasksModule,
    CalendarModule,
    LibraryModule,
    AssignmentsModule,
    SubmissionsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v2');
  await app.listen(Number(process.env.PORT ?? 3000));
}

if (process.env.NODE_ENV !== 'test') {
  void bootstrap();
}
