# TODO

> 우선순위 순. 완료 시 [x]로 체크하고 날짜 기록.

---

## 지금 (다음 세션)

- [ ] ClawTalk MVP Sprint 1: 프로젝트 셋업 (Next.js + Prisma + Google OAuth)
- [ ] Sprint 1 검증: 로그인 → 빈 Room 리스트 표시

## 세션 전환 전 체크리스트

- [x] bhOS PROJECT_INDEX에 PRJ-002 등록
- [ ] bhOS NOW.md 업데이트 (CHIEF 에이전트 관할 — 사용자가 직접 또는 CHIEF에게 위임)
- [ ] 도메인 확보 확인: clawtalk.app / clawtalk.io / claw.sh 등
- [ ] 경쟁사 직접 사용해보기: Fireflies, Otter, Tiro (한국어 품질 체감)
- [ ] 타깃 사용자 1명이라도 대화하기 (에이전트 파워유저 개발자)

## 이번 주

- [ ] Sprint 2: Room + 실시간 메시징 (WebSocket)
- [ ] Sprint 3: Task Engine + HITL (PoC Coordinator 리팩토링)
- [ ] Sprint 4: Schedule Agent + Calendar 연동 (PoC 코드 이식)

## 다음 주

- [ ] 리서치 1-2: 기술 스택 선정
- [ ] 리서치 1-4: 보안/암호화 모델
- [ ] 사용자 페르소나 & 인터뷰 설계
- [ ] TAM/SAM/SOM 정량 모델링

## 제품 기능 백로그 (아이디어 단계)

### 캘린더 통합 래퍼 (Calendar Abstraction Layer)
> PoC에서 Google Calendar만 연동했지만, 실제 제품에서는 다양한 캘린더를 통합해야 함.

- [ ] **통합 캘린더 래퍼 설계**: Google/Apple(CalDAV)/Outlook(Graph API) 단일 인터페이스
  - MCP 서버로 구현 → 에이전트는 `find_free_time(userId)` 하나만 호출
  - 사용자별 캘린더 서비스 설정 (OAuth per provider)
- [ ] **시간 슬롯 잠금 (Time Lock) 기능**: 사용자가 사전에 특정 시간을 "절대 불가"로 잠금
  - 캘린더에 일정이 없어도 에이전트가 해당 시간을 제안하지 않음
  - 예: "금요일 저녁은 항상 가족 시간" → 에이전트가 금 저녁을 제외
  - 구현: 자체 DB에 lock rules 저장 → FreeBusy 결과에서 추가 필터링
- [ ] **선호 시간대 설정**: "저녁 약속은 18~21시", "점심은 12~13시" 등
  - 현재 PoC는 18~21시 하드코딩 → 사용자 설정으로 전환
- [ ] **캘린더 역방향 동기화**: 에이전트가 만든 이벤트를 사용자 캘린더에 쓰는 것 뿐 아니라,
  다른 서비스에서 변경된 일정이 에이전트에 자동 반영되도록 (webhook/polling)

## 나중

- [ ] 비즈니스 모델 설계
- [ ] 법규/규제 조사 (한국, EU, 미국)
- [ ] IP/특허 조사
- [ ] UX 패턴 조사
- [ ] 정보 아키텍처 설계
- [ ] 두 번째 유즈케이스 PoC (팀 회의록→태스크 배분 등)

---

## 완료

- [x] 2026-03-19: NanoClaw 초기 설정 (맥미니, Telegram 연동)
- [x] 2026-03-19: 보안 위험성 분석
- [x] 2026-03-19: 전문가 패널 정반합 토론 (5인, 3라운드)
- [x] 2026-03-20: 메신저별 에이전트 간 통신 비교 분석
- [x] 2026-03-20: NanoClaw 채널 아키텍처 상세 분석
- [x] 2026-03-20: 후속 리서치 마스터 플랜 수립
- [x] 2026-03-20: 개발 문서화 체계 수립
- [x] 2026-03-20: PoC 001 구현 + Google Calendar 연동 (동작 확인)
- [x] 2026-03-20: 리서치 1-1 완료: A2A/MCP/Matrix 프로토콜 비교
- [x] 2026-03-20: ClawTalk PRD 작성 완료
- [x] 2026-03-20: MVP 구현 계획 수립 (8주 스프린트)
