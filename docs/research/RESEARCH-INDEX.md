# 리서치 인덱스

> 완료된 리서치 + 추가 필요한 리서치
> 2026-03-20

---

## 완료된 리서치

| # | 제목 | 파일 | 완료일 |
|---|------|------|--------|
| 01 | A2A/MCP/Matrix 프로토콜 비교 | `01-protocol-comparison.md` | 2026-03-20 |
| 05 | 메신저별 에이전트 간 통신 비교 (TG/Slack/Discord/WA) | `05-messenger-agent-comparison.md` | 2026-03-20 |
| — | 전문가 패널 전략 분석 (5인, 3라운드) | `../AGENT-MESSENGER-ANALYSIS.md` | 2026-03-19 |
| — | 보안 위험성 분석 (집합론 + RPD) | `../SECURITY-RISK-ANALYSIS.md` | 2026-03-19 |

---

## 추가 필요한 리서치

### 시장 조사

| # | 주제 | 우선순위 | 관련 모듈 | 상태 |
|---|------|---------|----------|------|
| M-01 | 한국 미팅 전사 시장 규모 + 경쟁 지형 | **높음** | ClawMeeting | 미시작 |
| M-02 | 에이전트 네이티브 메신저 카테고리 동향 | 중간 | ClawTalk | 부분 (패널 분석에서 다룸) |
| M-03 | 개인 지식 관리(PKM) 시장 + Obsidian 생태계 | 중간 | ClawMemory/Note | 미시작 |
| M-04 | 엔터프라이즈 AI 워크플로우 시장 | 낮음 | bhOS Enterprise | 미시작 |
| M-05 | TAM/SAM/SOM 정량 모델링 | 중간 | 전체 | 미시작 |

### 경쟁자 조사

| # | 주제 | 우선순위 | 관련 모듈 | 상태 |
|---|------|---------|----------|------|
| C-01 | Fireflies / Otter / tldv / Tiro 핸즈온 비교 | **높음** | ClawMeeting | 미시작 |
| C-02 | Dify / FlowiseAI / n8n / Langflow 핸즈온 비교 | 중간 | ClawTalk | 미시작 |
| C-03 | Obsidian / Notion / Roam 플러그인 생태계 | 중간 | ClawNote/Memory | 미시작 |
| C-04 | Calendly / Cal.com 기능 비교 | 중간 | ClawTalk (Slot Manager) | 미시작 |
| C-05 | Dust.tt / Composio / AgentMail 분석 | 낮음 | ClawTalk | 미시작 |

### 기술 리서치

| # | 주제 | 우선순위 | 관련 모듈 | 상태 |
|---|------|---------|----------|------|
| T-01 | 한국어 STT 엔진 비교 (Whisper/CLOVA/Google/Azure) | **높음** | ClawMeeting | 미시작 |
| T-02 | 실시간 전사 아키텍처 (WebSocket + 화자 분리) | **높음** | ClawMeeting | 미시작 |
| T-03 | 클라우드 인프라 비용 모델링 (AWS/GCP/CF) | **높음** | ClawMeeting, 전체 | 미시작 |
| T-04 | Local-first 아키텍처 (CRDTs, Automerge, Yjs) | 중간 | ClawMemory | 미시작 |
| T-05 | 벡터 DB 로컬 구현 (ChromaDB/LanceDB/SQLite-vss) | 중간 | ClawMemory | 미시작 |
| T-06 | LLM 자동 엔티티/관계 추출 정확도 | 중간 | ClawMemory | 미시작 |
| T-07 | 옵시디언 플러그인 개발 가이드 | 중간 | ClawNote | 미시작 |
| T-08 | macOS 앱 패키징 (Electron/Tauri/Swift) | 낮음 | bhOS | 미시작 |
| T-09 | Syncthing/Tailscale 디바이스 동기화 | 낮음 | 전체 | 미시작 |
| T-10 | 에이전트 오케스트레이션 (CrewAI/LangGraph 코드 분석) | 중간 | NanoClaw | 미시작 |
| T-11 | 오디오 스토리지 최적화 (Opus, CDN) | 중간 | ClawMeeting | 미시작 |
| T-12 | 기술 스택 선정 (백엔드/프론트/DB) | 낮음 | 전체 | 부분 (PRD에서 결정) |

### 법규/IP

| # | 주제 | 우선순위 | 상태 |
|---|------|---------|------|
| L-01 | 한국 개인정보보호법 + 전기통신사업법 | 중간 | 미시작 |
| L-02 | EU GDPR + DMA (메신저 상호운용성) | 낮음 | 미시작 |
| L-03 | AI 규제 (EU AI Act, 한국 AI 기본법) | 낮음 | 미시작 |
| L-04 | 오픈소스 라이선스 전략 (AGPL/Apache/dual) | 낮음 | 미시작 |
| L-05 | 선행 특허 검색 ("agent communication") | 낮음 | 미시작 |

---

## 리서치 산출물 위치 규칙

| 성격 | 저장 위치 | 예시 |
|------|----------|------|
| 생태계 공용 (프로토콜, 시장 전체) | `~/nanoclaw/docs/research/` | 01, 05, M-01, L-* |
| ClawTalk 전용 (경쟁자, 기술 선택) | `~/clawtalk/docs/research/` | C-02, C-04, T-05, T-06 |
| ClawMeeting 전용 (STT, 전사) | `~/clawmeeting/docs/research/` (향후) | T-01, T-02, C-01 |

## 리서치 실행 순서

```
Phase 1과 함께 (ClawTalk + ClawMemory):
  완료: 01, 05, 전문가 패널, 보안 분석
  진행: C-02, C-04, T-05, T-06 → ~/clawtalk/docs/research/

Phase 2 전에 (ClawMeeting):
  필수: T-01, T-02, T-03, C-01, M-01

필요 시:
  나머지는 해당 모듈 개발 착수 전에 진행
```
