# HQ 홈페이지 디자인실

- Owner: website_design, parent department marketing (existing work queue taxonomy).
- Workspace: /design. Public brand site remains a separate deployment.
- Authority: HQ decisions and company_settings design.department define the design direction. Requests snapshot the current criteria and the latest 20 active design decisions.
- Execution: ChatGPT Work assisted. No autonomous model runner is claimed.
- Roles: design direction, brand/photography, UX/UI, frontend, QA.
- Deliverables: 18-page PDF, PDF-based Illustrator compatibility file (.ai), editable SVG, source ZIP and image provenance. The .ai is not an Adobe native export and was not tested in Illustrator.
- Authentication: active admin required for page, mutations and each file request. Files are outside public/, allowlisted and sent with private/no-store headers.
- Source build: design-source/build_master.py; acquire Noto Sans KR from the official Google Fonts source, place fonts/NotoSansKR.ttf and fonts/OFL.txt adjacent to the script; extract brand-triptych.png from the source ZIP into output/ before building. Requires reportlab, fontTools, Pillow.
- Decisions are append-only from this interface. Recording a decision does not itself alter the master or deploy the public site.
- Source images are generated mood imagery, not actual product/supplier evidence.

## Validation
18 PDF pages rendered and inspected; no text outside page bounds; SVG photo embedding checked in Inkscape; PDF-based .ai parsed as a single 18-board canvas. Six tests pass (request/decision validation, file traversal/allowlist, existing commit ingestion). Production Next.js build passes. Authenticated UI interactions require a logged-in HQ operator; no authenticated session was available in this browser.
