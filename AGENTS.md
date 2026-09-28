# BIOTRIX website work records

For every meaningful work session on this repository:

1. Inspect current branch and remote changes before editing; preserve other work.
2. Keep the code changes in GitHub and update `QA_LOG.md` with findings, verification, remaining issues and deployment status.
3. Record the session in the BIOTRIX HQ `agent_runs` table using the authorized Supabase connector when available. Use a stable session identifier to avoid duplicates. Include repository, branch, commit, PR, preview, checks and limitations in JSON fields. Never fabricate success, usage or deployment results.
4. Save the final summary in HQ `documents`, category `website-development`, for the Knowledge screen. Use the same document identity for updates in the session.
5. If the connector is unavailable, record the pending sync in `QA_LOG.md` and explicitly state that HQ storage has not been confirmed. A GitHub commit alone is not proof of a database record.
6. GitHub commit ingestion in HQ `/activity` runs when an authorized operator opens that page, at most once every 30 minutes. It does not capture conversations or run while the page is closed.

The public website and the HQ Next.js app use separate branches and deployments. Verify each relevant target. Do not overwrite one with the other.

## Website design authority

All website visual changes must reference HQ /design and the active design.department setting plus design decisions. Update DM master version, source assets, photo provenance and implementation together. Do not invent autonomous agents or claim an AI native file when only a PDF-compatible exchange file is provided. Keep design assets behind HQ admin authorization.
