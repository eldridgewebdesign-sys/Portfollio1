// =====================================================================
// Serverless function: a signed-in CLIENT files a request to the admin.
//
//   POST /api/requests/create   (Vercel maps api/requests/create.js here)
//
// The first (and currently only) request type is a DOMAIN CHANGE, sent
// from the dashboard's Domain tab → "Change Domain" popup. The popup asks
// the client to confirm their CURRENT PASSWORD and type the NEW DOMAIN.
// This route, in order:
//   1. verifies the Supabase access token (who is asking),
//   2. re-verifies the current password (proves it's really them),
//   3. normalises + validates the new domain (extension required),
//   4. checks the domain is NOT already registered, via RDAP (rdap.org) —
//      if it's taken we DO NOT create a request and tell the client,
//   5. inserts a `client_requests` row (service role) the admin then sees
//      under the dashboard's "Requests" section.
//
// The password is read from the request body over HTTPS, used only to
// re-authenticate, and is NEVER stored, logged, or echoed back. All writes
// use the service-role key, which the browser never sees.
//
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional)  SUPABASE_ANON_KEY — for the password re-check (a known
//               PUBLIC fallback is used if unset; the anon key is safe to
//               expose, like the one already shipped in the browser).
//
// Responses:
//   200 { ok:true,  available:true,  request:{ id, requested_domain, status } }
//   200 { ok:false, available:false, message }   domain is already taken
//   400 invalid body / invalid domain
//   401 missing/invalid session OR wrong current password
//   500 server / DB error
// =====================================================================

const { createClient } = require("@supabase/supabase-js");

// PUBLIC anon key (same value the browser already ships in js/supabase-config.js).
// Used only to re-verify a password server-side; env var overrides it.
const PUBLIC_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2YW1vc3JqcWd6ZXV5bXdrcnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDUzMzEsImV4cCI6MjA5NTkyMTMzMX0.U4MA9Pd98_rVAXwmsp4QKfKXeJeCoDq_TWNBFUDp_Tk";

// A domain must be a hostname WITH an extension (TLD), e.g. yoursite.com.
// (Up to 253 chars total; each label 1–63 chars; final label letters only.)
const DOMAIN_RE =
  /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function adminClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Strip scheme / www / path / query so "https://www.YourSite.com/x" → "yoursite.com".
function normalizeDomain(raw) {
  let d = String(raw || "").trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split(/[\/?#]/)[0];
  d = d.replace(/\.+$/, "");
  return d;
}

// Is the domain already registered? RDAP is the authoritative, keyless way to
// ask: rdap.org bootstraps to the registry's RDAP server, which returns
//   200 → the domain exists (TAKEN), 404 → not found (AVAILABLE).
// Anything else (network error, timeout, TLD without RDAP) → 'unknown', and we
// let the request through rather than block a real client on a lookup hiccup.
async function checkDomainRegistered(domain) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch("https://rdap.org/domain/" + encodeURIComponent(domain), {
      headers: { Accept: "application/rdap+json" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (res.status === 200) return "taken";
    if (res.status === 404) return "available";
    return "unknown";
  } catch (_) {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

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
    console.error("Requests API: Supabase env vars are not set.");
    return res.status(500).json({ error: "Server is not configured for requests." });
  }

  const supa = adminClient();

  // ---- 1. Authenticate the caller. ----
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "You must be signed in to send a request." });

  let user;
  try {
    const { data, error } = await supa.auth.getUser(token);
    if (error || !data || !data.user) throw new Error("invalid session");
    user = data.user;
  } catch (e) {
    return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
  }
  if (!user.email) {
    return res.status(400).json({ error: "Your account has no email on file, so we can't verify this request." });
  }

  // ---- 2. Parse + validate the body. ----
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const password = typeof body.current_password === "string" ? body.current_password : "";
  const domain = normalizeDomain(body.new_domain);

  if (!password) return res.status(400).json({ error: "Please enter your current password." });
  if (!domain) return res.status(400).json({ error: "Please enter the new domain you'd like." });
  if (!DOMAIN_RE.test(domain)) {
    return res.status(400).json({
      error: "Please enter a valid domain including its extension (for example, yoursite.com).",
    });
  }

  // ---- 3. Re-verify the current password (proves identity). ----
  try {
    const anon = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY || PUBLIC_ANON_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { error: pwErr } = await anon.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (pwErr) {
      return res.status(401).json({ error: "Your current password is incorrect." });
    }
  } catch (e) {
    return res.status(500).json({ error: "We couldn't verify your password right now. Please try again." });
  }

  // ---- 4. Make sure the domain isn't already registered. ----
  const availability = await checkDomainRegistered(domain);
  if (availability === "taken") {
    return res.status(200).json({
      ok: false,
      available: false,
      message: "That domain appears to be already taken. Please choose a different one.",
    });
  }

  // ---- 5. Look up the client's identity + current domain, then insert. ----
  let clientName = null;
  let currentDomain = null;
  try {
    const [{ data: inq }, { data: subs }] = await Promise.all([
      supa
        .from("project_inquiries")
        .select("full_name, business_name, domain")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supa.from("subscriptions").select("domain").eq("user_id", user.id),
    ]);
    const u = (inq && inq[0]) || {};
    clientName = u.full_name || u.business_name || null;
    const subWithDomain = (subs || []).find((s) => s.domain && String(s.domain).trim());
    currentDomain =
      (u.domain && String(u.domain).trim()) ||
      (subWithDomain && String(subWithDomain.domain).trim()) ||
      null;
  } catch (e) {
    // Identity lookup is best-effort; the request is still valuable without it.
  }

  try {
    const { data, error } = await supa
      .from("client_requests")
      .insert({
        user_id: user.id,
        type: "domain_change",
        status: "pending",
        client_name: clientName,
        client_email: user.email,
        current_domain: currentDomain,
        requested_domain: domain,
        availability,
        updated_at: new Date().toISOString(),
      })
      .select("id, requested_domain, status")
      .maybeSingle();
    if (error) throw new Error(error.message);

    return res.status(200).json({ ok: true, available: true, request: data });
  } catch (e) {
    console.error("Requests API insert error:", e && e.message);
    return res.status(500).json({ error: "We couldn't send your request right now. Please try again." });
  }
};
