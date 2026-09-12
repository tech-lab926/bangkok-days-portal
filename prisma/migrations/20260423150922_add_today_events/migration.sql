-- CreateTable
CREATE TABLE "today_events" (
    "id" TEXT NOT NULL,
    "eventTime" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "today_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "today_events_eventDate_active_idx" ON "today_events"("eventDate", "active");
