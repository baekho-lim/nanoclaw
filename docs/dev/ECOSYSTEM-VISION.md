# bhOS — 에이전트 시대의 AI 워크스테이션

> 전체 생태계 비전 + 제품 전략 + 핵심 토론 요약
> 최종 업데이트: 2026-03-20

---

## 비전

> **모든 사람과 기업이 수십 개의 에이전트를 만들고 운영하는 시대에, 클로드코드 중심의 CLI 기반 AI 워크스테이션을 만든다.**

bhOS는 최종 제품이다. ClawTalk, ClawMemory, ClawMeeting은 bhOS를 완성하는 모듈이다.

## 핵심 전략: 싸우지 않고 이긴다

기존 메신저/서비스와 경쟁하지 않는다. **상위 집합**으로 올라간다.

```
Web 2.0 메신저: {사람 ↔ 사람}

ClawTalk:
  {사람 ↔ 사람}                    ← 기존 포함
  ∪ {사람 ↔ 에이전트}              ← 신규
  ∪ {에이전트 ↔ 에이전트}          ← 신규
  ∪ {에이전트 상태/권한/검증}       ← 신규

∴ ClawTalk ⊃ 카카오톡/텔레그램
```

AI 시대가 가속하면 에이전트 축이 폭발적으로 커지고, 기존 메신저의 영역은 상대적으로 작아진다. **시간이 우리 편.**

---

## 생태계 구조

```
bhOS (에이전트 시대의 AI 워크스테이션)
│
│  인터페이스: Claude Code CLI + MCP 서버들
│  조직 체계: ~/bhOS/ (프로젝트, 컨텍스트, 규칙)
│
├── ClawTalk (소통) — 에이전트 네이티브 메신저
│   ~/clawtalk/
│   큰 시장, 장기 승부. 에이전트 시대의 카카오톡.
│
├── ClawMemory (기억) — 관계 + 지식 + AI 메모리
│   CLI + 옵시디언 (초기 UI)
│   3개 계층: Knowledge + Relationship + Context
│
├── ClawMeeting (미팅) — 녹음 + 전사 + 요약
│   클라우드 서비스. 한국어 특화. 즉시 수익.
│
├── ClawNote (노트 UI) — 초기엔 옵시디언으로 대체
│   ClawMemory의 프론트엔드. 점진적 자체 개발.
│
└── NanoClaw (코어 엔진) — 에이전트 런타임
    ~/nanoclaw/
    컨테이너 격리, MCP, BYOK, 오픈소스.
    모든 모듈의 기반.
```

### 각 모듈의 역할과 시장

| 모듈 | 역할 | 시장 | 수익 시점 |
|------|------|------|----------|
| **ClawTalk** | 에이전트 메신저 | 글로벌 메시징 $100B+ | 중기 |
| **ClawMemory** | 관계+지식+기억 | 다른 제품의 가치 증폭 | 중기 (동기화) |
| **ClawMeeting** | 미팅 녹음/전사 | 한국 미팅 전사 (검증됨) | **즉시** |
| **ClawNote** | 마크다운 노트 UI | 옵시디언 사용자 | 후기 |
| **NanoClaw** | 에이전트 런타임 | 오픈소스 생태계 | 직접 수익 없음 |

### bhOS ↔ 기존 플레이어

| 기존 | 그들의 영역 | bhOS가 포함하면서 넘는 방법 |
|------|-----------|------------------------|
| 카카오톡 | 사람↔사람 | + 에이전트 계층 |
| Slack | 팀 채팅 | + 에이전트 간 조율 |
| Fireflies | 미팅 녹음 | + 관계 그래프 연결 |
| Obsidian | 개인 노트 | + AI 메모리 통합 |

---

## 모듈 독립성 설계

사용자가 입맛대로 골라 쓸 수 있되, 함께 쓰면 시너지가 나는 구조.

```
Claw Core (필수, 자동 설치):
├── 인증 (Google OAuth / 자체)
├── 사용자 프로필
├── 관계 그래프 (Person + 관계 유형 + 온도)
├── 이벤트 버스 (모듈 간 느슨한 연결)
└── Agent Identity (에이전트 신원/신뢰)

모듈 (독립 설치/실행 가능):
├── ClawTalk — Claw Core 위에서 동작
├── ClawMemory — Claw Core 위에서 동작
├── ClawMeeting — Claw Core 위에서 동작
└── NanoClaw — 독립 또는 Claw Core 연동
```

