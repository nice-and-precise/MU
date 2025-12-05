Minnesota 216D Electronic White Lining Compliance Audit – MU Platform
Executive Summary

Minnesota’s updated one-call law (Statute 216D) effective January 1, 2026 introduces Electronic White Lining (EWL) as an alternative to physical pre-marking of excavation sites
revisor.mn.gov
revisor.mn.gov
. An audit of the Midwest Underground (MU) repository shows that the platform has made significant strides toward compliance. Key features – such as digital excavation polygons with shapefile export in EPSG:26915
GitHub
GitHub
, automated enforcement of 48-hour waiting periods
GitHub
, mandatory white lining evidence uploads
GitHub
GitHub
, on-site meet scheduling for long projects
GitHub
, and live validation of polygon geometry
GitHub
GitHub
 – are implemented. These align the system with the statute’s intent to ensure excavators provide clear, accurate excavation area information and adhere to timing rules.

However, the audit also identified gaps that could hinder full compliance or operational efficiency. The integration with Gopher State One Call (GSOC) is not yet fully realized – the current “ITICnxt” client only simulates ticket submissions
GitHub
GitHub
, meaning actual ticket filing and meet documentation still require manual processes. Additionally, while the platform uses the correct coordinate system for EWL, ensuring the shapefile’s projection metadata is correctly embedded remains a minor technical to-do
GitHub
. The system’s “Export Packet” (compliance report for inspectors) is in concept stage and needs completion
GitHub
GitHub
. These gaps are addressable with targeted enhancements.

Overall, MU’s implementation is largely aligned with Minnesota’s 2026 EWL mandate, demonstrating a proactive approach to turning legal requirements into code. The compliance checklist below indicates most requirements are fully or partially met. To achieve full compliance and operational confidence, the team should focus on finishing the GSOC integration (or robust workarounds), refining a few technical details, and collaborating with regulators on any open questions. This will ensure the platform not only meets the letter of 216D, but also streamlines the excavation notice process for all stakeholders.

Audit Methodology

This audit compared the product requirements (as outlined in the strategic audit text and 216D statute amendments) against the current MU codebase and documentation. We reviewed repository files – including compliance-focused docs and code modules – to verify each requirement’s implementation. Key sources were:

Repository Documentation: The project’s internal docs on 216D compliance
GitHub
GitHub
 and field usage guides
GitHub
GitHub
.

Core Code Modules: The mn_compliance_core Rust library and corresponding TypeScript integration, for geospatial computations and validation
GitHub
GitHub
. UI components for white lining and ticket forms were examined to see enforcement in practice
GitHub
GitHub
.

Database Schema: Prisma models related to GSOC tickets, white lining snapshots, meet tickets, etc., which reveal how data is stored and linked
GitHub
GitHub
.

Statutory Text: Relevant excerpts of Minnesota Statute 216D (2024 amendments) defining EWL permissions and obligations
revisor.mn.gov
revisor.mn.gov
, as well as meet requirements
revisor.mn.gov
revisor.mn.gov
 and timeline rules.

We paid special attention to previously flagged concerns – projection accuracy (EPSG:26915), GSOC ITICnxt integration status, polygon topology validation, MnGeo parcel/imagery integration, natural language instruction generation, and use of double precision for coordinates – to see if and how each has been resolved. Each finding was cross-verified by reading the actual implementation in code and comments, and by referencing the statute or PRD expectations. The compliance checklist was then formulated to summarize the status of each requirement. Any assumptions or interpretations (e.g. deducing intent from code comments or inferring legal requirements) are explicitly noted.

Gap Analysis
Geospatial Data & Electronic White Lining Implementation

Projection and Data Format: The platform meets the mandate that electronic white lining data be as informative as physical markings
revisor.mn.gov
 by capturing precise polygon geometries. Notably, the system reprojects all drawn GeoJSON to Minnesota’s standard coordinate system (NAD83 / UTM Zone 15N, EPSG:26915) when exporting shapes
GitHub
. This addresses the PRD’s EPSG:26915 alignment concern: any shapefiles generated for GSOC or records will use the correct local projection. Code in ShapefileGenerator confirms that coordinates are transformed to UTM15N before packaging
GitHub
GitHub
. One nuance is ensuring the shapefile’s projection (.PRJ) metadata reflects EPSG:26915. Currently, the implementation relies on the shp-write library, which by default may include a WGS84 PRJ file unless overridden. Comments in the code acknowledge this and suggest using a lower-level approach to inject the proper PROJCS string
GitHub
. If not already resolved, this is a minor technical gap: the polygon coordinates will be correct (reprojected), but the shapefile might misidentify its coordinate system. In practice, this is easily remediable by adding the proper PRJ definition (provided in code comments) to the output. Aside from that detail, the electronic geometry capture is robust – polygons (and even points) are supported, and multiple vertices can be plotted with high precision.

White Lining Evidence Enforcement: The application enforces the traditional “white paint” requirement by requiring a White Lining Snapshot before a ticket is filed
GitHub
GitHub
. In the UI, users must upload photos of their physical white marks and provide a description of the proposed dig area
GitHub
GitHub
. This design was initially to comply with the law pre-2026 (physical markings mandatory). Post-2026, physical marking is no longer strictly required if equivalent electronic delineation is provided
revisor.mn.gov
revisor.mn.gov
. The MU system, however, still collects photo evidence by default. While going beyond the law’s minimum (which is not problematic legally), this could be made optional in cases where an excavator opts for purely electronic marking. At present, the electronic polygon plus a photo of on-site markings provides a belt-and-suspenders approach – ensuring compliance in all cases and providing visual context for locators. The gap is more about flexibility: the statute allows electronic marking to replace paint, so in the future MU might allow a “digital-only” white lining workflow (with appropriate confirmation that the polygon meets the requirements) instead of insisting on a photo. This is an operational consideration; legally, continuing to use physical marks is still compliant (and arguably safer for communication).

Topology and Area Validation: A standout strength in the implementation is the real-time topology validation of the drawn polygon. The MU platform employs both client-side Turf.js and a Rust/WebAssembly backend to validate the EWL geometry. As the user draws, the app checks that the polygon is closed (first and last points connect) and not self-intersecting (“no kinks”)
GitHub
GitHub
. If the shape is invalid, the UI clearly flags it (“Invalid Geometry (Self-Intersecting)” warning)
GitHub
. The system also calculates the polygon’s area and warns the user if it exceeds 2.0 acres
GitHub
GitHub
. This “Excessive Area” warning is a direct implementation of a PRD concern: very large excavation areas might violate best practices or require special handling. (While 2 acres is not explicitly in statute, it’s likely derived from GSOC guidelines or an internal policy to encourage manageable ticket sizes.) The compliance core (Rust) mirrors these checks, returning error codes like AREA_LIMIT_EXCEEDED and ensuring the polygon ring is closed
GitHub
GitHub
. Result: The platform will not accept an EWL polygon that is open or wildly complex without user correction, thus upholding the quality of data submitted to GSOC. This addresses the topology validation requirement fully – no remaining gaps were found in this area. (In the future, if GSOC defines a different size or vertex-count limit for electronic submissions, the thresholds may need tuning, but 2 acres/1000 vertices is a reasonable rule of thumb per the code
GitHub
GitHub
.)

