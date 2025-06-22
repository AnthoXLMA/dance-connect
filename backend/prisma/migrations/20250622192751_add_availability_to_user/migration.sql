-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "dances" TEXT[],
ADD COLUMN     "geoLocation" JSONB,
ADD COLUMN     "levels" JSONB,
ADD COLUMN     "location" TEXT;
