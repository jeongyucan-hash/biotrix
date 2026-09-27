# BIOTRIX QA Log

## 2026-09-28 — Overnight QA pass 3

- **Brand QA:** Unified auxiliary commerce/404 surfaces with the shared BIOTRIX favicon and master symbol asset; added the BIOTRIX theme color where missing.
- **UX / Business QA:** Removed the misleading clickable purchase placeholder on `product.html`. Cart and purchase controls now render as explicitly disabled prototype states rather than actionable links.
- **Accessibility QA:** Disabled prototype controls use `aria-disabled="true"`; decorative brand-symbol images use empty alt text because the adjacent BIOTRIX wordmark supplies the accessible name.
- **Technical / SEO QA:** Retained `noindex` on prototype commerce routes; 404 remains non-indexable. No production/main merge performed.
- **Follow-up:** Continue visual-system convergence for Shop/account/cart/product templates and verify preview deployment/headers after this commit.
