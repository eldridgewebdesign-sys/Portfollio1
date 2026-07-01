// =====================================================================
// Serverless function: WebSharke ADMIN — custom recurring subscriptions.
//
//   POST /api/admin/subscriptions   (Vercel maps api/admin/subscriptions.js here)
//
// Admin-only. Reuses the EXACT auth gate from /api/admin and
// /api/admin/invoices: the caller must send a valid Supabase access token in
// the Authorization header; we verify it with the SERVICE ROLE key and confirm
// the caller's email is the admin email before anything runs. A missing/invalid
// token gets 401; a valid non-admin session gets 403.
//
// This route lets the admin define a CUSTOM recurring hosting charge for an
// existing client (custom amount + custom "charge every N months"). It only
// creates a PENDING local row in public.subscriptions — it never charges the
// client and never creates a Stripe object. The client later activates it on
// the payment page (api/subscriptions/activate.js), which is what creates the
// Stripe subscription and takes the first payment.
//
// Body (JSON):  { "action": "create" | "list" | "cancel", "payload": { … } }
//
//   create  payload: { client_user_id, name, amount_dollars, interval_months }
//             → inserts a subscriptions row, status 'pending_activation',
//               category 'hosting'. Amount is converted to cents server-side;
//               the browser's dollar value is validated, never trusted as cents.
//   list    payload: {} → returns the category='hosting' rows for the admin table.
//   cancel  payload: { subscription_id }
//             → if the row has a Stripe subscription, cancels it in STRIPE first,
//               then marks the row canceled. A still-pending row (no Stripe sub)
//               is marked canceled locally. This is a REAL Stripe cancellation,
//               not just a DB flag.
//
// The browser NEVER sees the Stripe secret or the Supabase service-role key.
// Clients cannot reach these actions: RLS has no client INSERT/UPDATE policy on
// subscriptions (see db/admin-schema.sql), and the admin-email gate below blocks
// any non-admin session.
//
// Env required: STRIPE_SECRET_KEY (for cancel), SUPABASE_URL,
//               SUPABASE_SERVICE_ROLE_KEY
//   (optional)  ADMIN_EMAIL — defaults to weeldridge09@gmail.com
//
// Responses:
//   200 { subscription } | { subscriptions } | { canceled: true }
//   400 invalid request data
//   401 missing / invalid session token
//   403 valid session but not the admin
//   404 client_user_id / subscription_id does not exist
//   500 server / Stripe / database error
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "weeldridge09@gmail.com")
  .trim()
  .toLowerCase();

// Money sanity cap (cents): same as the invoices route. $50,000,000.00.
const MAX_CENTS = 5_000_000_000;
// Stripe caps a single recurring interval at one year, so "every N months" is
// representable as interval:'month' with interval_count 1..12 (12 = yearly).
const MAX_INTERVAL_MONTHS = 12;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Best-effort audit log write. Never throws — logging must not break the action.
async function logActivity(supa, entry) {
  try {
    await supa.from("admin_activity_log").insert(entry);
  } catch (e) {
    console.error("activity log write failed:", e && e.message);
  }
}

// Thrown during validation; maps to a specific HTTP status + safe client message.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Validate + normalise a `create` payload. Throws HttpError(400) on bad input.
// Returns the row fields to insert (amount converted to cents server-side).
function parseCreatePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new HttpError(400, "Request payload must be a JSON object.");
  }

  // ---- client_user_id (required, UUID) ----
  const clientUserId = typeof payload.client_user_id === "string" ? payload.client_user_id.trim() : "";
  if (!clientUserId) throw new HttpError(400, "client_user_id is required.");
  if (!UUID_RE.test(clientUserId)) throw new HttpError(400, "client_user_id must be a valid UUID.");

  // ---- name / label (required) ----
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) throw new HttpError(400, "A subscription name is required.");
  if (name.length > 200) throw new HttpError(400, "name is too long (max 200 characters).");

  // ---- amount in DOLLARS (required, > 0) → cents (computed here, not trusted) ----
  const amountDollars = typeof payload.amount_dollars === "number" ? payload.amount_dollars : Number(payload.amount_dollars);
  if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
    throw new HttpError(400, "Amount must be a number greater than 0.");
  }
  const amountCents = Math.round(amountDollars * 100);
  if (!Number.isInteger(amountCents) || amountCents < 1 || amountCents > MAX_CENTS) {
    throw new HttpError(400, "Amount is out of the allowed range.");
  }

  // ---- interval in months (required, whole number 1..12) ----
  const intervalMonths =
    typeof payload.interval_months === "number" ? payload.interval_months : Number(payload.interval_months);
  if (!Number.isInteger(intervalMonths) || intervalMonths < 1 || intervalMonths > MAX_INTERVAL_MONTHS) {
    throw new HttpError(
      400,
      "Charge interval must be a whole number of months between 1 and " + MAX_INTERVAL_MONTHS + "."
    );
  }

  return {
    client_user_id: clientUserId,
    name,
    amount_cents: amountCents,
    interval_months: intervalMonths,
  };
}

