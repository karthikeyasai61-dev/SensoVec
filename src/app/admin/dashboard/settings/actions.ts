"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";

async function verifyAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") throw new Error("Unauthorized");
}

export async function saveSettings(
  legalData: { termsUrl: string; privacyUrl: string },
  contactData: { emails: string[]; phones: string[]; address: string }
) {
  await verifyAuth();

  await Promise.all([
    adminDb.collection("settings").doc("legal").set({
      termsAndConditionsUrl: legalData.termsUrl || "",
      privacyPolicyUrl: legalData.privacyUrl || "",
      updatedAt: new Date().toISOString(),
    }, { merge: true }),
    adminDb.collection("settings").doc("contact").set({
      emails: contactData.emails || [],
      phones: contactData.phones || [],
      address: contactData.address || "",
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  ]);

  revalidatePath("/admin/dashboard/settings");
  revalidatePath("/terms-and-conditions");
  revalidatePath("/privacy-policy");
  revalidatePath("/contact-us");
  revalidatePath("/");
}
