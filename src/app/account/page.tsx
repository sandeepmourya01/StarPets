import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { cancelMyAppointment } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateLong, formatTime12, todayIST } from "@/lib/time";
import type { Appointment } from "@/lib/types";

export const metadata: Metadata = { title: "My appointments" };

function AppointmentItem({ a, canCancel }: { a: Appointment; canCancel: boolean }) {
  return (
    <li className="appt">
      <div className="appt-when">
        <strong>{formatDateLong(a.appointment_date)}</strong>
        <span>{formatTime12(a.appointment_time)}</span>
      </div>
      <div className="appt-what">
        <strong>
          {a.pet_name} <span className="muted">({a.pet_type})</span>
        </strong>
        <span>{a.service}</span>
      </div>
      <div className="appt-status">
        <StatusBadge status={a.status} />
      </div>
      <div className="appt-action">
        {canCancel && (
          <form action={cancelMyAppointment}>
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" className="btn btn-outline btn-small">
              Cancel
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", user.id)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  const all = (data ?? []) as Appointment[];
  const today = todayIST();
  const isActive = (a: Appointment) =>
    a.appointment_date >= today && (a.status === "pending" || a.status === "confirmed");

  const upcoming = all.filter(isActive).reverse(); // soonest first
  const past = all.filter((a) => !isActive(a));

  return (
    <>
      <Header />
      <main className="page-narrow">
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>My appointments</h1>
              <p className="muted">Signed in as {user.email}</p>
            </div>
            <Link href="/book" className="btn btn-navy">
              Book appointment
            </Link>
          </div>

          {error && (
            <p className="form-error" role="alert">
              We could not load your appointments. Refresh the page to try again.
            </p>
          )}

          <h2 className="list-title">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="empty">
              You have no upcoming appointments. <Link href="/book">Book one now</Link>.
            </p>
          ) : (
            <ul className="appt-list">
              {upcoming.map((a) => (
                <AppointmentItem key={a.id} a={a} canCancel />
              ))}
            </ul>
          )}

          <h2 className="list-title">Past and cancelled</h2>
          {past.length === 0 ? (
            <p className="empty">Nothing here yet.</p>
          ) : (
            <ul className="appt-list">
              {past.map((a) => (
                <AppointmentItem key={a.id} a={a} canCancel={false} />
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