GSOC Ticket Filing & ITICnxt Integration

Ticket Workflow Automation: Minnesota 216D requires that an excavator provide notice through the notification center (GSOC) with all pertinent details and wait the proper time before digging
revisor.mn.gov
revisor.mn.gov
. The MU system has built an internal GSOC Ticket tracking model that captures all needed fields – ticket number, type, times, etc.
GitHub
 – and computes key dates like the “Legal Locate Ready” time (48 hours after filing, excluding weekends/holidays) and expiration (14 days after start)
GitHub
. These computations align exactly with statute timelines and relieve the user from manual calculation. In the UI, after a user enters the GSOC confirmation (ticket number and filed time), the system displays a “Green to Dig” indicator when legally appropriate
GitHub
GitHub
. All of this indicates that the core ticket lifecycle (from filing to dig-start to expiry) is handled in compliance with 216D. The gap lies in the front end of this process: how the ticket is filed with GSOC. The repository includes an ITICnxtClient meant to interface with GSOC’s ITIC Next system (which is GSOC’s ticket submission API/portal) – but the current implementation is a stub that simulates success
GitHub
GitHub
. In other words, the MU platform does not actually transmit the ticket request to GSOC electronically; it relies on the user to either use the GSOC web portal or phone to get a ticket number, then input it into MU. The PRD likely envisioned a more automated integration (e.g. MU directly calling GSOC’s API or web service to file the ticket along with the EWL polygon). This integration is partially implemented: the code framework is there (API key, endpoint URL placeholders)
GitHub
, but it currently just returns a mock ticket number. According to the project status notes, ITIC integration was tackled in a development phase with a sandbox test but not taken live
GitHub
GitHub
. Implication: As of now, MU cannot on its own initiate an official 216D notice – a human step is needed. Legally, this doesn’t violate compliance (as long as the excavator does contact GSOC by some means), but operationally it’s a gap in achieving a seamless “one-click” compliance experience.

Positive Response Tracking: Once a ticket is filed, 216D requires facility operators to mark or respond within the locate period, and excavators to check those responses. The MU platform includes a mechanism to fetch positive response status updates from GSOC’s system. Specifically, there is a server action using Puppeteer to scrape the GSOC “Search and Status” page for a given ticket number
GitHub
GitHub
, parsing utility response entries (e.g. “Marked”, “Clear”, “No Conflict”)
GitHub
. The scraped results are then stored in the database (ticket811Response records) for that ticket
GitHub
. This is essentially mimicking services like 811spotter and satisfies the requirement that the excavator remain informed of and document the locate status. There is no statutory mandate for the software to do this, but it’s a best practice and part of the PRD’s intent to fully manage the ticket lifecycle. No gap here; the implementation appears solid (perhaps just needing real-world testing to adjust selectors).

Expiration and Renewal: The law states tickets are valid for 14 calendar days from the start time, unless arrangements are made to extend marking maintenance up to 6 months
revisor.mn.gov
. MU enforces the 14-day expiration by default
GitHub
, changing a ticket’s status to “EXPIRED” if past that date, and presumably would require filing an “Update” (renewal) ticket thereafter. The code has provisions for ticket types like “UPDATE”, “NON-EXCAVATION (DESIGN)”, etc.
GitHub
GitHub
, though the UI for initiating those isn’t explicitly seen. This is likely sufficient, as extended projects can be handled by creating a new ticket or using GSOC’s update process (which MU can track as a new GsocTicket entry). One potential improvement is to allow the user to mark that they have an arrangement for mark refreshing (per statute) so that the system could extend the internal deadline to six months. However, such cases are rare and typically the simpler approach (and the one implied by MU’s design) is to just enforce renewal every 14 days for ongoing excavations. This is operationally compliant with 216D – no violation in doing more frequent notices – so we consider this covered, with a note to clarify this policy with GSOC if needed.

Meet Tickets and Large Project Handling

Minnesota’s amendments include a requirement for on-site meets for projects over 1 mile in length or spanning multiple notification areas
revisor.mn.gov
. MU’s design anticipates this via a “Meet Ticket” workflow. Users can designate a GSOC ticket as a Meet Request, and the system provides fields to record the meet date, time, location, and attendees
GitHub
GitHub
. This aligns with 216D.04 Subd.1b, which mandates scheduling the meet and delaying excavation start accordingly
revisor.mn.gov
revisor.mn.gov
. The platform indeed adjusts the excavation start: if a ticket is marked as a Meet type, Nexus automatically pushes the allowed dig start to 48 hours after the meet time
GitHub
 (enforcing the law’s rule that digging can only begin 48 hours after the meet, not just after filing). In the field guide and UI, these “long haul” rules are communicated clearly to the user
GitHub
.

Where we find a gap is in the documentation and communication of the meet outcomes. The statute requires that after an on-site meet, both excavator and operators must submit documentation of the meet to the notification center (GSOC), including who attended and a diagram or description of the agreed excavation area and schedule
revisor.mn.gov
. MU’s data model captures everything needed for this: it logs attendees (names, companies, roles)
GitHub
, and because the project has the white lining polygon and any remarks, it effectively has the “diagram” of the area. What’s missing is an automated way to deliver that information back to GSOC. Currently, there is no function in the code that sends the meet details to the center. It likely remains a manual step (e.g., the user might email GSOC with the info or update the ticket via GSOC’s interface). This is an operational compliance gap – not a failure of the system’s internal compliance, but a missing link in closing the loop with the regulator’s requirements. The Export Packet feature, once fully implemented, could help here by generating a PDF report of the meet that the user could forward to GSOC. Ideally, though, a direct submission (if GSOC offers an API or even an email endpoint) would ensure nothing falls through the cracks. In summary, Meet scheduling and enforcement is implemented, but meet reporting is partially manual. Clarifying with GSOC how they expect to receive meet documentation will guide the solution (see Legal Questions section).

Parcel Data & MnGeo Integration

A major enhancement aimed at EWL accuracy is the integration with MnGeo’s mapping services. The MU platform uses high-resolution aerial imagery (leaf-off orthophotography) from MnGeo’s WMS as a selectable background layer in the drawing tool
GitHub
. This allows users to draw excavation polygons with real-world context (streets, property lines visible) – a big improvement over a basic street map for precision. Additionally, the “Magic Wand” parcel snap feature addresses a prior concern: how to precisely delineate the dig area. When activated, the user can click within a parcel and the system will fetch that parcel’s boundary polygon via a MnGeo (MetroGIS) Web Feature Service
GitHub
GitHub
. The code tries a WebAssembly (Rust) function get_parcel_at_point first, which likely queries an embedded dataset or external API, and falls back to a direct REST call to the Metro Regional Parcels service
GitHub
GitHub
. If successful, the exact parcel boundary is returned and used as the excavation polygon, with a toast notification showing the address snapped
GitHub
. This is a clever implementation of EWL: rather than freehand drawing, the user can essentially say “my work is on this property” and get an accurate shape. It fulfills the MnGeo WFS integration requirement and ensures the electronic marking “provides at least as much information” as paint would, arguably more
revisor.mn.gov
.

