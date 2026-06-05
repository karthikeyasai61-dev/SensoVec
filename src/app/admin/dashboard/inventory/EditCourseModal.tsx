"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import FileUpload from "@/components/FileUpload";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  type: string;
  duration: string;
  timeSlots: string;
  imageUrl: string | null;
  category?: string;
  isCompleted?: boolean;
  reqLinkedin?: boolean;
  reqPortfolio?: boolean;
  reqWorkExp?: boolean;
  reqCommSkills?: boolean;
  reqTeamwork?: boolean;
  reqProject?: boolean;
  reqAadhaar?: boolean;
  reqPan?: boolean;
  reqOfferLetters?: boolean;
  reqExcessiveDoc?: boolean;
}

export default function EditCourseModal({ course, onClose, onSaved }: { course: Course; onClose: () => void; onSaved: (updated: Course) => void }) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    price: course.price.toString(),
    originalPrice: course.originalPrice ? course.originalPrice.toString() : "",
    type: course.type,
    category: course.category === "Certification" ? "Career" : (course.category || "Course"),
    duration: course.duration,
    timeSlots: course.timeSlots,
    imageUrl: course.imageUrl ?? "",
    reqLinkedin: course.reqLinkedin ?? false,
    reqPortfolio: course.reqPortfolio ?? false,
    reqWorkExp: course.reqWorkExp ?? false,
    reqCommSkills: course.reqCommSkills ?? false,
    reqTeamwork: course.reqTeamwork ?? false,
    reqProject: course.reqProject ?? false,
    reqAadhaar: course.reqAadhaar ?? false,
    reqPan: course.reqPan ?? false,
    reqOfferLetters: course.reqOfferLetters ?? false,
    reqExcessiveDoc: course.reqExcessiveDoc ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: value as any });
  };

  const handleImageUpload = (url: string) => {
    setForm(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const submissionForm = { ...form };
      if (form.category === "Career" || form.category === "Service") {
        submissionForm.price = "0";
        submissionForm.originalPrice = "";
        submissionForm.type = "ONLINE";
        submissionForm.duration = "";
        submissionForm.timeSlots = "";
      }
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      onSaved(data.course);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem" }}>Edit {form.category}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>x</button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input name="title" type="text" required className="form-input" value={form.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" required className="form-input" rows={3} value={form.description} onChange={handleChange} style={{ resize: "vertical" }}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" required className="form-input" value={form.category} onChange={handleChange} style={{ appearance: "none" }}>
              <option value="Course">Course</option>
              <option value="Internship">Internship</option>
              <option value="Workshop">Workshop</option>
              <option value="Career">Career</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {(form.category !== "Career" && form.category !== "Service") && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: form.category === "Workshop" ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Price (Rs.)</label>
                  <input name="price" type="number" step="1" required className="form-input" value={form.price} onChange={handleChange} />
                </div>
                {form.category === "Workshop" && (
                  <div className="form-group">
                    <label className="form-label">Original Price (Rs.)</label>
                    <input name="originalPrice" type="number" step="1" className="form-input" value={form.originalPrice} onChange={handleChange} placeholder="e.g. 5999 (optional)" />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Course Type</label>
                  <select name="type" required className="form-input" value={form.type} onChange={handleChange} style={{ appearance: "none" }}>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (e.g. 3 Months, 40 Hours)</label>
                <input name="duration" type="text" className="form-input" value={form.duration} onChange={handleChange} placeholder="e.g. 3 Months" />
              </div>
              <div className="form-group">
                <label className="form-label">Time Slots (comma-separated)</label>
                <input name="timeSlots" type="text" required className="form-input" value={form.timeSlots} onChange={handleChange} placeholder="Mon-Wed 10:00 AM, Tue-Thu 2:00 PM" />
              </div>
            </>
          )}

          {(form.category === "Internship" || form.category === "Career") && (
            <div className="form-group" style={{ margin: "1.5rem 0", padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
              <label className="form-label" style={{ fontWeight: 700, color: "white", marginBottom: "1rem" }}>Required Optional Fields (Select to make required for students)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { name: "reqLinkedin", label: "LinkedIn Profile", value: form.reqLinkedin },
                  { name: "reqPortfolio", label: "Portfolio URL", value: form.reqPortfolio },
                  { name: "reqWorkExp", label: "Work Experience", value: form.reqWorkExp },
                  { name: "reqCommSkills", label: "Communication Skills", value: form.reqCommSkills },
                  { name: "reqTeamwork", label: "Teamwork Experience", value: form.reqTeamwork },
                  { name: "reqProject", label: "Project Experience", value: form.reqProject },
                  { name: "reqAadhaar", label: "Aadhaar Card Upload", value: form.reqAadhaar },
                  { name: "reqPan", label: "PAN Card Upload", value: form.reqPan },
                  { name: "reqOfferLetters", label: "Previous Offer Letters Upload", value: form.reqOfferLetters },
                  { name: "reqExcessiveDoc", label: "Excessive Documentation Upload", value: form.reqExcessiveDoc },
                ].map(field => (
                  <label key={field.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="checkbox" name={field.name} checked={!!field.value} onChange={handleChange} style={{ accentColor: "var(--primary)" }} />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <FileUpload 
            label={`${form.category} Image`}
            folder="courses"
            initialValue={form.imageUrl}
            onUploadComplete={handleImageUpload}
            onUploading={setUploading}
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading || uploading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
