"use client";

import * as XLSX from "xlsx";

const TABS = ["Course", "Internship", "Career", "Service"];

function formatINDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildRows(enrollments: any[], category: string) {
  return enrollments
    .filter(e => {
      let cat = e.course?.category;
      if (cat === "Certification") cat = "Career";
      if (category === "Course") return !cat || cat === "Course";
      return cat === category;
    })
    .map((e, idx) => ({
      "#": idx + 1,
      "Name": e.studentName || e.student?.name || "",
      "Email": e.studentEmail || e.student?.email || "",
      "Phone": e.studentPhone || e.student?.phone || "-",
      "Parent Phone": e.student?.parentPhone
        ? `${e.student.parentPhone} (${e.student.parentRelation || "Parent"})`
        : "-",
      [category]: e.course?.title || "",
      "Slot": e.selectedSlot || "-",
      "Enrolled On": formatINDate(e.createdAt),
      "Payment Status": (e.paymentStatus || "").toUpperCase(),
      "Enrollment Status": e.completed ? "Completed" : "Active",
    }));
}

export default function ExportAllButton({ allEnrollments }: { allEnrollments: any[] }) {
  function exportAll() {
    const wb = XLSX.utils.book_new();

    TABS.forEach(tab => {
      const rows = buildRows(allEnrollments, tab);
      if (rows.length === 0) {
        // Add empty sheet with headers
        const ws = XLSX.utils.aoa_to_sheet([["#", "Name", "Email", "Phone", "Parent Phone", tab, "Slot", "Enrolled On", "Payment Status", "Enrollment Status"]]);
        XLSX.utils.book_append_sheet(wb, ws, `${tab}s`);
        return;
      }
      const ws = XLSX.utils.json_to_sheet(rows);
      // Auto column widths
      ws["!cols"] = Object.keys(rows[0]).map(key => ({
        wch: Math.max(key.length, ...rows.map(r => String((r as any)[key] || "").length)) + 2,
      }));
      XLSX.utils.book_append_sheet(wb, ws, `${tab}s`);
    });

    const fileName = `SensoVec_All_Students_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  return (
    <button
      onClick={exportAll}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1.25rem",
        borderRadius: "10px",
        background: "rgba(16,185,129,0.1)",
        border: "1px solid rgba(16,185,129,0.35)",
        color: "#10b981",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 600,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.2)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.1)"; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export All (Excel)
    </button>
  );
}
