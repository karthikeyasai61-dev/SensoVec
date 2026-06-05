import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import ScrollToTop from "../components/ScrollToTop";
import { adminDb } from "../lib/firebase-admin";

export const metadata: Metadata = {
  title: "SensoVec",
  description: "Sense • Think • Move - Autonomous Systems",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let emails: string[] = ["sensovec@gmail.com"];
  let phones: string[] = ["+91 79813 45277"];
  let address: string = "Door No. 14-189, Sai Brundhavan Colony, Morampudi Rd, Aditya Nagar, Rajamahendravaram, Andhra Pradesh 533106, India";

  try {
    const doc = await adminDb.collection("settings").doc("contact").get();
    if (doc.exists) {
      const data = doc.data();
      if (data) {
        if (data.emails && data.emails.length > 0) emails = data.emails;
        if (data.phones && data.phones.length > 0) phones = data.phones;
        if (data.address) address = data.address;
      }
    }
  } catch (error) {
    console.error("Failed to fetch contact settings for layout:", error);
  }

  const contactData = { emails, phones, address };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0d0d12" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@700;800;900&family=Orbitron:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="app-container">
        {children}
        <Footer contactData={contactData} />
        <FloatingWhatsApp />
        <ScrollToTop />
      </body>
    </html>
  );
}
