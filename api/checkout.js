// =====================================================================
// Serverless function: create a Stripe Checkout Session.
//
// Runs ONLY on the server (e.g. Vercel/Netlify functions). This is the
// one place the Stripe SECRET key is used — it must never reach the
// browser. The browser POSTs a priceId here, we create a session, and
// we return the hosted-checkout URL for the browser to redirect to.
//
// Expects the environment variable STRIPE_SECRET_KEY to be set on the
// hosting platform (and, for local dev, in .env.local).
// =====================================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // ---- CORS headers (set before any response is returned). ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Content-Type", "application/json");

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
    // ---- Pull the chosen price ID out of the request body. ----
    // Some platforms hand us a parsed object, others a raw string, so
    // handle both rather than assuming req.body is already JSON.
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { priceId, userId, email } = body;

    if (!priceId || typeof priceId !== "string") {
      return res.status(400).json({ error: "A valid priceId is required." });
    }

    // ---- Build absolute return URLs from the incoming request. ----
    // Stripe requires fully-qualified success/cancel URLs.
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const baseUrl = `${proto}://${host}`;

    // ---- Look up the price to decide the checkout mode. ----
    // Recurring prices (monthly / annual hosting) must use "subscription";
    // one-time prices must use "payment". price.recurring is null for
    // one-time prices.
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? "subscription" : "payment";

    // ---- Create the Checkout Session with the right mode. ----
    // The session_id placeholder lets the success page verify the payment
    // server-side later if needed.
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel.html`,
      client_reference_id: userId,
      customer_email: email,
      metadata: { supabase_user_id: userId },
      // For subscriptions, also stamp the ID on the subscription object so
      // future renewal events carry it.
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { supabase_user_id: userId } } }
        : {}),
    });

    // ---- Hand the hosted-checkout URL back to the browser. ----
    return res.status(200).json({ url: session.url });
  } catch (err) {
    // Log the real error server-side; return a safe message to the client.
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
};
