export interface SubmissionInputDto {
  text?: string;
  links?: string[];
  uploadIds?: string[];
}

export interface SubmissionDto {
  id: string;
  recipientId: string;
  version: number;
  acceptedAt: string;
  timeliness: 'on_time' | 'late';
  submittedBy: string;
  text?: string | null;
  links?: string[];
  uploadIds?: string[];
  feedback?: FeedbackDto[];
}

export interface FeedbackDto {
  id: string;
  submissionId: string;
  teacherId: string;
  text: string;
  createdAt: string;
}

export interface SubmissionResultDto {
  data: SubmissionDto;
  requestId: string;
}

export interface SubmissionListResultDto {
  data: SubmissionDto[];
  nextCursor?: string;
  requestId: string;
}

export interface FeedbackInputDto {
  text: string;
}

export interface UpdateInputDto {
  text: string;
}
