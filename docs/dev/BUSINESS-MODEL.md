# 수익 모델 + 빌드 순서

> 2026-03-20

---

## 수익 타임라인

```
즉시 (0-6개월):
  ClawMeeting 구독
  ├── Free: 월 300분, 로컬 저장
  ├── Pro: $12.99/월 — 무제한, 클라우드 저장
  └── Team: $24.99/인/월 — 팀 공유, 검색, 분석

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

## ClawTalk 가격

| 티어 | 가격 | AI | 포함 |
|------|------|-----|------|
| Free | $0 | OpenRouter 크레딧 | 에이전트 1, Room 3, Google Cal |
| BYOK | $0 | 본인 키 | 무제한 |
| Pro | $9.99/월 | 크레딧 제공 | + 프리미엄 에이전트 |
| Team | $19.99/인/월 | 팀 풀 | + 관리자, 감사 로그 |

## 빌드 순서 (확정)

```
Phase 1 (지금):
  1a. ClawTalk MVP (웹 앱) — PoC 검증됨
  1b. ClawMemory CLI + 인덱서 (동시)
      옵시디언이 UI, 관계 그래프 + 인덱서 백엔드
      → ClawTalk 미팅 브리핑에 연결

Phase 2:
  ClawMeeting (한국어 녹음/전사, 클라우드)
  → 즉시 수익 + 클라우드 인프라 구축
  → ClawMemory에 미팅 데이터 피딩

Phase 3:
  ├── ClawNote 자체 개발 (옵시디언 대체)
  ├── 클라우드 동기화 유료화
  ├── Agent App Store
  └── Enterprise bhOS
```
