"use client";

import { useState, useTransition, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import { addGalleryItem, deleteGalleryItem } from "./actions";

interface GalleryItem {
  id: string;
  title?: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
}

export default function GalleryManagerClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Keep in sync with server components
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("Please upload an image first.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);

    startTransition(async () => {
      try {
        await addGalleryItem(formData);
        formRef.current?.reset();
        setImageUrl("");
        // Optimistic UI updates or page refresh takes care of fetching, but let's re-render
        // Next.js revalidatePath will refresh the server props, but we can also manually clear/refresh or sync
        window.location.reload();
      } catch (err: any) {
        setError(err.message || "Failed to add slide");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery slide?")) return;

    startTransition(async () => {
      try {
        await deleteGalleryItem(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        alert(err.message || "Failed to delete slide");
      }
    });
  };

  const isLimitReached = items.length >= 6;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "var(--spacing-lg)" }}>
      {/* Add New Slide Form */}
      <div>
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Add New Slide</h2>
            <span style={{ fontSize: "0.85rem", color: isLimitReached ? "#ef4444" : "var(--text-secondary)", fontWeight: 600 }}>
              {items.length} / 6 slides
            </span>
          </div>
          
          <form ref={formRef} onSubmit={handleAdd}>
            {isLimitReached && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                lineHeight: 1.4,
              }}>
                ⚠️ <strong>Limit Reached:</strong> You have reached the maximum limit of 6 gallery slides. You must delete an existing slide before adding a new one.
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="title">Slide Title (Optional)</label>
              <input type="text" id="title" name="title" className="form-input" placeholder="e.g. Next-Gen Robotics" disabled={isLimitReached} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description (Required)</label>
              <textarea
                id="description"
                name="description"
                required
                className="form-input"
                rows={4}
                style={{ resize: "vertical" }}
                placeholder="Write slide details..."
                disabled={isLimitReached}
              ></textarea>
            </div>

            {!isLimitReached && (
              <FileUpload
                label="Slide Image (Required)"
                folder="gallery"
                onUploadComplete={setImageUrl}
                onUploading={setUploading}
                initialValue={imageUrl}
                aspectRatio={16 / 9}
              />
            )}

            {error && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={isPending || uploading || !imageUrl || isLimitReached}
            >
              {isPending ? "Adding Slide..." : "Add Slide"}
            </button>
          </form>
        </div>
      </div>

      {/* Slide Listing */}
      <div>
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Current Slides</h2>
          
          {items.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
              No slides added yet. The homepage will display the default background.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "1rem",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.01)",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Slide Image"}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.2)",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {item.title && (
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                          {item.title}
                        </h3>
                      )}
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.8rem",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.2)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.1)";
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
