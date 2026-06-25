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

// ---- Resolve a Stripe Invoice's subscription id across API versions. ----
// Older API versions exposed `invoice.subscription` (a string id); newer ones
// (the SDK's current default) removed it and nest it under
// `invoice.parent.subscription_details.subscription`. Check both, and normalise
// to a plain id string whether the field is a string or an expanded object.
function resolveInvoiceSubscriptionId(invoice) {
  if (!invoice) return null;
  const ref =
    invoice.subscription ||
    (invoice.parent &&
      invoice.parent.subscription_details &&
      invoice.parent.subscription_details.subscription) ||
    null;
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id || null;
}

// ---- Next charge time (unix seconds) for a subscription, across API versions. ----
// Newer API versions moved current_period_end from the subscription to the item.
function subscriptionNextChargeUnix(subscription) {
  if (!subscription) return null;
  if (subscription.current_period_end) return subscription.current_period_end;
  const item = subscription.items && subscription.items.data && subscription.items.data[0];
  return (item && item.current_period_end) || null;
}

// ---- A Stripe Invoice's PaymentIntent id, across API versions (best-effort). ----
// Older API versions exposed the top-level invoice.payment_intent; newer ones
// (the SDK's default) removed it — the PI now lives under
// invoice.payments.data[].payment.payment_intent. Check both. Returns null if the
// raw event doesn't include it (history rows still key on stripe_invoice_id).
function invoicePaymentIntentId(invoice) {
  if (!invoice) return null;
  const top = invoice.payment_intent;
  if (top) return typeof top === "string" ? top : top.id || null;
  const list = invoice.payments && invoice.payments.data;
  if (Array.isArray(list)) {
    for (const p of list) {
      const pay = p && p.payment;
      const pi = pay && pay.type === "payment_intent" ? pay.payment_intent : null;
      if (pi) return typeof pi === "string" ? pi : pi.id || null;
    }
  }
  return null;
}

function unixToIso(sec) {
  return sec ? new Date(sec * 1000).toISOString() : null;
}

