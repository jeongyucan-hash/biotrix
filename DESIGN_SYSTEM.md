# BIOTRIX Website Design System v1.0

Status: Active working standard
Brand: BIOTRIX
Core message: Elevating Life.
Brand idea: Nature × Science × Technology
Business structure: Brand/Trust Hub → Product Understanding → Coupang Purchase / B2B Partnership

---

## 1. Non-negotiable principles

1. One screen, one primary message.
2. Accuracy before decoration. Never present unverified products, partners, facilities, achievements, history, contacts, or capabilities as facts.
3. Primary CTA count: 1 per section. Secondary CTA: maximum 1.
4. BIOTRIX owns brand context; Coupang owns checkout, payment, delivery, and reviews until the commerce model changes.
5. Never bake important Korean/English copy into generated images. Text, logo, buttons, navigation, labels, and UI are HTML/CSS.
6. Generated imagery is visual material only.
7. Repetition must feel intentional, not duplicated. Do not reuse the same hero/category image in adjacent major sections.
8. Mobile is a designed experience, not a shrunk desktop page.
9. Accessibility and semantic correctness are release requirements.
10. A page does not ship until Brand QA, UX QA, Business QA, and Technical QA all pass.

## 2. Brand personality

- Premium, not luxurious for its own sake
- Scientific, not clinical or cold
- Natural, not rustic or organic-store cliché
- Minimal, not empty
- Trustworthy, not oversized or overclaimed
- Contemporary, not trend-dependent

Recommended balance:
- Clean corporate: 55–65%
- Nature: 20–30%
- Science abstraction: 10–20%
- Human/lifestyle: category-dependent

## 3. Color system

| Token | Value | Role |
| --- | --- | --- |
| Deep Green | #123F36 | Primary brand / primary action |
| Deep Green Dark | #0B3029 | Dark surfaces / footer / partnership |
| Silver | #B8BEC1 | Technical accent only |
| Pure White | #FFFFFF | Primary base |
| Light Gray | #F5F7F6 | Secondary surface |
| Ink | #111514 | Primary text |
| Muted | #66726E | Secondary text |
| Border | #E6EBE8 | Dividers / card borders |

Rules:
- Silver must not become a body-text color or primary CTA.
- Deep Green is the only primary CTA color.
- Do not introduce random greens per section.
- Normal text should meet WCAG AA contrast; large text should remain comfortably legible over imagery.

## 4. Grid and spacing

Desktop:
- Reference viewport: 1440px
- Content max width: 1320px
- Horizontal margin: 40px minimum / 64–80px preferred on wide screens
- 12-column logic for complex sections

Spacing tokens:
8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 108 / 112 / 128

Never use arbitrary spacing unless a visual QA issue requires it.

Section rhythm:
- Standard major section: 96–112px vertical
- Compact band: 64–90px
- Mobile major section: 72–82px

## 5. Typography

Display style:
- English brand/editorial headline: Georgia or equivalent high-contrast serif
- Korean headings/body/UI: system Korean sans stack
- Wordmark: custom uppercase BIOTRIX with wide tracking

Scale:
- Hero display: 58–100px responsive
- Major section H2: 34–56px responsive
- Card title: 24–34px
- Body: 14–17px
- Eyebrow: 10–11px with 0.18–0.22em tracking
- Utility/navigation: 11–13px

Rules:
- Maximum two font families on a page.
- Avoid bold on all text. Hierarchy comes from scale, spacing, and contrast first.
- Korean lines should not be forced into awkward breaks for symmetry.

## 6. Logo system

Primary lockup:
[B+X symbol] BIOTRIX

Secondary:
Symbol only

Tagline:
Elevating Life.

Rules:
- Tagline is not permanently fused to the logo.
- Header uses symbol + wordmark only.
- Logo must remain legible at mobile header size.
- Symbol geometry must be identical on every page and favicon.
- Do not regenerate the logo with an image model.

## 7. Imagery system

Image families:
- Nature: fruit, botanical macro, raw material, clean daylight
- Science: glass, liquid, capsule, laboratory abstraction
- Human: healthy lifestyle / skin / calm human presence
- Corporate: partnership, distribution, process — use sparingly

Category guidance:
- HOME: Nature 50 / Science 30 / Human 20
- FOOD: Nature dominant
- HEALTH: Science dominant
- BEAUTY: Human + clean science
- PARTNERSHIP: Corporate + restrained nature/science

