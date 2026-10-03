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

## 2026-10-01 — Figma human-centered hero slideshow

- Created Figma design https://www.figma.com/design/2eBqBWppDIA96qumCT87NK with six editable desktop/mobile cover frames for Family / Generations / Research; photo capture used for image fills then removed. Structural checks: editable text, 12 navigation instances, six image fills, no child overflow.
- Applied bright warm ivory/deep green hero with fixed founder-approved copy. Replaced the abstract matrix cover with three generated conceptual photos; retained original SVG asset. Caption identifies conceptual imagery; no staff/facility or clinical claims. Image provenance and prompt set: HERO_DESIGN.md.
- Responsive WebP assets, seven-second crossfade, previous/next/pause, keyboard arrows/focus pause, hover and hidden-tab pause, reduced-motion default pause, no-JavaScript first-image fallback. Replaced redundant hero process strip with BIOTRIX 알아보기 link.
- PASS: 20 Chrome route/viewport checks (1440/768/390/320px), 222 file references and SEO preservation; 11-page audit of 186 links; brand lockup check; slideshow navigation/wrap/pause/autoplay/keyboard/reduced-motion/no-JS checks; git diff --check.
- Preview branch only, draft PR #10. Hosted deployment and authenticated screen QA pending at commit time. Production deployment is not authorized. HQ record update pending final preview status.

- Final verification: implementation commit bdd9b6c1f537f1c6206cd58bbaf4590642ade1c0 deployed READY at https://biotrix-vercel-ready-3an0adtgf-jeongyucan-8678.vercel.app/. Hosted browser confirmed slide navigation and 390px image loading/no overflow. Production remains main e42994fd7b9ca1267533728371fd7b3ea07e07cc. HQ agent_runs and Knowledge document updated and verified. Production approval remains pending.

## 2026-10-01 — Scene meanings instead of generic image caption

- Removed visible 브랜드 콘셉트 이미지. Captions now follow the active slide: 더 많은 사람의 일상으로 / 세대를 이어가는 삶의 가능성 / 가능성을 탐구하는 과학. Enlarged caption to 12px deep green. Accessible image descriptions and internal generated-image provenance retained.
- Updated six Figma caption layers to the same scene meanings. Caption navigation verification and existing slideshow checks PASS. Preview-only; production approval still required.


## 2026-10-02 — Product/design baseline and visual audit

- Session: biotrix-design-audit-20261002 / 01a0fadf-2e40-7121-9116-6d15465254ec.
- Source preview/biotrix-science-20261001 at c3940aa9a7b4076fb069679b9eacb12816e2a35d was clean. GitHub branch read confirmed the same remote HEAD. Original read-only checkout preserved; independent checkout under this session outputs/biotrix; documentation branch docs/biotrix-design-audit-20261002.
- Added PRODUCT.md, DESIGN.md, VISUAL_QA_CHECKLIST.md. Fixed target: Bio/Science/AI/Commerce, Clinical/Institutional/Technology, Deep Green/Silver/Pure White, variance 6/motion 3/density 5. Existing design/provenance documents retained with precedence clarified.
- Actual local Chrome renders 1440x900 and 390x900: no horizontal overflow, no runtime/HTTP asset errors; mobile menu open/Escape close passed. Full-page and hero screenshots plus render-audit.json are sibling outputs; not deployed website assets.
- Priority: P1 palette mismatch and repeated programs/area descriptions (mobile Programs section 2000px); P2 spacing rhythm, type/readability and contact action; P3 slideshow/image contribution. No centered hero, excessive rounded section containers, gradient/glow or continuous decorative animation found in current Home.
- Static audit PASS: 11 public pages, 186 internal links, assets and anchors. No HTML/CSS/JS/SEO/robots/sitemap changes. No public-site build step applies. Documentation whitespace check passed.
- Git shell network access unavailable in sandbox; GitHub connector read used for source verification. GitHub push and HQ record readback pending below. No production deployment/merge/promotion; hosted preview not audited in this session. Token/cost metrics unavailable.

### Delivery limitation

