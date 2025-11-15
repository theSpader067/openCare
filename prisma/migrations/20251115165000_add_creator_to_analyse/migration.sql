-- AlterTable
ALTER TABLE "Analyse" ADD COLUMN "creatorId" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "Analyse_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Drop the default after setting it on existing rows
ALTER TABLE "Analyse" ALTER COLUMN "creatorId" DROP DEFAULT;
