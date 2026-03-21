# 개발 일지

> 최신이 위로. 각 세션에서 뭘 했고, 뭐가 막혔고, 다음은 뭔지.

---

## 2026-03-21 (Day 3) — 생태계 문서 통합 + 멀티레포 맥락 전략

### 한 일

- **생태계 통합 문서 생성** → `docs/export/BHOS-ECOSYSTEM.md` (830줄)
  - `docs/dev/` 12개 파일을 하나의 포터블 마크다운으로 통합
  - 비전, 아키텍처, 제품, BM, PRD, ADR 15개, PoC 결과, 히스토리 요약 포함
  - 목적: bhOS 레포 + 하위 개발 레포(ClawTalk, ClawMemory, ClawNote)에 맥락 제공

- **멀티레포 맥락 배포 전략 확정** (전문가 패널 정반합 토론)
  - 쟁점: 전역 CLAUDE.md vs 프로젝트 auto-memory vs 레포별 복사
  - 결론: **프로젝트별 auto-memory** (`project_ecosystem.md` 20~25줄 맞춤 요약)
  - 원본은 bhOS에 단일 소스 (`~/bhOS/docs/BHOS-ECOSYSTEM.md`)
  - CLAUDE.md 라인 예산 소모 0, 전역 오염 0, 관련 프로젝트에서만 로드

- **글로벌 스킬 `/bh-eco-sync` 생성** → `~/.claude/skills/bh-eco-sync/SKILL.md`
  - 아무 Claw 레포에서 `/bh-eco-sync` 실행 → 생태계 맥락 자동 주입
  - 디렉토리명으로 모듈 자동 감지 (clawtalk→ClawTalk 등)
  - 맞춤 요약 생성 → auto-memory에 저장 → MEMORY.md 인덱스 업데이트
  - 새 레포(clawnote 등) 부트스트랩에도 사용 가능

- **커스텀 스킬 네이밍 체계 확정**
  - 패턴: `bh-{카테고리}-{동작}` (eco/dev/ops)
  - 첫 스킬: `bh-eco-sync`

### 핵심 결정

- 전역 CLAUDE.md에 생태계 맥락 넣지 않는다 (라인 예산 60줄 한계)
- auto-memory가 정답: 프로젝트 격리, 자동 로드, CLAUDE.md 독립
- bhOS 원본 + 각 레포 맞춤 요약 구조 (Phase 전환 시 수동 동기화)
- 글로벌 스킬(`~/.claude/skills/`)은 모든 프로젝트에서 사용 가능

### 산출물

| 산출물 | 경로 |
|--------|------|
| 생태계 통합 문서 | `docs/export/BHOS-ECOSYSTEM.md` |
| bhOS 원본 | `~/bhOS/docs/BHOS-ECOSYSTEM.md` |
| 글로벌 스킬 | `~/.claude/skills/bh-eco-sync/SKILL.md` |
| 네이밍 체계 메모리 | `~/.claude/projects/.../memory/reference_skill_naming.md` |

### 다음 (→ 새 세션)

- [ ] 각 레포에서 `/bh-eco-sync` 실행 (bhOS, clawtalk, nanoclaw)
- [ ] clawtalk Sprint 계속 진행
- [ ] ClawMemory 레포 셋업 시작

---

## 2026-03-20 (Day 2) — 후반

### 한 일 (후반)

- ClawTalk PRD 작성 → `docs/dev/PRD.md`
  - BYOK + OpenRouter 무료 체험 모델
  - 온보딩: 캘린더 연동 → 가상봇 체험 → 30초 아하 모먼트
  - Telegram 첫 진입 → 웹앱으로 유도
- 생태계 비전 재설계
  - bhOS = 최종 제품 (AI 워크스테이션), 나머지는 모듈
  - ClawMemory = 기억 시스템 (노트가 아님), 관계 그래프 + 온도
  - ClawMeeting = 한국어 미팅 전사 (즉시 수익)
  - claw-lab은 내부 연구용, 사용자 비노출
- 모듈 독립성 설계 → Claw Core + 이벤트 버스
- 문서 세분화: ECOSYSTEM-VISION → VISION + ARCHITECTURE + PRODUCTS + BM
- 리서치 인덱스 작성 (25개 항목: 시장 5, 경쟁자 5, 기술 12, 법규 5)
- TODO 3곳 분리 (bhOS 글로벌 / nanoclaw 로컬 / clawtalk 로컬)
- 세션 마무리 런북 작성 → `~/bhOS/06-runbooks/session-handoff.md`

### 핵심 결정

