/*
  Warnings:

  - You are about to drop the `ai_provider_configs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ai_provider_configs";

-- CreateTable
CREATE TABLE "aiProviderConfigs" (
    "id" TEXT NOT NULL,
    "providerAlias" TEXT NOT NULL,
    "baseProvider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "apiUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aiProviderConfigs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aiProviderConfigs_providerAlias_key" ON "aiProviderConfigs"("providerAlias");

-- CreateIndex
CREATE INDEX "aiProviderConfigs_baseProvider_idx" ON "aiProviderConfigs"("baseProvider");

-- CreateIndex
CREATE INDEX "aiProviderConfigs_isActive_idx" ON "aiProviderConfigs"("isActive");
