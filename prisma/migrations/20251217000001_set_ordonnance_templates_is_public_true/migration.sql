-- AlterTable
ALTER TABLE "OrdonnanceTemplate" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- Update existing records to isPublic = true
UPDATE "OrdonnanceTemplate" SET "isPublic" = true;
