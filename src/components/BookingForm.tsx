"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { bookAppointment, type BookingResult, type BookingSummary } from "@/app/actions";
import { appointmentTypes, clinic, heardFromOptions, petTypes } from "@/lib/clinic";
import { formatDateLong, formatTime12 } from "@/lib/time";

type Slot = { time: string; label: string; available: boolean };

type Props = {
  minDate: string;
  maxDate: string;
  defaults?: { name?: string; email?: string; phone?: string };
  signedIn?: boolean;
  /** Use an h1 for the form title (on the dedicated /book page) */
  asPageTitle?: boolean;
};

export default function BookingForm({ minDate, maxDate, defaults, signedIn, asPageTitle }: Props) {
  const Title = asPageTitle ? "h1" : "h2";
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [result, setResult] = useState<BookingResult | null>(null);
  const [done, setDone] = useState<BookingSummary | null>(null);
  const [pending, startTransition] = useTransition();

  // Load the free time slots whenever the date changes.
  useEffect(() => {
    if (!date) {
      setSlots(null);
      return;
    }
    const controller = new AbortController();
    setLoadingSlots(true);
    setSlotError("");
    setTime("");

    fetch(`/api/slots?date=${date}`, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((json) => setSlots(json.slots as Slot[]))
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setSlots(null);
        setSlotError("We could not load the times. Choose the date again to retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSlots(false);
      });

    return () => controller.abort();
  }, [date, refreshKey]);

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const formError = result && !result.ok ? result.message : "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("date", date);
    formData.set("time", time);

    startTransition(async () => {
      const res = await bookAppointment(formData);
      if (res.ok) {
        setDone(res.summary);
        setResult(null);
      } else {
        setResult(res);
        if (res.fieldErrors?.time) {
          setTime("");
          setRefreshKey((k) => k + 1); // reload slots so the taken one disappears
        }
      }
    });
  }

  function reset() {
    setDone(null);
    setResult(null);
    setDate("");
    setTime("");
    setSlots(null);
  }

  if (done) {
    return (
      <div className="booking-done" role="status">
        <h2>Booking received</h2>
        <p className="booking-ref">
          Reference <strong>{done.reference}</strong>
        </p>
        <dl className="summary">
          <div>
            <dt>Pet</dt>
            <dd>{done.petName}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{done.service}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDateLong(done.date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{formatTime12(done.time)}</dd>
          </div>
        </dl>
        <p>
          Our team will call you to confirm this appointment. If your plans change, call us on{" "}
          <a href={`tel:${clinic.phoneRaw}`}>{clinic.phone}</a>.
        </p>
        {!signedIn && (
          <p className="muted">
            Want to see and cancel your bookings online? <Link href="/signup">Create an account</Link> before your next booking.
          </p>
        )}
        <button type="button" className="btn btn-outline" onClick={reset}>
          Book another appointment
        </button>
      </div>
    );
  }

  const noneFree = slots !== null && slots.every((s) => !s.available);

  return (
    <form onSubmit={onSubmit} className="booking-form" noValidate={false}>
      <Title>Book an appointment</Title>
      <p className="muted form-intro">
        Share a few details and pick a time. Our team will call to confirm your visit to {clinic.name}, {clinic.city}.
      </p>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="field-row">
        <Field label="Your name" name="owner_name" error={fieldErrors.owner_name}>
          <input
            id="owner_name"
            name="owner_name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={defaults?.name ?? ""}
            aria-invalid={Boolean(fieldErrors.owner_name)}
          />
        </Field>
        <Field label="Mobile number" name="phone" error={fieldErrors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="98765 43210"
            defaultValue={defaults?.phone ?? ""}
            aria-invalid={Boolean(fieldErrors.phone)}
          />
        </Field>
      </div>

      <Field label="Email" name="email" error={fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          defaultValue={defaults?.email ?? ""}
          aria-invalid={Boolean(fieldErrors.email)}
        />
      </Field>

      <div className="field-row">
        <Field label="Pet's name" name="pet_name" error={fieldErrors.pet_name}>
          <input
            id="pet_name"
            name="pet_name"
            type="text"
            required
            maxLength={60}
            aria-invalid={Boolean(fieldErrors.pet_name)}
          />
        </Field>
        <Field label="Pet type" name="pet_type" error={fieldErrors.pet_type}>
          <select id="pet_type" name="pet_type" required defaultValue="Dog">
            {petTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="What does your pet need?" name="service" error={fieldErrors.service}>
        <select id="service" name="service" required defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          {appointmentTypes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Date" name="date" error={fieldErrors.date}>
        <input
          id="date"
          name="date"
          type="date"
          required
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={Boolean(fieldErrors.date)}
        />
      </Field>

      <fieldset className="slots" aria-describedby={fieldErrors.time ? "time-error" : undefined}>
        <legend>Time</legend>
        {!date && <p className="muted">Choose a date to see the available times.</p>}
        {date && loadingSlots && <p className="muted">Loading times&hellip;</p>}
        {slotError && <p className="field-error">{slotError}</p>}
        {date && !loadingSlots && noneFree && (
          <p className="muted">No times are left on this day. Try another date.</p>
        )}
        {date && !loadingSlots && slots && !noneFree && (
          <div className="slot-grid">
            {slots.map((s) => (
              <label key={s.time} className={`slot${s.available ? "" : " slot-off"}`}>
                <input
                  type="radio"
                  name="time"
                  value={s.time}
                  checked={time === s.time}
                  disabled={!s.available}
                  onChange={() => setTime(s.time)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        )}
        {fieldErrors.time && (
          <p className="field-error" id="time-error">
            {fieldErrors.time}
          </p>
        )}
      </fieldset>

      <Field label="Anything we should know? (optional)" name="notes" error={fieldErrors.notes}>
        <textarea id="notes" name="notes" rows={2} maxLength={500} placeholder="Symptoms, age, past treatment…" />
      </Field>

      <Field label="How did you hear about us? (optional)" name="heard_from" error={fieldErrors.heard_from}>
        <select id="heard_from" name="heard_from" defaultValue="">
          <option value="">Select</option>
          {heardFromOptions.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </Field>

      {/* Spam trap: hidden from people, bots fill it in */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" className="btn btn-navy btn-block" disabled={pending}>
        {pending ? "Booking…" : "Book appointment"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`field${error ? " field-invalid" : ""}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
