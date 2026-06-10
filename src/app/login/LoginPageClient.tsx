"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPageClient({ redirectUrl }: { redirectUrl?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { email, password };

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirectUrl || "/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email || !user.displayName) {
        throw new Error("Could not retrieve email or name from Google account");
      }

      // Check if user already exists
      const checkRes = await fetch(`/api/admin/check-email?email=${encodeURIComponent(user.email)}`);
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error || "Failed to verify registration status");

      if (checkData.exists) {
        // Log in immediately
        const res = await fetch("/api/admin/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
            uid: user.uid,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google login failed");

        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push(redirectUrl || "/");
        }
        router.refresh();
      } else {
        // Redirect to signup page with query params to pre-fill and require details
        const signupRedirect = redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : "";
        router.push(`/signup?google=true&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.displayName)}&uid=${user.uid}${signupRedirect}`);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      let errMsg = "Google Login failed. Please try again.";
      if (err.code) {
        switch (err.code) {
          case "auth/popup-blocked":
            errMsg = "The login popup was blocked by your browser. Please enable popups for this site.";
            break;
          case "auth/unauthorized-domain":
            errMsg = `This domain (${window.location.hostname}) is not authorized for Google Sign-In. Please add it to your Firebase Auth Authorized Domains.`;
            break;
          case "auth/configuration-not-found":
            errMsg = "Google sign-in is not enabled in your Firebase project configuration.";
            break;
          case "auth/popup-closed-by-user":
            errMsg = "The login popup was closed before completing authentication.";
            break;
          case "auth/network-request-failed":
            errMsg = "Network error. Please check your internet connection and try again.";
            break;
          default:
            errMsg = err.message || errMsg;
        }
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px", margin: "auto" }}>
      <div className="glass-card">
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "2rem" }}>
          <span className="text-gradient">SensoVec</span> Login
        </h1>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email or Username</label>
            <input id="email" type="text" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--text-secondary)" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }}></div>
          <span style={{ padding: "0 1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-secondary"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
