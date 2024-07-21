/*
  Warnings:

  - The `transcript` column on the `MeetingTranscript` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "MeetingTranscript" DROP COLUMN "transcript",
ADD COLUMN     "transcript" JSONB[];
