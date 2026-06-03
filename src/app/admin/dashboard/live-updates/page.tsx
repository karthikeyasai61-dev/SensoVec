import { adminDb } from "../../../../lib/firebase-admin";
import LiveUpdatesManagerClient from "./LiveUpdatesManagerClient";

export const dynamic = "force-dynamic";

export default async function LiveUpdatesAdminPage() {
  const snap = await adminDb.collection("live_updates").orderBy("createdAt", "desc").get();
  const items = snap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title || "",
    description: doc.data().description || "",
    imageUrl: doc.data().imageUrl || "",
    createdAt: doc.data().createdAt || "",
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Live Updates Manager</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Add up to 6 cards shown in the Live Updates section on the homepage (between the hero and Our Offerings).
        </p>
      </div>
      <LiveUpdatesManagerClient initialItems={items} />
    </div>
  );
}
