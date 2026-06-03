"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { saveAttendance, getAttendance } from "./actions";

interface Course { id: string; title: string; category: string; timeSlots: string[] }
interface Enrollment { id: string; courseId: string; selectedSlot: string; studentId: string; studentName: string; studentEmail: string }
type AttStatus = "present" | "absent" | "late";

const STATUS_CONFIG: Record<AttStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  present: { label: "Present", color: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", icon: "✓" },
  absent: { label: "Absent", color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", icon: "✗" },
  late: { label: "Late", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", icon: "⏰" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Course: "#0099ff", Internship: "#10b981", Career: "#f59e0b", Service: "#6366f1",
};

export default function AttendanceClient({ courses, enrollments }: { courses: Course[]; enrollments: Enrollment[] }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, AttStatus>>({});
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Students enrolled in selected course + slot
  const students = useMemo(() => {
    if (!selectedCourse) return [];
    return enrollments.filter(e =>
      e.courseId === selectedCourse.id &&
      (selectedSlot === "" || e.selectedSlot === selectedSlot)
    );
  }, [selectedCourse, selectedSlot, enrollments]);

  // Unique slots that students actually selected when enrolling in this course
  const slots = useMemo(() => {
    if (!selectedCourse) return [];
    return [...new Set(
      enrollments
        .filter(e => e.courseId === selectedCourse.id && e.selectedSlot)
        .map(e => e.selectedSlot)
    )].sort();
  }, [selectedCourse, enrollments]);

  // Load existing attendance when course+slot+date changes
  useEffect(() => {
    if (!selectedCourse || !selectedSlot || !date) return;
    setSaved(false);
    startTransition(async () => {
      const existing = await getAttendance({ courseId: selectedCourse.id, batchSlot: selectedSlot, date });
      if (existing) {
        const map: Record<string, AttStatus> = {};
        existing.records.forEach(r => { map[r.studentId] = r.status; });
        setAttendance(map);
        setSaved(true);
      } else {
        // Default all to present
        const map: Record<string, AttStatus> = {};
        students.forEach(s => { map[s.studentId] = "present"; });
        setAttendance(map);
      }
    });
  }, [selectedCourse?.id, selectedSlot, date]);

  // When students list changes (new course/slot), reset attendance
  useEffect(() => {
    const map: Record<string, AttStatus> = {};
    students.forEach(s => { map[s.studentId] = attendance[s.studentId] || "present"; });
    setAttendance(map);
  }, [students]);

  function toggleStatus(studentId: string) {
    setAttendance(prev => {
      const cur = prev[studentId] || "present";
      const next: AttStatus = cur === "present" ? "absent" : cur === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
    setSaved(false);
  }

  function setAll(status: AttStatus) {
    const map: Record<string, AttStatus> = {};
    students.forEach(s => { map[s.studentId] = status; });
    setAttendance(map);
    setSaved(false);
  }

  function handleSave() {
    if (!selectedCourse || !selectedSlot) return;
    startTransition(async () => {
      const records = students.map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        studentEmail: s.studentEmail,
        status: attendance[s.studentId] || "present",
      }));
      await saveAttendance({ courseId: selectedCourse.id, courseName: selectedCourse.title, batchSlot: selectedSlot, date, records });
      setSaved(true);
    });
  }

  const presentCount = students.filter(s => attendance[s.studentId] === "present").length;
  const absentCount = students.filter(s => attendance[s.studentId] === "absent").length;
  const lateCount = students.filter(s => attendance[s.studentId] === "late").length;

  // Group courses by category
  const grouped = useMemo(() => {
    const g: Record<string, Course[]> = {};
    courses.forEach(c => {
      let cat = c.category || "Course";
      if (cat === "Certification") cat = "Career";
      if (!g[cat]) g[cat] = [];
      g[cat].push(c);
    });
    return g;
  }, [courses]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }}>

      {/* LEFT: Course + Batch Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Course Picker */}
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>Select Course</h3>
          {Object.keys(grouped).length === 0 && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No courses added yet.</p>
          )}
          {Object.entries(grouped).map(([cat, catCourses]) => (
            <div key={cat} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: CATEGORY_COLORS[cat] || "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{cat}s</div>
              {catCourses.map(course => (
                <button key={course.id} onClick={() => { setSelectedCourse(course); setSelectedSlot(""); setAttendance({}); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "0.65rem 0.85rem", borderRadius: "10px",
                    background: selectedCourse?.id === course.id ? `${CATEGORY_COLORS[cat] || "#0099ff"}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedCourse?.id === course.id ? CATEGORY_COLORS[cat] || "#0099ff" : "rgba(255,255,255,0.08)"}`,
                    color: selectedCourse?.id === course.id ? "white" : "var(--text-secondary)",
                    cursor: "pointer", fontSize: "0.85rem", fontWeight: selectedCourse?.id === course.id ? 600 : 400,
                    marginBottom: "0.4rem", transition: "all 0.2s", fontFamily: "inherit",
                  }}
                >
                  {course.title}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Batch (Slot) Picker */}
        {selectedCourse && (
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>Select Slot</h3>
            {slots.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>No enrolled slots found for this course.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {slots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "0.6rem 0.85rem", borderRadius: "10px", textAlign: "left",
                      background: selectedSlot === slot ? "rgba(0,153,255,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedSlot === slot ? "rgba(0,153,255,0.6)" : "rgba(255,255,255,0.08)"}`,
                      color: selectedSlot === slot ? "var(--primary)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: "0.85rem", fontWeight: selectedSlot === slot ? 600 : 400,
                      fontFamily: "inherit", transition: "all 0.2s",
                    }}
                  >
                    🕐 {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Picker */}
        {selectedSlot && (
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>Date</h3>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="form-input" style={{ width: "100%", fontFamily: "inherit" }} />
          </div>
        )}
      </div>

      {/* RIGHT: Attendance Sheet */}
      <div>
        {!selectedCourse && (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p>Select a course from the left to start marking attendance.</p>
          </div>
        )}

        {selectedCourse && !selectedSlot && (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🕐</div>
            <p>Now select a batch (time slot) for <strong style={{ color: "white" }}>{selectedCourse.title}</strong>.</p>
          </div>
        )}

        {selectedCourse && selectedSlot && (
          <div>
            {/* Header */}
            <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{selectedCourse.title}</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Slot: <strong style={{ color: "white" }}>{selectedSlot}</strong> &nbsp;·&nbsp; Date: <strong style={{ color: "white" }}>{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</strong>
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {[
                    { count: presentCount, ...STATUS_CONFIG.present },
                    { count: absentCount, ...STATUS_CONFIG.absent },
                    { count: lateCount, ...STATUS_CONFIG.late },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", padding: "0.5rem 0.75rem", borderRadius: "8px", background: s.bg, border: `1px solid ${s.border}` }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: s.color }}>{s.count}</div>
                      <div style={{ fontSize: "0.7rem", color: s.color }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk Actions */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", alignSelf: "center", marginRight: "0.25rem" }}>Mark all:</span>
                {(Object.keys(STATUS_CONFIG) as AttStatus[]).map(status => {
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <button key={status} onClick={() => setAll(status)}
                      style={{
                        padding: "0.35rem 0.85rem", borderRadius: "8px", border: `1px solid ${cfg.border}`,
                        background: cfg.bg, color: cfg.color, cursor: "pointer", fontSize: "0.8rem",
                        fontWeight: 600, fontFamily: "inherit",
                      }}>
                      {cfg.icon} {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Student Cards */}
            {students.length === 0 ? (
              <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
                No students enrolled in this batch yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                {students.map(student => {
                  const status = attendance[student.studentId] || "present";
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={student.studentId}
                      style={{
                        padding: "1rem 1.25rem", borderRadius: "12px",
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        display: "flex", alignItems: "center", gap: "0.85rem",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${cfg.color}33, ${cfg.color}11)`,
                        border: `2px solid ${cfg.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", fontWeight: 800, color: cfg.color,
                      }}>
                        {student.studentName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.studentName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.studentEmail}</div>
                      </div>

                      {/* P / A / L Buttons */}
                      <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                        {([
                          { s: "present" as AttStatus, label: "P", color: "#10b981", activeBg: "rgba(16,185,129,0.25)", border: "rgba(16,185,129,0.6)" },
                          { s: "absent" as AttStatus, label: "A", color: "#ef4444", activeBg: "rgba(239,68,68,0.25)", border: "rgba(239,68,68,0.6)" },
                          { s: "late" as AttStatus, label: "L", color: "#f59e0b", activeBg: "rgba(245,158,11,0.25)", border: "rgba(245,158,11,0.6)" },
                        ]).map(btn => (
                          <button
                            key={btn.s}
                            onClick={() => { setAttendance(prev => ({ ...prev, [student.studentId]: btn.s })); setSaved(false); }}
                            title={STATUS_CONFIG[btn.s].label}
                            style={{
                              width: "32px", height: "32px", borderRadius: "8px",
                              background: status === btn.s ? btn.activeBg : "rgba(255,255,255,0.04)",
                              border: `2px solid ${status === btn.s ? btn.border : "rgba(255,255,255,0.1)"}`,
                              color: status === btn.s ? btn.color : "var(--text-secondary)",
                              fontWeight: 800, fontSize: "0.8rem", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s", fontFamily: "inherit",
                              transform: status === btn.s ? "scale(1.1)" : "scale(1)",
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save Button */}
            {students.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button onClick={handleSave} disabled={isPending}
                  className="btn btn-primary"
                  style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}>
                  {isPending ? "Saving…" : "Save Attendance"}
                </button>
                {saved && !isPending && (
                  <span style={{ color: "#10b981", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Attendance saved!
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
