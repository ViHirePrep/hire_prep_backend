/*
  Warnings:

  - The values [LEAD] on the enum `InterviewLevel` will be removed. If these variants are still used in the database, this will fail.
  - The `techStack` column on the `InterviewSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "TechStack" AS ENUM ('BACKEND', 'FRONTEND', 'FULLSTACK', 'DEVOPS', 'MOBILE', 'DATA', 'QA', 'SECURITY', 'CLOUD', 'AI_ML');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('IT', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'RETAIL', 'MANUFACTURING', 'MARKETING', 'HR', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'VIETNAMESE');

-- AlterEnum
BEGIN;
CREATE TYPE "InterviewLevel_new" AS ENUM ('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT');
ALTER TABLE "InterviewSession" ALTER COLUMN "level" TYPE "InterviewLevel_new" USING ("level"::text::"InterviewLevel_new");
ALTER TYPE "InterviewLevel" RENAME TO "InterviewLevel_old";
ALTER TYPE "InterviewLevel_new" RENAME TO "InterviewLevel";
DROP TYPE "public"."InterviewLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "industry" "Industry" NOT NULL DEFAULT 'IT',
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'VIETNAMESE',
ADD COLUMN     "position" TEXT,
ALTER COLUMN "jdId" DROP NOT NULL,
DROP COLUMN "techStack",
ADD COLUMN     "techStack" "TechStack";

-- CreateTable
CREATE TABLE "ai_provider_configs" (
    "id" TEXT NOT NULL,
    "providerAlias" TEXT NOT NULL,
    "baseProvider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_configs_providerAlias_key" ON "ai_provider_configs"("providerAlias");

-- CreateIndex
CREATE INDEX "ai_provider_configs_baseProvider_idx" ON "ai_provider_configs"("baseProvider");

-- CreateIndex
CREATE INDEX "ai_provider_configs_isActive_idx" ON "ai_provider_configs"("isActive");
