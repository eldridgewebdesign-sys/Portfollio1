// =====================================================================
// Serverless function: WebSharke ADMIN — create a client invoice.
//
//   POST /api/admin/invoices   (Vercel maps api/admin/invoices.js here)
//
// Admin-only. Reuses the EXACT auth gate from /api/admin (api/admin.js):
// the caller must send a valid Supabase access token in the Authorization
// header; we verify it with the SERVICE ROLE key and confirm the caller's
// email is the admin email before anything runs. A missing/invalid token
// gets 401; a valid non-admin session gets 403.
//
// The browser NEVER sees the service-role key. Clients cannot create or
// edit invoices from the browser: RLS has no client INSERT/UPDATE policy
// on invoices / invoice_items (see db/invoices-schema.sql), so only this
// server route (service role) writes them.
//
// Request body (JSON):
//   {
//     "client_user_id": "uuid",        // required — the client the invoice is for
//     "title": "Project Invoice",      // required
//     "notes": "Optional notes",       // optional
//     "due_date": "2026-07-01",        // optional, YYYY-MM-DD
//     "status": "issued",              // optional, default "draft"
//     "billing_type": "monthly",       // optional, default "one_time" (one_time|monthly|annual)
//     "discount_amount_cents": 0,      // optional, default 0
//     "tax_amount_cents": 0,           // optional, default 0
//     "items": [                       // required, >= 1
//       { "name": "Frontend Website", "description": "Base website build",
//         "quantity": 1, "unit_amount_cents": 75000 }
//     ]
//   }
//
// The server computes the invoice's subtotal_amount_cents (sum of
// quantity * unit_amount_cents) and total_amount_cents (subtotal - discount + tax).
// Each line item's own total_amount_cents is a STORED GENERATED column in
// Postgres, so the database computes it and the route must NOT insert it.
// Amounts from the client body are NEVER trusted for the subtotal/total — they
// are recomputed here.
//
// Responses:
//   201 { invoice, items }              — created
//   400 { error }                       — invalid request data
//   401 { error }                       — missing / invalid session token
//   403 { error }                       — valid session but not the admin
//   404 { error }                       — client_user_id does not exist
//   500 { error }                       — server / database error
//
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional)  ADMIN_EMAIL  — defaults to weeldridge09@gmail.com
//
// Tables (see db/invoices-schema.sql):
//   public.invoices       (id, client_user_id, title, notes, due_date, status,
//                          subtotal_amount_cents, discount_amount_cents,
//                          tax_amount_cents, total_amount_cents, created_at)
//   public.invoice_items  (id, invoice_id, name, description, quantity,
//                          unit_amount_cents, total_amount_cents [GENERATED],
//                          created_at)
// =====================================================================

const { createClient } = require("@supabase/supabase-js");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "weeldridge09@gmail.com")
  .trim()
  .toLowerCase();

// Invoice lifecycle states the route will accept.
const ALLOWED_STATUS = ["draft", "issued", "paid", "overdue", "void", "canceled"];

// How the client is billed. 'one_time' → a single PaymentIntent; 'monthly' /
// 'annual' → a recurring Stripe subscription started at pay time (api/invoices/pay).
const ALLOWED_BILLING_TYPES = ["one_time", "monthly", "annual"];

// Money sanity cap (cents). Blocks absurd / overflow values while staying
// comfortably inside JS safe-integer range. $50,000,000.00.
const MAX_CENTS = 5_000_000_000;
const MAX_QTY = 1_000_000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Best-effort audit log write. Never throws — logging must not break the action.
async function logActivity(supa, entry) {
  try {
    await supa.from("admin_activity_log").insert(entry);
  } catch (e) {
    console.error("activity log write failed:", e && e.message);
  }
}

// Thrown during validation; maps to a specific HTTP status + safe client message.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isCents(n) {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= MAX_CENTS;
}