- GitHub push rejected by automatic approval review: external publication destination was not explicitly authorized by the user. No workaround attempted; local documentation commit retained. Remote writes require user approval.
- HQ connector read confirmed project and table structure; agent_runs/documents writes were held with external publication pending. HQ storage is NOT confirmed. Stable session id and document id: 01a0fadf-2e40-7121-9116-6d15465254ec / 01a0fadf-2e40-7121-9116-6d15465254ed.
- Original preview checkout remains untouched and clean. Documentation checkout is separate. Screenshot evidence remains in sibling outputs. No production deployment.


## 2026-10-02 — Navy / Silver Brand System 1.0

- User explicitly authorized a new CI, replacement of the green website theme, and immediate application to www.biotrix.co.kr. This supersedes earlier preview-only restrictions for this public website work.
- Session: biotrix-brand-system-20261002. Isolated branch brand/navy-silver-20261002 preserves the earlier preview and documentation checkouts. origin/main is an ancestor; the pending science website content is included in this release. The HQ app branch/project is not modified.
- Curved-ribbon BIO: I width and O side wall 22; corresponding fold direction. X retains 82 × 100 bounds and uses crossing-plane separation. Full outlined wordmarks replace the symbol-plus-typed-name lockup. New favicon and 1200 × 630 social card.
- Deep Navy #0B1830, Titanium Silver #BEC7D2, Platinum #F1F4F7, Steel #66768B. Shared brand stylesheet across root pages, navy hero/header, grayscale concept photography, compact home program list, manual-first slideshow, legacy route and legal-page color cleanup. Existing content, domain metadata, verification and site paths preserved.
- PASS: 5 main routes × 3 widths (390/1440/1920), no horizontal overflow, broken images, HTTP/JS errors; mobile menu/Escape and slide-next. 11 legacy routes × 2 widths (390/1440), no overflow or broken images. 11-page static audit / 186 internal links and lockup check passed. Logo/typography/whole-page screenshots visually reviewed. Five text/background pairs measured 5.49:1–16.02:1.
- The scheduled workflow now validates the public wordmark/links independently from HQ's older design master; HQ asset integrity checks remain enabled. Comparing the public site to HQ's superseded green master is no longer the public brand requirement.
- Deliverables outside the deployment checkout: 15-page vector PDF, four SVG/PNG logo modes, geometry and token JSON, CSS, social card, brand overview and website screenshots. All PDF pages rendered and visually inspected.
- Remaining limits: no physical print proof, actual device test or full WCAG certification; contact channels and commerce placeholders remain as previously disclosed. Production verification and HQ record readback follow the implementation commit; no deployment success is claimed in this entry.

### Verified release

- Implementation ee2594781ed6103c8edf579ee3f900e9d5ef5c44; PR #11 https://github.com/jeongyucan-hash/biotrix/pull/11 merged as 60077af2572c349a76e14abe18fb0c16f65d9c9d. Vercel public production Ready: EwTnzgx4H5AHJaEjBk6jv9mUzJeb. HQ deployment correctly ignored.
- Preview Ready at https://biotrix-vercel-ready-git-brand-navy-silv-7a9831-jeongyucan-8678.vercel.app; direct preview browser inspection was blocked by login protection. Production https://biotrix.co.kr verified directly: five core routes at 1440/390px, zero overflow/broken images/page errors, menu/Escape and slide-next passed. CSS, wordmark, favicon and social image matched local file bytes.
- www.biotrix.co.kr initially had no project domain registration and failed TLS verification. Added it to the existing public project through its authenticated dashboard, issued SSL, and configured 308 to the existing apex. The apex remains connected to Production. Repeated ten route/viewport checks and four asset byte comparisons through https://www.biotrix.co.kr all passed with normal TLS validation. DNS update recommendations shown by Vercel do not prevent current resolution.
- HQ readback confirmed agent_runs 5b7a91d2-4d38-4b71-9510-202610020001 (completed) and documents 5b7a91d2-4d38-4b71-9510-202610020002 (website-development). Usage/cost metrics unavailable, not inferred from default database values.


## 2026-10-02 — Lettering weight correction / Brand System 1.1

