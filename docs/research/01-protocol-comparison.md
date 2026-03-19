# 프로토콜 심층 비교: A2A vs MCP vs Matrix

> ACP(Agent Communication Protocol) 설계를 위한 기초 리서치
> 2026-03-20

---

## 한 줄 요약

```
MCP  = 에이전트 ↔ 도구 (수직)     "에이전트가 세계와 상호작용하는 방법"
A2A  = 에이전트 ↔ 에이전트 (수평)  "에이전트가 서로 작업을 위임하는 방법"
Matrix = 사람 ↔ 사람 (통신)       "엔티티가 서로 통신하는 방법"
ACP  = 사람 + 에이전트 (통합)     "사람과 에이전트가 함께 협업하는 방법"
```

---

## 전체 비교 매트릭스

| 차원 | MCP | A2A | Matrix | ACP (우리가 만들 것) |
|------|-----|-----|--------|---------------------|
| **H2H 메시징** | - | - | **핵심** | **필수** |
| **에이전트↔도구** | **핵심** | - | - | MCP 차용 |
| **에이전트↔에이전트** | - | **핵심** | 봇으로 가능 | A2A 차용 |
| **HITL** | 권고 수준 | INPUT_REQUIRED 상태 | 대화로 자연스럽게 | **네이티브 프리미티브** |
| **Observability** | 로깅만 | SSE 스트리밍 | Event DAG (불변) | **표준화된 투명성** |
| **Federation** | - | - | **핵심** | Matrix 차용 |
| **E2EE** | - | - | Olm/Megolm | Matrix 차용 |
| **디스커버리** | 제한적 | Agent Card | 서버 발견 | Agent Card 확장 |
| **상태 관리** | 세션 | Task lifecycle | Room State | Task + Room 결합 |
| **스트리밍** | SSE (단방향) | SSE + Webhook | Sync (롱폴링) | SSE + WebSocket |
| **만든 곳** | Anthropic | Google | Matrix.org | - |
| **거버넌스** | Linux Foundation | Linux Foundation | Matrix.org Foundation | - |

---

## A2A 핵심 구조

### Agent Card — 에이전트의 디지털 명함

```json
{
  "name": "Schedule Agent",
  "description": "Negotiates meeting times between users",
  "supportedInterfaces": [{
    "url": "https://agent.example.com/a2a",
    "protocolBinding": "json-rpc+http"
  }],
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "multiTurn": true
  },
  "skills": [{
    "id": "schedule-meeting",
    "name": "Schedule Meeting",
    "inputSchema": { "type": "object", "properties": { "participants": {}, "duration": {} } }
  }],
  "securitySchemes": { "oauth2": { "type": "oauth2", "flows": { ... } } }
}
```

디스커버리: `GET https://{domain}/.well-known/agent-card.json`

### Task Lifecycle — 우리 PoC Coordinator와의 매핑

```
A2A 상태                    우리 PoC 상태              의미
─────────                  ─────────                ────
TASK_STATE_SUBMITTED    →  "idle"                   접수됨
TASK_STATE_WORKING      →  "checking_a/b"           처리 중
TASK_STATE_INPUT_REQUIRED → "waiting_approval"       HITL 대기 ★
TASK_STATE_COMPLETED    →  "confirmed"/"done"       완료
TASK_STATE_FAILED       →  (미구현)                 실패
TASK_STATE_CANCELED     →  (미구현)                 취소
TASK_STATE_AUTH_REQUIRED →  (없음)                   인증 필요 (v1.0 신규)
TASK_STATE_REJECTED     →  (없음)                   거부
```

**핵심 발견: 우리 Coordinator가 이미 A2A Task lifecycle의 핵심 패턴을 구현하고 있었음.**

### 통신 방식

```
Client → POST /agent/messages         → SendMessage (동기)
Client → POST /agent/messages:stream   → SendStreamingMessage (SSE)
Client → GET  /agent/tasks/{id}        → GetTask
Client → POST /agent/tasks/{id}:cancel → CancelTask
```

---

## MCP 핵심 구조

### 3대 프리미티브

```
Tools     = 에이전트가 실행하는 기능 (함수 호출)
Resources = 에이전트가 읽는 데이터 (파일, DB)
Prompts   = 사용자가 선택하는 템플릿
```

### Tool 호출 흐름

```
1. Client → tools/list (도구 발견)
2. LLM이 컨텍스트에서 도구 선택
3. Client → tools/call { name, arguments }
4. Server 실행 → 결과 반환
5. Client → LLM에 결과 전달
```

