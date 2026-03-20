# T-12: Claw 생태계 통합 기술 스택 — 전문가 패널 정반합 토론

> 2026-03-20 | 상태: **확정**
> 대상: ClawTalk, ClawMemory, ClawMeeting, ClawNote, NanoClaw

---

## 패널 구성

| 역할 | 이름 | 전문 영역 |
|------|------|----------|
| 🔵 아키텍트 | 정수현 | 풀스택 시스템 설계, 모노레포, 10년+ 스타트업 CTO |
| 🟢 실용주의자 | 김도윤 | 1-3인 팀 MVP 전문, 배포/운영, "빠른 출시 > 완벽한 설계" |
| 🔴 성능주의자 | 박지원 | Rust/Go 시스템, 실시간 처리, 벡터 DB, 성능 벤치마크 |
| 🟡 DX 옹호자 | 이서연 | TypeScript 생태계, ORM, 인증, 개발자 경험 |
| ⚪ 중재자 | 최민호 | 기술 전략 컨설턴트, 합의 도출 |

---

## 라운드 1: 언어 — TypeScript 단일 vs 하이브리드

### 🔵 정수현 (정)

TypeScript everywhere를 기본으로 권장합니다. Linear, Cal.com이 이 전략으로 성공했습니다.

| 기업 | 스택 | 결과 |
|------|------|------|
| Linear | 풀스택 TS + PostgreSQL | $400M 밸류에이션, 20명 팀 |
| Cal.com | Next.js + TS monorepo | 오픈소스, DDD 아키텍처 |

**핵심 논거**: 타입을 프론트/백/CLI에서 공유하면 인지 부하가 극적으로 줄어듭니다. 1-3인 팀에서 언어 3개(TS+Go+Rust)는 비현실적입니다.

### 🔴 박지원 (반)

동의하지만 조건부입니다. **벤치마크를 보세요**:

| 항목 | Node.js | Go | Rust |
|------|---------|-----|------|
| HTTP req/s | ~10K | ~40K | ~60K |
| 메모리 | 기준 | -60% | -75% |
| 콜드 스타트 | 200ms | 5ms | 3ms |

ClawMeeting의 STT 파이프라인은 초당 수십 MB 오디오를 처리합니다. TypeScript로는 한계가 분명합니다. whisper.cpp/whisper-rs 바인딩은 Rust가 필수입니다.

### 🟢 김도윤 (합)

**지금은 TS, 나중에 Rust.** Microsoft가 TS 컴파일러를 Go로 포팅한 건 특수 케이스(컴파일러 자체의 성능 문제)입니다. 우리 제품의 병목은 AI API 호출 대기 시간이지, CPU 연산이 아닙니다. Phase 1에서 Rust를 도입하면 출시가 2개월 늦어집니다.

### ⚪ 합의

```
✅ 확정: TypeScript-first
  - Phase 1: TypeScript everywhere (ClawTalk, ClawMemory, NanoClaw)
  - Phase 2: ClawMeeting STT만 선택적 Rust (whisper-rs)
  - Go 도입 비권장 (TS와 타입 공유 이점 없음)
```

---

## 라운드 2: 웹 프레임워크 — Next.js vs 대안

### 🟡 이서연 (정)

Next.js App Router가 현재 최선입니다.

| 항목 | Next.js | Remix | SvelteKit | SolidStart |
|------|---------|-------|-----------|------------|
| 생태계 | 최대 | 중간 | 성장 중 | 소규모 |
| 모바일 공유 | Expo/Solito | 제한 | 불가 | 불가 |
| Vercel 배포 | 네이티브 | 지원 | 지원 | 제한 |

ClawTalk 모바일이 Phase 2에 있으므로, React 생태계를 유지해야 Expo/Solito 5로 60-70% 코드를 재사용할 수 있습니다.

### 🔴 박지원 (반)

**WebSocket이 문제입니다.** 모든 메타프레임워크가 WebSocket을 네이티브로 지원하지 않습니다. Vercel 서버리스도 WebSocket 미지원. ClawTalk 같은 실시간 앱에서 이건 심각한 제약입니다.

### 🔵 정수현 (합)

