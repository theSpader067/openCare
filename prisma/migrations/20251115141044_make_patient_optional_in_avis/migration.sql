-- DropForeignKey
ALTER TABLE "Avis" DROP CONSTRAINT "Avis_patientId_fkey";

-- AlterTable
ALTER TABLE "Avis" ALTER COLUMN "patientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
