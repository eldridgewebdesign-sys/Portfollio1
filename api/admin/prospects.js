// =====================================================================
// Serverless function: WebSharke ADMIN — prospects (Client Gather leads).
//
//   POST /api/admin/prospects   (Vercel maps api/admin/prospects.js here)
//
// Admin-only. Reuses the EXACT auth gate from /api/admin (api/admin.js):
// the caller must send a valid Supabase access token in the Authorization
// header; we verify it with the SERVICE ROLE key and confirm the caller's
// email is an admin email before anything runs. A missing/invalid token
// gets 401; a valid non-admin session gets 403.
//
// This is the server side of Dashboard → Prospects: the shared list of
// leads found by the Client Gather desktop app. One admin uploads the app's
// export file; every admin sees the same list.
//
// Operations (body.op):
//   list          { search, filters, sortBy, sortDir, limit, offset } -> { rows, hasMore }
//   get           { id }                                   -> { row }
//   import        { clients: [ {...} ], replace_all? }      -> { imported, inserted, updated, ids }
//   upload_image  { prospect_id, kind, index, contentType, dataBase64 } -> { url }
//   set_status    { id, status?, status_note? }             -> { row }
//   delete        { id }                                    -> { deleted: true }
//
// `list` and `get` are READS — a regular admin frozen by the owner's admin
// lock may still run them. Everything else is a write and is refused while
// locked (the owner / super-admin is never blocked).
//
// WHY IMPORT IS BATCHED AND IMAGES ARE SEPARATE: a Vercel function body is
// capped around 4.5 MB. Screenshots are far too big to send with the record
// set, so the dashboard POSTs the text records in batches, then sends each
// screenshot as its own upload_image call. Images land in Supabase Storage
// and only their URL is stored on the row.
//
// STATUS IS SITE-ONLY: `status` / `status_note` are typed by an admin here
// and are NOT part of IMPORT_FIELDS, so re-importing an export refreshes the
// scraped data and never touches an admin's workflow notes.
//
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional)  SUPER_ADMIN_EMAILS / ADMIN_EMAILS — see api/admin.js
//
// Tables / buckets (see db/prospects-schema.sql):
//   public.prospects              — one row per lead
//   storage bucket "prospect-screenshots" (public read)
// =====================================================================

const { createClient } = require("@supabase/supabase-js");

// ---------------------------------------------------------------------
// Admin roster — KEEP IN SYNC with api/admin.js (see the full note there).
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

const READ_OPS = new Set(["list", "get"]);

const BUCKET = "prospect-screenshots";
// Per-image cap. Base64 inflates by ~33%, so 3 MB decoded stays inside the
// ~4.5 MB serverless body limit with room for the rest of the JSON.
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMPORT_BATCH = 50;
const MAX_TEXT = 20000;      // per free-text field, generous but bounded
const MAX_PROBLEMS = 40;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Columns an import may write. `status`, `status_note`, `status_updated_*`
// are deliberately absent: they belong to the site, not to the desktop app,
// so a re-import can never wipe an admin's workflow notes.
const IMPORT_FIELDS = [
  "source_id", "business_name", "what_they_sell", "website",
  "owner_name", "phone", "email", "owner_name_source", "phone_source",
  "owner_verified_on", "phone_verified_on", "contact_verified", "verification_note",
  "security_risks", "visual_details", "overall_look_rating", "ai_generated_rating",
  "examples", "problems", "raw_json", "date_found",
];

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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Turns Postgres' "relation does not exist" into the one instruction that fixes it.
function missingTableHint(message) {
  return /relation .*prospects.* does not exist/i.test(message || "")
    ? "The prospects table doesn't exist yet — run db/prospects-schema.sql in the Supabase SQL editor first."
    : message;
}

function text(v, max) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return s.length > (max || MAX_TEXT) ? s.slice(0, max || MAX_TEXT) : s;
}

