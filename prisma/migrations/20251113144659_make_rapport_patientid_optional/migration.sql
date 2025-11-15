-- DropForeignKey
ALTER TABLE "Rapport" DROP CONSTRAINT "Rapport_patientId_fkey";

-- AlterTable
ALTER TABLE "Rapport" ALTER COLUMN "patientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
