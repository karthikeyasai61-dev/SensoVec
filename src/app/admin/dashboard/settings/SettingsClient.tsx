"use client";

import { useState, useTransition, useRef } from "react";
import { saveSettings } from "./actions";

interface Props {
  initialTermsUrl: string;
  initialPrivacyUrl: string;
  initialEmails: string[];
  initialPhones: string[];
  initialAddress: string;
}

export default function SettingsClient({
  initialTermsUrl,
  initialPrivacyUrl,
  initialEmails,
  initialPhones,
  initialAddress,
}: Props) {
  // Tabs: "contact" or "legal"
  const [activeTab, setActiveTab] = useState<"contact" | "legal">("contact");

  // Legal state
  const [termsUrl, setTermsUrl] = useState(initialTermsUrl);
  const [privacyUrl, setPrivacyUrl] = useState(initialPrivacyUrl);
  const [uploadingTerms, setUploadingTerms] = useState(false);
  const [uploadingPrivacy, setUploadingPrivacy] = useState(false);
  const [dragActiveTerms, setDragActiveTerms] = useState(false);
  const [dragActivePrivacy, setDragActivePrivacy] = useState(false);
  const fileInputTermsRef = useRef<HTMLInputElement>(null);
  const fileInputPrivacyRef = useRef<HTMLInputElement>(null);

  // Contact state
  const [emails, setEmails] = useState<string[]>(initialEmails.length > 0 ? initialEmails : ["sensovec@gmail.com"]);
  const [phones, setPhones] = useState<string[]>(initialPhones.length > 0 ? initialPhones : ["+91 79813 45277"]);
  const [address, setAddress] = useState(initialAddress || "Sai Brundhavan Colony, Morampudi Rd, Rajamahendravaram, AP 533106, India");

  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle PDF upload
  const uploadPdfFile = async (file: File, type: "terms" | "privacy") => {
    setError(null);
    setSuccess(null);

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported for legal documents.");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setError("File size exceeds the 2MB limit.");
      return;
    }

    const setUploading = type === "terms" ? setUploadingTerms : setUploadingPrivacy;
    const setUrl = type === "terms" ? setTermsUrl : setPrivacyUrl;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "legal");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to upload file");

      setUrl(data.url);
      setSuccess(`${type === "terms" ? "Terms & Conditions" : "Privacy Policy"} PDF uploaded. Save changes to commit.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent, type: "terms" | "privacy") => {
    e.preventDefault();
    e.stopPropagation();
    const setDragActive = type === "terms" ? setDragActiveTerms : setDragActivePrivacy;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: "terms" | "privacy") => {
    e.preventDefault();
    e.stopPropagation();
    const setDragActive = type === "terms" ? setDragActiveTerms : setDragActivePrivacy;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadPdfFile(e.dataTransfer.files[0], type);
    }
  };

  const getFileName = (url: string) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  // Add Contact items
  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    if (!newEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setEmails(prev => [...prev, newEmail.trim()]);
    setNewEmail("");
  };

  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    setError(null);
    setPhones(prev => [...prev, newPhone.trim()]);
    setNewPhone("");
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePhone = (index: number) => {
    setPhones(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    setError(null);
    setSuccess(null);

    if (emails.length === 0) {
      setError("At least one contact email is required.");
      return;
    }
    if (phones.length === 0) {
      setError("At least one contact phone number is required.");
      return;
    }

    startTransition(async () => {
      try {
        await saveSettings(
          { termsUrl, privacyUrl },
          { emails, phones, address }
        );
        setSuccess("Platform settings successfully saved and updated!");
      } catch (err: any) {
        setError(err.message || "Failed to save settings.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("contact")}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: "8px",
            background: activeTab === "contact" ? "var(--primary)" : "transparent",
            color: activeTab === "contact" ? "white" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "contact" ? "var(--primary)" : "var(--border-color)"}`,
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s"
          }}
        >
          Contact Information
        </button>
        <button
          onClick={() => setActiveTab("legal")}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: "8px",
            background: activeTab === "legal" ? "var(--primary)" : "transparent",
            color: activeTab === "legal" ? "white" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "legal" ? "var(--primary)" : "var(--border-color)"}`,
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s"
          }}
        >
          Legal Documents (PDF)
        </button>
      </div>

      {error && (
        <div style={{
          padding: "1rem",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          borderRadius: "10px",
          fontSize: "0.9rem"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: "1rem",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          borderRadius: "10px",
          fontSize: "0.9rem"
        }}>
          ✓ {success}
        </div>
      )}

      {/* Tab 1: Contact Settings */}
      {activeTab === "contact" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Emails Section */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", marginTop: 0, marginBottom: "1.5rem" }}>Admin Emails</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {emails.map((email, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "0.95rem" }}>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(idx)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", padding: "0.25rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddEmail} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                placeholder="Add new email address..."
                className="form-input"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", flexShrink: 0 }}>
                Add
              </button>
            </form>
          </div>

          {/* Phones Section */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", marginTop: 0, marginBottom: "1.5rem" }}>Admin Phone Numbers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {phones.map((phone, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "0.95rem" }}>{phone}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhone(idx)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", padding: "0.25rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddPhone} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="e.g. +91 79813 45277"
                className="form-input"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", flexShrink: 0 }}>
                Add
              </button>
            </form>
          </div>

          {/* Address Section */}
          <div className="glass-card" style={{ padding: "2rem", gridColumn: "span 2" }}>
            <h3 style={{ fontSize: "1.25rem", marginTop: 0, marginBottom: "1rem" }}>Platform Office Address</h3>
            <textarea
              className="form-input"
              rows={3}
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ resize: "vertical", width: "100%" }}
              placeholder="Enter headquarters office address..."
            />
          </div>
        </div>
      )}

      {/* Tab 2: Legal settings */}
      {activeTab === "legal" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Terms dropzone */}
          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>Terms & Conditions PDF</h3>
            {termsUrl ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <span style={{ fontSize: "1.75rem" }}>📄</span>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: "white", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getFileName(termsUrl)}
                    </span>
                    <a href={termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontSize: "0.8rem", textDecoration: "none" }}>
                      View Document ↗
                    </a>
                  </div>
                </div>
                <button type="button" className="btn" onClick={() => setTermsUrl("")} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                  Clear
                </button>
              </div>
            ) : (
              <div
                onDragEnter={(e) => handleDrag(e, "terms")}
                onDragLeave={(e) => handleDrag(e, "terms")}
                onDragOver={(e) => handleDrag(e, "terms")}
                onDrop={(e) => handleDrop(e, "terms")}
                onClick={() => fileInputTermsRef.current?.click()}
                style={{ border: "2px dashed var(--border-color)", padding: "2.5rem 1.5rem", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.01)", transition: "all 0.3s ease" }}
              >
                <input type="file" ref={fileInputTermsRef} accept=".pdf" style={{ display: "none" }} onChange={e => { if (e.target.files && e.target.files[0]) uploadPdfFile(e.target.files[0], "terms"); }} />
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📁</div>
                <p style={{ fontWeight: 600, color: "white", marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                  {uploadingTerms ? "Uploading PDF..." : "Drag & drop PDF here"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Max size 2MB</p>
              </div>
            )}
          </div>

          {/* Privacy dropzone */}
          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>Privacy Policy PDF</h3>
            {privacyUrl ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <span style={{ fontSize: "1.75rem" }}>📄</span>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: "white", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getFileName(privacyUrl)}
                    </span>
                    <a href={privacyUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontSize: "0.8rem", textDecoration: "none" }}>
                      View Document ↗
                    </a>
                  </div>
                </div>
                <button type="button" className="btn" onClick={() => setPrivacyUrl("")} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                  Clear
                </button>
              </div>
            ) : (
              <div
                onDragEnter={(e) => handleDrag(e, "privacy")}
                onDragLeave={(e) => handleDrag(e, "privacy")}
                onDragOver={(e) => handleDrag(e, "privacy")}
                onDrop={(e) => handleDrop(e, "privacy")}
                onClick={() => fileInputPrivacyRef.current?.click()}
                style={{ border: "2px dashed var(--border-color)", padding: "2.5rem 1.5rem", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.01)", transition: "all 0.3s ease" }}
              >
                <input type="file" ref={fileInputPrivacyRef} accept=".pdf" style={{ display: "none" }} onChange={e => { if (e.target.files && e.target.files[0]) uploadPdfFile(e.target.files[0], "privacy"); }} />
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📁</div>
                <p style={{ fontWeight: 600, color: "white", marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                  {uploadingPrivacy ? "Uploading PDF..." : "Drag & drop PDF here"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Max size 2MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          onClick={handleSaveAll}
          disabled={isPending || uploadingTerms || uploadingPrivacy}
          className="btn btn-primary"
          style={{ minWidth: "180px", padding: "0.75rem 1.5rem" }}
        >
          {isPending ? "Saving Settings..." : "Save Platform Settings"}
        </button>
      </div>
    </div>
  );
}
