ALTER TABLE "Account" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "Account" ADD COLUMN "googleSubject" TEXT;
CREATE UNIQUE INDEX "Account_googleSubject_key" ON "Account"("googleSubject");