**이벤트 버스**: 모듈 A는 모듈 B의 존재를 모른다. 이벤트만 발행하고, 듣는 모듈이 없으면 아무 일도 안 일어남. 복잡도 관리의 핵심.

```
ClawMeeting: "미팅 녹음 완료" 발행
  → ClawMemory 있으면: 전사본 저장, 관계 업데이트
  → ClawMemory 없으면: 아무 일 없음 (에러 아님)
```

| 사용자 유형 | 설치하는 것 | 경험 |
|------------|-----------|------|
| 미팅 녹음만 | Core + ClawMeeting | 가입→녹음→전사→끝 |
| 에이전트 메신저 | Core + ClawTalk | 에이전트 약속 잡기, HITL |
| 세컨브레인 | Core + ClawMemory + 옵시디언 | 관계 그래프 + 지식 관리 |
| 풀 워크스테이션 | Core + 전부 | bhOS 완전체 |

---

## ClawMemory 상세

노트 앱이 아니다. **관계 + 기억 + 지식의 통합 메모리 시스템.**

### 3개 계층

```
Layer 1: Knowledge (지식)
  마크다운 노트 + 자동 온톨로지 추출(LLM) + 벡터 검색(로컬)

Layer 2: Relationship (관계) ★
  사람 엔티티 + 관계 유형(가족/친구/동료/거래처/고객)
  + 관계 온도 + 상호작용 히스토리

Layer 3: Context (맥락)
  AI 에이전트 메모리 통합 + 세션 히스토리 + 시간축
```

### 온톨로지 전략 (라운드 2 합의)

> **"마크다운 퍼스트 + 사용자 명시 관계 정의 + 자동 온톨로지 보강 + 벡터 검색"**

- 사용자: 마크다운으로 쓰고, 사람/관계만 명시 등록
- 시스템: 자동 엔티티 추출 + 임베딩 + 온톨로지 보강
- 온톨로지를 사용자에게 강제하지 않음

### 킬러 유즈케이스: 미팅 준비 자동화

```
캘린더 미팅 감지 → 참석자 관계 파악 (ClawMemory)
→ 과거 대화/메모 검색 → 미팅 브리핑 자동 생성
→ ClawTalk으로 전달 (미팅 1시간 전)
→ 미팅 중: ClawMeeting 녹음
→ 미팅 후: 회의록 → ClawMemory 자동 업데이트
→ 관계 온도 조정
```

### 옵시디언 → ClawNote 전환 전략

```
Phase 0: 옵시디언 = UI, CLI = 관계/인덱싱 (지금)
Phase 1: 옵시디언 플러그인 (관계 시각화, 클라우드 동기화=유료)
Phase 2: ClawNote 자체 클라이언트 (옵시디언 데이터 호환 유지)
```

### 메모리 통합: Federated Memory

파일은 제자리에 두고, 인덱스만 통합:

```
물리적 저장소 (변경 없음):
  ~/bhOS/            → 기존 유지
  ~/.claude/         → Claude Code 메모리
  ~/nanoclaw/groups/ → NanoClaw 에이전트 메모리
  ~/.claw/note/      → ClawNote 마크다운

통합 인덱스 (신규):
  ~/.claw/index/
  ├── graph.db     → 관계 + 엔티티 (모든 소스에서 추출)
  ├── vectors.db   → 임베딩
  ├── fts.db       → 전문 검색
  └── sources.json → 인덱싱 대상 목록
```

---

## 수익 구조

```
즉시 (0-6개월):
  ClawMeeting 구독 — $12.99/월 (한국어 미팅 전사)

단기 (6-18개월):
  ClawMemory 클라우드 동기화 — $4.99/월
  ClawTalk 클라우드 호스팅 — $9.99/월

중기 (1-3년):
  Agent App Store 수수료 — 30%
  Enterprise bhOS — $49.99/인/월

장기 (3-5년):
  Agent Economy 거래 수수료 (Visa 모델)
  Agent Identity 인증 서비스
```

---

## 장기 비전: 상위 집합