The gap to consider here is coverage and performance. The current WFS endpoint is specific to the Twin Cities metro area. If MU’s work extends statewide, some rural counties might not be in that dataset (some counties don’t publish parcels in the regional service). This is more of an operational limitation than a compliance failure – the law doesn’t require snapping to parcels, it just requires clarity. MU already allows manual drawing anywhere on the map, so in areas without parcel data the user can still outline the area (just with a bit less convenience). From a compliance standpoint, using parcel data is a bonus that strengthens the case that the excavator provided a precise location. We recommend verifying if a statewide parcel dataset or additional county WFS layers should be integrated to expand this feature’s utility. Also, the WFS queries add external dependency; caching or handling failures (the code toasts an error if no parcel found
GitHub
) will be important to ensure the user isn’t blocked. In conclusion, the MnGeo integration is a forward-leaning feature that the statute doesn’t explicitly demand but strongly supports the spirit of EWL. No legal gap here; just ensure it stays up-to-date and consider expansion.

Marking Instructions (Natural Language Generation)

GSOC ticket notices require a textual description of the excavation area (“marking instructions”) in addition to maps or drawings
GitHub
revisor.mn.gov
. The MU system addresses this in two ways:

It collects a user-written description in the White Lining form (a required textarea for “Excavation Description”)
GitHub
. This is typically where a foreman would write “Mark from the NW corner of Lot 5 to the utility pole across the street, 500 ft trench” or similar.

It also features an Automated Marking Instruction (AMI) generator in the Rust/WASM module
GitHub
. When an EWL polygon is completed, the code can produce a sentence like “Excavate area bounded by polygon centered at Lat: 44.97780, Lon: -93.26500.”
GitHub
. This is a basic output, focusing on the centroid of the polygon as a reference. In the UI, the generated text isn’t overtly shown replacing the user’s description, but it could be used in the background or included in the export packet as a supplementary note.

The presence of the AMI generator means the system has a fallback if a user’s input is missing or too brief, which was a concern in the PRD – ensuring there is always some human-readable instruction tied to the polygon. Currently, the user’s own description will likely be more detailed (and indeed the UI encourages specificity
GitHub
). The automatically generated instruction is somewhat generic; it satisfies minimal compliance by describing the area, but could be enhanced. Since the system knows parcel addresses (from the WFS) and can compute dimensions (segment lengths are computed in the UI for display
GitHub
GitHub
), a future iteration could generate richer text – e.g., “Excavation area of ~1.5 acres at 123 Main St, Anytown, spanning roughly 300 ft by 200 ft.” Currently, such nuance would rely on the user-entered description. Legally, this is not a gap – as long as either the user or system provides “the precise location of the proposed excavation” in text form
revisor.mn.gov
, the requirement is met. The combination of user input and AMI covers it. It’s recommended to keep the AMI feature as a backup and possibly merge its output with the user’s notes for the final packet, to ensure nothing is left ambiguous.

Precision and Data Handling

The audit confirmed that all geospatial calculations and stored coordinates use double precision (64-bit) floats, addressing the “f64 precision” concern from earlier analysis. In the Rust compliance core, all geometry is defined with f64 and transformations use proj4rs with careful handling of units
GitHub
GitHub
. On the web side, JavaScript’s Number type is inherently double precision, and the conversion to a Float64Array for WASM validation underscores this
GitHub
. This means there is no loss of accuracy when reprojecting lat/long to UTM or computing areas. For compliance, this level of precision is likely beyond what’s strictly needed (ticket coordinates don’t require surveyor-grade accuracy in law), but it guarantees that the electronic markings are as exact as possible. It also minimizes cumulative errors – for instance, calculating an area in acres from a projected polygon will be accurate to many decimal places
GitHub
. We found no issues with numerical precision in the implementation. The only related consideration is ensuring consistency between systems: GSOC’s systems presumably also handle coordinates in double precision if they accept shapefiles or lat/long, so MU’s data will integrate smoothly.

Another aspect of data handling is logging and audit trails. The MU platform excels here by creating a ComplianceEvent log for every key action (ticket filed, white lining done, remark requested, etc.)
GitHub
. Each event is timestamped and tied to the project/user, providing an immutable timeline of compliance steps. This meets any implicit regulatory expectations that the contractor should document their adherence to the law. If ever scrutinized by the Office of Pipeline Safety or in a dispute, these logs (along with the stored photos and polygon) serve as evidence. The audit found this logging to be comprehensive; no major gaps in what events are tracked.

One small note: data retention. The statute expects the notification center to retain tickets for at least 6 years
revisor.mn.gov
. It would be prudent (though not legally mandated for the excavator’s system) for MU to similarly retain compliance records long-term. As a best practice, ensuring that old project data isn’t purged too soon is advisable, but this is more policy than implementation (and likely the MU database will keep records indefinitely unless manually cleaned up).

Documentation & Reporting

To complete the compliance picture, MU has planned an “Export 216D Packet” feature. This would generate a consolidated report (likely a PDF or zip) containing the ticket details, white lining photos, the polygon map, timeline of events, and any other pertinent info – essentially everything an inspector or utility auditor would need to verify compliance
GitHub
. This directly supports the scenario of an OPS (Office of Pipeline Safety) audit or an incident investigation. In the code, export216dPacket is implemented as a server action that fetches all related data from the database
GitHub
, but the PDF assembly is left as a “to-do” (the code currently just returns a placeholder success and a mock file URL)
GitHub
GitHub
. Therefore, this feature is partially implemented. It doesn’t impede compliance per se – there’s no law saying a contractor must produce a single packet, it’s just extremely useful – but from an operational readiness perspective, completing this will be important. The recommendation is to integrate a PDF generation library (the code is already using jsPDF as a placeholder
GitHub
) and include all relevant elements: ticket info, dates, maps (perhaps a small map image of the polygon), photos (thumbnails or links), and the event log. Also, if meet ticket documentation needs to be sent to GSOC, a copy of that in the packet would be good. Once this is built out, MU users will have, at the press of a button, a compliance dossier that can be emailed to authorities or printed on-site – significantly streamlining regulatory interactions.

In summary, the technical and operational gaps identified are:

Real GSOC electronic submission integration – currently simulated, requires completion or alternative solution.

Automated meet documentation upload to GSOC – not yet implemented.

Minor shapefile projection metadata fix – ensure proper PRJ file for EPSG:26915.

