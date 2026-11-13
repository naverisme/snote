CREATE TABLE "PasswordResetOtp" (
    "accountId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "sendCount" INTEGER NOT NULL DEFAULT 1,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    CONSTRAINT "PasswordResetOtp_pkey" PRIMARY KEY ("accountId")
);
ALTER TABLE "PasswordResetOtp" ADD CONSTRAINT "PasswordResetOtp_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
