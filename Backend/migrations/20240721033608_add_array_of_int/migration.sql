/*
  Warnings:

  - You are about to drop the column `audioBytes` on the `MediaSummaryRaw` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MediaSummaryRaw" DROP COLUMN "audioBytes",
ADD COLUMN     "rawAudio" INTEGER[];
