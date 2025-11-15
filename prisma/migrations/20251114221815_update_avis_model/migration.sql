/*
  Warnings:

  - You are about to drop the column `date` on the `Avis` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `Avis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Avis" DROP COLUMN "date",
DROP COLUMN "specialty",
ADD COLUMN     "answer_date" TIMESTAMP(3);
