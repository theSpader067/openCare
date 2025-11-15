/*
  Warnings:

  - You are about to drop the `_ActivityParticipants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskParticipants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ActivityParticipants" DROP CONSTRAINT "_ActivityParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActivityParticipants" DROP CONSTRAINT "_ActivityParticipants_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskParticipants" DROP CONSTRAINT "_TaskParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskParticipants" DROP CONSTRAINT "_TaskParticipants_B_fkey";

-- DropTable
DROP TABLE "_ActivityParticipants";

-- DropTable
DROP TABLE "_TaskParticipants";
