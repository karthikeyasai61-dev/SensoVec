// Trigger build - Vercel deploy
import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "../lib/firebase-admin";
import styles from "./page.module.css";
import ParentDetailsPopup from "../components/ParentDetailsPopup";
import OfferingsGridClient from "../components/OfferingsGridClient";
import Navbar from "../components/Navbar";
import CosmicBackground from "../components/CosmicBackground";
import ScrollReveal from "../components/ScrollReveal";
import HomeGallery from "../components/HomeGallery";
import LiveUpdates from "../components/LiveUpdates";
export const dynamic = "force-dynamic";
export default async function Home() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("student_auth")?.value;
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  const isLoggedIn = !!studentId || isAdmin;
  // Check if student needs parent details popup
  let showParentPopup = false;
  if (studentId) {
    const studentDoc = await adminDb.collection("students").doc(studentId).get();
    if (studentDoc.exists) {
      const student = studentDoc.data();
      if (
        student && 
        student.role === "Student" && 
        (student.educationLevel === "School(1-10)" || student.educationLevel === "+12") && 
        !student.parentPhone
      ) {
        showParentPopup = true;
      }
    }
  }
  // Fetch ALL offerings for client-side search
  const offeringsSnap = await adminDb.collection("courses").orderBy("createdAt", "desc").get();
  const allOfferings = offeringsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((c: any) => c.isCompleted !== true);
  // Fetch gallery slides
  const gallerySnap = await adminDb.collection("gallery").orderBy("createdAt", "desc").get();
  const galleryItems = gallerySnap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title || "",
    description: doc.data().description || "",
    imageUrl: doc.data().imageUrl || "",
  }));
  // Fetch live update cards
  const liveUpdatesSnap = await adminDb.collection("live_updates").orderBy("createdAt", "desc").get();
  const liveUpdateItems = liveUpdatesSnap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title || "",
    description: doc.data().description || "",
    imageUrl: doc.data().imageUrl || "",
  }));
  return (
    <div className="main-content" style={{ position: "relative", paddingBottom: "4rem" }}>
      <CosmicBackground />
      {showParentPopup && studentId && <ParentDetailsPopup studentId={studentId} />}
      
      <Navbar />
      <header className={`${styles.hero} animate-fade-in`}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTagline}>
              Sense • <span style={{ color: "var(--primary)" }}>Think</span> • Move
            </span>
            <br />
            <span className={styles.heroGradientText}>Autonomous Systems</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Join thousands of students learning new skills online and offline. Elevate your career today.
          </p>
          {!isLoggedIn && (
            <Link href="/login" className="btn btn-primary">Login to Enroll</Link>
          )}
        </div>
      </header>
      {/* Live Updates Section */}
      <div className="container">
        <ScrollReveal>
          <LiveUpdates items={liveUpdateItems} />
        </ScrollReveal>
      </div>
      
      {/* Offerings Section */}
      <div className="container">
        <ScrollReveal>
          <section style={{ padding: "0.75rem 0 2rem 0" }}>
            <h2 style={{ marginBottom: "var(--spacing-sm)", fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>Our Offerings</h2>
            <OfferingsGridClient courses={allOfferings} isLoggedIn={isLoggedIn} />
          </section>
        </ScrollReveal>
      </div>
      {/* Sliding Gallery Section */}
      <div className="container">
        <ScrollReveal>
          <section style={{ padding: "1rem 0 2rem 0" }}>
            <h2 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "3rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>Gallery</h2>
            <HomeGallery items={galleryItems} />
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
