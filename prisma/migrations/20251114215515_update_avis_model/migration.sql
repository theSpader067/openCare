/*
  Warnings:

  - You are about to drop the column `title` on the `Avis` table. All the data in the column will be lost.
  - Added the required column `specialty` to the `Avis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avis" DROP COLUMN "title",
ADD COLUMN     "answer" TEXT,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "specialty" TEXT NOT NULL;