```
              ┌─────────────┐
              │Agent Economy │ 에이전트 간 거래/결제
              └──────┬──────┘
          ┌──────────┴──────────┐
          │ Agent App Store     │ 에이전트 마켓플레이스
          └──────────┬──────────┘
    ┌────────────────┼────────────────┐
    │                │                │
┌───┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐
│ClawTalk  │  │ClawMeeting │  │ClawMemory  │
│에이전트   │  │미팅 녹음   │  │기억+관계    │
│메신저    │  │(즉시수익)  │  │(차별화)    │
└───┬──────┘  └─────┬──────┘  └─────┬──────┘
    └───────────────┼───────────────┘
         ┌──────────┴──────────┐
         │    Claw Core        │ 인증+관계그래프+이벤트버스+Agent ID
         └──────────┬──────────┘
         ┌──────────┴──────────┐
         │    NanoClaw         │ 에이전트 런타임 (오픈소스)
         └──────────┬──────────┘
         ┌──────────┴──────────┐
         │       bhOS          │ AI 워크스테이션
         └─────────────────────┘
```

---

## 빌드 순서 (확정)

```
Phase 1 (지금):
  1a. ClawTalk MVP — PoC 검증됨, 웹 앱으로 발전
  1b. ClawMemory CLI + 인덱서 — 동시 진행
      옵시디언을 UI로, 관계 그래프 + 인덱서 백엔드
      → ClawTalk의 미팅 브리핑 기능에 연결

Phase 2:
  ClawMeeting — 한국어 녹음/전사, 클라우드 서비스
  → 즉시 수익 + 클라우드 인프라 구축
  → ClawMemory에 미팅 데이터 피딩

Phase 3:
  통합 + 강화
  ├── ClawNote 자체 개발 (옵시디언 대체)
  ├── 클라우드 동기화 (유료)
  ├── Agent App Store
  └── Enterprise bhOS
```

---

## 핵심 토론 요약 (ADR)

### ADR-001: 상위 집합 전략 — 싸우지 않고 이긴다
- 기존 메신저를 대체하지 않고 포함하면서, 에이전트 계층을 올린다
- AI 시대가 가속할수록 에이전트 축 비중이 커져 자연스럽게 이김
- HTTP가 TCP/IP를 대체하지 않았듯, 새 패러다임은 기존 위에 올라감

### ADR-002: 제품 먼저, 프로토콜은 추출
- Matrix(12년 교훈), ActivityPub(제한적 채택) — 프로토콜 퍼스트의 한계
- MCP가 Claude Code(제품)에서 출발해 프로토콜로 확산된 경로를 따름
- 내부 ACP를 오픈 스펙으로 추출하는 것은 ClawTalk 성공 후

### ADR-003: Developer-first GTM, 에이전트 투명성이 wedge
- Stripe/Vercel/Supabase 모델. 개발자가 먼저, 일반 사용자는 확장
- "내 에이전트가 뭘 하는지 보이게 만드는 것"이 핵심 가치 제안

### ADR-004: BYOK + OpenRouter 무료 체험
- AI 비용을 플랫폼이 부담하지 않는 지속 가능한 모델 (NanoClaw 계승)
- 진입 장벽 제거: OpenRouter 무료 크레딧으로 가입 즉시 체험
- 본격 사용: 자신의 API 키 연동 (Claude, OpenAI, Ollama)

### ADR-005: 에이전트 간 통신은 공유 백엔드 경유
- 어떤 메이저 메신저도 봇 간 직접 통신을 지원하지 않음 (검증 완료)
- Telegram: 봇 간 메시지 원천 차단 (공식 정책)
- 이것이 별도 통신 계층(ACP)의 존재 이유 자체

### ADR-006: 순차 선택 HITL 패턴
- A가 먼저 복수 선택 → B는 A 선택 중에서 선택
- PoC에서 검증됨. 병렬 선택보다 합의 확률 높고 UX 자연스러움

### ADR-007: 캘린더는 MCP 추상화 계층
- Google/Apple/Outlook 단일 인터페이스
- 자체 Time Slot Manager (슬롯 잠금, 선호 시간대)

### ADR-008: bhOS가 OS 계층 — 새로 만들 필요 없음
- ~/bhOS/에 프로젝트 관리, 컨텍스트, 세션 프로토콜이 이미 존재
- ClawTalk/ClawMemory/ClawMeeting은 bhOS 위의 모듈

### ADR-009: Federated Memory — 파일은 제자리, 인덱스로 연결
- bhOS, Claude Code, NanoClaw의 기존 파일을 옮기지 않음
- 통합 인덱스(graph.db + vectors.db)가 모든 소스를 연결
- 락인 방지: 마크다운 + SQLite 표준 형식 고수

