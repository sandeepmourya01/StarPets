import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { getCurrentUser } from "@/lib/auth";
import { clinic } from "@/lib/clinic";
import { addDays, todayIST } from "@/lib/time";

export const metadata: Metadata = { title: "Book an appointment" };

export default async function BookPage() {
  const user = await getCurrentUser();
  const minDate = todayIST();
  const maxDate = addDays(minDate, clinic.bookingWindowDays);

  return (
    <>
      <Header />
      <main className="page-narrow">
        <div className="wrap book-layout">
          <div className="book-card">
            <BookingForm
              asPageTitle
              minDate={minDate}
              maxDate={maxDate}
              signedIn={Boolean(user)}
              defaults={user ? { name: user.fullName ?? "", email: user.email, phone: user.phone ?? "" } : undefined}
            />
          </div>
          <aside className="book-aside">
            <h2>Before you book</h2>
            <p>{clinic.name} is open {clinic.hoursText}.</p>
            <p>
              Bookings show as <strong>Pending</strong> until our team calls you to confirm them.
            </p>
            <p>
              <strong>Emergency?</strong> Call <a href={`tel:${clinic.emergencyPhoneRaw}`}>{clinic.emergencyPhone}</a>{" "}
              straight away.
            </p>
            <p>
              {clinic.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
