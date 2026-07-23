// =====================================================================
// Serverless function: pay a custom invoice with the Stripe Payment Element.
//
//   POST /api/invoices/pay   (Vercel maps api/invoices/pay.js here)
//
// A signed-in CLIENT pays their OWN invoice. We verify the Supabase access
// token, load the invoice with the SERVICE ROLE key, confirm it belongs to
// the caller and is in a payable state, then open a Stripe PaymentIntent for
// the amount stored in the DATABASE — never an amount from the client:
//   • invoice → a Stripe PaymentIntent (metadata.invoice_id +
//     metadata.supabase_user_id) → webhook marks it paid on
//     `payment_intent.succeeded`.
// Invoices are ALWAYS one-time charges; recurring billing is a separate flow
// (admin Subscriptions tab → api/subscriptions/activate). This route never marks
// the invoice paid itself — the webhook is the only authority for that.
//
// The browser never sees the Stripe SECRET key or the Supabase service-role
// key. The PUBLISHABLE key (safe to expose, like the Supabase anon key) is
// returned so the frontend mounts the Payment Element with a key that always
// matches the server key's mode (test vs live).
//
// Env required: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional)  STRIPE_PUBLISHABLE_KEY — returned to the browser for the Element
//
// Responses:
//   200 { clientSecret, publishableKey, invoice:{id,title,total_amount_cents,currency,status} }
//   400 invalid body / not a payable status / non-positive total
//   401 missing / invalid session
//   403 invoice does not belong to the caller
//   404 invoice not found
//   409 invoice already paid
//   500 server / Stripe / DB error
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only an invoice the admin has issued (or that has gone overdue) can be paid.
const PAYABLE_STATUSES = ["issued", "overdue"];

// Stripe's minimum card charge is $0.50 USD (50 cents). A smaller amount makes
// paymentIntents.create throw `amount_too_small`; we catch it early with a clear
// message. (This route already enforces USD, so a flat 50 is correct.)
const MIN_CHARGE_CENTS = 50;

// PaymentIntent statuses whose existing client secret can still be reused, so a
// second "Pay" click reuses the same intent instead of creating duplicates.
const REUSABLE_PI = ["requires_payment_method", "requires_confirmation", "requires_action", "processing"];

