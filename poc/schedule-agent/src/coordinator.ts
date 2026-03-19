import { ScheduleSession, TimeSlot } from "./types.js";
import { getAvailableSlots, findCommonSlots } from "./calendar.js";

type AgentMessage = {
  from: "botA" | "botB";
  to: "botA" | "botB";
  type: string;
  data?: any;
};

type OnAgentComm = (msg: AgentMessage) => void;
type OnStateChange = (session: ScheduleSession) => void;

export class Coordinator {
  private sessions = new Map<string, ScheduleSession>();
  private onAgentComm: OnAgentComm;
  private onStateChange: OnStateChange;

  constructor(onAgentComm: OnAgentComm, onStateChange: OnStateChange) {
    this.onAgentComm = onAgentComm;
    this.onStateChange = onStateChange;
  }

  createSession(
    chatId: number,
    userA: { id: number; name: string },
    userB: { id: number; name: string },
  ): ScheduleSession {
    const id = `sched-${Date.now()}`;
    const session: ScheduleSession = {
      id,
      chatId,
      state: "idle",
      userA,
      userB,
      slotsA: [],
      slotsB: [],
      commonSlots: [],
      createdAt: Date.now(),
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): ScheduleSession | undefined {
    return this.sessions.get(id);
  }

  getSessionByChat(chatId: number): ScheduleSession | undefined {
    for (const s of this.sessions.values()) {
      if (s.chatId === chatId && s.state !== "done") return s;
    }
    return undefined;
  }

  // Step 1: BotA checks user A's calendar
  async checkCalendarA(sessionId: string): Promise<TimeSlot[]> {
    const session = this.sessions.get(sessionId)!;
    session.state = "checking_a";
    this.onStateChange(session);

    // Simulate delay
    await sleep(1000);

    session.slotsA = getAvailableSlots(session.userA.id);
    return session.slotsA;
  }

  // Step 2: BotA requests BotB for available times
  async requestBotB(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)!;
    session.state = "requesting_b";
    this.onStateChange(session);

    this.onAgentComm({
      from: "botA",
      to: "botB",
      type: "schedule_request",
      data: {
        userA: session.userA.name,
        slotsA: session.slotsA.map((s) => s.label),
      },
    });

    await sleep(500);
  }

  // Step 3: BotB checks user B's calendar
  async checkCalendarB(sessionId: string): Promise<TimeSlot[]> {
    const session = this.sessions.get(sessionId)!;
    session.state = "checking_b";
    this.onStateChange(session);

    await sleep(1000);

    session.slotsB = getAvailableSlots(session.userB.id);

    this.onAgentComm({
      from: "botB",
      to: "botA",
      type: "schedule_response",
      data: {
        userB: session.userB.name,
        slotsB: session.slotsB.map((s) => s.label),
      },
    });

    return session.slotsB;
  }

  // Step 4: Negotiate common slots
  async negotiate(sessionId: string): Promise<TimeSlot[]> {
    const session = this.sessions.get(sessionId)!;
    session.state = "negotiating";
    this.onStateChange(session);

    await sleep(500);

    session.commonSlots = findCommonSlots(session.slotsA, session.slotsB);

    this.onAgentComm({
      from: "botA",
      to: "botB",
      type: "negotiation_result",
      data: {
        commonSlots: session.commonSlots.map((s) => s.label),
        count: session.commonSlots.length,
      },
    });

    session.state = "waiting_approval";
    this.onStateChange(session);

    return session.commonSlots;
  }

  // Step 5: Record user choices
  recordChoice(sessionId: string, who: "A" | "B", slotId: string): "waiting" | "confirmed" | "mismatch" {
    const session = this.sessions.get(sessionId)!;
    if (who === "A") session.choiceA = slotId;
    if (who === "B") session.choiceB = slotId;

    if (!session.choiceA || !session.choiceB) return "waiting";

    if (session.choiceA === session.choiceB) {
      session.state = "confirmed";
      this.onStateChange(session);
      return "confirmed";
    }

    return "mismatch";
  }

  finalize(sessionId: string): { slot: TimeSlot; session: ScheduleSession } | null {
    const session = this.sessions.get(sessionId)!;
    if (session.state !== "confirmed") return null;

    const slot = session.commonSlots.find((s) => s.id === session.choiceA)!;
    session.state = "done";
    this.onStateChange(session);

    return { slot, session };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
