/*
  Warnings:

  - The primary key for the `MeetingSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MeetingSummary" DROP CONSTRAINT "MeetingSummary_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MeetingSummary_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MeetingSummary_id_seq";
