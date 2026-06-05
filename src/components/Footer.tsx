"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Footer.css";

interface ContactData {
  emails: string[];
  phones: string[];
  address: string;
}

export default function Footer({ contactData }: { contactData?: ContactData }) {
  const emails = contactData?.emails || ["sensovec@gmail.com"];
  const phones = contactData?.phones || ["+91 79813 45277"];
  const address = contactData?.address || "Door No. 14-189, Sai Brundhavan Colony,\nMorampudi Rd, Aditya Nagar,\nRajamahendravaram, AP 533106, India";
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <>
      <div style={{ height: "3.5rem", flexShrink: 0 }} />
      <footer className="footer-container">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-column">
            <Link href="/" className="footer-logo">
              Senso<span style={{ color: "var(--primary)" }}>Vec</span>
            </Link>
            <p className="footer-desc">
              Empowering the next generation of engineers with specialized education in autonomous systems, robotics, control theory, and sensor technologies.
            </p>
            <div className="footer-social-icons">
              {/* YouTube */}
              <a href="https://www.youtube.com/@Sensovec" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/sensovec1/" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?fb_profile_edit_entry_point=%7B%22click_point%22%3A%22edit_profile_button%22%2C%22feature%22%3A%22profile_header%22%7D&id=61590375870730&sk=about" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/917981345277" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/senso-vec-5560bb411?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-column">
            <h3 className="footer-heading">Offerings</h3>
            <ul className="footer-links-list">
              <li><Link href="/courses" className="footer-link">Courses</Link></li>
              <li><Link href="/training-programs" className="footer-link">Training Programs</Link></li>
              <li><Link href="/workshops" className="footer-link">Workshops</Link></li>
              <li><Link href="/careers" className="footer-link">Careers</Link></li>
              <li><Link href="/services" className="footer-link">Services</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="footer-column">
            <h3 className="footer-heading">Platform</h3>
            <ul className="footer-links-list">
              <li><Link href="/about-us" className="footer-link">About Us</Link></li>
              <li><Link href="/contact-us" className="footer-link">Contact Us</Link></li>
              <li><Link href="/profile" className="footer-link">My Profile</Link></li>
              <li><Link href="/login" className="footer-link">Login</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="footer-column">
            <h3 className="footer-heading">Contact Info</h3>
            <div className="footer-contact-list">
              <a href="https://maps.app.goo.gl/5dNMhS68APccDBJd8" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span style={{ whiteSpace: "pre-line" }}>
                  {address}
                </span>
              </a>
              {phones.map((phone, idx) => (
                <a key={idx} href={`tel:${phone.replace(/\s+/g, "")}`} className="footer-contact-item">
                  <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{phone}</span>
                </a>
              ))}
              {emails.map((email, idx) => (
                <a key={idx} href={`mailto:${email}`} className="footer-contact-item">
                  <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>{email}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} SensoVec. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link href="/terms-and-conditions" className="footer-bottom-link">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
