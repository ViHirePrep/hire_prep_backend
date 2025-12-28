/*
  Warnings:

  - You are about to drop the column `invitedCandidateEmail` on the `InterviewSession` table. All the data in the column will be lost.
  - Added the required column `candidateEmail` to the `InterviewSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "InterviewSession_invitedCandidateEmail_idx";

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "invitedCandidateEmail",
ADD COLUMN     "candidateEmail" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "InterviewSession_candidateEmail_idx" ON "InterviewSession"("candidateEmail");
