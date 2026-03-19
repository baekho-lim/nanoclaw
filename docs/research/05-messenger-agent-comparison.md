# 메신저별 에이전트 간 통신 가능성 비교 분석

> 기준 유즈케이스: "친구와 저녁 약속 잡기" 2026-03-20

---

## 기준 유즈케이스

```
참여자: 나(A) + 나의 에이전트(Abot) + 친구(B) + 친구의 에이전트(Bbot)

1. A → Abot: "이번 주 B랑 저녁 약속 잡아줘"
2. Abot: A의 캘린더 확인
3. Abot → Bbot: "가능한 시간 알려줘"          ← 에이전트 간 통신
4. Bbot: B의 캘린더 확인 → 가능 시간 회신
5. Abot ↔ Bbot: 후보 3개로 조율              ← 에이전트 간 협상
6. Abot → A, Bbot → B: "이 중 선택해주세요"   ← HITL 승인
7. 양쪽 승인 → 캘린더 확정 + 레스토랑 예약
```

---

## 전체 비교 매트릭스

| 기능 | Telegram | Slack | Discord | WhatsApp (Baileys) | WhatsApp (Cloud API) | NanoClaw (현재) |
| --- | --- | --- | --- | --- | --- | --- |
| **봇 간 메시지 수신** | **불가** | **가능** | **가능** (인텐트 필요) | **가능** | 템플릿 필요 | **불가** |
| **그룹 내 다중 봇** | 최대 20개 (서로 못 봄) | 무제한 (서로 봄) | 무제한 (서로 봄) | N/A | N/A | 1그룹=1에이전트 |
| **구조화 메시지** | callback_data 64B | Block Kit (풍부) | Components (보통) | 텍스트만 | Interactive msg | IPC JSON |
| **HITL UI** | Inline Keyboard | datetime picker, 모달, 20개 컴포넌트 | 버튼, 셀렉트 | Reply 버튼 3개 | Reply 버튼 3개, List | 없음 |
| **크로스 조직 통신** | 봇 간 불가 | Slack Connect (기업용) | 공유 서버 (쉬움) | 번호 간 직접 | 템플릿 필요 | 메인만 크로스 |
| **Rate limit** | 그룹 20msg/분 | 채널 1msg/초 | 50req/초 | 밴 위험 | 80 MPS | 없음 |
| **실시간 스트리밍** | Long polling/Webhook | Events API/Socket Mode | Gateway WebSocket | WebSocket | Webhook | 파일 폴링 |

### 유즈케이스 실현 가능성 판정

| 플랫폼 | 판정 | 핵심 장벽 |
| --- | --- | --- |
| **Telegram** | **불가** | 봇이 다른 봇의 메시지를 절대 못 봄 (Telegram 설계 결정) |
| **Slack** | **조건부 가능** | 같은 워크스페이스면 가능, 다른 조직이면 Slack Connect 오버헤드 |
| **Discord** | **가능** (가장 쉬움) | 공유 서버 + MESSAGE_CONTENT 인텐트만 있으면 됨 |
| **WhatsApp (Baileys)** | **가능** | 비공식 프로토콜, 밴 위험 |
| **WhatsApp (Cloud API)** | **사실상 불가** | 매 대화마다 템플릿 승인 필요 + 2026년 챗봇 금지 강화 |
| **NanoClaw** | **불가** | 에이전트 간 통신 메커니즘 자체가 없음 |

---

## 플랫폼별 상세 분석

### Telegram

**왜 안 되는가:**

Telegram의 공식 정책:

> "Bots will not be able to see messages from other bots **regardless of mode**."

이것은 Privacy Mode와 무관하게, 관리자 권한과 무관하게 **절대적**으로 적용됩니다. 무한 루프 방지를 위한 설계 결정입니다.

**우회 방법:**

```
[나] ←→ [내 봇] ←→ [공유 백엔드 서버] ←→ [친구 봇] ←→ [친구]
                         ↕
                    [협상 로직]
```

두 봇이 같은 백엔드를 공유하거나 외부 API(A2A 등)로 통신. Telegram 내부만으로는 불가능.

