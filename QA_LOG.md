# BIOTRIX QA Log

## 2026-09-28 14:40 KST — Compact logo lockup L1

- User requested a closer symbol/wordmark relationship while reviewing a founder business-card concept.
- Reduced shared editorial `.brand` gap from 12px to 4px. Preserved symbol SVG, responsive dimensions, wordmark typography, white canvas and all photography/provenance.
- Updated DESIGN_SYSTEM.md as a DM-3.2 lockup addendum; existing 14-page HQ master is not claimed reissued.
- `node scripts/check-lockup.mjs`, six-page/149-link static audit and `git diff --check` passed. Deployment and live DOM measurement pending; final evidence will be stored in HQ run 747171d0-a511-4f98-88eb-202609280401 and Knowledge 747171d0-a511-4f98-88eb-202609280402.
- Business-card concept is a separate private image preview, not a press-ready file. Phone transcription requires confirmation; no contact data was added to the public repository.

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

## 2026-09-28 — DM-3.0 editorial website redesign

- Responded to the repeated-photo critique with four independent image scenes and one use of each source on the homepage.
- Rebuilt six public pages: split hero, editorial typography, ruled category navigation, distinct inner-page layouts and honest availability states.
- Replaced metallic header mark with the flat vector mark. Retained keyboard navigation, pause/manual slideshow and reduced-motion handling.
- Provenance is recorded in assets/EDITORIAL_SOURCES.md and the contact FAQ.
- Static links/assets/headings audit and JavaScript syntax checks run before preview. Responsive browser QA and production readback are recorded in HQ when complete.

## 2026-09-28 12:44:31 KST — Development review snapshot

- Created six-page development/benchmark review at user request. Distinguished existing production from DM-3 preview and unfinished HQ/master publication.
- HQ document confirmed: b273d77f-be44-7ed1-7a15-520f2aea4d7c (website-development).
- Compared official Aesop, OSEA, Kurly information architecture and Shopify structured product/AI commerce reference; did not claim comparative conversion or revenue results.
- Remaining gates: full responsive interaction QA, main promotion, HQ v3 assets/status update, real product and contact paths, measured performance/conversion.

## 2026-09-28 — DM-3.0 verified release

- Public `main` was fast-forwarded to `eb456f7a1c03f26c9cdfddaa82d86c3a93b4904c`. The public Vercel deployment succeeded, and `https://biotrix.co.kr/` displayed the new split hero and independent food photograph in the browser.
- HQ `hq-nextjs` release `3c8fc52cbe1f426b7a72b9cc817fb1be5ccd1d9d` succeeded. HQ `design.master` is v3.0 with 19 private assets (full master, source files, mood image, and 14 individual PDF boards). Admin-only learning page stores aggregate observations and model evaluation. No observations or trained recommendation yet.
- Six public pages and 149 internal links passed static audit. Browser confirmed home at 320px has no horizontal overflow; image loading, manual slideshow and pause were checked. The authenticated HQ UI and all page interaction paths have not been fully exercised.
- Remaining business inputs: real product details/purchase destinations and a verified inquiry receiving channel. Generated scenes are illustrative.

## 2026-09-28 — Logo redesign
- Compared three vector directions at full, header 24px and favicon 16px. Chose negative-space B monogram for recognizable letter and one-color print/screen use.
- Replaced public symbol and favicon SVG, adjusted wordmark weight and spacing. PNGs used only for optical QA; deployed assets remain resolution-independent SVG.

## 2026-09-28 — white canvas update

- User selected direction A and requested removing ivory background tone. Updated all global ivory, header, hero visual fallback, slide controls, footer and mobile navigation surfaces to white. Sage/Peach section accents remain.

## 2026-09-28 — scheduled branding check

- Added default-branch GitHub Action to check public logo/favicons, white canvas, homepage image reuse and HQ master asset hashes daily at 03:17 UTC or manually. Report is stored in workflow artifacts for 30 days; deployment is not automatic.

## 2026-09-28 — hourly branding check

- Changed scheduled GitHub Actions audit from daily 03:17 UTC to hourly at minute 17 UTC (KST :17). Reduced individual report artifact retention from 30 to 7 days to bound storage. Manual dispatch remains available. First scheduled execution still requires remote verification.


