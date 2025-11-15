/*
  Warnings:

  - You are about to drop the column `analyse` on the `LabEntry` table. All the data in the column will be lost.
  - You are about to drop the column `labKey` on the `LabEntry` table. All the data in the column will be lost.
  - You are about to drop the column `labValue` on the `LabEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabEntry" DROP COLUMN "analyse",
DROP COLUMN "labKey",
DROP COLUMN "labValue",
ADD COLUMN     "interpretation" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "value" TEXT;
