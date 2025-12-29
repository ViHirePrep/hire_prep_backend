-- Rename the Question table to InterviewQuestion
ALTER TABLE "Question" RENAME TO "InterviewQuestion";

-- Rename all associated indexes and constraints
ALTER INDEX "Question_pkey" RENAME TO "InterviewQuestion_pkey";
ALTER INDEX "Question_sessionId_idx" RENAME TO "InterviewQuestion_sessionId_idx";
ALTER INDEX "Question_order_idx" RENAME TO "InterviewQuestion_order_idx";
