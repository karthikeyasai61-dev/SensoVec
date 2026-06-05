import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("admin_auth")?.value === "true";
    const isStudent = !!cookieStore.get("student_auth")?.value;
    if (!isAdmin && !isStudent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Enforce 2MB size limit (2 * 1024 * 1024 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 2MB limit." }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params object - ALL params sent (except file, api_key, cloud_name, resource_type)
    // must be sorted alphabetically and included in the signature string
    const params: Record<string, string> = {
      folder,
      timestamp: timestamp.toString(),
    };

    // Sort alphabetically and build string
    const paramsToSign = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join("&");

    // Try SHA-1 first (default for most accounts)
    const signature = createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    console.log("[Upload] Signing string:", paramsToSign);
    console.log("[Upload] Signature (SHA-1):", signature);
    console.log("[Upload] API Key:", apiKey);

    // Build multipart form for Cloudinary
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp.toString());
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: uploadForm }
    );

    const data = await res.json();
    console.log("[Upload] Cloudinary response:", JSON.stringify(data).slice(0, 300));

    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
