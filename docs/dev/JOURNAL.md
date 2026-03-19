# 개발 일지

> 최신이 위로. 각 세션에서 뭘 했고, 뭐가 막혔고, 다음은 뭔지.

---

## 2026-03-20 (Day 2)

### 한 일
- 메신저별 에이전트 간 통신 가능성 비교 분석 완료
  - Telegram: 봇 간 메시지 수신 원천 차단 (Telegram 설계 결정)
  - Slack: 같은 워크스페이스면 가능, 크로스 조직은 비현실적
  - Discord: 공유 서버만 있으면 가장 쉬움, 단 HITL UI 빈약
  - WhatsApp (Baileys): 가능하나 비공식+밴 위험
  - NanoClaw: 에이전트 간 통신 메커니즘 자체가 없음
- NanoClaw 채널 아키텍처 상세 분석 (IPC, container-runner, group-queue)
- PoC "약속 잡기" 데모 설계 완료
- 후속 리서치 마스터 플랜 수립 (4단계, 13개 리서치 주제, 6주)

### 핵심 발견
- **어떤 메이저 메신저도 에이전트 간 직접 통신을 지원하지 않음** → 블루오션 확인
- ACP(Agent Communication Protocol) = A2A + HITL + Observability + Federation
- 기존 메신저를 "대체"가 아닌 그 위에 올라가는 "에이전트 계층"으로 포지셔닝

### 막힌 것
- 없음

### 다음
- [ ] BotB 토큰 생성 (BotFather)
- [ ] PoC 001 구현: 봇 2개 + 공유 백엔드 "약속 잡기" 데모
- [ ] 리서치 1-1: MCP/A2A/Matrix 프로토콜 스펙 정독

---

## 2026-03-19 (Day 1)

### 한 일
- NanoClaw 초기 설정 (맥미니)
  - Docker, Node.js, 컨테이너 빌드 완료
  - Telegram 채널 연동 (`@Nano_Samanda_bot`)
  - IPv6 문제 발견 및 해결 (`https.Agent({ family: 4 })`)
- 보안 위험성 분석 (집합론 + Gary Klein RPD)
- 전문가 패널 정반합 토론 (5인, 3라운드)
  - 시장 데이터 수집: AI agent $7.9B→$236B, MCP 81.5k stars
  - 핵심 전략: "제품 먼저, 프로토콜은 추출" (MCP 모델)
  - 실행 로드맵: Phase 0~3 (에이전트 대시보드 → 메신저 → 프로토콜)

### 핵심 발견
- grammy가 node-fetch 사용 → macOS에서 IPv6 타임아웃 문제
- 카카오톡: 봇/AI 에이전트 공식 미지원 → 기회의 빈틈
- "에이전트 네이티브 메신저" 카테고리 자체가 존재하지 않음

### 막힌 것
- Telegram IPv6 문제 (해결됨 — `docs/TELEGRAM-IPV6-FIX.md`)
- 맥북 OpenClaw와 봇 토큰 충돌 (새 봇 생성으로 해결)

### 다음 (→ Day 2에서 수행)
- [x] 메신저별 에이전트 간 통신 비교 분석
- [x] 후속 리서치 마스터 플랜
