"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Course:        { color: "#0099ff", bg: "rgba(0,153,255,0.1)" },
  Internship:    { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  Workshop:      { color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  Career:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Service:       { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
};

export default function OfferingsGridClient({ courses: rawCourses, isLoggedIn, category }: { courses: any[]; isLoggedIn: boolean; category?: string }) {
  const courses = useMemo(() => {
    return rawCourses.map(c => {
      const cat = c.category || "Course";
      if (cat === "Certification") {
        return { ...c, category: "Career" };
      }
      return c;
    });
  }, [rawCourses]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(category || "All");
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(courses.map(c => c.category || "Course"))];
    return ["All", ...cats.sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    let list = courses;
    if (activeFilter !== "All") {
      list = list.filter(c => (c.category || "Course") === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [courses, search, activeFilter]);

  function getShareUrl(courseId: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/course/${courseId}`;
    }
    return `/course/${courseId}`;
  }

  function handleShare(course: any) {
    const url = getShareUrl(course.id);
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: `Check out this career opportunity: ${course.title}`,
        url,
      }).catch(() => {});
    } else {
      setShareOpenId(shareOpenId === course.id ? null : course.id);
    }
  }

  function handleCopyLink(courseId: string) {
    const url = getShareUrl(courseId);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(courseId);
      setTimeout(() => setCopiedId(null), 2000);
    });
    setShareOpenId(null);
  }

  function handleWhatsApp(course: any) {
    const url = getShareUrl(course.id);
    const text = encodeURIComponent(`🔥 Check out this career opportunity!\n\n*${course.title}*\n${course.description ? course.description.substring(0, 100) + "..." : ""}\n\nApply here: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareOpenId(null);
  }

  return (
    <div onClick={() => setShareOpenId(null)}>
      {/* Search + Category Filter Bar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "0.75rem",
        alignItems: "center", marginBottom: "1.75rem",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "400px" }}>
          <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--primary)", opacity: 0.7 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={category ? `Search ${category.toLowerCase()}s...` : "Search courses, internships, services…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.7rem 1rem 0.7rem 2.5rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,153,255,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
              display: "flex", alignItems: "center", padding: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        {!category && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {categories.map(cat => {
              const cfg = CATEGORY_COLORS[cat] || { color: "var(--primary)", bg: "rgba(0,153,255,0.1)" };
              const isActive = activeFilter === cat;
              return (
                <button key={cat} onClick={() => setActiveFilter(cat)}
                  style={{
                    padding: "0.45rem 1rem", borderRadius: "999px",
                    background: isActive ? (cat === "All" ? "var(--primary)" : cfg.bg) : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isActive ? (cat === "All" ? "var(--primary)" : cfg.color) : "rgba(255,255,255,0.1)"}`,
                    color: isActive ? (cat === "All" ? "white" : cfg.color) : "var(--text-secondary)",
                    cursor: "pointer", fontSize: "0.82rem", fontWeight: isActive ? 700 : 400,
                    fontFamily: "inherit", transition: "all 0.2s",
                    boxShadow: isActive ? `0 0 12px ${cat === "All" ? "rgba(0,153,255,0.2)" : cfg.color + "30"}` : "none",
                  }}
                >
                  {cat === "All" ? "All Offerings" : `${cat}s`}
                </button>
              );
            })}
          </div>
        )}

        {/* Result count */}
        {(search || activeFilter !== "All") && (
          <span style={{ color: "var(--text-secondary)", fontSize: "0.83rem", marginLeft: "auto" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No results found</h3>
          <p style={{ color: "var(--text-secondary)" }}>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="offerings-grid">
          {filtered.map(course => {
            const cat = course.category || "Course";
            const cfg = CATEGORY_COLORS[cat] || { color: "var(--primary)", bg: "rgba(0,153,255,0.1)" };
            const isShareOpen = shareOpenId === course.id;
            const isCopied = copiedId === course.id;
            return (
              <div key={course.id} className="offering-card glass-card animate-fade-in"
                style={{ position: "relative" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px ${cfg.color}30`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >

                {course.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.imageUrl} alt={course.title} className="offering-card-img" />
                )}
                 <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <span className="offering-card-tag" style={{
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.color}30`,
                  }}>
                    {cat === "Career" ? cat : `${cat} • ${course.type}`}
                  </span>
                  <h3 className="offering-card-title">{course.title}</h3>
                  <p className="offering-card-desc">{course.description}</p>
                  {cat !== "Career" && (
                    <div className="offering-card-meta">
                      {course.duration && <span>⏱ {course.duration}</span>}
                      {course.timeSlots && <span>🕐 {course.timeSlots.split(",").map((s: string) => s.trim()).join(" | ")}</span>}
                    </div>
                  )}
                </div>
                <div className="offering-card-footer" style={{ paddingTop: "1.25rem" }}>
                   {cat === "Career" ? (
                     <div style={{ display: "flex", width: "100%", gap: "0.5rem", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                       <Link href={isLoggedIn ? `/course/${course.id}` : "/login"} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", flexGrow: 1, textAlign: "center" }}>
                         {isLoggedIn ? "Apply Now" : "Login to Apply"}
                       </Link>
                       <div style={{ position: "relative", display: "inline-block", zIndex: 10 }}>
                         <button
                           id={`share-btn-${course.id}`}
                           onClick={() => handleShare(course)}
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
                           onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.25)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"; }}
                           onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.12)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                         >
                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                             <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                             <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                           </svg>
                         </button>

                         {/* Share Dropdown */}
                         {isShareOpen && (
                           <div style={{
                             position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                             background: "rgba(13,13,18,0.98)",
                             border: "1px solid rgba(245,158,11,0.25)",
                             borderRadius: "14px",
                             padding: "0.5rem",
                             minWidth: "175px",
                             boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.08)",
                             backdropFilter: "blur(20px)",
                             zIndex: 100,
                             animation: "fadeIn 0.15s ease",
                           }}>
                             <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", padding: "0.25rem 0.75rem 0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                               Share via
                             </p>

                             {/* WhatsApp */}
                             <button onClick={() => handleWhatsApp(course)} style={{
                               display: "flex", alignItems: "center", gap: "0.6rem",
                               width: "100%", padding: "0.55rem 0.75rem",
                               background: "none", border: "none", cursor: "pointer",
                               color: "#25d366", fontSize: "0.85rem", fontWeight: 600,
                               fontFamily: "inherit", borderRadius: "8px",
                               transition: "background 0.15s",
                               textAlign: "left",
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
                             <button onClick={() => handleCopyLink(course.id)} style={{
                               display: "flex", alignItems: "center", gap: "0.6rem",
                               width: "100%", padding: "0.55rem 0.75rem",
                               background: "none", border: "none", cursor: "pointer",
                               color: isCopied ? "#10b981" : "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 600,
                               fontFamily: "inherit", borderRadius: "8px",
                               transition: "background 0.15s",
                               textAlign: "left",
                             }}
                               onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"}
                               onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
                             >
                               {isCopied ? (
                                 <>
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                   Copied!
                                 </>
                               ) : (
                                 <>
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                                   Copy Link
                                 </>
                               )}
                             </button>
                           </div>
                         )}
                       </div>
                     </div>
                   ) : (
                     <>
                       {cat !== "Career" && (
                         cat === "Workshop" && course.originalPrice ? (
                           <span className="offering-card-price" style={{ display: "inline-flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                             <span style={{ fontSize: "1.15rem", color: "#06b6d4" }}>{formatINR(course.price)}</span>
                             <span style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--text-secondary)", fontWeight: 500 }}>{formatINR(course.originalPrice)}</span>
                           </span>
                         ) : (
                           <span className="offering-card-price">{formatINR(course.price)}</span>
                         )
                       )}
                       <Link href={isLoggedIn ? `/course/${course.id}` : "/login"} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", textAlign: "center" }}>
                         {isLoggedIn ? (
                           cat === "Internship" ? "Apply Now" :
                           cat === "Service" ? "Enquire Now" : "Enroll Now"
                         ) : (
                           cat === "Internship" ? "Login to Apply" :
                           cat === "Service" ? "Login to Enquire" : "Login to Enroll"
                         )}
                       </Link>
                     </>
                   )}
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
