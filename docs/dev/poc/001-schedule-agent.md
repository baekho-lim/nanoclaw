# PoC 001: 에이전트 간 약속 잡기 데모

> 상태: 설계 완료, 구현 대기
> 시작: 2026-03-20

---

## 가설

> "두 사람의 에이전트가 백엔드에서 자동으로 일정을 조율하고, 사람은 최종 승인만 하는 UX는 기존 메신저에서 불가능하며, 별도 통신 계층(ACP)이 필요하다."

## 검증 기준

| 기준 | 성공 | 실패 |
|------|------|------|
| 봇 2개 동시 동작 | 같은 그룹에서 각각 독립 응답 | 충돌/에러 |
| 에이전트 간 협상 | 공유 백엔드에서 교집합 시간 도출 | 동기화 실패 |
| HITL 승인 | 인라인 키보드로 각자 선택 | 버튼 미표시/콜백 실패 |
| 투명성 | 에이전트 간 통신이 그룹에 표시 | 블랙박스 |
| 속도 | 사람 대기 제외 < 10초 | 타임아웃 |

## 아키텍처

```
Telegram 그룹 (UI)
├── 나(A) — 인간
├── 친구(B) — 인간
├── BotA (@Nano_Samanda_bot) — A의 에이전트
└── BotB (새로 생성) — B의 에이전트

공유 백엔드 (Node.js 단일 프로세스)
├── Grammy BotA instance
├── Grammy BotB instance
├── Coordinator (상태 머신)
└── Mock Calendar DB
```

## 상태 머신

```
IDLE
  │ /schedule 명령
  ▼
USER_REQUESTED
  │ BotA: "캘린더 확인 중..."
  ▼
CHECKING_CALENDAR_A
  │ A의 가용 시간 확인
  ▼
REQUESTING_B
  │ BotA→BotB (백엔드): "가용 시간 알려줘"
  │ [🤖 에이전트 간 통신] 로그 표시
  ▼
CHECKING_CALENDAR_B
  │ B의 가용 시간 확인
  ▼
NEGOTIATING
  │ 교집합 계산
  │ [🤖 에이전트 간 통신] 결과 로그 표시
  ▼
WAITING_APPROVAL
  │ BotA → A: [인라인 키보드] 시간 선택
  │ BotB → B: [인라인 키보드] 시간 선택
  ▼
CONFIRMED (양쪽 동일 선택) / RE_VOTE (불일치)
  │ 확정 메시지 + 캘린더 등록
  ▼
DONE
```

## 구현 파일

```
poc/schedule-agent/
├── package.json
├── tsconfig.json
├── .env              # BOT_A_TOKEN, BOT_B_TOKEN, GROUP_CHAT_ID
├── src/
│   ├── index.ts      # 엔트리포인트
│   ├── coordinator.ts
│   ├── bot-a.ts
│   ├── bot-b.ts
│   ├── calendar.ts
│   └── types.ts
```

## 결과 (구현 후 기록)

### 동작 여부
- [x] 봇 2개 동시 시작 성공
- [x] /schedule 명령 인식
- [x] 캘린더 확인 메시지 표시
- [x] 에이전트 간 통신 로그 표시 (투명성 데모)
- [x] 복수 선택 인라인 키보드 (⬜/✅ 토글 + 📌 확인)
- [x] A 선택 후 → B는 A가 고른 시간 중에서만 선택
- [x] 솔로 모드 (가상 친구) 동작
- [x] 선택 후 확정 메시지

### 발견한 문제 (해결됨)
1. **Telegram 봇 간 메시지 불가** — 예상대로 확인. 공유 백엔드로 우회.
2. **NanoClaw와 봇 토큰 충돌** — 같은 토큰 동시 polling 불가. NanoClaw 중지 후 PoC 실행.
3. **그룹 프라이버시 모드** — 봇이 일반 텍스트("확인")를 못 봄. 인라인 버튼으로 해결.
4. **Mock 캘린더 교집합 0개** — 랜덤 생성 시 교집합 없을 수 있음. referenceSlots로 보장.
5. **IPv6 타임아웃** — NanoClaw과 동일 문제. `https.Agent({ family: 4 })` 적용.

### 배운 점
1. **에이전트 간 통신은 반드시 별도 계층 필요** — Telegram 내부로는 절대 불가. 이것이 ACP 존재 이유.
2. **투명성(observability) UX가 핵심** — "[에이전트 간 통신]" 로그가 그룹에 표시되면 사용자가 "뭐가 일어나고 있는지" 바로 이해함.
3. **순차 선택이 병렬 선택보다 나음** — A가 먼저 복수 선택 → B가 그 중에서 선택하는 플로우가 자연스러움.
4. **인라인 키보드가 HITL의 핵심 프리미티브** — 토글+확인 패턴으로 복수 선택 가능.
5. **공유 백엔드 = Coordinator 패턴** — 상태 머신이 에이전트 간 조율의 중심. ACP 서버의 프로토타입.

### 다음 단계
- [ ] Google Calendar API 연동 (Mock → 실제)
- [ ] 실제 2인 테스트 (친구 초대)
- [ ] 에이전트 간 통신을 A2A 프로토콜 형식으로 구조화
- [ ] NanoClaw에 Room + multi-agent 개념 통합
