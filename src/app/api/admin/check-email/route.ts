import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const query = await adminDb.collection("students").where("email", "==", email.toLowerCase().trim()).get();
    return NextResponse.json({ exists: !query.empty });
  } catch (error) {
    console.error("Check Email Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
