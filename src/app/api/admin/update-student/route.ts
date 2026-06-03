import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      enrollmentId,
      studentId,
      name,
      email,
      phone,
      parentPhone,
      parentRelation,
      selectedSlot,
      paymentStatus,
      completed,
    } = await request.json();

    if (!enrollmentId || !studentId) {
      return NextResponse.json({ error: "Enrollment ID and Student ID are required" }, { status: 400 });
    }

    // Prepare updates for student doc
    const studentUpdate: Record<string, any> = {};
    if (name !== undefined) studentUpdate.name = name;
    if (email !== undefined) studentUpdate.email = email.toLowerCase().trim();
    if (phone !== undefined) studentUpdate.phone = phone;
    if (parentPhone !== undefined) studentUpdate.parentPhone = parentPhone;
    if (parentRelation !== undefined) studentUpdate.parentRelation = parentRelation;
    studentUpdate.updatedAt = new Date().toISOString();

    // Prepare updates for enrollment doc
    const enrollmentUpdate: Record<string, any> = {};
    if (name !== undefined) enrollmentUpdate.studentName = name;
    if (email !== undefined) enrollmentUpdate.studentEmail = email.toLowerCase().trim();
    if (phone !== undefined) enrollmentUpdate.studentPhone = phone;
    if (selectedSlot !== undefined) enrollmentUpdate.selectedSlot = selectedSlot;
    if (paymentStatus !== undefined) enrollmentUpdate.paymentStatus = paymentStatus;
    if (completed !== undefined) enrollmentUpdate.completed = completed;
    enrollmentUpdate.updatedAt = new Date().toISOString();

    // Perform updates in parallel
    await Promise.all([
      adminDb.collection("students").doc(studentId).update(studentUpdate),
      adminDb.collection("enrollments").doc(enrollmentId).update(enrollmentUpdate)
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update student error:", error);
    return NextResponse.json({ error: error.message || "Failed to update student details" }, { status: 500 });
  }
}