// Validate + normalise the request body. Throws HttpError(400) on bad input.
// Returns { invoice, items } with all money fields recomputed server-side.
function parseInvoiceBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  // ---- client_user_id (required, UUID) ----
  const clientUserId = typeof body.client_user_id === "string" ? body.client_user_id.trim() : "";
  if (!clientUserId) throw new HttpError(400, "client_user_id is required.");
  if (!UUID_RE.test(clientUserId)) throw new HttpError(400, "client_user_id must be a valid UUID.");

  // ---- title (required) ----
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) throw new HttpError(400, "title is required.");
  if (title.length > 200) throw new HttpError(400, "title is too long (max 200 characters).");

  // ---- notes (optional) ----
  let notes = null;
  if (body.notes !== undefined && body.notes !== null && body.notes !== "") {
    if (typeof body.notes !== "string") throw new HttpError(400, "notes must be a string.");
    if (body.notes.length > 5000) throw new HttpError(400, "notes is too long (max 5000 characters).");
    notes = body.notes;
  }

  // ---- due_date (optional, real YYYY-MM-DD) ----
  let dueDate = null;
  if (body.due_date !== undefined && body.due_date !== null && body.due_date !== "") {
    if (typeof body.due_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.due_date)) {
      throw new HttpError(400, "due_date must be a date string in YYYY-MM-DD format.");
    }
    const d = new Date(body.due_date + "T00:00:00Z");
    if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== body.due_date) {
      throw new HttpError(400, "due_date is not a valid calendar date.");
    }
    dueDate = body.due_date;
  }

  // ---- status (optional, whitelisted) ----
  let status = "draft";
  if (body.status !== undefined && body.status !== null && body.status !== "") {
    if (typeof body.status !== "string" || !ALLOWED_STATUS.includes(body.status)) {
      throw new HttpError(400, "status must be one of: " + ALLOWED_STATUS.join(", ") + ".");
    }
    status = body.status;
  }

  // ---- billing_type (optional, whitelisted, default one_time) ----
  let billingType = "one_time";
  if (body.billing_type !== undefined && body.billing_type !== null && body.billing_type !== "") {
    if (typeof body.billing_type !== "string" || !ALLOWED_BILLING_TYPES.includes(body.billing_type)) {
      throw new HttpError(400, "billing_type must be one of: " + ALLOWED_BILLING_TYPES.join(", ") + ".");
    }
    billingType = body.billing_type;
  }

  // ---- discount / tax (optional, default 0) ----
  const discount =
    body.discount_amount_cents === undefined || body.discount_amount_cents === null
      ? 0
      : body.discount_amount_cents;
  if (!isCents(discount)) {
    throw new HttpError(400, "discount_amount_cents must be a whole number of cents between 0 and " + MAX_CENTS + ".");
  }
  const tax =
    body.tax_amount_cents === undefined || body.tax_amount_cents === null
      ? 0
      : body.tax_amount_cents;
  if (!isCents(tax)) {
    throw new HttpError(400, "tax_amount_cents must be a whole number of cents between 0 and " + MAX_CENTS + ".");
  }

  // ---- items (required, >= 1) ----
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new HttpError(400, "items must be a non-empty array.");
  }
  if (body.items.length > 200) throw new HttpError(400, "Too many items (max 200).");

  let subtotal = 0;
  const items = body.items.map((raw, i) => {
    const at = "items[" + i + "]";
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new HttpError(400, at + " must be an object.");
    }

    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!name) throw new HttpError(400, at + ".name is required.");
    if (name.length > 200) throw new HttpError(400, at + ".name is too long (max 200 characters).");

    let description = null;
    if (raw.description !== undefined && raw.description !== null && raw.description !== "") {
      if (typeof raw.description !== "string") throw new HttpError(400, at + ".description must be a string.");
      if (raw.description.length > 2000) throw new HttpError(400, at + ".description is too long (max 2000 characters).");
      description = raw.description;
    }

    const quantity = raw.quantity === undefined || raw.quantity === null ? 1 : raw.quantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new HttpError(400, at + ".quantity must be an integer between 1 and " + MAX_QTY + ".");
    }

    const unit = raw.unit_amount_cents;
    if (!isCents(unit)) {
      throw new HttpError(400, at + ".unit_amount_cents must be a whole number of cents between 0 and " + MAX_CENTS + ".");
    }

    const lineTotal = quantity * unit;
    if (lineTotal > MAX_CENTS) throw new HttpError(400, at + " line total exceeds the maximum allowed amount.");
    subtotal += lineTotal;
    if (subtotal > MAX_CENTS) throw new HttpError(400, "Invoice subtotal exceeds the maximum allowed amount.");

    // NB: do NOT include a per-line total column here. invoice_items.total_amount_cents
    // is a STORED GENERATED column (quantity * unit_amount_cents); Postgres computes
    // it, and trying to insert it errors. We compute lineTotal above only to validate
    // the caps and accumulate the server-side subtotal — it is never written.
    return { name, description, quantity, unit_amount_cents: unit };
  });

  // A discount applies to the goods, so it can never exceed the subtotal.
  // (This also keeps discount sane relative to the line items, which the
  // independent per-field caps do not.)
  if (discount > subtotal) {
    throw new HttpError(400, "discount_amount_cents cannot exceed the invoice subtotal.");
  }

  const total = subtotal - discount + tax;
  if (total < 0) {
    throw new HttpError(400, "Discount cannot exceed the subtotal plus tax (total would be negative).");
  }
  if (total > MAX_CENTS) throw new HttpError(400, "Invoice total exceeds the maximum allowed amount.");

  return {
    invoice: {
      client_user_id: clientUserId,
      title,
      notes,
      due_date: dueDate,
      status,
      billing_type: billingType,
      subtotal_amount_cents: subtotal,
      discount_amount_cents: discount,
      tax_amount_cents: tax,
      total_amount_cents: total,
    },
    items,
  };
}

