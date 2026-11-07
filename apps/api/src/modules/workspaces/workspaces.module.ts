import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IdentityModule } from '../identity/identity.module';
import { ClassesModule } from '../classes/classes.module';
import { WorkspaceService } from './workspace-service';
import { GroupLifecycle } from './group-lifecycle';
import {
  ClassGroupsController,
  GroupsController,
  GroupInvitationsController,
  GroupJoinRequestsController,
} from './groups.controller';
import {
  WorkspacesController,
  WorkspaceInvitationsController,
  OwnershipTransfersController,
} from './workspaces.controller';

@Module({
  imports: [IdentityModule, ClassesModule],
  controllers: [
    ClassGroupsController,
    GroupsController,
    GroupInvitationsController,
    GroupJoinRequestsController,
    WorkspacesController,
    WorkspaceInvitationsController,
    OwnershipTransfersController,
  ],
  providers: [
    {
      provide: GroupLifecycle,
      useFactory: (db: PrismaClient) => new GroupLifecycle(db),
      inject: [PrismaClient],
    },
    {
      provide: WorkspaceService,
      useFactory: (db: PrismaClient, lifecycle: GroupLifecycle) => new WorkspaceService(db, lifecycle),
      inject: [PrismaClient, GroupLifecycle],
    },
  ],
  exports: [WorkspaceService, GroupLifecycle],
})
export class WorkspacesModule {}
