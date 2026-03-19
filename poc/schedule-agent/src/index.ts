import https from "https";
import { Bot, InlineKeyboard } from "grammy";
import { config } from "dotenv";
import { Coordinator } from "./coordinator.js";
import { createCalendarEvent } from "./calendar.js";
import { ScheduleSession } from "./types.js";

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
  async (msg) => {
    // 모든 세션에서 chatId를 찾기 위해 sessionId를 전달해야 함
    // coordinator에서 chatId를 직접 조회
    let chatId: number | undefined;
    for (const [, s] of Object.entries(activeSessions)) {
      if (s.id === msg.data?.sessionId) {
        chatId = s.chatId;
        break;
      }
    }
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
  (session) => {
    console.log(`[${session.id}] 상태: ${session.state}`);
  },
);

// 활성 세션 추적 (chatId → session)
const activeSessions: Record<string, ScheduleSession> = {};

// 상대방 선택 대기 중인 채팅
const pendingPartnerSelection = new Map<
  number,
  { userA: { id: number; name: string } }
>();

// --- BotA: /schedule 명령어 ---

botA.command("schedule", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") {
    await ctx.reply("그룹 채팅에서 사용해주세요!");
    return;
  }

  const existing = coordinator.getSessionByChat(ctx.chat.id);
  if (existing) {
    await ctx.reply("이미 진행 중인 약속 잡기가 있습니다.");
    return;
  }

  const userA = {
    id: ctx.from!.id,
    name: ctx.from!.first_name || "사용자A",
  };

  const keyboard = new InlineKeyboard().text(
    "👤 가상 친구와 테스트",
    `solo:${ctx.chat.id}`,
  );

  await ctx.reply(
    `📅 *약속 잡기를 시작합니다!*\n\n` +
      `${userA.name}님의 에이전트(🅰️)가 일정을 조율합니다.\n\n` +
      `아래 버튼을 누르면 가상의 친구와 약속을 잡습니다.`,
    { parse_mode: "Markdown", reply_markup: keyboard },
  );

  pendingPartnerSelection.set(ctx.chat.id, { userA });
});

// --- BotA: 콜백 처리 (솔로 시작 + 시간 선택) ---

botA.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;

  // 솔로 모드 시작
  if (data.startsWith("solo:")) {
    const chatId = ctx.chat!.id;
    const pending = pendingPartnerSelection.get(chatId);
    if (!pending) {
      await ctx.answerCallbackQuery({
        text: "세션이 만료되었습니다. /schedule 다시 시도하세요.",
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: "시작합니다!" });
    await ctx.editMessageText(
      "📅 *가상 친구(B)와 약속 잡기를 시작합니다!*",
      { parse_mode: "Markdown" },
    );

    const userB = { id: -1, name: "친구(가상)" };
    pendingPartnerSelection.delete(chatId);
    await startNegotiation(chatId, pending.userA, userB);
    return;
  }

  // 시간 토글 (toggle:sessionId:A:slotId)
  if (data.startsWith("toggle:")) {
    const [, sessionId, who, slotId] = data.split(":");
    if (who !== "A") return;

    const session = coordinator.getSession(sessionId);
    if (!session || session.submittedA) return;

    if (ctx.from.id !== session.userA.id) {
      await ctx.answerCallbackQuery({ text: "본인만 선택할 수 있습니다!" });
      return;
    }

    const choices = coordinator.toggleChoice(sessionId, "A", slotId);
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({
      reply_markup: buildToggleKeyboard(session, "A", choices),
    });
    return;
  }

  // 확인 제출 (submit:sessionId:A)
  if (data.startsWith("submit:")) {
    const [, sessionId, who] = data.split(":");
    if (who !== "A") return;

    const session = coordinator.getSession(sessionId);
    if (!session) return;

    if (session.choicesA.size === 0) {
      await ctx.answerCallbackQuery({ text: "최소 1개 이상 선택해주세요!" });
      return;
    }

    const selected = session.commonSlots
      .filter((s) => session.choicesA.has(s.id))
      .map((s) => s.label);
    await ctx.answerCallbackQuery({ text: "제출 완료!" });
    await ctx.editMessageText(
      `🅰️ ${session.userA.name}님 선택 완료: *${selected.join(", ")}*`,
      { parse_mode: "Markdown" },
    );

    // A 제출 완료 → B에게 A가 선택한 시간만 보여주기
    coordinator.submitChoices(sessionId, "A");

    if (session.userB.id === -1) {
      // 솔로 모드: 가상 친구는 A와 동일하게 자동 선택+제출
      for (const id of session.choicesA) {
        coordinator.toggleChoice(sessionId, "B", id);
      }
      const result = coordinator.submitChoices(sessionId, "B");
      await botB.api.sendMessage(
        session.chatId,
        `🅱️ 친구(가상)님 선택 완료: *${selected.join(", ")}*`,
        { parse_mode: "Markdown" },
      );
      await handleSubmitResult(session, result);
    } else {
      // 실제 2인: B에게 A가 선택한 시간만 보여줌
      const bSlots = session.commonSlots.filter((s) => session.choicesA.has(s.id));
      await botB.api.sendMessage(
        session.chatId,
        `🅱️ *${session.userB.name}님*, ${session.userA.name}님이 선택한 시간 중 가능한 시간을 골라주세요:`,
        {
          parse_mode: "Markdown",
          reply_markup: buildToggleKeyboard(session, "B", new Set(), bSlots),
        },
      );
    }
  }
});

