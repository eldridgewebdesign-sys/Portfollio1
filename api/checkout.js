// =====================================================================
// Serverless function: create a Stripe Payment Element client secret.
//
// Runs ONLY on the server (e.g. Vercel/Netlify functions). This is the
// one place the Stripe SECRET key is used — it must never reach the
// browser. The browser POSTs a priceId here, we create the correct
// Stripe payment object, and we return its client secret.
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

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "A valid userId is required." });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "A valid email is required." });
    }

    // ---- Look up the price to decide the Payment Element flow. ----
    // Recurring prices create an incomplete subscription and use the first
    // invoice's confirmation secret. One-time prices create a PaymentIntent
    // directly.
    const price = await stripe.prices.retrieve(priceId);

    if (!price.recurring) {
      if (price.unit_amount == null) {
        return res.status(400).json({ error: "Price is missing a valid amount." });
      }

      const intent = await stripe.paymentIntents.create({
        amount: price.unit_amount,
        currency: price.currency || "usd",
        receipt_email: email,
        metadata: {
          supabase_user_id: userId,
          price_id: priceId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.status(200).json({ clientSecret: intent.client_secret });
    }

    // Reuse the customer for this email if one already exists, otherwise create one.
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer = existingCustomers.data[0];

    try {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      customer = existingCustomers.data[0];

      if (!customer) {
        customer = await stripe.customers.create({
          email,
          metadata: {
            supabase_user_id: userId,
          },
        });
      }

      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        metadata: {
          supabase_user_id: userId,
          price_id: priceId,
          userId,
          email,
        },
        expand: ["latest_invoice.confirmation_secret"],
      });
    } catch (error) {
      console.error("Stripe subscription checkout failed:", {
        message: error.message,
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param,
        priceId,
        userId,
        email,
        hasRecurringPrice: !!price.recurring,
        customerId: customer?.id,
        subscriptionId: subscription?.id,
      });
      return res.status(500).json({
        error: "Could not start subscription payment",
      });
    }

    const clientSecret = subscription.latest_invoice?.confirmation_secret?.client_secret;

    if (!clientSecret) {
      console.error("Stripe subscription confirmation secret missing:", {
        priceId,
        userId,
        email,
        hasRecurringPrice: !!price.recurring,
        customerId: customer?.id,
        subscriptionId: subscription?.id,
      });
      throw new Error(
        "No subscription confirmation secret was returned from Stripe (subscription.latest_invoice.confirmation_secret.client_secret was empty)."
      );
    }

    return res.status(200).json({
      clientSecret,
      subscriptionId: subscription.id,
      mode: "subscription",
    });
  } catch (err) {
    // Log the real error server-side; return a safe message to the client.
    console.error("Checkout error:", {
      message: err?.message,
      code: err?.code,
      type: err?.type,
    });
    return res.status(500).json({
      error: "Could not start checkout. Please try again.",
    });
  }
};
