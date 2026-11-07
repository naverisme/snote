export type LatePolicySetting = 'inherit' | 'allow' | 'lock';

export interface DueDate {
  date: string; // YYYY-MM-DD
  timeZone: string;
}

export interface WorkspaceGroup {
  id: string;
  name: string;
  memberCount?: number;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  recipientWorkspaceIds: string[];
  description?: string;
  deadline?: string;
  deadlineDate?: DueDate;
  lateFirst?: LatePolicySetting;
  lateRevision?: LatePolicySetting;
  version: number;
  status?: 'active' | 'archived';
  createdAt?: string;
}

export interface AssignmentInput {
  title: string;
  recipientWorkspaceIds: string[];
  description?: string;
  deadline?: string;
  deadlineDate?: DueDate;
  lateFirst?: LatePolicySetting;
  lateRevision?: LatePolicySetting;
}

export interface RecipientProgress {
  id: string;
  assignmentId: string;
  workspaceId: string;
  workspaceName?: string;
  tasksCompleted?: number;
  tasksTotal?: number;
  checklistCompleted?: number;
  checklistTotal?: number;
  progressText?: string;
  submissionVersion?: number;
  version: number;
}

export interface Feedback {
  id: string;
  submissionId: string;
  teacherId: string;
  text: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  recipientId: string;
  version: number;
  acceptedAt: string;
  timeliness: 'on_time' | 'late';
  submittedBy: string;
  text?: string | null;
  links?: string[];
  uploadIds?: string[];
  feedback?: Feedback[];
}

export interface SubmissionInput {
  text?: string;
  links?: string[];
  uploadIds?: string[];
}
