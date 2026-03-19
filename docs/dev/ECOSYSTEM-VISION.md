# Claw 생태계 — 개인 AI 운영체제 비전

> 전문가 패널 정반합 토론 + 아키텍처 설계
> 2026-03-20

---

## 비전 한 줄

> **맥미니 하나에 나만의 디지털 자아를 구축한다.** 에이전트가 소통하고(ClawTalk), 기억하고(ClawNote), 실행하고(NanoClaw), 개발자가 아니어도 설치하고 쓸 수 있다(ClawOS).

## 생태계 구조

**bhOS는 이미 존재하는 개인 운영체제다.** `~/bhOS/`에 프로젝트 관리, 컨텍스트, 세션 프로토콜, 규칙이 정의되어 있다. "ClawOS"를 새로 만들 필요 없이, bhOS가 전체 생태계의 조직 계층 역할을 한다.

```
┌──────────────────────────────────────────────────────┐
│                    bhOS (개인 운영체제)                  │
│                    ~/bhOS/                             │
│                                                        │
│  00-system/  규칙, AI OS Rules                         │
│  02-projects/  비즈니스 컨텍스트                        │
│  03-dev/  코드, PRD, 스펙                              │
│    ├── claw-lab/  Claw 생태계 연구 & 실험              │
│    ├── vinchi/    다른 프로젝트들                       │
│    └── ...                                             │
│  08-context/  NOW.md (현재 상황)                        │
│                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  ClawTalk   │  │  ClawNote   │  │  NanoClaw   │       │
│  │  소통 계층   │  │  지식 계층   │  │  실행 계층   │       │
│  │  ~/clawtalk │  │  (향후)     │  │  ~/nanoclaw │       │
│  │             │  │             │  │             │       │
│  │  웹 메신저   │  │  마크다운    │  │  에이전트    │       │
│  │  에이전트간  │  │  온톨로지    │  │  컨테이너    │       │
│  │  HITL       │  │  세컨브레인  │  │  MCP/BYOK   │       │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘       │
│         │               │               │              │
│  ┌──────┴───────────────┴───────────────┴─────────┐   │
│  │              공유 Knowledge Index                 │   │
│  │              ~/.claw/index/ (향후)                 │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────┴───────────────────────────┐   │
│  │              맥미니 (하드웨어)                      │   │
│  │  Docker │ Ollama │ 파일시스템                       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 각 계층의 역할

| 계층 | 역할 | 위치 | 비유 |
|------|------|------|------|
| **bhOS** | 조직, 관리, 규칙, 컨텍스트 | `~/bhOS/` | 신경계 + 의식 |
| **ClawTalk** | 에이전트와 사람의 소통 | `~/clawtalk/` | 입과 귀 |
| **ClawNote** | 지식 저장, 연결, 회상 | (향후) | 기억과 뇌 |
| **NanoClaw** | 에이전트 실행, 도구 사용 | `~/nanoclaw/` | 손과 발 |
| **claw-lab** | 연구, 실험, 카탈로그 | `~/bhOS/03-dev/claw-lab/` | 연구실 |

### bhOS와의 통합 포인트

bhOS의 기존 프로토콜을 Claw 생태계가 따른다:

| bhOS 규칙 | Claw 적용 |
|-----------|-----------|
| `NOW.md` = 현재 상황 | ClawTalk/NanoClaw 상태도 NOW.md에 반영 |
| `SESSION-LOG.md` | 각 프로젝트(clawtalk, nanoclaw)에 개발 일지 |
| `02-projects/` = 비즈니스 | ClawTalk 사업 컨텍스트는 여기 |
| `03-dev/` = 코드+스펙 | claw-lab에서 연구, 각 레포에서 개발 |
| `CLAUDE.md` = AI 규칙 | 각 레포의 CLAUDE.md가 AI 에이전트 행동 규칙 |
| `07-shared/glossary.md` | Claw 용어(ACP, HITL 등) 추가 |

---

## 전문가 패널 소개

| # | 이름 | 전문 영역 | 이력 |
|---|------|-----------|------|
| 1 | **Dr. Vannevar Kim** | 개인 지식 관리(PKM) / 세컨브레인 | 前 Notion Architecture 리드 → Obsidian 코어 플러그인 컨트리뷰터. Zettelkasten, evergreen notes, knowledge graph 15년. 저서: "The Digital Self" |
| 2 | **Prof. 이온톨** | 시맨틱 웹 / 온톨로지 공학 | 서울대 정보학과 교수. W3C RDF/OWL 워킹그룹 멤버. Knowledge Graph, Linked Data, SPARQL 전문. DBpedia 한국어 챕터 리드 |
| 3 | **Alex Rivera** | Developer Experience / CLI 도구 | 前 Homebrew 코어 메인테이너 → Vercel DX 팀 리드. CLI UX, 패키지 관리, 원클릭 설치 전문. Rust/Go CLI 도구 50개+ 기여 |
| 4 | **Dr. Sarah Chen** | AI 에이전트 생태계 (재소환) | 前 Anthropic Research (MCP 설계) → CrewAI 어드바이저. Agent memory, context window, tool use, HITL |
| 5 | **Prof. 박준형** | 기술사회학 / 미래전략 (재소환) | KAIST 미래전략대학원. 기술 채택 곡선, 플랫폼 생태계, 디지털 주권(digital sovereignty) |
| 6 | **Maria Torres** | 프라이버시 / 데이터 주권 | 前 Signal Foundation 아키텍트 → EU Digital Rights 컨설턴트. Local-first, E2EE, self-sovereign identity, GDPR 전문 |

---

## 라운드 1: 아키텍처

### "4개 제품을 어떻게 하나의 생태계로 엮는가?"

---

#### 정(Thesis) — 통합 모놀리스

**Alex Rivera:**

> DX 관점에서 말씀드리겠습니다. 사용자가 "개발을 잘 모르는 사람"이라면, **설치 경험이 곧 제품**입니다. NanoClaw 따로, ClawTalk 따로, ClawNote 따로 설치하게 하면 그 순간 사용자를 잃습니다.
>
> Homebrew에서 배운 교훈: **`curl | sh` 한 줄이면 끝나야 합니다.** 저는 이걸 "ClawOS installer"라고 부르겠습니다:
>
> ```bash
> curl -fsSL https://get.claw.sh | sh
> ```
>
> 이 한 줄이:
> 1. 맥미니에 Docker 설치 (없으면)
> 2. NanoClaw 설치 + 기본 설정
> 3. ClawTalk 로컬 서버 시작
> 4. ClawNote 데이터 디렉토리 초기화
> 5. 추천 CLI 도구 설치 (Ollama, git, etc.)
> 6. 브라우저에서 `http://localhost:3000` 열기 → 온보딩 시작
>
> 사용자는 **"Claw"를 설치하는 것**이지, 4개 제품을 따로 설치하는 게 아닙니다. 내부적으로는 분리되어 있지만, **설치와 관리는 하나**여야 합니다. `claw` CLI가 모든 걸 통합 관리합니다:
>
> ```bash
> claw status          # 모든 서비스 상태
> claw update          # 전체 업데이트
> claw talk            # ClawTalk 웹 열기
> claw note            # ClawNote 열기
> claw agent list      # 에이전트 목록
> claw config          # 설정
> ```

