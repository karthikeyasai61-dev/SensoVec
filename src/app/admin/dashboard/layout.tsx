import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { adminDb } from "../../../lib/firebase-admin";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  if (!isAdmin) redirect("/login");

  let internshipPendingCount = 0;
  let careerPendingCount = 0;
  try {
    const [internshipSnap, careerSnap] = await Promise.all([
      adminDb.collection("internship_applications").where("status", "==", "pending").count().get(),
      adminDb.collection("career_applications").where("status", "==", "pending").count().get()
    ]);
    internshipPendingCount = internshipSnap.data().count;
    careerPendingCount = careerSnap.data().count;
  } catch (error) {
    console.error("Failed to fetch pending counts:", error);
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white" }}>
              Senso<span style={{ color: "var(--primary)" }}>Vec</span>
            </span>
          </Link>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Admin Panel</p>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin/dashboard" className={styles.navLink}>Student Data</Link>
          <Link style={{ contentVisibility: "auto" }} href="/admin/dashboard/attendance" className={styles.navLink}>Attendance</Link>
          <Link href="/admin/dashboard/inventory" className={styles.navLink}>Inventory Manager</Link>
          <Link href="/admin/dashboard/gallery" className={styles.navLink}>Homepage Gallery</Link>
          <Link href="/admin/dashboard/live-updates" className={styles.navLink}>Live Updates</Link>
          <Link href="/admin/dashboard/internship-applications" className={styles.navLink}>
            <span>Internship Applications</span>
            {internshipPendingCount > 0 && (
              <span className={styles.badge}>{internshipPendingCount}</span>
            )}
          </Link>
          <Link href="/admin/dashboard/career-applications" className={styles.navLink}>
            <span>Career Applications</span>
            {careerPendingCount > 0 && (
              <span className={styles.badge}>{careerPendingCount}</span>
            )}
          </Link>
          <Link href="/admin/dashboard/settings" className={styles.navLink}>Platform Settings</Link>
          <form action="/api/admin/logout" method="POST" style={{ marginTop: "auto", padding: "1rem" }}>
            <button type="submit" className={styles.logoutBtn}>Logout</button>
          </form>
        </nav>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
