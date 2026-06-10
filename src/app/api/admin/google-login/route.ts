import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, name, uid } = await request.json();
    const cookieStore = await cookies();

    if (!email || !name) {
      return NextResponse.json({ error: "Email and Name are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user is the Admin
    if (normalizedEmail === "sensovec@gmail.com") {
      cookieStore.set("admin_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ success: true, role: "admin", name: "Admin" });
    }

    // Check if student already exists in our collection
    const studentsQuery = await adminDb.collection("students").where("email", "==", normalizedEmail).get();
    let studentId = "";
    let studentName = name;

    if (studentsQuery.empty) {
      // Create a new student record
      const studentRef = adminDb.collection("students").doc();
      const studentData = {
        name,
        email: normalizedEmail,
        password: "google-oauth-managed-account", // Placeholder since password isn't used
        phone: "",
        role: "Student",
        educationLevel: "School(1-10)",
        currentDomain: "",
        interestedDomain: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        googleUid: uid || null,
      };
      await studentRef.set(studentData);
      studentId = studentRef.id;
    } else {
      // Use existing student record
      const studentDoc = studentsQuery.docs[0];
      studentId = studentDoc.id;
      studentName = studentDoc.data().name || name;

      // Optionally update their googleUid if not set
      if (uid && !studentDoc.data().googleUid) {
        await studentDoc.ref.update({ googleUid: uid, updatedAt: new Date().toISOString() });
      }
    }

    // Set standard student session cookies
    cookieStore.set("student_auth", studentId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    
    cookieStore.set("student_name", studentName, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, role: "student", name: studentName });
  } catch (error) {
    console.error("Google Login Backend Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
