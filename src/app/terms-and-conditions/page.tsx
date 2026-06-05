import Navbar from "../../components/Navbar";
import CosmicBackground from "../../components/CosmicBackground";
import ScrollReveal from "../../components/ScrollReveal";
import { adminDb } from "../../lib/firebase-admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Terms and Conditions | SensoVec",
  description: "Terms and conditions of using the SensoVec autonomous systems learning platform.",
};

export default async function TermsAndConditionsPage() {
  let termsUrl = "";
  try {
    const doc = await adminDb.collection("settings").doc("legal").get();
    if (doc.exists) {
      termsUrl = doc.data()?.termsAndConditionsUrl || "";
    }
  } catch (error) {
    console.error("Failed to fetch Terms & Conditions PDF URL:", error);
  }

  if (termsUrl) {
    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <CosmicBackground />
        <Navbar />
  
        <main className="container" style={{ padding: "4rem var(--spacing-sm) 6rem var(--spacing-sm)", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ 
              fontSize: "0.85rem", 
              fontWeight: 700, 
              color: "var(--primary)", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em",
              display: "inline-block",
              marginBottom: "0.5rem"
            }}>
              Legal Agreement
            </span>
            <h1 className="text-gradient" style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0 }}>
              Terms &amp; Conditions
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Please review the document below. If it does not display, you can{" "}
              <a href={termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                open the PDF directly
              </a>.
            </p>
          </div>
  
          <div className="glass-card" style={{ flex: 1, minHeight: "75vh", padding: "0.5rem", display: "flex", flexDirection: "column" }}>
            <iframe 
              src={termsUrl} 
              style={{ width: "100%", height: "100%", minHeight: "75vh", border: "none", borderRadius: "12px", backgroundColor: "white" }} 
              title="Terms and Conditions PDF"
            />
          </div>
        </main>
      </div>
    );
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
              Legal Agreement
            </span>
            <h1 className="text-gradient" style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0 }}>
              Terms &amp; Conditions
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Last updated: May 2026
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal style={{ transitionDelay: "150ms" }}>
          <div className="glass-card" style={{ padding: "2.5rem", lineHeight: 1.7, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: 0, marginBottom: "1rem" }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              By accessing and using the SensoVec platform, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services, courses, or website.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>2. Eligibility and Account Registration</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              You may be required to create an account to enroll in courses, workshops, or apply for training programs. You agree to provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>3. Intellectual Property Rights</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              All course materials, lectures, designs, code snippets, videos, and graphics provided by SensoVec are intellectual property owned by or licensed to SensoVec. These materials are provided for your personal, non-commercial educational use only. You may not distribute, reproduce, or modify this content without express written consent.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>4. Course Enrollment and Payments</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Pricing and course specifications are subject to change. Enrolling in a course constitutes an agreement to pay the listed fees. All fees paid are non-refundable unless specified otherwise under local consumer laws.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>5. Code of Conduct</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Learners and users must interact professionally. Any harassment, academic dishonesty, plagiarism, or distribution of malicious files will result in immediate termination of account access without refund.
            </p>

            <h2 style={{ color: "white", fontSize: "1.3rem", marginTop: "2rem", marginBottom: "1rem" }}>6. Limitation of Liability</h2>
            <p style={{ marginBottom: "0" }}>
              SensoVec provides education and training materials. We do not guarantee employment, academic credit, or specific project outcomes. Under no circumstances will SensoVec be held liable for direct or indirect damages resulting from your use of the platform.
            </p>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
