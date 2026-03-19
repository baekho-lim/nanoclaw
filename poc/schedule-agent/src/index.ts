import https from "https";
import { Bot, InlineKeyboard } from "grammy";
import { config } from "dotenv";
import { Coordinator } from "./coordinator.js";
import { ScheduleSession, TimeSlot } from "./types.js";

config({ path: ".env" });

const BOT_A_TOKEN = process.env.BOT_A_TOKEN!;
const BOT_B_TOKEN = process.env.BOT_B_TOKEN!;

if (!BOT_A_TOKEN || !BOT_B_TOKEN) {
  console.error("BOT_A_TOKEN and BOT_B_TOKEN must be set in .env");
  process.exit(1);
}

// IPv4 강제 — macOS에서 node-fetch가 IPv6로 타임아웃되는 문제 방지
const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

const botA = new Bot(BOT_A_TOKEN, {
  client: { baseFetchConfig: { agent: ipv4Agent, compress: true } },
});
const botB = new Bot(BOT_B_TOKEN, {
  client: { baseFetchConfig: { agent: ipv4Agent, compress: true } },
});

// --- Coordinator: 에이전트 간 통신 중개 ---

const coordinator = new Coordinator(
  // 에이전트 간 통신이 발생할 때 → 그룹에 투명하게 표시
  async (msg) => {
    const session = coordinator.getSession(msg.data?.sessionId || "");
    const chatId = session?.chatId;
    if (!chatId) return;

    const arrow = `${msg.from === "botA" ? "🅰️" : "🅱️"} → ${msg.to === "botA" ? "🅰️" : "🅱️"}`;
    let text = "";

    switch (msg.type) {
      case "schedule_request":
        text = `[${arrow} 에이전트 간 통신]\n요청: "${msg.data.userA}님의 가능 시간을 전달합니다"\n시간: ${msg.data.slotsA.join(", ")}`;
        break;
      case "schedule_response":
        text = `[${arrow} 에이전트 간 통신]\n응답: "${msg.data.userB}님의 가능 시간입니다"\n시간: ${msg.data.slotsB.join(", ")}`;
        break;
      case "negotiation_result":
        text = `[${arrow} 에이전트 간 통신]\n조율 결과: 공통 가능 시간 ${msg.data.count}개\n${msg.data.commonSlots.join(", ")}`;
        break;
    }

    if (text) {
      await botA.api.sendMessage(chatId, text);
    }
  },
  // 상태 변경 시 (로깅용)
  (session) => {
    console.log(`[${session.id}] 상태: ${session.state}`);
  },
);

// --- BotA: 나의 에이전트 ---

botA.command("schedule", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") {
    await ctx.reply("그룹 채팅에서 사용해주세요!");
    return;
  }

  // 이미 진행 중인 세션이 있는지 확인
  const existing = coordinator.getSessionByChat(ctx.chat.id);
  if (existing) {
    await ctx.reply("이미 진행 중인 약속 잡기가 있습니다.");
    return;
  }

  // 사용자 A = 명령을 보낸 사람
  const userA = {
    id: ctx.from!.id,
    name: ctx.from!.first_name || "사용자A",
  };

  await ctx.reply(
    `📅 *약속 잡기를 시작합니다!*\n\n` +
    `${userA.name}님의 에이전트(🅰️)가 일정을 조율합니다.\n` +
    `상대방은 이 그룹에 있는 다른 멤버입니다.\n\n` +
    `상대방을 선택해주세요 — 아무 메시지나 보내주시면 그 분으로 진행합니다.`,
    { parse_mode: "Markdown" },
  );

  // 다음 메시지를 상대방으로 인식 (간단한 구현)
  pendingPartnerSelection.set(ctx.chat.id, { userA, sessionId: "" });
});

// 상대방 선택 대기 중인 채팅
const pendingPartnerSelection = new Map<
  number,
  { userA: { id: number; name: string }; sessionId: string }
>();

botA.on("message:text", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") return;

  const pending = pendingPartnerSelection.get(ctx.chat.id);
  if (!pending) return;

  // 명령을 보낸 사람과 같으면 무시
  if (ctx.from!.id === pending.userA.id) return;

  // 상대방 확정
  const userB = {
    id: ctx.from!.id,
    name: ctx.from!.first_name || "사용자B",
  };

  pendingPartnerSelection.delete(ctx.chat.id);

  const session = coordinator.createSession(ctx.chat.id, pending.userA, userB);

  await ctx.reply(
    `✅ 상대방 확인: *${userB.name}*님\n\n` +
    `🅰️ ${pending.userA.name}의 에이전트가 캘린더를 확인합니다...`,
    { parse_mode: "Markdown" },
  );

  // === 에이전트 간 협상 시작 ===

  // Step 1: A의 캘린더 확인
  const slotsA = await coordinator.checkCalendarA(session.id);
  await botA.api.sendMessage(
    ctx.chat.id,
    `🅰️ ${pending.userA.name}님의 가능 시간 (${slotsA.length}개):\n${slotsA.map((s) => `  • ${s.label}`).join("\n")}`,
  );

  // Step 2: BotB에게 요청
  await coordinator.requestBotB(session.id);

  // Step 3: B의 캘린더 확인
  await botB.api.sendMessage(
    ctx.chat.id,
    `🅱️ ${userB.name}님의 캘린더를 확인합니다...`,
  );
  const slotsB = await coordinator.checkCalendarB(session.id);
  await botB.api.sendMessage(
    ctx.chat.id,
    `🅱️ ${userB.name}님의 가능 시간 (${slotsB.length}개):\n${slotsB.map((s) => `  • ${s.label}`).join("\n")}`,
  );

  // Step 4: 협상
  const commonSlots = await coordinator.negotiate(session.id);

  if (commonSlots.length === 0) {
    await botA.api.sendMessage(
      ctx.chat.id,
      "😅 공통 가능 시간이 없습니다. 다른 주를 시도해보세요!",
    );
    return;
  }

  // Step 5: 양쪽에 선택지 제시
  const keyboardA = new InlineKeyboard();
  for (const slot of commonSlots) {
    keyboardA.text(slot.label, `approve:${session.id}:A:${slot.id}`).row();
  }

  const keyboardB = new InlineKeyboard();
  for (const slot of commonSlots) {
    keyboardB.text(slot.label, `approve:${session.id}:B:${slot.id}`).row();
  }

  await botA.api.sendMessage(
    ctx.chat.id,
    `🅰️ *${pending.userA.name}님*, 원하는 시간을 선택해주세요:`,
    { parse_mode: "Markdown", reply_markup: keyboardA },
  );

  await botB.api.sendMessage(
    ctx.chat.id,
    `🅱️ *${userB.name}님*, 원하는 시간을 선택해주세요:`,
    { parse_mode: "Markdown", reply_markup: keyboardB },
  );
});

