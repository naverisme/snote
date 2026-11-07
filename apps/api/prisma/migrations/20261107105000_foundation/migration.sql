-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountUsage" (
    "accountId" UUID NOT NULL,
    "usage" TEXT NOT NULL,

    CONSTRAINT "AccountUsage_pkey" PRIMARY KEY ("accountId","usage")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "groupLimit" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassJoinCode" (
    "classId" UUID NOT NULL,
    "codeHash" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassJoinCode_pkey" PRIMARY KEY ("classId")
);

-- CreateTable
CREATE TABLE "ClassMembership" (
    "id" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ownerId" UUID,
    "classId" UUID,
    "timeZone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationReceipt" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "initiatorId" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "version" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" UUID NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "initiatorId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "version" INTEGER NOT NULL DEFAULT 1,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" UUID NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "initiatorId" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "version" INTEGER NOT NULL DEFAULT 1,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassPolicy" (
    "classId" UUID NOT NULL,
    "defaults" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassPolicy_pkey" PRIMARY KEY ("classId")
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" UUID NOT NULL,
    "principalId" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "assigneeId" UUID,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "dueDate" DATE,
    "dueDateZone" TEXT,
    "importance" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'todo',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateWorkSession" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateWorkSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAudit" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "change" JSONB NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timedStart" TIMESTAMP(3),
    "timedEnd" TIMESTAMP(3),
    "allDayStart" DATE,
    "allDayEndExclusive" DATE,
    "sourceZone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAudience" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "classId" UUID,
    "workspaceId" UUID,

    CONSTRAINT "EventAudience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "folderId" UUID,
    "currentRevisionId" UUID,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" UUID NOT NULL,
    "itemId" UUID,
    "blobId" UUID,
    "text" TEXT,
    "url" TEXT,
    "actorId" UUID NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blob" (
    "id" UUID NOT NULL,
    "hash" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'verified',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrashEntry" (
    "itemId" UUID NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,
    "purgeAfter" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrashEntry_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "QuotaReference" (
    "id" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" UUID NOT NULL,
    "blobId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotaReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotaReservation" (
    "id" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" UUID NOT NULL,
    "bytes" BIGINT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "operationKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotaReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "deadlineDate" DATE,
    "deadlineZone" TEXT,
    "lateFirst" TEXT,
    "lateRevision" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentRecipient" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "progressText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionRevision" (
    "id" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "actorId" UUID NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "deadlineSnapshot" TIMESTAMP(3),
    "latePolicySnapshot" TEXT NOT NULL,
    "timeliness" TEXT NOT NULL,
    "text" TEXT,
    "links" JSONB NOT NULL,

    CONSTRAINT "SubmissionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAttachment" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "blobId" UUID NOT NULL,
    "sourceRevisionId" UUID,

    CONSTRAINT "SubmissionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadStaging" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'staged',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadStaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_accountId_expiresAt_idx" ON "PasswordResetToken"("accountId", "expiresAt");

-- CreateIndex
CREATE INDEX "ClassMembership_classId_accountId_status_idx" ON "ClassMembership"("classId", "accountId", "status");

-- CreateIndex
CREATE INDEX "Workspace_classId_status_idx" ON "Workspace"("classId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OperationReceipt_actorId_scopeType_scopeId_action_key_key" ON "OperationReceipt"("actorId", "scopeType", "scopeId", "action", "key");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_accountId_status_idx" ON "WorkspaceMembership"("workspaceId", "accountId", "status");

-- CreateIndex
CREATE INDEX "Invitation_recipientId_status_idx" ON "Invitation"("recipientId", "status");

-- CreateIndex
CREATE INDEX "JoinRequest_targetType_targetId_status_idx" ON "JoinRequest"("targetType", "targetId", "status");

-- CreateIndex
CREATE INDEX "TransferRequest_targetType_targetId_status_idx" ON "TransferRequest"("targetType", "targetId", "status");

-- CreateIndex
CREATE INDEX "Grant_principalId_scopeType_scopeId_action_idx" ON "Grant"("principalId", "scopeType", "scopeId", "action");

-- CreateIndex
CREATE INDEX "Task_workspaceId_status_dueAt_id_idx" ON "Task"("workspaceId", "status", "dueAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_taskId_position_key" ON "ChecklistItem"("taskId", "position");

-- CreateIndex
CREATE INDEX "PrivateWorkSession_ownerId_startAt_id_idx" ON "PrivateWorkSession"("ownerId", "startAt", "id");

-- CreateIndex
CREATE INDEX "Event_scopeType_scopeId_status_allDayStart_timedStart_idx" ON "Event"("scopeType", "scopeId", "status", "allDayStart", "timedStart");

-- CreateIndex
CREATE INDEX "EventAudience_eventId_idx" ON "EventAudience"("eventId");

-- CreateIndex
CREATE INDEX "Folder_workspaceId_parentId_idx" ON "Folder"("workspaceId", "parentId");

-- CreateIndex
CREATE INDEX "LibraryItem_workspaceId_folderId_status_updatedAt_id_idx" ON "LibraryItem"("workspaceId", "folderId", "status", "updatedAt", "id");

-- CreateIndex
CREATE INDEX "ContentRevision_itemId_at_idx" ON "ContentRevision"("itemId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "Blob_storageKey_key" ON "Blob"("storageKey");

-- CreateIndex
CREATE INDEX "QuotaReference_scopeType_scopeId_blobId_idx" ON "QuotaReference"("scopeType", "scopeId", "blobId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotaReference_scopeType_scopeId_blobId_reason_key" ON "QuotaReference"("scopeType", "scopeId", "blobId", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "QuotaReservation_scopeType_scopeId_operationKey_key" ON "QuotaReservation"("scopeType", "scopeId", "operationKey");

-- CreateIndex
CREATE INDEX "Assignment_classId_id_idx" ON "Assignment"("classId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentRecipient_assignmentId_workspaceId_key" ON "AssignmentRecipient"("assignmentId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionRevision_recipientId_version_key" ON "SubmissionRevision"("recipientId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAttachment_submissionId_blobId_key" ON "SubmissionAttachment"("submissionId", "blobId");

-- AddForeignKey
ALTER TABLE "AccountUsage" ADD CONSTRAINT "AccountUsage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassJoinCode" ADD CONSTRAINT "ClassJoinCode_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Constraints that Prisma cannot express directly. Keep these in the owner migration.
CREATE UNIQUE INDEX "ClassMembership_active_unique" ON "ClassMembership" ("classId", "accountId") WHERE "status" = 'active';
CREATE UNIQUE INDEX "ClassJoinCode_codeHash_key" ON "ClassJoinCode" ("codeHash");
CREATE UNIQUE INDEX "ClassMembership_monitor_unique" ON "ClassMembership" ("classId") WHERE "status" = 'active' AND "role" = 'monitor';
CREATE UNIQUE INDEX "WorkspaceMembership_active_unique" ON "WorkspaceMembership" ("workspaceId", "accountId") WHERE "status" = 'active';
CREATE UNIQUE INDEX "Workspace_default_owner_unique" ON "Workspace" ("ownerId") WHERE "kind" = 'default';
CREATE UNIQUE INDEX "TransferRequest_pending_unique" ON "TransferRequest" ("targetType", "targetId") WHERE "status" = 'pending';
CREATE UNIQUE INDEX "Grant_active_unique" ON "Grant" ("principalId", "scopeType", "scopeId", "action") WHERE "revokedAt" IS NULL;
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_kind_scope_check" CHECK (("kind" = 'class_group' AND "classId" IS NOT NULL) OR ("kind" IN ('default','independent') AND "classId" IS NULL));
ALTER TABLE "Class" ADD CONSTRAINT "Class_group_limit_check" CHECK ("groupLimit" > 0);
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_role_check" CHECK ("role" IN ('member','monitor'));
ALTER TABLE "ClassJoinCode" ADD CONSTRAINT "ClassJoinCode_enabled_hash_check" CHECK (("enabled" AND "codeHash" IS NOT NULL) OR (NOT "enabled" AND "codeHash" IS NULL));
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_target_check" CHECK ("targetType" IN ('class','workspace'));
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_target_check" CHECK ("targetType" IN ('class','workspace'));
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_target_check" CHECK ("targetType" IN ('class','workspace'));
ALTER TABLE "Event" ADD CONSTRAINT "Event_time_shape_check" CHECK (("kind" = 'timed' AND "timedStart" IS NOT NULL AND "timedEnd" > "timedStart" AND "allDayStart" IS NULL AND "allDayEndExclusive" IS NULL) OR ("kind" = 'all_day' AND "allDayStart" IS NOT NULL AND "allDayEndExclusive" > "allDayStart" AND "timedStart" IS NULL AND "timedEnd" IS NULL));
ALTER TABLE "PrivateWorkSession" ADD CONSTRAINT "WorkSession_time_check" CHECK ("endAt" > "startAt");
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_size_check" CHECK ("size" > 0);
ALTER TABLE "QuotaReservation" ADD CONSTRAINT "QuotaReservation_bytes_check" CHECK ("bytes" > 0);
ALTER TABLE "EventAudience" ADD CONSTRAINT "EventAudience_target_check" CHECK (("classId" IS NOT NULL) <> ("workspaceId" IS NOT NULL));
ALTER TABLE "Task" ADD CONSTRAINT "Task_due_shape_check" CHECK (("dueAt" IS NULL OR "dueDate" IS NULL) AND (("dueDate" IS NULL) = ("dueDateZone" IS NULL)));
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_deadline_shape_check" CHECK (("deadline" IS NULL OR "deadlineDate" IS NULL) AND (("deadlineDate" IS NULL) = ("deadlineZone" IS NULL)));
ALTER TABLE "Class" ADD CONSTRAINT "Class_owner_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id");
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_account_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id");
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_workspace_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id");
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_account_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id");
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspace_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id");
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_task_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id");
ALTER TABLE "PrivateWorkSession" ADD CONSTRAINT "WorkSession_task_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id");
ALTER TABLE "EventAudience" ADD CONSTRAINT "EventAudience_event_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id");
ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_workspace_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id");
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_blob_fkey" FOREIGN KEY ("blobId") REFERENCES "Blob"("id");
ALTER TABLE "QuotaReference" ADD CONSTRAINT "QuotaReference_blob_fkey" FOREIGN KEY ("blobId") REFERENCES "Blob"("id");
ALTER TABLE "AssignmentRecipient" ADD CONSTRAINT "AssignmentRecipient_assignment_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id");
ALTER TABLE "AssignmentRecipient" ADD CONSTRAINT "AssignmentRecipient_workspace_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id");
ALTER TABLE "SubmissionRevision" ADD CONSTRAINT "SubmissionRevision_recipient_fkey" FOREIGN KEY ("recipientId") REFERENCES "AssignmentRecipient"("id");
ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_submission_fkey" FOREIGN KEY ("submissionId") REFERENCES "SubmissionRevision"("id");
ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_blob_fkey" FOREIGN KEY ("blobId") REFERENCES "Blob"("id");
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_submission_fkey" FOREIGN KEY ("submissionId") REFERENCES "SubmissionRevision"("id");

CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "csrfHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_accountId_expiresAt_idx" ON "Session"("accountId", "expiresAt");
ALTER TABLE "Session" ADD CONSTRAINT "Session_account_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id");