// ---------------------------------------------------------------------
// Map one exported Client Gather record onto a prospects row. Unknown keys
// are dropped, every string is bounded, and nothing here can set a status.
// ---------------------------------------------------------------------
function toRow(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) {
    throw new HttpError(400, "Each client must be a JSON object.");
  }
  const sourceId = text(c.id || c.source_id, 128).trim();
  if (!sourceId) throw new HttpError(400, "Each client needs an id from the app.");

  const problems = Array.isArray(c.problems) ? c.problems.slice(0, MAX_PROBLEMS) : [];

  return {
    source_id: sourceId,
    business_name: text(c.businessName ?? c.business_name, 300),
    what_they_sell: text(c.whatTheySell ?? c.what_they_sell),
    website: text(c.website, 500),
    owner_name: text(c.ownerName ?? c.owner_name, 300),
    phone: text(c.phone, 100),
    email: text(c.email, 320),
    owner_name_source: text(c.ownerNameSource ?? c.owner_name_source, 500),
    phone_source: text(c.phoneSource ?? c.phone_source, 500),
    owner_verified_on: text(c.ownerVerifiedOn ?? c.owner_verified_on, 500),
    phone_verified_on: text(c.phoneVerifiedOn ?? c.phone_verified_on, 500),
    contact_verified: !!(c.contactVerified ?? c.contact_verified),
    verification_note: text(c.verificationNote ?? c.verification_note, 2000),
    security_risks: text(c.securityRisks ?? c.security_risks),
    visual_details: text(c.visualDetails ?? c.visual_details),
    overall_look_rating: text(c.overallLookRating ?? c.overall_look_rating, 500),
    ai_generated_rating: text(c.aiGeneratedRating ?? c.ai_generated_rating, 1000),
    examples: text(c.examples),
    date_found: text(c.dateFound ?? c.date_found, 60),
    raw_json: text(c.rawJson ?? c.raw_json, 100000),
    // image_url is preserved on re-import so a refresh doesn't drop screenshots
    // that were uploaded on a previous run.
    problems: problems.map((p) => ({
      type: text(p && p.type, 40),
      title: text(p && p.title, 300),
      detail: text(p && p.detail, 4000),
      location: text(p && p.location, 500),
      anchor: text(p && p.anchor, 500),
      image_url: text(p && p.image_url, 700) || null,
    })),
  };
}

// =====================================================================
// Operations
// =====================================================================

async function listProspects(supa, p) {
  const f = p.filters || {};
  let q = supa.from("prospects").select("*");

  if (f.verified === "yes") q = q.eq("contact_verified", true);
  if (f.verified === "no") q = q.eq("contact_verified", false);
  if (f.status === "__none__") q = q.eq("status", "");
  else if (f.status) q = q.eq("status", f.status);

  const search = typeof p.search === "string" ? p.search.trim() : "";
  if (search) {
    const s = search.replace(/[%,]/g, "");
    q = q.or([
      "business_name", "owner_name", "phone", "email", "website", "status", "what_they_sell",
    ].map((c) => `${c}.ilike.%${s}%`).join(","));
  }

  const sortable = new Set([
    "business_name", "owner_name", "phone", "status", "imported_at", "date_found", "contact_verified",
  ]);
  const sortBy = sortable.has(p.sortBy) ? p.sortBy : "imported_at";
  q = q.order(sortBy, { ascending: (p.sortDir || "desc") !== "desc", nullsFirst: false });

  const limit = Math.min(Number(p.limit) || 50, 100000);
  const offset = Number(p.offset) || 0;
  q = q.range(offset, offset + limit - 1);

  const { data, error } = await q;
  if (error) throw new Error(missingTableHint(error.message));
  return { rows: data || [], hasMore: (data || []).length === limit };
}

async function getProspect(supa, p) {
  const id = text(p.id, 64).trim();
  if (!UUID_RE.test(id)) throw new HttpError(400, "A valid prospect id is required.");
  const { data, error } = await supa.from("prospects").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new HttpError(404, "Prospect not found.");
  return { row: data };
}

