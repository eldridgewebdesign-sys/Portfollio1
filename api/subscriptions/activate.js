// =====================================================================
// Serverless function: activate a custom recurring subscription.
//
//   POST /api/subscriptions/activate   (Vercel maps api/subscriptions/activate.js here)
//
// A signed-in CLIENT activates a subscription the ADMIN created for them. We
// verify the Supabase access token, load the subscription row with the SERVICE
// ROLE key, confirm it belongs to the caller and is still pending, then create a
// recurring Stripe subscription whose amount + interval come ONLY from the
// DATABASE — never from the client. The first charge is taken immediately and
// Stripe auto-renews every `interval_months` thereafter.
//
// This route NEVER marks the subscription active itself — the webhook
// (customer.subscription.* / invoice.paid) is the only authority for that,
// matched by the stripe_subscription_id this route stores before returning.
//
// The browser never sees the Stripe SECRET key or the Supabase service-role
// key. The PUBLISHABLE key (safe to expose) is returned so the frontend mounts
// the Payment Element with a key that matches the server key's mode.
//
// Env required: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//               STRIPE_SUBSCRIPTION_PRODUCT_ID (the shared Stripe Product the
//               inline recurring price attaches to)
//   (optional)  STRIPE_PUBLISHABLE_KEY — returned to the browser for the Element
//
// Responses:
//   200 { clientSecret, publishableKey, subscription:{id,name,amount_cents,interval_months,currency} }
//   400 invalid body / not activatable / bad amount or interval
//   401 missing / invalid session
//   403 subscription does not belong to the caller
//   404 subscription not found
//   409 subscription already active
//   500 server / Stripe / DB error
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Statuses an admin-created subscription can be activated FROM.
const ACTIVATABLE_STATUSES = ["pending_activation", "incomplete"];

// Stripe subscription statuses whose open confirmation secret can still be
// reused (a second "Activate" click resumes it instead of stacking a new one).
const REUSABLE_SUB = ["incomplete"];