Rules:
- No text embedded in image files.
- No fake product package unless explicitly labeled concept and kept off public production pages.
- Avoid excessive glass spheres, droppers, leaves, and water droplets across every section.
- Adjacent major sections should not reuse the identical image.
- Use negative space intentionally.

## 8. Components

Header:
- 80px desktop / 68px mobile
- Sticky
- White translucent surface
- Desktop navigation + one CTA maximum
- Mobile must have a functioning MENU panel

Buttons:
- Primary: Deep Green, white text, pill or restrained radius
- Secondary: white/transparent, subtle border
- Minimum practical tap target: approximately 44px

Cards:
- One card grammar across site
- Thin border, restrained/no shadow
- Consistent image ratio within a card group
- Category label → title → short explanation → optional single action

Footer:
- Dark Deep Green surface
- BIOTRIX lockup
- Core navigation
- Privacy / Terms
- No prototype/debug wording in public UI

## 9. CTA hierarchy

Until actual Coupang product URLs exist:
- Header: 제품 보기
- Product page: 구매 안내
- Partnership: 파트너십 문의하기

After a verified product URL exists:
- Product-specific CTA may become: 쿠팡에서 구매하기 ↗
- It must link directly to the verified product listing.

Never label an internal navigation link as “쿠팡에서 구매하기”.

## 10. Content governance

Allowed:
- Verified company identity
- Current business focus
- Current operating model
- Clearly framed future direction
- Verified product, partner, contact, and legal information

Not allowed:
- Invented SKU
- Invented clinical/scientific claim
- Invented sales number
- Invented client/partner logo
- Invented office/factory/lab
- Invented executive history
- Invented phone/email/address
- Future plan written as current capability

Future statements must use language such as:
- 지향합니다
- 검토합니다
- 확장하고자 합니다
- 준비 중입니다
- 순차 공개합니다

## 11. Page architecture

HOME
Hero → Three Solutions → Why BIOTRIX → Brand Hub / Purchase Model → Partnership → Footer

COMPANY
Identity → Purpose → Bio + Matrix → Principles → Direction

BUSINESS
Discover → Evaluate → Position → Connect → Focus Areas → Business Model

PRODUCTS
Category Hub → FOOD / HEALTH / BEAUTY → Purchase Guide → Product Principle

PARTNERSHIP
Opportunity Areas → Partnership Process → Why BIOTRIX → Inquiry CTA

CONTACT
Inquiry Form → Official Contact Information → FAQ

## 12. Responsive rules

Breakpoints:
- Desktop: > 950px
- Tablet: 621–950px
- Mobile: ≤ 620px

Mobile:
- Desktop nav is hidden; mobile MENU is mandatory.
- 3/4/5-column layouts collapse deliberately, not by squeezing.
- Card copy must remain readable without horizontal scroll.
- Large headings may reduce size, but layout restructuring comes first.
- Footer links must wrap cleanly.

## 13. Accessibility standard

Release requirement:
- One H1 per page
- Semantic main element
- Skip-to-content link on primary pages
- Visible :focus-visible state
- Form labels connected with for/id
- aria-current on current desktop navigation
- Decorative graphics marked appropriately
- No empty or “#” production links
- prefers-reduced-motion respected
- Keyboard navigation remains usable

Target: WCAG 2.2 AA where practical.

## 14. SEO / technical baseline

Every primary page:
- Unique title
- Unique meta description
- Canonical URL
- og:title / og:description / og:url
- theme-color
- favicon
- Clean URL
- Sitemap inclusion

HOME additionally:
- WebSite structured data

Security:
- nosniff
- strict-origin-when-cross-origin
- restrictive Permissions-Policy
- SAMEORIGIN framing unless business needs change

## 15. Four-gate QA

### Brand QA
- Does this look unmistakably like BIOTRIX?
- Is the nature/science balance controlled?
- Are logo/color/type rules identical?

### UX QA
- Can the user understand the page purpose within seconds?
- Is there one obvious primary action?
- Does mobile navigation work?
- Is anything visually competing without reason?

### Business QA
- Is every factual claim verified?
- Does the page reflect the current Coupang-first business model?
- Are future capabilities clearly future-facing?
- Does the CTA match what happens after clicking?

### Technical QA
- Deployment succeeds
- No duplicate IDs
- No empty/# links
- No obsolete anchor routes
- Metadata present
- Accessibility baseline present
- Sitemap/routes consistent
- Desktop/tablet/mobile breakpoints defined

## 16. Release rule

A change can enter production only when:
Brand QA = PASS
UX QA = PASS
Business QA = PASS
Technical QA = PASS

If any one gate fails, revise before merge.

