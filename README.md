# Cognitive Subsurface Interface (Subterra)

**Current Status**: Pre-Alpha / Mock-Up Phase  
**Version**: 0.1.0-alpha

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

## Future Roadmap

### Phase 1: The "Minecraft" Interface (Current)
- [x] Basic Voxel Rendering
- [x] Synthetic Telemetry
- [x] Web Integration

### Phase 2: Hardware Integration
- [ ] Connect to real Drill Rig via CAN Bus (J1939).
- [ ] Deploy Edge Device (Raspberry Pi CM4).

### Phase 3: SaaS Expansion
- [ ] **Crew Management**: Payroll, Scheduling, Certifications.
- [ ] **Fleet Management**: DOT Inspections, Maintenance Logs.
- [ ] **Job Management**: Bidding, Invoicing, GIS Mapping.

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

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Interface**:
   Navigate to `http://localhost:3000/subterra`.
