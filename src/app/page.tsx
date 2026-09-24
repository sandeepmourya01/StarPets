import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import StarMark from "@/components/StarMark";
import { getCurrentUser } from "@/lib/auth";
import { clinic, faqs, services } from "@/lib/clinic";
import { addDays, todayIST } from "@/lib/time";

function Constellation() {
  return (
    <svg className="constellation" viewBox="0 0 600 420" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
        <polyline points="40,320 130,240 240,270 330,170 450,200 560,90" />
        <polyline points="240,270 260,370" />
        <polyline points="330,170 300,60" />
      </g>
      <g fill="currentColor">
        {[
          [40, 320, 3],
          [130, 240, 4],
          [240, 270, 5],
          [330, 170, 6],
          [450, 200, 4],
          [560, 90, 5],
          [260, 370, 3],
          [300, 60, 3],
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const minDate = todayIST();
  const maxDate = addDays(minDate, clinic.bookingWindowDays);

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <Constellation />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1>Book a vet visit for your pet in under a minute</h1>
              <p className="lead">
                {clinic.name} is a veterinary clinic in {clinic.city} for dogs, cats and exotic pets. Pick a day,
                choose a free time, and our team will call to confirm.
              </p>
              <ul className="hero-facts">
                <li>
                  <StarMark size={16} />
                  <span>Open {clinic.hoursText}</span>
                </li>
                <li>
                  <StarMark size={16} />
                  <span>Walk-ins welcome. Booking ahead means less waiting.</span>
                </li>
                <li>
                  <StarMark size={16} />
                  <span>
                    Emergency? Call <a href={`tel:${clinic.emergencyPhoneRaw}`}>{clinic.emergencyPhone}</a> instead of
                    booking online.
                  </span>
                </li>
              </ul>
            </div>

            <div className="hero-form">
              <BookingForm
                minDate={minDate}
                maxDate={maxDate}
                signedIn={Boolean(user)}
                defaults={user ? { name: user.fullName ?? "", email: user.email, phone: user.phone ?? "" } : undefined}
              />
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="wrap">
            <h2 className="section-title">What we look after</h2>
            <p className="section-lead">
              From a routine checkup to surgery, care for dogs, cats and exotic pets is available under one roof.
            </p>
            <ul className="service-list">
              {services.map((s) => (
                <li key={s.title}>
                  <span className="service-star">
                    <StarMark size={16} />
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="clinic" className="section section-tint">
          <div className="wrap split">
            <div>
              <h2 className="section-title">Our clinic in {clinic.city}</h2>
              <p>
                {clinic.name} is built around calm, careful care. Consultations, vaccinations, dental work,
                dermatology, diagnostics and surgery are handled in one place, so you do not have to travel between
                labs, pharmacies and clinics to get your pet treated.
              </p>
              <p>
                Whether you are visiting for a routine checkup, preventive care or something more urgent, our team
                explains what is happening and what it will cost before we go ahead.
              </p>
              <p>
                We welcome pet parents from across {clinic.city} and the nearby towns of Mohali and Panchkula.
              </p>
            </div>
            <div className="vet-block">
              <h3>Head vet</h3>
              <p className="vet-name">{clinic.headVet.name}</p>
              <p>{clinic.headVet.bio}</p>
              <Link href="/book" className="btn btn-navy">
                Book appointment
              </Link>
            </div>
          </div>
        </section>

        <section id="visit" className="section">
          <div className="wrap split split-map">
            <div>
              <h2 className="section-title">Visit us</h2>
              <address className="address">
                {clinic.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <dl className="contact-list">
                <div>
                  <dt>Hours</dt>
                  <dd>{clinic.hoursText}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${clinic.phoneRaw}`}>{clinic.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>
                    <a href={`https://wa.me/${clinic.whatsappRaw}`}>Send a message</a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="map-frame">
              <iframe
                title={`Map showing ${clinic.name} in ${clinic.city}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(clinic.mapQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section id="faq" className="section section-tint">
          <div className="wrap faq-wrap">
            <h2 className="section-title">Questions pet parents ask</h2>
            <div className="faq-list">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
