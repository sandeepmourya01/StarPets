import Link from "next/link";
import { clinic } from "@/lib/clinic";
import { getCurrentUser } from "@/lib/auth";
import StarMark from "./StarMark";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar-inner">
          <span>Emergency? Call us now on</span>
          <a href={`tel:${clinic.emergencyPhoneRaw}`}>{clinic.emergencyPhone}</a>
        </div>
      </div>

      <header className="site-header">
        <div className="wrap header-inner">
          <Link href="/" className="brand" aria-label={`${clinic.name} ${clinic.city}, home`}>
            <span className="brand-mark">
              <StarMark size={22} />
            </span>
            <span className="brand-text">
              <strong>{clinic.name}</strong>
              <small>{clinic.city}</small>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            <Link href="/#services">Services</Link>
            <Link href="/#clinic">Our clinic</Link>
            <Link href="/#visit">Visit us</Link>
            <Link href="/#faq">FAQ</Link>
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/account"} className="text-link">
                  {user.role === "admin" ? "Admin dashboard" : "My appointments"}
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-link">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="text-link">
                Log in
              </Link>
            )}
            <Link href="/book" className="btn btn-gold btn-small">
              Book<span className="hide-xs"> appointment</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
