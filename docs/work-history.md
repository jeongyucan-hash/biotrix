# BIOTRIX work history

`/activity` combines existing `agent_runs` session records with GitHub commit records.

- Authenticated active HQ administrators only; server action rechecks identity and role.
- Existing RLS on `agent_runs` remains in force. No service key is exposed or required.
- Opening the page initiates a GitHub sync, throttled to 30 minutes after a successful sync.
- Reads all repository branches and commits since 2026-09-27. Branch/commit pagination is bounded; excess pages or API errors produce a visible failure, never a false complete status.
- Deterministic IDs prevent duplicate commit records. Branch membership is a snapshot at first ingestion.
- Source: public `jeongyucan-hash/biotrix` GitHub API. If made private, an authorized server-side integration will be required; the UI reports fetch failure.
- This is page-triggered synchronization, not a background worker or conversation recorder. Session objectives, findings, tests and remaining issues must be explicitly recorded by the working agent.
- `input_json.source=github` identifies ingested code; `chatgpt-work` identifies externally executed work sessions. Token/cost fields are not used as measurements for external work.

Verification: `node --test tests/work-history.test.mjs`, `npm run build`, and database read-back of session records. Deployment and authenticated UI status must be recorded separately.
