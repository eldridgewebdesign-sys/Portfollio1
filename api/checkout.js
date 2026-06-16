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
    // invoice PaymentIntent. One-time prices create a PaymentIntent directly.
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

    let customer = null;
    let subscription = null;

    try {
      console.log("Starting subscription checkout path:", {
        priceId,
        userId,
        email,
        hasRecurringPrice: !!price.recurring,
        priceCurrency: price.currency,
        priceUnitAmount: price.unit_amount,
      });

      console.log("Looking up existing Stripe customer by email:", {
        email,
      });

      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      console.log("Existing Stripe customer lookup result:", {
        count: existingCustomers.data.length,
        customerIds: existingCustomers.data.map((existingCustomer) => existingCustomer.id),
        customerEmails: existingCustomers.data.map((existingCustomer) => existingCustomer.email),
      });

      customer = existingCustomers.data[0];

      if (!customer) {
        customer = await stripe.customers.create({
          email,
          metadata: {
            supabase_user_id: userId,
          },
        });
        console.log("Stripe customer decision:", {
          customerId: customer.id,
          customerEmail: customer.email,
          reused: false,
          newlyCreated: true,
        });
      } else {
        console.log("Stripe customer decision:", {
          customerId: customer.id,
          customerEmail: customer.email,
          reused: true,
          newlyCreated: false,
        });
      }

      console.log("Creating Stripe subscription:", {
        customerId: customer.id,
        priceId,
        metadata: {
          supabase_user_id: userId,
          price_id: priceId,
        },
      });

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
        },
        expand: ["latest_invoice.payment_intent"],
      });

      console.log("Stripe subscription created:", {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionCustomer: subscription.customer,
        latestInvoice: subscription.latest_invoice,
        items: subscription.items,
      });
    } catch (error) {
      console.error("Stripe subscription checkout failed:", {
        message: error.message,
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param,
        raw: error.raw,
        stack: error.stack,
        priceId,
        userId,
        email,
        hasRecurringPrice: !!price.recurring,
        customerId: customer?.id,
        subscriptionId: subscription?.id,
      });
      throw error;
    }

    console.log("Stripe subscription latest_invoice inspection:", {
      latestInvoice: subscription.latest_invoice,
      latestInvoiceType: typeof subscription.latest_invoice,
      hasPaymentIntent: !!subscription.latest_invoice?.payment_intent,
      hasConfirmationSecret: !!subscription.latest_invoice?.confirmation_secret,
    });

    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;

    console.log("Subscription checkout secret extraction:", {
      hasPaymentIntentClientSecret: Boolean(subscription?.latest_invoice?.payment_intent?.client_secret),
      paymentIntentClientSecret: subscription?.latest_invoice?.payment_intent?.client_secret,
      hasConfirmationSecret: Boolean(subscription?.latest_invoice?.confirmation_secret),
      confirmationSecret: subscription?.latest_invoice?.confirmation_secret,
      returning: "payment_intent.client_secret",
    });

    if (!clientSecret) {
      console.error("Stripe subscription payment intent client secret missing:", {
        priceId,
        userId,
        email,
        hasRecurringPrice: !!price.recurring,
        customerId: customer?.id,
        subscriptionId: subscription?.id,
      });
      return res.status(500).json({ error: "Could not start subscription payment. Please try again." });
    }

    return res.status(200).json({ clientSecret });
  } catch (err) {
    // Log the real error server-side; return a safe message to the client.
    console.error("Stripe checkout error:", err);
    return res.status(500).json({
      error: "Could not start checkout. Please try again.",
      detail: err.message,
      code: err.code,
      type: err.type
    });
  }
};