**이미 해결했습니다.** ClawTalk은 Custom Server 패턴(`server/index.ts`)으로 Socket.io를 통합했고, 잘 작동합니다. Supabase Realtime은 추후 스케일링 옵션으로 둡니다.

```
아키텍처:
  Next.js App Router (UI, SSR, API)
  + Custom Server with Socket.io (실시간)
  → 단일 포트, 배포 간단 (ADR-002)
```

### ⚪ 합의

```
✅ 확정: Next.js 유지
  - Custom Server + Socket.io (현행 유지, 검증됨)
  - 스케일 시 Supabase Realtime 또는 분리 WebSocket 서버 고려
  - SvelteKit/SolidStart 전환 비권장 (React Native 생태계 단절)
```

---

## 라운드 3: ORM — Prisma vs Drizzle

### 🔴 박지원 (정 — Drizzle)

성능 수치가 명확합니다:

| 항목 | Drizzle | Prisma 7 |
|------|---------|----------|
| 처리량 | ~88K req/s | ~71K req/s |
| 번들 | 5KB | 40KB+ |
| pgvector | 네이티브 | 확장 필요 |
| Edge/서버리스 | 완전 지원 | 제한적 |

ClawMemory가 벡터 검색을 핵심으로 사용하므로 Drizzle의 pgvector 네이티브 통합이 결정적입니다.

### 🟡 이서연 (반 — Prisma 유지)

**ClawTalk은 이미 Prisma 7로 구현되었습니다.** 9개 모델, 마이그레이션, Auth.js 어댑터까지 연동 완료. 지금 Drizzle로 마이그레이션하면 Sprint 1-2를 다시 하는 것입니다.

Prisma 7의 변화도 주목하세요:
- Rust 엔진 제거 → 순수 TypeScript → 성능 격차 축소
- 드라이버 어댑터 지원 → Edge 배포 가능
- 생태계 규모 (Auth.js, tRPC 등) 여전히 우위

### 🟢 김도윤 (합)

**제품별로 나누면 됩니다.**

- **ClawTalk**: Prisma 7 유지 (이미 구현됨, 벡터 검색 불필요)
- **ClawMemory**: Drizzle 신규 시작 (pgvector 필수)
- **ClawMeeting**: 제품 착수 시 그때의 최선 선택

같은 모노레포에서 두 ORM이 공존해도 문제없습니다. `packages/db-clawtalk`(Prisma), `packages/db-clawmemory`(Drizzle)로 분리하면 됩니다.

### ⚪ 합의

```
✅ 확정: 제품별 최적 ORM
  - ClawTalk: Prisma 7 유지 (마이그레이션 비용 > 이득)
  - ClawMemory: Drizzle (pgvector 네이티브 필수)
  - 새 제품: Drizzle 기본값 (2026 커뮤니티 합의 반영)
```

---

## 라운드 4: 데이터베이스 — PostgreSQL vs Supabase

### 🟢 김도윤 (정 — Supabase)

1-3인 팀에게 운영 부담은 적이에요. Supabase가 한 번에 해결합니다:

- PostgreSQL + pgvector + Realtime + Auth + Storage
- 10K+ 동시접속 안정
- $5B 밸류에이션, 99K+ GitHub stars
- 100K+ 문서에서 sub-50ms 벡터 쿼리

### 🔵 정수현 (반)

**락인 위험입니다.** Supabase 고유 기능(Realtime, RLS policies)에 의존하면 이탈이 어렵습니다. 순수 PostgreSQL + 자체 관리가 장기적으로 안전합니다.

### 🔴 박지원 (보강)

벡터 DB 벤치마크를 봅시다:

| | pgvector | Qdrant | Weaviate |
|------|----------|--------|----------|
| p50 레이턴시 | 12ms | 3ms | 5ms |
| 5M 벡터 이하 | 충분 | 과잉 | 과잉 |

ClawMemory의 초기 규모(사용자당 수천 벡터)에서 pgvector로 충분합니다. 전용 벡터 DB는 과잉 투자입니다.

### 🟡 이서연 (합)

**현실적 경로**: ClawTalk은 이미 Docker PostgreSQL을 쓰고 있습니다.

