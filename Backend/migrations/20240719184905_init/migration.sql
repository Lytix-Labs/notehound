-- CreateTable
CREATE TABLE "MeetingSummary" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "processing" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "duration" INTEGER,
    "summary" TEXT,

    CONSTRAINT "MeetingSummary_pkey" PRIMARY KEY ("id")
);
