/*
  Warnings:

  - You are about to drop the column `address` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "address",
DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "updatedAt",
ADD COLUMN     "dances" TEXT[],
ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "lat" DROP DEFAULT,
ALTER COLUMN "lng" DROP DEFAULT,
ALTER COLUMN "name" DROP DEFAULT;
