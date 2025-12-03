-- CreateTable
CREATE TABLE "GsocTicket" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL,
    "filedAt" TIMESTAMP(3) NOT NULL,
    "legalLocateReadyAt" TIMESTAMP(3),
    "legalExcavationStartAt" TIMESTAMP(3),
    "startTimeFromGsoc" TIMESTAMP(3) NOT NULL,
    "expirationAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GsocTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteLiningSnapshot" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "capturedByUserId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationGeometry" TEXT,
    "fieldDescription" TEXT NOT NULL,
    "markColor" TEXT NOT NULL DEFAULT 'WHITE',
    "isOverMarked" BOOLEAN NOT NULL DEFAULT false,
    "photoUrls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteLiningSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetTicket" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "requiredReason" TEXT,
    "meetRequestedAt" TIMESTAMP(3),
    "meetScheduledFor" TIMESTAMP(3),
    "meetHeldAt" TIMESTAMP(3),
    "meetLocation" TEXT,
    "documentationUrl" TEXT,
    "agreementMeetNotRequired" BOOLEAN NOT NULL DEFAULT false,
    "agreementNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetAttendee" (
    "id" TEXT NOT NULL,
    "meetTicketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocateRemark" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "photoUrls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocateRemark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT,
    "projectId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "facilityType" TEXT NOT NULL,
    "contactWasMade" BOOLEAN NOT NULL DEFAULT true,
    "notifiedOperatorsAt" TIMESTAMP(3),
    "emergencyServicesContacted" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DamageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ticketId" TEXT,
    "eventType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GsocTicket_projectId_idx" ON "GsocTicket"("projectId");

-- CreateIndex
CREATE INDEX "GsocTicket_ticketNumber_idx" ON "GsocTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "GsocTicket_status_idx" ON "GsocTicket"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLiningSnapshot_ticketId_key" ON "WhiteLiningSnapshot"("ticketId");

-- CreateIndex
CREATE INDEX "WhiteLiningSnapshot_capturedByUserId_idx" ON "WhiteLiningSnapshot"("capturedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetTicket_ticketId_key" ON "MeetTicket"("ticketId");

-- CreateIndex
CREATE INDEX "MeetAttendee_meetTicketId_idx" ON "MeetAttendee"("meetTicketId");

-- CreateIndex
CREATE INDEX "LocateRemark_ticketId_idx" ON "LocateRemark"("ticketId");

-- CreateIndex
CREATE INDEX "DamageEvent_ticketId_idx" ON "DamageEvent"("ticketId");

-- CreateIndex
CREATE INDEX "DamageEvent_projectId_idx" ON "DamageEvent"("projectId");

-- CreateIndex
CREATE INDEX "ComplianceEvent_projectId_idx" ON "ComplianceEvent"("projectId");

-- CreateIndex
CREATE INDEX "ComplianceEvent_ticketId_idx" ON "ComplianceEvent"("ticketId");

-- CreateIndex
CREATE INDEX "ComplianceEvent_eventType_idx" ON "ComplianceEvent"("eventType");

-- AddForeignKey
ALTER TABLE "GsocTicket" ADD CONSTRAINT "GsocTicket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLiningSnapshot" ADD CONSTRAINT "WhiteLiningSnapshot_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "GsocTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLiningSnapshot" ADD CONSTRAINT "WhiteLiningSnapshot_capturedByUserId_fkey" FOREIGN KEY ("capturedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetTicket" ADD CONSTRAINT "MeetTicket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "GsocTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetAttendee" ADD CONSTRAINT "MeetAttendee_meetTicketId_fkey" FOREIGN KEY ("meetTicketId") REFERENCES "MeetTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocateRemark" ADD CONSTRAINT "LocateRemark_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "GsocTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageEvent" ADD CONSTRAINT "DamageEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "GsocTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageEvent" ADD CONSTRAINT "DamageEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceEvent" ADD CONSTRAINT "ComplianceEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceEvent" ADD CONSTRAINT "ComplianceEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "GsocTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceEvent" ADD CONSTRAINT "ComplianceEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