### Sampling — 역방향 LLM 호출 (MCP 고유)

서버가 클라이언트의 LLM을 호출할 수 있음. 에이전트 간 작업 위임의 원형.

### Elicitation — 사용자 입력 요청

서버가 사용자에게 구조화된 입력을 요청 (Form 또는 URL 모드). HITL 패턴.

### MCP의 한계

| 없는 것 | 의미 |
|---------|------|
| Agent-to-Agent | 단일 클라이언트-서버만 |
| Federation | 크로스 서버 불가 |
| E2EE | TLS만 |
| Task lifecycle | 실험적 단계 |
| Observability | 기본 로깅만 |

---

## Matrix 핵심 구조

### Room 모델 — 다자간 통신의 컨테이너

- Room ID: `!opaque:domain`
- Event DAG: 모든 이벤트가 불변 그래프에 기록 (감사 추적)
- State Events: 룸 이름, 멤버십, 권한 (Power Levels)
- Message Events: 텍스트, 미디어, 파일

### Federation — 서버 간 연합

```
Server A ←→ Server B: PDU (영속 이벤트) + EDU (임시 데이터)
서명: Ed25519, 서버 발견: .well-known/matrix/server
```

### E2EE — 그룹 암호화

- Olm: 1:1 (더블 래칫, 전방 비밀성)
- Megolm: 그룹 (세션 키 배포, 효율적)
- Cross-Signing: 디바이스 간 신뢰 전파

### Application Service API — 봇/브릿지

- 네임스페이스 등록 (정규식 패턴)
- 신원 위장 (다른 사용자로 행동)
- 이벤트 트랜잭션 수신

---

## ACP 설계 시사점: 무엇을 차용하고 무엇을 새로 만드는가

### MCP에서 차용

| 요소 | ACP에서의 활용 |
|------|---------------|
| JSON-RPC 2.0 | 메시지 프레임워크 |
| Capability 협상 | 에이전트 간 기능 교환 |
| Tool Schema (JSON Schema) | 에이전트 기능 선언 |
| Sampling 패턴 | 에이전트 간 LLM 위임 |
| Elicitation | 에이전트 → 사람 입력 요청 (HITL) |
| Error 체계 | Protocol Error vs Execution Error |

### A2A에서 차용

| 요소 | ACP에서의 활용 |
|------|---------------|
| Agent Card | 에이전트 디스커버리 + 기능 광고 |
| Task lifecycle | 작업 상태 머신 (SUBMITTED → WORKING → INPUT_REQUIRED → COMPLETED) |
| INPUT_REQUIRED | HITL의 프로토콜 레벨 지원 |
| SSE 스트리밍 | 실시간 상태 업데이트 |
| Push Notifications | 장시간 작업의 비동기 알림 |
| contextId | 관련 작업 그룹화 |

### Matrix에서 차용

| 요소 | ACP에서의 활용 |
|------|---------------|
| Room 모델 | 사람+에이전트 혼합 대화방 |
| Federation | 조직 간 에이전트 통신 |
| Event DAG | 불변 감사 추적 + 인과 관계 |
| E2EE (Megolm) | 그룹 에이전트 방 암호화 |
| State Resolution | 동시 상태 변경 충돌 해결 |
| Custom Event Types | 도메인별 에이전트 이벤트 확장 |
| Ephemeral Events | "에이전트가 작업 중..." 상태 표시 |

### 새로 발명해야 하는 것

| 요소 | 이유 |
|------|------|
| **Multi-Agent Negotiation** | 여러 에이전트가 시간/자원/우선순위를 협상하는 프로토콜. 옥션, 투표, 합의 메커니즘. **우리 PoC의 "약속 잡기"가 이것의 프로토타입.** |
| **Intent-Based Routing** | "이 작업에 최적인 에이전트를 찾아라" — 비용, 속도, 전문성 기반 선택 |
| **Trust & Reputation** | 에이전트 신뢰를 동적으로 구축. 작업 성공률, 응답 시간 기반 평판 |
| **Observability 표준** | OpenTelemetry 호환 분산 추적. 작업 체인의 인과 관계, 지연, 비용 투명화 |
| **Resource Accounting** | 에이전트 간 자원 사용량 추적, 비용 정산, SLA |
| **Guardrails & Policy** | "에이전트 X는 Y 범위 내에서만 행동 가능" 선언적 정책 |
| **Shared State Sync** | 여러 에이전트가 공유 컨텍스트를 CRDT 기반으로 동기화 |

