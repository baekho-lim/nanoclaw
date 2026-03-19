import { TimeSlot } from "./types.js";

// Mock 캘린더 — 실제 Google Calendar 연동은 다음 단계
const mockCalendars: Record<string, TimeSlot[]> = {};

// 기본 가용 시간 (랜덤하게 생성)
const ALL_SLOTS: TimeSlot[] = [
  { label: "수 19:00", id: "wed-19" },
  { label: "목 18:00", id: "thu-18" },
  { label: "목 20:00", id: "thu-20" },
  { label: "금 18:00", id: "fri-18" },
  { label: "금 19:30", id: "fri-1930" },
  { label: "토 12:00", id: "sat-12" },
  { label: "토 18:00", id: "sat-18" },
];

function pickRandom(arr: TimeSlot[], count: number): TimeSlot[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAvailableSlots(userId: number): TimeSlot[] {
  if (!mockCalendars[userId]) {
    // 처음 요청 시 3~5개 슬롯을 랜덤으로 할당
    mockCalendars[userId] = pickRandom(ALL_SLOTS, 3 + Math.floor(Math.random() * 3));
  }
  return mockCalendars[userId];
}

export function findCommonSlots(slotsA: TimeSlot[], slotsB: TimeSlot[]): TimeSlot[] {
  const idsB = new Set(slotsB.map((s) => s.id));
  return slotsA.filter((s) => idsB.has(s.id));
}
