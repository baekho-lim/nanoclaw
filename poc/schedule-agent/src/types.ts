export interface TimeSlot {
  label: string; // "금 18:00"
  id: string; // "fri-18"
}

export type SessionState =
  | "idle"
  | "checking_a"
  | "requesting_b"
  | "checking_b"
  | "negotiating"
  | "waiting_approval"
  | "confirmed"
  | "done";

export interface ScheduleSession {
  id: string;
  chatId: number;
  state: SessionState;
  userA: { id: number; name: string };
  userB: { id: number; name: string };
  slotsA: TimeSlot[];
  slotsB: TimeSlot[];
  commonSlots: TimeSlot[];
  choiceA?: string; // slot id
  choiceB?: string; // slot id
  createdAt: number;
}