- bhOS가 OS 계층 — "ClawOS" 불필요
- "싸우지 않고 이긴다" — 상위 집합 전략 확정
- 빌드 순서: ClawTalk + ClawMemory(병행) → ClawMeeting → ClawNote
- 리서치 산출물: 생태계 공용은 nanoclaw, 제품 전용은 각 레포
- 문서 역할: nanoclaw = "왜" + 전체, clawtalk = "뭘" + "어떻게"

### 다음 (→ 새 세션)

- [ ] clawtalk 레포 생성 + Sprint 1

- [ ] Phase 1 리서치 병렬 실행 (C-02, C-04, T-05, T-06)

---

## 2026-03-20 (Day 2) — 전반

### 한 일 (전반)

- 메신저별 에이전트 간 통신 가능성 비교 분석 완료 → `docs/research/05-messenger-agent-comparison.md`
- NanoClaw 채널 아키텍처 상세 분석 (IPC, container-runner, group-queue)
- 후속 리서치 마스터 플랜 수립 (4단계, 13개 리서치 주제, 6주)
- 개발 문서화 체계 수립 → `docs/dev/` (JOURNAL, TODO, DECISIONS, PoC 트래킹)
- **PoC 001 "약속 잡기" 구현 및 동작 확인** → `poc/schedule-agent/`
  - Telegram 봇 2개 (BotA: @Nano_Samanda_bot, BotB: @BHtalk_friend_agent_bot)
  - 공유 백엔드 Coordinator 패턴 (상태 머신)
  - 에이전트 간 통신 투명성 로그 (\[🅰️ → 🅱️ 에이전트 간 통신\])
  - 복수 선택 HITL (⬜/✅ 토글 + 📌 확인, 순차 선택: A 먼저 → B는 A 선택 중에서)
  - 솔로 모드 (가상 친구) 지원
  - **Google Calendar 실제 연동** (OAuth2 + FreeBusy API + Events API)
    - GCP 프로젝트 생성, OAuth 동의 화면, credentials.json, token.json
    - 실제 빈 저녁 시간 조회 → 확정 시 Google Calendar에 이벤트 생성
- git 커밋: `e8e112c` (16파일, 1,769줄)

### 핵심 발견

- **Telegram은 봇 간 메시지 수신을 원천 차단** — 공유 백엔드가 유일한 해법
- **Coordinator 패턴 = ACP 서버의 프로토타입** — 상태 머신이 에이전트 간 조율의 핵심
- **순차 선택이 병렬보다 자연스러움** — A가 먼저 복수 선택 → B가 그 중에서 선택
- **그룹 프라이버시 모드** — Telegram 봇은 그룹에서 일반 텍스트를 못 봄, 인라인 버튼 필수
- **Google Calendar FreeBusy API** — 실제 빈 시간을 1시간 단위로 조회 가능

### 막힌 것 (모두 해결됨)

- Telegram 그룹 프라이버시: "확인" 텍스트 못 봄 → 인라인 버튼으로 해결
- NanoClaw와 봇 토큰 충돌: 동시 polling 불가 → NanoClaw 중지 후 PoC 실행
- Mock 캘린더 교집합 0개: 랜덤 생성 문제 → referenceSlots로 보장
- IPv6 타임아웃: grammy + node-fetch → `https.Agent({ family: 4 })` 적용

### 다음 (→ Day 3에서 수행)

- [ ] ClawTalk MVP Sprint 1: 프로젝트 셋업 + 웹 앱 기본 껍데기

---

## 2026-03-19 (Day 1)

### 한 일

- NanoClaw 초기 설정 (맥미니)
  - Docker, Node.js, 컨테이너 빌드 완료
  - Telegram 채널 연동 (`@Nano_Samanda_bot`)
  - IPv6 문제 발견 및 해결 (`https.Agent({ family: 4 })`)
- 보안 위험성 분석 (집합론 + Gary Klein RPD)
- 전문가 패널 정반합 토론 (5인, 3라운드)
  - 시장 데이터 수집: AI agent $7.9B→$236B, MCP 81.5k stars
  - 핵심 전략: "제품 먼저, 프로토콜은 추출" (MCP 모델)
  - 실행 로드맵: Phase 0\~3 (에이전트 대시보드 → 메신저 → 프로토콜)

### 핵심 발견

- grammy가 node-fetch 사용 → macOS에서 IPv6 타임아웃 문제
- 카카오톡: 봇/AI 에이전트 공식 미지원 → 기회의 빈틈
- "에이전트 네이티브 메신저" 카테고리 자체가 존재하지 않음

### 막힌 것

- Telegram IPv6 문제 (해결됨 — `docs/TELEGRAM-IPV6-FIX.md`)
- 맥북 OpenClaw와 봇 토큰 충돌 (새 봇 생성으로 해결)

### 다음 (→ Day 2에서 수행)

- [x] 메신저별 에이전트 간 통신 비교 분석

- [x] 후속 리서치 마스터 플랜