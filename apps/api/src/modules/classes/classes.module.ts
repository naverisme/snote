import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IdentityModule } from '../identity/identity.module';
import { ClassService } from './class-service';
import { AdmissionService } from './admission';
import { PrismaAdmissionStore } from './prisma-admission-store';
import {
  ClassesController,
  ClassInvitationsController,
  ClassJoinRequestsController,
} from './classes.controller';

@Module({
  imports: [IdentityModule],
  controllers: [
    ClassesController,
    ClassInvitationsController,
    ClassJoinRequestsController,
  ],
  providers: [
    {
      provide: PrismaAdmissionStore,
      useFactory: (db: PrismaClient) => new PrismaAdmissionStore(db),
      inject: [PrismaClient],
    },
    {
      provide: AdmissionService,
      useFactory: (store: PrismaAdmissionStore) => new AdmissionService(store),
      inject: [PrismaAdmissionStore],
    },
    {
      provide: ClassService,
      useFactory: (db: PrismaClient, admission: AdmissionService) => new ClassService(db, admission),
      inject: [PrismaClient, AdmissionService],
    },
  ],
  exports: [ClassService, AdmissionService, PrismaAdmissionStore],
})
export class ClassesModule {}
