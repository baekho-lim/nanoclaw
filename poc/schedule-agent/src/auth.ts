/**
 * 1회용 OAuth2 인증 스크립트.
 * 실행하면 브라우저가 열리고, Google 계정으로 로그인 후 Calendar 권한을 승인하면
 * refresh token이 token.json에 저장됨.
 */
import fs from "fs";
import http from "http";
import { URL } from "url";
import { google } from "googleapis";

const CREDENTIALS_PATH = "./credentials.json";
const TOKEN_PATH = "./token.json";
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

async function authenticate() {
  const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  const { installed } = JSON.parse(content);
  const { client_id, client_secret } = installed;

  // 로컬 서버로 redirect 받기
  const redirectUri = "http://localhost:3456";

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n브라우저에서 아래 URL을 열어주세요:\n");
  console.log(authUrl);
  console.log("\n(자동으로 열리지 않으면 복사해서 붙여넣기)\n");

  // macOS에서 브라우저 자동 열기
  const { exec } = await import("child_process");
  exec(`open "${authUrl}"`);

  // 로컬 서버에서 callback 대기
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:3456`);
      const code = url.searchParams.get("code");

      if (code) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>인증 완료! 이 탭을 닫아도 됩니다.</h1>");
        server.close();
        resolve(code);
      } else {
        res.writeHead(400);
        res.end("Missing code parameter");
      }
    });

    server.listen(3456, () => {
      console.log("콜백 서버 대기 중 (port 3456)...");
    });

    server.on("error", reject);
  });

  // 코드로 토큰 교환
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // 저장
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`\n토큰 저장 완료: ${TOKEN_PATH}`);
  console.log(`refresh_token: ${tokens.refresh_token ? "있음" : "없음"}`);

  // 테스트: 캘린더 목록 조회
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const res = await calendar.calendarList.list();
  console.log(`\n캘린더 ${res.data.items?.length || 0}개 확인:`);
  for (const cal of res.data.items || []) {
    console.log(`  - ${cal.summary} (${cal.id})`);
  }

  console.log("\n인증 완료! 이제 PoC에서 Google Calendar를 사용할 수 있습니다.");
}

authenticate().catch((err) => {
  console.error("인증 실패:", err.message);
  process.exit(1);
});
