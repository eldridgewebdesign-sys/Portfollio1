// =====================================================================
// Serverless function: handle Stripe webhook events.
//
// Stripe POSTs events here. We verify the signature against the RAW
// request body (parsed JSON would break verification), then sync the
// relevant subscription state into Supabase using the SERVICE ROLE key
// so the write bypasses RLS. This runs ONLY on the server — neither the
// Stripe secret nor the service-role key may ever reach the browser.
//
// Expects STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, and
// SUPABASE_SERVICE_ROLE_KEY to be set on the hosting platform (and, for
// local dev, in .env.local).
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

// Stripe signature verification needs the raw bytes, so turn off Vercel's
// automatic body parsing for this endpoint.
const config = { api: { bodyParser: false } };

// ---- Supabase admin client (service role → bypasses RLS). ----
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---- Build the subscription columns we sync from a Stripe subscription. ----
// Optional fields (plan, amount, interval, dates) are added when present so
// the admin Payments tab shows real data. Wrapped by callers in try/catch so
// a missing/changed Stripe shape can never break the core status sync.
function subscriptionRecord(subscription) {
  const rec = {
    user_id: subscription.metadata && subscription.metadata.supabase_user_id,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    status: subscription.status, // active | past_due | unpaid | canceled | trialing | ...
  };
  try {
    const item = subscription.items && subscription.items.data && subscription.items.data[0];
    const price = item && item.price;
    if (price) {
      if (price.unit_amount != null) rec.amount = price.unit_amount / 100;
      if (price.recurring && price.recurring.interval) rec.plan_interval = price.recurring.interval;
      if (price.nickname) rec.plan_name = price.nickname;
      if (/full.?stack/i.test(price.nickname || "")) rec.website_type = "full_stack";
      else if (/front.?end/i.test(price.nickname || "")) rec.website_type = "frontend";
    }
    if (subscription.current_period_end)
      rec.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
  } catch (e) {
    console.error("subscriptionRecord enrichment skipped:", e && e.message);
  }
  return rec;
}

// ---- Read the raw request body as a single Buffer. ----
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const handler = async (req, res) => {
  // ---- Only POST is allowed. ----
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // ---- Fail fast if the server is misconfigured. ----
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook env vars are not set.");
    return res.status(500).json({ error: "Server is not configured for webhooks." });
  }

  // ---- Verify the signature against the raw body. ----
  let event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook signature verification failed.` });
  }

  // ---- Process the event. ----
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId =
          (session.metadata && session.metadata.supabase_user_id) ||
          session.client_reference_id;

        if (session.mode === "subscription") {
          // New subscription — record it so the dashboard reflects access.
          // Retrieve the full subscription so we can also store plan/amount/
          // dates for the admin Payments view (best-effort).
          let record = {
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: "active",
          };
          try {
            const full = await stripe.subscriptions.retrieve(session.subscription);
            if (full.metadata && !full.metadata.supabase_user_id) full.metadata.supabase_user_id = userId;
            record = { ...subscriptionRecord(full), user_id: userId };
            record.last_payment_date = new Date().toISOString();
          } catch (e) {
            console.error("Could not retrieve subscription for enrichment:", e && e.message);
          }
          await supabaseAdmin.from("subscriptions").upsert(record, { onConflict: "stripe_subscription_id" });
        } else if (session.mode === "payment") {
          // One-time payment — nothing to sync into subscriptions yet.
          console.log(
            "One-time payment completed:",
            session.id,
            "for user",
            userId
          );
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        await supabaseAdmin
          .from("subscriptions")
          .upsert(subscriptionRecord(subscription), { onConflict: "stripe_subscription_id" });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.paid": {
        // Mark the subscription active and stamp the last payment date.
        const invoice = event.data.object;
        if (invoice.subscription) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active", last_payment_date: new Date().toISOString() })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      case "payment_intent.succeeded": {
        // Custom-invoice payments (api/invoices/pay) tag the PaymentIntent with
        // metadata.invoice_id. Subscription / plan PaymentIntents do NOT, so they
        // fall through and are ignored here — the subscription cases above own them.
        const pi = event.data.object;
        const invoiceId = pi.metadata && pi.metadata.invoice_id;
        if (!invoiceId) break;

        const { data: inv, error: loadErr } = await supabaseAdmin
          .from("invoices")
          .select("id, status, currency, total_amount_cents")
          .eq("id", invoiceId)
          .maybeSingle();
        if (loadErr) { console.error("invoice load failed for PI", pi.id, loadErr.message); break; }
        if (!inv) { console.error("payment_intent.succeeded: no invoice for id", invoiceId, "PI", pi.id); break; }

        // Idempotent: a duplicate delivery (or already-paid invoice) is a no-op.
        if (inv.status === "paid") break;

        // Defence in depth: only mark paid when the captured amount + currency
        // match the invoice exactly. A mismatch is logged loudly and NOT paid.
        const invCurrency = (inv.currency || "usd").toLowerCase();
        if (pi.amount !== Number(inv.total_amount_cents) || String(pi.currency || "").toLowerCase() !== invCurrency) {
          console.error(
            "payment_intent.succeeded amount/currency mismatch — NOT marking paid:",
            "invoice", invoiceId, "PI", pi.id,
            "| pi.amount", pi.amount, "inv.total", inv.total_amount_cents,
            "| pi.currency", pi.currency, "inv.currency", invCurrency
          );
          break;
        }

        const { error: updErr } = await supabaseAdmin
          .from("invoices")
          .update({ status: "paid", paid_at: new Date().toISOString(), stripe_payment_intent_id: pi.id })
          .eq("id", invoiceId)
          .neq("status", "paid"); // race guard: never double-apply if two deliveries overlap
        if (updErr) console.error("Could not mark invoice paid:", invoiceId, updErr.message);
        break;
      }

      case "payment_intent.payment_failed": {
        // Custom-invoice payment failed. Log only — there is no failure column on
        // invoices and we will not invent schema; the invoice stays issued/overdue
        // so the client can retry. (Subscription PIs lack invoice_id → ignored.)
        const pi = event.data.object;
        const invoiceId = pi.metadata && pi.metadata.invoice_id;
        if (!invoiceId) break;
        console.error(
          "Invoice payment failed — invoice", invoiceId, "PI", pi.id,
          "|", pi.last_payment_error && pi.last_payment_error.message
        );
        break;
      }

      default:
        // Ignore everything else — still 200 so Stripe stops retrying.
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    // Log the real error server-side; return a safe message to Stripe.
    console.error("Stripe webhook handler error:", err);
    return res.status(500).json({ error: "Webhook handler failed." });
  }
};

module.exports = handler;
module.exports.config = config;
