# Telegram 채널 설치 트러블슈팅

## 증상

`npm run build` 및 서비스 시작 후 텔레그램 봇이 연결되지 않음.
로그가 "Credential proxy started"에서 멈추고, "Telegram bot connected"가 나타나지 않음.
봇 토큰은 유효함 (`curl`로 `getMe` 호출 시 정상 응답).

## 원인

**grammy가 내부적으로 `node-fetch`를 사용하며, `node-fetch`가 IPv6 주소로 연결을 시도함.**

Telegram API(`api.telegram.org`)는 IPv4/IPv6 모두 지원하지만, 일부 macOS 네트워크 환경(특히 IPv6 라우팅이 불완전한 경우)에서는 IPv6 연결이 `ETIMEDOUT`으로 실패함. `curl`과 Node.js의 `https.request`는 IPv4로 폴백하지만, `node-fetch`는 폴백하지 않고 타임아웃까지 대기함.

### 진단 과정

```bash
# curl은 됨
curl -s "https://api.telegram.org/bot<TOKEN>/getMe"  # → ok: true

# Node.js 내장 https.request도 됨
node -e "require('https').get('https://api.telegram.org/...', ...)"  # → 200 OK

# node-fetch는 실패
node -e "require('node-fetch')('https://api.telegram.org/...')"  # → ETIMEDOUT

# IPv4 강제 시 node-fetch 성공
node -e "
const fetch = require('node-fetch');
const https = require('https');
fetch(url, { agent: new https.Agent({ family: 4 }) })
"  # → ok: true
```

## 해결책

`src/channels/telegram.ts`에서 Bot 생성 시 `https.Agent({ family: 4 })`로 IPv4를 강제:

```typescript
// 수정 전
this.bot = new Bot(this.botToken, {
  client: {
    baseFetchConfig: { agent: https.globalAgent, compress: true },
  },
});

// 수정 후
const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });
this.bot = new Bot(this.botToken, {
  client: {
    baseFetchConfig: { agent: ipv4Agent, compress: true },
  },
});
```

## 기타 주의사항

### 봇 토큰 충돌
텔레그램은 하나의 토큰에 동시 연결 1개만 허용함. 다른 기기(예: MacBook의 OpenClaw)가 같은 토큰으로 실행 중이면 연결이 경쟁 상태가 됨. 기존 기기를 종료하거나 새 봇을 만들어야 함.

### 서비스 등록 순서
채팅 등록(`setup --step register`)은 SQLite에 기록되지만 실행 중인 프로세스에 자동 반영되지 않음. 등록 후 서비스를 재시작해야 새 그룹이 인식됨.

### launchd 서비스 관리
macOS launchd 환경에서 서비스가 실행 중일 때 별도로 `node dist/index.js &`를 실행하면 포트 3001 충돌이 발생함. 서비스 재시작은 반드시 `launchctl kickstart -k gui/$(id -u)/com.nanoclaw`로 할 것.
