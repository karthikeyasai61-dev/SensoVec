import Link from "next/link";
import { adminDb } from "../../../../lib/firebase-admin";
import AddCourseForm from "./AddCourseForm";
import CourseActionsClient from "./CourseActionsClient";

export const dynamic = "force-dynamic";

const tabs = ["Course", "Internship", "Workshop", "Career", "Service"];

export default async function InventoryManager({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "Course";

  const coursesQuery = await adminDb.collection("courses").orderBy("createdAt", "desc").get();
  const allItems = coursesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  
  const displayedItems = allItems.filter(item => {
    let cat = item.category;
    if (cat === "Certification") cat = "Career";
    if (activeTab === "Course") {
      return !cat || cat === "Course";
    }
    return cat === activeTab;
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "0.5rem" }}>Inventory Manager</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
        Manage your offerings individually by category.
      </p>

      {/* TABS */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", overflowX: "auto" }}>
        {tabs.map(tab => (
          <Link 
            key={tab} 
            href={`/admin/dashboard/inventory?tab=${tab}`}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: activeTab === tab ? "rgba(0,153,255,0.1)" : "transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: activeTab === tab ? 600 : 400,
              textDecoration: "none",
              border: `1px solid ${activeTab === tab ? "var(--primary)" : "transparent"}`,
              whiteSpace: "nowrap"
            }}
          >
            {tab}s
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--spacing-lg)" }}>
        <div>
          <div className="glass-card">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Add New {activeTab}</h2>
            <AddCourseForm defaultCategory={activeTab} />
          </div>
        </div>

        <div>
          <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
            <CourseActionsClient courses={displayedItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