// --- BotB: 콜백 처리 (시간 토글 + 제출) ---

botB.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;

  // 시간 토글
  if (data.startsWith("toggle:")) {
    const [, sessionId, who, slotId] = data.split(":");
    if (who !== "B") return;

    const session = coordinator.getSession(sessionId);
    if (!session || session.submittedB) return;

    if (session.userB.id !== -1 && ctx.from.id !== session.userB.id) {
      await ctx.answerCallbackQuery({ text: "본인만 선택할 수 있습니다!" });
      return;
    }

    const choices = coordinator.toggleChoice(sessionId, "B", slotId);
    await ctx.answerCallbackQuery();
    // B의 선택지는 A가 선택한 시간만
    const bSlots = session.commonSlots.filter((s) => session.choicesA.has(s.id));
    await ctx.editMessageReplyMarkup({
      reply_markup: buildToggleKeyboard(session, "B", choices, bSlots),
    });
    return;
  }

  // 확인 제출
  if (data.startsWith("submit:")) {
    const [, sessionId, who] = data.split(":");
    if (who !== "B") return;

    const session = coordinator.getSession(sessionId);
    if (!session) return;

    if (session.choicesB.size === 0) {
      await ctx.answerCallbackQuery({ text: "최소 1개 이상 선택해주세요!" });
      return;
    }

    const selected = session.commonSlots
      .filter((s) => session.choicesB.has(s.id))
      .map((s) => s.label);
    await ctx.answerCallbackQuery({ text: "제출 완료!" });
    await ctx.editMessageText(
      `🅱️ ${session.userB.name}님 선택 완료: *${selected.join(", ")}*`,
      { parse_mode: "Markdown" },
    );

    const result = coordinator.submitChoices(sessionId, "B");
    await handleSubmitResult(session, result);
  }
});

// --- 협상 시작 (공유 로직) ---

