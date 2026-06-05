"use client";

import { useState, useTransition, useRef } from "react";
import { addCourse } from "./actions";
import FileUpload from "@/components/FileUpload";

export default function AddCourseForm({ defaultCategory = "Course" }: { defaultCategory?: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [slots, setSlots] = useState(["", "", ""]);

  const handleImageUpload = (url: string) => {
    setUploadedUrl(url);
  };

  const handleSlotChange = (index: number, value: string) => {
    const updated = [...slots];
    updated[index] = value;
    setSlots(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("timeSlots", slots.filter(Boolean).join(", "));
    formData.set("imageUrl", uploadedUrl);
    startTransition(async () => {
      await addCourse(formData);
      formRef.current?.reset();
      setUploadedUrl("");
      setSlots(["", "", ""]);
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="category" value={defaultCategory} />

      <div className="form-group">
        <label className="form-label" htmlFor="title">{defaultCategory} Title</label>
        <input type="text" id="title" name="title" required className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" required className="form-input" rows={3} style={{ resize: "vertical" }}></textarea>
      </div>

      {defaultCategory === "Career" || defaultCategory === "Service" ? (
        <>
          <input type="hidden" name="price" value="0" />
          <input type="hidden" name="type" value="ONLINE" />
          <input type="hidden" name="duration" value="" />
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: defaultCategory === "Workshop" ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="price">Price (Rs.)</label>
              <input type="number" step="1" id="price" name="price" required className="form-input" placeholder="e.g. 4999" />
            </div>
            {defaultCategory === "Workshop" && (
              <div className="form-group">
                <label className="form-label" htmlFor="originalPrice">Original Price (Rs.)</label>
                <input type="number" step="1" id="originalPrice" name="originalPrice" className="form-input" placeholder="e.g. 5999" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="type">Course Type</label>
              <select id="type" name="type" required className="form-input" style={{ appearance: "none" }}>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="duration">Duration</label>
            <input type="text" id="duration" name="duration" className="form-input" placeholder="e.g. 3 Months, 40 Hours" />
          </div>

          <div className="form-group">
            <label className="form-label">Time Slots (up to 3)</label>
            {slots.map((slot, i) => (
              <input key={i} type="text" className="form-input" style={{ marginBottom: "0.5rem" }}
                placeholder={`Slot ${i + 1} — e.g. Mon & Wed 10:00 AM`}
                value={slot} onChange={(e) => handleSlotChange(i, e.target.value)} />
            ))}
          </div>
        </>
      )}

      {(defaultCategory === "Internship" || defaultCategory === "Career") && (
        <div className="form-group" style={{ margin: "1.5rem 0", padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
          <label className="form-label" style={{ fontWeight: 700, color: "white", marginBottom: "1rem" }}>Required Optional Fields (Select to make required for students)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { name: "reqLinkedin", label: "LinkedIn Profile" },
              { name: "reqPortfolio", label: "Portfolio URL" },
              { name: "reqWorkExp", label: "Work Experience" },
              { name: "reqCommSkills", label: "Communication Skills" },
              { name: "reqTeamwork", label: "Teamwork Experience" },
              { name: "reqProject", label: "Project Experience" },
              { name: "reqAadhaar", label: "Aadhaar Card Upload" },
              { name: "reqPan", label: "PAN Card Upload" },
              { name: "reqOfferLetters", label: "Previous Offer Letters Upload" },
              { name: "reqExcessiveDoc", label: "Excessive Documentation Upload" },
            ].map(field => (
              <label key={field.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name={field.name} style={{ accentColor: "var(--primary)" }} />
                <span>{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <FileUpload 
        label="Course Poster Image"
        folder="courses"
        onUploadComplete={handleImageUpload}
        onUploading={setUploading}
      />

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isPending || uploading}>
        {isPending ? "Adding..." : `Add ${defaultCategory}`}
      </button>
    </form>
  );
}
