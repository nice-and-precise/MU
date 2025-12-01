
# Vermeer / DCI WITSML Integration Guide

This guide explains how to connect your HDD rig's data stream to the Midwest Underground "Digital Subsurface" platform.

## Overview
The system accepts drilling data via a REST API endpoint. While we support the WITSML standard concepts, we currently ingest data via JSON or CSV for simplicity and compatibility with DCI LWD exports.

## API Endpoint
**URL**: `https://your-domain.com/api/witsml` (or `http://localhost:3000/api/witsml` for local dev)
**Method**: `POST`
**Content-Type**: `application/json` or `text/plain` (for CSV)

## Supported Formats

### 1. JSON (Recommended)
Send a JSON object or array of objects with the following structure:
```json
{
  "boreId": "bore-uuid-123",
  "depth": 15.0,        // Rod length or incremental depth in feet
  "pitch": 2.5,         // Percentage or Degrees (system assumes Degrees)
  "azimuth": 185.0,     // Compass heading
  "timestamp": "2023-10-27T10:00:00Z"
}
```

### 2. CSV (DCI Export Style)
Send a raw CSV string. The system expects the following column order (no header required if strictly following this):
`Timestamp, BoreID, Depth, Pitch, Azimuth`

Example:
```csv
2023-10-27T10:00:00Z,bore-123,15,2.5,185
```

## Configuring Vermeer / DCI DigiTrak
1.  **Export LWD Data**: Use the DCI LWD Mobile App to export your bore log.
2.  **Select Format**: Choose "CSV" or "Text" export.
3.  **Upload**: Use the "Import Data" feature in the Midwest Underground Dashboard, or use a custom script to POST the file to the API endpoint above.

## Future WITSML Support
Native WITSML XML support (v1.3.1 / v1.4.1) is partially supported via the `/api/witsml` endpoint (POST XML). Full TCP listener support is planned.
