import Link from "next/link";
import { clinic } from "@/lib/clinic";
import StarMark from "./StarMark";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-brand">
            <StarMark size={18} /> {clinic.name}, {clinic.city}
          </p>
          <p>{clinic.tagline}.</p>
        </div>

        <div>
          <h2 className="footer-title">Visit</h2>
          <p>
            {clinic.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p>{clinic.hoursText}</p>
        </div>

        <div>
          <h2 className="footer-title">Contact</h2>
          <p>
            <a href={`tel:${clinic.phoneRaw}`}>{clinic.phone}</a>
          </p>
          <p>
            <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
          </p>
          <p>
            <a href={`https://wa.me/${clinic.whatsappRaw}`}>Message on WhatsApp</a>
          </p>
        </div>

        <div>
          <h2 className="footer-title">Pages</h2>
          <p>
            <Link href="/book">Book appointment</Link>
          </p>
          <p>
            <Link href="/login">Log in</Link>
          </p>
          <p>
            <Link href="/signup">Create account</Link>
          </p>
        </div>
      </div>
      <div className="wrap footer-base">
        <p>
          &copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
