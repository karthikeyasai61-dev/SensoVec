"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted || !isMobile) return null;

  const navLinks: NavLinkItem[] = [
    { 
      href: "/about-us", 
      label: "About Us",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    },
    { 
      href: "/courses", 
      label: "Courses",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      )
    },
    { 
      href: "/training-programs", 
      label: "Training Programs",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    { 
      href: "/workshops", 
      label: "Workshops",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    { 
      href: "/careers", 
      label: "Careers",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    { 
      href: "/services", 
      label: "Services",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    },
    { 
      href: "/contact-us", 
      label: "Contact Us",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    },
  ];

  const drawerContent = (
    <div className={`mobile-drawer ${open ? "open" : ""}`}>
      <button className="mobile-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 900, fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", lineHeight: 1, display: "inline-flex", alignItems: "baseline" }}>
          <span style={{ color: "var(--secondary)", fontSize: "1.4rem" }}>S</span>
          <span style={{ color: "var(--secondary)", fontSize: "0.85rem" }}>ENSO</span>
          <span style={{ color: "var(--primary)", fontSize: "1.4rem" }}>V</span>
          <span style={{ color: "var(--primary)", fontSize: "0.85rem" }}>EC</span>
        </span>
      </div>

      <div className="mobile-drawer-links">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} className="mobile-drawer-link" onClick={() => setOpen(false)}>
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {isLoggedIn ? (
          <form action="/api/admin/logout" method="POST">
            <button type="submit" style={{
              width: "100%", padding: "0.85rem", borderRadius: "12px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: "1rem", fontWeight: 600, cursor: "pointer",
              transition: "all 0.3s"
            }}>
              Logout
            </button>
          </form>
        ) : (
          <Link href="/login" onClick={() => setOpen(false)} style={{
            display: "block", textAlign: "center", padding: "0.85rem",
            background: "var(--accent-gradient)", borderRadius: "12px",
            color: "white", fontWeight: 700, fontSize: "1rem", textDecoration: "none",
            boxShadow: "0 4px 15px rgba(0, 153, 255, 0.2)", transition: "all 0.3s"
          }}>
            Login / Sign Up
          </Link>
        )}
      </div>
    </div>
  );
  return (
    <div className="mobile-nav-wrapper">
      {/* Hamburger button — only visible on mobile/tablet via CSS */}
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mounted && createPortal(drawerContent, document.body)}
    </div>
  );
}
