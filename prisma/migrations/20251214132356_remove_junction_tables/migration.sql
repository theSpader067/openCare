/*
  Warnings:

  - You are about to drop the `ActivityTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityTeam" DROP CONSTRAINT "ActivityTeam_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityTeam" DROP CONSTRAINT "ActivityTeam_teamId_fkey";

-- DropForeignKey
ALTER TABLE "PatientTeam" DROP CONSTRAINT "PatientTeam_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientTeam" DROP CONSTRAINT "PatientTeam_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TaskTeam" DROP CONSTRAINT "TaskTeam_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskTeam" DROP CONSTRAINT "TaskTeam_teamId_fkey";

-- DropTable
DROP TABLE "ActivityTeam";

-- DropTable
DROP TABLE "PatientTeam";

-- DropTable
DROP TABLE "TaskTeam";