// --- 콜백 처리 (BotA) ---

botA.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (!data.startsWith("approve:")) return;

  const [, sessionId, who, slotId] = data.split(":");
  if (who !== "A") return;

  const session = coordinator.getSession(sessionId);
  if (!session) return;

  // 요청한 사람만 선택 가능
  if (ctx.from.id !== session.userA.id) {
    await ctx.answerCallbackQuery({ text: "본인만 선택할 수 있습니다!" });
    return;
  }

  const slot = session.commonSlots.find((s) => s.id === slotId);
  await ctx.answerCallbackQuery({ text: `${slot?.label} 선택!` });
  await ctx.editMessageText(`🅰️ ${session.userA.name}님이 *${slot?.label}*을 선택했습니다 ✓`, {
    parse_mode: "Markdown",
  });

  const result = coordinator.recordChoice(sessionId, "A", slotId);
  await handleChoiceResult(session, result);
});

// --- 콜백 처리 (BotB) ---

botB.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (!data.startsWith("approve:")) return;

  const [, sessionId, who, slotId] = data.split(":");
  if (who !== "B") return;

  const session = coordinator.getSession(sessionId);
  if (!session) return;

  if (ctx.from.id !== session.userB.id) {
    await ctx.answerCallbackQuery({ text: "본인만 선택할 수 있습니다!" });
    return;
  }

  const slot = session.commonSlots.find((s) => s.id === slotId);
  await ctx.answerCallbackQuery({ text: `${slot?.label} 선택!` });
  await ctx.editMessageText(`🅱️ ${session.userB.name}님이 *${slot?.label}*을 선택했습니다 ✓`, {
    parse_mode: "Markdown",
  });

  const result = coordinator.recordChoice(sessionId, "B", slotId);
  await handleChoiceResult(session, result);
});

// --- 선택 결과 처리 ---

async function handleChoiceResult(
  session: ScheduleSession,
  result: "waiting" | "confirmed" | "mismatch",
) {
  if (result === "waiting") return; // 아직 한쪽만 선택

  if (result === "confirmed") {
    const final = coordinator.finalize(session.id);
    if (!final) return;

    const msg =
      `🎉 *약속 확정!*\n\n` +
      `📅 *${final.slot.label}*\n` +
      `👤 ${session.userA.name} + ${session.userB.name}\n\n` +
      `양쪽 캘린더에 등록되었습니다.`;

    await botA.api.sendMessage(session.chatId, msg, { parse_mode: "Markdown" });
    return;
  }

  if (result === "mismatch") {
    const slotA = session.commonSlots.find((s) => s.id === session.choiceA);
    const slotB = session.commonSlots.find((s) => s.id === session.choiceB);

    await botA.api.sendMessage(
      session.chatId,
      `⚠️ 선택이 다릅니다!\n` +
      `${session.userA.name}: ${slotA?.label}\n` +
      `${session.userB.name}: ${slotB?.label}\n\n` +
      `다시 /schedule 로 시도해주세요.`,
    );

    // 세션 정리
    session.state = "done";
  }
}

// --- 봇 시작 ---

async function main() {
  console.log("PoC: 에이전트 간 약속 잡기 데모");
  console.log("================================\n");

  // 봇 정보 확인
  const meA = await botA.api.getMe();
  const meB = await botB.api.getMe();
  console.log(`🅰️ BotA: @${meA.username} (${meA.first_name})`);
  console.log(`🅱️ BotB: @${meB.username} (${meB.first_name})`);
  console.log(`\n그룹 채팅에서 /schedule 로 시작하세요.\n`);

  // 두 봇 동시 시작
  await Promise.all([
    botA.start({
      onStart: () => console.log("🅰️ BotA 시작됨"),
    }),
    botB.start({
      onStart: () => console.log("🅱️ BotB 시작됨"),
    }),
  ]);
}

// 종료 처리
process.on("SIGINT", () => {
  console.log("\n종료 중...");
  botA.stop();
  botB.stop();
  process.exit(0);
});

main().catch((err) => {
  console.error("시작 실패:", err);
  process.exit(1);
});