// Stripe caps a single recurring interval at one year; "every N months" is
// interval:'month' with interval_count 1..12 (12 = yearly).
const MAX_INTERVAL_MONTHS = 12;

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
    console.error("Subscription activate: STRIPE_SECRET_KEY is not set.");
    return res.status(500).json({ error: "Server is not configured for payments." });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Subscription activate: Supabase env vars are not set.");
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
  if (!token) return res.status(401).json({ error: "You must be signed in to activate a subscription." });

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
    // ---- 3. Load the subscription (service role) and authorize ownership + status. ----
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, status, plan_name, amount_cents, interval_months, currency, category, stripe_customer_id, stripe_subscription_id")
      .eq("id", subId)
      .maybeSingle();
    if (subErr) throw new Error(subErr.message);
    if (!sub) return res.status(404).json({ error: "Subscription not found." });

    // Ownership: a client may activate ONLY their own subscription.
    if (sub.user_id !== caller.id) {
      return res.status(403).json({ error: "This subscription does not belong to you." });
    }

    // Already active in our records → nothing to do.
    if (sub.status === "active" || sub.status === "trialing") {
      return res.status(409).json({ error: "This subscription is already active." });
    }
    if (ACTIVATABLE_STATUSES.indexOf(sub.status) === -1) {
      return res.status(400).json({ error: "This subscription can’t be activated." });
    }

    // Amount + interval come ONLY from the database, never the client body.
    const amount = Number(sub.amount_cents);
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "This subscription has no payable amount." });
    }
    const intervalMonths = Number(sub.interval_months);
    if (!Number.isInteger(intervalMonths) || intervalMonths < 1 || intervalMonths > MAX_INTERVAL_MONTHS) {
      return res.status(400).json({ error: "This subscription has an invalid billing interval." });
    }
    const currency = (sub.currency || "usd").toLowerCase();
    if (currency !== "usd") {
      console.error("Refusing to activate a non-USD subscription", sub.id, "currency:", currency);
      return res.status(400).json({ error: "This subscription can’t be activated online yet. Please contact support." });
    }

    const productId = process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID;
    if (!productId) {
      console.error("Subscription activate: STRIPE_SUBSCRIPTION_PRODUCT_ID is not set — cannot create a recurring subscription.");
      return res.status(500).json({ error: "Subscription billing is not configured yet. Please contact support." });
    }

    // ---- 4. Reuse an already-open Stripe subscription for this row if there is
    // one, so a second "Activate" click resumes it instead of creating a duplicate. ----
    let subscription = null;
    if (sub.stripe_subscription_id) {
      try {
        const existing = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, {
          expand: ["latest_invoice.confirmation_secret"],
        });
        if (existing && (existing.status === "active" || existing.status === "trialing")) {
          // Active in Stripe but our row hasn't flipped yet (webhook lag).
          return res.status(409).json({ error: "This subscription is already active." });
        }
        if (existing && REUSABLE_SUB.indexOf(existing.status) !== -1) {
          subscription = existing; // reuse the incomplete subscription's secret
        }
        // incomplete_expired / canceled → fall through and create a fresh one.
      } catch (e) {
        console.error("Could not retrieve existing subscription (creating a new one):", e && e.message);
      }
    }

    let customerId = sub.stripe_customer_id || null;
    if (!subscription) {
      try {
        // Reuse the Stripe customer for this email if one exists, else create it
        // (mirrors api/checkout.js / api/invoices/pay so a client never ends up
        // with duplicate customers).
        if (!customerId) {
          const existingCustomers = await stripe.customers.list({ email: caller.email, limit: 1 });
          const customer =
            existingCustomers.data[0] ||
            (await stripe.customers.create({
              email: caller.email,
              metadata: { supabase_user_id: caller.id },
            }));
          customerId = customer.id;
        }

        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              // Inline price so the admin's custom amount + interval bill directly —
              // no pre-created Stripe Price needed, just one shared Product. "Every
              // N months" is interval:'month' with interval_count = interval_months.
              price_data: {
                currency,
                product: productId,
                unit_amount: amount,
                recurring: { interval: "month", interval_count: intervalMonths },
              },
            },
          ],
          payment_behavior: "default_incomplete",
          payment_settings: { save_default_payment_method: "on_subscription" },
          metadata: {
            supabase_user_id: caller.id, // webhook syncs the subscriptions table from this
            subscription_row_id: sub.id, // marks this as an admin-created custom subscription
          },
          // Mirror api/invoices/pay exactly — only confirmation_secret is expanded
          // (expanding latest_invoice.payment_intent can error on newer API versions).
          expand: ["latest_invoice.confirmation_secret"],
        });
      } catch (e) {
        console.error("Subscription create failed for row", sub.id, e && e.message);
        return res.status(500).json({ error: "Could not start the subscription. Please try again." });
      }
    }

    // ---- 5. Persist the Stripe ids + move to 'incomplete' BEFORE the browser
    // confirms, so the webhook can match this row by stripe_subscription_id. ----
    const { error: updErr } = await supabaseAdmin
      .from("subscriptions")
      .update({
        stripe_customer_id: customerId || subscription.customer || null,
        stripe_subscription_id: subscription.id,
        status: "incomplete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (updErr) console.error("Could not save Stripe ids for subscription", sub.id, updErr.message);

    const latest = subscription.latest_invoice;
    const clientSecret =
      latest && typeof latest === "object" && latest.confirmation_secret
        ? latest.confirmation_secret.client_secret
        : null;
    if (!clientSecret) {
      console.error("Subscription confirmation secret missing for row", sub.id, "sub", subscription.id);
      return res.status(500).json({ error: "Could not start payment. Please try again." });
    }

    // ---- 6. Return only the client secret + safe, display-only info. ----
    return res.status(200).json({
      clientSecret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      subscription: {
        id: sub.id,
        name: sub.plan_name || "Subscription",
        amount_cents: amount,
        interval_months: intervalMonths,
        currency,
      },
    });
  } catch (err) {
    console.error("Subscription activate error:", err && err.message);
    return res.status(500).json({ error: "Could not start the subscription. Please try again." });
  }
};
