import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { title, description, price, originalPrice, type, category, duration, timeSlots, imageUrl,
      reqLinkedin, reqPortfolio, reqWorkExp, reqCommSkills, reqTeamwork, reqProject,
      reqAadhaar, reqPan, reqOfferLetters, reqExcessiveDoc
    } = body;

    const courseRef = adminDb.collection("courses").doc(resolvedParams.id);
    await courseRef.update({
      title,
      description,
      price: (price && !isNaN(parseFloat(price))) ? parseFloat(price) : 0,
      originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null,
      type: type || "ONLINE",
      category: category || "Course",
      duration,
      timeSlots,
      imageUrl,
      reqLinkedin: !!reqLinkedin,
      reqPortfolio: !!reqPortfolio,
      reqWorkExp: !!reqWorkExp,
      reqCommSkills: !!reqCommSkills,
      reqTeamwork: !!reqTeamwork,
      reqProject: !!reqProject,
      reqAadhaar: !!reqAadhaar,
      reqPan: !!reqPan,
      reqOfferLetters: !!reqOfferLetters,
      reqExcessiveDoc: !!reqExcessiveDoc,
      updatedAt: new Date().toISOString()
    });
    const courseDoc = await courseRef.get();
    const course = { id: courseDoc.id, ...courseDoc.data() };

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await adminDb.collection("courses").doc(resolvedParams.id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
