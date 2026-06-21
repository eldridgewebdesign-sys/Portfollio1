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

module.exports = async (req, res) => {
  // ---- CORS headers (set before any response is returned). ----
  // Same-origin site only; the access token (below) is the real access control.
  res.setHeader("Access-Control-Allow-Origin", "https://websharke.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(204).end();

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
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars are not set for auth / customer lookup.");
    return res.status(500).json({ error: "Server is not configured to look up billing." });
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ---- Authenticate the caller: a valid Supabase access token is required. ----
  // Without this, anyone could POST another user's id / Stripe customer id and
  // open that victim's billing portal (IDOR). We ignore any client-supplied
  // customerId/userId and act ONLY on the authenticated user.
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "You must be signed in to manage billing." });

  let caller;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data || !data.user) throw new Error("invalid session");
    caller = data.user;
  } catch (e) {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }

  try {
    // ---- Resolve the Stripe customer from the AUTHENTICATED user only. ----
    const { data: row, error: lookupErr } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", caller.id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (lookupErr) {
      console.error("Customer lookup failed:", lookupErr.message);
      return res.status(500).json({ error: "Could not look up your billing account." });
    }
    const customerId = row && row.stripe_customer_id;

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
