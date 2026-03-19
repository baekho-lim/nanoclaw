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

_아래는 구현 완료 후 작성_

### 동작 여부
- [ ] 봇 2개 동시 시작 성공
- [ ] /schedule 명령 인식
- [ ] 캘린더 확인 메시지 표시
- [ ] 에이전트 간 통신 로그 표시
- [ ] 인라인 키보드 양쪽 표시
- [ ] 선택 후 확정 메시지

### 발견한 문제
_구현 중 발견된 기술적 문제 기록_

### 배운 점
_PoC에서 ACP 설계에 반영할 인사이트_

### 다음 단계
_이 PoC를 기반으로 할 후속 작업_
