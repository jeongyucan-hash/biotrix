# First-sale workspace — 2026-09-28

Development goal: sell 1–3 existing dropship products through Coupang, measure order contribution and fulfillment, then decide expansion from observed outcomes.

## Delivered scope
- `/launch`: shared permit/WING/supplier readiness, product URL and supply specification, full direct-cost contribution calculator, seven preparation checks, comparison table, per-product feedback history.
- No missing cost becomes zero. Ready requires positive contribution, seven product checks and three shared prerequisites. Completion evidence is mandatory. A ready label is internal preparation only, not Coupang approval or actual listing.
- Product plan updates use version checks to reject stale edits. Stable form UUIDs prevent duplicate submission. Database saves return explicit failure/success messages.
- Three RLS-protected tables: launch_plans, launch_prerequisites, launch_reviews. Active-admin authorization on both server actions and page; no anonymous table grants.
- Existing sourcing records remain references; two supplier leads with unknown prices are not represented as verified products.
- HQ design authority: design.department DM-3.2, white/forest tokens retained. Functional workspace extension; no logo/master asset changes.

## Execution plan
9/28: verify accounts, examine 10 candidate product links. 9/29: compare landed cost, competition and supply terms; shortlist 3. 9/30: prepare 1–3 listings and rehearse order handling. 10/1: target launch only when approval and supply requirements are met. Day 7/14: review facts, hypothesis, changes, and outcomes.

## Limits
No Coupang/Domeme credentials or API integration; no automatic product import, inventory polling, listing publication, order forwarding, payment, or paid AI calls. Regulatory and seller approvals are manually recorded from evidence. Contribution is before tax/fixed overhead; supply prepayment is per order, not a full cash-flow forecast. Browser authenticated flow remains unverified unless a live admin session is available. Scheduled market work and website branding checks are unchanged.
