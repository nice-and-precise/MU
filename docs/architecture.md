# Architecture Overview

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js Server Actions, Prisma
- **Database**: Supabase (PostgreSQL + PostGIS)
- **3D Engine**: React Three Fiber (Drei)
- **Drilling Logic**: Custom TypeScript modules (`src/lib/drilling`)
    - **Physics**: ASTM F1962 (Pullback), Delft Model (Frac-Out), Minimum Curvature (Trajectory)

## Core Modules
1.  **Daily Reports**: Server-side actions for report creation/management.
2.  **WITSML Ingestion**:
    -   **API**: `/api/witsml` (POST) for receiving XML logs.
    -   **Parser**: `fast-xml-parser` extracts Depth, Pitch, Azimuth.
    -   **Storage**: `TelemetryLog` table in Supabase.
3.  **Live Operations Dashboard**:
    -   **Polling**: Server-Sent Events (SSE) via `/api/witsml/stream` for real-time updates.
    -   **Visualization**: Chart.js for high-performance rendering of trend lines.
4.  **Collision Detection**: 3D math logic to detect wellbore intersections.
5.  **Physics Engine**:
    -   `loads.ts`: Pullback force with Capstan Effect.
    -   `hydraulics.ts`: Annular pressure with Delft Cavity Expansion.
    -   `mcm.ts`: Minimum Curvature Method for trajectory.
6.  **Financials**:
    -   **Estimating**: `Estimate` model with `EstimateLineItem`.
    -   **Job Costing**: Aggregates `Invoice`, `TimeCard`, `EquipmentUsage` vs `Budget`.
    -   **Invoicing**: `Invoice` model with G702/G703 structure.
7.  **Field Operations**:
    -   **Crew**: `TimeCard` and `Employee` management.
    -   **Safety**: `SafetyMeeting`, `JSA`, `Inspection` models.
    -   **QC**: `PunchItem` and `Photo` management.
8.  **Visualization**: 3D rendering of wellbores and obstacles.

## Directory Structure
- `src/app`: Next.js pages and API routes.
- `src/components`: UI components (shared and feature-specific).
- `src/lib`: Core logic (drilling math, parsers, types).
