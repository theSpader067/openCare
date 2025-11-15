/*
  Warnings:

  - A unique constraint covering the columns `[labId]` on the table `Analyse` will be added. If there are existing duplicate values, this will fail.
  - Made the column `labId` on table `Analyse` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Analyse" DROP CONSTRAINT "Analyse_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Analyse" DROP CONSTRAINT "Analyse_patientId_fkey";

-- AlterTable
ALTER TABLE "Analyse" ALTER COLUMN "labId" SET NOT NULL;

-- CreateTable
CREATE TABLE "TeamRequest" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analyse_labId_key" ON "Analyse"("labId");

-- AddForeignKey
ALTER TABLE "Analyse" ADD CONSTRAINT "Analyse_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyse" ADD CONSTRAINT "Analyse_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRequest" ADD CONSTRAINT "TeamRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRequest" ADD CONSTRAINT "TeamRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
