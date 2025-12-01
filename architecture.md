# Architecture Overview

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js Server Actions, Prisma
- **Database**: SQLite (via Prisma)
- **3D Engine**: React Three Fiber (Drei)
- **Drilling Logic**: Custom TypeScript modules (`src/lib/drilling`)
    - **Physics**: ASTM F1962 (Pullback), Delft Model (Frac-Out), Minimum Curvature (Trajectory)

## Core Modules
1.  **Daily Reports**: Server-side actions for report creation/management.
2.  **WITSML Ingestion**: XML parser (`fast-xml-parser`) for real-time drilling data.
3.  **Collision Detection**: 3D math logic to detect wellbore intersections.
4.  **Physics Engine**:
    - `loads.ts`: Pullback force with Capstan Effect.
    - `hydraulics.ts`: Annular pressure with Delft Cavity Expansion.
    - `mcm.ts`: Minimum Curvature Method for trajectory.
5.  **Visualization**: 3D rendering of wellbores and obstacles.

## Directory Structure
- `src/app`: Next.js pages and API routes.
- `src/components`: UI components (shared and feature-specific).
- `src/lib`: Core logic (drilling math, parsers, types).