**Dr. Sarah Chen:**

> 동의합니다. 그리고 **데이터 계층도 통합**되어야 합니다. 현재 NanoClaw의 에이전트 메모리는 `groups/{name}/CLAUDE.md`에, Claude Code의 메모리는 `~/.claude/`에 파편화되어 있습니다. ClawNote가 이걸 통합하는 **단일 지식 계층**이 되어야 합니다.
>
> 에이전트가 작업하면서 배운 것 → ClawNote에 저장
> ClawNote의 지식 → 에이전트가 다음 작업에 활용
> ClawTalk의 대화 히스토리 → ClawNote에 인덱싱
>
> 이것이 **"디지털 자아"의 핵심 루프**입니다:
> ```
> 행동(NanoClaw) → 소통(ClawTalk) → 기억(ClawNote) → 행동(NanoClaw)
> ```

---

#### 반(Antithesis) — 느슨한 결합

**Prof. 이온톨:**

> 모놀리스의 위험을 말씀드려야 합니다. 온톨로지 공학에서 가장 중요한 원칙은 **"결합도는 낮추고 응집도는 높여라"**입니다.
>
> 4개 제품을 하나로 묶으면:
> 1. **배포 복잡도 폭발** — 하나가 깨지면 전체가 깨짐
> 2. **진화 속도 차이** — ClawTalk은 빠르게 바뀌는데 NanoClaw는 안정적이어야 함
> 3. **사용자 선택권 제거** — "나는 ClawNote만 쓰고 싶은데" 불가능
>
> 대안: **공유 데이터 계층 + 독립 서비스**
>
> ```
> [ClawTalk] [ClawNote] [NanoClaw]
>      ↕          ↕         ↕
>  ┌──────────────────────────────┐
>  │    Shared Knowledge Graph     │
>  │    (RDF/JSON-LD + SQLite)     │
>  └──────────────────────────────┘
> ```
>
> 각 제품은 독립적으로 설치/업데이트/제거 가능하지만, **지식 그래프를 공유**합니다. 이게 유닉스 철학입니다 — "한 가지를 잘 하는 도구들이 파이프로 연결된다."