- User observed the 22-unit BIO versus 17.5-unit TRIX stroke difference on the public site and requested the proposed correction. Existing website publication authorization applies.
- Both I stems, T/R verticals and O sidewalls now measure 20 units. O/T horizontal strokes measure 18. X diagonal normal width is 19.9989, with its 82 × 100 envelope preserved; crossing separation 2.4. Original ribbon B retained (left stem approximately 21.66); curved sections remain optically variable. Ink width 540 with the same 590 × 152 canvas.
- Replaced all four outlined logo modes, geometry master and social card. Added v=1.1 to public logo/social URLs to refresh previously viewed assets. The asset audit now parses URL paths independently of cache-version queries.
- PASS: monochrome before/after and actual header sizes visually reviewed; 15 core route/viewport combinations (390/1440/1920) without overflow, broken images or JS/HTTP errors; menu/Escape and slide-next; 11-page/186-link audit; wordmark checks and whitespace checks. Updated 15-page guide rendered and visually inspected.
- Production deployment verification follows the implementation commit. Final result is stored in HQ agent_runs 5b7a91d2-4d38-4b71-9510-202610020011 and documents 5b7a91d2-4d38-4b71-9510-202610020012. No physical print proof or fully uniform curved-stroke thickness is claimed.

## 2026-10-02 — bilingual BioSolutions content
- 20 route/viewport checks passed; 247 references and SEO preservation verified. Five solution diagrams, email and carousel passed at 3 widths. Mobile diagrams vertical.
- Preserved released CI v1.1 weight refinement. Preview deployment and hosted checks follow; production not authorized.
- Hosted preview READY: https://biotrix-vercel-ready-8micjhfie-jeongyucan-8678.vercel.app/ (e3aa5d0). Five routes at 1440/390px: ten checks passed, no overflow/broken images; bilingual content and five solutions confirmed. Draft PR #13; HQ records updated and readback confirmed. Production approval pending.

## 2026-10-02 — Approved short tagline / lockup 1.2

- User selected “Advancing biomedicine” without punctuation and authorized implementation. Added the exact text below the 1.1 wordmark, left aligned to the visible B, in silver regular Arial (14px desktop / 12px mobile).
- Based on current origin/main 9ff80e2; preserve newly released bilingual BioSolutions/ingredient content and all other work. Header/footer lockups updated across root pages. Versioned CSS URL prevents stale layout. Standalone light/dark/mono/white SVG and PNG exports created outside the web checkout.
- PASS: 20 core route/viewport combinations at 320/390/768/1440px; tagline visible and fully inside each header, no horizontal overflow; mobile menu/Escape works. Actual 390/1440 header captures visually reviewed. Static 11-page audit verified 194 links. Production confirmation follows this commit and will be recorded in HQ under session tagline-20261002.


## 2026-10-02 — Cloud redesign continuation

- Restored the five-part authorized handoff; all 838 manifest entries matched SHA256.
- Read original Company / Science / Programs / Contact pages, founder interview, correction notes and all exported user messages.
- Rebuilt home with navy/silver visual hierarchy, restored the ribbon logo and 한국바이오트릭스 subtitle. Preserved ENERA / FLORA / IMMERA / RENOVA / ACTIVA, bilingual technology descriptions and evaluation priorities.
- New program selection supports direct hashes and legacy aliases; without JavaScript all program content stays readable. Added mobile menu, Escape dismissal and reduced-motion handling.
- Preserved existing production routes/assets/configuration in a separate preview branch. Production domain unchanged. Preview HTML uses noindex.
- Static seven-page asset/route audit, unique IDs and JavaScript syntax passed. Browser QA unverified: local Chromium absent and supported download failed. Vercel project access returned 403; deployment/access readback remains pending.
- HQ agent_runs and documents writes confirmed and read back: session 7832fbf3-5af3-4c78-832f-bf3500000001 and document 7832fbf3-5af3-4c78-832f-bf3500000002.
- Vercel bot reports Ready deployment at https://biotrix-vercel-ready-git-preview-cloud-r-6cd59a-jeongyucan-8678.vercel.app . Direct HEAD returns 302 to Vercel SSO: owner login required; public access is not claimed. Draft PR #17 retains the reviewable changes.