// ---- Record one billing-period charge in the renewal-history table. ----
// Upserts on stripe_invoice_id so a webhook redelivery — or a failed→paid retry
// of the same Stripe invoice — updates the existing row instead of duplicating.
// Best-effort: a logging failure must never break the webhook's 200 response.
async function recordInvoicePayment(fields) {
  if (!fields || !fields.invoice_id || !fields.user_id || !fields.stripe_invoice_id) return;
  try {
    await supabaseAdmin
      .from("invoice_payments")
      .upsert(fields, { onConflict: "stripe_invoice_id" });
  } catch (e) {
    console.error("recordInvoicePayment failed:", e && e.message);
  }
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
        // Custom-invoice subscriptions (started by api/invoices/pay for a
        // monthly/annual invoice) carry metadata.invoice_id and are tracked via
        // public.invoices — NOT the plan `subscriptions` table. Syncing them into
        // `subscriptions` would make a custom invoice masquerade as a hosting plan
        // on the dashboard and wrongly grant plan entitlement / a billing-portal
        // entry. Instead, keep the invoice's next renewal date up to date here.
        if (subscription.metadata && subscription.metadata.invoice_id) {
          const nextIso = unixToIso(subscriptionNextChargeUnix(subscription));
          const patch = {};
          // A canceled subscription has no next charge; otherwise track it.
          patch.next_payment_at = subscription.status === "canceled" ? null : nextIso;
          await supabaseAdmin
            .from("invoices")
            .update(patch)
            .eq("stripe_subscription_id", subscription.id);
          break;
        }
        await supabaseAdmin
          .from("subscriptions")
          .upsert(subscriptionRecord(subscription), { onConflict: "stripe_subscription_id" });
        // Admin-created custom subscriptions (api/subscriptions/activate) carry
        // metadata.subscription_row_id. Stamp activation / period-start audit
        // timestamps here. The upsert above PRESERVES the admin-set label,
        // amount_cents, interval_months and category — subscriptionRecord omits
        // them for an inline price_data subscription — so this only ADDS
        // timestamps; it never touches the legacy plan-subscription path.
        if (subscription.metadata && subscription.metadata.subscription_row_id) {
          const startUnix =
            subscription.current_period_start ||
            (subscription.items &&
              subscription.items.data &&
              subscription.items.data[0] &&
              subscription.items.data[0].current_period_start) ||
            null;
          const patch = { updated_at: new Date().toISOString() };
          const startIso = unixToIso(startUnix);
          if (startIso) patch.current_period_start = startIso;
          await supabaseAdmin
            .from("subscriptions")
            .update(patch)
            .eq("stripe_subscription_id", subscription.id);
          // Stamp activated_at the FIRST time it becomes active/trialing only
          // (the `.is("activated_at", null)` guard keeps later events from moving it).
          if (subscription.status === "active" || subscription.status === "trialing") {
            await supabaseAdmin
              .from("subscriptions")
              .update({ activated_at: new Date().toISOString() })
              .eq("stripe_subscription_id", subscription.id)
              .is("activated_at", null);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        // A recurring custom invoice's subscription ended → no more renewals.
        if (subscription.metadata && subscription.metadata.invoice_id) {
          // Stop showing an upcoming renewal.
          await supabaseAdmin
            .from("invoices")
            .update({ next_payment_at: null })
            .eq("stripe_subscription_id", subscription.id);
          // If it was never paid (e.g. canceled before the first charge) mark it
          // canceled; a PAID invoice stays 'paid' — it was paid, renewals just stop.
          await supabaseAdmin
            .from("invoices")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", subscription.id)
            .neq("status", "paid");
          break;
        }
        // Admin-created custom subscription → also stamp canceled_at (its column
        // exists once db/hosting-subscriptions-schema.sql is applied). Legacy plan
        // rows keep the original status-only update so they never depend on the
        // newer column.
        if (subscription.metadata && subscription.metadata.subscription_row_id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled", canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subscription.id);
          break;
        }
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.paid": {
        // Mark the subscription active and stamp the last payment date.
        const invoice = event.data.object;
        // Stripe's current API versions (the SDK's default) no longer expose the
        // top-level invoice.subscription — it moved to
        // invoice.parent.subscription_details.subscription. Resolve from both so
        // this works regardless of the account's API version.
        const subId = resolveInvoiceSubscriptionId(invoice);
        if (subId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active", last_payment_date: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);

          // Find the linked CUSTOM invoice (public.invoices) for this subscription
          // — matched by stripe_subscription_id, which api/invoices/pay stored before
          // the client confirmed payment. Looked up regardless of status so RENEWALS
          // (where the original invoice is already 'paid') still get recorded.
          const { data: linkedRows, error: linkErr } = await supabaseAdmin
            .from("invoices")
            .select("id, client_user_id, status, currency, total_amount_cents")
            .eq("stripe_subscription_id", subId)
            .order("created_at", { ascending: false })
            .limit(1);
          if (linkErr) {
            console.error("invoice.paid: linked-invoice lookup failed for sub", subId, linkErr.message);
          } else if (linkedRows && linkedRows[0]) {
            const linked = linkedRows[0];
            const linkedCurrency = (linked.currency || "usd").toLowerCase();
            const paidCents = Number(invoice.amount_paid) || 0;
            const nowIso = new Date().toISOString();
            const nextIso = unixToIso(invoice.period_end);

            // 1) Record THIS billing period in the renewal history — the first
            //    charge AND every renewal. Upsert on the Stripe invoice id keeps
            //    redelivery / failed→paid retries to one row per period.
            await recordInvoicePayment({
              invoice_id: linked.id,
              user_id: linked.client_user_id,
              stripe_subscription_id: subId,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: invoicePaymentIntentId(invoice),
              amount_cents: paidCents,
              currency: linkedCurrency,
              status: "paid",
              period_start: unixToIso(invoice.period_start),
              period_end: nextIso,
              paid_at: nowIso,
            });

            // 2) Mark the ORIGINAL invoice paid the FIRST time only, amount-verified
            //    (mirrors the payment_intent.succeeded defence-in-depth check). Also
            //    stamp the first Stripe invoice id. Renewals skip this (already paid).
            //    `trusted` gates the renewal-date write below so a refused (mismatched)
            //    charge never stamps a next_payment_at onto an unpaid invoice.
            let trusted = linked.status === "paid"; // genuine renewals are already trusted
            if (linked.status !== "paid") {
              if (paidCents !== Number(linked.total_amount_cents) || String(invoice.currency || "").toLowerCase() !== linkedCurrency) {
                console.error(
                  "invoice.paid amount/currency mismatch — NOT marking linked invoice paid:",
                  "invoice", linked.id, "sub", subId,
                  "| stripe.amount_paid", invoice.amount_paid, "inv.total", linked.total_amount_cents,
                  "| stripe.currency", invoice.currency, "inv.currency", linkedCurrency
                );
              } else {
                // Critical path: only proven columns, so a missing newer column can
                // never block marking the invoice paid.
                const { error: updErr } = await supabaseAdmin
                  .from("invoices")
                  .update({ status: "paid", paid_at: nowIso })
                  .eq("id", linked.id)
                  .neq("status", "paid"); // race guard against an overlapping delivery
                if (updErr) console.error("invoice.paid: could not mark linked invoice paid:", linked.id, updErr.message);
                // Best-effort: stamp the first Stripe invoice id (separate update so a
                // not-yet-migrated column can't break the mark-paid above).
                await supabaseAdmin.from("invoices").update({ stripe_invoice_id: invoice.id }).eq("id", linked.id);
                trusted = true;
              }
            }

            // 3) Track the next renewal date (best-effort) — only for a TRUSTED charge
            //    (a verified first payment or a genuine renewal), never a refused one.
            if (trusted && nextIso) {
              await supabaseAdmin.from("invoices").update({ next_payment_at: nextIso }).eq("id", linked.id);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subId = resolveInvoiceSubscriptionId(invoice);
        if (subId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subId);

          // Look up the linked custom invoice to (a) record the FAILED charge in the
          // renewal history and (b) mark an 'issued' invoice overdue so it stays
          // payable and the client can retry.
          const { data: rows } = await supabaseAdmin
            .from("invoices")
            .select("id, client_user_id, currency")
            .eq("stripe_subscription_id", subId)
            .order("created_at", { ascending: false })
            .limit(1);
          const linked = rows && rows[0];
          if (linked) {
            await recordInvoicePayment({
              invoice_id: linked.id,
              user_id: linked.client_user_id,
              stripe_subscription_id: subId,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: invoicePaymentIntentId(invoice),
              amount_cents: Number(invoice.amount_due) || 0,
              currency: (linked.currency || "usd").toLowerCase(),
              status: "failed",
              period_start: unixToIso(invoice.period_start),
              period_end: unixToIso(invoice.period_end),
              paid_at: null,
            });
            // Only bump an 'issued' invoice; never downgrade paid / void / canceled.
            const { error: ovErr } = await supabaseAdmin
              .from("invoices")
              .update({ status: "overdue" })
              .eq("id", linked.id)
              .eq("status", "issued");
            if (ovErr) console.error("invoice.payment_failed: could not mark linked invoice overdue:", linked.id, ovErr.message);
          }
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
