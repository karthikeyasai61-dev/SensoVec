"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Enrollment {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  createdAt: string;
  paymentStatus: string;
  selectedSlot?: string;
  completed?: boolean;
  course: { title: string; duration?: string; category?: string };
  student: { name: string; email: string; phone?: string; parentPhone?: string; parentRelation?: string };
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A–Z", value: "name_asc" },
  { label: "Name Z–A", value: "name_desc" },
];

function formatINDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getWhatsAppUrl(phoneStr: string) {
  let sanitized = phoneStr.replace(/\D/g, ""); // remove all non-digits
  if (sanitized.length === 10) {
    sanitized = "91" + sanitized;
  }
  return `https://wa.me/${sanitized}`;
}

// Fully custom dropdown - no native <select>
function CustomDropdown({ label, value, options, onChange, icon }: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.55rem 0.85rem",
          borderRadius: "10px",
          background: open ? "rgba(0,153,255,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(0,153,255,0.6)" : "rgba(255,255,255,0.12)"}`,
          color: "var(--text-primary)",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: 500,
          transition: "all 0.2s",
          whiteSpace: "nowrap",
          minWidth: "140px",
          boxShadow: open ? "0 0 0 3px rgba(0,153,255,0.1)" : "none",
          fontFamily: "inherit",
        }}
      >
        <span style={{ color: "var(--primary)", display: "flex" }}>{icon}</span>
        <span style={{ flex: 1, textAlign: "left" }}>{selected?.label || label}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.6 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          minWidth: "100%",
          zIndex: 100,
          background: "rgba(10,15,30,0.97)",
          border: "1px solid rgba(0,153,255,0.25)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,153,255,0.1)",
          backdropFilter: "blur(20px)",
          animation: "fadeIn 0.15s ease-out",
        }}>
          {options.map((opt, i) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "0.6rem 1rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: opt.value === value ? 700 : 400,
                color: opt.value === value ? "var(--primary)" : "var(--text-primary)",
                background: opt.value === value ? "rgba(0,153,255,0.1)" : "transparent",
                borderBottom: i < options.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                transition: "background 0.15s, color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = opt.value === value ? "rgba(0,153,255,0.1)" : "transparent"; }}
            >
              {opt.value === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {opt.value !== value && <span style={{ width: 12 }} />}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentDataClient({
  enrollments, courseNames, activeTab = "Course"
}: {
  enrollments: Enrollment[];
  courseNames: string[];
  activeTab?: string;
}) {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const router = useRouter();
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    parentPhone: "",
    parentRelation: "",
    selectedSlot: "",
    paymentStatus: "pending",
    completed: false,
  });

  const startEdit = (e: Enrollment) => {
    setEditingEnrollment(e);
    setEditError("");
    setEditForm({
      name: e.studentName || e.student.name || "",
      email: e.studentEmail || e.student.email || "",
      phone: e.studentPhone || e.student.phone || "",
      parentPhone: e.student.parentPhone || "",
      parentRelation: e.student.parentRelation || "",
      selectedSlot: e.selectedSlot || "",
      paymentStatus: (e.paymentStatus || "pending").toLowerCase(),
      completed: !!e.completed,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollment) return;
    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch("/api/admin/update-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: editingEnrollment.id,
          studentId: editingEnrollment.studentId,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          parentPhone: editForm.parentPhone,
          parentRelation: editForm.parentRelation,
          selectedSlot: editForm.selectedSlot,
          paymentStatus: editForm.paymentStatus,
          completed: editForm.completed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update details");

      setEditingEnrollment(null);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const courseOptions = [
    { label: `All ${activeTab}s`, value: "All" },
    ...courseNames.map(c => ({ label: c, value: c }))
  ];
  const paymentOptions = [
    { label: "All Payments", value: "All" },
    { label: "✓  Paid", value: "paid" },
    { label: "⏳  Pending", value: "pending" },
    { label: "✗  Failed", value: "failed" },
  ];
  const statusOptions = [
    { label: "All Statuses", value: "All" },
    { label: "● Active", value: "Active" },
    { label: "✓  Completed", value: "Completed" },
  ];

  const filtered = useMemo(() => {
    let list = [...enrollments].map(e => ({
      ...e,
      paymentStatus: (e.paymentStatus || "pending").toLowerCase(), // normalize PAID → paid
    }));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        (e.studentName || e.student.name || "").toLowerCase().includes(q) ||
        (e.studentEmail || e.student.email || "").toLowerCase().includes(q) ||
        (e.studentPhone || e.student.phone || "").includes(q) ||
        e.course.title.toLowerCase().includes(q)
      );
    }
    if (filterCourse !== "All") list = list.filter(e => e.course.title === filterCourse);
    if (filterPayment !== "All") list = list.filter(e => e.paymentStatus === filterPayment);
    if (filterStatus === "Active") list = list.filter(e => !e.completed);
    if (filterStatus === "Completed") list = list.filter(e => e.completed);
    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      const na = (a.studentName || a.student.name || "").toLowerCase();
      const nb = (b.studentName || b.student.name || "").toLowerCase();
      if (sortBy === "name_asc") return na.localeCompare(nb);
      if (sortBy === "name_desc") return nb.localeCompare(na);
      return 0;
    });
    return list;
  }, [enrollments, search, filterCourse, filterPayment, filterStatus, sortBy]);

  const paidCount = enrollments.filter(e => (e.paymentStatus || "").toLowerCase() === "paid").length;
  const pendingCount = enrollments.filter(e => (e.paymentStatus || "").toLowerCase() !== "paid").length;
  const activeCount = enrollments.filter(e => !e.completed).length;
  const hasFilters = search || filterCourse !== "All" || filterPayment !== "All" || filterStatus !== "All";

  function exportToExcel() {
    const rows = filtered.map((e, idx) => ({
      "#": idx + 1,
      "Name": e.studentName || e.student?.name || "",
      "Email": e.studentEmail || e.student?.email || "",
      "Phone": e.studentPhone || e.student?.phone || "-",
      "Parent Phone": e.student?.parentPhone ? `${e.student.parentPhone} (${e.student.parentRelation || "Parent"})` : "-",
      [activeTab]: e.course?.title || "",
      "Slot": e.selectedSlot || "-",
      "Enrolled On": formatINDate(e.createdAt),
      "Payment Status": (e.paymentStatus || "").toUpperCase(),
      "Enrollment Status": e.completed ? "Completed" : "Active",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String((r as any)[key] || "").length)) + 2
    }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab} Students`);

    const fileName = `SensoVec_${activeTab}_Students_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: `Total ${activeTab} Students`, value: enrollments.length, color: "var(--primary)", bg: "rgba(0,153,255,0.08)", border: "rgba(0,153,255,0.2)" },
          { label: "Paid", value: paidCount, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
          { label: "Unpaid / Pending", value: pendingCount, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
          { label: "Active Students", value: activeCount, color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
        ].map(stat => (
          <div key={stat.label} style={{ padding: "1.1rem", textAlign: "center", borderRadius: "12px", background: stat.bg, border: `1px solid ${stat.border}` }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.4rem", fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 230px" }}>
          <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--primary)", opacity: 0.7 }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()} students…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "2.2rem", width: "100%", fontSize: "0.85rem", fontFamily: "inherit" }}
          />
        </div>

        <CustomDropdown
          label={`All ${activeTab}s`}
          value={filterCourse}
          options={courseOptions}
          onChange={setFilterCourse}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
        />

        <CustomDropdown
          label="All Payments"
          value={filterPayment}
          options={paymentOptions}
          onChange={setFilterPayment}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
        />

        <CustomDropdown
          label="All Statuses"
          value={filterStatus}
          options={statusOptions}
          onChange={setFilterStatus}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
        />

        <CustomDropdown
          label="Newest First"
          value={sortBy}
          options={SORT_OPTIONS}
          onChange={setSortBy}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" /></svg>}
        />

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterCourse("All"); setFilterPayment("All"); setFilterStatus("All"); }}
            style={{
              padding: "0.5rem 0.85rem", borderRadius: "10px",
              border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
              color: "#ef4444", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "inherit",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</div>
            No students match the current filters.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Name", "Email", "Phone", "Parent", activeTab, "Slot", "Enrolled On", "Payment", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", background: "rgba(0,0,0,0.25)", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, idx) => (
                <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = "rgba(0,153,255,0.04)")}
                  onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}
                >
                  <td style={td}><span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{idx + 1}</span></td>
                  <td style={{ ...td, fontWeight: 700 }}>{e.studentName || e.student.name}</td>
                  <td style={{ ...td, fontSize: "0.83rem", color: "var(--text-secondary)" }}>{e.studentEmail || e.student.email}</td>
                  <td style={td}>
                    {(e.studentPhone || e.student.phone) ? (
                      <a
                        href={getWhatsAppUrl(e.studentPhone || e.student.phone || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                        title="Chat on WhatsApp"
                      >
                        {e.studentPhone || e.student.phone}
                        <span style={{ fontSize: "0.8rem" }}>💬</span>
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ ...td, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {e.student.parentPhone ? (
                      <>
                        <a
                          href={getWhatsAppUrl(e.student.parentPhone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--text-secondary)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          title="Chat on WhatsApp"
                        >
                          {e.student.parentPhone}
                          <span style={{ fontSize: "0.75rem" }}>💬</span>
                        </a>
                        {` (${e.student.parentRelation || "Parent"})`}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ ...td, fontWeight: 500 }}>{e.course.title}</td>
                  <td style={{ ...td, fontSize: "0.8rem", color: "var(--text-secondary)" }}>{e.selectedSlot || "-"}</td>
                  <td style={{ ...td, fontSize: "0.83rem", whiteSpace: "nowrap" }}>{formatINDate(e.createdAt)}</td>
                  <td style={td}>
                    <span style={{
                      display: "inline-block", padding: "0.25rem 0.65rem", borderRadius: "999px",
                      fontSize: "0.73rem", fontWeight: 700, whiteSpace: "nowrap",
                      background: e.paymentStatus === "paid" ? "rgba(16,185,129,0.15)" : e.paymentStatus === "failed" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      color: e.paymentStatus === "paid" ? "#10b981" : e.paymentStatus === "failed" ? "#ef4444" : "#f59e0b",
                      border: `1px solid ${e.paymentStatus === "paid" ? "rgba(16,185,129,0.3)" : e.paymentStatus === "failed" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                    }}>
                      {e.paymentStatus === "paid" ? "✓ Paid" : e.paymentStatus === "failed" ? "✗ Failed" : "⏳ Pending"}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{
                      display: "inline-block", padding: "0.25rem 0.65rem", borderRadius: "999px",
                      fontSize: "0.73rem", fontWeight: 700,
                      background: e.completed ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)",
                      color: e.completed ? "#6366f1" : "#10b981",
                      border: `1px solid ${e.completed ? "rgba(99,102,241,0.3)" : "rgba(16,185,129,0.3)"}`,
                    }}>
                      {e.completed ? "Completed" : "● Active"}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      type="button"
                      onClick={() => startEdit(e)}
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        border: "1px solid rgba(0,153,255,0.4)",
                        background: "rgba(0,153,255,0.08)",
                        color: "var(--primary)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = "rgba(0,153,255,0.18)")}
                      onMouseLeave={ev => (ev.currentTarget.style.background = "rgba(0,153,255,0.08)")}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.83rem", margin: 0 }}>
          Showing <strong style={{ color: "white" }}>{filtered.length}</strong> of <strong style={{ color: "white" }}>{enrollments.length}</strong> {activeTab.toLowerCase()} students
        </p>
        {filtered.length > 0 && (
          <button
            onClick={exportToExcel}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.55rem 1.1rem", borderRadius: "10px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.35)",
              color: "#10b981", cursor: "pointer", fontSize: "0.85rem",
              fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.1)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Excel ({filtered.length} rows)
          </button>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingEnrollment && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            border: "1px solid rgba(0,153,255,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Edit Student Details</h2>
              <button 
                type="button"
                onClick={() => setEditingEnrollment(null)}
                style={{
                  background: "transparent", border: "none", color: "var(--text-secondary)",
                  cursor: "pointer", fontSize: "1.5rem", display: "flex", alignItems: "center"
                }}
              >
                &times;
              </button>
            </div>

            {editError && (
              <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem", padding: "0.5rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={editForm.name} 
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    value={editForm.email} 
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Parent Phone</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={editForm.parentPhone} 
                    onChange={e => setEditForm({ ...editForm, parentPhone: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Relation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Father, Mother"
                    value={editForm.parentRelation} 
                    onChange={e => setEditForm({ ...editForm, parentRelation: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Selected Slot</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editForm.selectedSlot} 
                  onChange={e => setEditForm({ ...editForm, selectedSlot: e.target.value })} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select 
                    className="form-input"
                    value={editForm.paymentStatus}
                    onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                    style={{ background: "#0c0e17" }}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-input"
                    value={editForm.completed ? "completed" : "active"}
                    onChange={e => setEditForm({ ...editForm, completed: e.target.value === "completed" })}
                    style={{ background: "#0c0e17" }}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => setEditingEnrollment(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const td: React.CSSProperties = { padding: "0.7rem 1rem" };
