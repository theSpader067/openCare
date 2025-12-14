/*
  Warnings:

  - You are about to drop the `_ActivityToTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PatientToTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskToTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ActivityToTeam" DROP CONSTRAINT "_ActivityToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActivityToTeam" DROP CONSTRAINT "_ActivityToTeam_B_fkey";

-- DropForeignKey
ALTER TABLE "_PatientToTeam" DROP CONSTRAINT "_PatientToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_PatientToTeam" DROP CONSTRAINT "_PatientToTeam_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskToTeam" DROP CONSTRAINT "_TaskToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskToTeam" DROP CONSTRAINT "_TaskToTeam_B_fkey";

-- DropTable
DROP TABLE "_ActivityToTeam";

-- DropTable
DROP TABLE "_PatientToTeam";

-- DropTable
DROP TABLE "_TaskToTeam";

-- CreateTable
CREATE TABLE "TaskTeam" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTeam" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientTeam" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskTeam_taskId_teamId_key" ON "TaskTeam"("taskId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityTeam_activityId_teamId_key" ON "ActivityTeam"("activityId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientTeam_patientId_teamId_key" ON "PatientTeam"("patientId", "teamId");

-- AddForeignKey
ALTER TABLE "TaskTeam" ADD CONSTRAINT "TaskTeam_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTeam" ADD CONSTRAINT "TaskTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTeam" ADD CONSTRAINT "ActivityTeam_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTeam" ADD CONSTRAINT "ActivityTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientTeam" ADD CONSTRAINT "PatientTeam_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientTeam" ADD CONSTRAINT "PatientTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