async function importProspects(supa, caller, p) {
  const clients = Array.isArray(p.clients) ? p.clients : null;
  if (!clients || !clients.length) throw new HttpError(400, "No clients were sent to import.");
  if (clients.length > MAX_IMPORT_BATCH) {
    throw new HttpError(400, "Too many clients in one batch (max " + MAX_IMPORT_BATCH + ").");
  }

  const rows = clients.map(toRow);
  const sourceIds = rows.map((r) => r.source_id);

  // Which of these already exist? Used both to report insert/update counts and
  // to carry forward screenshot URLs from a previous import.
  const { data: existing, error: exErr } = await supa
    .from("prospects").select("id, source_id, screenshot_url, problems").in("source_id", sourceIds);
  if (exErr) throw new Error(exErr.message);

  const bySource = {};
  (existing || []).forEach((r) => { bySource[r.source_id] = r; });

  const now = new Date().toISOString();
  const payload = rows.map((r) => {
    const prev = bySource[r.source_id];
    if (prev) {
      // Keep image URLs already uploaded for problems that are still present
      // (matched by position, which is how the export orders them).
      const prevProblems = Array.isArray(prev.problems) ? prev.problems : [];
      r.problems = r.problems.map((pr, i) => ({
        ...pr,
        image_url: pr.image_url || (prevProblems[i] && prevProblems[i].image_url) || null,
      }));
    }
    return { ...r, imported_at: now, imported_by: caller.email, updated_at: now };
  });

  const { data, error } = await supa
    .from("prospects")
    .upsert(payload, { onConflict: "source_id" })
    .select("id, source_id");
  if (error) throw new Error(missingTableHint(error.message));

  const inserted = payload.filter((r) => !bySource[r.source_id]).length;
  const updated = payload.length - inserted;

  await logActivity(supa, {
    admin_email: caller.email, action: "prospects_imported", entity_type: "prospect",
    entity_id: null, affected_user_id: null,
    changed_field: "import", old_value: String(updated) + " updated", new_value: String(inserted) + " added",
  });

  // source_id -> prospect id, so the browser knows where to send each screenshot.
  const ids = {};
  (data || []).forEach((r) => { ids[r.source_id] = r.id; });
  return { imported: payload.length, inserted, updated, ids };
}

async function uploadImage(supa, caller, p) {
  const id = text(p.prospect_id, 64).trim();
  if (!UUID_RE.test(id)) throw new HttpError(400, "A valid prospect id is required.");

  const kind = p.kind === "problem" ? "problem" : "fullpage";
  const index = Number(p.index);
  if (kind === "problem" && (!Number.isInteger(index) || index < 0 || index >= MAX_PROBLEMS)) {
    throw new HttpError(400, "A valid problem index is required.");
  }

  const ct = String(p.contentType || "image/png").toLowerCase();
  if (!/^image\/(png|jpeg|webp)$/.test(ct)) throw new HttpError(400, "Screenshots must be PNG, JPEG or WebP.");
  if (!p.dataBase64) throw new HttpError(400, "No image data was provided.");

  const buf = Buffer.from(String(p.dataBase64), "base64");
  if (!buf.length) throw new HttpError(400, "The image data was empty.");
  if (buf.length > MAX_IMAGE_BYTES) throw new HttpError(400, "Screenshot is too large (max 3 MB).");

  const { data: row, error: loadErr } = await supa
    .from("prospects").select("id, problems").eq("id", id).maybeSingle();
  if (loadErr) throw new Error(loadErr.message);
  if (!row) throw new HttpError(404, "Prospect not found.");

  const ext = ct === "image/jpeg" ? "jpg" : ct === "image/webp" ? "webp" : "png";
  const name = kind === "problem" ? "problem-" + index : "fullpage";
  const path = id + "/" + name + "-" + Date.now() + "." + ext;

  const { error: upErr } = await supa.storage.from(BUCKET)
    .upload(path, buf, { contentType: ct, upsert: true });
  if (upErr) {
    throw new Error("Upload failed: " + upErr.message +
      " — is the '" + BUCKET + "' Storage bucket created? (run db/prospects-schema.sql)");
  }

  const { data: pub } = supa.storage.from(BUCKET).getPublicUrl(path);
  const url = pub && pub.publicUrl;
  if (!url) throw new Error("Could not resolve the uploaded image URL.");

  const updates = { updated_at: new Date().toISOString() };
  if (kind === "fullpage") {
    updates.screenshot_url = url;
  } else {
    const problems = Array.isArray(row.problems) ? row.problems.slice() : [];
    if (!problems[index]) throw new HttpError(400, "That problem doesn't exist on this prospect.");
    problems[index] = { ...problems[index], image_url: url };
    updates.problems = problems;
  }

  const { error: updErr } = await supa.from("prospects").update(updates).eq("id", id);
  if (updErr) throw new Error(updErr.message);

  return { url };
}

