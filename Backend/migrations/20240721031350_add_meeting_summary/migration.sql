-- CreateTable
CREATE TABLE "MediaSummaryRaw" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meetingSummaryId" TEXT NOT NULL,
    "audioBytes" BYTEA NOT NULL,

    CONSTRAINT "MediaSummaryRaw_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MediaSummaryRaw" ADD CONSTRAINT "MediaSummaryRaw_meetingSummaryId_fkey" FOREIGN KEY ("meetingSummaryId") REFERENCES "MeetingSummary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
