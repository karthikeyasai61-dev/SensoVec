"use client";

import { useState } from "react";

export default function ShareButton({ courseId, title, description }: {
  courseId: string;
  title: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function getUrl() {
    return `${window.location.origin}/course/${courseId}`;
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const url = getUrl();
    if (navigator.share) {
      navigator.share({ title, text: `Check out this career opportunity: ${title}`, url }).catch(() => {});
    } else {
      setOpen(prev => !prev);
    }
  }

  function handleWhatsApp(e: React.MouseEvent) {
    e.stopPropagation();
    const url = getUrl();
    const desc = description ? description.substring(0, 100) + "..." : "";
    const text = encodeURIComponent(`🔥 Check out this career opportunity!\n\n*${title}*\n${desc}\n\nApply here: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setOpen(false);
  }

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const url = getUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setOpen(false);
  }

  return (
    <div
      style={{ position: "relative", display: "inline-block", zIndex: 10 }}
      onClick={e => e.stopPropagation()}
    >
      {/* Share icon button */}
      <button
        onClick={handleClick}
        title="Share this career"
        style={{
          background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "50%",
          width: "38px", height: "38px",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#f59e0b",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.25)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.12)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop to close */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", right: 0,
            background: "rgba(13,13,18,0.98)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "14px",
            padding: "0.5rem",
            minWidth: "175px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 100,
            animation: "fadeIn 0.15s ease",
          }}>
            <p style={{
              fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
              padding: "0.25rem 0.75rem 0.5rem",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
              margin: 0,
            }}>
              Share via
            </p>

            {/* WhatsApp */}
            <button onClick={handleWhatsApp} style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              width: "100%", padding: "0.55rem 0.75rem",
              background: "none", border: "none", cursor: "pointer",
              color: "#25d366", fontSize: "0.85rem", fontWeight: 600,
              fontFamily: "inherit", borderRadius: "8px",
              transition: "background 0.15s", textAlign: "left",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,211,102,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>

            {/* Copy Link */}
            <button onClick={handleCopy} style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              width: "100%", padding: "0.55rem 0.75rem",
              background: "none", border: "none", cursor: "pointer",
              color: copied ? "#10b981" : "rgba(255,255,255,0.8)",
              fontSize: "0.85rem", fontWeight: 600,
              fontFamily: "inherit", borderRadius: "8px",
              transition: "background 0.15s", textAlign: "left",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
