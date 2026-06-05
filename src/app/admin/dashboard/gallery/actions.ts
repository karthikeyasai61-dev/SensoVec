"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";

async function verifyAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") throw new Error("Unauthorized");
}

export async function addGalleryItem(formData: FormData) {
  await verifyAuth();

  const title = (formData.get("title") as string) || "";
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!description) {
    throw new Error("Description is required");
  }
  if (!imageUrl) {
    throw new Error("Image is required");
  }

  const snapshot = await adminDb.collection("gallery").get();
  if (snapshot.size >= 6) {
    throw new Error("Maximum limit of 6 slides reached. Please delete an existing slide first.");
  }

  await adminDb.collection("gallery").add({
    title,
    description,
    imageUrl,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/admin/dashboard/gallery");
  revalidatePath("/");
}

export async function deleteGalleryItem(id: string) {
  await verifyAuth();
  await adminDb.collection("gallery").doc(id).delete();
  revalidatePath("/admin/dashboard/gallery");
  revalidatePath("/");
}
