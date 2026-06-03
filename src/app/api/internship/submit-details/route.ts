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
    const appsQuery = await adminDb.collection("internship_applications")
      .where("studentId", "==", studentId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (appsQuery.empty) {
      return NextResponse.json({ error: "No active application found for this internship" }, { status: 404 });
    }

    const appDoc = appsQuery.docs[0];
    const appData = appDoc.data();

    // Verify current status
    if (appData.status !== "approved_for_details") {
      return NextResponse.json({ error: "Application is not approved to submit details yet" }, { status: 400 });
    }

    await appDoc.ref.update({
      status: "details_filled",
      additionalDetails,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: "details_filled",
    });
  } catch (error: any) {
    console.error("Submit internship details error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit details" }, { status: 500 });
  }
}
