import Navbar from "../../components/Navbar";
import ScrollReveal from "../../components/ScrollReveal";
import CosmicBackground from "../../components/CosmicBackground";
import styles from "./contact-us.module.css";
import { adminDb } from "../../lib/firebase-admin";

export const metadata = {
  title: "Contact Us | SensoVec",
  description: "Get in touch with SensoVec. Locate our office at SensoVec in Rajamahendravaram, India, explore our Street View, or connect with our social media channels.",
};

export default async function ContactUsPage() {
  let emails: string[] = ["sensovec@gmail.com"];
  let phones: string[] = ["+91 79813 45277"];
  let address: string = "Door No. 14-189, Sai Brundhavan Colony,\nMorampudi Rd, Aditya Nagar,\nRajamahendravaram, Andhra Pradesh 533106,\nIndia";

  try {
    const doc = await adminDb.collection("settings").doc("contact").get();
    if (doc.exists) {
      const data = doc.data();
      if (data) {
        if (data.emails && data.emails.length > 0) emails = data.emails;
        if (data.phones && data.phones.length > 0) phones = data.phones;
        if (data.address) address = data.address;
      }
    }
  } catch (error) {
    console.error("Failed to fetch contact details for Contact Us page:", error);
  }
  return (
    <div className={`${styles.mainWrapper} main-content`}>
      {/* Cosmic Rotating Starfield Background */}
      <CosmicBackground />

      {/* Background Animated Glows */}
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>

      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.container}>
          <ScrollReveal className={styles.reveal}>
            <span style={{ 
              fontSize: "0.85rem", 
              fontWeight: 700, 
              color: "var(--primary)", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em",
              display: "inline-block",
              marginBottom: "0.5rem"
            }}>
              Connect With Us
            </span>
          </ScrollReveal>
          <ScrollReveal className={styles.reveal} style={{ transitionDelay: "100ms" }}>
            <h1 className={`${styles.title} text-gradient`}>Contact Us</h1>
          </ScrollReveal>
          <ScrollReveal className={styles.reveal} style={{ transitionDelay: "200ms" }}>
            <p className={styles.subtitle}>
              Find our headquarters at SensoVec or follow our official social channels.
            </p>
          </ScrollReveal>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.splitGrid}>
          {/* Left Side: Address Details and Social Connect */}
          <ScrollReveal className={styles.reveal} style={{ transitionDelay: "300ms", width: "100%" }}>
            <div className={styles.glassCard}>
              <h2 className={styles.cardTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Our Headquarters
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "2rem" }}>
                {/* Office Name & Address */}
                <a
                  href="https://maps.app.goo.gl/5dNMhS68APccDBJd8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.addressLink}
                >
                  <div className={styles.locationIconWrapper}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <h4 className={styles.addressTitle}>
                      Our Headquarters
                    </h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                      {address}
                    </p>
                  </div>
                </a>

                {/* Phone Numbers */}
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(0, 153, 255, 0.08)",
                    border: "1px solid rgba(0, 153, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    flexShrink: 0
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.15rem" }}>
                      Call Us
                    </h4>
                    {phones.map((phone, idx) => (
                      <a key={idx} href={`tel:${phone.replace(/\s+/g, "")}`} className={styles.emailLink}>
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Email Addresses */}
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(0, 153, 255, 0.08)",
                    border: "1px solid rgba(0, 153, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    flexShrink: 0
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.15rem" }}>
                      Email Us
                    </h4>
                    {emails.map((email, idx) => (
                      <a key={idx} href={`mailto:${email}`} className={styles.emailLink}>
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media Links Panel */}
              <div className={styles.socialPanel}>
                <h3 className={styles.socialTitle}>Connect with Us</h3>
                <div className={styles.socialGrid}>
                  <a
                    href="https://www.youtube.com/@Sensovec"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    data-brand="youtube"
                    title="YouTube"
                    id="social-youtube"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.instagram.com/sensovec1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    data-brand="instagram"
                    title="Instagram"
                    id="social-instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>

                  <a
                    href={"https://www.facebook.com/profile.php?fb_profile_edit_entry_point=%7B%22click_point%22%3A%22edit_profile_button%22%2C%22feature%22%3A%22profile_header%22%7D&id=61590375870730&sk=about"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    data-brand="facebook"
                    title="Facebook"
                    id="social-facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  <a
                    href="https://wa.me/917981345277"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    data-brand="whatsapp"
                    title="WhatsApp"
                    id="social-whatsapp"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </a>

                  <a
                    href="mailto:sensovec@gmail.com"
                    className={styles.socialIcon}
                    data-brand="gmail"
                    title="Gmail"
                    id="social-gmail"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-1.356 1.517-2.161 2.636-1.364L12 10.53l9.364-7.436c1.118-.797 2.636.008 2.636 1.364z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/senso-vec-5560bb411?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    data-brand="linkedin"
                    title="LinkedIn"
                    id="social-linkedin"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Side: Maps & Street View */}
          <div className={styles.visualContainer}>
            {/* Street View Embed */}
            <ScrollReveal className={styles.reveal} style={{ transitionDelay: "400ms", width: "100%" }}>
              <div className={styles.embedCard}>
                <h3 className={styles.embedTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                  Interactive Street View
                </h3>
                <div className={styles.mapWrapper}>
                  <iframe
                    className={styles.mapIframe}
                    src="https://www.google.com/maps/embed?pb=!4v1779634746864!6m8!1m7!1s3CqfkZ2NbYyKCdzVg2UJxg!2m2!1d16.99648195236068!2d81.79984889379627!3f166.78084953495915!4f-0.2107271999586544!5f0.7820865974627469"
                    allowFullScreen
                    loading="lazy"
                    title="SensoVec Street View"
                    allow="geolocation; gyroscope; accelerometer; device-orientation;"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
    </div>
  );
}