async function startNegotiation(
  chatId: number,
  userA: { id: number; name: string },
  userB: { id: number; name: string },
) {
  const session = coordinator.createSession(chatId, userA, userB);
  activeSessions[session.id] = session;

  await botA.api.sendMessage(
    chatId,
    `✅ 상대방: *${userB.name}*\n\n🅰️ ${userA.name}의 에이전트가 캘린더를 확인합니다...`,
    { parse_mode: "Markdown" },
  );

  // Step 1: A의 캘린더 확인
  const slotsA = await coordinator.checkCalendarA(session.id);
  await botA.api.sendMessage(
    chatId,
    `🅰️ ${userA.name}님의 가능 시간 (${slotsA.length}개):\n${slotsA.map((s) => `  • ${s.label}`).join("\n")}`,
  );

  // Step 2: BotB에게 요청
  await coordinator.requestBotB(session.id);

  // Step 3: B의 캘린더 확인
  await botB.api.sendMessage(
    chatId,
    `🅱️ ${userB.name}님의 캘린더를 확인합니다...`,
  );
  const slotsB = await coordinator.checkCalendarB(session.id);
  await botB.api.sendMessage(
    chatId,
    `🅱️ ${userB.name}님의 가능 시간 (${slotsB.length}개):\n${slotsB.map((s) => `  • ${s.label}`).join("\n")}`,
  );

  // Step 4: 협상
  const commonSlots = await coordinator.negotiate(session.id);

  if (commonSlots.length === 0) {
    await botA.api.sendMessage(
      chatId,
      "😅 공통 가능 시간이 없습니다. /schedule 로 다시 시도해보세요!",
    );
    session.state = "done";
    return;
  }

  // Step 5: A에게 먼저 복수 선택지 제시 (B는 A 제출 후에)
  await botA.api.sendMessage(
    chatId,
    `🅰️ *${userA.name}님*, 가능한 시간을 *모두* 선택한 후 확인을 눌러주세요:`,
    {
      parse_mode: "Markdown",
      reply_markup: buildToggleKeyboard(session, "A", new Set()),
    },
  );
}

// --- 토글 키보드 빌더 ---

function buildToggleKeyboard(
  session: ScheduleSession,
  who: "A" | "B",
  selected: Set<string>,
  slots?: import("./types.js").TimeSlot[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const slotList = slots || session.commonSlots;

  for (const slot of slotList) {
    const check = selected.has(slot.id) ? "✅" : "⬜";
    keyboard.text(`${check} ${slot.label}`, `toggle:${session.id}:${who}:${slot.id}`).row();
  }
  keyboard.text("📌 확인", `submit:${session.id}:${who}`).row();

  return keyboard;
}

// --- 제출 결과 처리 ---

async function handleSubmitResult(
  session: ScheduleSession,
  result: "waiting" | "confirmed" | "no_overlap",
) {
  if (result === "waiting") return;

  if (result === "confirmed") {
    const final = coordinator.finalize(session.id);
    if (!final) return;

    const timeList = final.slots.map((s) => s.label).join(", ");

    // 실제 Google Calendar에 이벤트 생성
    let calendarLink = "";
    try {
      const firstSlot = final.slots[0];
      const summary = `${session.userA.name} + ${session.userB.name} 저녁 약속`;
      calendarLink = await createCalendarEvent(firstSlot, summary);
      console.log(`캘린더 이벤트 생성됨: ${calendarLink}`);
    } catch (err) {
      console.error("캘린더 이벤트 생성 실패:", err);
    }

    let msg =
      `🎉 *약속 확정!*\n\n` +
      `📅 *${timeList}*\n` +
      `👤 ${session.userA.name} + ${session.userB.name}\n\n`;

    if (calendarLink) {
      msg += `✅ Google Calendar에 등록 완료!\n${calendarLink}`;
    } else {
      msg += `⚠️ 캘린더 등록은 수동으로 해주세요.`;
    }

    await botA.api.sendMessage(session.chatId, msg, { parse_mode: "Markdown" });
    delete activeSessions[session.id];
    return;
  }

  if (result === "no_overlap") {
    await botA.api.sendMessage(
      session.chatId,
      `⚠️ 양쪽 선택에 겹치는 시간이 없습니다.\n/schedule 로 다시 시도해주세요.`,
    );
    session.state = "done";
    delete activeSessions[session.id];
  }
}

// --- 봇 시작 ---

async function main() {
  console.log("PoC: 에이전트 간 약속 잡기 데모");
  console.log("================================\n");

  const meA = await botA.api.getMe();
  const meB = await botB.api.getMe();
  console.log(`🅰️ BotA: @${meA.username} (${meA.first_name})`);
  console.log(`🅱️ BotB: @${meB.username} (${meB.first_name})`);
  console.log(`\n그룹 채팅에서 /schedule 로 시작하세요.\n`);

  await Promise.all([
    botA.start({ onStart: () => console.log("🅰️ BotA 시작됨") }),
    botB.start({ onStart: () => console.log("🅱️ BotB 시작됨") }),
  ]);
}

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