module.exports = async (req, res) => {
  // ---- CORS: the admin dashboard lives on websharke.com (same origin as the
  // API). The verified access token below is the real access control. ----
  res.setHeader("Access-Control-Allow-Origin", "https://websharke.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Admin invoices API: Supabase env vars are not set.");
    return res.status(500).json({ error: "Server is not configured for admin." });
  }

  const supa = adminClient();

  // ---- 1. Authenticate: verify the bearer token belongs to a real user. ----
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Missing authentication token." });

  let caller;
  try {
    const { data, error } = await supa.auth.getUser(token);
    if (error || !data || !data.user) throw new Error("invalid session");
    caller = data.user;
  } catch (e) {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }

  // ---- 2. Authorize: only the admin email may proceed. ----
  if (!caller.email || caller.email.trim().toLowerCase() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden: admin access required." });
  }

  // ---- 3. Parse + validate the request body. ----
  let parsed;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    parsed = parseInvoiceBody(body);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }

  try {
    // ---- 4. Make sure the client exists (auth.users is the source of truth). ----
    // Only a genuinely-missing user is a 404. A transient lookup failure is a
    // server error, so we let it fall through to the 500 handler below rather
    // than misreport it as "client not found". (A thrown error from the call
    // propagates to the outer catch == 500 for the same reason.)
    const { data: userRes, error: userErr } = await supa.auth.admin.getUserById(parsed.invoice.client_user_id);
    if (userErr) {
      if (userErr.status === 404) {
        return res.status(404).json({ error: "No client found for the supplied client_user_id." });
      }
      throw new Error(userErr.message || "Failed to verify the client.");
    }
    if (!userRes || !userRes.user) {
      return res.status(404).json({ error: "No client found for the supplied client_user_id." });
    }

    // ---- 5. Create the invoice + its line items ATOMICALLY. ----
    // A single Postgres RPC inserts the header and the line items inside ONE
    // transaction, so they can never partially succeed: if the items fail, the
    // invoice is rolled back too. No orphaned invoice with no line items, and no
    // application-side compensating delete. (See public.create_invoice_with_items
    // in db/invoices-schema.sql — the DB also generates each item's total.)
    const { data: created, error: rpcErr } = await supa.rpc("create_invoice_with_items", {
      p_client_user_id: parsed.invoice.client_user_id,
      p_title: parsed.invoice.title,
      p_notes: parsed.invoice.notes,
      p_due_date: parsed.invoice.due_date,
      p_status: parsed.invoice.status,
      p_billing_type: parsed.invoice.billing_type,
      p_subtotal_amount_cents: parsed.invoice.subtotal_amount_cents,
      p_discount_amount_cents: parsed.invoice.discount_amount_cents,
      p_tax_amount_cents: parsed.invoice.tax_amount_cents,
      p_total_amount_cents: parsed.invoice.total_amount_cents,
      p_items: parsed.items,
    });
    if (rpcErr) {
      // The route calls create_invoice_with_items by name with p_billing_type. If
      // the latest db/invoices-schema.sql migration has not been applied, PostgREST
      // can't resolve that signature (PGRST202) — surface a clear, actionable
      // message instead of a generic 500 so the admin knows to run the migration.
      if (rpcErr.code === "PGRST202" || /create_invoice_with_items/.test(rpcErr.message || "")) {
        console.error("create-invoice RPC missing/mismatched — apply db/invoices-schema.sql:", rpcErr.message);
        return res.status(503).json({
          error: "Invoice service is not fully provisioned. Apply the latest db/invoices-schema.sql migration in Supabase, then try again.",
        });
      }
      throw new Error(rpcErr.message);
    }
    const invoice = created && created.invoice;
    const items = (created && created.items) || [];
    if (!invoice) throw new Error("Invoice creation returned no data.");

    // ---- 6. Audit trail (best-effort, mirrors the other admin writes). ----
    await logActivity(supa, {
      admin_email: caller.email,
      action: "invoice_created",
      entity_type: "invoice",
      entity_id: String(invoice.id),
      affected_user_id: parsed.invoice.client_user_id,
      changed_field: null,
      old_value: null,
      new_value:
        parsed.invoice.title +
        " — " +
        parsed.invoice.total_amount_cents +
        " cents (" +
        items.length +
        " item(s))",
    });

    // ---- 7. Return the created invoice and its items. ----
    return res.status(201).json({ invoice, items });
  } catch (err) {
    // Mirror api/admin.js: log server-side and surface the (admin-only, safe)
    // message so the dashboard toast can show a useful reason — e.g. a column
    // mismatch — to the admin, who is the only caller that can reach here.
    console.error("Admin create-invoice error:", err && err.message);
    return res.status(500).json({ error: err && err.message ? err.message : "Could not create the invoice." });
  }
};
