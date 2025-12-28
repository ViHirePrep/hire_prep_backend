/*
  Warnings:

  - You are about to drop the `aiProviderConfigs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "aiProviderConfigs";

-- CreateTable
CREATE TABLE "AIProviderConfig" (
    "id" TEXT NOT NULL,
    "providerAlias" TEXT NOT NULL,
    "baseProvider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "apiUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIProviderConfig_providerAlias_key" ON "AIProviderConfig"("providerAlias");

-- CreateIndex
CREATE INDEX "AIProviderConfig_baseProvider_idx" ON "AIProviderConfig"("baseProvider");

-- CreateIndex
CREATE INDEX "AIProviderConfig_isActive_idx" ON "AIProviderConfig"("isActive");
