-- Rename the Answer table to InterviewAnswer
ALTER TABLE "Answer" RENAME TO "InterviewAnswer";

-- Rename all associated indexes and constraints
ALTER INDEX "Answer_pkey" RENAME TO "InterviewAnswer_pkey";
ALTER INDEX "Answer_sessionId_idx" RENAME TO "InterviewAnswer_sessionId_idx";
ALTER INDEX "Answer_questionId_idx" RENAME TO "InterviewAnswer_questionId_idx";
