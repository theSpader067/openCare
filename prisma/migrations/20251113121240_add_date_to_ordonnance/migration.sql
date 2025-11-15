-- DropForeignKey
ALTER TABLE "Ordonnance" DROP CONSTRAINT "Ordonnance_patientId_fkey";

-- AlterTable
ALTER TABLE "Ordonnance" ADD COLUMN     "date" TIMESTAMP(3),
ALTER COLUMN "patientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ordonnance" ADD CONSTRAINT "Ordonnance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
