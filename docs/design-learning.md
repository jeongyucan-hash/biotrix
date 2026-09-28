# BIOTRIX design learning, v1

This is a real evidence pipeline, not LLM fine tuning. Inputs are aggregate page/variant impressions and target actions with a source and measurement definition. The HQ /learning page is active-admin-only. Rows and models are append-only, RLS blocks public and inactive users. No visitor identifiers are stored. No public analytics is installed yet.

The algorithm applies a Beta(1,1) prior per variant, updates with successes/failures, and ranks variants by posterior mean minus 1.96 standard deviations. A recommendation is withheld until at least two variants each have >=100 comparable impressions. Outputs store input observation IDs, algorithm, counts, scores, and date. A recommendation does not alter the public site; design-office review and GitHub deployment remain separate. Manual imports should specify identical time windows/event definitions and avoid overlapping aggregates.

Next integrations: first-party privacy notice and event definition; consent-aware measurement provider or privacy-preserving aggregate collection, experiment allocation, server-side conversion reconciliation, controlled candidate promotion, drift monitoring, and rollback. Do not label this model 'trained on users' while the source tables remain empty.

## Branding brain · v2

The A logo, white canvas, 20-item DM-3.2 manifest and distinct homepage image bytes are deterministic brand gates. `scripts/brand-audit.mjs` checks SHA-256/size, version, logo/favicons, white canvas and repeated imagery. GitHub Actions runs this hourly at minute 17 UTC and on manual dispatch; reports are retained as workflow artifacts for 7 days. A failed check does not change production. HQ /learning offers an admin-triggered server check of private master assets and stores each report in `brand_review_runs` with RLS. CI checks both public and HQ branches; the HQ button checks HQ files only. Action artifacts are not automatically ingested into HQ.

Evidence loop: approved brand baseline -> static self-check -> human triage of anomalies -> comparable real visitor outcomes -> beta-binomial candidate -> design review -> deployment -> repeat measurement. The existing model is statistical updating, not self-training/fine-tuning. No actual visitor observations, automated model training, or automatic design promotion are claimed. The owner reviews false positives, approved exceptions, and rollback against the last deployment. Next: integrate privacy-reviewed measurement and experiment assignment before calling an outcome-based recommendation learned.
