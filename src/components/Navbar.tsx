import Link from "next/link";
import { cookies } from "next/headers";
import MobileNav from "./MobileNav";

export default async function Navbar() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("student_auth")?.value;
  const studentName = cookieStore.get("student_name")?.value;
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  const isLoggedIn = !!studentId || isAdmin;

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <svg width="44" height="44" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.75rem" }}>
            <path d="M 20 60 A 40 40 0 0 1 100 60" stroke="var(--primary)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 100 60 A 40 40 0 0 1 20 60" stroke="var(--secondary)" strokeWidth="12" strokeLinecap="round" />
            <text x="26" y="84" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="64" letterSpacing="-4" fill="var(--secondary)">S</text>
            <text x="56" y="84" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="64" fill="var(--primary)">V</text>
            <circle cx="100" cy="60" r="14" fill="var(--bg-color)" stroke="var(--secondary)" strokeWidth="6" />
            <circle cx="100" cy="60" r="5" fill="var(--primary)" />
          </svg>
          <span style={{ fontWeight: 900, fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", lineHeight: 1, display: "inline-flex", alignItems: "baseline" }}>
            <span style={{ color: "var(--secondary)", fontSize: "1.5rem" }}>S</span>
            <span className="logo-text-extra" style={{ color: "var(--secondary)", fontSize: "0.85rem" }}>ENSO</span>
            <span style={{ color: "var(--primary)", fontSize: "1.5rem" }}>V</span>
            <span className="logo-text-extra" style={{ color: "var(--primary)", fontSize: "0.85rem" }}>EC</span>
          </span>
        </Link>

        <div className="nav-links-desktop navbar-menu-links">
          <Link href="/about-us" className="nav-link">About Us</Link>
          <Link href="/courses" className="nav-link">Courses</Link>
          <Link href="/training-programs" className="nav-link">Training Programs</Link>
          <Link href="/workshops" className="nav-link">Workshops</Link>
          <Link href="/careers" className="nav-link">Careers</Link>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/contact-us" className="nav-link">Contact Us</Link>
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              {studentId && (
                <Link href="/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(0,153,255,0.1)", color: "var(--primary)", textDecoration: "none", transition: "background 0.2s" }} title="Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
              )}
              <form action="/api/admin/logout" method="POST" className="nav-links-desktop">
                <button type="submit" className="btn btn-secondary navbar-logout-btn">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn btn-secondary nav-links-desktop navbar-login-btn">
              Login / Sign Up
            </Link>
          )}
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </nav>
  );
}
