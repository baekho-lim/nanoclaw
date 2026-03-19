# 세션 핸드오프 문서

> 새 세션에서 이 파일을 먼저 읽고 맥락을 파악합니다.
> 마지막 업데이트: 2026-03-20

---

## 프로젝트: bhOS — 에이전트 시대의 AI 워크스테이션

모든 사람과 기업이 수십 개의 에이전트를 운영하는 시대에, 클로드코드 중심 CLI 기반 워크스테이션을 만든다.

### 생태계 구조

```
bhOS (최종 제품, ~/bhOS/)
├── ClawTalk     소통 계층      ~/clawtalk/    ← 지금 만드는 중
├── ClawMemory   기억+관계      CLI+옵시디언    ← 동시 진행
├── ClawMeeting  미팅 녹음      클라우드        ← 다음
├── ClawNote     노트 UI       초기 옵시디언    ← 후순위
└── NanoClaw     에이전트 런타임  ~/nanoclaw/    ← 이미 운영 중
```

### 빌드 순서 (확정)

```
Phase 1 (지금):
  1a. ClawTalk MVP (웹 앱)
  1b. ClawMemory CLI + 인덱서 (동시, 옵시디언이 UI)
Phase 2: ClawMeeting (한국어 녹음/전사, 즉시 수익)
Phase 3: 통합 + ClawNote 자체 개발 + Agent App Store
```

---

## 다음 할 일

**Sprint 1: Claw Core + ClawTalk 프로젝트 셋업**

- `~/clawtalk/` 레포 생성
- Next.js + React + TypeScript + Prisma + PostgreSQL
- **Claw Core**: 인증 + 관계 그래프 스키마 + 이벤트 버스
- **ClawTalk**: Room + 실시간 메시징 기본
- 검증: 로그인 → 빈 Room 리스트 표시

---

## 핵심 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| **생태계 비전** | `docs/dev/ECOSYSTEM-VISION.md` | 전체 전략, 아키텍처, ADR 13개 |
| **ClawTalk PRD** | `docs/dev/PRD.md` | 제품 스펙 (7개 기능, BM, 로드맵) |
| **MVP 구현 계획** | `.claude/plans/abundant-twirling-chipmunk.md` | Sprint 1~8 |
| **프로토콜 비교** | `docs/research/01-protocol-comparison.md` | A2A/MCP/Matrix → ACP |
| **메신저 비교** | `docs/research/05-messenger-agent-comparison.md` | 5개 플랫폼 에이전트 통신 |
| **PoC 코드** | `poc/schedule-agent/` | 재사용할 검증된 코드 |
| **개발 일지** | `docs/dev/JOURNAL.md` | Day 1~2 기록 |

---

## 기술 환경

- macOS (맥미니), Node.js 24.14 (fnm), Docker 실행 중
- NanoClaw: 현재 중지 상태 (PoC와 봇 토큰 공유)
- Google Calendar OAuth: `poc/schedule-agent/token.json`
- GCP 프로젝트: `agent-messenger-poc`
- IPv6 주의: `https.Agent({ family: 4 })` 필수

---

## 핵심 전략 (ADR 요약)

1. **싸우지 않고 이긴다** — 기존 메신저의 상위 집합
2. **제품 먼저, 프로토콜 추출** — MCP 경로를 따름
3. **Developer-first** — 에이전트 투명성이 wedge
4. **BYOK** — AI 비용 플랫폼 미부담, OpenRouter 무료 체험
5. **모듈 독립성** — Claw Core + 이벤트 버스, 골라 쓰기 가능
6. **Federated Memory** — 파일 제자리, 인덱스로 연결
7. **두 트랙** — 로컬(개발자) + 클라우드(일반)
