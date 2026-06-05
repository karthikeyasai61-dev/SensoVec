import { adminDb } from "../../../../lib/firebase-admin";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [legalDoc, contactDoc] = await Promise.all([
    adminDb.collection("settings").doc("legal").get(),
    adminDb.collection("settings").doc("contact").get()
  ]);

  const legalData = legalDoc.exists ? legalDoc.data() : null;
  const contactData = contactDoc.exists ? contactDoc.data() : null;

  const termsUrl = legalData?.termsAndConditionsUrl || "";
  const privacyUrl = legalData?.privacyPolicyUrl || "";

  const emails = contactData?.emails || ["sensovec@gmail.com"];
  const phones = contactData?.phones || ["+91 79813 45277"];
  const address = contactData?.address || "Door No. 14-189, Sai Brundhavan Colony, Morampudi Rd, Aditya Nagar, Rajamahendravaram, Andhra Pradesh 533106, India";

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1>Platform Settings</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage contact info (email, phone, address) and legal document policies (Terms & Conditions, Privacy Policy PDFs).
        </p>
      </div>

      <SettingsClient
        initialTermsUrl={termsUrl}
        initialPrivacyUrl={privacyUrl}
        initialEmails={emails}
        initialPhones={phones}
        initialAddress={address}
      />
    </div>
  );
}
