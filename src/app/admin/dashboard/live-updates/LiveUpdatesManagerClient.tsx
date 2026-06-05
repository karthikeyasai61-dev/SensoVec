"use client";

import { useState, useTransition, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import { addLiveUpdate, deleteLiveUpdate } from "./actions";

interface LiveUpdateItem {
  id: string;
  title?: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
}

export default function LiveUpdatesManagerClient({ initialItems }: { initialItems: LiveUpdateItem[] }) {
  const [items, setItems] = useState<LiveUpdateItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!imageUrl) { setError("Please upload an image first."); return; }
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);
    startTransition(async () => {
      try {
        await addLiveUpdate(formData);
        formRef.current?.reset();
        setImageUrl("");
        window.location.reload();
      } catch (err: any) {
        setError(err.message || "Failed to add card");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this live update card?")) return;
    startTransition(async () => {
      try {
        await deleteLiveUpdate(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        alert(err.message || "Failed to delete");
      }
    });
  };

  const isLimitReached = items.length >= 6;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "var(--spacing-lg)" }}>
      {/* Add Form */}
      <div>
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Add Live Update Card</h2>
            <span style={{ fontSize: "0.85rem", color: isLimitReached ? "#ef4444" : "var(--text-secondary)", fontWeight: 600 }}>
              {items.length} / 6 cards
            </span>
          </div>

          <form ref={formRef} onSubmit={handleAdd}>
            {isLimitReached && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.4 }}>
                ⚠️ <strong>Limit Reached:</strong> Maximum 6 cards. Delete an existing card before adding a new one.
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="lu-title">Card Title (Optional)</label>
              <input type="text" id="lu-title" name="title" className="form-input" placeholder="e.g. New Workshop Open!" disabled={isLimitReached} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lu-description">Description (Required)</label>
              <textarea
                id="lu-description"
                name="description"
                required
                className="form-input"
                rows={4}
                style={{ resize: "vertical" }}
                placeholder="Write a short update or announcement..."
                disabled={isLimitReached}
              />
            </div>

            {!isLimitReached && (
              <FileUpload
                label="Card Image (Required)"
                folder="live-updates"
                onUploadComplete={setImageUrl}
                onUploading={setUploading}
                initialValue={imageUrl}
                aspectRatio={2}
              />
            )}

            {error && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>⚠️ {error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={isPending || uploading || !imageUrl || isLimitReached}
            >
              {isPending ? "Adding..." : "Add Card"}
            </button>
          </form>
        </div>
      </div>

      {/* Cards List */}
      <div>
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Current Live Update Cards</h2>
          {items.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
              No cards added yet. Add up to 6 cards to display in the Live Updates section.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "12px", background: "rgba(255,255,255,0.01)", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1, minWidth: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title || "Card"} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                      {item.title && <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</h3>}
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "0.5rem 0.75rem", fontSize: "0.8rem", flexShrink: 0 }}
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
