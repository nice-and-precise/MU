export const HELP_CONTENT: Record<string, { title: string; content: string }> = {
    "manual-ticket": {
        title: "Creating a Valid 811 Ticket",
        content: `
### How to Create a Valid EWL
1.  **Open Ticket**: Start a new Locate Request in MU.
2.  **Map the Area**:
    - Use the **Magic Wand** tool to click on a property. MU will automatically snap to the official parcel boundary.
    - *Tip*: If the excavation is only part of the lot, use the **Draw Polygon** tool to refine it.
3.  **Validate**:
    - The system checks your shape instantly. If you see a red "Invalid Geometry" warning, check for crossed lines.
    - **Size Limit**: Keep areas under 2 acres per ticket.

### Physical vs. Electronic-Only
- **Standard (Recommended)**: Draw the polygon AND spray white paint. Upload a photo. This is the safest way to ensure locators see your intent.
- **Electronic-Only (Winter/Remote)**:
    - Toggle "Electronic Only" in the form.
    - You generally do *not* need to upload a photo.
    - **WARNING**: If a utility operator contacts you effectively requesting physical marks, you **MUST** go paint the site.
`
    },
    "ticket-status": {
        title: "Understanding Ticket Status",
        content: `
### Checking Status
MU syncs with GSOC "Positive Response". Check your dashboard:
- **Green**: All clear / Marked. 48h passed. Safe to dig.
- **Yellow**: Waiting on responses.
- **Red**: Conflict or Expired. Do not dig.

### Meet Tickets
If you scheduled a Meet:
- Your legal start time is **48 hours AFTER the meet**, not after filing.
- Document attendees in the "Meet Docs" tab.
`
    }
};
