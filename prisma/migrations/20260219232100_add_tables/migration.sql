-- CreateEnum
CREATE TYPE "PerformedActStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELED');

-- CreateEnum
CREATE TYPE "BillableStatus" AS ENUM ('NOT_BILLABLE', 'BILLABLE', 'INVOICED');

-- AlterTable
ALTER TABLE "InvoiceLine" ADD COLUMN     "performedActId" TEXT;

-- CreateTable
CREATE TABLE "PerformedAct" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "patientId" INTEGER,
    "episodeId" TEXT,
    "catalogItemId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceOverride" DECIMAL(12,2),
    "taxRateOverride" DECIMAL(5,2),
    "discount" DECIMAL(12,2) DEFAULT 0,
    "source" TEXT,
    "activityId" INTEGER,
    "analyseId" INTEGER,
    "note" TEXT,
    "performedAt" TIMESTAMP(3),
    "performedById" INTEGER,
    "status" "PerformedActStatus" NOT NULL DEFAULT 'PLANNED',
    "billableStatus" "BillableStatus" NOT NULL DEFAULT 'BILLABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformedAct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerformedAct_orgId_idx" ON "PerformedAct"("orgId");

-- CreateIndex
CREATE INDEX "PerformedAct_patientId_idx" ON "PerformedAct"("patientId");

-- CreateIndex
CREATE INDEX "PerformedAct_episodeId_idx" ON "PerformedAct"("episodeId");

-- CreateIndex
CREATE INDEX "PerformedAct_catalogItemId_idx" ON "PerformedAct"("catalogItemId");

-- CreateIndex
CREATE INDEX "PerformedAct_activityId_idx" ON "PerformedAct"("activityId");

-- CreateIndex
CREATE INDEX "PerformedAct_analyseId_idx" ON "PerformedAct"("analyseId");

-- CreateIndex
CREATE INDEX "PerformedAct_billableStatus_idx" ON "PerformedAct"("billableStatus");

-- CreateIndex
CREATE INDEX "PerformedAct_status_idx" ON "PerformedAct"("status");

-- CreateIndex
CREATE INDEX "InvoiceLine_performedActId_idx" ON "InvoiceLine"("performedActId");

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "ActCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_analyseId_fkey" FOREIGN KEY ("analyseId") REFERENCES "Analyse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformedAct" ADD CONSTRAINT "PerformedAct_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_performedActId_fkey" FOREIGN KEY ("performedActId") REFERENCES "PerformedAct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