## 2026-09-28 — Search registration (search-registration-20260928)

- Daum registration submitted successfully for biotrix.co.kr using andrew@biotrix.co.kr; review pending.
- Google URL-prefix ownership verified via HTML meta tag. sitemap.xml submitted; Google currently reports unable to read, while direct live fetch returns HTTP 200 application/xml. Indexing is not claimed complete.
- Published Google meta tag (70fe7db) and narrowed legacy /product robots exclusions (31d451e). Live readback confirms both. All eight sitemap routes pass local robots checks; admin/account/cart and legacy product exclusions remain.
- Naver login callback failed; Bing Google login awaiting device confirmation. Business/map listing eligibility remains unconfirmed.
- Repository: jeongyucan-hash/biotrix, production branch main. Local isolated branch seo/search-registration-20260928 has validation commit 871b7b3; CLI push lacked credentials, so production changes were applied through the authorized GitHub connector using current blob SHA guards.
- HQ writeback follows under session search-registration-20260928; confirmation is recorded in HQ rather than inferred from this commit.

## 2026-09-28 — Naver retry and Bing verification

- Naver retry passed the prior login failure and reached the first-use Search Advisor terms dialog. Awaiting explicit approval of Naver terms; no site verification/submission claimed.
- Bing device authentication completed. Published msvalidate.01 tag in commit f50eae8 and confirmed the live tag. Site ownership verified; authenticated dashboard for https://biotrix.co.kr/ is available.
- Submitted https://biotrix.co.kr/sitemap.xml to Bing. Readback shows one sitemap, processing, zero current errors/warnings; indexing is pending.
- Google remains verified with sitemap unable-to-read status; Daum submission remains under review. HQ session records updated separately.

## 2026-09-28 — Naver terms approved, verification challenge pending

- User explicitly approved Naver Search Advisor terms; accepted and opened site registration for https://biotrix.co.kr.
- Published Naver verification meta tag in b2d2667; direct production HTTP readback confirms the exact tag.
- Clicked HTML-tag ownership verification. Naver requires a user-completed CAPTCHA. Stopped at the challenge without solving/bypassing it. Ownership and sitemap submission remain pending.

## 2026-09-28 — Search readiness follow-up

- Existing root `robots.txt`, `sitemap.xml` with the eight requested clean URLs, and issued Google/Naver verification tags confirmed on public main. Existing title, description, canonical and Open Graph retained.
- Added minimal Organization JSON-LD and documented the single edit location for issued verification values in `SEO_VERIFICATION.md`.
- Production robots and sitemap responded HTTP 200 before the update. Post-deployment readback pending; search console indexing is not implied.
- HQ agent_runs and documents sync pending connector availability.

## 2026-09-28 — Naver registration completed

- After user completed the verification challenge, confirmed ownership: site list no longer requests verification and authenticated site dashboard is accessible.
- Submitted https://biotrix.co.kr/sitemap.xml; confirmed sitemap.xml row dated 2026-09-28 15:59:46 KST.
- Requested homepage crawl; confirmed / request row dated 16:01:03 KST. Search visibility/indexing is pending and not guaranteed by registration.
- Bing ownership and sitemap submission were completed earlier; Daum review and Google sitemap unreadable status remain outstanding.

## 2026-09-28 — Kakao link preview

- Added a 1200x630 PNG social card using the existing BIOTRIX symbol, white canvas and forest-green brand colors; retained editable SVG source.
- Added absolute og:image, dimensions, MIME, alt text, locale/site name and Twitter large-image metadata to all eight public pages; preserved existing titles, descriptions, canonical and verification tags.
- SVG rendering visually inspected; git diff --check passed. Production asset/metadata verification and Kakao cache status are recorded in HQ after deployment.

## 2026-10-01 — Biotech research preview

