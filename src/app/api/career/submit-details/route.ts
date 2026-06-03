import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get("student_auth")?.value;
    if (!studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { courseId, additionalDetails } = await request.json();
    if (!courseId || !additionalDetails) {
      return NextResponse.json({ error: "Missing courseId or additionalDetails" }, { status: 400 });
    }

    const { fullName, mobileNumber, emailId, qualification, collegeName, skillsKnown, preferredDomain, whyInternship, availabilityTimings } = additionalDetails;
    if (!fullName || !mobileNumber || !emailId || !qualification || !collegeName || !skillsKnown || !preferredDomain || !whyInternship || !availabilityTimings) {
      return NextResponse.json({ error: "Missing mandatory applicant details" }, { status: 400 });
    }

    // Find application document matching student and course
    const appsQuery = await adminDb.collection("career_applications")
      .where("studentId", "==", studentId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (appsQuery.empty) {
      return NextResponse.json({ error: "No active application found for this career posting" }, { status: 404 });
    }

    const appDoc = appsQuery.docs[0];
    const appData = appDoc.data();

    // Verify current status
    if (appData.status !== "approved_for_details") {
      return NextResponse.json({ error: "Application is not approved to submit details yet" }, { status: 400 });
    }

    // Auto-enroll student since careers are free (price is 0)
    await appDoc.ref.update({
      status: "enrolled",
      additionalDetails,
      updatedAt: new Date().toISOString(),
    });

    const enrollmentRef = adminDb.collection("enrollments").doc();
    await enrollmentRef.set({
      studentId,
      studentName: fullName,
      studentEmail: emailId,
      studentPhone: mobileNumber,
      joinDate: new Date().toISOString(),
      selectedSlot: "",
      paymentStatus: "free",
      courseId,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: "enrolled",
    });
  } catch (error: any) {
    console.error("Submit career details error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit details" }, { status: 500 });
  }
}
