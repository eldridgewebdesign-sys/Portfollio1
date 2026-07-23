// =====================================================================
// Serverless function: confirm a custom invoice's payment ON RETURN.
//
//   POST /api/invoices/confirm   (Vercel maps api/invoices/confirm.js here)
//
// After the client finishes the Stripe Payment Element, they are sent to the
// success page. Rather than wait on the async webhook (which can lag on a cold
// serverless function), the success page calls THIS route to reconcile the
// payment immediately: we verify the invoice's PaymentIntent DIRECTLY with
// Stripe (server-to-server, using the secret key) and, only if Stripe reports
// it succeeded for the exact amount + currency, mark the invoice paid.
//
// This is NOT the browser marking itself paid — the SERVER checks the real
// PaymentIntent with Stripe and is the one that writes the row. It mirrors the
// webhook's logic exactly and is idempotent, so the two can never conflict:
// whichever runs first flips the row; the other is a no-op. The webhook stays
// the authoritative backstop (it also handles async methods that only succeed
// later, and refunds/failures).
//
// A signed-in CLIENT confirms their OWN invoice. We verify the Supabase access
// token, load the invoice with the SERVICE ROLE key, confirm ownership, then
// reconcile. No amount ever comes from the client.
//
// Env required: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Responses:
//   200 { status, payment_status? }  — status is the invoice's status AFTER
//        reconciling ("paid" once confirmed); payment_status is the Stripe
//        PaymentIntent status when we could read it (for a still-processing PI)
//   400 invalid body
//   401 missing / invalid session
//   403 invoice does not belong to the caller
//   404 invoice not found
//   500 server / Stripe / DB error
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Same secret-free diagnostic shape as api/invoices/pay.js: never leaks the key.
function errorInfo(err) {
  const isStripe = !!(err && (err.raw || (typeof err.type === "string" && err.type.indexOf("Stripe") === 0)));
  return {
    type: (err && (err.type || err.name)) || "Error",
    code: (err && err.code) || undefined,
    statusCode: (err && err.statusCode) || undefined,
    requestId: (err && err.requestId) || undefined,
    message: isStripe ? (err && err.message) : undefined,
  };
}

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
    console.error("Invoice confirm: STRIPE_SECRET_KEY is not set.");
    return res.status(500).json({ error: "Server is not configured for payments." });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Invoice confirm: Supabase env vars are not set.");
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
  if (!token) return res.status(401).json({ error: "You must be signed in." });

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
  const invoiceId = typeof body.invoice_id === "string" ? body.invoice_id.trim() : "";
  if (!invoiceId || !UUID_RE.test(invoiceId)) {
    return res.status(400).json({ error: "A valid invoice_id is required." });
  }

  try {
    // ---- 3. Load the invoice (service role) and authorize ownership. ----
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from("invoices")
      .select("id, client_user_id, status, currency, total_amount_cents, stripe_payment_intent_id")
      .eq("id", invoiceId)
      .maybeSingle();
    if (invErr) throw Object.assign(new Error(invErr.message), { code: invErr.code });
    if (!invoice) return res.status(404).json({ error: "Invoice not found." });

    if (invoice.client_user_id !== caller.id) {
      return res.status(403).json({ error: "This invoice does not belong to you." });
    }

    // Already reconciled (by us or by the webhook) → idempotent no-op.
    if (invoice.status === "paid") return res.status(200).json({ status: "paid" });

    // No PaymentIntent recorded yet → nothing we can verify here; the webhook will
    // reconcile once the PaymentIntent (created by /api/invoices/pay) succeeds.
    if (!invoice.stripe_payment_intent_id) {
      return res.status(200).json({ status: invoice.status });
    }

    // ---- 4. Ask Stripe for the real PaymentIntent status. ----
    const pi = await stripe.paymentIntents.retrieve(invoice.stripe_payment_intent_id);

    // Only mark paid when Stripe says succeeded AND the captured amount + currency
    // match the invoice exactly — identical defence to api/webhook.js.
    const invCurrency = (invoice.currency || "usd").toLowerCase();
    const amountOk = pi.amount === Number(invoice.total_amount_cents);
    const currencyOk = String(pi.currency || "").toLowerCase() === invCurrency;

    if (pi.status === "succeeded" && amountOk && currencyOk) {
      // Idempotent: the .neq guard means a concurrent webhook delivery can't double-apply.
      const { error: updErr } = await supabaseAdmin
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString(), stripe_payment_intent_id: pi.id })
        .eq("id", invoice.id)
        .neq("status", "paid");
      if (updErr) throw Object.assign(new Error(updErr.message), { code: updErr.code });
      return res.status(200).json({ status: "paid" });
    }

    if (pi.status === "succeeded" && (!amountOk || !currencyOk)) {
      console.error(
        "Invoice confirm amount/currency mismatch — NOT marking paid:",
        "invoice", invoice.id, "PI", pi.id,
        "| pi.amount", pi.amount, "inv.total", invoice.total_amount_cents,
        "| pi.currency", pi.currency, "inv.currency", invCurrency
      );
    }

    // Not yet succeeded (e.g. still processing) — report back so the success page can
    // keep waiting for the webhook rather than claim success prematurely.
    return res.status(200).json({ status: invoice.status, payment_status: pi.status });
  } catch (err) {
    console.error("Invoice confirm error:", JSON.stringify({ invoiceId, ...errorInfo(err), message: err && err.message }));
    return res.status(500).json({ error: "Could not confirm payment. Please try again.", debug: errorInfo(err) });
  }
};
