export { ClassService } from './class-service';
export { AdmissionService } from './admission';
export type { AdmissionStore, AdmissionTransaction, Admission, AdmissionTarget, Membership, Target } from './admission';
export { PrismaAdmissionStore } from './prisma-admission-store';
export {
  ClassesController,
  ClassInvitationsController,
  ClassJoinRequestsController,
} from './classes.controller';
export { ClassesModule } from './classes.module';
