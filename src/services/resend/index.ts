// Resend email service
// NOTE: In production, all Resend calls MUST go through a Supabase Edge Function
// to protect the API key. This module defines the email templates and
// the interface — the actual HTTP call goes to your Edge Function endpoint.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL ?? "noreply@civiclink.ai";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail(payload: EmailPayload): Promise<void> {
  // Calls the Supabase Edge Function which has the Resend secret key
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify({ ...payload, from: FROM_EMAIL }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to send email");
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to CivicLink AI 🎉",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1d4ed8;font-size:28px;margin:0">CivicLink AI</h1>
            <p style="color:#64748b;margin:8px 0 0">AI Powered Community Assistance Platform</p>
          </div>
          <h2 style="color:#0f172a;font-size:22px">Welcome, ${name}! 👋</h2>
          <p style="color:#475569;line-height:1.6">
            Thank you for joining CivicLink AI. You can now report civic issues, 
            connect with blood donors, and stay updated with community notices.
          </p>
          <div style="margin:24px 0;padding:20px;background:#eff6ff;border-radius:10px;border-left:4px solid #1d4ed8">
            <p style="margin:0;color:#1e40af;font-weight:500">Get started by exploring your citizen dashboard</p>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">
            The CivicLink AI Team
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendComplaintSubmittedEmail(
  to: string,
  name: string,
  complaintId: string,
  complaintTitle: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Complaint Submitted — #${complaintId.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
          <h1 style="color:#1d4ed8;font-size:24px">Complaint Received ✅</h1>
          <p style="color:#475569">Hi ${name}, your complaint has been submitted successfully.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px;color:#64748b;font-size:13px">COMPLAINT ID</p>
            <p style="margin:0;font-weight:600;color:#0f172a">#${complaintId.slice(0, 8).toUpperCase()}</p>
            <p style="margin:12px 0 4px;color:#64748b;font-size:13px">TITLE</p>
            <p style="margin:0;color:#0f172a">${complaintTitle}</p>
          </div>
          <p style="color:#475569;line-height:1.6">
            Our team will review your complaint and update you on its status. 
            You can track the progress in your dashboard.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendComplaintStatusEmail(
  to: string,
  name: string,
  complaintTitle: string,
  newStatus: string,
  adminNotes?: string
): Promise<void> {
  const statusColors: Record<string, string> = {
    in_progress: "#f59e0b",
    resolved: "#10b981",
    rejected: "#ef4444",
    pending: "#6366f1",
  };
  const color = statusColors[newStatus] ?? "#6366f1";
  const label = newStatus.replace("_", " ").toUpperCase();

  await sendEmail({
    to,
    subject: `Complaint Status Updated — ${label}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
          <h1 style="color:#0f172a;font-size:24px">Complaint Status Updated</h1>
          <p style="color:#475569">Hi ${name}, the status of your complaint has been updated.</p>
          <p style="color:#475569"><strong>${complaintTitle}</strong></p>
          <div style="display:inline-block;background:${color}20;border:1px solid ${color};border-radius:6px;padding:6px 16px;margin:12px 0">
            <span style="color:${color};font-weight:600">${label}</span>
          </div>
          ${adminNotes ? `<div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px"><p style="margin:0 0 4px;color:#64748b;font-size:12px">ADMIN NOTES</p><p style="margin:0;color:#0f172a">${adminNotes}</p></div>` : ""}
        </div>
      </div>
    `,
  });
}

export async function sendBloodRequestAlertEmail(
  to: string,
  donorName: string,
  bloodGroup: string,
  patientName: string,
  hospitalName: string,
  contactNumber: string,
  emergencyMessage: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `🩸 Urgent Blood Request — ${bloodGroup} Needed`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
            <p style="font-size:36px;margin:0">🩸</p>
            <h2 style="color:#dc2626;margin:8px 0 0">Urgent Blood Request</h2>
            <p style="color:#ef4444;font-weight:700;font-size:20px;margin:4px 0">${bloodGroup} Blood Needed</p>
          </div>
          <p style="color:#475569">Hi ${donorName},</p>
          <p style="color:#475569;line-height:1.6">${emergencyMessage}</p>
          <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Patient</td><td style="color:#0f172a;font-weight:500">${patientName}</td></tr>
              <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Hospital</td><td style="color:#0f172a">${hospitalName}</td></tr>
              <tr><td style="color:#64748b;font-size:13px;padding:4px 0">Contact</td><td style="color:#0f172a;font-weight:600">${contactNumber}</td></tr>
            </table>
          </div>
          <p style="color:#94a3b8;font-size:13px">Your donation can save a life. Please contact the hospital if you can help.</p>
        </div>
      </div>
    `,
  });
}

export async function sendNoticePublishedEmail(
  to: string,
  noticeTitle: string,
  noticeCategory: string,
  appUrl: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `📢 New Community Notice — ${noticeTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
          <h1 style="color:#1d4ed8;font-size:24px">New Community Notice 📢</h1>
          <div style="background:#f0f9ff;border-radius:10px;padding:20px;margin:20px 0">
            <p style="margin:0 0 4px;color:#0284c7;font-size:12px;text-transform:uppercase;font-weight:600">${noticeCategory}</p>
            <h3 style="margin:0;color:#0f172a">${noticeTitle}</h3>
          </div>
          <p style="color:#475569">A new community notice has been published. Visit the CivicLink AI platform to read the full notice.</p>
          <a href="${appUrl}/citizen/notices" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-top:8px">View Notice</a>
        </div>
      </div>
    `,
  });
}
