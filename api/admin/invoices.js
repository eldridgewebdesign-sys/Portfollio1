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
//   (optional)  SUPER_ADMIN_EMAILS / ADMIN_EMAILS — see api/admin.js
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

// ---------------------------------------------------------------------
// Admin roster — KEEP IN SYNC with api/admin.js (see the full note there).
// Super-admins control the admin kill switch and are never blocked by it;
// regular admins are. Env vars override the defaults without a code change.
// ---------------------------------------------------------------------
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "wyatt@websharke.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "wyatt@websharke.com,kaiden@websharke.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function roleFor(email) {
  const e = (email || "").trim().toLowerCase();
  if (!e) return null;
  if (SUPER_ADMIN_EMAILS.includes(e)) return "superadmin";
  if (ADMIN_EMAILS.includes(e)) return "admin";
  return null;
}

// Is the admin kill switch on? Fails open on a read error (see api/admin.js).
async function adminsLocked(supa) {
  try {
    const { data, error } = await supa
      .from("platform_settings").select("admins_locked").eq("id", 1).maybeSingle();
    if (error) return false;
    return !!(data && data.admins_locked);
  } catch (_) {
    return false;
  }
}

// Invoice lifecycle + build-workflow states the system accepts. Creation only
// uses draft/issued; the later stages (in_progress/finished/live) are set from
// the admin Recent Payments tab via api/admin.js (set_invoice_status). Keeping
// the full set here keeps the allowed-status list in one place.
const ALLOWED_STATUS = ["draft", "issued", "paid", "overdue", "void", "canceled", "in_progress", "finished", "live"];

// Money sanity cap (cents). Blocks absurd / overflow values while staying
// comfortably inside JS safe-integer range. $50,000,000.00.
const MAX_CENTS = 5_000_000_000;
const MAX_QTY = 1_000_000;

