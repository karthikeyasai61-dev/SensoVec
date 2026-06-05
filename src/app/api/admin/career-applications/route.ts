import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import path from "path";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb.collection("career_applications")
      .orderBy("createdAt", "desc")
      .get();

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("Admin list career applications error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId, status } = await request.json();
    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appRef = adminDb.collection("career_applications").doc(applicationId);
    const appDoc = await appRef.get();
    if (!appDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const appData = appDoc.data()!;
    const studentEmail = appData.studentEmail;
    const studentName = appData.sscFullName || appData.studentName || "Applicant";
    const courseTitle = appData.courseTitle || "Career Program";
    const courseId = appData.courseId;

    await appRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    // Send email notification based on status
    if (studentEmail && (status === "approved_for_details" || status === "rejected")) {
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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        let subject = "";
        let htmlContent = "";

        if (status === "approved_for_details") {
          subject = `Application Approved - Submit Details: ${courseTitle} - SensoVec`;
          htmlContent = `
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
              
              <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 20px;">Dear <strong>${studentName}</strong>,</p>
              
              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 20px; color: #cbd5e1;">
                Great news! We have reviewed your application and are pleased to inform you that your resume has been approved for the next stage of the <strong>${courseTitle}</strong> program at <strong>SensoVec</strong>.
              </p>
              
              <div style="font-size: 1rem; line-height: 1.6; margin-bottom: 24px; background: rgba(0, 136, 255, 0.08); border: 1px solid rgba(0, 136, 255, 0.2); padding: 16px; border-radius: 10px; color: #38bdf8;">
                <strong>Action Required:</strong><br/>
                Please log in to your account, visit the career posting page, and fill out the additional details required to proceed.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/course/${courseId}" style="background: linear-gradient(90deg, #0088ff, #00c6ff); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(0, 136, 255, 0.3); display: inline-block;">
                  Complete Your Application
                </a>
              </div>
              
              <p style="font-size: 0.95rem; line-height: 1.6; color: #94a3b8; margin-bottom: 30px;">
                If you need any assistance, feel free to reply to this email or reach out to us on WhatsApp.
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
          `;
        } else if (status === "rejected") {
          subject = `Application Status Update: ${courseTitle} - SensoVec`;
          htmlContent = `
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
              
              <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 20px;">Dear <strong>${studentName}</strong>,</p>
              
              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 20px; color: #cbd5e1;">
                Thank you for your interest in the <strong>${courseTitle}</strong> opportunity at <strong>SensoVec</strong>.
              </p>
              
              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 24px; color: #cbd5e1;">
                We have reviewed your application and resume. Unfortunately, we are unable to accept your application for this posting. We receive many applications and are only able to proceed with candidates whose qualifications and experience closely align with our current needs.
              </p>
              
              <div style="font-size: 1rem; line-height: 1.6; margin-bottom: 24px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: 10px; color: #f87171;">
                <strong>What's Next?</strong><br/>
                If you believe there was an issue with your resume or you have updated details to share, you are welcome to log back in to your dashboard and <strong>re-apply</strong>.
              </div>
              
              <p style="font-size: 0.95rem; line-height: 1.6; color: #94a3b8; margin-bottom: 30px;">
                We wish you the very best in your future academic and professional endeavors.
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
          `;
        }

        await transporter.sendMail({
          from: `"SensoVec" <${process.env.SMTP_USER}>`,
          to: studentEmail,
          subject,
          html: htmlContent,
          attachments: [{
            filename: "logo.png",
            path: path.join(process.cwd(), "public/logo.png"),
            cid: "sensoveclogo"
          }]
        });
      } catch (emailError) {
        console.error("Nodemailer failed to send review status email:", emailError);
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Admin career application review error:", error);
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 });
  }
}
