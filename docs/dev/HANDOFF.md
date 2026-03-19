# 세션 핸드오프 문서

> 새 세션에서 이 파일을 먼저 읽고 맥락을 파악합니다.
> 마지막 업데이트: 2026-03-20

---

## 프로젝트 상태

**ClawTalk** — 에이전트 네이티브 메신저를 만들고 있습니다.

### 완료된 것

1. **NanoClaw 설정** — 맥미니에 Telegram 연동 (`@Nano_Samanda_bot`), IPv6 수정
2. **전략 분석** — 전문가 5인 패널 정반합 토론 → `docs/AGENT-MESSENGER-ANALYSIS.md`
3. **메신저 비교** — 5개 플랫폼 에이전트 간 통신 분석 → `docs/research/05-messenger-agent-comparison.md`
4. **프로토콜 비교** — A2A/MCP/Matrix 스펙 정독 → `docs/research/01-protocol-comparison.md`
5. **PoC 001** — Telegram 봇 2개 + 약속 잡기 데모 + Google Calendar 실제 연동 → `poc/schedule-agent/`
6. **PRD** — ClawTalk 제품 스펙 → `docs/dev/PRD.md`
7. **MVP 구현 계획** — 8주 스프린트 → `.claude/plans/abundant-twirling-chipmunk.md`

### 다음 할 일

**Sprint 1: 프로젝트 셋업 + 웹 앱 기본 껍데기**

- `clawtalk/` 새 프로젝트 디렉토리
- Next.js + React + TypeScript
- Prisma + PostgreSQL (rooms, users, messages, tasks, agents)
- Google OAuth 로그인
- 빈 Room 리스트 화면
- 검증: 로그인 → 빈 Room 리스트 표시

## 핵심 문서 위치

| 문서 | 경로 | 내용 |
|------|------|------|
| **PRD** | `docs/dev/PRD.md` | 제품 스펙 전체 (7개 기능, 아키텍처, 비즈니스 모델) |
| **TODO** | `docs/dev/TODO.md` | 우선순위별 할 일 |
| **JOURNAL** | `docs/dev/JOURNAL.md` | 개발 일지 (Day 1~2) |
| **DECISIONS** | `docs/dev/DECISIONS.md` | 핵심 결정 7개 (ADR-001~007) |
| **MVP 플랜** | `.claude/plans/abundant-twirling-chipmunk.md` | Sprint 1~8 구현 계획 |
| **PoC 코드** | `poc/schedule-agent/` | 재사용할 검증된 코드 |
| **프로토콜 비교** | `docs/research/01-protocol-comparison.md` | ACP 설계 기초 |

## 기술 환경

- macOS (맥미니), Node.js 24.14 (fnm), Docker 실행 중
- NanoClaw 서비스는 현재 **중지 상태** (PoC가 같은 봇 토큰 사용)
- Google Calendar OAuth 토큰: `poc/schedule-agent/token.json`
- GCP 프로젝트: `agent-messenger-poc` (Calendar API 활성)

## 주의사항

- IPv6 문제: grammy/node-fetch에서 `https.Agent({ family: 4 })` 필수
- 봇 토큰 충돌: NanoClaw와 PoC가 같은 봇 토큰 사용, 동시 실행 불가
- `.env`, `credentials.json`, `token.json`은 git에서 제외
