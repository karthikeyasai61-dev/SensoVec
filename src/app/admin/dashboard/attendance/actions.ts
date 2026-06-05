"use server";

import { adminDb } from "../../../../lib/firebase-admin";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: "present" | "absent" | "late";
}

export async function saveAttendance({
  courseId,
  courseName,
  batchSlot,
  date,
  records,
}: {
  courseId: string;
  courseName: string;
  batchSlot: string;
  date: string;
  records: AttendanceRecord[];
}) {
  const docId = `${courseId}_${batchSlot.replace(/[^a-zA-Z0-9]/g, "_")}_${date}`;
  await adminDb.collection("attendance").doc(docId).set({
    courseId,
    courseName,
    batchSlot,
    date,
    records,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return { success: true };
}

export async function getAttendance({
  courseId,
  batchSlot,
  date,
}: {
  courseId: string;
  batchSlot: string;
  date: string;
}) {
  const docId = `${courseId}_${batchSlot.replace(/[^a-zA-Z0-9]/g, "_")}_${date}`;
  const doc = await adminDb.collection("attendance").doc(docId).get();
  if (!doc.exists) return null;
  return doc.data() as { records: AttendanceRecord[]; updatedAt: string };
}
