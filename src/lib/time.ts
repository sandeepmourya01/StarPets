import { clinic } from "./clinic";

// All clinic times are Indian Standard Time, whatever timezone the server runs in.
const TZ = "Asia/Kolkata";

/** Today's date in India as YYYY-MM-DD */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Minutes since midnight right now in India */
export function nowMinutesIST(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** Every bookable slot in a day, e.g. ["10:00", "10:30", ... "19:30"] */
export function allSlots(): string[] {
  const slots: string[] = [];
  const end = toMinutes(clinic.closeTime);
  for (let t = toMinutes(clinic.openTime); t + clinic.slotMinutes <= end; t += clinic.slotMinutes) {
    slots.push(fromMinutes(t));
  }
  return slots;
}

/** Is this slot too soon to book? (Today only: must be at least 30 minutes away.) */
export function isPastSlot(date: string, slot: string): boolean {
  if (date < todayIST()) return true;
  if (date > todayIST()) return false;
  return toMinutes(slot) < nowMinutesIST() + 30;
}

export function isValidDateString(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const parsed = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === d;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "14:30" or "14:30:00" -> "2:30 PM" */
export function formatTime12(t: string): string {
  const [hh, mm] = t.split(":").map(Number);
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

/** "2026-09-21" -> "Mon, 21 Sep 2026" */
export function formatDateLong(d: string): string {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
