// =====================================================================
// Serverless function: a CLIENT cancels their OWN subscription.
//
//   POST /api/subscriptions/cancel   (Vercel maps api/subscriptions/cancel.js here)
//
// A signed-in client cancels a recurring subscription. We verify the Supabase
// access token, load the subscription row with the SERVICE ROLE key, and confirm
// it belongs to the caller BEFORE doing anything — the browser only sends the
// row id and its session token; it never sends (and we never trust) a Stripe
// customer / subscription id. If the row has a live Stripe subscription we cancel
// it in STRIPE first, then mark the row canceled once Stripe confirms — never just
// flip the DB while Stripe keeps billing the client. The webhook
// (customer.subscription.deleted) also sets 'canceled', so this is idempotent.
//
// The browser never sees the Stripe SECRET key or the Supabase service-role key.
// Clients cannot cancel another user's subscription by changing the id in the
// browser: the ownership check below rejects it (403), and RLS has no client
// UPDATE policy on subscriptions (db/admin-schema.sql) as defence in depth.
//
// Env required: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Responses:
//   200 { canceled: true, subscription: { id, status } }
//   400 invalid body
//   401 missing / invalid session
//   403 subscription does not belong to the caller
//   404 subscription not found
//   409 subscription already canceled
//   500 server / Stripe / DB error
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async (req, res) => {
  // ---- CORS: same-origin site only; the verified token below is the real control. ----
  res.setHeader("Access-Control-Allow-Origin", "https://websharke.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Subscription cancel: STRIPE_SECRET_KEY is not set.");
    return res.status(500).json({ error: "Server is not configured for payments." });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Subscription cancel: Supabase env vars are not set.");
    return res.status(500).json({ error: "Server is not configured for payments." });
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ---- 1. Authenticate the caller from the bearer token. ----
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "You must be signed in to cancel a subscription." });

  let caller;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data || !data.user) throw new Error("invalid session");
    caller = data.user;
  } catch (e) {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }

  // ---- 2. Parse + validate the body. ----
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  const subId = typeof body.subscription_id === "string" ? body.subscription_id.trim() : "";
  if (!subId || !UUID_RE.test(subId)) {
    return res.status(400).json({ error: "A valid subscription_id is required." });
  }

  try {
    // ---- 3. Load the subscription (service role) and authorize ownership. ----
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, status, stripe_subscription_id")
      .eq("id", subId)
      .maybeSingle();
    if (subErr) throw new Error(subErr.message);
    if (!sub) return res.status(404).json({ error: "Subscription not found." });

    // Ownership: a client may cancel ONLY their own subscription. Never trust the
    // id from the browser without this check.
    if (sub.user_id !== caller.id) {
      return res.status(403).json({ error: "This subscription does not belong to you." });
    }

    // Already canceled → nothing to do.
    if (sub.status === "canceled") {
      return res.status(409).json({ error: "This subscription is already canceled." });
    }

    // ---- 4. Cancel in Stripe first (if there is a live Stripe subscription). ----
    // A still-pending row (no Stripe object yet) is just marked canceled locally.
    if (sub.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      } catch (e) {
        // If Stripe says it's already gone, treat as success; otherwise fail loudly
        // so we never mark the DB canceled while Stripe keeps billing the client.
        const code = e && e.code;
        if (code !== "resource_missing") {
          console.error("Stripe cancel failed for subscription", sub.id, e && e.message);
          return res.status(500).json({ error: "Could not cancel the subscription. Please try again." });
        }
      }
    }

    // ---- 5. Mark the row canceled (the webhook also does this — idempotent). ----
    const nowIso = new Date().toISOString();
    const { error: updErr } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceled", canceled_at: nowIso, updated_at: nowIso })
      .eq("id", sub.id);
    if (updErr) {
      console.error("Could not mark subscription canceled", sub.id, updErr.message);
      return res.status(500).json({ error: "The subscription was canceled in Stripe but we could not update your account. Please refresh." });
    }

    return res.status(200).json({ canceled: true, subscription: { id: sub.id, status: "canceled" } });
  } catch (err) {
    console.error("Subscription cancel error:", err && err.message);
    return res.status(500).json({ error: "Could not cancel the subscription. Please try again." });
  }
};
