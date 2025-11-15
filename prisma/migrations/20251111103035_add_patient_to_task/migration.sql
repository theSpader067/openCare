-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "patientAge" TEXT,
ADD COLUMN     "patientHistory" TEXT,
ADD COLUMN     "patientId" INTEGER,
ADD COLUMN     "patientName" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
