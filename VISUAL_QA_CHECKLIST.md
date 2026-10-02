# BIOTRIX Visual QA / Baseline Audit

세션: biotrix-design-audit-20261002 / 01a0fadf-2e40-7121-9116-6d15465254ec.
일자: 2026-10-02 KST. 페이지 HTML/CSS/JS 수정 없음. Production 배포 없음.

## 소스와 보존

Repo: https://github.com/jeongyucan-hash/biotrix
Branch: preview/biotrix-science-20261001
Baseline: c3940aa9a7b4076fb069679b9eacb12816e2a35d.
원본: C:/Users/hyunk/.codex/.chatgpt-projects/g-p-6a040ef9ad4881918d1fb16516118629/biotrix-preview.
원본 git status --porcelain은 비어 있었다. 원본에 쓰기 권한이 없으므로 동일 커밋의 독립 checkout을 이 세션 outputs/biotrix에 생성했다. 원본 checkout/reset/stash/clean은 수행하지 않았다.
Git fetch는 원본 권한, 사본에서는 네트워크 제한 때문에 실패했다. GitHub connector의 branch read로 원격 preview HEAD가 위 baseline과 같음을 직접 확인했다.

공개 홈페이지는 static HTML이다. scribe-nextjs의 HQ 앱은 검사/변경 대상이 아니다. CSS 진단 대상은 assets/biotech.css, 동작은 assets/biotech.js, 내용은 index.html이다.

## 실제 렌더링 결과

Local baseline: http://127.0.0.1:4187/ . Chrome headless, deviceScaleFactor 1, desktop 1440×900 / mobile 390×900 CSS px. fonts.ready 및 network idle 후 첫 slide에서 pause한 상태로 screenshot을 기록했다. height 900은 이번 감사의 기준이며 모바일 실제 기기·터치 환경 테스트는 아니다.

| 검증 | 1440 | 390 |
|---|---:|---:|
| document scrollWidth | 1440 | 390 |
| 전체 페이지 높이 | 5677px | 7480px |
| Hero section 높이 | 753px | 982px |
| Programs section 높이 | 1175px | 2000px |
| 페이지 JS 오류 / HTTP ≥400 응답 | 0 / 0 | 0 / 0 |
| 모바일 menu 열기 / Escape 닫기 | 해당 없음 | PASS / PASS |

Screenshot과 DOM 결과를 직접 검토했다. 가로 넘침은 없으나 접근성 전체 audit이나 대비 측정 전체 PASS를 의미하지 않는다. 모바일 hero는 viewport보다 길지만 핵심 메시지와 CTA가 이미지 앞에 있어 차단 결함으로 보지 않는다.

증거 파일(이 문서 기준 상대경로): ../hero-1440.png, ../hero-390.png, ../homepage-1440.png, ../homepage-390.png, ../menu-390.png, ../render-audit.json. 전체 화면은 긴 이미지이므로 hero 원본 이미지와 함께 검토한다.

## 확정 수정 우선순위

P1: 다음 디자인 수정에서 먼저 처리. P2: 구조 조정 이후 polish. P3: 비교 검토. P0 출시 차단 결함은 이번 범위에서 발견하지 못했다.

| 순서 / 우선순위 | 실제 근거 | 판단 / 다음 수정 | 완료 기준 |
|---|---|---|---|
| 1 / P1 | body #EEEAE1, hero #F3EFE6, program #E3E4D9; 화면 전반이 ivory/sage | Pure White 기본 캔버스와 중성 Silver를 사용하도록 색 토큰 정리. 현재 모양이 과거 요청에 따른 결과임을 보존 | 흰 기본 캔버스, 대비 측정, Deep Green 주요 계층, 두 viewport 비교 |
| 2 / P1 | area-list의 5개 thesis 문장이 programs에서도 그대로 반복; cards 3+2 desktop / 5단 mobile, Programs 2000px | Home에서 영역과 프로그램 역할 분리. 프로그램은 질문·검증 상태를 정직하게 담은 compact 목록으로 우선 설계 | 같은 설명 중복 제거, 프로그램을 읽기 위해 같은 badge/CTA를 5번 반복하지 않음, 상세 경로 유지 |
| 3 / P2 | 거의 모든 .section이 desktop 112px / mobile 65px; 유사한 영문 두 줄 heading과 numbered eyebrow 반복 | 정보 관계에 따라 섹션 간격과 제목 밀도 차등. 연구 설명과 founder narrative의 리듬을 분리 | 인접 섹션 역할과 전환이 구분되고 불필요한 빈 공간을 줄임 |
| 4 / P2 | body Arial → Noto Sans KR → Malgun Gothic; Georgia italic; hero 본문 14px/13px, metadata 10–12px | 한국어·영어 서체 일관성과 작은 정보 가독성을 검토. 모바일 h1 span block과 br이 빈 줄처럼 보이는 큰 간격을 만듦 | 동일 OS/viewport에서 의도한 줄바꿈, 본문 15–18px 목표, 폰트 로딩/라이선스 확인 |
| 5 / P2 | Contact CTA는 준비 중인 문의 채널로 연결, 실제 문의 수행 가능성 미확인 | 사용자에게 가능한 행동을 더 정확히 설명. 공식 채널은 확인 후만 추가 | CTA와 도착 페이지의 가능한 행동 일치; 가짜 form/email 없음 |
| 6 / P3 | 3장 generated concept photo, 7초 자동 전환·850ms crossfade | generic family/healthcare imagery가 고유 과학 맥락을 약하게 함. 승인된 사진을 즉시 교체하지 않고 manual-first와 scientific context 비교 | 자동 재생 유지 이유 확인, 출처·오해 위험 검토, reduced-motion·pause 재검증 |