**HITL은 우수:**

- Inline Keyboard: 승인/거부 버튼 → CallbackQuery 수신
- Mini Apps (TWA): 복잡한 UI를 WebView로 제공 (5억+ 사용자가 사용)

**Rate limit:** 같은 그룹에 20msg/분. 에이전트 간 빠른 협상에는 제한적.

---

### Slack

**어떻게 가능한가:**

Slack의 Events API는 `bot_message` 서브타입으로 **다른 봇의 메시지를 수신**합니다. `bot_id` 필드로 어떤 봇인지 식별 가능.

```typescript
// BotA가 채널에 메시지 포스트
await client.chat.postMessage({
  channel: '#agent-coordination',
  text: JSON.stringify({ type: 'schedule_request', available_times: [...] })
});

// BotB가 같은 채널의 message 이벤트로 수신
app.message(async ({ message }) => {
  if (message.subtype === 'bot_message' && message.bot_id === 'BotA_ID') {
    const request = JSON.parse(message.text);
    // 협상 로직 실행
  }
});
```

**HITL은 최고 수준**:Block Kit 20개 인터랙티브 컴포넌트 — datetime picker, 모달(3단계 스택), 체크박스, 라디오 등. "약속 잡기" UX에 가장 적합.

**핵심 장벽: 크로스 조직**

- 같은 워크스페이스: 완벽 동작
- 다른 조직: Slack Connect 필요 (관리자 승인, 기업용 기능, 개인 사용에 비현실적)

**Rate limit:** 채널당 1msg/초 — 에이전트 협상에 충분.

---

### Discord

**어떻게 가능한가:**

Discord Gateway의 `MESSAGE_CREATE` 이벤트는 `GUILD_MESSAGES` 인텐트 구독 시 **봇 메시지 포함** 모든 메시지를 수신합니다.

```python
# BotB가 BotA의 메시지를 수신
@bot.event
async def on_message(message):
    if message.author.bot and message.author.id == BOT_A_ID:
        data = json.loads(message.content)
        # 협상 로직
```

주의: `MESSAGE_CONTENT` 특권 인텐트가 필요 (100서버 이상은 Discord 승인 필요).

**왜 가장 쉬운가:**

- 공유 서버 하나만 만들면 됨 (초대 링크 공유, 개인도 즉시 가능)
- 스레드로 각 협상을 격리 가능
- 포럼 채널 + 태그로 태스크 보드 구현 가능

**HITL은 보통**:버튼, 셀렉트 메뉴는 있지만 datetime picker가 없음. Slack Block Kit에 비해 UI 빈약.

**Rate limit:** 글로벌 50req/초 — 충분.

---

### WhatsApp (Baileys — NanoClaw 사용 중)

**어떻게 가능한가:**

Baileys는 WhatsApp Web 프로토콜을 직접 사용. 어떤 번호에든 자유 메시지 전송 가능. 두 NanoClaw 인스턴스가 서로의 번호로 직접 메시지 교환 가능.

```
[나의 WhatsApp] ←Baileys→ [내 NanoClaw] ←HTTP→ [친구 NanoClaw] ←Baileys→ [친구 WhatsApp]
```

**위험:**

- 비공식 프로토콜 — WhatsApp 업데이트 시 깨짐
- 밴 위험 — 자동화 패턴 감지 시 계정 차단
- 2026년 Meta 정책: 일반 챗봇 금지 강화

**HITL:** Reply 버튼 3개만 지원 (Baileys에서 불안정).

---

### WhatsApp (Cloud API — 공식)

**왜 안 되는가:**

비즈니스가 먼저 대화를 시작하려면 **사전 승인된 템플릿 메시지가 필수**. 에이전트 간 즉흥 협상에 매번 템플릿 승인을 받을 수 없음.

| 제약 | 영향 |
| --- | --- |
| 템플릿 승인 | 수시간\~수일 소요, 자동 협상 불가 |
| 24시간 윈도우 | 상대가 먼저 메시지해야 자유 대화 가능 |
| 2026 정책 | 일반 챗봇 금지, 비즈니스 자동화만 허용 |

