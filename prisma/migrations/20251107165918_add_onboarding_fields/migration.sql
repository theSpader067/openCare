-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hospital" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "year" TEXT;
