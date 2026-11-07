export type LatePolicySetting = 'inherit' | 'allow' | 'lock';

export interface DueDateInput {
  date: string; // YYYY-MM-DD
  timeZone: string;
}

export interface AssignmentInputDto {
  title: string;
  recipientWorkspaceIds: string[];
  description?: string;
  deadline?: string;
  deadlineDate?: DueDateInput;
  attachmentUploadIds?: string[];
  lateFirst?: LatePolicySetting;
  lateRevision?: LatePolicySetting;
}

export interface AssignmentDto {
  id: string;
  classId: string;
  title: string;
  recipientWorkspaceIds: string[];
  deadline?: string;
  deadlineDate?: DueDateInput;
  lateFirst?: LatePolicySetting;
  lateRevision?: LatePolicySetting;
  version: number;
  status?: string;
}

export interface AssignmentResultDto {
  data: AssignmentDto;
  requestId: string;
}

export interface AssignmentListResultDto {
  data: AssignmentDto[];
  nextCursor?: string;
  requestId: string;
}

export interface RecipientDto {
  id: string;
  assignmentId: string;
  workspaceId: string;
  submissionVersion?: number;
  progressText?: string;
  version: number;
}

export interface RecipientResultDto {
  data: RecipientDto;
  requestId: string;
}

export interface RecipientListResultDto {
  data: RecipientDto[];
  nextCursor?: string;
  requestId: string;
}

export interface CommandResultDto {
  data: { ok: boolean };
  requestId: string;
}
