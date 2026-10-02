# BIOTRIX Design System v1

2026-10-02. 다음 홈페이지 수정의 기준이며 아직 CSS에 적용되지 않았다.
적용 범위: 공개 biotech Home / Company / Science / Programs / Contact. 기존 DESIGN_SYSTEM.md의 커머스 중심 DM-3.2, HERO_DESIGN.md의 시안과 출처 기록은 보존한다. 충돌하는 시각 기준은 이번 DESIGN.md를 우선한다. 승인된 문구와 기능은 별도 합의 없이 바꾸지 않는다.

## 디자인 판단

Bio / Science / AI / Commerce. Clinical + Institutional + Technology.
DESIGN_VARIANCE 6 / MOTION_INTENSITY 3 / VISUAL_DENSITY 5.

6: 브랜드를 드러내는 비대칭 정보 구성과 타이포 계층을 사용하되 읽기 순서는 익숙하게 유지한다.
3: 피드백·상태 변화만 절제해 표현한다. 연속 장식 움직임을 추가하지 않는다.
5: 과학적 정보는 보존하면서 홈은 요약, 상세 페이지는 근거와 맥락을 담당한다.

## 색과 표면

| 역할 | 시작 토큰 | 사용 |
|---|---|---|
| Deep Green | #153E33 | 제목, 핵심 CTA, 제한된 강조 구역 |
| Pure White | #FFFFFF | 기본 캔버스, 헤더, 주요 본문 |
| Silver | #BDC5C9 | 선, 구분, 비문자 장식 |
| Ink | #252B28 | 본문 |
| Muted | #55615C | 보조 텍스트 |
| Line | #D7DDDA | 구분선 |

Silver를 흰색 위 작은 본문색으로 쓰지 않는다. 본문 4.5:1, 큰 글자 및 필수 UI 3:1 이상의 대비를 후속 변경에서 측정한다. 현재 ivory #EEEAE1, hero #F3EFE6, sage program surface #E3E4D9는 목표와 다른 baseline이다. 이는 오작동이 아니라 과거 방향과 이번 방향의 차이다.
Gradient/glow는 기본적으로 사용하지 않는다. 배경색·선·정보 계층으로 구분한다.

## 타이포

현재 Arial / Noto Sans KR / Malgun Gothic 및 일부 Georgia italic의 조합은 OS별 차이가 크다. 후속 작업은 라이선스와 로딩 조건을 확인한 한국어·영어 sans 계열을 한 세트로 선택하고 실제 화면에서 확정한다. 지금 외부 폰트를 설치하지 않는다.

시작 scale: desktop H1 52–60px, H2 36–44px, H3 24–30px, 본문 16–18px; mobile H1 32–38px, H2 28–32px, H3 22–26px, 본문 15–16px. 본문 line-height 1.65–1.8. 한국어 keep-all을 사용하되 줄 넘침을 검수한다. 작은 메타데이터 12px, 기본 CTA 14px 이상을 목표로 한다.
영문 eyebrow의 tracking은 .08–.12em 범위로 제한한다. 모든 heading을 같은 크기·형태의 영문 슬로건으로 만들지 않는다. Serif italic은 의미 있는 제한적 강조에만 사용한다.

## 그리드와 여백

최대 컨테이너 1280px. 1440px에서 좌우 80px의 실제 여백을 기준으로 한다. 태블릿 32px, 390px 모바일 20px. desktop 12-column, mobile 4-column을 설계 기준으로 삼는다.
Hero는 좌측 메시지와 우측 이미지의 역할을 유지한다. centered SaaS hero로 바꾸지 않는다. 모바일은 카피 → 주요 CTA → 이미지 순서다.
spacing 토큰 8 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 112px. 모든 섹션에 같은 112px/65px padding을 복사하지 않는다. 설명 블록 64–80px, 주요 전환 96–112px, 모바일 40–64px 범위에서 내용과 관계에 따라 선택한다. 값의 변주 자체보다 위계가 목적이다.
700px과 1000px을 기존 responsive 경계로 유지하며 390/1440 필수 검수, 변경 범위에 따라 320/768/1920 추가 검수한다.

## 컴포넌트와 콘텐츠

Navigation: Company / Science / Programs / Contact. sticky header가 focus와 anchor를 가리지 않아야 한다. 모바일 메뉴는 키보드·Escape를 지원한다.
CTA: Home의 우선 행동은 연구 접근법 확인. 하단 Contact는 다음 행동이 실제 가능한지 분명히 표시한다. 링크는 밑줄 또는 명확한 상태 피드백을 사용한다. 클릭 대상 최소 44px을 목표로 한다.
Cards: 비교 가능한 항목에만 사용한다. 홈의 프로그램은 research 영역 설명과 다른 내용을 주거나 더 간결한 ruled list로 바꾸는 것이 우선이다. 같은 badge·타이틀·설명·CTA 카드 5개를 모바일에 그대로 반복하지 않는다.
Radius: 기본 0, 이미지·작은 기능 표면 최대 4px, pill은 실제 상태·분류에 한정. 원형 slideshow 제어는 기능상의 예외다. 섹션 전체를 rounded container로 감싸지 않는다.
Footer: 브랜드, 네 개 주요 경로, 법적 링크, 실제 확인된 정보만 둔다. 연락처나 회사 규모를 만들지 않는다.
Image: 현재 3장 generated conceptual photo의 provenance를 보존한다. 인물·현미경 사진만으로 실제 R&D 역량을 암시하지 않는다. 모바일 피사체 crop, alt, 로딩을 확인한다. 페이지마다 동일 사진을 반복하는 방식은 피한다.
Programs 상세 공통 구조: 이름 → 연구영역 → 구체적 질문 → 가설/근거 → 검증 접근 → 확인된 상태 → 공개자료 → 관련 문의. 자료 미확인 항목은 정직하게 표시한다.

## 모션

현행 slideshow는 7초 간격·850ms crossfade이며 pause/prev/next, hover/focus/hidden-tab pause, reduced-motion과 no-JS fallback을 이미 갖는다. 장식 모션으로 단정하지 않는다. 다만 실제 정보가 추가되지 않는다면 manual-first와 짧은 전환을 비교 검토한다.
일반 hover/focus는 120–200ms. 새 자동 재생·parallax·scroll reveal·glow를 추가하지 않는다. reduced-motion에서는 즉시 전환 또는 수동 조작을 지원한다.

## Visual Feedback Loop

제품 목적 확인 → 기준으로 디자인 판단 → 작은 단위 구현 → 브라우저 실렌더링 → screenshot과 DOM/기능 확인 → 문제를 근거와 함께 기록 → 수정 → 동일 viewport에서 재확인.
각 수정은 이전·이후 같은 viewport/slide/scroll 위치로 비교한다. 문서 작성이나 빌드 성공만으로 시각 QA 완료를 선언하지 않는다. 우선순위와 baseline은 VISUAL_QA_CHECKLIST.md를 따른다.
