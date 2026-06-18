// =====================================================================
// Serverless function: create a Stripe Customer Portal session.
//
// Runs ONLY on the server (e.g. Vercel/Netlify functions). This is the
// one place the Stripe SECRET key is used — it must never reach the
// browser. The browser POSTs a customerId here, we create a billing
// portal session, and we return the hosted-portal URL for the browser
// to redirect to.
//
// Expects the environment variable STRIPE_SECRET_KEY to be set on the
// hosting platform (and, for local dev, in .env.local).
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");
const { applyCors } = require("./_cors");

module.exports = async (req, res) => {
  // ---- CORS headers (set before any response is returned). ----
  if (applyCors(req, res)) return; // answered an OPTIONS preflight

  // ---- Only POST is allowed. ----
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // ---- Fail fast if the server is misconfigured. ----
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set.");
    return res.status(500).json({ error: "Server is not configured for payments." });
  }

  try {
    // ---- Pull the Stripe customer ID out of the request. ----
    // Some platforms hand us a parsed object, others a raw string, so
    // handle both rather than assuming req.body is already JSON. Fall
    // back to a query-string parameter if no body is present.
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    let customerId = body.customerId || (req.query && req.query.customerId);
    const userId = body.userId || (req.query && req.query.userId);

    // If the browser sent a Supabase user id instead of a Stripe customer id
    // (e.g. the dashboard "Manage My Subscription" button), resolve the
    // customer from that user's subscription row using the service-role key.
    if ((!customerId || typeof customerId !== "string") && userId) {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Supabase env vars are not set for customer lookup.");
        return res.status(500).json({ error: "Server is not configured to look up billing." });
      }
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: row, error: lookupErr } = await supabaseAdmin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .not("stripe_customer_id", "is", null)
        .limit(1)
        .maybeSingle();
      if (lookupErr) {
        console.error("Customer lookup failed:", lookupErr.message);
        return res.status(500).json({ error: "Could not look up your billing account." });
      }
      customerId = row && row.stripe_customer_id;
    }

    if (!customerId || typeof customerId !== "string") {
      return res.status(400).json({ error: "No billing account was found for this user." });
    }

    // ---- Build an absolute return URL from the incoming request. ----
    // Stripe requires a fully-qualified return URL.
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const baseUrl = `${proto}://${host}`;

    // ---- Create the Customer Portal session. ----
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard.html`,
    });

    // ---- Hand the hosted-portal URL back to the browser. ----
    return res.status(200).json({ url: session.url });
  } catch (err) {
    // Log the real error server-side; return a safe message to the client.
    console.error("Stripe customer portal error:", err);
    return res.status(500).json({ error: "Could not open billing portal. Please try again." });
  }
};
