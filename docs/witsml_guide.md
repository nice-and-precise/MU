
# Vermeer / DCI WITSML Integration Guide

This guide explains how to connect your HDD rig's data stream to the Midwest Underground "Digital Subsurface" platform.

## Overview
The system accepts drilling data via a REST API endpoint. While we support the WITSML standard concepts, we currently ingest data via JSON or CSV for simplicity and compatibility with DCI LWD exports.

## API Endpoint
**URL**: `https://your-domain.com/api/witsml` (or `http://localhost:3000/api/witsml` for local dev)
**Method**: `POST`
**Content-Type**: `application/json` or `text/plain` (for CSV)

## Supported Formats

### 1. WITSML XML (v1.3.1 / v1.4.1) - **Currently Supported**
Send a raw XML string containing `trajectory` or `log` objects.
```xml
<trajectorys xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <trajectory uidWell="well-1" uidWellbore="bore-1" uid="traj-1">
    <trajectoryStation uid="stn-1">
      <md uom="ft">100.0</md>
      <incl uom="dega">2.5</incl>
      <azi uom="dega">45.0</azi>
    </trajectoryStation>
  </trajectory>
</trajectorys>
```

### 2. JSON / CSV - **Planned**
Direct JSON and CSV ingestion is currently in development. For now, please convert data to WITSML XML or use the manual import tools in the dashboard.
