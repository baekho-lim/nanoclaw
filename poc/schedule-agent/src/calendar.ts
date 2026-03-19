import fs from "fs";
import { google, calendar_v3 } from "googleapis";
import { TimeSlot } from "./types.js";

const CREDENTIALS_PATH = "./credentials.json";
const TOKEN_PATH = "./token.json";

let calendarClient: calendar_v3.Calendar | null = null;

function getAuthClient() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_id, client_secret } = creds.installed;
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));

  const oauth2 = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3456",
  );
  oauth2.setCredentials(tokens);
  return oauth2;
}

function getCalendar(): calendar_v3.Calendar {
  if (!calendarClient) {
    calendarClient = google.calendar({ version: "v3", auth: getAuthClient() });
  }
  return calendarClient;
}

/**
 * 실제 Google Calendar에서 빈 시간을 조회.
 * 이번 주 남은 기간의 18:00~21:00 사이 1시간 슬롯을 반환.
 */
export async function getAvailableSlots(
  calendarId: string = "primary",
  referenceSlots?: TimeSlot[],
): Promise<TimeSlot[]> {
  const calendar = getCalendar();
  const now = new Date();

  // 오늘부터 7일 후까지
  const timeMin = new Date(now);
  timeMin.setHours(0, 0, 0, 0);
  const timeMax = new Date(now);
  timeMax.setDate(timeMax.getDate() + 7);
  timeMax.setHours(23, 59, 59, 999);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: "Asia/Seoul",
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy || [];

  // 바쁜 시간대 Set 생성 (시간 단위)
  const busySet = new Set<string>();
  for (const b of busy) {
    const start = new Date(b.start!);
    const end = new Date(b.end!);
    // 1시간 단위로 바쁜 시간 마크
    const cursor = new Date(start);
    while (cursor < end) {
      busySet.add(cursor.toISOString().slice(0, 13)); // "2026-03-20T18" 형태
      cursor.setHours(cursor.getHours() + 1);
    }
  }

  // 저녁 시간대(18:00~21:00) 중 비어있는 슬롯 생성
  const slots: TimeSlot[] = [];
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  for (let d = 0; d < 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);

    // 오늘이면 현재 시간 이후만
    for (const hour of [18, 19, 20]) {
      date.setHours(hour, 0, 0, 0);
      if (date <= now) continue;

      const key = date.toISOString().slice(0, 13);
      if (!busySet.has(key)) {
        const dayName = days[date.getDay()];
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        slots.push({
          label: `${dayName} ${dateStr} ${hour}:00`,
          id: `${date.toISOString().slice(0, 10)}-${hour}`,
        });
      }
    }
  }

  return slots;
}

/**
 * Google Calendar에 이벤트 생성.
 */
export async function createCalendarEvent(
  slot: TimeSlot,
  summary: string,
  attendeeEmail?: string,
  calendarId: string = "primary",
): Promise<string> {
  const calendar = getCalendar();

  // slot.id: "2026-03-22-18" → dateTime 파싱
  const [datePart, hourStr] = [
    slot.id.slice(0, 10),
    slot.id.split("-").pop()!,
  ];
  const hour = parseInt(hourStr);

  const startTime = `${datePart}T${hour.toString().padStart(2, "0")}:00:00+09:00`;
  const endHour = hour + 1;
  const endTime = `${datePart}T${endHour.toString().padStart(2, "0")}:00:00+09:00`;

  const event: calendar_v3.Schema$Event = {
    summary,
    start: { dateTime: startTime, timeZone: "Asia/Seoul" },
    end: { dateTime: endTime, timeZone: "Asia/Seoul" },
  };

  if (attendeeEmail) {
    event.attendees = [{ email: attendeeEmail }];
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: "none",
  });

  return res.data.htmlLink || "이벤트 생성됨";
}

export function findCommonSlots(
  slotsA: TimeSlot[],
  slotsB: TimeSlot[],
): TimeSlot[] {
  const idsB = new Set(slotsB.map((s) => s.id));
  return slotsA.filter((s) => idsB.has(s.id));
}