---

## ACP 아키텍처 초안

```
┌─────────────────────────────────────────────────────────────┐
│                        ACP Stack                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Application Layer                                    │   │
│  │  • Messenger UI (네이티브 앱)                          │   │
│  │  • Messenger Bridge (Telegram, Slack, Discord)        │   │
│  │  • Agent Dashboard (observability)                    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │  ACP Core                                             │   │
│  │  • Room (Matrix 차용) — 사람+에이전트 혼합 방           │   │
│  │  • Task (A2A 차용) — 작업 상태 머신 + HITL             │   │
│  │  • Negotiation (신규) — 다자간 협상 프로토콜            │   │
│  │  • Observability (신규) — 투명성 이벤트 스트림          │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │  Agent Layer                                          │   │
│  │  • Agent Card (A2A 차용) — 디스커버리 + 기능 광고       │   │
│  │  • Tool Calling (MCP 차용) — 외부 도구 접근             │   │
│  │  • Sampling (MCP 차용) — LLM 위임                      │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │  Infrastructure Layer                                 │   │
│  │  • Federation (Matrix 차용) — 서버 간 연합              │   │
│  │  • E2EE (Matrix 차용) — Megolm 그룹 암호화             │   │
│  │  • Event DAG (Matrix 차용) — 불변 감사 추적             │   │
│  │  • Transport: JSON-RPC 2.0 + HTTP + SSE               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## PoC → ACP 진화 로드맵

```
현재 PoC                         ACP MVP                      ACP v1.0
──────────                      ─────────                    ────────
Coordinator 상태 머신        →  A2A Task lifecycle 채택    →  완전한 Task 관리
인라인 키보드 HITL          →  INPUT_REQUIRED 표준화      →  Rich HITL UI
에이전트 간 통신 로그        →  SSE 이벤트 스트림         →  OpenTelemetry 통합
Mock/Google Calendar        →  MCP Calendar Server        →  다중 캘린더 래퍼
단일 서버                   →  (단일 서버 유지)           →  Federation
평문                       →  (평문 유지)               →  E2EE (Megolm)
Telegram 그룹              →  Telegram + 자체 클라이언트  →  멀티 채널 브릿지
```

---

## 핵심 통찰 3가지

### 1. 우리 PoC는 이미 A2A의 핵심 패턴을 독립적으로 재발명했다
Coordinator = A2A Server, 상태 머신 = Task lifecycle, 인라인 키보드 = INPUT_REQUIRED.
이건 **올바른 방향이라는 강한 신호**.

### 2. A2A에 없는 것이 바로 ACP의 차별점이다
A2A는 에이전트 간 통신만 다루고, **사람과의 통합**(메시징, HITL UI, 투명성)이 없다.
ACP = A2A + "인간이 보고 검증하고 승인하는 계층" = **에이전트 네이티브 메신저의 프로토콜**.

### 3. Matrix의 인프라를 빌리면 Federation + E2EE를 "발명" 안 해도 된다
Matrix가 12년간 검증한 Federation, E2EE, Event DAG를 차용하면 인프라 비용이 크게 줄어든다.
Matrix 위에 ACP를 올리거나, Matrix의 설계 패턴을 참고하여 경량 구현하는 두 가지 경로.

---

## Sources

### A2A
- [A2A Protocol Specification v1.0](https://a2a-protocol.org/latest/specification/)
- [A2A GitHub](https://github.com/a2aproject/A2A)
- [A2A v1.0 Announcement](https://a2a-protocol.org/latest/announcing-1.0/)
- [Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [HiveMQ Enterprise Limitations Analysis](https://www.hivemq.com/blog/a2a-enterprise-scale-agentic-ai-collaboration-part-1/)

### MCP
- [MCP Specification (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/)
- [MCP 2026 Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)

### Matrix
- [Matrix Specification](https://spec.matrix.org/latest/)
- [Matrix Client-Server API](https://spec.matrix.org/latest/client-server-api/)
- [Matrix Server-Server API](https://spec.matrix.org/latest/server-server-api/)
- [Matrix Application Service API](https://spec.matrix.org/latest/application-service-api/)

### 비교 분석
- [Survey of Agent Interoperability Protocols (arXiv)](https://arxiv.org/html/2505.02279v1)
- [Auth0: MCP vs A2A](https://auth0.com/blog/mcp-vs-a2a/)
