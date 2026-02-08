-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "CATBlockType" AS ENUM ('ACTION', 'CONDITION', 'WAIT');

-- CreateEnum
CREATE TYPE "CATBlockStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL,
    "exitAt" TIMESTAMP(3),
    "motif" TEXT NOT NULL,
    "status" "EpisodeStatus" NOT NULL,
    "fullname" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "age" INTEGER,
    "origin" TEXT,
    "patientId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAT" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CAT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CATBlock" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "type" "CATBlockType" NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CATBlockStatus" NOT NULL,
    "blockDepth" INTEGER NOT NULL,
    "duration" INTEGER,
    "parentBlockIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "childBlockIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CATBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAT" ADD CONSTRAINT "CAT_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CATBlock" ADD CONSTRAINT "CATBlock_catId_fkey" FOREIGN KEY ("catId") REFERENCES "CAT"("id") ON DELETE CASCADE ON UPDATE CASCADE;
