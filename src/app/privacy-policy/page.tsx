import Navbar from "../../components/Navbar";
import CosmicBackground from "../../components/CosmicBackground";
import ScrollReveal from "../../components/ScrollReveal";
import { adminDb } from "../../lib/firebase-admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Privacy Policy | SensoVec",
  description: "Privacy Policy of using the SensoVec autonomous systems learning platform.",
};

export default async function PrivacyPolicyPage() {
  let privacyUrl = "";
  try {
    const doc = await adminDb.collection("settings").doc("legal").get();
    if (doc.exists) {
      privacyUrl = doc.data()?.privacyPolicyUrl || "";
    }
  } catch (error) {
    console.error("Failed to fetch Privacy Policy PDF URL:", error);
  }

  if (privacyUrl) {
    redirect(privacyUrl);
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <CosmicBackground />
      <Navbar />

      <main className="container" style={{ padding: "4rem var(--spacing-sm) 6rem var(--spacing-sm)", flex: 1 }}>
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ 
              fontSize: "0.85rem", 
              fontWeight: 700, 
              color: "var(--primary)", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em",
              display: "inline-block",
              marginBottom: "0.5rem"
            }}>
              Data Protection
            </span>
            <h1 className="text-gradient" style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0 }}>
              Privacy Policy
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Last updated: May 2026
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal style={{ transitionDelay: "150ms" }}>
          <div className="glass-card" style={{ padding: "2.5rem", lineHeight: 1.7, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: 0, marginBottom: "1rem" }}>1. Information We Collect</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              We collect information you provide directly to us when registering, such as your name, email address, phone number, and educational level. When applying for training programs or careers, we collect profiles, resumes, and optional portfolio links.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>2. How We Use Your Information</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              We use the collected information to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
              <li>Provide and maintain our courses, certifications, and educational services.</li>
              <li>Process and review applications for training programs and careers.</li>
              <li>Communicate updates, alerts, and respond to your questions.</li>
              <li>Personalize your dashboard profile and learning experience.</li>
            </ul>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>3. Data Protection and Security</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              We implement industry-standard administrative, technical, and physical measures to guard your personal data against unauthorized access, theft, loss, alteration, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute data security.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>4. Sharing Your Information</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              We do not sell or rent your personal information to third parties. We may share applications and resumes with partners or corporate sponsors when you explicitly apply for career roles or training programs.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>5. Cookies and Tracking</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              We use cookies to maintain your login sessions (such as authentication tokens). You can choose to disable cookies in your browser settings, though doing so may prevent you from using authentication-related pages.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>6. Your Rights</h2>
            <p style={{ marginBottom: "0" }}>
              You have the right to request access to, correction of, or deletion of your personal data stored on our servers. You may edit your profile or contact us directly at <a href="mailto:sensovec@gmail.com" style={{ color: "var(--primary)", textDecoration: "none" }}>sensovec@gmail.com</a> to exercise these rights.
            </p>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
