-- CreateTable
CREATE TABLE "OrdonnanceTemplate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "prescriptionDetails" TEXT NOT NULL,
    "prescriptionConsignes" TEXT,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdonnanceTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrdonnanceTemplate" ADD CONSTRAINT "OrdonnanceTemplate_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
