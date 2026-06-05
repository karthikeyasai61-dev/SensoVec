"use client";

import { useState, useRef } from "react";
import Script from "next/script";

interface Props {
  courseId: string;
  courseTitle: string;
  price: number;
  slots: string[];
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseCategory?: string;
  initialApplication?: any;
  isAlreadyEnrolled?: boolean;
  requirements?: {
    reqLinkedin?: boolean;
    reqPortfolio?: boolean;
    reqWorkExp?: boolean;
    reqCommSkills?: boolean;
    reqTeamwork?: boolean;
    reqProject?: boolean;
    reqAadhaar?: boolean;
    reqPan?: boolean;
    reqOfferLetters?: boolean;
    reqExcessiveDoc?: boolean;
  };
}

export default function CheckoutForm({
  courseId,
  courseTitle,
  price,
  slots,
  studentName,
  studentEmail,
  studentPhone,
  courseCategory = "Course",
  initialApplication = null,
  isAlreadyEnrolled = false,
  requirements = {},
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState(studentName);
  const [email, setEmail] = useState(studentEmail);
  const [phone, setPhone] = useState(studentPhone);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState("");

  // Internship states
  const [application, setApplication] = useState<any>(initialApplication);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sscName, setSscName] = useState(studentName);
  const [whatsapp, setWhatsapp] = useState(studentPhone);

  // Additional details states
  const [fullName, setFullName] = useState(studentName || initialApplication?.sscFullName || "");
  const [mobileNumber, setMobileNumber] = useState(studentPhone || initialApplication?.whatsappNumber || "");
  const [emailId, setEmailId] = useState(studentEmail || "");
  const [qualification, setQualification] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [skillsKnown, setSkillsKnown] = useState("");
  const [preferredDomain, setPreferredDomain] = useState("");
  const [whyInternship, setWhyInternship] = useState("");
  const [availabilityTimings, setAvailabilityTimings] = useState("");

  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [communicationSkills, setCommunicationSkills] = useState("");
  const [teamworkExperience, setTeamworkExperience] = useState("");
  const [projectExperience, setProjectExperience] = useState("");

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [offerLettersFile, setOfferLettersFile] = useState<File | null>(null);
  const [excessiveDocFile, setExcessiveDocFile] = useState<File | null>(null);

  const [submittingDetails, setSubmittingDetails] = useState(false);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sscName.trim()) {
      setError("Please enter your full name according to SSC.");
      return;
    }
    if (!whatsapp.trim()) {
      setError("Please enter your WhatsApp number.");
      return;
    }
    if (!resumeFile) {
      setError("Please select a resume file to upload.");
      return;
    }
    setError("");
    setUploadingResume(true);

    try {
      // 1. Upload resume to Cloudinary through our api endpoint
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("folder", "resumes");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Failed to upload resume");
      }

      // 2. Create application record
      const applyPath = courseCategory === "Career" ? "/api/career/apply" : "/api/internship/apply";
      const applyRes = await fetch(applyPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          courseTitle,
          resumeUrl: uploadData.url,
          sscFullName: sscName,
          whatsappNumber: whatsapp,
        }),
      });

      const applyData = await applyRes.json();
      if (!applyRes.ok) {
        throw new Error(applyData.error || "Failed to submit application");
      }

      setApplication(applyData.application);
    } catch (err: any) {
      setError(err.message || "An error occurred while applying.");
    } finally {
      setUploadingResume(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size exceeds the 2MB limit.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error || `Failed to upload file to ${folder}`);
    }
    return uploadData.url;
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !emailId.trim() || !qualification.trim() || !collegeName.trim() || !skillsKnown.trim() || !preferredDomain.trim() || !whyInternship.trim() || !availabilityTimings.trim()) {
      setError("Please fill in all mandatory details.");
      return;
    }

    // Optional field checks
    if (requirements.reqLinkedin && !linkedinProfile.trim()) {
      setError("Please enter your LinkedIn profile URL.");
      return;
    }
    if (requirements.reqPortfolio && !portfolio.trim()) {
      setError("Please enter your Portfolio URL.");
      return;
    }
    if (requirements.reqWorkExp && !workExperience.trim()) {
      setError("Please describe your Work Experience.");
      return;
    }
    if (requirements.reqCommSkills && !communicationSkills.trim()) {
      setError("Please describe your Communication Skills.");
      return;
    }
    if (requirements.reqTeamwork && !teamworkExperience.trim()) {
      setError("Please describe your Teamwork Experience.");
      return;
    }
    if (requirements.reqProject && !projectExperience.trim()) {
      setError("Please describe your Project Experience.");
      return;
    }

    // File checks
    if (requirements.reqAadhaar && !aadhaarFile) {
      setError("Please upload your Aadhaar Card.");
      return;
    }
    if (requirements.reqPan && !panFile) {
      setError("Please upload your PAN Card.");
      return;
    }
    if (requirements.reqOfferLetters && !offerLettersFile) {
      setError("Please upload your previous Offer Letters.");
      return;
    }
    if (requirements.reqExcessiveDoc && !excessiveDocFile) {
      setError("Please upload the requested personal documentation.");
      return;
    }

    setError("");
    setSubmittingDetails(true);

    try {
      // 1. Sequentially upload optional files if selected
      let aadhaarUrl = "";
      let panUrl = "";
      let offerLettersUrl = "";
      let excessiveDocUrl = "";

      if (requirements.reqAadhaar && aadhaarFile) {
        aadhaarUrl = await uploadFile(aadhaarFile, "aadhaar");
      }
      if (requirements.reqPan && panFile) {
        panUrl = await uploadFile(panFile, "pan");
      }
      if (requirements.reqOfferLetters && offerLettersFile) {
        offerLettersUrl = await uploadFile(offerLettersFile, "offer_letters");
      }
      if (requirements.reqExcessiveDoc && excessiveDocFile) {
        excessiveDocUrl = await uploadFile(excessiveDocFile, "excessive_docs");
      }

      // 2. Submit consolidated payload
      const payload = {
        fullName,
        mobileNumber,
        emailId,
        qualification,
        collegeName,
        skillsKnown,
        preferredDomain,
        whyInternship,
        resumeUrl: application?.resumeUrl || "",
        availabilityTimings,
        linkedinProfile: requirements.reqLinkedin ? linkedinProfile : undefined,
        portfolio: requirements.reqPortfolio ? portfolio : undefined,
        workExperience: requirements.reqWorkExp ? workExperience : undefined,
        communicationSkills: requirements.reqCommSkills ? communicationSkills : undefined,
        teamworkExperience: requirements.reqTeamwork ? teamworkExperience : undefined,
        projectExperience: requirements.reqProject ? projectExperience : undefined,
        aadhaarUrl: requirements.reqAadhaar ? aadhaarUrl : undefined,
        panUrl: requirements.reqPan ? panUrl : undefined,
        offerLettersUrl: requirements.reqOfferLetters ? offerLettersUrl : undefined,
        excessiveDocUrl: requirements.reqExcessiveDoc ? excessiveDocUrl : undefined,
      };

      const submitPath = courseCategory === "Career" ? "/api/career/submit-details" : "/api/internship/submit-details";
      const res = await fetch(submitPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          additionalDetails: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit details");
      }

      setApplication((prev: any) => ({
        ...prev,
        status: data.status || "details_filled",
        additionalDetails: payload,
      }));
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting details.");
    } finally {
      setSubmittingDetails(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courseCategory !== "Service" && !selectedSlot) { setError("Please select a time slot."); return; }
    if (!name || !email || !phone) { setError("Please fill in all your details."); return; }
    setError("");
    setLoading(true);

    try {
      if (courseCategory === "Service" || price === 0) {
        // Direct free enrollment/enquiry submit
        const enrollRes = await fetch("/api/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            selectedSlot: selectedSlot || "",
            name,
            email,
            phone,
          }),
        });
        const enrollData = await enrollRes.json();
        if (!enrollRes.ok) throw new Error(enrollData.error || "Failed to submit enquiry");
        
        // Open WhatsApp of SensoVec with prefilled message
        const whatsappMsg = encodeURIComponent(`Hi sensovec I'm intrested in your service ( ${courseTitle} )`);
        window.open(`https://wa.me/917981345277?text=${whatsappMsg}`, "_blank");

        setSuccess(true);
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, courseId, courseName: courseTitle }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Could not initiate payment");

      // Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SensoVec",
        description: `Enrollment: ${courseTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: { color: "#6366f1" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: false,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Verify payment on server and enroll
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              courseId,
              selectedSlot,
              name,
              email,
              phone,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

          if (courseCategory === "Internship" || courseCategory === "Career") {
            setApplication((prev: any) => prev ? { ...prev, status: "enrolled" } : null);
          }

          setPaymentId(response.razorpay_payment_id);
          setSuccess(true);
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Please try again.");
          },
        },
      };

      // @ts-expect-error — Razorpay loaded via Script tag
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: { error: { description: string } }) => {
        setLoading(false);
        setError(`Payment failed: ${r.error.description}`);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (isAlreadyEnrolled || success || application?.status === "enrolled") {
    const isCareer = courseCategory === "Career";
    const isService = courseCategory === "Service";
    return (
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginBottom: "0.75rem" }}>
          {isCareer ? "Already Applied!" : (isService ? "Already Enquired!" : "Already Enrolled!")}
        </div>
        <h4 style={{ marginBottom: "0.5rem", fontSize: "1.2rem" }}>
          {isCareer ? "Application Confirmed" : (isService ? "Enquiry Confirmed" : "Enrollment Confirmed")}
        </h4>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {isCareer 
            ? "You have successfully applied for this opportunity." 
            : (isService 
              ? `You have successfully enquired about this ${courseCategory.toLowerCase()}.` 
              : `You have successfully enrolled in this ${courseCategory.toLowerCase()}.`
            )}
        </p>
        {paymentId && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Payment ID: <code style={{ color: "var(--primary)" }}>{paymentId}</code>
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          {isService && (
            <a 
              href={`https://wa.me/917981345277?text=${encodeURIComponent(`Hi sensovec I'm intrested in your service ( ${courseTitle} )`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: "inline-block", textDecoration: "none", padding: "0.5rem 1rem" }}
            >
              Chat on WhatsApp
            </a>
          )}
          <a href="/profile" className="btn btn-secondary" style={{ display: "inline-block", textDecoration: "none", padding: "0.5rem 1rem" }}>
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  // Handle Internship/Career flow steps
  if (courseCategory === "Internship" || courseCategory === "Career") {
    const status = application?.status;

    // Step 1: Upload resume and apply
    if (!status) {
      return (
        <form onSubmit={handleApply}>
          {error && (
            <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem", padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
              {error}
            </div>
          )}
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Submit Application
          </p>

          <div style={{ margin: "1rem 0", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
            To apply for this {courseCategory.toLowerCase()}, please submit your resume for admin review. Once approved, you will be cleared to provide additional details to complete your application.
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ssc-name">Full Name (according to SSC)</label>
            <input 
              id="ssc-name"
              type="text" 
              required 
              className="form-input" 
              value={sscName} 
              onChange={(e) => setSscName(e.target.value)} 
              placeholder="Enter name exactly as on SSC certificate"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="whatsapp-num">WhatsApp Number</label>
            <input 
              id="whatsapp-num"
              type="tel" 
              required 
              className="form-input" 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Resume (PDF/Word)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const MAX_SIZE = 2 * 1024 * 1024;
                  if (file.size > MAX_SIZE) {
                    setError("File size exceeds the 2MB limit.");
                    setResumeFile(null);
                  } else {
                    setError("");
                    setResumeFile(file);
                  }
                }
              }}
              style={{
                border: `2px dashed ${dragActive ? "var(--primary)" : "var(--border-color)"}`,
                padding: "2rem 1rem",
                borderRadius: "12px",
                textAlign: "center",
                cursor: "pointer",
                background: dragActive ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                transition: "all 0.3s ease",
                marginBottom: "1.5rem",
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const MAX_SIZE = 2 * 1024 * 1024;
                    if (file.size > MAX_SIZE) {
                      setError("File size exceeds the 2MB limit.");
                      setResumeFile(null);
                    } else {
                      setError("");
                      setResumeFile(file);
                    }
                  }
                }} 
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
              />
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
              {resumeFile ? (
                <div>
                  <p style={{ fontWeight: 600, color: "white", marginBottom: "0.25rem", wordBreak: "break-all" }}>
                    {resumeFile.name}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: "white", marginBottom: "0.25rem" }}>
                    Drag & drop your resume here
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Supports PDF, DOC, DOCX (Max 2MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={uploadingResume}>
            {uploadingResume ? "Uploading & Applying..." : "Submit Application & Express Interest"}
          </button>
        </form>
      );
    }

    // Step 2: Under review
    if (status === "pending") {
      return (
        <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Application Under Review</h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Your application for <strong>{courseTitle}</strong> is under review. The admin will verify your resume and approve you to fill in additional details.
          </p>
          <div style={{
            padding: "0.75rem 1.25rem",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "999px",
            color: "#f59e0b",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "inline-block"
          }}>
            Status: Pending Review
          </div>
        </div>
      );
    }

    // Step 2b: Rejected application
    if (status === "rejected") {
      return (
        <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.5rem" }}>Application Unsuccessful</h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Thank you for your interest in the <strong>{courseTitle}</strong> program at SensoVec. Unfortunately, your application was not selected.
          </p>
          <div style={{
            padding: "0.75rem 1.25rem",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "8px",
            color: "#f87171",
            fontSize: "0.85rem",
            fontWeight: 500,
            lineHeight: "1.4",
            marginBottom: "1.5rem",
            textAlign: "left"
          }}>
            <strong>Recommendation:</strong> If you believe there was an issue with your resume or you have updated information to share, you can re-apply with an updated resume.
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: "100%" }}
            onClick={() => setApplication(null)}
          >
            Re-apply with a different resume
          </button>
        </div>
      );
    }

    // Step 3: Fill additional details
    if (status === "approved_for_details") {
      return (
        <form onSubmit={handleSubmitDetails}>
          {error && (
            <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem", padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
              {error}
            </div>
          )}
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {courseCategory} Details Required
          </p>

          <div style={{ margin: "1rem 0", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
            Your resume was approved! Please fill out the following details to complete your {courseCategory.toLowerCase()} application.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1.5rem 0" }}>
            {/* --- Section: Personal Details --- */}
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Personal Details</span>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input id="fullName" type="text" required className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobileNumber">Mobile Number</label>
              <input id="mobileNumber" type="tel" required className="form-input" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="emailId">Email ID</label>
              <input id="emailId" type="email" required className="form-input" value={emailId} onChange={(e) => setEmailId(e.target.value)} />
            </div>

            {/* --- Section: Academic & Professional --- */}
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Academic & Professional</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="qualification">Qualification</label>
              <input id="qualification" type="text" placeholder="e.g. B.Tech / MCA / BSc" required className="form-input" value={qualification} onChange={(e) => setQualification(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="collegeName">College Name</label>
              <input id="collegeName" type="text" placeholder="College / University Name" required className="form-input" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skillsKnown">Skills Known</label>
              <input id="skillsKnown" type="text" placeholder="e.g. Python, SQL, Javascript" required className="form-input" value={skillsKnown} onChange={(e) => setSkillsKnown(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="preferredDomain">Preferred Domain</label>
              <select id="preferredDomain" required className="form-input" style={{ appearance: "none" }} value={preferredDomain} onChange={(e) => setPreferredDomain(e.target.value)}>
                <option value="">Select Domain</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Data Science">Data Science</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Cloud Engineering / DevOps">Cloud Engineering / DevOps</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* --- Section: Statement & Availability --- */}
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Statement & Availability</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="whyInternship">Why do you want this {courseCategory === "Internship" ? "training program" : courseCategory.toLowerCase()}?</label>
              <textarea id="whyInternship" rows={3} placeholder="Describe your motivations..." required className="form-input" style={{ resize: "vertical" }} value={whyInternship} onChange={(e) => setWhyInternship(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="availabilityTimings">Availability Timings</label>
              <input id="availabilityTimings" type="text" placeholder="e.g. 10 AM - 6 PM, or Part Time" required className="form-input" value={availabilityTimings} onChange={(e) => setAvailabilityTimings(e.target.value)} />
            </div>

            {/* --- Section: Additional Details (Conditional) --- */}
            {(requirements.reqLinkedin || requirements.reqPortfolio || requirements.reqWorkExp || requirements.reqCommSkills || requirements.reqTeamwork || requirements.reqProject) && (
              <>
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Additional Details</span>
                </div>

                {requirements.reqLinkedin && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="linkedinProfile">LinkedIn Profile URL</label>
                    <input id="linkedinProfile" type="url" placeholder="https://linkedin.com/in/username" required className="form-input" value={linkedinProfile} onChange={(e) => setLinkedinProfile(e.target.value)} />
                  </div>
                )}

                {requirements.reqPortfolio && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="portfolio">Portfolio URL</label>
                    <input id="portfolio" type="url" placeholder="https://myportfolio.com" required className="form-input" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
                  </div>
                )}

                {requirements.reqWorkExp && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="workExperience">Work Experience</label>
                    <textarea id="workExperience" rows={2} placeholder="Describe any past work..." required className="form-input" style={{ resize: "vertical" }} value={workExperience} onChange={(e) => setWorkExperience(e.target.value)} />
                  </div>
                )}

                {requirements.reqCommSkills && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="communicationSkills">Communication Skills</label>
                    <input id="communicationSkills" type="text" placeholder="Describe communication strengths..." required className="form-input" value={communicationSkills} onChange={(e) => setCommunicationSkills(e.target.value)} />
                  </div>
                )}

                {requirements.reqTeamwork && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="teamworkExperience">Teamwork Experience</label>
                    <textarea id="teamworkExperience" rows={2} placeholder="Describe teamwork experience..." required className="form-input" style={{ resize: "vertical" }} value={teamworkExperience} onChange={(e) => setTeamworkExperience(e.target.value)} />
                  </div>
                )}

                {requirements.reqProject && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectExperience">Project Experience</label>
                    <textarea id="projectExperience" rows={2} placeholder="Briefly describe key projects..." required className="form-input" style={{ resize: "vertical" }} value={projectExperience} onChange={(e) => setProjectExperience(e.target.value)} />
                  </div>
                )}
              </>
            )}

            {/* --- Section: Document Verification (Conditional File Uploads) --- */}
            {(requirements.reqAadhaar || requirements.reqPan || requirements.reqOfferLetters || requirements.reqExcessiveDoc) && (
              <>
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Document Verification</span>
                </div>

                {requirements.reqAadhaar && (
                  <MiniFileUploader label="Aadhaar Card (PDF / Image)" file={aadhaarFile} setFile={setAadhaarFile} />
                )}

                {requirements.reqPan && (
                  <MiniFileUploader label="PAN Card (PDF / Image)" file={panFile} setFile={setPanFile} />
                )}

                {requirements.reqOfferLetters && (
                  <MiniFileUploader label="Previous Offer Letters (PDF / Image)" file={offerLettersFile} setFile={setOfferLettersFile} />
                )}

                {requirements.reqExcessiveDoc && (
                  <MiniFileUploader label="Excessive Personal Documentation (PDF / Image)" file={excessiveDocFile} setFile={setExcessiveDocFile} />
                )}
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={submittingDetails}>
            {submittingDetails ? "Uploading & Submitting..." : "Submit details"}
          </button>
        </form>
      );
    }
  }

  // Default Course checkout flow or Internship step 4 (details_filled)
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <form onSubmit={handlePayment}>
        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem", padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        {courseCategory === "Internship" && (
          <div style={{
            padding: "0.75rem 1rem",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "8px",
            color: "#10b981",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            textAlign: "center",
            fontWeight: 600,
          }}>
            ✓ Details Submitted & Payment Unlocked
          </div>
        )}

        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Your Details
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="enroll-name">Full Name</label>
          <input id="enroll-name" type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="enroll-email">Email Address</label>
          <input id="enroll-email" type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="enroll-phone">Phone Number</label>
          <input id="enroll-phone" type="tel" required className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>

        {slots.length > 0 && courseCategory !== "Service" && (
          <div className="form-group">
            <label className="form-label">Select Time Slot</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {slots.map((slot) => {
                const trimmed = slot.trim();
                const isChecked = selectedSlot === trimmed;
                return (
                  <label key={trimmed} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.75rem 1rem", borderRadius: "8px",
                    border: `1px solid ${isChecked ? "var(--primary)" : "var(--border-color)"}`,
                    background: isChecked ? "rgba(99,102,241,0.15)" : "var(--bg-color)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <input type="radio" name="slot" value={trimmed} checked={isChecked}
                      onChange={() => setSelectedSlot(trimmed)} style={{ accentColor: "var(--primary)" }} />
                    <span style={{ fontWeight: isChecked ? 600 : 400 }}>{trimmed}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Price summary */}
        {courseCategory !== "Service" && (
          <div style={{ margin: "1.5rem 0", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <span>{courseCategory === "Internship" ? "Training Program Fee" : "Course Fee"}</span><span>{formatINR(price)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
              <span>Total</span><span>{formatINR(price)}</span>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? (
            courseCategory === "Service" ? "Submitting..." : "Opening Payment..."
          ) : (
            courseCategory === "Service" ? "Enquire Now" : `Pay ${formatINR(price)} Securely`
          )}
        </button>

        {/* Payment method icons */}
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Pay with</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {["UPI", "GPay", "PhonePe", "Paytm", "Cards", "Net Banking"].map((m) => (
              <span key={m} style={{
                padding: "0.2rem 0.55rem", background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)", borderRadius: "4px",
                fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)",
              }}>{m}</span>
            ))}
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.6rem" }}>
            Secured by <strong style={{ color: "#528ff0" }}>Razorpay</strong>
          </p>
        </div>
      </form>
    </>
  );
}

// MiniFileUploader helper for conditional uploads
function MiniFileUploader({ 
  label, 
  file, 
  setFile, 
  accept = ".pdf,.jpg,.jpeg,.png" 
}: { 
  label: string; 
  file: File | null; 
  setFile: (f: File | null) => void; 
  accept?: string; 
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  
  return (
    <div className="form-group" style={{ marginBottom: "1rem" }}>
      <label className="form-label" style={{ display: "block", marginBottom: "0.25rem" }}>{label}</label>
      <div 
        onClick={() => ref.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: hovered ? "1px solid var(--primary)" : "1px dashed var(--border-color)",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          textAlign: "center",
          cursor: "pointer",
          background: "rgba(255,255,255,0.02)",
          transition: "all 0.2s ease",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        <input 
          type="file" 
          ref={ref} 
          accept={accept} 
          style={{ display: "none" }} 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const MAX_SIZE = 2 * 1024 * 1024;
              if (file.size > MAX_SIZE) {
                alert("File size exceeds the 2MB limit.");
                setFile(null);
              } else {
                setFile(file);
              }
            }
          }} 
        />
        <span>📁</span>
        <span style={{ color: file ? "white" : "var(--text-secondary)", fontWeight: file ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>
          {file ? file.name : "Select file"}
        </span>
      </div>
    </div>
  );
}