- Session: biotrix-science-preview-20261001. Repository jeongyucan-hash/biotrix; baseline e42994fd7b9ca1267533728371fd7b3ea07e07cc; isolated branch preview/biotrix-science-20261001.
- Production biotrix.co.kr responded 200. Vercel confirmed READY production dpl_6WCtEgxTwjjuCyEivoe9aQfcpem8, project biotrix-vercel-ready, main. HQ project remains separate and its ignore guard unchanged.
- Rebuilt Home, Company, Science, Programs, Contact with deep green/silver/warm ivory/graphite, connected-biology SVG, five research areas and MITO/NEXUS/IMMU/RESET/BIOACT research directions. No clinical, proprietary AI or lab-result claims. Contact channel remains honestly pending.
- Existing public routes retained. Legacy main menus now use Company/Science/Programs/Contact; orchard excluded from the biotech navigation. Existing verification, canonical, Organization JSON-LD and social-image metadata retained. robots.txt unchanged; sitemap extends existing URLs with /science and /programs. Fixed pre-existing shop /#about destination.
- PASS: headless Chrome, five primary routes at 1440/768/390/320px (20 cases), no horizontal overflow, no runtime/asset errors, mobile menu/Escape. Desktop/mobile screenshots visually reviewed.
- PASS: audit-site.py: 11 public pages, 186 internal links, assets and anchors; check-lockup.mjs passed. SEO comparison passed; local cross-page scan checked 220 references. git diff --check passed.
- Build: static HTML project, framework null, no package/build step required; deployable assets served successfully. Hosted preview validation pending GitHub push/Vercel result.
- Generic Vercel deploy connector rejected by automatic approval review because target/promotion behavior is unspecified. Do not use it or promote production; use explicit non-main Git preview branch.
- User approval required for production. No production deployment/promotion performed.
- HQ agent_runs/documents sync pending final commit/PR/preview values; not yet claimed successful.

### Preview delivery and final readback

- GitHub implementation commit: 5038ed3584baee05eb15ba0d9c6819b46a4ab117. Draft PR: https://github.com/jeongyucan-hash/biotrix/pull/10.
- Vercel preview: https://biotrix-vercel-ready-73wyalwls-jeongyucan-8678.vercel.app — deployment dpl_2D91m4K6VoAhtHdfBBxDZRPig1BU READY, 1.3 seconds from buildingAt to ready. No production alias attached. Vercel GitHub status success.
- HQ build for this branch CANCELED by the existing ignore command, as intended. No HQ application changes.
- Production HTTP readback still shows the previous homepage title. Production alias remains unchanged.
- Hosted browser QA remains unverified: public preview redirects to Vercel Login; authenticated connector fetch and temporary-share tools return access denied. User authorized access, but retry did not refresh OAuth scope. Requires actual Vercel connection/team authorization or account login. Do not weaken project-wide protection.
- Local preview running at http://127.0.0.1:4173; five primary routes fully QA checked before delivery. Build logs connector unavailable (tool not found); READY and GitHub deployment status verified, no log-success claim.
- HQ sync CONFIRMED by readback: agent_runs id 01a0f726-0dc3-7980-9342-ecc0c6375f50, status needs_attention; documents id 01a0f726-0dc3-7980-9342-ecc0c6375f51, category website-development. Usage metrics unavailable and not fabricated.
- Production approval still pending; draft PR must not be merged or promoted automatically.

## 2026-10-01 — Approved homepage message update

- Updated hero to Advancing biomedicine. Expanding access. and the exact approved Korean headline/body. Removed Connected Biology eyebrow and AI-led hero explanation.
- Updated homepage title/description/Open Graph text and five biotech-page footer taglines consistently. Canonical/verification/JSON-LD/robots/sitemap/social image preserved. Other section copy unchanged for incremental review.
- PASS: 20 local Chrome route/viewport checks at 1440/768/390/320px, menu/Escape, no overflow/runtime errors; 11-page link/asset audit; git diff --check.
- Preview branch only; same draft PR #10. New hosted preview status pending; production not authorized. HQ writeback pending final deployment.

## 2026-10-01 — Hero research CTA and artwork labels

- Replaced Home science links with Our research approach; destination /science retained. Replaced THE BIOLOGY MATRIX / CONCEPTUAL VISUAL with BIO + MATRIX. Artwork alt now describes deep green/silver abstract graphics without biological evidence claims.
- Confirmed top desktop/mobile navigation exactly Company / Science / Programs / Contact, matching initial requested IA; clarification requested about the user's perceived discrepancy. No unapproved IA change.
- Local link audit PASS: 11 public pages, 186 internal links; Chrome route/viewport QA PASS, no overflow/runtime errors; canonical/verification/JSON-LD/robots/social metadata checks PASS. Production unchanged; preview deploy pending.