**Maria Torres:**

> 프라이버시 관점을 추가하겠습니다. "디지털 자아"를 구축한다면 **데이터 주권(data sovereignty)**이 핵심입니다.
>
> 이 시스템의 모든 데이터는 **사용자의 맥미니에만 존재**해야 합니다. 클라우드에 올라가는 순간 "나의 디지털 자아"가 아니라 "빅테크의 자산"이 됩니다.
>
> **Local-first architecture**가 필수입니다:
> - 모든 데이터는 로컬 파일시스템에 저장 (SQLite, 마크다운)
> - 클라우드는 **선택적 동기화**만 (사용자가 명시적으로 허용)
> - AI 모델도 로컬 (Ollama) 또는 BYOK (데이터가 외부로 나가더라도 사용자가 인지)
> - 백업은 사용자가 직접 관리 (Time Machine, 외장 드라이브)
>
> Signal이 성공한 이유: **"당신의 메시지는 당신의 것"**. Claw도: **"당신의 디지털 자아는 당신의 것"**.

---

#### 합(Synthesis)

> **"하나처럼 설치, 독립적으로 진화, 지식으로 연결"**
>
> 1. **설치는 하나** — `curl | sh` → ClawOS가 전체 설치/관리
> 2. **서비스는 독립** — 각각 독립 프로세스, 독립 업데이트
> 3. **데이터는 공유** — 로컬 Knowledge Graph가 접착제
> 4. **데이터는 로컬** — 맥미니에서 벗어나지 않음 (BYOK 제외)
>
> ```
> ClawOS (설치/관리 CLI)
>   ├── claw install     → 전체 설치
>   ├── claw update talk → ClawTalk만 업데이트
>   └── claw status      → 모든 서비스 상태
>
> 공유 계층:
>   ~/.claw/
>   ├── knowledge/       → 공유 Knowledge Graph (SQLite + 마크다운)
>   ├── config/          → 공유 설정 (BYOK 키, 캘린더 토큰)
>   ├── talk/            → ClawTalk 데이터
>   ├── note/            → ClawNote 데이터
>   └── agent/           → NanoClaw 에이전트 데이터
> ```

---

## 라운드 2: ClawNote와 온톨로지

### "마크다운 노트를 어떻게 '디지털 자아'로 만드는가?"

---

#### 정(Thesis) — 온톨로지 기반 지식 그래프

**Prof. 이온톨:**

> 옵시디언의 한계부터 말씀드리겠습니다. 옵시디언은 **파일 기반 링크**입니다. `[[노트 제목]]`으로 연결하지만, 이건 **구문적(syntactic) 연결**이지 **의미적(semantic) 연결**이 아닙니다.
>
> "프로젝트 A"라는 노트에서 "김철수"를 링크했을 때, 옵시디언은 "프로젝트 A가 김철수를 참조한다"만 알지, **"김철수가 프로젝트 A의 리더이다"**라는 관계는 모릅니다.
>
> ClawNote가 디지털 자아가 되려면 **온톨로지**가 필요합니다:
>
> ```turtle
> :ProjectA rdf:type :Project ;
>           :leader :KimCS ;
>           :deadline "2026-06-01"^^xsd:date ;
>           :status :InProgress .
>
> :KimCS rdf:type :Person ;
>        :role :ProjectManager ;
>        :worksAt :CompanyX .
> ```
>
> 이렇게 하면 에이전트가 **"김철수가 리드하는 진행 중인 프로젝트가 뭐야?"**라는 질문에 SPARQL로 답할 수 있습니다:
>
> ```sparql
> SELECT ?project WHERE {
>   ?project :leader :KimCS ;
>            :status :InProgress .
> }
> ```
>
> 하지만 현실적으로 **RDF/OWL은 사용자에게 보여주면 안 됩니다.** 너무 복잡합니다. 사용자는 마크다운으로 쓰고, **시스템이 자동으로 온톨로지를 추출**해야 합니다.

