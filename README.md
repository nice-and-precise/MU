# HDD-Nexus - Digital Subsurface Platform

A comprehensive SaaS platform for Horizontal Directional Drilling (HDD) operations, combining high-performance engineering with modern field management.

## 🚀 Features

### 1. Core Engineering (Rust Engine)
- **Physics Engine**: ASTM F1962 Pullback & Hydraulic Fracture modeling.
- **Geometry**: Minimum Curvature Method (MCM) for precise 3D path calculations.
- **Performance**: Rust-based backend (`/engine`) exposed via Axum API for real-time computation.

### 2. Digital Subsurface & Visualization
- **3D Visualization**: Interactive view of bore paths and voxel-based soil layers using `Three.js` / `@react-three/fiber`.
- **Rod Planning**: "Rod-by-Rod" planning grid with real-time 3D feedback.
- **Geotech Integration**: Manage soil borings and stratigraphy.

### 3. Live Operations
- **Telemetry**: Ingest WITSML data from rigs (Vermeer/DCI).
- **Steering Rose**: Mobile-first interface for drillers.
- **Live Dashboard**: Real-time monitoring of depth, pitch, and azimuth.

### 4. Takeoff Intelligence
- **AI Import**: Drag-and-drop PDF/Excel takeoffs.
- **Extraction**: Automated parsing of line items and quantities.

### 5. Offline-First PWA
- **Field Ready**: Fully functional offline mode using Service Workers.
- **Mobile Optimized**: Responsive design for tablets and phones.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend**: Rust (Axum, Tokio), Node.js (Next.js Server Actions).
- **Database**: PostgreSQL 16 + PostGIS + TimescaleDB.
- **ORM**: Prisma.
- **Infrastructure**: Docker.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Rust Toolchain (`cargo`)
- Docker Desktop

### Installation

1.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Initialize Database**:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init_postgres
    ```

4.  **Run Rust Engine**:
    ```bash
    cd engine
    cargo run
    ```

5.  **Run Frontend**:
    ```bash
    # In a new terminal
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000).

## 📚 Documentation

- **Task List**: [task.md](./task.md) - Development roadmap and status.
