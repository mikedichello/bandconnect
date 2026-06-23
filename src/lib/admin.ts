// Admin allowlist. ADMIN_EMAILS is a comma-separated list of emails that may
// review verification requests. Unset (the default) means no admins — the
// admin queue 404s and the admin API returns 403, so it's safe by default.
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}