**Dr. Sarah Chen:**

> 정확합니다. 그리고 여기서 **LLM이 핵심 역할**을 합니다. 사용자가 마크다운으로:
>
> ```markdown
> # 프로젝트 미팅 노트
> 김철수가 프로젝트 A의 일정을 발표했다.
> 마감은 6월 1일. 현재 70% 진행.
> ```
>
> 이걸 저장하면 에이전트가 자동으로:
> 1. 엔티티 추출: 김철수(Person), 프로젝트 A(Project)
> 2. 관계 추출: 김철수 → 발표자 → 프로젝트 A
> 3. 속성 추출: 마감 6/1, 진행률 70%
> 4. Knowledge Graph에 트리플로 저장
>
> 사용자는 마크다운만 쓰면 되고, 뒤에서 온톨로지가 자동 구축됩니다.
>
> 그리고 이 Knowledge Graph가 **NanoClaw의 에이전트 메모리와 통합**됩니다. 에이전트가 "프로젝트 A 진행 상황 알려줘"라고 요청받으면, ClawNote의 Knowledge Graph를 조회해서 답합니다. 현재 NanoClaw의 `CLAUDE.md` 파일 기반 메모리보다 **구조화되고 검색 가능한 형태**입니다.

---

#### 반(Antithesis) — 단순한 마크다운 + 전문 검색

**Dr. Vannevar Kim:**

> 온톨로지에 대한 15년간의 경험에서 솔직히 말씀드리겠습니다: **온톨로지는 매력적이지만 실패 확률이 매우 높습니다.**
>
> **Semantic Web의 교훈**: W3C가 2001년부터 RDF/OWL을 밀었습니다. 25년이 지났지만 일반 사용자가 쓰는 시맨틱 웹 앱은 **사실상 없습니다.** DBpedia, Wikidata 같은 특수 프로젝트만.
>
> 왜 실패했는가:
> 1. **스키마 설계가 어렵다** — 온톨로지를 잘 설계하려면 도메인 전문가가 필요
> 2. **유지보수가 어렵다** — 현실은 계속 변하는데 스키마는 경직적
> 3. **투자 대비 효과가 불분명** — "전문 검색으로 충분한데 왜 온톨로지?"
>
> 옵시디언이 성공한 이유는 **단순함** 때문입니다. 파일 + 링크 + 전문 검색. 이게 전부. 사용자는 구조를 강제당하지 않고 자유롭게 쓸 수 있습니다.
>
> **제 제안**: 온톨로지 대신 **"LLM-powered semantic search"**
>
> ```
> 사용자: 마크다운으로 자유롭게 작성
> 저장 시: LLM이 임베딩 벡터 생성 → 벡터 DB에 저장
> 검색 시: 자연어 질의 → 벡터 유사도 검색 → 관련 노트 반환
> ```
>
> 이건 온톨로지 없이도 **"김철수 관련 프로젝트 뭐야?"**에 답할 수 있습니다. 그리고 스키마 설계나 유지보수가 불필요합니다.

---

#### 합(Synthesis)

> **"마크다운 퍼스트 + 자동 온톨로지 + 벡터 검색 하이브리드"**
>
> 사용자 경험은 옵시디언처럼 단순하게 유지하되, 뒤에서 두 가지 인덱스를 동시에 구축:
>
> ```
> 사용자가 마크다운 저장
>   ↓
> ┌─────────────────┐  ┌─────────────────┐
> │ LLM 엔티티 추출  │  │ LLM 임베딩 생성  │
> │ → 경량 트리플    │  │ → 벡터 DB       │
> │ (SQLite)        │  │ (로컬)          │
> └────────┬────────┘  └────────┬────────┘
>          │                    │
>          ▼                    ▼
>   구조화 질의             자연어 검색
>   "김철수의 프로젝트"     "최근 논의된 마감 건"
> ```
>
> - **Level 1 (MVP)**: 마크다운 + 전문 검색 + `[[링크]]` (옵시디언 호환)
> - **Level 2**: + 벡터 검색 (Ollama 임베딩, 로컬)
> - **Level 3**: + 자동 온톨로지 추출 (LLM이 트리플 생성)
>
> 핵심: **온톨로지를 사용자에게 강제하지 않는다.** 시스템이 자동으로 추출하고, 사용자는 마크다운만 쓴다.

