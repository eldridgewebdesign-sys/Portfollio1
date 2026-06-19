// =====================================================================
// Serverless function: email the admin when a new lead comes in.
//
// The onboarding page calls this (fire-and-forget) right after it saves a
// new project_inquiries row. To avoid being an open "send arbitrary email"
// endpoint, this function does NOT trust any content from the request — it
// only takes a userId, re-reads that client's own inquiry from Supabase
// with the service-role key, and emails a short summary to the admin.
//
// Best-effort by design: if email isn't configured yet it returns 200 and
// does nothing, so onboarding never breaks.
//
// Env (all optional — feature self-disables if missing):
//   RESEND_API_KEY            — https://resend.com API key
//   LEAD_NOTIFY_FROM          — verified sender, e.g. "WebSharke <leads@websharke.com>"
//   ADMIN_EMAIL               — recipient (defaults to weeldridge09@gmail.com)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — to read the lead row
// =====================================================================

const { createClient } = require("@supabase/supabase-js");
const { applyCors } = require("./_cors");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "weeldridge09@gmail.com").trim();

module.exports = async (req, res) => {
  if (applyCors(req, res)) return; // answered an OPTIONS preflight

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const userId = body.userId;

    // No userId, or email/DB not configured → quietly no-op (200).
    if (
      !userId ||
      typeof userId !== "string" ||
      !process.env.RESEND_API_KEY ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return res.status(200).json({ notified: false });
    }

    // Re-read the client's own inquiry server-side — never trust the request body.
    const supa = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: lead } = await supa
      .from("project_inquiries")
      .select("full_name, business_name, email, cell_phone, website_goals, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lead) return res.status(200).json({ notified: false });

    const from = process.env.LEAD_NOTIFY_FROM || "WebSharke <onboarding@resend.dev>";
    const esc = (s) =>
      String(s == null ? "" : s).replace(/[<>&]/g, (c) =>
        ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])
      );

    const html =
      `<h2>New WebSharke lead</h2>` +
      `<p><strong>${esc(lead.business_name)}</strong> &mdash; ${esc(lead.full_name)}</p>` +
      `<p>Email: ${esc(lead.email)}<br>Phone: ${esc(lead.cell_phone)}</p>` +
      (lead.website_goals ? `<p><strong>Goals:</strong> ${esc(lead.website_goals)}</p>` : "") +
      `<p>See the full intake in your admin dashboard.</p>`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ADMIN_EMAIL,
        subject: `New lead: ${lead.business_name || lead.full_name || "WebSharke"}`,
        html,
      }),
    });

    if (!r.ok) {
      console.error("notify-lead: Resend responded", r.status, await r.text().catch(() => ""));
      return res.status(200).json({ notified: false });
    }
    return res.status(200).json({ notified: true });
  } catch (err) {
    // Never surface errors to the onboarding flow.
    console.error("notify-lead error:", err && err.message);
    return res.status(200).json({ notified: false });
  }
};
