-- DropForeignKey
ALTER TABLE "MeetingTranscript" DROP CONSTRAINT "MeetingTranscript_meetingSummaryId_fkey";

-- AlterTable
ALTER TABLE "MeetingTranscript" ALTER COLUMN "meetingSummaryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MeetingTranscript" ADD CONSTRAINT "MeetingTranscript_meetingSummaryId_fkey" FOREIGN KEY ("meetingSummaryId") REFERENCES "MeetingSummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
