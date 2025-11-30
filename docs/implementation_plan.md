# Implementation Plan - Heavy Civil Gap Closure

# Goal Description
Address the gaps identified in Procore's offering for heavy civil/underground construction by implementing specialized features for Midwest Underground (MU). Specifically, we will tackle the lack of "Linear Construction" tracking and specialized "Asset Management" for HDD operations.

We will implement:
1.  **Linear Station Tracker**: A dashboard component to visualize and track progress by "station" (footage) along the bore path, integrating with our existing As-Built and Telemetry data.
2.  **Asset Manager**: A dedicated system to track HDD-specific equipment (Rigs, Locators, Reamers) and their operational status, linked to projects.

## User Review Required
> [!IMPORTANT]
> This plan introduces new database models for `Asset` and `StationProgress`. Please review the schema changes.

## Proposed Changes

### Database Schema
#### [MODIFY] [schema.prisma](file:///C:/Users/Owner/Desktop/MU/prisma/schema.prisma)
- Add `Asset` model (Type: RIG, LOCATOR, EXCAVATOR, TRUCK, OTHER).
- Add `StationProgress` model to track linear progress (StartStation, EndStation, Date, Status).
- Update `Project` to include relations to `Asset` and `StationProgress`.

### Asset Management
#### [NEW] [src/app/dashboard/assets/page.tsx](file:///C:/Users/Owner/Desktop/MU/src/app/dashboard/assets/page.tsx)
- Main asset list view.
#### [NEW] [src/components/assets/AssetCard.tsx](file:///C:/Users/Owner/Desktop/MU/src/components/assets/AssetCard.tsx)
- Component to display individual asset details and status.
#### [NEW] [src/actions/assets.ts](file:///C:/Users/Owner/Desktop/MU/src/actions/assets.ts)
- Server actions for CRUD operations on assets.

### Linear Progress Tracking
#### [NEW] [src/components/projects/LinearProgressBar.tsx](file:///C:/Users/Owner/Desktop/MU/src/components/projects/LinearProgressBar.tsx)
- Visual component showing the bore path with "station" markers and completed segments.
#### [MODIFY] [src/app/dashboard/projects/[id]/page.tsx](file:///C:/Users/Owner/Desktop/MU/src/app/dashboard/projects/[id]/page.tsx)
- Integrate `LinearProgressBar` into the project dashboard.

## Verification Plan

### Automated Tests
- Run `npx prisma validate` to verify schema.
- We will rely on manual verification as we are building UI components.

### Manual Verification
1.  **Assets**:
    - Navigate to `/dashboard/assets`.
    - Create a new Asset (e.g., "Vermeer D100x140").
    - Verify it appears in the list.
    - Update its status (e.g., "Maintenance").
2.  **Linear Progress**:
    - Navigate to a Project Dashboard.
    - Verify the "Linear Progress" bar appears.
    - Manually add a progress entry (simulated via database or temporary UI if needed, or derived from Daily Logs if possible). *Self-correction: We will derive it from Daily Logs if possible, or add a simple "Update Progress" form.*
