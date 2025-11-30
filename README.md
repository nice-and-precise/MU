
# Midwest Underground - Digital Subsurface Platform

This is a [Next.js](https://nextjs.org) project for managing HDD (Horizontal Directional Drilling) operations.

## Features

### 1. Digital Subsurface & Geotech
- **Geotechnical Data**: Manage soil borings, stratigraphy, and ground conditions.
- **Deep Integration**: Engineering calculations now use specific soil layers (e.g., Sand vs Clay) at exact depths.
- **Import**: Mock integration with Minnesota County Well Index (CWI).

### 2. Engineering & Planning
- **Bore Design**: ASTM F1962 Pullback Calculations.
- **Fluid Planning**: Volume & Mix recommendations based on soil type and hole geometry.
- **Frac-Out Risk**: Real-time risk analysis based on annular pressure and soil strength.
- **3D Visualization**: Interactive 3D view of the bore path and soil layers using `Three.js`.

### 3. Live Operations (Telemetry)
- **Real-Time Stream**: Ingest WITSML / LWD data from rigs (Vermeer/DCI).
- **Live Dashboard**: View raw telemetry logs (Depth, Pitch, Azimuth) and HUD.
- **Simulator**: Built-in simulator to test the stream without a rig.

### 4. Automated As-Builts
- **Generation**: Create DXF files automatically from approved Daily Report logs.
- **Algorithm**: Uses Minimum Curvature Method for high-precision 3D path calculation.

## Getting Started

### Prerequisites
- Node.js 18+
- SQLite (for local dev)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Test Data** (Recommended):
   Populate the database with a sample project, bore, geotech report, and telemetry logs.
   ```bash
   npx prisma db seed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Documentation

- **WITSML Guide**: [docs/witsml_guide.md](./docs/witsml_guide.md) - How to configure rigs for data streaming.
- **Feature Walkthrough**: [walkthrough.md](./walkthrough.md) - Visual guide to the new features.

## Tech Stack
- Next.js 14 (App Router)
- Prisma (SQLite)
- Tailwind CSS / Shadcn UI
- React Three Fiber (3D Visualization)
