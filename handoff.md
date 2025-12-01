# Handoff Document

## Session Summary
Focused on critical performance optimizations for low-spec hardware (i5-6500, 16GB RAM).

## Completed Tasks
1.  **Turbo Mode**: Enabled `next dev --turbo` by default.
2.  **Node Memory**: Increased to 6GB with GC optimization in `dev_low_spec.ps1`.
3.  **Database**: Added indexes to `StationProgress` and optimized `getProject` query.
4.  **Lazy Loading**: Implemented for `Borehole3D` and `Project3DViewer`.
5.  **Charts**: Replaced Recharts with Chart.js in `StripLog` and `LiveTelemetry`.
6.  **Virtual Scrolling**: Implemented for Reports table and Rod Planner.
7.  **Real-time**: Implemented SSE for WITSML data stream.
8.  **Assets**: Configured Image Optimization and updated Hero image.

## Next Steps
1.  **Edge Functions**: Move read-heavy operations to Supabase Edge Functions.
2.  **XML Parsing**: Implement Web Workers for large WITSML files.
3.  **Testing**: Verify performance on target hardware.

## Known Issues
- None currently.

## Environment
- Run `npm run dev` (uses Turbo).
- Use `scripts/dev_low_spec.ps1` for low-memory environments.lity.

### 3. WITSML Ingestion 📡
- **Goal**: Ingest real-time drilling data.
- **Status**: **Complete**.
- **Details**:
    -   **API**: `/api/witsml` (POST).
    -   **Parser**: Extracts Depth, Pitch, Azimuth.
    -   **Storage**: Saves to `TelemetryLog` table.

### 4. Live Operations Dashboard 🖥️
- **Goal**: Visualize drilling data.
- **Status**: **Complete**.
- **URL**: `/dashboard/projects/[id]/live`
- **Features**:
    -   Real-time HUD (Depth, Pitch, Azimuth).
    -   Trend Charts (Recharts).
    -   **Simulation**: "Simulate Data Packet" button for testing.

## Critical Context
- **Project ID**: Use `cminbncau000gu4nkag4ch8wl` for testing the dashboard.
- **Performance**: Use `./scripts/dev_low_spec.ps1` to start the server. Avoid running Docker locally.

## Next Steps
1.  **Rod Planning UI**: Implement the interface for planning the bore path rod-by-rod.
2.  **3D Visualization**: Integrate the 3D engine into the Live Dashboard to show the bore path in 3D space.
