-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "activityDay" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LabEntry" (
    "id" SERIAL NOT NULL,
    "analyse" TEXT,
    "labKey" TEXT,
    "labValue" TEXT,
    "analyseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analyse" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "patientName" TEXT,
    "patientAge" TEXT,
    "patientHistory" TEXT,
    "details" TEXT,
    "interpretation" TEXT,
    "status" TEXT,
    "labId" TEXT,

    CONSTRAINT "Analyse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LabEntry" ADD CONSTRAINT "LabEntry_analyseId_fkey" FOREIGN KEY ("analyseId") REFERENCES "Analyse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyse" ADD CONSTRAINT "Analyse_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
