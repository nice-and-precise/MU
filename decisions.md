# Decisions Log

## 2025-11-30: Physics Engine Implementation
- **Decision**: Implement ASTM F1962 (Capstan) and Delft Model in TypeScript (`src/lib/drilling/math`).
- **Rationale**: Immediate integration with existing Next.js backend allows for faster delivery of "Invisible Engineering" value than rewriting in Rust immediately. Rust migration remains a long-term goal for performance if node.js becomes a bottleneck.

## 2025-11-30: Cascading Documentation Strategy
- **Decision**: Adopt a 3-level documentation strategy (`status.md`, `decisions.md`, `architecture.md`) to maintain context across sessions.
- **Rationale**: Ensures continuity and reduces "context rot" for autonomous agents.

## 2025-11-30: Turbo Mode Execution
- **Decision**: Operate with full autonomy (Turbo Mode), prioritizing action over discussion.
- **Rationale**: User explicitly requested high-velocity execution with auto-approval.

## 2025-11-30: Unit Testing with Vitest
- **Decision**: Use Vitest for unit testing logic modules (`src/lib/drilling`).
- **Rationale**: Fast, compatible with Vite/Next.js ecosystem, and necessary for ensuring safety-critical logic (collision detection) is correct.

## 2025-11-30: 3D Coordinate System
- **Decision**: Enforce `x=East`, `y=Depth(TVD)`, `z=North` mapping in `Borehole3D` for Obstacles.
- **Rationale**: Matches the `BoreholeTube` rendering and `collision.ts` logic. Previous implementation swapped Y and Z.

## 2025-12-01: Sequential Startup for Low-Resource Stability
- **Decision**: Adopt a **Sequential Startup Protocol** (Kill -> Reset DB -> Start Server) instead of parallel execution.
- **Rationale**: Prevent system lock-ups on 16GB RAM machines by isolating heavy processes (DB seeding vs. Next.js compilation).

## 2025-12-01: Migration to Supabase
- **Decision**: Migrate PostgreSQL database from local Docker container to Supabase (Cloud).
- **Rationale**: Offload resource usage from the local development machine (16GB RAM) to improve performance and stability. Local Docker containers were causing system lock-ups.

## 2025-12-01: Low-Spec Development Mode
- **Decision**: Create `scripts/dev_low_spec.ps1` to automate stopping Docker and cleaning processes.
- **Rationale**: Ensure the development environment remains responsive on i5/16GB hardware by aggressively freeing resources.

## 2025-12-01: WITSML Ingestion Strategy
- **Decision**: Use `fast-xml-parser` to parse WITSML logs and store directly in `TelemetryLog` table.
- **Rationale**: Provides a lightweight, real-time ingestion pipeline without the overhead of a full WITSML server.

## 2025-12-01: Live Dashboard Polling (Superseded)
- **Decision**: Use client-side polling (5s interval) for the Live Dashboard.
- **Rationale**: Initial simple implementation. *Superseded by SSE implementation for better performance.*

## 2025-12-01: Server-Sent Events (SSE) for Telemetry
- **Decision**: Implement SSE (`/api/witsml/stream`) for real-time WITSML data updates.
- **Rationale**: Replaces polling to reduce server load and latency, providing a "live" feel without the complexity of full WebSockets.

## 2025-12-01: Charting Library Replacement
- **Decision**: Replace Recharts with Chart.js.
- **Rationale**: Recharts was contributing significantly to bundle size and rendering overhead. Chart.js offers better performance (Canvas-based) and a smaller footprint for the required trend lines.
