export type NotificationTopic =
  | 'assignment.created'
  | 'assignment.updated'
  | 'assignment.archived'
  | 'submission.created'
  | 'submission.revision'
  | 'feedback.created'
  | 'progress.updated';

export interface OutboxEventRecord {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  deliveredAt: Date | null;
  createdAt: Date;
}

export interface AssignmentCreatedPayload {
  assignmentId: string;
  classId: string;
  title: string;
  recipientWorkspaceIds: string[];
  createdAt: string;
}

export interface SubmissionCreatedPayload {
  submissionId: string;
  recipientId: string;
  assignmentId: string;
  workspaceId: string;
  version: number;
  timeliness: 'on_time' | 'late';
  actorId: string;
  acceptedAt: string;
}

export interface FeedbackCreatedPayload {
  feedbackId: string;
  submissionId: string;
  recipientId: string;
  teacherId: string;
  text: string;
  createdAt: string;
}

export interface ProgressUpdatedPayload {
  recipientId: string;
  assignmentId: string;
  workspaceId: string;
  progressText: string;
  updatedAt: string;
}
