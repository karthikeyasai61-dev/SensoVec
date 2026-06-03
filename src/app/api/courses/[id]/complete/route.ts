import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isCompleted } = body;

    const courseRef = adminDb.collection("courses").doc(id);
    await courseRef.update({
      isCompleted: !!isCompleted,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, isCompleted: !!isCompleted });
  } catch (error: any) {
    console.error("Complete course error:", error);
    return NextResponse.json({ error: error.message || "Failed to update course completion status" }, { status: 500 });
  }
}
