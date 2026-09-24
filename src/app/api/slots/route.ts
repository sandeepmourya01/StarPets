import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clinic } from "@/lib/clinic";
import { addDays, allSlots, formatTime12, isPastSlot, isValidDateString, todayIST } from "@/lib/time";

export const dynamic = "force-dynamic";

// GET /api/slots?date=2026-09-21  ->  which time slots are free that day
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";

  if (!isValidDateString(date) || date < todayIST() || date > addDays(todayIST(), clinic.bookingWindowDays)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_slot_counts", { day: date });

  if (error) {
    console.error("Slot lookup failed:", error);
    return NextResponse.json({ error: "Could not load slots" }, { status: 500 });
  }

  const booked = new Map<string, number>();
  for (const row of (data ?? []) as { slot_time: string; booked: number }[]) {
    booked.set(row.slot_time.slice(0, 5), Number(row.booked));
  }

  const slots = allSlots().map((time) => ({
    time,
    label: formatTime12(time),
    available: !isPastSlot(date, time) && (booked.get(time) ?? 0) < clinic.slotCapacity,
  }));

  return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
}
