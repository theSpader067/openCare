-- AlterEnum
ALTER TYPE "EpisodeStatus" ADD VALUE 'CREATED';
ALTER TYPE "EpisodeStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "CAT" ADD COLUMN "currentBlockId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CAT_currentBlockId_key" ON "CAT"("currentBlockId");

-- AddForeignKey
ALTER TABLE "CAT" ADD CONSTRAINT "CAT_currentBlockId_fkey" FOREIGN KEY ("currentBlockId") REFERENCES "CATBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
