# HQ sourcing execution — 2026-09-28

Entry: https://biotrix-hq.vercel.app/sourcing

## Findings
The old UI only prepared search queries. There was no model/search execution path, and both AI/research flags were false. The shared Responses parser assumed an SDK convenience field in a raw REST payload.

## Flow
An active HQ operator enters an instruction and starts a database-claimed job. Concurrent execution, a 30-second cooldown and a rolling 10-run/24-hour allowance are enforced. The server calls `openai/gpt-5.4-mini` through existing HQ Vercel AI Gateway authentication. No credential is shipped to the client or reused from another application.

One request allows three web tool calls and 5,000 output tokens, with a 120-second timeout and no automatic paid retry. Only public search is available; no supplier messaging, order, payment or login tools. The result needs an actual completed search, source metadata and valid JSON. Candidates missing a retrieved URL are excluded; remaining evidence is `source_claim`, not verified. Prices and permissions are not inferred.

A transaction saves candidates, a Knowledge document, usage and job completion. Repeat source URLs preserve existing operator records. A later save error rolls back the whole result. Errors are visible. Interrupted jobs become failed on the next start after four minutes.

## Boundaries
- User-triggered execution, not a recurring worker or general ChatGPT replacement.
- A disconnected browser request does not confirm completion; inspect the persisted job after reopening HQ.
- Authentication-variable presence does not prove provider access, credit or model permission. First live execution remains a separate verification gate.
- Billing is shown as unknown. The old max-estimated-cost setting is not a hard billing cap. Calls/tokens are bounded; actual charges and hard spending controls belong in AI Gateway.
- Five public candidates per run do not constitute a complete private catalog. Quotes, stock, rights and channel permission still require supplier confirmation.
- The review browser had no HQ login session. Tests below do not establish live model execution.

## Verification
Five Node tests cover raw REST parsing, source deduplication, unsafe/invented URLs, missing search/evidence, refusals, incomplete/invalid output, missing credentials without network access, bounded request parameters, and payment errors. Fixtures only.

Live Supabase rollback tests covered admin start/completion, duplicate start rejection, idempotent save, atomic rollback after invalid second candidate, failed-run persistence, anonymous and nonadmin denial. Read-back showed zero fixture missions/candidates; RLS remained enabled. Production Next.js build passed.

Existing HQ components follow active design.department DM-3.2. No visual identity change.

## Official references checked
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://vercel.com/docs/ai-gateway/models-and-providers/web-search
- https://vercel.com/docs/ai-gateway/sdks-and-apis/openresponses
- https://ai-gateway.vercel.sh/v1/models
