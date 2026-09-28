# HQ 홈페이지 디자인실 · DM-3.2

- Owner: website_design, parent marketing. Decisions in /design and `design.department` are the design authority.
- 14 boards: visual direction, four distinct photographic scenes, use rules, logo/palette/type, home desktop, home category/story, mobile three states, company, business, products, partnership/contact, interaction QA, HQ workflow and handoff. Each board has an individual PDF download; editable SVG boards and photo sources live in the source ZIP.
- The full PDF, PDF-based Illustrator compatibility copy, editable SVG and source ZIP are private assets behind active-admin authorization. The `.ai` is not native Illustrator export and was not opened in Adobe Illustrator.
- Generated photos depict mood only, not BIOTRIX products, suppliers, facilities or customers.
- ChatGPT Work implements reviewed decisions. A work request alone does not trigger unattended deployment.
- Design learning is at /learning. Its aggregate evidence is currently empty; it cannot recommend a winning design until comparable actual observations arrive. See design-learning.md.

Validation: 14 master PDF pages rendered and inspected, no content overflow; individual PDF boards parse. HQ build and 8 tests pass. Admin-authenticated UI review requires an authenticated browser session; server authorization and file allowlist have test coverage.

## Logo decision · 2026-09-28

Compared three vector routes at header and 16px sizes. Chose the single Forest negative-space B: distinct letter silhouette and leaf-like apertures with no raster resolution limit. Direction B read as a leaf without the name initial; direction C was too generic at favicon size. The public SVG, favicon, 14-board master, individual board 04 and source package share the same geometry. The editable SVG is the canonical logo. Trademark clearance and native Illustrator save remain separate from visual approval.

## White canvas · 2026-09-28

A안 Negative B 심볼을 유지하고, 공개 홈페이지와 마스터의 전역 아이보리 배경을 #FFFFFF로 전환했다. 헤더·푸터·메인 슬라이드 컨트롤·모바일 메뉴는 흰색이며 Sage/Peach는 구획별 포인트 색상으로 제한한다. 14장 PDF의 표면과 색상표, SVG 및 원본 패키지의 CSS를 같은 버전으로 갱신했다.