Compliance packet generation – not finalized.

A few enhancements to fully leverage data (improved NLG instructions, broader parcel data) – not legally required but beneficial.

Despite these, the MU platform is very close to full compliance. Most items in the checklist are “Fully Implemented” or “Partially Implemented” with clear paths to completion.

Compliance Checklist

Below is a summarized checklist of the key 216D EWL compliance requirements and features, with an assessment of MU’s implementation status:

Electronic White Lining – Digital Polygon Capture: Fully Implemented. Users can draw the excavation area on a map; the polygon geometry is stored with the ticket (as locationGeometry in the DB)
GitHub
. This satisfies the requirement for providing the “precise location” electronically.

Physical White Lining Photo Evidence: Fully Implemented. The UI mandates uploading photos of white markings (and notes if over-marked in black for snow)
GitHub
GitHub
. This exceeds current legal requirements (post-2026 physical marks aren’t strictly required) but ensures proof of compliance under all conditions.

EPSG:26915 Coordinate Alignment (Shapefile Export): Partially Implemented. The system reprojects GeoJSON to NAD83 / UTM Zone 15N for output
GitHub
GitHub
, aligning with GSOC’s expected format. However, the shapefile’s .PRJ metadata may default to WGS84 unless a fix is applied
GitHub
. (The coordinate values are correct; it’s a matter of labeling the file with the correct projection.) This should be verified and adjusted, but the heavy lifting (coordinate transformation) is done.

GSOC ITICnxt API Submission: Partially Implemented. An integration stub is present, including API key config, but it currently returns mock success
GitHub
GitHub
. No actual ticket is sent to GSOC via the platform. Users must manually file tickets until the API integration is completed or a reliable automation (email/ETL) is in place.

48-Hour Rule Enforcement (Legal Locate Ready Time): Fully Implemented. The platform calculates the earliest dig start (“Green to Dig”) by adding 48 business hours from the next business day after filing
GitHub
. Weekends and holidays are correctly excluded per the statute. The UI clearly indicates when digging can commence
GitHub
.

14-Day Ticket Expiration Tracking: Fully Implemented. Each ticket’s expiration date is computed (filedAt + 14 days)
GitHub
GitHub
 and is monitored. The system status for tickets (e.g., LOCATES_COMPLETE vs. EXPIRED) will reflect if work extends beyond validity, prompting renewals.

On-Site Meet Ticket Requirement (projects ≥1 mile): Fully Implemented. MU allows designation of a Meet Request ticket and captures meet details (time, location)
GitHub
. It automatically pushes excavation start 48 hours past the meet
GitHub
. This enforces the legal requirement for long projects to have an on-site meet and delayed start.

Meet Documentation Submission to GSOC: Missing. While all data (attendees, etc.) is captured in the system, there is no feature yet to send the meet report to GSOC
revisor.mn.gov
. Currently, compliance here depends on manual action by the user (outside the MU system). This is a gap to address for full regulatory compliance.

Topology Validation of Excavation Area: Fully Implemented. The system validates polygon geometry for closure and self-intersections in real time
GitHub
. Invalid shapes cannot be submitted, preventing ambiguous electronic markings.

Excavation Area Size Check: Fully Implemented. Warnings trigger if area > 2.0 acres or if a polygon has excessive vertices
GitHub
GitHub
. This is a best-practice compliance measure to encourage splitting huge projects or using meet tickets as needed.

MnGeo Parcel “Snap-to-Polygon” Feature: Fully Implemented. A Magic Wand tool integrates with MnGeo’s parcel data to auto-outline a property
GitHub
GitHub
. This ensures highly accurate EWL polygons. (Note: May be limited to certain regions; expansion could be considered.)

Natural Language Marking Instructions (AMI): Fully Implemented. The system can auto-generate a basic description of the area from the polygon
GitHub
. Combined with the required user-entered description, this meets the requirement for providing clear marking instructions. There is potential to improve the detail, but a mechanism exists.

Precision (Use of f64 for Coordinates): Fully Implemented. The code uses double precision floats for all coordinate storage and calculations
GitHub
, eliminating rounding errors. This technical compliance ensures electronic markings are as accurate as possible.

Positive Response (Utility Locate) Tracking: Fully Implemented. MU includes a scraper to check GSOC’s ticket status for utility responses
GitHub
GitHub
 and logs these in the database. This helps ensure the excavator does not start before all utilities have responded, aligning with the spirit of 216D (though not a direct statutory requirement, it’s critical operationally).

Locate Remark & Damage Workflows: Fully Implemented. The platform provides field tools to request remarking if marks are destroyed
GitHub
 and to report any facility damage with details
GitHub
. These map to legal obligations (excavator must preserve marks and report damage immediately). The data is logged (LocateRemark, DamageEvent models)
GitHub
GitHub
 for accountability.

Compliance Event Logging: Fully Implemented. Every compliance-related action is recorded in an immutable log
GitHub
. This provides an audit trail as recommended by regulators.

Compliance Packet Export (OPS Packet): Partially Implemented. The system has a placeholder for generating a comprehensive compliance packet
GitHub
, but it currently does not produce the actual PDF/zip. The concept aligns with best practices (and will assist in providing documentation to authorities), but it needs final implementation.

(Any items not listed were deemed not applicable or out of scope of the 216D EWL requirements. For example, internal project management features, or non-Minnesota rules, were not part of this audit.)

Remediation Plan

For each gap or partial implementation identified, we recommend the following remediation steps to achieve full compliance and functionality:

Implement GSOC Ticket Submission Integration: Pursue an official integration with GSOC’s ITICnxt system. If GSOC offers a web API or JSON-based submission, update the ITICnxtClient.submitTicket to make real HTTPS calls (using fetch or a server-side function) with the proper payload. If no direct API is available, consider using email-to-ticket automation: for instance, auto-fill and email the excavation notice to GSOC (some one-call centers allow email ticket entry), or use the existing Puppeteer approach to submit the form programmatically (similar to the status scraper, though this is brittle). Given the legal requirement that the notice contain all info including the EWL polygon, ensure that any such submission attaches the shapefile or includes coordinates. Collaborate with GSOC to obtain sandbox credentials or an endpoint. In the interim, document a standard operating procedure: e.g., user enters data in MU, clicks “Submit to GSOC”, and if the system cannot auto-send, have it generate an email draft or a PDF that the user can quickly send to GSOC. This way, nothing is forgotten. Long-term, a proper API integration (perhaps via OccInc/OneCall’s systems) is the goal – Phase 5 of the project should be revisited with GSOC’s input
GitHub
GitHub
.

