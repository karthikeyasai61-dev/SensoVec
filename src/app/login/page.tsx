import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const resolvedParams = await searchParams;
  const redirectUrl = resolvedParams.redirect;

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  const isStudent = !!cookieStore.get("student_auth")?.value;

  if (isAdmin) redirect("/admin/dashboard");
  if (isStudent) redirect(redirectUrl || "/");

  return (
    <div className="auth-page-wrapper" style={{ display: "flex", minHeight: "100vh", padding: "2rem 1rem", position: "relative" }}>
      {/* Top Left Brand Logo & Title */}
      <div className="brand-logo-container">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 50 A 35 35 0 0 1 85 50" stroke="#0099ff" strokeWidth="10" strokeLinecap="round" />
          <path d="M 85 50 A 35 35 0 0 1 15 50" stroke="#cccccc" strokeWidth="10" strokeLinecap="round" />
          <text x="18" y="70" fontFamily="sans-serif" fontWeight="900" fontSize="56" fill="#cccccc">S</text>
          <text x="52" y="70" fontFamily="sans-serif" fontWeight="900" fontSize="56" fill="#0099ff">V</text>
          <circle cx="85" cy="50" r="10" fill="#0d0d12" stroke="#cccccc" strokeWidth="4" />
          <circle cx="85" cy="50" r="4" fill="#0099ff" />
        </svg>
        <span style={{
          fontSize: "1.1rem",
          fontWeight: 800,
          color: "white",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "sans-serif"
        }}>
          SensoVec
        </span>
      </div>

      <LoginPageClient redirectUrl={redirectUrl} />

      <style>{`
        .brand-logo-container {
          position: absolute;
          top: 2rem;
          left: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .brand-logo-container {
            position: static;
            margin: 1rem auto 1.5rem;
            justify-content: center;
          }
          .auth-page-wrapper {
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
