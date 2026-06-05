import Link from "next/link";
import { adminDb } from "../../../lib/firebase-admin";
import StudentDataClient from "./StudentDataClient";
import ExportAllButton from "./ExportAllButton";

export const dynamic = "force-dynamic";

const TABS = ["Course", "Internship", "Workshop", "Career", "Service"];

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolved = await searchParams;
  const activeTab = resolved.tab || "Course";

  // Fetch all inventory items for this category (for the dropdown)
  const inventoryQuery = await adminDb.collection("courses").get();
  const allInventory = inventoryQuery.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  const inventoryForTab = allInventory
    .filter(item => {
      let cat = item.category;
      if (cat === "Certification") cat = "Career";
      if (activeTab === "Course") return !cat || cat === "Course";
      return cat === activeTab;
    })
    .map(item => item.title)
    .filter(Boolean)
    .sort() as string[];

  // Fetch all enrollments with course + student data
  const enrollmentsQuery = await adminDb.collection("enrollments").orderBy("createdAt", "desc").get();
  const allEnrollments = await Promise.all(enrollmentsQuery.docs.map(async (doc) => {
    const data = doc.data();
    const [courseDoc, studentDoc] = await Promise.all([
      adminDb.collection("courses").doc(data.courseId).get(),
      adminDb.collection("students").doc(data.studentId).get()
    ]);
    return {
      id: doc.id,
      ...data,
      course: courseDoc.exists ? courseDoc.data() : { title: "Unknown", duration: "-", category: "Course" },
      student: studentDoc.exists ? studentDoc.data() : { name: "Unknown", email: "Unknown", phone: "-", parentPhone: null, parentRelation: null }
    };
  })) as any[];

  // Filter enrollments by active tab
  const enrollments = allEnrollments.filter(e => {
    let cat = e.course?.category;
    if (cat === "Certification") cat = "Career";
    if (activeTab === "Course") return !cat || cat === "Course";
    return cat === activeTab;
  });

  // Count per tab for badges
  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = allEnrollments.filter(e => {
      let cat = e.course?.category;
      if (cat === "Certification") cat = "Career";
      if (tab === "Course") return !cat || cat === "Course";
      return cat === tab;
    }).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="animate-fade-in">
      {/* Page header with Export All */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "var(--spacing-lg)" }}>
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>Student Data Sheet</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage enrolled students by category.</p>
        </div>
        <ExportAllButton allEnrollments={allEnrollments} />
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", overflowX: "auto" }}>
        {TABS.map(tab => (
          <Link
            key={tab}
            href={`/admin/dashboard?tab=${tab}`}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: activeTab === tab ? "rgba(0,153,255,0.1)" : "transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: activeTab === tab ? 600 : 400,
              textDecoration: "none",
              border: `1px solid ${activeTab === tab ? "var(--primary)" : "transparent"}`,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {tab}s
            <span style={{
              background: activeTab === tab ? "var(--primary)" : "rgba(255,255,255,0.1)",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.1rem 0.45rem",
              minWidth: "18px",
              textAlign: "center",
            }}>{tabCounts[tab]}</span>
          </Link>
        ))}
      </div>

      <StudentDataClient
        enrollments={enrollments}
        courseNames={inventoryForTab}
        activeTab={activeTab}
      />
    </div>
  );
}
