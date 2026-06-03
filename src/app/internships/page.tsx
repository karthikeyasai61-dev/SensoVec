import Link from "next/link";
import { Suspense } from "react";
import OfferingsGrid from "../../components/OfferingsGrid";
import Navbar from "../../components/Navbar";
import { cookies } from "next/headers";
import LogoSpinner from "../../components/LogoSpinner";

export const dynamic = "force-dynamic";

export default async function InternshipsPage() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("student_auth") || cookieStore.get("admin_auth")?.value === "true";

  return (
    <>
      <Navbar />
      <div className="container main-content" style={{ paddingTop: "2.5rem", minHeight: "80vh" }}>
        <div className="category-header">
          <h1 className="text-gradient category-title">Internships</h1>
          <Link href="/" className="btn btn-secondary">Back to Home</Link>
        </div>
        
        <Suspense fallback={<LogoSpinner size={50} padding="4rem 0" />}>
          <OfferingsGrid isLoggedIn={isLoggedIn} category="Internship" />
        </Suspense>
      </div>
    </>
  );
}