### ADR-010: 모듈 독립성 — Claw Core + 이벤트 버스
- Claw Core: 인증 + 관계 그래프 + 이벤트 버스 + Agent ID
- 각 모듈: 독립 설치/실행 가능, Core만 공통
- 이벤트 버스: 모듈 간 직접 의존 없음, 느슨한 결합

### ADR-011: ClawMemory는 노트가 아닌 기억 시스템
- 3계층: Knowledge(지식) + Relationship(관계) + Context(맥락)
- 관계 온도, 상호작용 히스토리, AI 메모리 통합
- 옵시디언 호환 마크다운 + 자동 온톨로지 + 벡터 검색 하이브리드

### ADR-012: 온보딩 = 30초 아하 모먼트
- 가입 → Google 캘린더 연동 → 가상 봇과 약속 잡기 체험
- Telegram이 첫 진입점, 웹앱으로 점진적 유도

### ADR-013: 두 트랙 — 로컬(개발자) + 클라우드(일반)
- 개발자: 맥미니 로컬 설치, BYOK, CLI, 완전한 통제
- 일반 사용자: 클라우드 가입, 즉시 사용, 스토리지 과금
- 같은 코어 엔진, 배포 모델만 다름

---

## 프로토콜 기반 (리서치 완료)

ACP = A2A(에이전트 간) + MCP(도구) + Matrix(인프라) + 신규(HITL, 투명성, 협상)

| 차용 원천 | 차용 요소 |
|----------|----------|
| **A2A** (Google) | Task lifecycle, Agent Card, INPUT_REQUIRED, SSE |
| **MCP** (Anthropic) | Tool calling, Capability 협상, Sampling, Elicitation |
| **Matrix** | Room 모델, Federation, E2EE, Event DAG |
| **신규** | Multi-Agent Negotiation, 관계 그래프, 투명성, Agent Economy |

PoC의 Coordinator가 A2A Task lifecycle을 독립적으로 재발명 — 올바른 방향 확인.

상세: `docs/research/01-protocol-comparison.md`

---

## PoC 검증 결과

`poc/schedule-agent/`에서 검증:
- [x] Telegram 봇 2개 동시 동작
- [x] 에이전트 간 통신 (공유 백엔드 Coordinator)
- [x] 투명성 로그 ([🤖 에이전트 간 통신])
- [x] 복수 선택 HITL (⬜/✅ 토글 + 📌 확인, 순차 승인)
- [x] Google Calendar 실제 연동 (FreeBusy + Event 생성)

상세: `docs/dev/poc/001-schedule-agent.md`

---

## 추가 리서치 필요

| # | 주제 | 관련 모듈 |
|---|------|----------|
| 1 | 한국어 STT 엔진 비교 (Whisper/CLOVA/Google) | ClawMeeting |
| 2 | 실시간 전사 아키텍처 (화자 분리) | ClawMeeting |
| 3 | 클라우드 인프라 비용 모델링 | ClawMeeting, 전체 |
| 4 | Local-first + CRDTs | ClawMemory |
| 5 | 벡터 DB 로컬 구현 | ClawMemory |
| 6 | LLM 자동 엔티티/관계 추출 | ClawMemory |
| 7 | 옵시디언 플러그인 개발 | ClawNote |
| 8 | macOS 앱 패키징 (Tauri) | bhOS |
| 9 | Syncthing/Tailscale 디바이스 동기화 | 전체 |

---

## 핵심 문서 위치

| 문서 | 경로 |
|------|------|
| 이 문서 (생태계 비전) | `docs/dev/ECOSYSTEM-VISION.md` |
| ClawTalk PRD | `docs/dev/PRD.md` |
| 프로토콜 비교 | `docs/research/01-protocol-comparison.md` |
| 메신저 비교 | `docs/research/05-messenger-agent-comparison.md` |
| 전문가 패널 분석 | `docs/AGENT-MESSENGER-ANALYSIS.md` |
| 핸드오프 | `docs/dev/HANDOFF.md` |
| 개발 일지 | `docs/dev/JOURNAL.md` |
| TODO | `docs/dev/TODO.md` |

---

*이 문서는 bhOS 생태계의 전략 문서이며, 구현 과정에서 업데이트됩니다.*
