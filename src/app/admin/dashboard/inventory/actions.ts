"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";

async function verifyAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") throw new Error("Unauthorized");
}

export async function addCourse(formData: FormData) {
  await verifyAuth();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priceVal = formData.get("price") as string;
  const price = (priceVal && !isNaN(parseFloat(priceVal))) ? parseFloat(priceVal) : 0;
  const originalPriceVal = formData.get("originalPrice") as string;
  const originalPrice = (originalPriceVal && !isNaN(parseFloat(originalPriceVal))) ? parseFloat(originalPriceVal) : null;
  const type = (formData.get("type") as string) || "ONLINE";
  const category = (formData.get("category") as string) || "Course";
  const duration = (formData.get("duration") as string) || "";
  const timeSlots = (formData.get("timeSlots") as string) || "";
  const imageUrl = formData.get("imageUrl") as string;

  const reqLinkedin = formData.get("reqLinkedin") === "on";
  const reqPortfolio = formData.get("reqPortfolio") === "on";
  const reqWorkExp = formData.get("reqWorkExp") === "on";
  const reqCommSkills = formData.get("reqCommSkills") === "on";
  const reqTeamwork = formData.get("reqTeamwork") === "on";
  const reqProject = formData.get("reqProject") === "on";
  const reqAadhaar = formData.get("reqAadhaar") === "on";
  const reqPan = formData.get("reqPan") === "on";
  const reqOfferLetters = formData.get("reqOfferLetters") === "on";
  const reqExcessiveDoc = formData.get("reqExcessiveDoc") === "on";

  await adminDb.collection("courses").add({
    title, description, price, originalPrice, type, category, duration, timeSlots, imageUrl: imageUrl || null,
    reqLinkedin, reqPortfolio, reqWorkExp, reqCommSkills, reqTeamwork, reqProject,
    reqAadhaar, reqPan, reqOfferLetters, reqExcessiveDoc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/dashboard/inventory");
  revalidatePath("/");
}

export async function deleteCourse(id: string) {
  await verifyAuth();
  await adminDb.collection("courses").doc(id).delete();
  revalidatePath("/admin/dashboard/inventory");
  revalidatePath("/");
}
