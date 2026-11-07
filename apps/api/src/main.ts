import 'reflect-metadata';
import { Controller, Get, HttpException, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

const database = new PrismaClient();

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
@Module({ controllers: [HealthController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v2');
  await app.listen(Number(process.env.PORT ?? 3000));
}
void bootstrap();