module.exports = async (req, res) => {
  // ---- CORS: same-origin admin dashboard; the verified token is the real control. ----
  res.setHeader("Access-Control-Allow-Origin", "https://websharke.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Admin subscriptions API: Supabase env vars are not set.");
    return res.status(500).json({ error: "Server is not configured for admin." });
  }

  const supa = adminClient();

  // ---- 1. Authenticate: verify the bearer token belongs to a real user. ----
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Missing authentication token." });

  let caller;
  try {
    const { data, error } = await supa.auth.getUser(token);
    if (error || !data || !data.user) throw new Error("invalid session");
    caller = data.user;
  } catch (e) {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }

  // ---- 2. Authorize: only the admin email may proceed. ----
  if (!caller.email || caller.email.trim().toLowerCase() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden: admin access required." });
  }

  // ---- 3. Parse the envelope. ----
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  const action = typeof body.action === "string" ? body.action : "";
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};

  try {
    // ================= CREATE =================
    if (action === "create") {
      let fields;
      try {
        fields = parseCreatePayload(payload);
      } catch (err) {
        if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
        throw err;
      }

      // Make sure the client exists (auth.users is the source of truth).
      const { data: userRes, error: userErr } = await supa.auth.admin.getUserById(fields.client_user_id);
      if (userErr) {
        if (userErr.status === 404) {
          return res.status(404).json({ error: "No client found for the supplied client_user_id." });
        }
        throw new Error(userErr.message || "Failed to verify the client.");
      }
      if (!userRes || !userRes.user) {
        return res.status(404).json({ error: "No client found for the supplied client_user_id." });
      }

      const nowIso = new Date().toISOString();
      const { data: inserted, error: insErr } = await supa
        .from("subscriptions")
        .insert({
          user_id: fields.client_user_id,
          plan_name: fields.name,
          amount_cents: fields.amount_cents,
          interval_months: fields.interval_months,
          currency: "usd",
          category: "hosting",
          status: "pending_activation",
          created_by: caller.id,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select("id, user_id, plan_name, amount_cents, interval_months, currency, category, status, created_at")
        .single();
      if (insErr) {
        // A missing column means the migration hasn't been applied — say so clearly.
        if (insErr.code === "PGRST204" || /column .* does not exist/i.test(insErr.message || "")) {
          console.error("create subscription — column missing, apply db/hosting-subscriptions-schema.sql:", insErr.message);
          return res.status(503).json({
            error: "Subscriptions are not fully provisioned. Apply db/hosting-subscriptions-schema.sql in Supabase, then try again.",
          });
        }
        throw new Error(insErr.message);
      }

      await logActivity(supa, {
        admin_email: caller.email,
        action: "subscription_created",
        entity_type: "subscription",
        entity_id: String(inserted.id),
        affected_user_id: fields.client_user_id,
        changed_field: null,
        old_value: null,
        new_value: fields.name + " — " + fields.amount_cents + " cents every " + fields.interval_months + " month(s)",
      });

      return res.status(200).json({ subscription: inserted });
    }

    // ================= LIST =================
    // Returns the category='hosting' rows. (All payments — invoices AND
    // subscriptions, every status — are now viewed in the admin Recent Payments
    // tab, which queries them directly via api/admin.js → listPayments. This
    // action remains for completeness / future use.)
    if (action === "list") {
      const { data: rows, error: listErr } = await supa
        .from("subscriptions")
        .select("id, user_id, plan_name, amount_cents, interval_months, currency, status, created_at, activated_at, canceled_at, stripe_subscription_id")
        .eq("category", "hosting")
        .order("created_at", { ascending: false });
      if (listErr) throw new Error(listErr.message);
      return res.status(200).json({ subscriptions: rows || [] });
    }

    // ================= CANCEL =================
    if (action === "cancel") {
      const subId = typeof payload.subscription_id === "string" ? payload.subscription_id.trim() : "";
      if (!subId || !UUID_RE.test(subId)) {
        return res.status(400).json({ error: "A valid subscription_id is required." });
      }

      const { data: row, error: loadErr } = await supa
        .from("subscriptions")
        .select("id, user_id, status, stripe_subscription_id, category")
        .eq("id", subId)
        .maybeSingle();
      if (loadErr) throw new Error(loadErr.message);
      if (!row) return res.status(404).json({ error: "Subscription not found." });

      // If there is a live Stripe subscription, cancel it in STRIPE first and
      // only mark the row canceled once Stripe confirms — never just flip the
      // DB while leaving Stripe billing the client.
      if (row.stripe_subscription_id) {
        if (!process.env.STRIPE_SECRET_KEY) {
          console.error("Admin cancel subscription: STRIPE_SECRET_KEY is not set.");
          return res.status(500).json({ error: "Server is not configured for payments." });
        }
        try {
          await stripe.subscriptions.cancel(row.stripe_subscription_id);
        } catch (e) {
          // If Stripe says it's already gone, treat as success; otherwise fail loudly.
          const code = e && e.code;
          if (code !== "resource_missing") {
            console.error("Stripe cancel failed for subscription", row.id, e && e.message);
            return res.status(500).json({ error: "Could not cancel the subscription in Stripe. Please try again." });
          }
        }
      }

      const { error: updErr } = await supa
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (updErr) throw new Error(updErr.message);

      await logActivity(supa, {
        admin_email: caller.email,
        action: "subscription_canceled",
        entity_type: "subscription",
        entity_id: String(row.id),
        affected_user_id: row.user_id ? String(row.user_id) : null,
        changed_field: "status",
        old_value: row.status || null,
        new_value: "canceled",
      });

      return res.status(200).json({ canceled: true });
    }

    return res.status(400).json({ error: "Unknown action." });
  } catch (err) {
    console.error("Admin subscriptions error:", err && err.message);
    return res.status(500).json({ error: err && err.message ? err.message : "The request could not be completed." });
  }
};
