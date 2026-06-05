import { adminDb } from "../../../../lib/firebase-admin";
import ApplicationsClient from "../internship-applications/ApplicationsClient";

export const dynamic = "force-dynamic";

export default async function CareerApplicationsPage() {
  let applications: any[] = [];
  try {
    const snapshot = await adminDb.collection("career_applications")
      .orderBy("createdAt", "desc")
      .get();
    
    applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Failed to fetch career applications:", error);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>Career Applications</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Review, approve, and track student career applicant flows.
          </p>
        </div>
      </header>
      <ApplicationsClient initialApplications={applications} category="Career" />
    </div>
  );
}
