# BIOTRIX QA Log

## 2026-09-28 — Overnight QA pass 3

- **Brand QA:** Unified auxiliary commerce/404 surfaces with the shared BIOTRIX favicon and master symbol asset; added the BIOTRIX theme color where missing.
- **UX / Business QA:** Removed the misleading clickable purchase placeholder on `product.html`. Cart and purchase controls now render as explicitly disabled prototype states rather than actionable links.
- **Accessibility QA:** Disabled prototype controls use `aria-disabled="true"`; decorative brand-symbol images use empty alt text because the adjacent BIOTRIX wordmark supplies the accessible name.
- **Technical / SEO QA:** Retained `noindex` on prototype commerce routes; 404 remains non-indexable. No production/main merge performed.
- **Follow-up:** Continue visual-system convergence for Shop/account/cart/product templates and verify preview deployment/headers after this commit.

## 2026-09-28 — Public website QA and HQ recording

### Findings and corrections
- Fixed the homepage header's full-width override so the logo and navigation use consistent desktop and mobile margins.
- Replaced embedded images on Company, Business, Products, Partnership and Contact with the existing documented real-photo assets. Category imagery now matches Food / Health / Beauty.
- Added a persistent slideshow pause control, larger touch targets, reduced-motion handling, and a first-image preload.
- Connected category cards to their exact product sections. Added keyboard/outside-click mobile menu dismissal.
- Replaced inert FAQ rows with expandable answers and simplified the unavailable-contact page.
- Corrected the favicon's clipped geometry and improved footer contrast and Korean line wrapping.
- Added a noindex responsive QA harness at `/qa/responsive.html`.

### Verification
- Static audit: 6 public pages, 108 internal links, section anchors, assets, heading structure and placeholder copy passed.
- JavaScript syntax checks passed for shared navigation and slideshow scripts.
- Browser checks passed: 320px and 390px mobile layouts, no horizontal overflow on all six pages, menu Escape dismissal, slideshow pause/selection, and FAQ keyboard interaction.
- Production published by fast-forwarding main to 63da7fefda7c2f07c566657fc129d80a85f90d82. Vercel production deployment succeeded; https://biotrix.co.kr/ was verified through HTTP and a live browser.
- HQ commit 17535fdf527a4f7a968c0589fbf29371abf07ce6 passed 3 ingestion tests and a production build; its Vercel deployment succeeded. Authenticated HQ UI review remains unverified.

### Agency records
- Confirmed that `agent_runs` was empty: previous commits were not automatically recorded in HQ.
- Backfilled the preceding logo/copy/slideshow session: `aad305b2-1540-2aa6-8da2-8db2254181ae`.
- Backfilled 210 distinct GitHub commits into the real agency database.
- Current QA session: `40b2727c-5cef-9433-fa4b-04eedc8824a5`.
- HQ `/activity` adds protected session history and GitHub commit ingestion on page open, at most once per 30 minutes. It is not a background worker or conversation recorder.

### Remaining business inputs
- Sellable product details and verified purchase URLs.
- Verified business/contact information and a receiving channel for inquiries.
