/*
  Warnings:

  - Added the required column `userEmail` to the `MeetingSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingSummary" ADD COLUMN     "userEmail" TEXT NOT NULL;
