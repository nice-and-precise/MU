# MU Pilot Demo: Open Items & Known Limitations

## 🐛 Known Issues (Active)
> [!WARNING]
> The following issues verify as "Critical" and are prioritized for the immediate next patch.

*   **Dashboard Loading Error**: Occasional crash due to data mapping issues on empty states.
*   **DVIR Submission**: Foreign key error when submitting inspections for certain assets.
*   **Report Form**: Simplified view; enhanced categories coming in next update.

## 🚧 Feature Limitations

> [!NOTE]
> This document tracks items intentionally deferred post-pilot to ensure stability and focus on core workflows.

## 🚧 Post-Pilot Roadmap

The following features and improvements are scheduled for **Phase 4 (Post-Pilot)**.

### 1. Advanced Reporting & Analytics
*   **Deep Financial Analytics**: Currently, the Financials dashboard provides high-level aggregation. Advanced drill-down into specific cost codes and historical trend analysis is planned for Q1 2026.
*   **Custom Report Builder**: The ability for users to define custom report templates is currently in design.

### 2. Core DrillPath3D WASM Module
*   **Native Performance**: We are migrating the core bore path calculation engine from JavaScript to Rust/WASM for improved performance on long bores.
*   **3D Visualization**: Enhanced 3D visualization using WebGL/WASM is currently in prototype phase.

### 3. Security Hardening
While the application is secure for the pilot, the following enhancements are queued:
*   **Rate Limiting**: Global rate limiting is implemented, but granular per-route limiting needs fine-tuning.
*   **CSRF Protection**: We are migrating to stricter CSRF tokens for all state-changing actions.
*   **Native Mobile Wrapper**: The current mobile experience is a PWA. A native wrapper (iOS/Android) with biometric auth is planned.

## 📱 Mobile Experience
*   **layout**: The mobile layout is optimized for iPhone SE and newer. Tablet support is functional but undergoing refinement.
*   **Offline Mode**: Basic offline data entry is supported securely. Full offline sync conflict resolution is being enhanced.

## 🔧 Known Issues (Non-Blocking)
*   **Seed Data**: Demo data is generated algorithmically and may occasionally produce unrealistic dates (e.g., future maintenance logs).
*   **Map Loading**: Mapbox tiles may take a moment to load on slow cellular connections.

---
*Last Updated: Dec 2025*
