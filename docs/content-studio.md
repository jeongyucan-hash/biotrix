# BIOTRIX 콘텐츠 스튜디오 구현 기준

## 현재 상태

이 저장소는 정적 사이트다. `admin.html`은 인증, 데이터베이스, 서버 함수가 없는 화면 시안이다. 따라서 콘텐츠 초안, 고객 반응, Meta 토큰, AI API 키를 현재 정적 파일이나 브라우저 저장소에 보관하지 않는다. 콘텐츠 스튜디오는 인증된 서버와 영구 저장소가 붙기 전까지 공개 배포하지 않는다.

## 첫 운영 목표

매주 고객·시장 신호에서 주제 후보를 만들고, 근거를 확인해 콘텐츠를 제작한 뒤, 소유자가 승인한 자료만 `@bio.elevating`에 게시한다. 게시 후 반응과 문의를 다음 기획에 반영한다.

## 단일 작업 흐름

`아이디어 → 조사 → 초안 → 검수 → 승인 대기 → 게시 대기 → 게시 완료`

검수 반려는 초안으로, 승인 반려는 검수로 돌린다. 게시 실패는 게시 대기 상태로 남기고 오류와 재시도 횟수를 기록한다. 모든 상태 변경은 행위자, 시각, 이전·다음 상태를 감사 기록에 남긴다. AI는 게시 또는 승인 상태로 직접 변경하지 못한다.

## 데이터 모델

| 테이블 | 주요 필드 | 용도 |
| --- | --- | --- |
| `content_items` | `id`, `title`, `audience`, `customer_problem`, `format`, `status`, `owner_id`, `scheduled_at`, `created_at`, `updated_at` | 콘텐츠 작업 단위 |
| `sources` | `id`, `content_id`, `url`, `publisher`, `published_at`, `retrieved_at`, `excerpt`, `reliability_note` | 주장과 근거 연결 |
| `content_versions` | `id`, `content_id`, `version`, `caption`, `script`, `asset_manifest`, `created_by`, `created_at` | 변경 가능한 원고와 자산 이력 |
| `reviews` | `id`, `content_id`, `version_id`, `reviewer_id`, `decision`, `notes`, `created_at` | 사람의 검수·승인 |
| `publications` | `id`, `content_id`, `version_id`, `platform`, `idempotency_key`, `remote_media_id`, `permalink`, `status`, `error_code`, `attempts`, `published_at` | 예약·발행·실패 기록 |
| `signals` | `id`, `source_type`, `source_ref`, `observed_at`, `summary`, `theme`, `consent_scope` | 고객 질문·성과·시장 신호 |
| `metrics` | `publication_id`, `observed_at`, `metric`, `value` | 시점별 성과 |
| `audit_events` | `id`, `actor_id`, `action`, `subject_id`, `before`, `after`, `created_at` | 변경 추적 |

## AI 작업 계약

1. `research`: 원문과 URL, 확인 시각을 입력받아 관찰과 추론을 구분한 주제 후보를 반환한다. 출처 없는 수치와 효능 주장은 후보에서 제외한다.
2. `plan`: 후보마다 고객 문제, 예상 행동, 근거, 제작 자산, 검수 위험을 구조화한다.
3. `draft`: 승인된 기획과 브랜드 가이드만 사용하여 캡션, 슬라이드별 문안, 영상 대본을 만든다. 생성 결과는 새 버전으로 저장한다.
4. `review`: 출처 누락, 과장된 건강·효능 표현, 저작권 확인 필요 자산, 브랜드 규칙 위반을 표시한다. 판정은 사람에게 남긴다.
5. `learn`: 게시 성과와 문의를 요약하고 다음 실험 가설을 제시한다. 조회수와 구매 전환을 혼동하지 않는다.

모든 AI 호출은 입력 버전, 출력 버전, 모델, 시각, 처리 결과와 비용을 추적한다. 비밀값과 고객 개인정보는 프롬프트에 넣기 전에 제거하거나 최소화한다.

## 구현 순서와 완료 기준

### 1. 인증 및 영구 저장

- 관리자만 `/admin/content`에 접근하고 서버에서도 권한을 검사한다.
- 데이터베이스 마이그레이션과 감사 기록을 적용한다.
- 콘텐츠 등록, 수정, 상태 이동, 버전 조회가 새로고침과 다른 기기에서도 일관되게 유지된다.

### 2. AI 초안과 사람 승인

- 서버에서만 AI API를 호출하며 키는 서버 환경변수로 관리한다.
- 자료 URL과 검증 날짜를 저장하고 초안에 연결한다.
- AI 결과는 언제나 초안 상태이고 소유자 승인 없이는 게시 대기로 넘어가지 않는다.

### 3. Instagram 연결

- `Elevating Creator OS` 앱에서 `@bio.elevating`에 필요한 최소 권한만 요청한다.
- Instagram User ID와 토큰은 서버에서 암호화하여 저장한다. 화면·로그·채팅에 토큰을 표시하지 않는다.
- 별도 테스트 자산으로 미디어 컨테이너 생성, 상태 확인, 발행 결과 확인을 수행한다.
- 예약 작업은 멱등 키로 중복 게시를 막고 실패 시 사람에게 알린다.

### 4. 성과와 커뮤니티

- Meta에서 승인된 인사이트·댓글 권한 범위 내에서 데이터를 수집한다.
- 댓글 분류와 답변 초안을 제공한다. 민감한 문의는 자동 발송하지 않는다.
- 콘텐츠별 문의·주문 연결은 자체 유입 추적 데이터와 구분해 기록한다.

## 기존 저장소와의 접점

현재 `admin.html`은 정적 시안이므로 공개 사이트의 `/admin`에 바로 기능을 덧붙이지 않는다. 공개 사이트는 유지하고, 인증된 어드민 앱을 별도 프로젝트 또는 별도 서버 경로로 구축한 뒤 디자인 토큰과 메뉴만 공유한다. 운영 데이터와 비밀값이 공개 정적 산출물에 포함되지 않는 것을 배포 검사 항목으로 둔다.