## 요청한 AI UI 패턴별 판정

- 반복 카드: 발견. Programs의 다섯 article이 같은 badge, 제목, 설명, CTA; 모바일 영향이 가장 크다.
- 과도한 rounded container: 발견하지 못함. programs article은 square; gallery 4px. badge 20px와 원형 제어는 국소적 예외이며 전체 제거 근거가 없다.
- Gradient/glow: 현재 Home DOM의 gradient 0, 주요 biotech.css에 glow 효과 없음. legacy assets의 CSS 존재만으로 현재 Home에 적용됐다고 판단하지 않는다.
- Centered hero: 발견하지 못함. desktop left copy/right image; mobile left-aligned sequential composition. 유지한다.
- 획일적 spacing: 발견. .section의 동일 padding과 반복 section-heading 구조.
- Generic typography: 발견. 기본 system fallback과 반복 영문 heading 구조. 커스텀 폰트 추가만으로 해결됐다고 판단하지 않는다.
- 의미 없는 animation: 연속 장식 animation은 발견하지 못함. slideshow와 link hover는 기능이 있으나 slideshow의 브랜드/정보 기여는 재검토 대상이다.

## 다음 변경의 체크리스트

- [ ] 수정 전 git status, branch, baseline과 원격 변경 확인. 기존 변경을 분리·보존.
- [ ] PRODUCT.md의 사용자 목적과 미확인 주장 목록 확인.
- [ ] 한 번에 한 우선 항목 수정하고 변경 의도를 기록.
- [ ] 동일 baseline slide와 viewport에서 before/after screenshot 기록.
- [ ] Desktop 1440×900과 Mobile 390×900에서 Hero/모든 섹션/Footer 시각 검토.
- [ ] 제목 줄바꿈, 피사체 crop, 본문 가독성, 색 대비, overflow, 섹션 리듬 확인.
- [ ] Menu/keyboard/Escape/focus/skip link/anchor/CTA 목적 확인.
- [ ] slideshow prev/next/wrap/pause, reduced-motion, no-JS 확인(이번 세션은 pause와 메뉴만 확인).
- [ ] 관련 페이지·내부 링크·assets/console 확인. 변경에 따라 320/768/1920 추가.
- [ ] canonical, 검색 인증, robots, sitemap, JSON-LD와 법적·커머스 경로 보존 확인.
- [ ] 문제 발견 → 수정 → 동일 화면 재확인. 미해결 사항은 PASS로 기록하지 않음.
- [ ] QA_LOG.md와 HQ 기록, preview 배포 여부·한계를 기록. Production은 별도 승인 후 진행.

## 검증 한계

이번 실렌더링은 최신 preview branch 코드의 로컬 홈페이지다. 운영 홈페이지와 hosted Vercel preview의 동일성·배포 상태는 이번 결과로 보증하지 않는다. 전체 사이트 기능, 성능/전환율, WCAG 전체 검수, 실제 모바일 기기 테스트는 수행하지 않았다. 감사 중 발견한 항목은 디자인 판단이며 사용자 조사 결과가 아니다.
원본 첨부 가이드는 읽었으며 특정 Claude 스킬 설치 대신 디자인 기준 + 제품 컨텍스트 + 실제 화면 검수 루프를 문서화했다. agent-browser CLI가 설치되어 있지 않아 사용 가능한 Playwright/Chrome으로 동일 viewport 실렌더링과 screenshot 검수를 수행했다.

## 전달 상태

문서는 로컬 docs/biotrix-design-audit-20261002 브랜치에 보존했다. GitHub 업로드는 자동 승인 검토가 외부 게시에 대한 명시적 승인 부족으로 거절했다. 우회하지 않았고 원격 변경은 없다. HQ connector에서 테이블 구조는 확인했으나 외부 기록 저장은 보류했으며 agent_runs/documents 저장 완료로 보고하지 않는다. 사용자 승인 후 문서 브랜치 업로드와 동일 세션 ID의 HQ 기록을 수행한다.


## Superseding implementation / 2026-10-02

The preceding document is the preserved baseline audit. Brand System 1.0 now supersedes the green palette and preview-only scope by explicit user instruction. Current design: DESIGN.md. Implementation checks and deployment evidence: QA_LOG.md. Five core routes passed 390/1440/1920px rendering, 11 legacy routes passed 390/1440px layout/image checks. No full accessibility certification or physical device coverage is claimed.