---

### NanoClaw (현재)

**왜 안 되는가:**

| 제약 | 코드 위치 | 상세 |
| --- | --- | --- |
| 1그룹=1컨테이너 | `src/index.ts:151-266` | 그룹별 독립 에이전트, 크로스 불가 |
| IPC 단방향 | `src/ipc.ts` | 에이전트→호스트만, 호스트→에이전트는 파일 경유 |
| 네임스페이스 격리 | `src/container-runner.ts:116-176` | 각 그룹 IPC 디렉토리 분리 |
| 권한 모델 | `src/ipc.ts:78-94` | 메인만 크로스 그룹, 일반은 자기 자신만 |
| 비동기 생명주기 | `src/group-queue.ts` | Agent A 실행 중 Agent B 존재 보장 없음 |
| 그룹 정보 미공개 | `src/container-runner.ts:683-706` | 비메인은 다른 그룹 정보 조회 불가 |

---

## 핵심 발견: 모든 플랫폼의 공통 한계

```
                    [근본적 문제]
                         ↓
    기존 메신저는 "인간 ↔ 인간" 통신을 위해 설계됨
                         ↓
    봇/에이전트는 "2등 시민" — 사후적으로 추가된 기능
                         ↓
    ┌─────────────────────────────────────────────┐
    │ 에이전트 간 직접 통신 메커니즘이             │
    │ 어떤 메이저 메신저에도 존재하지 않음          │
    └─────────────────────────────────────────────┘
```

| 플랫폼 | 봇 간 통신 | 방식 |
| --- | --- | --- |
| Telegram | 불가 | 의도적 차단 |
| Slack | 채널 경유만 | 전용 채널에 게시 → 상대 봇이 이벤트 구독 |
| Discord | 채널 경유만 | 서버 채널에 게시 → 상대 봇이 Gateway로 수신 |
| WhatsApp | 번호 간 메시지만 | 사실상 "인간처럼" 메시지 주고받기 |

**없는 것:**

- 에이전트 identity 시스템 (에이전트를 고유하게 식별/인증)
- 구조화된 action/result 교환 (JSON-RPC 같은)
- 에이전트 상태 구독 (observability)
- HITL primitives (표준화된 승인/거부 프로토콜)
- 에이전트 capability discovery (상대 에이전트가 뭘 할 수 있는지 조회)

---

## 우리는 어떻게 해야 하는가

### 아키텍처 제안: Agent Communication Protocol (ACP)

기존 메신저가 커버하지 못하는 계층을 ACP로 정의:

```
┌─────────────────────────────────────────────────────┐
│                    ACP Layer                         │
│                                                     │
│  Agent Identity  │  Action Channel  │  HITL Flow    │
│  (인증/권한)      │  (구조화 통신)    │  (승인/거부)   │
│                  │                  │               │
│  Observability   │  Capability      │  Federation   │
│  (상태 구독)      │  Discovery       │  (서버 간)     │
└──────────┬──────────────────────────────┬───────────┘
           │                              │
    ┌──────┴──────┐                ┌──────┴──────┐
    │  자체 클라이언트 │                │  기존 메신저    │
    │  (네이티브 앱)  │                │  브릿지        │
    │  최적 경험     │                │  Telegram     │
    └─────────────┘                │  Slack        │
                                   │  Discord      │
                                   └──────────────┘
```

### "약속 잡기" 유즈케이스의 ACP 구현

