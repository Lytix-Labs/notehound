/*
  Warnings:

  - A unique constraint covering the columns `[meetingSummaryId]` on the table `MediaSummaryRaw` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sampleRate` to the `MediaSummaryRaw` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaSummaryRaw" ADD COLUMN     "sampleRate" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MeetingTranscript" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meetingSummaryId" TEXT NOT NULL,
    "transcript" JSONB NOT NULL,

    CONSTRAINT "MeetingTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingTranscript_meetingSummaryId_key" ON "MeetingTranscript"("meetingSummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaSummaryRaw_meetingSummaryId_key" ON "MediaSummaryRaw"("meetingSummaryId");

-- AddForeignKey
ALTER TABLE "MeetingTranscript" ADD CONSTRAINT "MeetingTranscript_meetingSummaryId_fkey" FOREIGN KEY ("meetingSummaryId") REFERENCES "MeetingSummary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