## 2026-10-02 — Korean subtitle alignment
- User requested left alignment for 한국바이오트릭스 below the logo. Changed shared brand flex alignment to flex-start for header/footer at desktop/mobile widths.
- Confirmed a single targeted alignment change; no other layout or content change. Browser visual readback remains unverified. Production unchanged.


## 2026-10-02 — Align subtitle to visible logo edge
- Clarification: align the first Korean character with the visible original logo's left edge, excluding the SVG canvas inset.
- SVG viewBox width 590, visible left edge 25. Applied subtitle inset 25/590 = 4.2372881356% of the lockup width (8.69px desktop, 6.99px mobile); header and footer share the rule. Original logo paths unchanged.
- Geometry verified from both primary and reverse SVG source. Browser visual QA remains unverified. Production unchanged.


## 2026-10-02 — Compact header logo
- User requested a smaller homepage logo. Shared header logo reduced from 205 to 175px desktop and 165 to 145px mobile; Korean subtitle now 13/12px. Footer retained its existing size.
- Existing visible-left-edge alignment remains proportional (25/590). Targeted CSS selectors and responsive ordering checked; original SVG unchanged. Browser visual readback remains unverified.
- Implementation commit 28793839e2be7ce989e097632b127b2c3b2b202f; preview deployment pending status check. Production unchanged.


## 2026-10-02 23:11 KST — Further header logo reduction
- User still found the header logo large. Reduced desktop 175→150px and mobile 145→125px; subtitle retains readable 13/12px size and proportional visible-edge alignment.
- Verified targeted selector replacement, responsive rule ordering, 100% image width and retained subtitle inset. Original SVG/footer unchanged. Browser visual QA unverified.
- Implementation 0c718a8352616d48cd71aa6bd6c8d29d8dec165b; preview CI status follows. Production unchanged.


## 2026-10-02 23:13 KST — Approved production release
- User approved applying the reviewed redesign and final header logo (150px desktop / 125px mobile) to the live website.
- Removed preview noindex from five core pages and restored existing site verification, Open Graph, Twitter and Organization metadata from current main. Existing routes/assets/configuration retained.
- Static route/asset audit previously passed; targeted responsive logo selectors confirmed. Browser visual verification remains unavailable. Production deployment and HTTP readback pending.

### Verified production release
- PR #17 merged as f762d8a362693047877ff9ce3d6722da662a9e15; Vercel public project Git status success (GxiMP1sX1xWpQ2UT5zqSfMgWno5d).
- Live www domain redirects normally to apex. All five core routes and next.css return HTTP 200. Core pages load next.css, contain no noindex; homepage verification tags restored. Live CSS contains 150px desktop / 125px mobile header widths.
- HTTP/content readback verified; browser screenshot/interaction QA and deployment log scan remain unverified. HQ app is separate and not modified.


## 2026-10-02 23:18 KST — English single-line navigation
- User selected English-only navigation. Removed Korean secondary labels from desktop/mobile header menus across five core pages; retained Company / Science / Programs / Contact destinations and current-page markers.
- Checked eight secondary labels removed per page and no other page content changed. Browser visual QA unavailable. Live deployment/content readback pending.


## 2026-10-03 KST — Diagrams and English-first language switching
- User requested a full diagram placement review and EN / 한국어 controls with English as the default.
- Applied the approved five-icon artwork to Home research rows and Science/Programs figures. Original approved art retained as one WebP source; responsive CSS displays individual icons. These represent research areas, not verified company mechanisms.
- Added Company BIO + MATRIX relationship diagram; Science research approach and evaluation diagrams; Programs development flow; Home development-principle and Contact topic icons. Diagram labels change with the language.
- Added EN / 한국어 buttons across five core pages and two legal pages. English is server-rendered by default; an explicit saved choice persists across pages. Localized navigation, copy, calls to action, diagrams, page titles and accessible descriptions. Original Korean legal wording retained with English translation.
- PASS: seven-page routes/assets/unique IDs/H1/default locale/locale controls; JavaScript syntax; DOM execution tests of EN/KO changes, saved preference, menu/Escape and program links/legacy aliases. Very narrow mobile widths retain the language controls with a symbol-only menu button.
- Browser screenshots/layout interaction checks remain unverified: Chromium download failed with a truncated ZIP. No viewport pass claimed. Production deployment/HTTP readback follows commit. HQ app unchanged.