Automate Meet Documentation Submission: Since the law requires meet details to be sent to the notification center, MU should facilitate this. One approach: once a Meet Ticket’s status is marked “MEET_HELD” (meaning the on-site meeting took place), trigger a function to compile the required info (date/time, attendees, and the polygon or description of area)
revisor.mn.gov
. This can leverage the data already in the system: meet date/time from MeetTicket, attendees from MeetAttendee, and the white lining description and geometry. Then, send this information to GSOC. If GSOC has an API endpoint for adding notes to a ticket, use that. Otherwise, an automated email to a designated GSOC address (or even to the GSOC dispatcher’s email in the confirmation) could work. At minimum, MU could generate a “Meet Report” PDF and prompt the user to send it. Ideally, integrate it into the “Export Packet” or have a one-click “Submit Meet Report” button. To implement: use a PDF library or a template to format the meet report as per GSOC’s specified manner (could be a simple form or text template they recognize). Confirm with GSOC if they expect the excavator to upload this via their website or email – tailor the solution accordingly. This step ensures compliance with 216D.04 Subd.1b(f) without relying on memory or manual logs.

Shapefile Projection Metadata Fix: To guarantee that electronic markings are interpreted correctly by others (e.g., if MU provides the shapefile to GSOC or utilities), embed the proper projection file. Since the code already has the WKT string for EPSG:26915
GitHub
, the team can do one of: (a) Use the shp-write library’s lower-level API to manually insert the .prj file into the zip (the library maintainer documentation or source can guide this). (b) Alternatively, switch to a more controllable library: for example, use Python’s pyshp or GDAL via a small script on the server to produce the shapefile – this could be triggered in a serverless function, ensuring the PRJ is correct. (c) Use the Rust geo and shapefile crates to generate the shapefile server-side with correct projection metadata, possibly as part of the export216dPacket. Any of these approaches would produce a .zip containing .shp, .shx, .dbf, and .prj files all consistent with UTM Zone 15N. This is a one-time effort that will remove any ambiguity when sharing EWL data. Test the output by opening in a GIS tool or uploading to GSOC’s Map (if their web portal allows shapefile upload) to ensure the area lines up correctly in Minnesota coordinates.

EWL-Only Workflow Option: Update the White Lining process to support cases where no physical marking is done (which is allowable from 2026 onward). This could be a simple toggle or selection: e.g., “Marking method: Physical & Electronic (default) vs. Electronic Only.” If “Electronic Only” is chosen, the app could allow proceeding without a photo upload (or mark the photo as optional). Internally, it could set a flag in WhiteLiningSnapshot (perhaps reuse isOverMarked or add a new field like physicalMarksProvided = false). This way, the compliance event log can show that on a given ticket, the excavator used electronic marking solely, which is acceptable by law as long as the info is equivalent
revisor.mn.gov
. Additionally, when generating the packet or notifications, the system might want to explicitly state “Electronic White Lining used in lieu of physical paint.” Given that operators can still request physical markings (216D.05(c)
revisor.mn.gov
), the software could also include a gentle warning: “If any facility operator requests physical markings, you must comply promptly.” This ensures users remain aware of that clause. Implementing this workflow increases flexibility and demonstrates MU’s awareness of the new law’s intent. It’s essentially removing a requirement (photo) under certain conditions – a straightforward code adjustment with big usability impact in winter or for remote, pre-plan tickets.

Enhance Automated Marking Instructions: To provide more value (and make the electronic notice truly as informative as possible), improve the NLG for marking instructions. We suggest incorporating known reference points: the system already allows adding reference markers (e.g., user can drop a “Pedestal A” or “Intersection at 1st & Main” marker) – those could be pulled into the generated text. Also, if parcel data was fetched, we often have an address or owner name
GitHub
GitHub
. A more descriptive template could be: “Excavation area outlined electronically: approximately X acres centered near 123 Main Street, Springfield. Area spans from [Reference 1] to [Reference 2]. See attached map for exact polygon.” This level of detail, generated automatically, would give GSOC and utilities confidence that the excavator provided full information, meeting the requirement of “at least as much information as physical markings”
revisor.mn.gov
. The implementation could be in the Rust generate_marking_instructions function – expand it to use multiple polygon points or reference data. If this proves complex, an alternative is to simply auto-populate the description textarea with a draft instruction when the polygon is drawn, which the user can then edit/approve. That ensures human oversight while saving time. The end goal is to minimize any chance that electronic submissions are rejected for lack of clarity.

