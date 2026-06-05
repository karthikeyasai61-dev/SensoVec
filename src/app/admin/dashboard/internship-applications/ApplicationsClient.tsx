"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function getWhatsAppUrl(phoneStr: string) {
  let sanitized = phoneStr.replace(/\D/g, ""); // remove all non-digits
  if (sanitized.length === 10) {
    sanitized = "91" + sanitized;
  }
  return `https://wa.me/${sanitized}`;
}

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  sscFullName?: string;
  whatsappNumber?: string;
  courseId: string;
  courseTitle: string;
  resumeUrl: string;
  status: "pending" | "approved_for_details" | "details_filled" | "enrolled" | "rejected";
  additionalDetails?: {
    fullName: string;
    mobileNumber: string;
    emailId: string;
    qualification: string;
    collegeName: string;
    skillsKnown: string;
    preferredDomain: string;
    whyInternship: string;
    resumeUrl?: string;
    availabilityTimings: string;
    linkedinProfile?: string;
    portfolio?: string;
    workExperience?: string;
    communicationSkills?: string;
    teamworkExperience?: string;
    projectExperience?: string;
    aadhaarUrl?: string;
    panUrl?: string;
    offerLettersUrl?: string;
    excessiveDocUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationsClient({ initialApplications, category = "Internship" }: { initialApplications: Application[]; category?: "Internship" | "Career" }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Application | null>(null);
  const router = useRouter();

  const handleStatusChange = async (appId: string, status: "approved_for_details" | "rejected") => {
    setLoadingId(appId);
    try {
      const apiPath = category === "Career" ? "/api/admin/career-applications" : "/api/admin/internship-applications";
      const res = await fetch(apiPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to update application to ${status}`);

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status } : app
      ));

      router.refresh();
    } catch (error: any) {
      alert("Error updating application: " + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const formatINDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const td: React.CSSProperties = {
    padding: "0.85rem 1rem",
    verticalAlign: "middle",
    fontSize: "0.88rem",
    color: "var(--text-primary)"
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
        {applications.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📁</div>
            No {category.toLowerCase()} applications found.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Student Details", category === "Career" ? "Career Title" : "Internship Course", "Resume", "Applied Date", "Status", "Details", "Action"].map(h => (
                  <th key={h} style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    background: "rgba(0,0,0,0.25)",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    borderBottom: "1px solid var(--border-color)"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => {
                const statusColorMap = {
                  pending: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)", label: "Pending Review" },
                  approved_for_details: { bg: "rgba(99,102,241,0.15)", text: "#6366f1", border: "rgba(99,102,241,0.3)", label: "Details Pending" },
                  details_filled: { bg: "rgba(6,182,212,0.15)", text: "#06b6d4", border: "rgba(6,182,212,0.3)", label: "Details Filled" },
                  enrolled: { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)", label: category === "Career" ? "App Successful" : "Enrolled & Paid" },
                  rejected: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.3)", label: "Rejected" }
                };

                const statusInfo = statusColorMap[app.status] || { bg: "rgba(255,255,255,0.1)", text: "white", border: "rgba(255,255,255,0.2)", label: app.status };

                return (
                  <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = "rgba(0,153,255,0.04)")}
                    onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}
                  >
                    {/* Index */}
                    <td style={td}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{idx + 1}</span>
                    </td>

                    {/* Student details */}
                    <td style={td}>
                      <div style={{ fontWeight: 700 }}>{app.sscFullName || app.studentName}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>{app.studentEmail}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        Phone: {app.studentPhone ? (
                          <a href={getWhatsAppUrl(app.studentPhone)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }} title="Chat on WhatsApp">
                            {app.studentPhone}
                          </a>
                        ) : "-"}
                      </div>
                      {app.whatsappNumber && (
                        <div style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 600, marginTop: "0.1rem" }}>
                          WhatsApp: <a href={getWhatsAppUrl(app.whatsappNumber)} target="_blank" rel="noopener noreferrer" style={{ color: "#10b981", textDecoration: "underline" }} title="Chat on WhatsApp">
                            {app.whatsappNumber}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Internship Title */}
                    <td style={{ ...td, fontWeight: 500 }}>{app.courseTitle}</td>

                    {/* Resume link */}
                    <td style={td}>
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        View Resume ↗
                      </a>
                    </td>

                    {/* Applied Date */}
                    <td style={{ ...td, fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                      {formatINDate(app.createdAt)}
                    </td>

                    {/* Status badge */}
                    <td style={td}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        fontSize: "0.73rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        background: statusInfo.bg,
                        color: statusInfo.text,
                        border: `1px solid ${statusInfo.border}`
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Additional Details */}
                    <td style={td}>
                      {app.additionalDetails ? (
                        <button 
                          onClick={() => setSelectedDetails(app)}
                          className="btn btn-secondary" 
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem" }}
                        >
                          View Info
                        </button>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={td}>
                      {app.status === "pending" ? (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleStatusChange(app.id, "approved_for_details")}
                            disabled={loadingId !== null}
                            className="btn btn-primary"
                            style={{
                              padding: "0.35rem 0.65rem",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {loadingId === app.id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, "rejected")}
                            disabled={loadingId !== null}
                            style={{
                              padding: "0.35rem 0.65rem",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.4)",
                              color: "#ef4444",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              whiteSpace: "nowrap"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : app.status === "rejected" ? (
                        <span style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 600 }}>Rejected ✗</span>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Approved ✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modern Pop-up / Modal for Additional Details */}
      {selectedDetails && selectedDetails.additionalDetails && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            maxWidth: "600px",
            width: "90%",
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "2rem",
            position: "relative",
            border: "1px solid var(--border-color)"
          }}>
            <button 
              onClick={() => setSelectedDetails(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "1.25rem",
                cursor: "pointer"
              }}
            >
              ×
            </button>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem" }}>
              Applicant Registration Details
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* --- Section: Mandatory Fields --- */}
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>
                  Mandatory Details
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Full Name:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.fullName}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Email:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.emailId}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Mobile Number:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>
                      <a href={getWhatsAppUrl(selectedDetails.additionalDetails.mobileNumber)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }} title="Chat on WhatsApp">
                        {selectedDetails.additionalDetails.mobileNumber}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Qualification:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.qualification}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>College:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.collegeName}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Preferred Domain:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.preferredDomain}</div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Skills Known:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.skillsKnown}</div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Availability Timings:</span>
                    <div style={{ fontWeight: 600, color: "white" }}>{selectedDetails.additionalDetails.availabilityTimings}</div>
                  </div>
                  <div style={{ gridColumn: "span 2", marginTop: "0.25rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Why do they want this {category.toLowerCase()}?</span>
                    <div style={{
                      marginTop: "0.25rem",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "white",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.4",
                      maxHeight: "120px",
                      overflowY: "auto"
                    }}>
                      {selectedDetails.additionalDetails.whyInternship}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Section: Optional Fields --- */}
              {(selectedDetails.additionalDetails.linkedinProfile || 
                selectedDetails.additionalDetails.portfolio || 
                selectedDetails.additionalDetails.workExperience || 
                selectedDetails.additionalDetails.communicationSkills || 
                selectedDetails.additionalDetails.teamworkExperience || 
                selectedDetails.additionalDetails.projectExperience) && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>
                    Additional Fields
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                    {selectedDetails.additionalDetails.linkedinProfile && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>LinkedIn Profile:</span>
                        <div>
                          <a href={selectedDetails.additionalDetails.linkedinProfile} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}>
                            {selectedDetails.additionalDetails.linkedinProfile} ↗
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedDetails.additionalDetails.portfolio && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Portfolio URL:</span>
                        <div>
                          <a href={selectedDetails.additionalDetails.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}>
                            {selectedDetails.additionalDetails.portfolio} ↗
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedDetails.additionalDetails.workExperience && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Work Experience:</span>
                        <div style={{ color: "white", marginTop: "0.15rem" }}>{selectedDetails.additionalDetails.workExperience}</div>
                      </div>
                    )}

                    {selectedDetails.additionalDetails.communicationSkills && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Communication Skills:</span>
                        <div style={{ color: "white", marginTop: "0.15rem" }}>{selectedDetails.additionalDetails.communicationSkills}</div>
                      </div>
                    )}

                    {selectedDetails.additionalDetails.teamworkExperience && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Teamwork Experience:</span>
                        <div style={{ color: "white", marginTop: "0.15rem" }}>{selectedDetails.additionalDetails.teamworkExperience}</div>
                      </div>
                    )}

                    {selectedDetails.additionalDetails.projectExperience && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Project Experience:</span>
                        <div style={{ color: "white", marginTop: "0.15rem" }}>{selectedDetails.additionalDetails.projectExperience}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- Section: Uploaded Documents --- */}
              {(selectedDetails.resumeUrl || 
                selectedDetails.additionalDetails.aadhaarUrl || 
                selectedDetails.additionalDetails.panUrl || 
                selectedDetails.additionalDetails.offerLettersUrl || 
                selectedDetails.additionalDetails.excessiveDocUrl) && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>
                    Documents & Attachments
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                    {selectedDetails.resumeUrl && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Resume / CV:</span>
                        <div>
                          <a href={selectedDetails.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                            View Resume ↗
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedDetails.additionalDetails.aadhaarUrl && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Aadhaar Card:</span>
                        <div>
                          <a href={selectedDetails.additionalDetails.aadhaarUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                            View Aadhaar ↗
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedDetails.additionalDetails.panUrl && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>PAN Card:</span>
                        <div>
                          <a href={selectedDetails.additionalDetails.panUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                            View PAN ↗
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedDetails.additionalDetails.offerLettersUrl && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Offer Letters:</span>
                        <div>
                          <a href={selectedDetails.additionalDetails.offerLettersUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                            View Offer Letters ↗
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedDetails.additionalDetails.excessiveDocUrl && (
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Excessive Documentation:</span>
                        <div>
                          <a href={selectedDetails.additionalDetails.excessiveDocUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                            View Document ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedDetails(null)}
              className="btn btn-secondary" 
              style={{ width: "100%", marginTop: "1.5rem" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
