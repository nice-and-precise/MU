# 216D Compliance Layer - Technical Documentation

## Overview
The 216D Compliance Layer in HDD-Nexus automates the tracking and enforcement of Minnesota Statute 216D (Gopher State One Call) regulations. It ensures that excavation work only proceeds when legal requirements for locating underground facilities are met.

## Core Features
1.  **Ticket Tracking**: Manages GSOC tickets (Normal, Meet, Emergency, Update).
2.  **Time Rules Engine**: Calculates "Legal Locate Ready" and "Excavation Start" times based on the 48-hour rule (excluding weekends and holidays).
3.  **White Lining Enforcement**: Requires digital evidence of physical white markings before ticket filing.
4.  **Meet Ticket Workflow**: Enforces Meet Tickets for projects > 1 mile or crossing county lines.
5.  **Field Compliance**: Captures "Remark Requests" and "Damage Events" directly from the field dashboard.

## Data Model
New Prisma models added:
-   `GsocTicket`: Stores ticket details, status, and computed legal times.
-   `WhiteLiningSnapshot`: Stores photos and geometry of the white-lined area.
-   `MeetTicket`: Stores meet details and attendees.
-   `LocateRemark`: Logs requests for remarks or issues with locates.
-   `DamageEvent`: Logs facility contacts/damages.
-   `ComplianceEvent`: Immutable log of all compliance-related actions.

## Time Rules Logic
Located in `src/lib/216d/timeRules.ts`.
-   `calculateLocateReadyAt(filedAt)`: Adds 48 hours of "business time" (skipping weekends/holidays) starting from 12:01 AM the next day.
-   `calculateExcavationEarliestFromMeet(meetTime)`: Adds 48 hours (skipping weekends/holidays) to the meet time.
-   `calculateTicketExpiration(startTime)`: Adds 14 calendar days.

## UI Components
-   `ComplianceTab`: Main entry point on Project Detail page.
-   `TicketStepper`: Visual progress indicator.
-   `WhiteLiningForm`, `GsocTicketForm`, `MeetTicketForm`: Data entry forms.
-   `ComplianceTimeline`: Visual history of events.

## Field Operations
Integrated into `FieldDashboard`:
-   **Remark Request**: Quick action to log issues with marks.
-   **Damage Report**: Critical action to log facility contact.

## Exports
-   `export216dPacket`: Server action that aggregates all evidence into a downloadable packet (PDF/Zip) for OPS or utility audits.
