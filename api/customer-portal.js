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
    // ---- Pull the Stripe customer ID out of the request. ----
    // Some platforms hand us a parsed object, others a raw string, so
    // handle both rather than assuming req.body is already JSON. Fall
    // back to a query-string parameter if no body is present.
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const customerId = body.customerId || (req.query && req.query.customerId);

    if (!customerId || typeof customerId !== "string") {
      return res.status(400).json({ error: "A valid customerId is required." });
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