---

## 라운드 3: 비개발자를 위한 설치 경험

### "개발을 모르는 사람이 맥미니에 어떻게 이걸 설치하나?"

---

#### 정(Thesis) — 원클릭 설치

**Alex Rivera:**

> **Homebrew + NanoClaw + ClawTalk + Ollama + 추천 도구**를 한 번에 설치하는 인스톨러를 만듭니다.
>
> ```bash
> # 이것만 복사해서 터미널에 붙여넣기
> /bin/bash -c "$(curl -fsSL https://get.claw.sh)"
> ```
>
> 인스톨러가 하는 일:
> 1. **Xcode Command Line Tools** 설치 (없으면)
> 2. **Homebrew** 설치 (없으면)
> 3. `brew install` 일괄 실행:
>    - `docker` (또는 OrbStack)
>    - `node` (fnm으로)
>    - `ollama` (로컬 LLM)
>    - `git`
> 4. **NanoClaw** 클론 + 설정
> 5. **ClawTalk** 설치 + 로컬 서버 시작
> 6. **ClawNote** 데이터 디렉토리 초기화
> 7. `launchd` 서비스 등록 (재부팅 후 자동 시작)
> 8. 브라우저 열기 → `http://localhost:3000` → 온보딩
>
> 비개발자가 해야 할 것: **터미널 열기 → 한 줄 붙여넣기 → 기다리기 → 브라우저에서 설정**
>
> 더 나아가면: **맥 앱(.dmg)으로 패키징**. 더블 클릭이면 끝.

---

#### 반(Antithesis) — 과도한 자동화의 위험

**Maria Torres:**

> 원클릭 설치는 UX는 좋지만 **보안 관점에서 악몽**입니다. `curl | sh`는 보안 커뮤니티에서 **"인터넷에서 다운받은 스크립트를 루트로 실행하는 것"**으로 비판받습니다.
>
> 더 큰 문제: Docker, Ollama, 각종 서비스가 **사용자도 모르게 설치**됩니다. 비개발자는 뭐가 설치됐는지도 모르고, 뭐가 실행 중인지도 모릅니다. "디지털 자아"의 주인이 되려면 **자기 시스템을 이해**해야 합니다.
>
> 제안: **투명한 단계별 설치**
> ```
> Step 1/5: Docker 설치 (컨테이너 실행 환경)
>   → Docker가 뭔지 한 줄 설명 + "설치할까요? [Y/n]"
> Step 2/5: Ollama 설치 (로컬 AI 모델)
>   → "AI가 맥미니에서 로컬로 실행됩니다. 데이터가 외부로 나가지 않습니다."
> Step 3/5: NanoClaw 설치 (에이전트 런타임)
>   ...
> ```
>
> 각 단계에서 **뭘 설치하는지, 왜 필요한지, 데이터가 어디에 저장되는지** 설명합니다.

**Prof. 박준형:**

> 기술 채택 곡선 관점에서 **두 트랙**이 필요합니다:
>
> 1. **Developer track**: `curl | sh` → CLI → 자유로운 커스터마이즈
> 2. **Consumer track**: `.dmg` 앱 → GUI 설치 → 가이드드 온보딩
>
> 지금은 Developer track만 만들고, Consumer track은 PMF 확인 후에.
> 초기 사용자는 어차피 개발자입니다. 비개발자를 타깃하면 개발 범위가 10배 늘어납니다.

---

#### 합(Synthesis)

> **Phase 1**: Developer track — `curl | sh` + 투명한 단계별 설치
> **Phase 2**: Consumer track — GUI 인스톨러 (.dmg) + 가이드드 온보딩
>
> 핵심 원칙: **설치 과정에서 사용자가 자기 시스템을 이해하게 한다.**

---

## 라운드 4: 디지털 자아와 메모리 통합

### "NanoClaw 메모리 + Claude Code 메모리 + ClawNote를 어떻게 통합하는가?"

