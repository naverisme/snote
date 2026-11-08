import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ScopedAuthorization } from '../authorization/policy';
import { PrismaClient } from '@prisma/client';
import * as path from 'node:path';
import { LocalStorageAdapter } from '../storage/local-storage-adapter';
import { PrismaQuotaStore } from './prisma-quota-store';
import { QuotaService } from './quota-service';
import { PrismaLibraryStore } from './prisma-library-store';
import { LibraryService } from './library-service';
import { LibraryController } from './library.controller';
import { PrismaUploadStore } from '../uploads/prisma-upload-store';
import { UploadService } from '../uploads/upload-service';
import { UploadController } from '../uploads/upload.controller';
import { LibrarySessionGuard } from './library-session.guard';

@Module({
  imports: [IdentityModule, AuthorizationModule],
  controllers: [LibraryController, UploadController],
  providers: [
    LibrarySessionGuard,
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
    {
      provide: LocalStorageAdapter,
      useFactory: () =>
        new LocalStorageAdapter({
          rootDir: path.resolve(process.env.STORAGE_ROOT ?? '.storage'),
        }),
    },
    {
      provide: PrismaQuotaStore,
      useFactory: (prisma: PrismaClient) => new PrismaQuotaStore(prisma),
      inject: [PrismaClient],
    },
    {
      provide: QuotaService,
      useFactory: (quotaStore: PrismaQuotaStore) => new QuotaService(quotaStore),
      inject: [PrismaQuotaStore],
    },
    {
      provide: PrismaUploadStore,
      useFactory: (prisma: PrismaClient) => new PrismaUploadStore(prisma),
      inject: [PrismaClient],
    },
    {
      provide: UploadService,
      useFactory: (
        storage: LocalStorageAdapter,
        uploadStore: PrismaUploadStore,
        quotaService: QuotaService,
        auth: ScopedAuthorization,
      ) => new UploadService(storage, uploadStore, quotaService, auth),
      inject: [LocalStorageAdapter, PrismaUploadStore, QuotaService, ScopedAuthorization],
    },
    {
      provide: PrismaLibraryStore,
      useFactory: (prisma: PrismaClient) => new PrismaLibraryStore(prisma),
      inject: [PrismaClient],
    },
    {
      provide: LibraryService,
      useFactory: (
        store: PrismaLibraryStore,
        quota: QuotaService,
        uploadStore: PrismaUploadStore,
        auth: ScopedAuthorization,
      ) => new LibraryService(store, quota, uploadStore, auth),
      inject: [PrismaLibraryStore, QuotaService, PrismaUploadStore, ScopedAuthorization],
    },
  ],
  exports: [LibraryService, QuotaService, UploadService],
})
export class LibraryModule {}
