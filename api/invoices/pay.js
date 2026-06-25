// =====================================================================
// Serverless function: pay a custom invoice with the Stripe Payment Element.
//
//   POST /api/invoices/pay   (Vercel maps api/invoices/pay.js here)
//
// A signed-in CLIENT pays their OWN invoice. We verify the Supabase access
// token, load the invoice with the SERVICE ROLE key, confirm it belongs to
// the caller and is in a payable state, then start the correct Stripe flow for
// the amount stored in the DATABASE — never an amount from the client:
//   • one_time invoice  → a Stripe PaymentIntent (metadata.invoice_id +
//     metadata.supabase_user_id) → webhook marks it paid on
//     `payment_intent.succeeded`.
//   • monthly / annual  → a recurring Stripe subscription (the line amount as a
//     monthly/annual price) → webhook marks the invoice paid on `invoice.paid`
//     keyed on stripe_subscription_id, and syncs the subscriptions table from
//     the subscription's metadata.supabase_user_id.
// In BOTH cases this route never marks the invoice paid itself — the webhook is
// the only authority for that.
//
// The browser never sees the Stripe SECRET key or the Supabase service-role
// key. The PUBLISHABLE key (safe to expose, like the Supabase anon key) is
// returned so the frontend mounts the Payment Element with a key that always
// matches the server key's mode (test vs live).
//
// Env required: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional)  STRIPE_PUBLISHABLE_KEY — returned to the browser for the Element
//   (recurring) STRIPE_SUBSCRIPTION_PRODUCT_ID — the Stripe Product that
//               monthly/annual invoice subscriptions attach their inline price
//               to. Required ONLY to pay a monthly/annual invoice; one-time
//               invoices do not need it.
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

// Map an invoice billing_type to the Stripe recurring interval. one_time is not
// here on purpose — it uses the PaymentIntent path, not a subscription.
const BILLING_INTERVAL = { monthly: "month", annual: "year" };

// Subscription statuses whose open confirmation secret can still be reused (a
// second "Pay" click reuses the incomplete subscription instead of stacking).
const REUSABLE_SUB = ["incomplete"];

// PaymentIntent statuses whose existing client secret can still be reused, so a
// second "Pay" click reuses the same intent instead of creating duplicates.
const REUSABLE_PI = ["requires_payment_method", "requires_confirmation", "requires_action", "processing"];

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
      .select("id, client_user_id, title, status, currency, total_amount_cents, billing_type, stripe_payment_intent_id, stripe_customer_id, stripe_subscription_id")
      .eq("id", invoiceId)
      .maybeSingle();
    if (invErr) throw new Error(invErr.message);
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

    // ---- 4 (recurring). monthly / annual → start a Stripe subscription. -------
    // The invoice total becomes a recurring price billed monthly/annually. We
    // create (or reuse) the Stripe customer for the caller's email, then create
    // an incomplete subscription and hand back the first invoice's confirmation
    // secret for the Payment Element. The webhook marks THIS invoice paid on
    // `invoice.paid` (matched by stripe_subscription_id) — never this route.
    const billingType = invoice.billing_type || "one_time";
    if (billingType !== "one_time") {
      const interval = BILLING_INTERVAL[billingType];
      if (!interval) return res.status(400).json({ error: "This invoice is not payable." });

      const productId = process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID;
      if (!productId) {
        console.error("Invoice pay: STRIPE_SUBSCRIPTION_PRODUCT_ID is not set — cannot bill a recurring invoice.");
        return res.status(500).json({ error: "Subscription billing is not configured yet. Please contact support." });
      }

      // Reuse an already-open subscription for this invoice if there is one, so a
      // second "Pay" click resumes it instead of creating a duplicate.
      let subscription = null;
      if (invoice.stripe_subscription_id) {
        try {
          const existing = await stripe.subscriptions.retrieve(invoice.stripe_subscription_id, {
            expand: ["latest_invoice.confirmation_secret"],
          });
          if (existing && (existing.status === "active" || existing.status === "trialing")) {
            // Active in Stripe but the invoice row hasn't flipped yet (webhook lag).
            return res.status(409).json({ error: "This invoice has already been paid." });
          }
          if (existing && REUSABLE_SUB.indexOf(existing.status) !== -1) {
            subscription = existing; // reuse the incomplete subscription's secret
          }
          // incomplete_expired / canceled → fall through and create a fresh one.
        } catch (e) {
          console.error("Could not retrieve existing subscription (creating a new one):", e && e.message);
        }
      }

      let customerId = invoice.stripe_customer_id || null;
      if (!subscription) {
        try {
          // Reuse the customer for this email if one exists, else create it
          // (mirrors api/checkout.js so a client never ends up with duplicates).
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
                // Inline price so the admin's invoice amount is billed directly —
                // no pre-created Stripe Price needed, just one shared Product.
                price_data: {
                  currency,
                  product: productId,
                  unit_amount: amount,
                  recurring: { interval },
                },
              },
            ],
            payment_behavior: "default_incomplete",
            payment_settings: { save_default_payment_method: "on_subscription" },
            metadata: {
              supabase_user_id: caller.id, // webhook syncs the subscriptions table from this
              invoice_id: invoice.id,
            },
            // Mirror api/checkout.js exactly — only confirmation_secret is expanded
            // (expanding latest_invoice.payment_intent can error on newer API
            // versions). The webhook marks this invoice paid on `invoice.paid`.
            expand: ["latest_invoice.confirmation_secret"],
          });
        } catch (e) {
          console.error("Invoice subscription create failed for invoice", invoice.id, e && e.message);
          return res.status(500).json({ error: "Could not start subscription payment. Please try again." });
        }
      }

      // Persist the Stripe ids so the webhook can mark this invoice paid on
      // `invoice.paid` (matched by stripe_subscription_id). Committed here, before
      // the browser confirms payment, so the row is linked well before the event.
      const { error: subUpdErr } = await supabaseAdmin
        .from("invoices")
        .update({
          stripe_customer_id: customerId || subscription.customer || null,
          stripe_subscription_id: subscription.id,
        })
        .eq("id", invoice.id);
      if (subUpdErr) console.error("Could not save subscription ids for invoice", invoice.id, subUpdErr.message);

      // The webhook marks THIS invoice paid on `invoice.paid` (matched by the
      // stripe_subscription_id saved just above) — the authoritative, only path.
      // We do not tag the PaymentIntent here: that would need
      // latest_invoice.payment_intent, which can error to expand on newer API
      // versions, and `invoice.paid` already covers it.
      const latest = subscription.latest_invoice;
      const subClientSecret =
        latest && typeof latest === "object" && latest.confirmation_secret
          ? latest.confirmation_secret.client_secret
          : null;
      if (!subClientSecret) {
        console.error("Subscription confirmation secret missing for invoice", invoice.id, "sub", subscription.id);
        return res.status(500).json({ error: "Could not start payment. Please try again." });
      }

      return res.status(200).json({
        clientSecret: subClientSecret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
        invoice: {
          id: invoice.id,
          title: invoice.title,
          total_amount_cents: amount,
          currency,
          status: invoice.status,
          billing_type: billingType,
        },
      });
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
        billing_type: "one_time",
      },
    });
  } catch (err) {
    console.error("Invoice pay error:", err && err.message);
    return res.status(500).json({ error: "Could not start payment. Please try again." });
  }
};