---

#### 정(Thesis) — 통합 메모리 버스

**Dr. Sarah Chen:**

> 현재 메모리가 3곳에 파편화되어 있습니다:
>
> | 위치 | 형태 | 접근 주체 |
> |------|------|-----------|
> | `groups/{name}/CLAUDE.md` | NanoClaw 에이전트 메모리 | 컨테이너 에이전트 |
> | `~/.claude/memory/` | Claude Code 메모리 | Claude Code CLI |
> | `~/bhOS/` | 사용자 운영체제 | 사용자 직접 |
>
> 이걸 **하나의 Knowledge Graph**로 통합해야 합니다. 제가 제안하는 구조:
>
> ```
> ~/.claw/knowledge/
> ├── graph.db           # SQLite — 엔티티/관계 (경량 온톨로지)
> ├── vectors.db         # 벡터 DB — 임베딩 검색
> ├── notes/             # 마크다운 원본 (ClawNote)
> ├── agent-memory/      # 에이전트별 기억 (NanoClaw에서 마이그레이션)
> └── sync/
>     ├── claude-code/   # Claude Code 메모리 미러
>     └── bhOS/          # bhOS 심볼릭 링크
> ```
>
> **MCP Memory Server**: 모든 에이전트가 MCP를 통해 이 Knowledge Graph에 접근
> ```
> Agent → MCP tool: remember("프로젝트 A 마감이 6/1로 변경됨")
> Agent → MCP tool: recall("프로젝트 A 관련 정보")
> Agent → MCP tool: search("최근 변경된 마감일")
> ```

---

#### 반(Antithesis) — 과도한 통합의 위험

**Dr. Vannevar Kim:**

> 통합은 매력적이지만 **"모든 달걀을 한 바구니에"** 문제가 있습니다.
>
> 1. **마이그레이션 고통**: 기존 bhOS 구조를 Knowledge Graph로 옮기는 건 거대한 작업
> 2. **락인(lock-in)**: 모든 데이터가 `.claw/knowledge/`에 들어가면, Claw 없이는 접근 불가
> 3. **충돌**: Claude Code가 메모리를 업데이트하면서 ClawNote의 내용과 모순되면?
>
> 대안: **연합형 메모리(Federated Memory)**
> ```
> 기존 위치 그대로 유지 + 인덱스만 통합
>
> bhOS/         → 그대로
> ~/.claude/    → 그대로
> groups/       → 그대로
> ClawNote/     → 새로 생성
>
> ~/.claw/index.db → 모든 위치를 인덱싱하는 메타 레이어
> ```
>
> 파일은 원래 위치에 두고, **인덱스만 통합**합니다. 이러면 Claw 없이도 파일에 직접 접근 가능하고, 기존 워크플로우가 깨지지 않습니다.

---

#### 합(Synthesis)

> **"파일은 제자리, 인덱스로 연결"** (Federated Memory)
>
> ```
> 물리적 저장소 (변경 없음):
>   ~/bhOS/          → 기존 유지
>   ~/.claude/       → Claude Code 메모리
>   ~/nanoclaw/groups/ → NanoClaw 에이전트 메모리
>   ~/.claw/note/    → ClawNote 마크다운 (신규)
>
> 통합 인덱스 (신규):
>   ~/.claw/index/
>   ├── graph.db     → 엔티티/관계 (모든 소스에서 추출)
>   ├── vectors.db   → 임베딩 (모든 소스의 벡터)
>   ├── fts.db       → 전문 검색 인덱스
>   └── sources.json → 인덱싱 대상 디렉토리 목록
>
> MCP Memory Server → 인덱스 조회 → 원본 파일 반환
> ```

---

## 놓치고 있는 것들

### 전문가들이 지적한 6가지

**1. 디바이스 동기화 (Maria Torres)**
> 맥미니가 유일한 디바이스가 아닐 수 있습니다. 맥북, 아이폰에서도 접근해야 합니다. Local-first + 디바이스 간 동기화는 **매우 어려운 문제**입니다. Syncthing, CRDTs(Automerge/Yjs), 또는 Tailscale 기반 VPN 접근이 필요합니다.

**2. 백업/복구 전략 (Alex Rivera)**
> "디지털 자아"가 맥미니 하나에 있다면, **하드웨어 고장 = 디지털 자아 소멸**입니다. 자동 백업이 Day 1부터 필수. Time Machine + 오프사이트 백업(암호화된 외장 드라이브 또는 Backblaze B2).