async function setStatus(supa, caller, p) {
  const id = text(p.id, 64).trim();
  if (!UUID_RE.test(id)) throw new HttpError(400, "A valid prospect id is required.");

  const hasStatus = p.status !== undefined;
  const hasNote = p.status_note !== undefined;
  if (!hasStatus && !hasNote) throw new HttpError(400, "Nothing to update.");

  const { data: before, error: loadErr } = await supa
    .from("prospects").select("*").eq("id", id).maybeSingle();
  if (loadErr) throw new Error(loadErr.message);
  if (!before) throw new HttpError(404, "Prospect not found.");

  const updates = { updated_at: new Date().toISOString() };
  // Free text on purpose: the admin types whatever stage they use. Trimmed and
  // length-capped, but never forced into a fixed list.
  if (hasStatus) updates.status = text(p.status, 80).trim();
  if (hasNote) updates.status_note = text(p.status_note, 4000);
  updates.status_updated_at = updates.updated_at;
  updates.status_updated_by = caller.email;

  const { data, error } = await supa
    .from("prospects").update(updates).eq("id", id).select().maybeSingle();
  if (error) throw new Error(error.message);

  if (hasStatus && updates.status !== (before.status || "")) {
    await logActivity(supa, {
      admin_email: caller.email, action: "prospect_status", entity_type: "prospect",
      entity_id: String(id), affected_user_id: null,
      changed_field: "status", old_value: before.status || "", new_value: updates.status,
    });
  }
  return { row: data };
}

async function deleteProspect(supa, caller, p) {
  const id = text(p.id, 64).trim();
  if (!UUID_RE.test(id)) throw new HttpError(400, "A valid prospect id is required.");

  const { data: before } = await supa.from("prospects").select("*").eq("id", id).maybeSingle();
  if (!before) throw new HttpError(404, "Prospect not found.");

  const { error } = await supa.from("prospects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Best-effort: drop this prospect's screenshots so Storage doesn't collect orphans.
  try {
    const { data: files } = await supa.storage.from(BUCKET).list(id);
    if (files && files.length) {
      await supa.storage.from(BUCKET).remove(files.map((f) => id + "/" + f.name));
    }
  } catch (e) {
    console.error("prospect screenshot cleanup failed:", e && e.message);
  }

  await logActivity(supa, {
    admin_email: caller.email, action: "prospect_deleted", entity_type: "prospect",
    entity_id: String(id), affected_user_id: null,
    changed_field: null, old_value: before.business_name || before.source_id, new_value: null,
  });
  return { deleted: true };
}

// =====================================================================
// Handler
// =====================================================================
module.exports = async (req, res) => {
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
    console.error("Admin prospects API: Supabase env vars are not set.");
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

  // ---- 2. Authorize: admins only; writes additionally respect the admin lock. ----
  const callerRole = roleFor(caller.email);
  if (!callerRole) return res.status(403).json({ error: "Forbidden: admin access required." });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  const op = typeof body.op === "string" ? body.op.trim().toLowerCase() : "";

  if (callerRole !== "superadmin" && !READ_OPS.has(op) && await adminsLocked(supa)) {
    return res.status(403).json({ error: "Admin actions are locked by the owner right now. You can still view, but changes are turned off." });
  }

  try {
    switch (op) {
      case "list":         return res.status(200).json(await listProspects(supa, body));
      case "get":          return res.status(200).json(await getProspect(supa, body));
      case "import":       return res.status(200).json(await importProspects(supa, caller, body));
      case "upload_image": return res.status(200).json(await uploadImage(supa, caller, body));
      case "set_status":   return res.status(200).json(await setStatus(supa, caller, body));
      case "delete":       return res.status(200).json(await deleteProspect(supa, caller, body));
      default:
        return res.status(400).json({ error: "Unknown prospects operation: " + (op || "(none)") });
    }
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error("Prospects op error [" + op + "]:", err && err.message);
    return res.status(500).json({ error: err && err.message ? err.message : "Prospects action failed." });
  }
};
