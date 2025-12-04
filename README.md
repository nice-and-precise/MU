# Cognitive Subsurface Interface (Subterra)

**Current Status**: Beta / Pilot Ready
**Version**: 0.3.0-beta

## Overview
The **Cognitive Subsurface Interface** is a next-generation visualization tool for Horizontal Directional Drilling (HDD). It leverages a Voxel-based engine to render the subsurface environment in real-time, providing operators with intuitive, gamified feedback to improve safety and efficiency.

This project is currently a "Trojan Horse" module injected into the Midwest Underground business web app, with the long-term goal of becoming the industry standard OS for HDD equipment.

## Architecture

### Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS
- **Simulation Engine**: Rust + Bevy (compiled to WebAssembly)
- **AI/ML**: Burn-rs (Mocked for prototype)
- **Telemetry**: Synthetic J1939 Generator (Mocked)

### System Diagram

```mermaid
graph TD
    subgraph "Browser (Client)"
        UI[React UI Overlay] -->|Controls| WASM
        WASM[Bevy Engine (WASM)] -->|Render| Canvas[WebGL Canvas]
        WASM -->|Telemetry| UI
    end

    subgraph "Core Logic (Rust)"
        Tel[Telemetry Module] -->|Updates| Voxel[Voxel Grid]
        Sim[Simulation Scenarios] -->|Inject| Tel
        AI[Lithology Prediction] -->|Data| Tel
    end

    subgraph "Future Hardware"
        Edge[Edge Device (Raspberry Pi)] -->|CAN Bus| Drill[Drill Rig]
        Edge -->|WebSocket| WASM
    end

    WASM --- Tel
    Tel --- Sim
```

## Features

### 1. Voxel Visualization
- **Transparent Soil**: Opacity linked to density.
- **Rock Layers**: Solid, high-contrast voxels (Red = Granite).
- **Ghost Bit**: "Tron-like" vector line showing the drill path.

### 2. Gamified Feedback
- **Combo Meter**: Rewards staying on the planned path.
- **Haptic/Visual Feedback**: Screen shake and red sparks on rock strikes.

### 3. Demo Mode
- **Simulation Injection**: Trigger scenarios like "Hard Rock Strike" or "Fluid Loss" to test operator response.
- **Guided Tour**: Interactive overlay explaining the interface.

### 4. Realistic Business Operations
- **Full Employee Profiles**: Real photos, payroll data, and history.
- **Time & Attendance**: 12-week history of time cards and crew assignments.
- **Financials**: Detailed estimates, expenses, and job costing.
- **Operational Data**: Realistic rod-by-rod logs and telemetry.

## Future Roadmap

### Phase 1: The "Minecraft" Interface (Completed)
- [x] Basic Voxel Rendering
- [x] Synthetic Telemetry
- [x] Web Integration

### Phase 2: Hardware Integration
- [ ] Connect to real Drill Rig via CAN Bus (J1939).
- [ ] Deploy Edge Device (Raspberry Pi CM4).

### Phase 3: SaaS Expansion (In Progress)
- [x] **Crew Management**: Payroll, Scheduling, Certifications.
- [ ] **Fleet Management**: DOT Inspections, Maintenance Logs.
- [x] **Job Management**: Bidding, Invoicing, GIS Mapping.

### Phase 4: The "OS" Pivot
- [ ] License engine to OEMs (Vermeer, Ditch Witch).
- [ ] Full autonomous drilling capabilities.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   # Rust toolchain required for WASM build
   ```

2. **Build WASM Module**:
   ```bash
   wasm-pack build subterra --target web --out-dir ../src/subterra-wasm
   ```

3. **Seed Database (Realistic Data)**:
   ```bash
   npx prisma db push --force-reset
   npx prisma db seed
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Interface**:
   Navigate to `http://localhost:3000/dashboard/subterra`.
