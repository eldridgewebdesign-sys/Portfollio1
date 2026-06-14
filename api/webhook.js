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
          await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: "active",
            },
            { onConflict: "stripe_subscription_id" }
          );
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

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId =
          subscription.metadata && subscription.metadata.supabase_user_id;

        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
          },
          { onConflict: "stripe_subscription_id" }
        );
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
