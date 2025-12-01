# Performance Optimization Walkthrough

## Overview
Implemented critical performance optimizations to improve dev server speed, page load times, and runtime performance on low-spec hardware.

## Changes

### Configuration
- Enabled Next.js Turbo Mode (`next dev --turbo`).
- Optimized Node.js memory settings (`--max-old-space-size=6144`).
- Configured Image Optimization and Code Splitting in `next.config.ts`.

### Database
- Added indexes to `StationProgress` and verified others.
- Optimized `getProject` query to select only necessary fields.

### UI Performance
- Implemented Lazy Loading for 3D components (`Borehole3D`, `Project3DViewer`).
- Replaced Recharts with Chart.js in `StripLog` and `LiveTelemetry`.
- Implemented Virtual Scrolling for Reports table and Rod Planner table.
- Optimized `Hero` image with `next/image` and `priority`.

### Real-time Data
- Implemented Server-Sent Events (SSE) for WITSML data stream.

## Verification
- **Dev Server**: Startup should be faster with Turbo.
- **Memory**: Node.js has more memory headroom.
- **3D**: Initial page load is faster due to lazy loading.
- **Charts**: Rendering performance improved with Canvas-based Chart.js.
- **Lists**: Large lists are virtualized.