**3. 버전 관리 / 시간 여행 (Dr. Vannevar Kim)**
> 디지털 자아는 **시간 축**이 있어야 합니다. "3개월 전의 내가 이 프로젝트에 대해 어떻게 생각했지?"에 답할 수 있어야 합니다. Git으로 노트를 버전 관리하거나, Event DAG(Matrix)로 변경 이력을 추적.

**4. 에이전트 간 지식 공유 범위 (Dr. Sarah Chen)**
> 스케줄 에이전트가 내 전체 Knowledge Graph에 접근해야 하나요? 에이전트별로 **지식 접근 범위를 제한**하는 정책이 필요합니다. NanoClaw의 마운트 허용 목록과 같은 개념을 Knowledge Graph에도 적용.

**5. 생태계 락인 방지 (Prof. 박준형)**
> "Claw 생태계에서만 돌아가는 디지털 자아"는 장기적으로 위험합니다. 모든 데이터는 **표준 형식**(마크다운, SQLite, JSON)으로 저장하고, 언제든 내보내기(export) 가능해야 합니다. 이것이 사용자 신뢰의 기반.

**6. 점진적 구축 순서 (Prof. 박준형)**
> 4개를 동시에 만들면 아무것도 못 만듭니다. **엄격한 우선순위**:
> ```
> 1. ClawTalk (지금 만드는 중 — 가장 구체적인 PMF 후보)
> 2. ClawNote (ClawTalk 이후 — 지식 계층이 에이전트 품질을 높임)
> 3. ClawOS (사용자 수가 늘면 — 설치 경험 자동화)
> 4. 통합 Knowledge Graph (모든 제품이 안정되면)
> ```

---

## 필요한 추가 리서치

| # | 주제 | 이유 |
|---|------|------|
| 1 | **Local-first 소프트웨어 아키텍처** | CRDTs, Automerge, Yjs — 오프라인 + 동기화 |
| 2 | **벡터 DB 로컬 구현** | ChromaDB, LanceDB, SQLite-vss — 어떤 게 맥미니에 적합한가 |
| 3 | **LLM 기반 자동 엔티티/관계 추출** | 마크다운 → 트리플 변환의 정확도와 비용 |
| 4 | **옵시디언 플러그인 생태계** | ClawNote가 옵시디언 호환이면 기존 사용자 유입 가능 |
| 5 | **macOS 앱 패키징** | Electron vs Tauri vs Swift — 비개발자용 .dmg |
| 6 | **Syncthing / Tailscale 기반 디바이스 동기화** | 맥미니 ↔ 맥북 ↔ 아이폰 |
| 7 | **에이전트 메모리 표준** | 현재 CLAUDE.md 기반 → 구조화된 형태로 전환 |

---

## 핵심 결론 3가지

### 1. bhOS가 이미 "OS 계층"이다 — 새로 만들 필요 없음
bhOS(`~/bhOS/`)는 프로젝트 관리, 컨텍스트(NOW.md), 세션 프로토콜, AI 규칙이 이미 정의된 개인 운영체제. ClawTalk/ClawNote/NanoClaw는 bhOS 위에서 돌아가는 **앱**이지, 별도 OS가 아니다.

### 2. "파일은 제자리, 인덱스로 연결" — Federated Memory
bhOS의 폴더 구조, NanoClaw의 `groups/`, Claude Code의 `~/.claude/` — 모두 원래 위치를 유지. 통합 인덱스(Knowledge Graph + 벡터)로만 연결. 마크다운과 SQLite 고수하여 락인 방지.

### 3. ClawTalk 먼저, 나머지는 순차적으로
지금은 ClawTalk에 집중. ClawNote는 ClawTalk이 안정된 후. 통합 Knowledge Index는 더 나중에. claw-lab에서 연구는 병행. **한 번에 하나씩, 각각 PMF를 확인하면서 진행.**

### 4. claw-lab이 연구 허브
`~/bhOS/03-dev/claw-lab/`에서 Claw 생태계 30+ 프로젝트를 추적/연구 중. ClawTalk 개발 중 필요한 기술 리서치는 claw-lab에 기록하고, 제품 스펙은 각 레포의 `docs/dev/`에.
