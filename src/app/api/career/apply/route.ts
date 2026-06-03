import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import path from "path";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get("student_auth")?.value;
    if (!studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { courseId, courseTitle, resumeUrl, sscFullName, whatsappNumber } = await request.json();
    if (!courseId || !courseTitle || !resumeUrl || !sscFullName || !whatsappNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Retrieve student info from Firestore to populate application
    const studentDoc = await adminDb.collection("students").doc(studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }
    const studentData = studentDoc.data()!;

    // Check if an application already exists for this student and career course
    const existingApps = await adminDb.collection("career_applications")
      .where("studentId", "==", studentId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    let applicationRef;
    let applicationData: any = {};

    if (!existingApps.empty) {
      const appDoc = existingApps.docs[0];
      const appData = appDoc.data();
      if (appData.status === "enrolled") {
        return NextResponse.json({ error: "Already applied/registered for this career opportunity" }, { status: 400 });
      }
      applicationRef = appDoc.ref;
      applicationData = {
        ...appData,
        studentName: sscFullName,
        sscFullName,
        whatsappNumber,
        resumeUrl,
        status: "pending",
        updatedAt: new Date().toISOString(),
      };
    } else {
      applicationRef = adminDb.collection("career_applications").doc();
      applicationData = {
        studentId,
        studentName: sscFullName,
        studentEmail: studentData.email || "",
        studentPhone: studentData.phone || "",
        sscFullName,
        whatsappNumber,
        courseId,
        courseTitle,
        resumeUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    await applicationRef.set(applicationData, { merge: true });

    // Send confirmation email via Gmail SMTP
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const recipientEmail = studentData.email || "";
      if (recipientEmail) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await transporter.sendMail({
          from: `"SensoVec" <${process.env.SMTP_USER}>`,
          to: recipientEmail,
          subject: `Application Received: ${courseTitle} - SensoVec`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background-color: #0c0e17; color: #f8fafc; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td style="padding-right: 10px; vertical-align: middle;">
                      <img src="cid:sensoveclogo" alt="SensoVec Logo" style="width: 38px; height: 38px; display: block; border-radius: 50%;" />
                    </td>
                    <td style="vertical-align: middle; line-height: 1;">
                      <span style="font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; font-weight: 900; letter-spacing: 2px; line-height: 1;">
                        <span style="color: #f1f5f9; font-size: 22px; font-weight: 900; vertical-align: middle;">S</span><span style="color: #f1f5f9; font-size: 13px; font-weight: 900; vertical-align: middle;">ENSO</span><span style="color: #0099ff; font-size: 22px; font-weight: 900; vertical-align: middle;">V</span><span style="color: #0099ff; font-size: 13px; font-weight: 900; vertical-align: middle;">EC</span>
                      </span>
                    </td>
                  </tr>
                </table>
                <div style="height: 2px; width: 60px; background: linear-gradient(90deg, #0088ff, #00c6ff); margin: 15px auto 0;"></div>
              </div>
              
              <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 20px;">Dear <strong>${sscFullName}</strong>,</p>
              
              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 20px; color: #cbd5e1;">
                Thank you for choosing <strong>SensoVec</strong> for your career journey. We have successfully received your application for the <strong>${courseTitle}</strong> opportunity.
              </p>
              
              <div style="font-size: 1rem; line-height: 1.6; margin-bottom: 24px; background: rgba(0, 136, 255, 0.08); border: 1px solid rgba(0, 136, 255, 0.2); padding: 16px; border-radius: 10px; color: #38bdf8;">
                <strong>Next Steps:</strong><br/>
                Our team is currently reviewing your resume. We will contact you shortly via <strong>WhatsApp</strong> at <strong>${whatsappNumber}</strong> to discuss further procedures.
              </div>
              
              <p style="font-size: 0.95rem; line-height: 1.6; color: #94a3b8; margin-bottom: 30px;">
                If you have any questions or did not submit this application, please feel free to reply directly to this email.
              </p>
              
              <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 25px 0;" />
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="font-size: 0.9rem; line-height: 1.6; color: #64748b; margin: 0;">
                      Best regards,<br/>
                      <strong>Team SensoVec</strong>
                    </p>
                  </td>
                  <td align="right" style="vertical-align: bottom;">
                    <span style="font-size: 0.75rem; color: #475569; font-family: monospace;">Ref: SV-${Math.floor(100000 + Math.random() * 900000)}</span>
                  </td>
                </tr>
              </table>
            </div>
          `,
          attachments: [{
            filename: "logo.png",
            path: path.join(process.cwd(), "public/logo.png"),
            cid: "sensoveclogo"
          }]
        });
      }
    } catch (emailError) {
      console.error("Nodemailer failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      application: { id: applicationRef.id, ...applicationData }
    });
  } catch (error: any) {
    console.error("Career application error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
  }
}
