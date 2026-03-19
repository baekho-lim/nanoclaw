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
      choicesA: new Set(),
      choicesB: new Set(),
      submittedA: false,
      submittedB: false,
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

  // Step 1: BotA checks user A's calendar (실제 Google Calendar API)
  async checkCalendarA(sessionId: string): Promise<TimeSlot[]> {
    const session = this.sessions.get(sessionId)!;
    session.state = "checking_a";
    this.onStateChange(session);

    session.slotsA = await getAvailableSlots("primary");
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
        sessionId: sessionId,
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

    // 솔로 모드(-1)이면 A의 슬롯 기반으로 생성, 아니면 실제 캘린더 조회
    if (session.userB.id === -1) {
      // 가상 친구: A의 슬롯 중 70%를 랜덤으로 포함
      const shuffled = [...session.slotsA].sort(() => Math.random() - 0.5);
      const count = Math.max(2, Math.floor(shuffled.length * 0.7));
      session.slotsB = shuffled.slice(0, count);
    } else {
      session.slotsB = await getAvailableSlots("primary");
    }

    this.onAgentComm({
      from: "botB",
      to: "botA",
      type: "schedule_response",
      data: {
        sessionId: sessionId,
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
        sessionId: sessionId,
        commonSlots: session.commonSlots.map((s) => s.label),
        count: session.commonSlots.length,
      },
    });

    session.state = "waiting_approval";
    this.onStateChange(session);

    return session.commonSlots;
  }

  // 토글: 슬롯 선택/해제
  toggleChoice(sessionId: string, who: "A" | "B", slotId: string): Set<string> {
    const session = this.sessions.get(sessionId)!;
    const choices = who === "A" ? session.choicesA : session.choicesB;
    if (choices.has(slotId)) {
      choices.delete(slotId);
    } else {
      choices.add(slotId);
    }
    return choices;
  }

  // 확인 제출
  submitChoices(sessionId: string, who: "A" | "B"): "waiting" | "confirmed" | "no_overlap" {
    const session = this.sessions.get(sessionId)!;
    if (who === "A") session.submittedA = true;
    if (who === "B") session.submittedB = true;

    if (!session.submittedA || !session.submittedB) return "waiting";

    // 양쪽 선택의 교집합
    const overlap = [...session.choicesA].filter((id) => session.choicesB.has(id));
    if (overlap.length === 0) return "no_overlap";

    session.state = "confirmed";
    this.onStateChange(session);
    return "confirmed";
  }

  // 양쪽 선택의 교집합에서 최종 확정 시간 반환
  finalize(sessionId: string): { slots: TimeSlot[]; session: ScheduleSession } | null {
    const session = this.sessions.get(sessionId)!;
    if (session.state !== "confirmed") return null;

    const overlap = [...session.choicesA].filter((id) => session.choicesB.has(id));
    const slots = session.commonSlots.filter((s) => overlap.includes(s.id));
    session.state = "done";
    this.onStateChange(session);

    return { slots, session };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