```
Phase 1 (MVP):
  - ClawTalk: 기존 PostgreSQL 유지 (Docker → 배포 시 관리형 전환)
  - ClawMemory: Supabase (pgvector + Realtime 활용)

Phase 2 (스케일):
  - 전체 통합: Supabase 또는 관리형 PostgreSQL
  - 벡터 검색 병목 시: Qdrant 분리
```

### ⚪ 합의

```
✅ 확정: PostgreSQL 중심 + 점진적 관리형 전환
  - MVP: Docker PostgreSQL (ClawTalk, 현행 유지)
  - ClawMemory: Supabase 권장 (pgvector + Realtime)
  - 벡터 DB 분리 불필요 (5M 이하에서 pgvector 충분)
  - 배포 시: Railway/Neon/Supabase 중 선택
```

---

## 라운드 5: 인증 — Auth.js vs Better Auth vs Clerk

### 🟡 이서연 (현황)

| | Auth.js v5 | Clerk | Better Auth |
|------|-----------|-------|-------------|
| 호스팅 | 자체 | SaaS | 자체 |
| MFA | 미내장 | 내장 | 플러그인 |
| 멀티테넌트 | 미내장 | 내장 | 플러그인 |
| 벤더 락인 | 없음 | 높음 | 없음 |
| 프리빌트 UI | 없음 | 있음 | shadcn 통합 |

Lucia Auth는 2025년 3월 deprecated. Better Auth가 사실상 후속자입니다.

### 🔵 정수현 (정 — Better Auth)

Better Auth가 이상적입니다. 자체 호스팅, MFA 플러그인, 멀티 프로덕트 SSO 구현 가능. 벤더 락인 없이 Supabase DB와 통합됩니다.

**멀티 프로덕트 SSO:**
```
공유 PostgreSQL → Better Auth → JWT 공유
ClawTalk ←→ ClawMemory ←→ ClawMeeting
```

### 🟢 김도윤 (반 — 현실)

**ClawTalk은 이미 Auth.js v5로 동작합니다.** Google OAuth 연동, PrismaAdapter, 세션 관리, Socket.io 인증까지 통합 완료. 지금 Better Auth로 바꾸면 Sprint 1을 다시 해야 합니다.

Auth.js의 단점(MFA/멀티테넌트 미내장)은 **Phase 0에서 필요하지 않습니다.** MFA는 Team 티어(Phase 2+)에서 필요합니다.

### ⚪ 합의

```
✅ 확정: 제품별 단계적 접근
  - ClawTalk: Auth.js v5 유지 (이미 구현, Phase 0 요구사항 충족)
  - 새 제품: Better Auth 기본값
  - Phase 2 (Team 티어): Auth 통합 레이어 구축 시 Better Auth로 수렴 검토
  - Clerk: 비권장 (벤더 락인, 스케일 비용)
```

---

## 라운드 6: CLI / 데스크톱 / 모바일

### 🟡 이서연

**CLI (ClawMemory):**
- Clack (프롬프트/인터랙션) + Commander.js (명령어 파싱)
- Ink(React CLI)는 오버헤드 — CLI에 React 불필요

**데스크톱 (ClawNote):**
- Phase 1: Obsidian 플러그인 (TypeScript, 프레임워크 불필요)
- Phase 2+: Tauri 2.0 (10MB vs Electron 100MB, 모바일 지원)

### 🔵 정수현

**모바일 (Phase 2):**
- Expo + Solito 5 = Next.js와 60-70% 코드 공유
- Solito 5(2025.10)가 React Native Web 의존성 제거, 순수 Next.js 렌더링
- Flutter 비권장: Dart 추가 학습 = 팀 분산

```
monorepo 구조:
  apps/web/          → Next.js (ClawTalk 웹)
  apps/mobile/       → Expo Router (ClawTalk 모바일)
  packages/app/      → 공유 화면, 비즈니스 로직
  packages/ui/       → 공유 컴포넌트
  packages/db/       → 스키마, 타입
```

### ⚪ 합의

```
✅ 확정:
  - CLI: Clack + Commander.js
  - 데스크톱: Obsidian 플러그인 (Phase 1) → Tauri 2.0 (Phase 2+)
  - 모바일: Expo + Solito 5 (Phase 2)
  - Monorepo: Turborepo + pnpm
```

---

## 최종 기술 스택 결정