### Live release readback
- Implementation b295911a81a062cd7b2e9367b696586c60876cbf deployed successfully by the public Vercel project (9prZpM5d34uiSBxE5DmNQinR8LjR).
- Seven live routes return HTTP 200 with data-language=en and both locale controls. Diagram/icon placements match the reviewed source. Live icon, JavaScript and CSS SHA256 match the locally checked files.
- DOM behavior and static/HTTP checks passed. Browser screenshot/viewport rendering and interaction checks remain unverified; no visual pass claimed.

## 2026-10-03 — Live website audit and vision alignment
- Inspected ten live routes in Edge, including three obsolete lifestyle pages. Preserved current main ca77ff4 and worked on improve/vision-and-visual-audit-20261003.
- Fixed overlapping home research rows, narrow Science heading overflow, program spacing and menu Escape focus. Revised company/founder language to the biomedical vision, introduced intended AI approach, distinguished exploratory programs, and added external scientific background reading.
- Corrected English-first sharing metadata; configured three legacy redirects and cleaned sitemap.
- PASS: 56 viewport/language checks (7 pages, 320/390/768/1440, EN/KO), decoded images, H1, horizontal overflow, research-row collision, JS errors; 5 program panels, menu/Escape, locale persistence, redirects; JS syntax. Visually reviewed desktop/mobile captures.
- Detail: qa/2026-10-03-website-audit.md. Safari/iOS, email receipt and independent user testing unverified. Production deployment and HQ synchronization pending at this commit.

## 2026-10-03 — Founder portfolio redesign
- User rejected the prior visual and content quality and explicitly requested removing AI wording, improving typography, unifying BIO/X logo tones and presenting substantive project problems and solutions.
- Rebuilt Home, Company, Science, Projects and Contact as an editorial founder portfolio; retained domain, original logo geometry, approved hero/icon imagery, locale behavior and legacy redirects.
- Added self-hosted Manrope and Pretendard with their original OFL license files. Increased reading type and rebuilt heading weight, spacing, card layout, long-form project structure and mobile navigation layout.
- Unified primary/reverse wordmarks to one ink each. Existing BIO/X hex values were identical, but differing color distribution made them look inconsistent.
- Five projects now contain introduction, problem, proposed direction, importance, evaluation questions and next question. Research directions remain framed as intentions without prominent disclaimer blocks; no invented results added. Public AI language removed.
- PASS: 56 page/viewport/language checks, actual custom font loading, no AI token in visible text, no horizontal overflow/broken images/H1 errors/JS exceptions; five project selectors, language persistence, menu/Escape and configured redirects. Inspected full desktop home, mobile Korean home, desktop Korean project essay screenshots.
- Changed legal pages only for shared typography, navigation/footer continuity. No policy wording change. Safari/iOS and email receipt remain unverified.
- Production and HQ readback follow release. Reproducible project copy: scripts/portfolio-content.cjs; page builder: scripts/build-portfolio.cjs.

## 2026-10-03 research direction review preview
Separate preview branch; production unchanged. Concrete bilingual homepage, company direction, five research areas, development criteria and B2B contact. Concept image caption, noindex metadata. No confirmed assets or experimental milestones claimed. 56 viewport/language checks passed; 5 project selectors, menu and persistence passed. Final science wording adjusted after full checks; preview readback pending.

Preview deployment Ready: https://biotrix-vercel-ready-git-preview-researc-b19b72-jeongyucan-8678.vercel.app (PR20, aad755c). Anonymous access redirects to Vercel login; connector cannot issue share link because team scope returns403. User can review while signed into authorized Vercel account. HQ agent_runs/documents written and document readback confirmed. Production not merged.
