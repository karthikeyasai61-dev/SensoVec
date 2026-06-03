import { adminDb } from "../../../../lib/firebase-admin";
import AttendanceClient from "./AttendanceClient";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  // Fetch all courses with their time slots
  const coursesSnap = await adminDb.collection("courses").orderBy("createdAt", "desc").get();
  const courses = coursesSnap.docs.map(d => ({
    id: d.id,
    title: d.data().title as string,
    category: (d.data().category || "Course") as string,
    timeSlots: (d.data().timeSlots || []) as string[],
  }));

  // Fetch all enrollments to map students to course+slot
  const enrollSnap = await adminDb.collection("enrollments").get();
  const enrollments = await Promise.all(
    enrollSnap.docs.map(async doc => {
      const d = doc.data();
      const studentDoc = await adminDb.collection("students").doc(d.studentId).get();
      const student = studentDoc.exists ? studentDoc.data() : null;
      return {
        id: doc.id,
        courseId: d.courseId as string,
        selectedSlot: (d.selectedSlot || "") as string,
        studentId: d.studentId as string,
        studentName: (d.studentName || student?.name || "Unknown") as string,
        studentEmail: (d.studentEmail || student?.email || "") as string,
      };
    })
  );

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "0.5rem" }}>Attendance</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
        Select a course and batch to mark daily attendance.
      </p>
      <AttendanceClient courses={courses} enrollments={enrollments} />
    </div>
  );
}
