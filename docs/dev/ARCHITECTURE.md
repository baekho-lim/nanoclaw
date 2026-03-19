# 시스템 아키텍처

> 모듈 독립성 + Claw Core + 데이터 전략
> 2026-03-20

---

## 생태계 구조

```
┌───────────────────────────────────────────────────┐
│  bhOS (~/bhOS/)                                    │
│  조직 체계: 프로젝트, 컨텍스트, 규칙, 세션 프로토콜    │
│  인터페이스: Claude Code CLI + MCP 서버들             │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ClawTalk  │ │ClawMemory│ │ClawMeeting│           │
│  │~/clawtalk│ │CLI+옵시디언│ │클라우드   │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       └────────────┼────────────┘                   │
│             ┌──────┴──────┐                         │
│             │ Claw Core   │                         │
│             │인증+관계+이벤트│                        │
│             └──────┬──────┘                         │
│             ┌──────┴──────┐                         │
│             │  NanoClaw   │                         │
│             │ ~/nanoclaw/ │                         │
│             └─────────────┘                         │
└───────────────────────────────────────────────────┘
```

## Claw Core (공유 계층)

모든 모듈이 의존하는 최소 공통 계층. 자동 설치.

| 구성 요소 | 역할 |
|----------|------|
| 인증 | Google OAuth / 자체 계정 |
| 사용자 프로필 | 기본 정보 |
| 관계 그래프 | Person + 관계 유형 + 온도 |
| 이벤트 버스 | 모듈 간 느슨한 연결 |
| Agent Identity | 에이전트 신원/신뢰 (향후) |

```prisma
model User {
  id    String @id
  name  String
  email String @unique
}

model Person {
  id           String @id
  name         String
  relationship String  // family, friend, colleague, client...
  temperature  Int     // 1-5
  ownerId      String
}

model Event {
  id        String   @id
  type      String   // "meeting.completed", "memory.updated"
  source    String   // "clawtalk", "clawmeeting", "clawmemory"
  payload   Json
  createdAt DateTime
}
```

## 이벤트 버스

모듈 A는 모듈 B의 존재를 모른다. 이벤트만 발행.

```
ClawMeeting: "meeting.completed" 발행
  → ClawMemory 있으면: 전사본 저장, 관계 업데이트
  → ClawMemory 없으면: 아무 일 없음 (에러 아님)

ClawTalk: "calendar.meeting_soon" 발행
  → ClawMemory 있으면: 브리핑 자료 생성
  → ClawMemory 없으면: 단순 알림만
```

구현: MVP는 SQLite 테이블 + 폴링. 확장 시 Redis pub/sub.

## 모듈별 조합

| 사용자 유형 | 설치 | 경험 |
|------------|------|------|
| 미팅 녹음만 | Core + Meeting | 가입→녹음→전사 |
| 에이전트 메신저 | Core + Talk | 에이전트 약속 잡기 |
| 세컨브레인 | Core + Memory + 옵시디언 | 관계 + 지식 |
| 풀 워크스테이션 | Core + 전부 | bhOS 완전체 |

## Federated Memory

파일은 제자리에 두고, 인덱스만 통합.

```
물리적 저장소 (변경 없음):
  ~/bhOS/              기존 유지
  ~/.claude/           Claude Code 메모리
  ~/nanoclaw/groups/   NanoClaw 에이전트 메모리
  ~/.claw/note/        ClawNote 마크다운

통합 인덱스 (신규):
  ~/.claw/index/
  ├── graph.db     관계 + 엔티티
  ├── vectors.db   임베딩
  ├── fts.db       전문 검색
  └── sources.json 인덱싱 대상
```

## 두 트랙: 로컬 + 클라우드

| | 로컬 (개발자) | 클라우드 (일반) |
|---|---|---|
| 설치 | 맥미니에 직접 | 가입→바로 사용 |
| AI 모델 | BYOK / Ollama | OpenRouter / BYOK |
| 데이터 | 로컬 파일시스템 | 클라우드 스토리지 |
| 수익 | 없음 (오픈소스) | 구독 + 스토리지 |

같은 코어 엔진, 배포 모델만 다름.
