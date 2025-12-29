-- Rename the uniqueLink column to sessionLink
ALTER TABLE "InterviewSession" RENAME COLUMN "uniqueLink" TO "sessionLink";

-- Rename the unique index
ALTER INDEX "InterviewSession_uniqueLink_key" RENAME TO "InterviewSession_sessionLink_key";

-- Rename the regular index
ALTER INDEX "InterviewSession_uniqueLink_idx" RENAME TO "InterviewSession_sessionLink_idx";