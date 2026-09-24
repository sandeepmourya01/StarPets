"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { appointmentTypes, clinic, heardFromOptions, petTypes } from "@/lib/clinic";
import { addDays, allSlots, isPastSlot, isValidDateString, todayIST } from "@/lib/time";

// ---------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------

export type BookingSummary = {
  reference: string;
  ownerName: string;
  petName: string;
  service: string;
  date: string;
  time: string;
};

export type BookingResult =
  | { ok: true; summary: BookingSummary }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  const match = cleaned.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  return match ? `+91${match[1]}` : null;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function bookAppointment(formData: FormData): Promise<BookingResult> {
  // Spam trap: real people never see or fill this hidden field.
  if (text(formData, "website")) {
    return {
      ok: true,
      summary: {
        reference: "SP-000000",
        ownerName: "",
        petName: "",
        service: "",
        date: todayIST(),
        time: "10:00",
      },
    };
  }

  const ownerName = text(formData, "owner_name");
  const petName = text(formData, "pet_name");
  const petType = text(formData, "pet_type");
  const email = text(formData, "email").toLowerCase();
  const phoneRaw = text(formData, "phone");
  const service = text(formData, "service");
  const date = text(formData, "date");
  const time = text(formData, "time");
  const notes = text(formData, "notes");
  const heardFrom = text(formData, "heard_from");

  const fieldErrors: Record<string, string> = {};

  if (ownerName.length < 2 || ownerName.length > 100) fieldErrors.owner_name = "Enter your full name.";
  if (petName.length < 1 || petName.length > 60) fieldErrors.pet_name = "Enter your pet's name.";
  if (!petTypes.includes(petType)) fieldErrors.pet_type = "Choose your pet type.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    fieldErrors.email = "Enter a valid email address.";
  }
  const phone = normalizePhone(phoneRaw);
  if (!phone) fieldErrors.phone = "Enter a 10-digit Indian mobile number.";
  if (!appointmentTypes.includes(service)) fieldErrors.service = "Choose a service.";
  if (heardFrom && !heardFromOptions.includes(heardFrom)) fieldErrors.heard_from = "Choose an option from the list.";
  if (notes.length > 500) fieldErrors.notes = "Keep notes under 500 characters.";

  if (!isValidDateString(date)) {
    fieldErrors.date = "Choose a date.";
  } else if (date < todayIST() || date > addDays(todayIST(), clinic.bookingWindowDays)) {
    fieldErrors.date = `Choose a date within the next ${clinic.bookingWindowDays} days.`;
  } else if (!time) {
    fieldErrors.time = "Choose a time slot.";
  } else if (!allSlots().includes(time)) {
    fieldErrors.time = "Choose a time from the list.";
  } else if (isPastSlot(date, time)) {
    fieldErrors.time = "That time has passed. Choose a later slot.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("appointments").insert({
    id,
    user_id: user?.id ?? null,
    owner_name: ownerName,
    pet_name: petName,
    pet_type: petType,
    email,
    phone,
    service,
    appointment_date: date,
    appointment_time: time,
    notes: notes || null,
    heard_from: heardFrom || null,
  });

  if (error) {
    if (error.message.includes("SLOT_FULL")) {
      return {
        ok: false,
        message: "That time slot was just taken. Please choose another time.",
        fieldErrors: { time: "Slot no longer available." },
      };
    }
    console.error("Booking failed:", error);
    return {
      ok: false,
      message: `We could not save your booking. Please try again, or call us on ${clinic.phone}.`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/account");

  return {
    ok: true,
    summary: {
      reference: `SP-${id.slice(0, 6).toUpperCase()}`,
      ownerName,
      petName,
      service,
      date,
      time,
    },
  };
}

// ---------------------------------------------------------------------
// Sign up / log in
// ---------------------------------------------------------------------

export type AuthResult = { ok: boolean; message: string };

export async function login(formData: FormData): Promise<AuthResult> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { ok: false, message: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return { ok: false, message: "Confirm your email first. We sent you a link when you signed up." };
    }
    return { ok: false, message: "Email or password is incorrect." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  // redirect() must stay outside try/catch
  redirect(profile?.role === "admin" ? "/admin" : "/account");
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const fullName = text(formData, "full_name");
  const phoneRaw = text(formData, "phone");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (fullName.length < 2) return { ok: false, message: "Enter your full name." };
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { ok: false, message: "Enter a 10-digit Indian mobile number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (password.length < 8) return { ok: false, message: "Use a password with at least 8 characters." };

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { ok: false, message: error.message };

  if (data.session) redirect("/account");

  return {
    ok: true,
    message: "Account created. Open the confirmation link we emailed you, then log in.",
  };
}

// ---------------------------------------------------------------------
// Customer: cancel own appointment
// ---------------------------------------------------------------------

export async function cancelMyAppointment(formData: FormData): Promise<void> {
  const id = text(formData, "id");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_appointment", { appointment_id: id });
  if (error) console.error("Cancel failed:", error);

  revalidatePath("/account");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------
// Admin: change appointment status
// ---------------------------------------------------------------------

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export async function updateAppointmentStatus(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return; // Only admins may do this

  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !STATUSES.includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) console.error("Status update failed:", error);

  revalidatePath("/admin");
  revalidatePath("/account");
}
