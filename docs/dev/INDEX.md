# 에이전트 네이티브 메신저 — 개발 문서 인덱스

> 문서 기반 개발(Document-Driven Development)
> 시작: 2026-03-19

---

## 문서 구조

```
docs/
├── dev/
│   ├── INDEX.md              ← 이 파일. 전체 문서 인덱스
│   ├── JOURNAL.md            ← 개발 일지 (날짜별 기록)
│   ├── TODO.md               ← 다음 할 일
│   ├── DECISIONS.md          ← 핵심 결정 기록 (ADR 경량판)
│   └── poc/
│       └── 001-schedule-agent.md  ← PoC별 설계/결과 문서
│
├── research/                  ← 리서치 결과물
│   ├── 05-messenger-agent-comparison.md  ✅ 완료
│   └── (향후 01~12번 리서치 추가)
│
├── AGENT-MESSENGER-ANALYSIS.md  ✅ 전문가 패널 분석
├── SECURITY-RISK-ANALYSIS.md    ✅ 보안 분석
└── TELEGRAM-IPV6-FIX.md         ✅ 트러블슈팅
```

## 문서 규칙

1. **큰 결정은 DECISIONS.md에** — "왜 이렇게 했는가"를 미래의 자신이 이해할 수 있게
2. **매 개발 세션 후 JOURNAL.md 업데이트** — 뭘 했고, 뭐가 막혔고, 다음은 뭔지
3. **PoC마다 설계→결과 문서** — 가설, 구현, 결과, 배운 점
4. **리서치는 번호 순서** — 마스터 플랜의 번호 체계 유지
5. **비밀(토큰, 키)은 절대 문서에 넣지 않음**
