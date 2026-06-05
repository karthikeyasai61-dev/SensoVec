import { adminDb } from "../lib/firebase-admin";
import OfferingsGridClient from "./OfferingsGridClient";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default async function OfferingsGrid({ isLoggedIn, category }: { isLoggedIn: boolean; category?: string }) {
  let courses: any[] = [];
  let fetchError = null;
  try {
    if (category) {
      if (category === "Career") {
        const query1 = await adminDb.collection("courses").where("category", "==", "Career").get();
        const query2 = await adminDb.collection("courses").where("category", "==", "Certification").get();
        const courses1 = query1.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        const courses2 = query2.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        courses = [...courses1, ...courses2];
      } else {
        const query = await adminDb.collection("courses").where("category", "==", category).get();
        courses = query.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }

      // If category is "Course", also include legacy courses that don't have a category field
      if (category === "Course") {
        const legacyQuery = await adminDb.collection("courses").get();
        const legacyCourses = legacyQuery.docs
          .map((doc: any) => ({ id: doc.id, ...doc.data() }))
          .filter((c: any) => !c.category);
        courses = [...courses, ...legacyCourses];
      }
    } else {
      const query = await adminDb.collection("courses").orderBy("createdAt", "desc").get();
      courses = query.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }

    // Map legacy categories (Certification -> Career)
    courses = courses.map((c: any) => {
      if (c.category === "Certification") {
        return { ...c, category: "Career" };
      }
      return c;
    });

    // Sort manually if we merged arrays
    courses.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Filter out completed offerings
    courses = courses.filter((c: any) => c.isCompleted !== true);

  } catch (error: any) {
    fetchError = error.message;
    console.error("Firebase Error:", error);
  }

  if (fetchError) {
    return (
      <div className="glass-card" style={{ border: "1px solid red", backgroundColor: "rgba(255,0,0,0.1)", marginBottom: "1rem" }}>
        <h3 style={{ color: "red", marginBottom: "0.5rem" }}>Database Connection Error:</h3>
        <p style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{fetchError}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
        <h3 style={{ marginBottom: "var(--spacing-sm)" }}>No {category ? (category === "Internship" ? "training programs" : category.toLowerCase() + "s") : "offerings"} available yet</h3>
        <p style={{ color: "var(--text-secondary)" }}>Check back soon!</p>
      </div>
    );
  }

  return (
    <OfferingsGridClient
      courses={courses}
      isLoggedIn={isLoggedIn}
      category={category}
    />
  );
}
