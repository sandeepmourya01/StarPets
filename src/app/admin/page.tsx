import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { updateAppointmentStatus } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addDays, formatDateLong, formatTime12, todayIST } from "@/lib/time";
import type { Appointment } from "@/lib/types";

export const metadata: Metadata = { title: "Admin dashboard" };

type Search = { status?: string; range?: string; q?: string };

const STATUS_OPTIONS = [
  ["all", "All statuses"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

const RANGE_OPTIONS = [
  ["upcoming", "Today and later"],
  ["today", "Today only"],
  ["past", "Past"],
  ["all", "All dates"],
];

function StatusButton({ id, status, label, tone }: { id: string; status: string; label: string; tone: string }) {
  return (
    <form action={updateAppointmentStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`btn btn-small ${tone}`}>
        {label}
      </button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="page-narrow">
          <div className="wrap">
            <h1>This page is for the Star Pets team</h1>
            <p>Your account does not have admin access. Ask the clinic owner to give you access.</p>
            <Link href="/account" className="btn btn-navy">
              Go to My appointments
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const params = await searchParams;
  const status = STATUS_OPTIONS.some(([v]) => v === params.status) ? (params.status as string) : "all";
  const range = RANGE_OPTIONS.some(([v]) => v === params.range) ? (params.range as string) : "upcoming";
  const q = (params.q ?? "").replace(/[,()%*\\]/g, "").trim().slice(0, 60);

  const supabase = await createClient();
  const today = todayIST();
  const weekEnd = addDays(today, 7);

  let query = supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: range !== "past" })
    .order("appointment_time", { ascending: range !== "past" })
    .limit(300);

  if (status !== "all") query = query.eq("status", status);
  if (range === "today") query = query.eq("appointment_date", today);
  if (range === "upcoming") query = query.gte("appointment_date", today);
  if (range === "past") query = query.lt("appointment_date", today);
  if (q) query = query.or(`owner_name.ilike.%${q}%,pet_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);

  const [list, todayCount, pendingCount, weekCount, totalCount] = await Promise.all([
    query,
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("appointment_date", today)
      .neq("status", "cancelled"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("appointment_date", today)
      .lte("appointment_date", weekEnd)
      .in("status", ["pending", "confirmed"]),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
  ]);

  const rows = (list.data ?? []) as Appointment[];

  return (
    <>
      <Header />
      <main className="admin">
        <div className="wrap-wide">
          <div className="page-head">
            <div>
              <h1>Appointments</h1>
              <p className="muted">Signed in as {user.email}. Times are Indian Standard Time.</p>
            </div>
          </div>

          <dl className="stats">
            <div>
              <dt>Today</dt>
              <dd>{todayCount.count ?? 0}</dd>
            </div>
            <div>
              <dt>Waiting for confirmation</dt>
              <dd>{pendingCount.count ?? 0}</dd>
            </div>
            <div>
              <dt>Next 7 days</dt>
              <dd>{weekCount.count ?? 0}</dd>
            </div>
            <div>
              <dt>All bookings</dt>
              <dd>{totalCount.count ?? 0}</dd>
            </div>
          </dl>

          <form className="filters" method="get">
            <div className="field">
              <label htmlFor="range">Dates</label>
              <select id="range" name="range" defaultValue={range}>
                {RANGE_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={status}>
                {STATUS_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field-grow">
              <label htmlFor="q">Search</label>
              <input id="q" name="q" type="search" defaultValue={q} placeholder="Owner, pet, phone or email" />
            </div>
            <button type="submit" className="btn btn-navy">
              Apply filters
            </button>
            <Link href="/admin" className="btn btn-outline">
              Clear
            </Link>
          </form>

          {list.error && (
            <p className="form-error" role="alert">
              Could not load appointments. Check that the database setup was run and refresh the page.
            </p>
          )}

          {rows.length === 0 ? (
            <p className="empty">No appointments match these filters.</p>
          ) : (
            <div className="table-scroll">
              <table className="appt-table">
                <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">Pet and owner</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Service</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{formatDateLong(a.appointment_date)}</strong>
                        <span className="block">{formatTime12(a.appointment_time)}</span>
                      </td>
                      <td>
                        <strong>{a.pet_name}</strong> <span className="muted">({a.pet_type})</span>
                        <span className="block">{a.owner_name}</span>
                      </td>
                      <td>
                        <a href={`tel:${a.phone}`}>{a.phone}</a>
                        <span className="block">
                          <a href={`mailto:${a.email}`}>{a.email}</a>
                        </span>
                      </td>
                      <td>
                        {a.service}
                        {a.notes && <span className="block note">{a.notes}</span>}
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td>
                        <div className="row-actions">
                          {a.status === "pending" && (
                            <>
                              <StatusButton id={a.id} status="confirmed" label="Confirm" tone="btn-navy" />
                              <StatusButton id={a.id} status="cancelled" label="Cancel" tone="btn-outline" />
                            </>
                          )}
                          {a.status === "confirmed" && (
                            <>
                              <StatusButton id={a.id} status="completed" label="Mark completed" tone="btn-navy" />
                              <StatusButton id={a.id} status="cancelled" label="Cancel" tone="btn-outline" />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {rows.length === 300 && <p className="muted">Showing the first 300 results. Use the filters to narrow down.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
