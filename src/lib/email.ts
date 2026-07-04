// Transactional email via Resend's HTTP API (no SDK dependency).
// ---------------------------------------------------------------------------
// When RESEND_API_KEY is unset (the dev default), emails are logged to the
// console instead of sent, so every flow works end-to-end without a key.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM = process.env.EMAIL_FROM || "BandConnect <onboarding@resend.dev>";

export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; logged?: boolean }> {
  if (!isEmailEnabled()) {
    console.log(`📧 [email:log-mode] to=${payload.to} subject="${payload.subject}"`);
    return { ok: true, logged: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: payload.to, subject: payload.subject, html: payload.html }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendEmail failed", err);
    return { ok: false };
  }
}

// --- Shared layout ----------------------------------------------------------

function layout(heading: string, body: string, cta?: { href: string; label: string }): string {
  return `
  <div style="background:#0c0a14;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#171327;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">
      <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <span style="font-size:18px;font-weight:700;color:#fff">Band<span style="color:#9173ff">Connect</span></span>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 12px;font-size:20px;color:#fff">${heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:#c7c7d1">${body}</div>
        ${
          cta
            ? `<a href="${cta.href}" style="display:inline-block;margin-top:20px;background:#7c4dff;color:#fff;text-decoration:none;font-weight:600;padding:11px 22px;border-radius:999px">${cta.label}</a>`
            : ""
        }
      </div>
      <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#6b6b76">
        BandConnect · Connecticut's live-music calendar
      </div>
    </div>
  </div>`;
}

// --- Senders ----------------------------------------------------------------

export function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset your BandConnect password",
    html: layout(
      "Reset your password",
      `We got a request to reset your password. This link expires in 1 hour. If you didn't ask for this, you can safely ignore this email.`,
      { href: resetUrl, label: "Reset password" },
    ),
  });
}

export function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to BandConnect",
    html: layout(
      `Welcome, ${name}!`,
      `You're all set. Build out your profile, follow venues and artists, and start filling your calendar with Connecticut live music.`,
      { href: `${APP_URL}/dashboard`, label: "Go to your dashboard" },
    ),
  });
}

export interface DigestEvent {
  id: string;
  title: string;
  whenLabel: string;
  locationLabel: string;
}

export function sendWeeklyDigestEmail(to: string, name: string, events: DigestEvent[]) {
  const rows = events
    .map(
      (e) => `
      <a href="${APP_URL}/event/${e.id}" style="display:block;text-decoration:none;padding:12px 14px;margin-top:8px;background:#211c36;border:1px solid rgba(255,255,255,0.08);border-radius:12px">
        <span style="display:block;font-size:15px;font-weight:600;color:#fff">${e.title}</span>
        <span style="display:block;margin-top:2px;font-size:13px;color:#c7c7d1">${e.whenLabel} · ${e.locationLabel}</span>
      </a>`,
    )
    .join("");
  return sendEmail({
    to,
    subject: "Your week in Connecticut live music",
    html: layout(
      `This week's shows, ${name}`,
      `Picked from the artists, venues, and searches you follow:${rows}`,
      { href: APP_URL, label: "Browse the full calendar" },
    ),
  });
}

export function sendEventReminderEmail(
  to: string,
  event: { id: string; title: string; whenLabel: string; locationLabel: string },
) {
  return sendEmail({
    to,
    subject: `Reminder: ${event.title} is coming up`,
    html: layout(
      `${event.title}`,
      `This show you're going to is happening soon.<br/><br/><strong>${event.whenLabel}</strong><br/>${event.locationLabel}`,
      { href: `${APP_URL}/event/${event.id}`, label: "View event" },
    ),
  });
}