```
1. A → ACP서버: CreateTask(type: "schedule", participants: [A, B])
2. ACP서버: Room 생성 (A, Abot, B, Bbot)
3. Abot → ACP: Action(type: "calendar_query", target: A)
4. ACP → Abot: Result(available: ["수 19시", "목 20시", "금 18시"])
5. Abot → Bbot: Action(type: "schedule_request", times: [...])  ← 에이전트 간 직접 통신
6. Bbot → ACP: Action(type: "calendar_query", target: B)
7. Bbot → Abot: Result(available: ["수 19시", "금 18시"])
8. Abot → A: HITLRequest(type: "select", options: ["수 19시", "금 18시"])
9. Bbot → B: HITLRequest(type: "select", options: ["수 19시", "금 18시"])
10. A → ACP: HITLResponse(selected: "금 18시")
11. B → ACP: HITLResponse(selected: "금 18시")
12. Abot: Action(type: "calendar_create", time: "금 18시")
13. Bbot: Action(type: "calendar_create", time: "금 18시")
14. ACP → Room: TaskComplete(summary: "금요일 18시 저녁 확정")
```

### MCP/A2A와의 관계

| 프로토콜 | 역할 | ACP에서의 위치 |
| --- | --- | --- |
| **MCP** | 에이전트 ↔ 도구 (tool calling) | 에이전트가 캘린더 등 외부 도구를 호출할 때 사용 |
| **A2A** | 에이전트 ↔ 에이전트 (task delegation) | ACP의 에이전트 간 통신 계층에 차용 |
| **ACP** | 인간 + 에이전트 통합 통신 | MCP와 A2A를 포함하면서 HITL + Observability 추가 |

**ACP = A2A(에이전트 간) + HITL(인간 승인) + Observability(투명성) + Federation(서버 간)**

### NanoClaw에서 ACP로의 진화 경로

```
현재 NanoClaw                    →    ACP MVP
─────────────                         ────────
1그룹=1에이전트                   →    1방=N에이전트+M인간
IPC 파일 폴링                    →    WebSocket 양방향
메인만 크로스 그룹                →    Room 기반 권한
텍스트 메시지만                   →    Action/Result/HITLRequest 타입
채널별 브릿지 (있음)              →    채널별 브릿지 (확장)
```

---

## 크로스 플랫폼 시나리오

**Q: A는 Telegram, B는 Slack을 쓸 때 에이전트 간 통신이 가능한가?**

현재: **불가능.** 어떤 메신저도 크로스 플랫폼 에이전트 통신을 지원하지 않음.

ACP로 해결:

```
A (Telegram)                          B (Slack)
    ↕                                    ↕
Telegram Bridge ──→ ACP 서버 ←── Slack Bridge
                      ↕
              Abot ←→ Bbot
              (ACP 프로토콜로 직접 통신)
```

ACP 서버가 중앙에서 에이전트 간 통신을 중개하고, 각 메신저 브릿지가 인간에게 HITL UI를 제공. **이것이 NanoClaw의 채널 시스템이 이미 가지고 있는 구조의 자연스러운 확장.**

---

## 확장성: 10명 + 10에이전트

**Q: 프로젝트에 10명과 10개 에이전트가 협업하면?**

기존 메신저: 사실상 불가능. Slack이 가장 가깝지만, 10개 봇이 하나의 채널에서 구조화된 협업을 하는 것은 지원되지 않음.

ACP Room 모델:

```
Room: "Q2 마케팅 프로젝트"
├── 인간: PM, 디자이너, 개발자 3명, 마케터... (10명)
├── 에이전트: 리서치봇, 코딩봇, 디자인봇, 스케줄봇... (10개)
├── Sub-rooms: "디자인 리뷰", "코드 리뷰", "일정 조율"
├── Task board: 에이전트별 진행 상황
└── Audit log: 모든 action/result/approval 기록
```

핵심 차이: 기존 메신저는 "대화"를 단위로 하지만, ACP는 **"태스크"를 단위**로 한다. 대화는 태스크의 부산물.

---

## Next Steps

1. **PoC**: Telegram에서 봇 2개를 같은 그룹에 넣고, 공유 백엔드로 "약속 잡기" 데모 구현
2. **A2A 스펙 정독**: Google A2A의 Agent Card, Task lifecycle을 ACP 설계에 차용
3. **NanoClaw IPC 확장**: 현재 단방향 → 양방향 + Room 개념 추가 (프로토타입)
4. **HITL 프리미티브 설계**: 승인/거부/위임/에스컬레이션의 표준 메시지 타입 정의