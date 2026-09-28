# BIOTRIX design learning, v1

This is a real evidence pipeline, not LLM fine tuning. Inputs are aggregate page/variant impressions and target actions with a source and measurement definition. The HQ /learning page is active-admin-only. Rows and models are append-only, RLS blocks public and inactive users. No visitor identifiers are stored. No public analytics is installed yet.

The algorithm applies a Beta(1,1) prior per variant, updates with successes/failures, and ranks variants by posterior mean minus 1.96 standard deviations. A recommendation is withheld until at least two variants each have >=100 comparable impressions. Outputs store input observation IDs, algorithm, counts, scores, and date. A recommendation does not alter the public site; design-office review and GitHub deployment remain separate. Manual imports should specify identical time windows/event definitions and avoid overlapping aggregates.

Next integrations: first-party privacy notice and event definition; consent-aware measurement provider or privacy-preserving aggregate collection, experiment allocation, server-side conversion reconciliation, controlled candidate promotion, drift monitoring, and rollback. Do not label this model 'trained on users' while the source tables remain empty.