### 확정 스택

```
언어          TypeScript everywhere (+ Rust: ClawMeeting STT만)
웹            Next.js 16 App Router + Custom Server (Socket.io)
ORM           ClawTalk: Prisma 7 | ClawMemory: Drizzle | 새 제품: Drizzle
DB            PostgreSQL + pgvector (Docker → 관리형 전환)
인증           ClawTalk: Auth.js v5 | 새 제품: Better Auth
실시간         Socket.io (Phase 1) → Supabase Realtime (스케일 시)
UI            Tailwind CSS 4 + shadcn/ui (base-ui)
패키지관리     pnpm + Turborepo
CLI           Clack + Commander.js (ClawMemory)
데스크톱      Obsidian 플러그인 → Tauri 2.0
모바일        Expo + Solito 5 (Phase 2)
```

### 제품별 기술 맵핑

| 제품 | 핵심 기술 | Phase |
|------|----------|-------|
| **NanoClaw** | Node.js + Docker (현행 유지) | 운영 중 |
| **ClawTalk** | Next.js 16 + Prisma 7 + Socket.io + Auth.js | Phase 0 (진행 중) |
| **ClawMemory** | Clack CLI + Drizzle + pgvector | Phase 1 |
| **ClawMeeting** | Next.js + Whisper(Rust) + Supabase | Phase 1-2 |
| **ClawNote** | Obsidian 플러그인 (TS) | Phase 1 |

### 5대 원칙

1. **TypeScript 단일 언어** — 팀 인지 부하 최소화
2. **이미 작동하는 것은 건드리지 않는다** — ClawTalk의 Prisma/Auth.js 마이그레이션 불가
3. **새 제품은 최신 합의를 따른다** — Drizzle, Better Auth
4. **점진적 복잡성** — 필요할 때만 기술 추가 (Rust, Qdrant, Supabase)
5. **오픈소스 우선** — 벤더 락인 최소화

---

## 참고 기업 스택

| 기업 | 스택 | 팀 규모 | 참고 |
|------|------|---------|------|
| **Linear** | 풀스택 TS + PostgreSQL + Redis | ~20명 | 단일 언어 전략의 성공 사례 |
| **Cal.com** | Next.js + Turborepo + Prisma | ~30명 | 오픈소스 + 모노레포 |
| **Supabase** | Next.js + Elixir(Realtime) + Go | ~100명 | 관리형 PostgreSQL의 표준 |

---

## 소스

### 언어
- [Rust vs Go vs TypeScript - DEV](https://dev.to/rust_web_dev/rust-vs-go-vs-typescript-the-next-2025-backend-battle-3nl8)
- [Microsoft TS Go 포팅 설명 - The New Stack](https://thenewstack.io/microsoft-typescript-devs-explain-why-they-chose-go-over-rust-c/)
- [TypeScript 7 진행 상황 - Microsoft](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)

### ORM
- [Drizzle vs Prisma 2026 - MakerKit](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma)
- [TypeScript ORM Battle - Level Up](https://levelup.gitconnected.com/the-2025-typescript-orm-battle-prisma-vs-drizzle-vs-kysely-007ffdfded67)
- [Drizzle pgvector 가이드](https://orm.drizzle.team/docs/guides/vector-similarity-search)

### DB
- [Best Vector Databases 2026 - Encore](https://encore.dev/articles/best-vector-databases)
- [Supabase Review 2026 - Hackceleration](https://hackceleration.com/supabase-review/)

### 인증
- [Better Auth vs Clerk - Supastarter](https://supastarter.dev/blog/better-auth-vs-nextauth-vs-clerk)
- [Lucia Auth Deprecated - Wisp](https://www.wisp.blog/blog/lucia-auth-is-dead-whats-next-for-auth)

### 모바일
- [Solito 5 웹 퍼스트](https://dev.to/redbar0n/solito-5-is-now-web-first-but-still-unifies-nextjs-and-react-native-2lek)
- [Tauri 2.0 Stable](https://v2.tauri.app/blog/tauri-20/)

### 참고 기업
- [Linear Tech Stack](https://himalayas.app/companies/linear/tech-stack)
- [Cal.com GitHub](https://github.com/calcom/cal.com)