// Stripe's minimum card charge is $0.50 USD (50 cents). A nonzero invoice below
// this can never be paid online (paymentIntents.create → amount_too_small), so we
// reject it at creation. A $0 (no-charge) invoice is still allowed.
const MIN_CHARGE_CENTS = 50;

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
  // A nonzero total under Stripe's $0.50 minimum can never be paid by card.
  if (total > 0 && total < MIN_CHARGE_CENTS) {
    throw new HttpError(400, "Invoice total must be at least $0.50 to be paid by card (Stripe's minimum), or exactly $0 for a no-charge invoice.");
  }

  return {
    invoice: {
      client_user_id: clientUserId,
      title,
      notes,
      due_date: dueDate,
      status,
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

  // ---- 2. Authorize: only an admin may proceed. This route only ever
  //      writes invoices (create / update / delete), so a locked regular
  //      admin is blocked outright; the owner (super-admin) is never blocked.
  const callerRole = roleFor(caller.email);
  if (!callerRole) {
    return res.status(403).json({ error: "Forbidden: admin access required." });
  }
  if (callerRole !== "superadmin" && await adminsLocked(supa)) {
    return res.status(403).json({ error: "Admin actions are locked by the owner right now. You can still view, but changes are turned off." });
  }

  // ---- 3. Parse the body + pick the operation (create | update | delete). ----
  // The invoice builder sends no `op` (defaults to create). The Recent Payments
  // editor sends op:"update" + invoice_id; delete sends op:"delete" + invoice_id.
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  const op = typeof body.op === "string" ? body.op.trim().toLowerCase() : "create";

  try {
    // ================= DELETE =================
    // Remove an invoice (its line items cascade via FK). Deleting a PAID invoice
    // also removes that payment record — the Stripe charge itself is NOT refunded
    // here; the dashboard confirms this before calling.
    if (op === "delete") {
      const invoiceId = typeof body.invoice_id === "string" ? body.invoice_id.trim() : "";
      if (!invoiceId || !UUID_RE.test(invoiceId)) return res.status(400).json({ error: "A valid invoice_id is required." });

      const { data: before, error: loadErr } = await supa.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
      if (loadErr) throw new Error(loadErr.message);
      if (!before) return res.status(404).json({ error: "Invoice not found." });

      const { error: delErr } = await supa.from("invoices").delete().eq("id", invoiceId);
      if (delErr) throw new Error(delErr.message);

      await logActivity(supa, {
        admin_email: caller.email, action: "invoice_deleted", entity_type: "invoice",
        entity_id: String(invoiceId), affected_user_id: before.client_user_id ? String(before.client_user_id) : null,
        changed_field: null,
        old_value: (before.title || "") + (before.total_amount_cents != null ? " — " + before.total_amount_cents + " cents" : "") + " (" + (before.status || "") + ")",
        new_value: null,
      });
      return res.status(200).json({ deleted: true });
    }

    // ---- create + update both validate + recompute the full invoice body. ----
    let parsed;
    try {
      parsed = parseInvoiceBody(body);
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
      return res.status(400).json({ error: "Invalid invoice data." });
    }

    // Make sure the client exists (auth.users is the source of truth). Only a
    // genuinely-missing user is a 404; a transient lookup failure falls through
    // to the 500 handler rather than misreporting "client not found".
    const { data: userRes, error: userErr } = await supa.auth.admin.getUserById(parsed.invoice.client_user_id);
    if (userErr) {
      if (userErr.status === 404) return res.status(404).json({ error: "No client found for the supplied client_user_id." });
      throw new Error(userErr.message || "Failed to verify the client.");
    }
    if (!userRes || !userRes.user) return res.status(404).json({ error: "No client found for the supplied client_user_id." });

    // ================= UPDATE =================
    // Replace the invoice header + all line items atomically (RPC). paid_at and
    // the Stripe PaymentIntent id are preserved — editing an invoice's contents
    // never rewrites its payment history.
    if (op === "update") {
      const invoiceId = typeof body.invoice_id === "string" ? body.invoice_id.trim() : "";
      if (!invoiceId || !UUID_RE.test(invoiceId)) return res.status(400).json({ error: "A valid invoice_id is required." });

      const { data: updated, error: rpcErr } = await supa.rpc("update_invoice_with_items", {
        p_invoice_id: invoiceId,
        p_client_user_id: parsed.invoice.client_user_id,
        p_title: parsed.invoice.title,
        p_notes: parsed.invoice.notes,
        p_due_date: parsed.invoice.due_date,
        p_status: parsed.invoice.status,
        p_subtotal_amount_cents: parsed.invoice.subtotal_amount_cents,
        p_discount_amount_cents: parsed.invoice.discount_amount_cents,
        p_tax_amount_cents: parsed.invoice.tax_amount_cents,
        p_total_amount_cents: parsed.invoice.total_amount_cents,
        p_items: parsed.items,
      });
      if (rpcErr) {
        if (rpcErr.code === "PGRST202" || /update_invoice_with_items/.test(rpcErr.message || "")) {
          console.error("update-invoice RPC missing — apply db/invoices-update.sql:", rpcErr.message);
          return res.status(503).json({ error: "Invoice editing isn't provisioned yet. Apply db/invoices-update.sql in Supabase, then try again." });
        }
        if (/invoice not found/i.test(rpcErr.message || "")) return res.status(404).json({ error: "Invoice not found." });
        throw new Error(rpcErr.message);
      }
      const invoice = updated && updated.invoice;
      const items = (updated && updated.items) || [];
      if (!invoice) throw new Error("Invoice update returned no data.");

      await logActivity(supa, {
        admin_email: caller.email, action: "invoice_updated", entity_type: "invoice",
        entity_id: String(invoiceId), affected_user_id: parsed.invoice.client_user_id,
        changed_field: null, old_value: null,
        new_value: parsed.invoice.title + " — " + parsed.invoice.total_amount_cents + " cents (" + items.length + " item(s))",
      });
      return res.status(200).json({ invoice, items });
    }

    // ================= CREATE (default) =================
    // A single Postgres RPC inserts the header and the line items inside ONE
    // transaction, so they can never partially succeed (see
    // public.create_invoice_with_items in db/invoices-schema.sql — the DB also
    // generates each item's total).
    const { data: created, error: rpcErr } = await supa.rpc("create_invoice_with_items", {
      p_client_user_id: parsed.invoice.client_user_id,
      p_title: parsed.invoice.title,
      p_notes: parsed.invoice.notes,
      p_due_date: parsed.invoice.due_date,
      p_status: parsed.invoice.status,
      p_subtotal_amount_cents: parsed.invoice.subtotal_amount_cents,
      p_discount_amount_cents: parsed.invoice.discount_amount_cents,
      p_tax_amount_cents: parsed.invoice.tax_amount_cents,
      p_total_amount_cents: parsed.invoice.total_amount_cents,
      p_items: parsed.items,
    });
    if (rpcErr) {
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

    await logActivity(supa, {
      admin_email: caller.email,
      action: "invoice_created",
      entity_type: "invoice",
      entity_id: String(invoice.id),
      affected_user_id: parsed.invoice.client_user_id,
      changed_field: null,
      old_value: null,
      new_value:
        parsed.invoice.title + " — " + parsed.invoice.total_amount_cents + " cents (" + items.length + " item(s))",
    });

    return res.status(201).json({ invoice, items });
  } catch (err) {
    // Log server-side and surface the (admin-only, safe) message so the dashboard
    // toast can show a useful reason to the admin, the only caller that reaches here.
    console.error("Admin invoice write error [" + op + "]:", err && err.message);
    return res.status(500).json({ error: err && err.message ? err.message : "Could not save the invoice." });
  }
};
