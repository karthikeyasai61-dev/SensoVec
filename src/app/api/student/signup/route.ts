import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { 
      name, email, password, phone, 
      role, educationLevel, currentDomain, interestedDomain,
      googleUid
    } = await request.json();

    if (!name || !email || (!password && !googleUid)) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === "sensovec@gmail.com") {
      return NextResponse.json({ error: "This email address is reserved for administrator accounts." }, { status: 400 });
    }

    const existing = await adminDb.collection("students").where("email", "==", normalizedEmail).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : "google-oauth-managed-account";
    const studentRef = adminDb.collection("students").doc();
    const studentData = {
        name, email: email.toLowerCase().trim(), password: hashedPassword, phone: phone || null, 
        role: role || null, educationLevel: educationLevel || null, 
        currentDomain: currentDomain || null, interestedDomain: interestedDomain || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        googleUid: googleUid || null,
    };
    await studentRef.set(studentData);

    return NextResponse.json({ success: true, studentId: studentRef.id, name: studentData.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
