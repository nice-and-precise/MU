
# MU Pilot Demo: Walkthrough Guide

Welcome to the Midwest Underground (MU) Pilot Demo. This guide covers the key user journeys available in this release.

## 🏁 Getting Started

### 1. Seeding Data
If the system is empty, use the **Owner Dashboard** to seed demo data.
1. Log in as `owner@midwestunderground.com` (Password: `password123`)
2. Click **"Seed Demo System"** in the top header.
3. Wait for the success notification.

### 2. Mobile Experience (PWA)
For the best field experience:
1. Open the app in Chrome/Safari on your mobile device.
2. Tap "Share" -> "Add to Home Screen".
3. Launch from the home screen for full-screen mode.

---

## 🏗️ Core Workflows

### 👷 For Crews (Field Ops)
**Persona:** `foreman@midwestunderground.com`

1.  **Clock In**:
    *   Navigate to **Time** (bottom text or sidebar).
    *   Select your Project.
    *   Tap **"Clock In"**. The GPS location is verified automatically.

3.  **Safe DVIR / Inspection**:
    *   **Clock In**: Select Project & Vehicle.
    *   **Inspection**: Complete the pre-trip checklist for the selected vehicle.
    *   **Result**: Validated clock-in with Asset ID linked.

4.  **Daily Reporting (Wizard)**:
    *   Go to **Daily Reports**.
    *   Click **"New Report"**.
    *   **Wizard**: Follow the steps (General -> Crew -> Equipment -> Production).
    *   **Production**: Log drill footage (e.g., 500ft of 4" conduit).
    *   **Submit**: The report is locked and synced to the office.

3.  **811 Tickets**:
    *   Go to **811 Tickets**.
    *   View active tickets on the map.
    *   Upload "Positive Response" photos for valid locates.

### 👑 For Owners (Executive View)
**Persona:** `owner@midwestunderground.com`

1.  **Financial Intelligence**:
    *   Go to **Financials** (`/dashboard/financials`).
    *   View **Real-time Margin** across all active projects.
    *   Drill down into a specific project to see "Estimated vs. Actual" costs.

2.  **Command Center**:
    *   Go to **3D Maps**.
    *   See the live location of all crews and active bores.
    *   Click a bore to view the drilling strip log (simulated).

### 🛠️ For Supers (Resource Mgmt)
**Persona:** `super@midwestunderground.com`

1.  **Dispatch**:
    *   Go to **Dispatch**.
    *   Drag and drop crew members to assign them to tomorrow's projects.
    *   Notifications are sent to the crew app.

2.  **Asset Management**:
    *   Go to **Assets**.
    *   Update engine hours for a drill.
    *   Schedule maintenance.

---

## 🧪 Verification Steps (QA)

| Feature | Step | Expected Result |
| :--- | :--- | :--- |
| **Seeding** | Click "Seed Demo System" | Success toast appears, stats update. |
| **Clock In** | Click "Clock In" | Green "Active" timer starts. |
| **Financials** | Visit `/dashboard/financials` | Charts show revenue/margin data. |
| **Mobile** | Resize browser to <768px | Layout adapts, mobile nav appears. |
