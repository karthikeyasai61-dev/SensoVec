import { adminDb } from "../../../../lib/firebase-admin";
import GalleryManagerClient from "./GalleryManagerClient";

export const dynamic = "force-dynamic";

export default async function GalleryManagerPage() {
  const galleryQuery = await adminDb.collection("gallery").orderBy("createdAt", "desc").get();
  const galleryItems = galleryQuery.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title,
    description: doc.data().description,
    imageUrl: doc.data().imageUrl,
    createdAt: doc.data().createdAt,
  }));

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "0.5rem" }}>Gallery Manager</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
        Manage the sliding images gallery displayed on the homepage.
      </p>

      <GalleryManagerClient initialItems={galleryItems} />
    </div>
  );
}
