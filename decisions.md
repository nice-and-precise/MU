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
