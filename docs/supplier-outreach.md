# Supplier inquiry workspace — 2026-09-28

Route: `/sourcing/outreach`, linked from Sourcing and the Commerce menu.

The previous admin mailing feature stored customer marketing drafts only. This
separate workflow ties a supplier inquiry to its sourcing candidate. Three real
supplier inquiries are prefilled in the database; all remain drafts, not sent.

Owners can prepare/edit a draft, review its saved recipient and content, send
when configured, append a received quotation with its original text, compare
purchase plus packing/shipping, and copy the quotation into first-sale planning.
Quote import uses the quote ID for idempotency, preserves unknown costs, and
leaves every readiness checkbox false. Existing launch plans are not overwritten.
Active admins can read; mutations require an active owner. No public access.

## Sending connection

Server-only environment configuration: `RESEND_API_KEY`,
`HQ_MAIL_FROM=andrew@biotrix.co.kr`, `HQ_MAIL_ENABLED=true`. The sender domain must
be verified by the mail provider, and the reply mailbox must be operational.
No new provider account, domain configuration, paid plan, or secret was created.
This release does not treat a ChatGPT Gmail connector as an HQ credential.

Sending is off without this configuration. A configuration-present message does
not prove domain verification or successful delivery. A compare-and-update claim
prevents concurrent sends. The provider receives a stable versioned idempotency
key. Network failures, 5xx, and ambiguous results lock the record for manual
provider reconciliation; there is no blind retry. If the process terminates,
the `sending` record also stays locked. A service acceptance ID means accepted,
not delivered or replied. No automatic response ingestion or delivery webhook is
implemented. Operators currently record received replies manually.

Source documentation checked: Resend Send Email API and Idempotency Keys.
DM-3.2 styles and existing components reused; no logo/assets/master change.

## Verification

Four Node tests: disabled/different sender never sends, fixed provider/sender and
stable idempotency key, ambiguous outcomes/no retry, header validation and
unknown versus zero quotation costs. Provider calls mocked; no email sent.
Next production build passed. Live SQL rollback checks passed: owner read,
single-claim behavior, quote insert/evidence rejection, nonadmin read/write
denial, anonymous denial. Security advisor found no new table warnings; existing
leaked-password-protection warning remains unrelated to this change.

Authenticated UI and real provider delivery have not been verified. Production
deployment status is recorded separately in HQ session records.