// Build a secret-free diagnostic from any thrown error so the REAL cause is
// visible without leaking anything sensitive. Stripe errors carry
// type/code/statusCode/requestId + a customer-safe message (Stripe redacts keys
// in its own messages); Supabase/Postgres errors carry a code + message. None of
// these contain the secret key. We log the full object server-side (incl. the
// message) and return only this trimmed version to the browser — and we surface
// the message to the browser ONLY for Stripe errors (whose messages Stripe
// guarantees are safe to show), keeping raw DB/internal messages server-side.
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
    console.error("Invoice pay: STRIPE_SECRET_KEY is not set.");
    return res.status(500).json({ error: "Server is not configured for payments." });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Invoice pay: Supabase env vars are not set.");
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
  if (!token) return res.status(401).json({ error: "You must be signed in to pay an invoice." });

  let caller;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data || !data.user) throw new Error("invalid session");
    caller = data.user;
  } catch (e) {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }

  // ---- 1b. Contracts gate: the caller must have accepted the Terms of Service
  // + Privacy Policy (recorded on their auth metadata at onboarding or via the
  // dashboard Contracts tab). Mirrors the client-side gate so a direct API call
  // can't create a charge without acceptance. The admin is exempt.
  {
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "weeldridge09@gmail.com").trim().toLowerCase();
    const callerMeta = (caller && caller.user_metadata) || {};
    const contractsAccepted = !!(callerMeta.tos_accepted && callerMeta.privacy_accepted);
    if (!contractsAccepted && (caller.email || "").trim().toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "You must accept the Terms of Service and Privacy Policy before making a payment." });
    }
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
    // ---- 3. Load the invoice (service role) and authorize ownership + status. ----
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from("invoices")
      .select("id, client_user_id, title, status, currency, total_amount_cents, stripe_payment_intent_id")
      .eq("id", invoiceId)
      .maybeSingle();
    if (invErr) throw Object.assign(new Error(invErr.message), { code: invErr.code });
    if (!invoice) return res.status(404).json({ error: "Invoice not found." });

    // Ownership: a client may pay ONLY their own invoice.
    if (invoice.client_user_id !== caller.id) {
      return res.status(403).json({ error: "This invoice does not belong to you." });
    }

    // Status: already paid → 409; anything other than issued/overdue → not payable.
    if (invoice.status === "paid") {
      return res.status(409).json({ error: "This invoice has already been paid." });
    }
    if (PAYABLE_STATUSES.indexOf(invoice.status) === -1) {
      return res.status(400).json({ error: "This invoice is not payable." });
    }

    // Amount comes ONLY from the database, never the client body.
    const amount = Number(invoice.total_amount_cents);
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "This invoice has no payable amount." });
    }
    const currency = (invoice.currency || "usd").toLowerCase();

    // The client billing UI displays amounts in USD only, so refuse to charge in a
    // currency it cannot correctly show — this guarantees the amount confirmed in
    // the browser always matches what Stripe charges. Every invoice is USD today
    // (schema default 'usd'); add display support before allowing other currencies.
    if (currency !== "usd") {
      console.error("Refusing to charge a non-USD invoice", invoice.id, "currency:", currency);
      return res.status(400).json({ error: "This invoice can’t be paid online yet. Please contact support." });
    }

    // Stripe rejects any charge below its minimum ($0.50 USD) with
    // `amount_too_small`. Surface a clear message instead of the generic 500.
    if (amount < MIN_CHARGE_CENTS) {
      return res.status(400).json({ error: "This invoice’s total is below the $0.50 minimum required to pay by card." });
    }

    // ---- 4. Reuse an open PaymentIntent if one already exists; else create one. ----
    let intent = null;
    if (invoice.stripe_payment_intent_id) {
      try {
        const existing = await stripe.paymentIntents.retrieve(invoice.stripe_payment_intent_id);
        if (existing && existing.status === "succeeded") {
          // Paid in Stripe but the invoice row hasn't flipped yet (webhook lag).
          return res.status(409).json({ error: "This invoice has already been paid." });
        }
        if (
          existing &&
          REUSABLE_PI.indexOf(existing.status) !== -1 &&
          existing.amount === amount &&
          existing.currency === currency
        ) {
          intent = existing; // reuse — avoids stacking duplicate intents on re-click
        }
      } catch (e) {
        console.error("Could not retrieve existing PaymentIntent (creating a new one):", e && e.message);
      }
    }

    if (!intent) {
      intent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          invoice_id: invoice.id,
          supabase_user_id: caller.id,
          type: "invoice",
        },
        receipt_email: caller.email || undefined,
        automatic_payment_methods: { enabled: true },
      });

      // Persist the PaymentIntent id for the webhook + idempotent re-pay.
      const { error: updErr } = await supabaseAdmin
        .from("invoices")
        .update({ stripe_payment_intent_id: intent.id })
        .eq("id", invoice.id);
      if (updErr) console.error("Could not save stripe_payment_intent_id for invoice", invoice.id, updErr.message);
    }

    // ---- 5. Return only the client secret + safe, display-only invoice info. ----
    return res.status(200).json({
      clientSecret: intent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      invoice: {
        id: invoice.id,
        title: invoice.title,
        total_amount_cents: amount,
        currency,
        status: invoice.status,
      },
    });
  } catch (err) {
    // Full detail (incl. the raw message) goes to the server logs only; the
    // browser gets a secret-free diagnostic so the real cause is debuggable.
    console.error("Invoice pay error:", JSON.stringify({ invoiceId, ...errorInfo(err), message: err && err.message }));
    return res.status(500).json({ error: "Could not start payment. Please try again.", debug: errorInfo(err) });
  }
};