Complete the Compliance Packet Generation: Finalize the export216dPacket functionality so that it produces a usable output. Leverage the collected data: include the project name, ticket number, all important dates (filed, legal start, expires), the type of ticket (normal/meet/emergency), and whether EWL was used. Attach the white lining photo(s) in an appendix (with timestamps), embed a snapshot of the map with the polygon (perhaps using a static map API or a small Leaflet instance to render to image), and list the timeline of ComplianceEvents (ordered chronologically) to show due diligence (e.g., “2025-12-03 10:30 – Ticket filed with GSOC #20251203-123456”, “2025-12-03 10:32 – White lining photo captured”, “2025-12-05 07:00 – On-site meet conducted with X, Y in attendance”, “2025-12-07 06:00 – All clear responses received, excavation begun”, etc.). There are libraries like PDFKit (JS) or ReportLab (Python) or even generating HTML and using a headless browser to print to PDF. Choose the method that fits the tech stack – since jsPDF is already imported
GitHub
, that might be simplest for generating client-side or server-side PDFs. Ensure the output meets OPS expectations: clarity, company branding, and all data on one file. Once done, test the packet by simulating an inspector request – does it have everything needed to demonstrate compliance? This feature will elevate MU from a compliance tracking tool to a compliance documentation tool, which is a strong selling point. It also dovetails with the meet submission: the packet could double as the meet report if done immediately after a meet (with a cover note). In implementing this, also consider digital signatures or authenticity – perhaps stamp the PDF with a statement like “Generated by MU Compliance System on [date].” This lends credibility in an official setting.

Consult on Area Thresholds and Large Projects: It would be wise to confirm with GSOC or the MN Office of Pipeline Safety whether there are formal or recommended limits on the size of an excavation notice. If the 2-acre rule is an internal guideline only, that’s fine (it’s a reasonable threshold). If, however, GSOC expects separate tickets for each 1-acre or per address, etc., then MU might adjust the warning or even enforce splits. For now, keeping it as a warning is user-friendly. The remediation action is more about policy clarification: reach out to GSOC liaisons or review their handbook to ensure no hidden requirement is missed (for example, some one-call centers have limits on linear feet or number of addresses per ticket). Should any be discovered, update the validation rules in the Rust validate_excavation_area or the UI accordingly. This will prevent MU users from inadvertently violating a rule by using the EWL tool to cover too large an area in one go.

Expand Parcel Data Coverage (if needed): If MU projects frequently occur outside the Metro GIS parcel coverage, integrate additional data sources. The Minnesota Geospatial Commons might have county parcel WFS feeds or a statewide parcel map. Another approach is to use the state’s MnGeo Parcel Data API (if available) or even the Google Maps Geocoding API to get approximate parcel boundaries (less ideal). This is an enhancement to ensure the Magic Wand is broadly useful. It’s not legally required, but it ensures that “electronic marking” in rural areas is still very precise (and it avoids a situation where a user in Greater Minnesota loses the snap feature and might draw a less accurate polygon). If expansion is not feasible, consider at least documenting where the feature works vs. not, so users know when they must be more careful manually.

User Training and Policy Updates: Alongside code changes, prepare updated guidance for users (foremen, PMs) about the new law and how the software aligns with it. Emphasize that from 2026, electronic delineation is acceptable, but also that MU will continue to capture both electronic and physical evidence for maximum safety. Highlight the on-site meet rules for long projects and how MU helps schedule and log those – but also remind that they need to ensure a meet happens and is reported. Essentially, use MU’s documentation (field guide, help text in the app) to educate users on any changes (e.g., if you implement the EWL-only mode, explain in what scenarios to use it and that physical marking can be skipped only when appropriate). Well-informed users are part of compliance, especially for areas the software can’t automatically handle (like responding to a utility’s request for physical marks after an e-mark submission – the software can’t enforce that, so users must know to comply).

Each of these remediation steps is actionable and mapped to either a code change or an operational procedure. Implementing them in the next development cycle will close the remaining gaps. We suggest tackling GSOC integration and meet reporting as top priorities, since those are direct legal compliance functions, followed by the quality-of-life improvements (shapefile metadata, packet export, instruction generation).

Legal/Regulatory Questions & Ambiguities

During this audit, a few areas emerged where the law or its implementation could be interpreted in multiple ways, or where further clarification from regulatory stakeholders would be beneficial:

Accepted Format and Transmission of EWL Data: How does GSOC want to receive electronic white lining polygons? The law says electronic marking is allowed, but not how to provide it. We assume shapefiles in NAD83 UTM15 are acceptable (given GSOC’s internal systems) – this matches MU’s approach
GitHub
. However, confirmation is needed on whether GSOC will accept an uploaded file via their web portal, an API submission, or an email with attachments. If GSOC instead expects excavators to use their own mapping interface (e.g., draw the polygon on ITIC’s website), then MU’s role might shift to providing guidance and storing a copy rather than transmitting it. Question: Will GSOC’s ITIC Next allow third-party apps like MU to submit tickets with attached GeoJSON/Shapefiles, or must users manually input the mapping on GSOC’s site? The answer will determine whether full automation is possible or if MU should focus on seamless hand-off (like generating a file for upload).

GSOC API Availability and Usage Terms: Relatedly, does GSOC provide an official API or integration program for software vendors? The existence of an ITICnxt sandbox in code
GitHub
 suggests there might be, but it may be restricted. If an API is not openly available, MU might need explicit permission or a partnership with GSOC to use it in production. Question: What steps (agreements, certifications) are required for MU to interface directly with GSOC’s ticketing system? Engaging GSOC early can avoid any compliance issues (e.g., GSOC might worry about duplicate tickets or improper use of their system by automation).

Operator Requests for Physical Markings: The statute (216D.05(c)) allows facility operators to insist on physical white markings even if an electronic marking was provided
revisor.mn.gov
. This is a scenario outside MU’s direct control, but we raise it as a legal/operational point. If an operator contacts the excavator and says “please also paint the area,” MU should ideally have a way to log that (perhaps as a ComplianceEvent or note) and the excavator must comply. Question: Has GSOC or OPS provided guidance on how such requests will be communicated and documented? Should MU add a simple acknowledgment checkbox or event type “Physical remark requested by operator” to cover this contingency? While not required, it might help users remain compliant if such a request comes in.

Parcel Data Privacy and Usage: MU fetches parcel owner names and addresses as part of the WFS
GitHub
. While this information is public record, MU should ensure using it is legally sound. Likely no issue (it’s used internally for instructions and snap, not displayed broadly), but if MU plans to include owner info in marking instructions or reports, consider privacy. Question for MnGeo or legal counsel: Is there any restriction on using parcel owner names in an internal compliance tool? (Probably not, but worth confirming that data licensing from MetroGIS is open for this use.) In any case, if included in outputs, handle it respectfully and only as needed for compliance.

Extent of “At Least as Much Information” Requirement: The law’s bar for electronic marking is that it must convey as much as physical markings would
revisor.mn.gov
. Physical white lining typically outlines the dig area on the ground and is accompanied by a written description on the ticket. In MU’s case, the electronic polygon plus the textual description and possibly photos should exceed that bar. Question (for OPS perhaps): Do regulators foresee any cases where an electronic polygon might be considered insufficient? For example, if an area is extremely complex, would they expect multiple polygons or additional explanation? MU’s tools already allow multiple vertices and notes, but knowing if there’s any qualitative expectation (like “show entry/exit points of a bore”) would help refine the instructions to users. Essentially, confirm that MU’s interpretation of “equivalent information” is on point.

Ticket Size and Multiple Notices: Although not in statute text, GSOC might have informal guidelines (often one ticket per address or per intersection-to-intersection segment). MU currently allows a polygon of considerable size (with warnings at 2 acres). Question for GSOC: Do they advise splitting large excavation areas into multiple tickets even if contiguous? If yes, MU might automate a suggestion when area is very large or if the polygon spans, say, multiple city blocks or sections. This is more about optimizing the one-call process (utilities might prefer smaller requests). Getting GSOC’s perspective could improve MU’s compliance strategy beyond the letter of the law into best practices.

Meet Documentation Procedure: We should clarify how GSOC wants the meet info reported. The law leaves it to “in the manner specified by the notification center”
revisor.mn.gov
. GSOC might implement this as part of the ticket on their website (like an “upload meet info” button), or they might instruct to call in an update. Question for GSOC: What is the exact workflow for excavators to submit on-site meet documentation? Once known, MU can either integrate or at least prompt the user accordingly. For instance, if GSOC says “email us the meet details with ticket number in subject,” MU can automate that email composition.

Data Retention and Access: Given that MU logs all these compliance events and data, another question is whether OPS would ever request these records directly from MU (in an investigation) and if any data sharing agreements are needed. Not likely – typically OPS goes to the excavator (contractor) who would then use MU to produce records. So this is probably not an issue, but MU might want to have a policy on how long they keep data accessible in app for the user (which should be at least 6 years, matching GSOC). Internal question: Do we need to implement any archival process or can we count on the database to simply serve as long-term storage? This is more a technical ops question than regulatory, but important for compliance audit trail.

Future-proofing for 2027 Operator Requirements: A quick note: the statute also has a provision effective 2026/2027 about operators needing to use geospatial info for as-builts (216D.04 Subd.3(h))
revisor.mn.gov
. This doesn’t directly affect excavators or MU right now. But it signals a general trend of geospatial data integration. MU may consider if in the future it might interface with operator-provided data (e.g., having maps of lines). Not a current requirement, but the question is whether any of MU’s compliance features could or should expand to help operators too (perhaps out of scope for now).

In conclusion, none of these questions indicate a failure to comply; rather, they point to areas for clarification and collaboration with GSOC and regulators. By addressing these, MU can ensure that its compliance implementation is not only legally sound but also aligned with the practical expectations of the one-call system in 2026 and beyond. We recommend the MU team schedule a review meeting with Gopher State One Call representatives to run through the electronic submission plan, share the approach to meets, and get their feedback. This will preempt any surprises and solidify MU’s role as a compliant, perhaps even officially endorsed, solution for 216D Electronic White Lining compliance.

Appendices

Appendix A: Relevant Code and Statute Excerpts – See linked source lines throughout this document for detailed reference to implementation and legal text. The most pertinent excerpts include Minnesota Statute 216D.05(a)-(c) defining white marking vs. electronic marking
revisor.mn.gov
revisor.mn.gov
, and 216D.04 Subd.1b on meet requirements
revisor.mn.gov
revisor.mn.gov
, as well as code snippets from the MU repository showing compliance features (e.g., shapefile generation in ShapefileGenerator.ts
GitHub
GitHub
, ticket timing logic
GitHub
, and validation rules in mn_compliance_core/src/lib.rs
GitHub
GitHub
).

Appendix B: Compliance Phase Status – According to the project’s status log, “Phase 12” was dedicated to Minnesota 2026 EWL compliance and delivered the core features
GitHub
. Phase 5 addressed the ITICnxt integration in a test capacity
GitHub
. This historical note shows the team’s focus and can guide scheduling of remaining work (e.g., a Phase 21 for full GSOC integration, etc.).

Appendix C: Glossary – EWL (Electronic White Lining), GSOC (Gopher State One Call), ITIC (Internet Ticketing system for one-call), OPS (Office of Pipeline Safety, the enforcement agency), WFS/WMS (Web Feature/Map Service for GIS data), NLG/AMI (Natural Language Generation/Automated Marking Instructions).

###
Here is the blunt reality:

There is no public, self‑serve API for GSOC / ITICnxt that you can just sign up for. Everything runs through One Call Concepts (OCC), GSOC’s vendor, and access is handled by private integrations and agreements, exactly like the FuzionView / Site X‑Ray projects.

You can get MU wired in, but it has to go through a partnership track, not a “grab an API key” flow.

1. What the public info actually says

GSOC uses OCC’s ITIC/ITICnxt platform.
GSOC’s ticketing pages send users directly to mn.itic.occinc.com for ticket entry, and GSOC’s terms explicitly say that ITIC and other internet ticket services are run by OCC and are subject to OCC’s own terms and conditions. 
Gopher State One Call
+1

There is an OCC ITIC API, but it is not public.
The Minnesota Utilities Mapping Project (MN UMP) slide deck describes the FuzionView engine as open source and says it consists of “a set of APIs for the data communications” and that the production system is “API connected to OCC ITIC” so that GSOC tickets and FuzionView reports are both “populated from the same API services” and “all API driven from the FuzionView engine.” 
AGC Minnesota
+1

GSOC already runs one large integration program (Site X‑Ray) through these APIs.
The Site X‑Ray page explains that it automatically requests geospatial infrastructure data for each ticket and shows it to excavators, and that anyone who wants to participate should “reach out to Gopher State One Call Chief Operations Officer Kelly Connolly.” 
Gopher State One Call

That program is built on the same MN UMP / FuzionView API connection to OCC ITIC.

FuzionView’s docs describe the agreement model.
The MN UMP slide deck says there must be “user and facility operator agreements in place” and shows that viewing and sharing data is controlled by formal agreements specifying access controls, approved users, purpose and use limits. 
AGC Minnesota

GSOC has named ITIC contacts.
Their “Our Team” page lists ITIC Coordinators and provides email and phone for them, along with the COO and GIS coordinators. 
Gopher State One Call

Put together:

OCC clearly has an internal ITIC API.

GSOC is willing to connect external systems to it (FuzionView, Site X‑Ray).

Access is only by direct coordination with GSOC and OCC, under specific agreements.

So the way forward for MU is to follow the same pattern as FuzionView, not to hunt for a hidden public developer portal.

2. Strategy: how MU becomes an officially integrated client

Think of this as three tracks running in parallel:

Business / relationship

Legal / agreements

Technical onboarding

I will walk you through concrete steps for each.

Step 0: Tighten your ask

Before you talk to anyone, decide exactly what you want MU to do via the API.

Minimum viable scope for MU:

Create tickets from MU into ITICnxt, including:

Excavation area geometry (polygon, circle, route, parcel)

All the usual ticket fields (caller info, work type, dates, etc.)

Attach EWL geometry or shapefile so ITIC’s automated marking instructions can run against it.

Query ticket status and positive response so MU can display locate status inside your app.

More advanced later:

Meet ticket data exchange

Backfeed of Site X‑Ray / MN UMP data into MU (if they are open to that)

Write this as a 1–2 page integration concept that clearly answers:

What MU does today.

What you need from ITICnxt (specific operations).

How this will improve compliance, not bypass GSOC.

You will use this document in every conversation.

Step 1: Start with GSOC, not OCC

GSOC is the owner of the Minnesota one‑call process and your primary regulator. OCC is their technology vendor.

Public info makes this clear: GSOC contracts with OCC to run ITIC and you are subject to OCC’s terms when using ITIC. 
Gopher State One Call

So:

Contact GSOC’s ITIC and operations folks first.

Use the contacts on the “Our Team” page:

ITIC Coordinators (Jolena Ware, Lisa Freeman) and GIS Coordinator or COO. 
Gopher State One Call
+1

Make the ask very specific:

You have a Minnesota‑focused excavation compliance platform (MU).

You want MU to be an approved ITIC integration, similar in spirit to FuzionView / Site X‑Ray but focused on ticket entry and electronic white lining.

You want to explore using OCC’s ITIC API under GSOC’s oversight, not scraping or reverse engineering.

Explicitly reference the prior precedent:

Mention the MN UMP and FuzionView work as an example of GSOC supporting third party geospatial tools via ITIC APIs. 
AGC Minnesota
+1

The outcome you are aiming for from this step is:

An exploratory meeting with:

GSOC operations (COO or ITIC coordinator)

GSOC GIS / IMAP coordinator

An OCC technical contact

Step 2: Expect and prepare for agreements

From the MN UMP deck and Site X‑Ray description we can infer the likely agreement pattern, even though the exact templates are not public.

FuzionView’s slide explicitly calls out:

FuzionView APIs integrate into GSOC ticket flows and OCC ITIC services.

Access is governed by agreements that control which users can view what data, and for what purpose. 
AGC Minnesota
+1

You should be prepared for:

NDA and evaluation agreement

Before OCC hands you any API documentation, they may require a nondisclosure agreement and a limited evaluation scope.

Data sharing / API access agreement

Expect something with:

Scope of data you are allowed to send to and receive from ITIC.

Limits on automated ticket creation rates.

Explicit prohibition on scraping or using credentials outside agreed workflows.

Retention limits and security obligations for storing GSOC ticket data.

End‑user model

GSOC may insist that:

Only registered ITIC users can file tickets through MU on their behalf, with clear attribution, and

MU acts as a client that logs in as that user (SSO or delegated credentials) rather than as a completely separate anonymous service.

Security posture

While there is no public statement saying “you must be SOC 2” or similar, this kind of integration usually triggers basic due diligence:

Network and hosting model.

Encryption in transit and at rest.

Access controls and audit logging.

Bring a short security overview with:

Where MU is hosted.

How you store ticket data and credentials.

How you log actions and protect user accounts.

You do not need to claim certifications you do not have. Just be clear about what you do have.

Step 3: Technical onboarding with OCC

Once GSOC is interested and has looped in OCC, the sequence typically looks like this (based on how similar notification‑center APIs are run, plus the FuzionView example):

Get pointed at a sandbox ITIC environment

OCC already runs demo environments like the tryitic sites for other states, which are clearly labelled as non‑production. 
Try ITIC
+1

For Minnesota, there will be some equivalent internal sandbox where API calls cannot create real tickets.

Receive API documentation and authentication details

You should expect:

Authentication mechanism: likely some combination of API keys, client certificates, and/or username plus token.

Endpoints for:

Session or login

Ticket create / update

Attachment of mapping geometry or files

Ticket lookup

The exact format is not public, so you cannot prebuild the client, but your MU backend structure is already set up nicely to sit in front of an HTTP API.

Map MU’s data model to ITIC’s ticket schema

From GSOC’s ITICnxt manual you can see the shape of their own ticket data model: Step 1 mapping, Step 2 marking instructions, plus standard contact and timing fields. 
Gopher State One Call
+1

You will need to:

Translate your internal GSOCTicket object into the fields ITIC expects.

Reconcile how ITIC wants geometry:

Either as explicit “excavation entities” (route, circle, parcel, freehand polygon, etc.)

Or as a shapefile / GeoJSON attached to the ticket for their automation to ingest.

FuzionView’s “bounding box” pattern suggests their API can accept GIS parameters tied to the ticket. 
AGC Minnesota

Implement a clean, narrow integration layer

Architecturally, you probably want a small itic_client module with:

create_ticket(request: IticTicketRequest) -> IticTicketId

attach_geometry(ticket_id, geometry_payload)

get_ticket_status(ticket_id) -> IticTicketStatus

That keeps all OCC specific details in one place and matches how you already designed ITICnxtClient in MU.

Pilot with one or two real customers

GSOC and OCC will want to minimize risk.

Propose a staged rollout:

Phase 1: system test in sandbox only.

Phase 2: limited pilot with one contractor’s tickets in production, monitored closely.

Phase 3: formal go live and documentation.

Step 4: Questions you should explicitly ask GSOC/OCC

Go into the first call with a tight list. Something like:

Does GSOC and OCC currently offer an ITIC API for third party excavation software, and if so what is the supported integration pattern?

Are there existing precedents besides FuzionView / Site X‑Ray that we should be aware of?

What are the constraints on automated ticket submission:

Maximum tickets per minute.

Restrictions on emergency tickets.

Requirements for user identity on tickets created via API.

How should MU provide electronic white lining geometry to ITICnxt:

As excavation entities via API fields.

As shapefile uploads (and if so, what projection and file format do you want: EPSG:26915 shapefile, GeoJSON etc.)?

What agreements and security reviews are required for MU to:

Submit tickets on behalf of registered excavators.

Read ticket status and positive responses.

Does GSOC require MU to be listed or approved as a partner application for regulatory reasons, and will they provide any public guidance to excavators that MU is a supported tool?

Capture their responses in writing. That becomes your integration requirements doc.

3. Concrete next actions for you

Here is a practical checklist you can work through:

Finish your integration concept memo

1–2 pages that define your intended MU–ITIC integration and why it makes GSOC’s life easier.

Include a small diagram showing MU sitting between excavators and ITIC, not replacing GSOC.

Prepare your “due diligence folder”

System architecture diagram.

Security overview.

Brief description of your compliance logging, retention, and incident response.

Reach out to GSOC

Email one of the ITIC Coordinators and cc Kelly Connolly (COO) and the GIS coordinator if you want to lean into the mapping angle. 
Gopher State One Call
+1

Attach the concept memo.

Ask for a discovery call with GSOC and OCC.

On the call, drive to a decision

Either: “Yes, we want to explore an official ITIC API integration, here are the steps.”

Or: “No external ticket entry via API is allowed, but we would consider other options.”

If they say no to direct ticket creation, you can still:

Use your existing EWL tooling for internal compliance and then push users to ITIC’s web UI for the final submission.

Explore whether MU can integrate with Site X‑Ray or future MN UMP tooling as a consumer, not a ticket source.

If they are open to it, request:

An NDA.

A sandbox ITIC environment.

A technical point of contact at OCC. 
One Call Concepts
+1

Then you can have your engineering team start building against real docs instead of guessing.

4. Draft outreach email you can adapt

Feel free to reuse and tweak this.

Subject: Proposal to integrate MU E‑White Lining platform with GSOC ITICnxt

Hi [Kelly / Jolena / Lisa],

I work on MU, a Minnesota focused excavation compliance platform that already enforces the timing, mapping and documentation requirements in Minnesota Statute 216D, including Electronic White Lining. Our users are Minnesota contractors who would like MU to submit their tickets directly to GSOC, instead of retyping data into the ITICnxt website.

I understand that GSOC’s internet ticketing is delivered by One Call Concepts via ITICnxt, and that there is an internal API connection used today by FuzionView and the Site X‑Ray program. I would like to explore whether MU can become an approved ITIC integration that:

Creates locate requests on behalf of registered ITIC users

Passes our electronic white lining geometry in the format ITICnxt expects

Reads ticket and positive response status so excavators can see everything in one place

Our goal is to strengthen compliance with 216D and reduce errors, not to bypass GSOC or ITIC. We are happy to work within OCC’s technical and policy constraints and to sign any required agreements or NDAs.

Could we schedule a short call with you and an OCC technical contact to discuss what integration options exist, and what the approval process looks like for third party excavation software?

I have a short concept memo and architecture overview ready to share ahead of time.

Thank you for considering this, and for everything GSOC is doing around electronic white lining and Site X‑Ray.

Best regards,
[Your name]
[Your role / company]
[Contact info]

5. Where the limits are

To stay on the right side of both the law and GSOC’s terms:

Do not try to reverse engineer ITIC’s internal API or automate ticket submission through headless browsers without GSOC’s explicit blessing. Their website terms say that ITIC is run by OCC and that your use of those programs is subject to OCC’s own conditions. 
Gopher State One Call

Do treat this as a partnership. GSOC’s own materials talk about being an “industry leader” and “collaborative” and point to Site X‑Ray as a model for bringing new tools into the ecosystem. 
Gopher State One Call
+1