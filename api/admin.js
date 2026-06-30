// =====================================================================
// Serverless function: WebSharke ADMIN API (single secure entry point).
//
// Runs ONLY on the server (Vercel function). Every request must carry a
// valid Supabase access token in the Authorization header. We verify
// that token with the SERVICE ROLE key and confirm the caller's email is
// the admin email before ANY action runs. Non-admins always get 403.
//
// The browser never sees the service-role key. All reads of cross-user
// admin data and all dangerous writes happen here, so a regular user
// cannot reach admin data by editing frontend code.
//
// Request shape:  POST /api/admin
//   headers: { Authorization: "Bearer <supabase access_token>" }
//   body:    { action: "<name>", payload: { ... } }
//
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   (optional)  ADMIN_EMAIL  — defaults to weeldridge09@gmail.com
// =====================================================================

const { createClient } = require("@supabase/supabase-js");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "weeldridge09@gmail.com")
  .trim()
  .toLowerCase();

// Editable client fields the admin may change on a project_inquiries row.
const USER_EDITABLE_FIELDS = [
  "full_name", "business_name", "email", "cell_phone", "business_address",
  "business_description", "products_services", "website_goals",
  "visitor_actions", "websites_liked", "color_preferences", "design_notes",
  "additional_info", "domain", "status", "terms_agreed",
];

// Editable website fields. NOTE: preview_image is deliberately NOT here — it
// is set only by the dedicated set_website_preview action, so a normal
// website save never clears it.
const WEBSITE_EDITABLE_FIELDS = [
  "user_id", "client_name", "client_email", "domain", "website_type",
  "status", "notes", "purchase_date",
];

// Public Storage bucket holding admin-uploaded website preview screenshots.
const PREVIEW_BUCKET = "website-previews";
// Max decoded image size accepted (the browser resizes to ~1280px wide first,
// so real uploads are well under this — it's a safety cap, not the norm).
const MAX_PREVIEW_BYTES = 3 * 1024 * 1024;

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Best-effort audit log write. Never throws — logging must not break an action.
async function logActivity(supa, entry) {
  try {
    await supa.from("admin_activity_log").insert(entry);
  } catch (e) {
    console.error("activity log write failed:", e && e.message);
  }
}

// Build a name/email lookup keyed by user_id from a set of inquiry rows.
function indexBy(rows, key) {
  const map = {};
  (rows || []).forEach((r) => {
    if (r && r[key] != null) map[r[key]] = r;
  });
  return map;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Admin API: Supabase env vars are not set.");
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

  // ---- 3. Parse the request body. ----
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const action = body.action;
  const p = body.payload || {};

  try {
    switch (action) {
      case "overview":          return res.status(200).json(await getOverview(supa));
      case "list_users":        return res.status(200).json(await listUsers(supa, p));
      case "list_onboarding":   return res.status(200).json(await listOnboarding(supa, p));
      case "list_payments":     return res.status(200).json(await listPayments(supa, p));
      case "list_websites":     return res.status(200).json(await listWebsites(supa, p));
      case "list_domains":      return res.status(200).json(await listDomains(supa, p));
      case "list_alerts":       return res.status(200).json(await listAlerts(supa, p));
      case "list_activity":     return res.status(200).json(await listActivity(supa, p));
      case "search":            return res.status(200).json(await globalSearch(supa, p));
      case "get_user":          return res.status(200).json(await getUser(supa, p));
      case "get_platform_status":   return res.status(200).json(await getPlatformStatus(supa));
      case "set_platform_disabled": return res.status(200).json(await setPlatformDisabled(supa, caller, p));

      case "update_user":       return res.status(200).json(await updateUser(supa, caller, p));
      case "set_user_status":   return res.status(200).json(await setUserStatus(supa, caller, p));
      case "delete_user":       return res.status(200).json(await deleteUser(supa, caller, p));
      case "update_onboarding": return res.status(200).json(await updateUser(supa, caller, p));

      case "create_website":    return res.status(200).json(await createWebsite(supa, caller, p));
      case "update_website":    return res.status(200).json(await updateWebsite(supa, caller, p));
      case "set_website_preview":return res.status(200).json(await setWebsitePreview(supa, caller, p));

      case "assign_domain":     return res.status(200).json(await assignDomain(supa, caller, p));

      case "set_payment_status":return res.status(200).json(await setPaymentStatus(supa, caller, p));
      case "update_plan":       return res.status(200).json(await updatePlan(supa, caller, p));
      case "cancel_subscription":return res.status(200).json(await cancelSubscription(supa, caller, p));

      default:
        return res.status(400).json({ error: "Unknown admin action: " + action });
    }
  } catch (err) {
    console.error("Admin action error [" + action + "]:", err && err.message);
    // Surface the real (but safe) message so the UI can show useful detail.
    return res.status(500).json({ error: err && err.message ? err.message : "Admin action failed." });
  }
};

// =====================================================================
// READ actions
// =====================================================================

async function countRows(supa, table, build) {
  let q = supa.from(table).select("*", { count: "exact", head: true });
  if (build) q = build(q);
  const { count, error } = await q;
  if (error) return 0;
  return count || 0;
}

async function getOverview(supa) {
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString();

  // Pull the data sets we need once, then compute everything in JS so we
  // stay resilient to whichever optional columns exist.
  const [{ data: inquiries }, { data: subs }, { data: sites }, { data: recent }] =
    await Promise.all([
      supa.from("project_inquiries").select("*"),
      supa.from("subscriptions").select("*"),
      supa.from("websites").select("*"),
      supa.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(8),
    ]);

  const inq = inquiries || [];
  const subList = subs || [];
  const siteList = sites || [];

  const subStatus = (s) => String(s.status || "").toLowerCase();
  const newUsersWeek = inq.filter((r) => r.created_at && r.created_at >= weekAgo).length;
  const newUsersMonth = inq.filter((r) => r.created_at && r.created_at >= monthAgo).length;

  // Subscription / payment breakdowns.
  const planCounts = {};
  const payStatusCounts = { active: 0, unpaid: 0, past_due: 0, canceled: 0, other: 0 };
  subList.forEach((s) => {
    const plan = s.plan_name || s.website_type || "Unknown";
    planCounts[plan] = (planCounts[plan] || 0) + 1;
    const st = subStatus(s);
    if (st in payStatusCounts) payStatusCounts[st]++;
    else if (st === "trialing" || st === "active") payStatusCounts.active++;
    else payStatusCounts.other++;
  });

  // Website breakdowns.
  const siteTypeCounts = { frontend: 0, full_stack: 0 };
  const siteStatusCounts = {};
  siteList.forEach((w) => {
    if (w.website_type && siteTypeCounts[w.website_type] !== undefined) siteTypeCounts[w.website_type]++;
    const st = w.status || "not_started";
    siteStatusCounts[st] = (siteStatusCounts[st] || 0) + 1;
  });

  // Site purchases over time (last 6 months, by purchase/created date).
  const byMonth = {};
  siteList.forEach((w) => {
    const d = w.purchase_date || w.created_at;
    if (!d) return;
    const key = String(d).slice(0, 7); // YYYY-MM
    byMonth[key] = (byMonth[key] || 0) + 1;
  });

  const missingDomains = inq.filter((r) => !r.domain || String(r.domain).trim() === "").length;

  // -------------------------------------------------------------------
  // Overview lists (built from the data already fetched above — no extra
  // queries). These power the redesigned Overview: New Onboarding,
  // Current Projects, and Websites This Month.
  // -------------------------------------------------------------------
  const inqByUser = indexBy(inq, "user_id");
  const byDateDesc = (a, b) =>
    String(b).localeCompare(String(a));

  // New onboarding — most recent project intake submissions.
  const recentOnboarding = inq
    .slice()
    .sort((a, b) => byDateDesc(a.created_at || "", b.created_at || ""))
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      user_id: r.user_id,
      full_name: r.full_name || null,
      business_name: r.business_name || null,
      email: r.email || null,
      status: r.status || "new",
      created_at: r.created_at || null,
    }));

  // Current projects — website build records, newest purchase first.
  // Owner + business name are joined from the matching inquiry by user_id.
  const projects = siteList
    .slice()
    .sort((a, b) =>
      byDateDesc(a.purchase_date || a.created_at || "", b.purchase_date || b.created_at || ""))
    .slice(0, 8)
    .map((w) => {
      const u = inqByUser[w.user_id] || {};
      return {
        id: w.id,
        user_id: w.user_id,
        owner_name: w.client_name || u.full_name || u.business_name || u.email || null,
        business_name: u.business_name || w.client_name || null,
        purchase_date: w.purchase_date || w.created_at || null,
        status: w.status || "not_started",
        domain: w.domain || u.domain || null,
        website_type: w.website_type || null,
        client_name: w.client_name || null,
        client_email: w.client_email || null,
        notes: w.notes || null,
      };
    });

  // Websites this month — actual site records created/purchased in the
  // current calendar month (UTC), newest first. A real activity list, not
  // a count.
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const websitesThisMonth = siteList
    .filter((w) => {
      const d = w.purchase_date || w.created_at;
      return d && String(d).slice(0, 7) === monthKey;
    })
    .sort((a, b) =>
      byDateDesc(a.purchase_date || a.created_at || "", b.purchase_date || b.created_at || ""))
    .map((w) => {
      const u = inqByUser[w.user_id] || {};
      return {
        id: w.id,
        user_id: w.user_id,
        domain: w.domain || u.domain || null,
        owner_name: w.client_name || u.full_name || u.business_name || u.email || null,
        business_name: u.business_name || w.client_name || null,
        created_at: w.purchase_date || w.created_at || null,
        purchase_date: w.purchase_date || null,
        status: w.status || "not_started",
        website_type: w.website_type || null,
        client_name: w.client_name || null,
        client_email: w.client_email || null,
        notes: w.notes || null,
      };
    });

  return {
    cards: {
      totalUsers: inq.length,
      newUsersWeek,
      newUsersMonth,
      activeSubscriptions: payStatusCounts.active,
      unpaidClients: payStatusCounts.unpaid,
      pastDueClients: payStatusCounts.past_due,
      canceledSubscriptions: payStatusCounts.canceled,
      totalWebsites: siteList.length,
      websitesInProgress: siteStatusCounts.in_progress || 0,
      websitesWaitingClient: siteStatusCounts.waiting_on_client || 0,
      liveWebsites: siteStatusCounts.live || 0,
      missingDomains,
      newOnboarding: newUsersWeek,
      suspended: inq.filter((r) => r.account_status === "suspended").length,
      banned: inq.filter((r) => r.account_status === "banned").length,
    },
    charts: {
      planCounts,
      payStatusCounts,
      siteTypeCounts,
      siteStatusCounts,
      sitesByMonth: byMonth,
    },
    recentActivity: recent || [],
    recentOnboarding,
    projects,
    websitesThisMonth,
  };
}

// Generic helper: apply search + sort + range to a query builder.
function applyListOpts(q, { search, searchCols, sortBy, sortDir, limit, offset }) {
  if (search && searchCols && searchCols.length) {
    const or = searchCols.map((c) => `${c}.ilike.%${search.replace(/[%,]/g, "")}%`).join(",");
    q = q.or(or);
  }
  if (sortBy) q = q.order(sortBy, { ascending: (sortDir || "desc") !== "desc", nullsFirst: false });
  else q = q.order("created_at", { ascending: false });
  const lim = Math.min(Number(limit) || 50, 100000);
  const off = Number(offset) || 0;
  q = q.range(off, off + lim - 1);
  return q;
}

// Attach subscription + website + domain info to a set of inquiry rows.
async function enrichUsers(supa, rows) {
  const ids = rows.map((r) => r.user_id).filter(Boolean);
  if (!ids.length) return rows.map((r) => ({ ...r, subscription: null, website: null }));

  const [{ data: subs }, { data: sites }] = await Promise.all([
    supa.from("subscriptions").select("*").in("user_id", ids),
    supa.from("websites").select("*").in("user_id", ids),
  ]);
  const subMap = indexBy(subs, "user_id");
  const siteMap = indexBy(sites, "user_id");

  return rows.map((r) => {
    const sub = subMap[r.user_id] || null;
    const site = siteMap[r.user_id] || null;
    return {
      ...r,
      subscription: sub,
      website: site,
      domain: r.domain || (site && site.domain) || (sub && sub.domain) || null,
      payment_status: sub ? String(sub.status || "").toLowerCase() : null,
      plan_name: sub ? (sub.plan_name || sub.website_type || null) : null,
      website_type: site ? site.website_type : (sub ? sub.website_type : null),
      website_status: site ? site.status : null,
    };
  });
}

async function listUsers(supa, p) {
  const f = p.filters || {};
  let q = supa.from("project_inquiries").select("*");

  if (f.account_status) q = q.eq("account_status", f.account_status);
  if (f.website_type === "__none__") q = q.is("domain", null);

  q = applyListOpts(q, {
    search: p.search,
    searchCols: ["full_name", "business_name", "email", "cell_phone", "domain"],
    sortBy: p.sortBy, sortDir: p.sortDir, limit: p.limit, offset: p.offset,
  });

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let rows = await enrichUsers(supa, data || []);

  // Post-filters that depend on enriched (joined) data.
  if (f.payment_status) rows = rows.filter((r) => r.payment_status === f.payment_status);
  if (f.plan) rows = rows.filter((r) => (r.plan_name || "") === f.plan);
  if (f.website_type && f.website_type !== "__none__") rows = rows.filter((r) => r.website_type === f.website_type);
  if (f.domain === "assigned") rows = rows.filter((r) => !!r.domain);
  if (f.domain === "missing") rows = rows.filter((r) => !r.domain);

  return { rows, hasMore: (data || []).length === (Number(p.limit) || 50) };
}

async function listOnboarding(supa, p) {
  const f = p.filters || {};
  let q = supa.from("project_inquiries").select("*");
  if (f.website_type) q = q.eq("website_type", f.website_type);
  if (f.status) q = q.eq("status", f.status);
  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", f.to);

  q = applyListOpts(q, {
    search: p.search,
    searchCols: ["full_name", "business_name", "email", "business_description", "website_goals"],
    sortBy: p.sortBy, sortDir: p.sortDir, limit: p.limit, offset: p.offset,
  });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: data || [], hasMore: (data || []).length === (Number(p.limit) || 50) };
}

async function listPayments(supa, p) {
  const f = p.filters || {};
  let q = supa.from("subscriptions").select("*");
  if (f.status) q = q.eq("status", f.status);
  if (f.plan) q = q.eq("plan_name", f.plan);
  if (f.billing) q = q.eq("plan_interval", f.billing);
  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", f.to);

  q = applyListOpts(q, {
    search: null, searchCols: [],
    sortBy: p.sortBy, sortDir: p.sortDir, limit: p.limit, offset: p.offset,
  });
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  // Attach client name/email + linked website/domain by user_id.
  const ids = (data || []).map((r) => r.user_id).filter(Boolean);
  let inqMap = {}, siteMap = {};
  if (ids.length) {
    const [{ data: inq }, { data: sites }] = await Promise.all([
      supa.from("project_inquiries").select("user_id, full_name, business_name, email, domain").in("user_id", ids),
      supa.from("websites").select("user_id, domain, website_type, status").in("user_id", ids),
    ]);
    inqMap = indexBy(inq, "user_id");
    siteMap = indexBy(sites, "user_id");
  }

  let rows = (data || []).map((s) => {
    const u = inqMap[s.user_id] || {};
    const site = siteMap[s.user_id] || {};
    return {
      ...s,
      user_name: u.full_name || u.email || "—",      // the person (Payments "Name")
      business_name: u.business_name || "—",          // the client/business (Payments "Client")
      client_name: u.full_name || u.business_name || "—",
      client_email: u.email || "—",
      linked_domain: s.domain || u.domain || site.domain || null,
      linked_website: site.website_type || s.website_type || null,
    };
  });

  // Free-text search across the joined client fields.
  if (p.search) {
    const s = p.search.toLowerCase();
    rows = rows.filter((r) =>
      [r.user_name, r.business_name, r.client_name, r.client_email, r.plan_name, r.linked_domain]
        .some((v) => v && String(v).toLowerCase().includes(s)));
  }
  return { rows, hasMore: (data || []).length === (Number(p.limit) || 50) };
}

async function listWebsites(supa, p) {
  const f = p.filters || {};
  let q = supa.from("websites").select("*");
  if (f.website_type) q = q.eq("website_type", f.website_type);
  if (f.status) q = q.eq("status", f.status);
  if (f.domain === "missing") q = q.is("domain", null);
  if (f.from) q = q.gte("purchase_date", f.from);
  if (f.to) q = q.lte("purchase_date", f.to);

  q = applyListOpts(q, {
    search: p.search,
    searchCols: ["client_name", "client_email", "domain", "notes"],
    sortBy: p.sortBy || "purchase_date", sortDir: p.sortDir, limit: p.limit, offset: p.offset,
  });
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  let rows = data || [];
  if (f.domain === "assigned") rows = rows.filter((r) => !!r.domain);
  return { rows, hasMore: (data || []).length === (Number(p.limit) || 50) };
}

async function listDomains(supa, p) {
  const f = p.filters || {};
  // Domains are stored on project_inquiries and websites; aggregate them.
  const [{ data: inq }, { data: sites }, { data: subs }] = await Promise.all([
    supa.from("project_inquiries").select("user_id, full_name, business_name, email, domain"),
    supa.from("websites").select("user_id, domain, website_type, status"),
    supa.from("subscriptions").select("user_id, status, domain"),
  ]);
  const siteMap = indexBy(sites, "user_id");
  const subMap = indexBy(subs, "user_id");

  let rows = (inq || []).map((u) => {
    const site = siteMap[u.user_id] || {};
    const sub = subMap[u.user_id] || {};
    const domain = u.domain || site.domain || sub.domain || null;
    return {
      user_id: u.user_id,
      domain,
      assigned_user: u.full_name || u.business_name || u.email || "—",
      client_email: u.email || "—",
      linked_website: site.website_type || null,
      website_type: site.website_type || null,
      website_status: site.status || null,
      payment_status: sub.status ? String(sub.status).toLowerCase() : null,
      assigned: !!domain,
    };
  });

  if (f.assigned === "assigned") rows = rows.filter((r) => r.assigned);
  if (f.assigned === "unassigned") rows = rows.filter((r) => !r.assigned);
  if (f.website_type) rows = rows.filter((r) => r.website_type === f.website_type);
  if (f.status) rows = rows.filter((r) => r.website_status === f.status);
  if (p.search) {
    const s = p.search.toLowerCase();
    rows = rows.filter((r) =>
      [r.domain, r.assigned_user, r.client_email].some((v) => v && String(v).toLowerCase().includes(s)));
  }
  rows.sort((a, b) => String(b.domain || "").localeCompare(String(a.domain || "")));
  return { rows, hasMore: false };
}

async function listAlerts(supa, p) {
  const [{ data: inq }, { data: subs }, { data: sites }] = await Promise.all([
    supa.from("project_inquiries").select("*"),
    supa.from("subscriptions").select("*"),
    supa.from("websites").select("*"),
  ]);
  const subMap = indexBy(subs, "user_id");
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const alerts = [];

  (subs || []).forEach((s) => {
    const st = String(s.status || "").toLowerCase();
    if (st === "unpaid" || st === "past_due") {
      const u = (inq || []).find((r) => r.user_id === s.user_id) || {};
      alerts.push({
        type: "unpaid", severity: "high",
        title: (st === "unpaid" ? "Unpaid client" : "Past due payment"),
        detail: (u.full_name || u.business_name || u.email || s.user_id),
        user_id: s.user_id, created_at: s.created_at,
      });
    }
  });

  (inq || []).forEach((r) => {
    if (!r.domain || String(r.domain).trim() === "") {
      alerts.push({ type: "missing_domain", severity: "medium", title: "Missing domain",
        detail: r.full_name || r.business_name || r.email, user_id: r.user_id, created_at: r.created_at });
    }
    if (r.account_status === "suspended")
      alerts.push({ type: "suspended", severity: "medium", title: "Suspended user",
        detail: r.full_name || r.business_name || r.email, user_id: r.user_id, created_at: r.created_at });
    if (r.account_status === "banned")
      alerts.push({ type: "banned", severity: "high", title: "Banned user",
        detail: r.full_name || r.business_name || r.email, user_id: r.user_id, created_at: r.created_at });
    if (r.created_at && r.created_at >= weekAgo)
      alerts.push({ type: "new_onboarding", severity: "low", title: "New onboarding submission",
        detail: r.full_name || r.business_name || r.email, user_id: r.user_id, created_at: r.created_at });
  });

  (sites || []).forEach((w) => {
    if (w.status === "waiting_on_client")
      alerts.push({ type: "waiting_on_client", severity: "medium", title: "Website waiting on client",
        detail: w.client_name || w.client_email || w.domain || w.user_id, user_id: w.user_id, created_at: w.created_at });
  });

  let rows = alerts;
  if (p.search) {
    const s = p.search.toLowerCase();
    rows = rows.filter((a) => [a.title, a.detail, a.type].some((v) => v && String(v).toLowerCase().includes(s)));
  }
  const order = { high: 0, medium: 1, low: 2 };
  rows.sort((a, b) => (order[a.severity] - order[b.severity]) ||
    String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return { rows, hasMore: false };
}

async function listActivity(supa, p) {
  const f = p.filters || {};
  let q = supa.from("admin_activity_log").select("*");
  if (f.action) q = q.eq("action", f.action);
  if (f.entity_type) q = q.eq("entity_type", f.entity_type);
  q = applyListOpts(q, {
    search: p.search,
    searchCols: ["admin_email", "action", "entity_type", "changed_field", "affected_user_id"],
    sortBy: p.sortBy || "created_at", sortDir: p.sortDir, limit: p.limit, offset: p.offset,
  });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: data || [], hasMore: (data || []).length === (Number(p.limit) || 50) };
}

async function globalSearch(supa, p) {
  const term = (p.search || "").trim();
  if (!term) return { results: [] };
  const like = "%" + term.replace(/[%,]/g, "") + "%";
  const results = [];

  const [{ data: users }, { data: sites }, { data: subs }] = await Promise.all([
    supa.from("project_inquiries").select("id, user_id, full_name, business_name, email, domain, business_description")
      .or(`full_name.ilike.${like},business_name.ilike.${like},email.ilike.${like},domain.ilike.${like},business_description.ilike.${like}`)
      .limit(8),
    supa.from("websites").select("id, user_id, domain, website_type, status, client_name, client_email")
      .or(`domain.ilike.${like},client_name.ilike.${like},client_email.ilike.${like}`)
      .limit(6),
    supa.from("subscriptions").select("id, user_id, plan_name, status, domain")
      .or(`plan_name.ilike.${like},domain.ilike.${like}`)
      .limit(6),
  ]);

  (users || []).forEach((u) => results.push({
    category: "User", user_id: u.user_id, id: u.id,
    label: u.full_name || u.business_name || u.email,
    sub: u.email,
  }));
  (users || []).filter((u) => u.domain && u.domain.toLowerCase().includes(term.toLowerCase())).forEach((u) => results.push({
    category: "Domain", user_id: u.user_id, id: u.id, label: u.domain, sub: u.full_name || u.email,
  }));
  (sites || []).forEach((w) => results.push({
    category: "Website", user_id: w.user_id, id: w.id,
    label: (w.website_type === "full_stack" ? "Full-Stack" : "Frontend") + (w.domain ? " — " + w.domain : ""),
    sub: w.client_name || w.client_email || w.status,
  }));
  (subs || []).forEach((s) => results.push({
    category: "Payment", user_id: s.user_id, id: s.id,
    label: s.plan_name || "Subscription", sub: (s.status || "") + (s.domain ? " · " + s.domain : ""),
  }));

  return { results: results.slice(0, 20) };
}

async function getUser(supa, p) {
  const userId = p.user_id;
  const id = p.id;
  let inquiry = null;
  if (userId) {
    const { data } = await supa.from("project_inquiries").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    inquiry = data || null;
  }
  if (!inquiry && id) {
    const { data } = await supa.from("project_inquiries").select("*").eq("id", id).maybeSingle();
    inquiry = data || null;
  }
  if (!inquiry) throw new Error("Record not found.");

  const uid = inquiry.user_id;
  const [{ data: sub }, { data: site }, { data: activity }] = await Promise.all([
    uid ? supa.from("subscriptions").select("*").eq("user_id", uid).limit(1).maybeSingle() : { data: null },
    uid ? supa.from("websites").select("*").eq("user_id", uid).limit(1).maybeSingle() : { data: null },
    uid ? supa.from("admin_activity_log").select("*").eq("affected_user_id", uid)
      .order("created_at", { ascending: false }).limit(15) : { data: [] },
  ]);

  return {
    inquiry,
    subscription: sub || null,
    website: site || null,
    domain: inquiry.domain || (site && site.domain) || (sub && sub.domain) || null,
    activity: activity || [],
  };
}

// ---------------------------------------------------------------------
// Platform kill switch — read the global maintenance flag. Fails soft:
// if the platform_settings table doesn't exist yet, report "enabled" so
// nothing is accidentally treated as disabled.
// ---------------------------------------------------------------------
async function getPlatformStatus(supa) {
  const { data, error } = await supa
    .from("platform_settings")
    .select("disabled, disabled_at, disabled_by")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    return { disabled: false, configured: false, message: error.message };
  }
  return {
    disabled: !!(data && data.disabled),
    disabled_at: data ? data.disabled_at : null,
    disabled_by: data ? data.disabled_by : null,
    configured: true,
  };
}

// Flip the global maintenance flag. Reversible; deletes nothing. Only the
// already-verified admin caller can reach this (see the auth gate above).
async function setPlatformDisabled(supa, caller, p) {
  const disabled = !!p.disabled;
  const now = new Date().toISOString();
  const row = {
    id: 1,
    disabled,
    disabled_at: disabled ? now : null,
    disabled_by: disabled ? caller.email : null,
    updated_at: now,
  };
  const { data, error } = await supa
    .from("platform_settings")
    .upsert(row, { onConflict: "id" })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email,
    action: disabled ? "platform_disabled" : "platform_enabled",
    entity_type: "platform", entity_id: "1", affected_user_id: null,
    changed_field: "disabled", old_value: String(!disabled), new_value: String(disabled),
  });
  return { row: data, disabled };
}

// =====================================================================
// WRITE actions (each logs to admin_activity_log)
// =====================================================================

function pick(obj, allowed) {
  const out = {};
  allowed.forEach((k) => { if (obj[k] !== undefined) out[k] = obj[k]; });
  return out;
}

async function updateUser(supa, caller, p) {
  if (!p.id) throw new Error("A record id is required.");
  const updates = pick(p.updates || {}, USER_EDITABLE_FIELDS);
  if (!Object.keys(updates).length) throw new Error("No editable fields were provided.");

  // Read the existing row so we can record old → new values.
  const { data: before, error: readErr } = await supa.from("project_inquiries")
    .select("*").eq("id", p.id).maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!before) throw new Error("Record not found.");

  const { data, error } = await supa.from("project_inquiries")
    .update(updates).eq("id", p.id).select().maybeSingle();
  if (error) throw new Error(error.message);

  // Log one entry per changed field.
  for (const field of Object.keys(updates)) {
    if (String(before[field]) !== String(updates[field])) {
      await logActivity(supa, {
        admin_email: caller.email, action: "user_edited", entity_type: "user",
        entity_id: String(p.id), affected_user_id: before.user_id,
        changed_field: field, old_value: String(before[field] ?? ""), new_value: String(updates[field] ?? ""),
      });
    }
  }
  return { row: data };
}

async function setUserStatus(supa, caller, p) {
  const allowed = ["active", "suspended", "banned"];
  if (!p.id || !allowed.includes(p.status)) throw new Error("A valid id and status are required.");

  const { data: before } = await supa.from("project_inquiries").select("*").eq("id", p.id).maybeSingle();
  if (!before) throw new Error("Record not found.");

  const { data, error } = await supa.from("project_inquiries")
    .update({ account_status: p.status }).eq("id", p.id).select().maybeSingle();
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email,
    action: p.status === "banned" ? "user_banned" : p.status === "suspended" ? "user_suspended" : "user_reactivated",
    entity_type: "user", entity_id: String(p.id), affected_user_id: before.user_id,
    changed_field: "account_status", old_value: before.account_status || "active", new_value: p.status,
  });
  return { row: data };
}

async function deleteUser(supa, caller, p) {
  if (!p.id) throw new Error("A record id is required.");
  const { data: before } = await supa.from("project_inquiries").select("*").eq("id", p.id).maybeSingle();
  if (!before) throw new Error("Record not found.");

  const { error } = await supa.from("project_inquiries").delete().eq("id", p.id);
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email, action: "user_deleted", entity_type: "user",
    entity_id: String(p.id), affected_user_id: before.user_id,
    changed_field: null, old_value: before.email || before.full_name || "", new_value: null,
  });
  return { deleted: true };
}

async function createWebsite(supa, caller, p) {
  const insert = pick(p.values || {}, WEBSITE_EDITABLE_FIELDS);
  if (!insert.website_type) insert.website_type = "frontend";
  if (!insert.status) insert.status = "not_started";
  insert.updated_at = new Date().toISOString();

  const { data, error } = await supa.from("websites").insert(insert).select().maybeSingle();
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email, action: "website_created", entity_type: "website",
    entity_id: data ? String(data.id) : null, affected_user_id: insert.user_id || null,
    changed_field: null, old_value: null, new_value: insert.website_type + " / " + insert.status,
  });
  return { row: data };
}

async function updateWebsite(supa, caller, p) {
  if (!p.id) throw new Error("A website id is required.");
  const updates = pick(p.updates || {}, WEBSITE_EDITABLE_FIELDS);
  if (!Object.keys(updates).length) throw new Error("No editable fields were provided.");
  updates.updated_at = new Date().toISOString();

  const { data: before } = await supa.from("websites").select("*").eq("id", p.id).maybeSingle();
  if (!before) throw new Error("Website not found.");

  const { data, error } = await supa.from("websites").update(updates).eq("id", p.id).select().maybeSingle();
  if (error) throw new Error(error.message);

  const statusChanged = updates.status && updates.status !== before.status;
  for (const field of Object.keys(updates)) {
    if (field === "updated_at") continue;
    if (String(before[field]) !== String(updates[field])) {
      await logActivity(supa, {
        admin_email: caller.email,
        action: statusChanged && field === "status" ? "website_status_changed" : "website_updated",
        entity_type: "website", entity_id: String(p.id), affected_user_id: before.user_id,
        changed_field: field, old_value: String(before[field] ?? ""), new_value: String(updates[field] ?? ""),
      });
    }
  }
  return { row: data };
}

// Upload (or remove) the admin-chosen preview screenshot for a website.
// Writes the public image URL to the websites row (admin record) AND to the
// client's subscriptions row(s) by user_id (the Domain tab's source of truth),
// mirroring assignDomain. The browser sends a base64 JPEG it already resized.
async function setWebsitePreview(supa, caller, p) {
  if (!p.id) throw new Error("A website id is required.");
  const { data: site } = await supa.from("websites").select("*").eq("id", p.id).maybeSingle();
  if (!site) throw new Error("Website not found.");
  const userId = p.user_id || site.user_id || null;

  // --- Remove an existing preview. ---
  if (p.remove) {
    await supa.from("websites").update({ preview_image: null, updated_at: new Date().toISOString() }).eq("id", p.id);
    if (userId) await supa.from("subscriptions").update({ preview_image: null }).eq("user_id", userId);
    await logActivity(supa, {
      admin_email: caller.email, action: "website_preview_removed", entity_type: "website",
      entity_id: String(p.id), affected_user_id: userId,
      changed_field: "preview_image", old_value: site.preview_image || "", new_value: null,
    });
    return { url: null, removed: true, propagated: !!userId };
  }

  // --- Upload a new preview. ---
  if (!p.dataBase64) throw new Error("No image data was provided.");
  const ct = String(p.contentType || "image/jpeg").toLowerCase();
  if (!/^image\/(jpeg|png|webp)$/.test(ct)) throw new Error("Preview must be a JPEG, PNG, or WebP image.");
  const buf = Buffer.from(p.dataBase64, "base64");
  if (!buf.length) throw new Error("The image data was empty.");
  if (buf.length > MAX_PREVIEW_BYTES) throw new Error("Image is too large (max 3 MB).");

  const ext = ct === "image/png" ? "png" : ct === "image/webp" ? "webp" : "jpg";
  const path = (userId || "site") + "/" + p.id + "-" + Date.now() + "." + ext;
  const { error: upErr } = await supa.storage.from(PREVIEW_BUCKET)
    .upload(path, buf, { contentType: ct, upsert: true });
  if (upErr) throw new Error("Upload failed: " + upErr.message + " — is the 'website-previews' Storage bucket created? (run db/website-previews-schema.sql)");

  const { data: pub } = supa.storage.from(PREVIEW_BUCKET).getPublicUrl(path);
  const url = pub && pub.publicUrl;
  if (!url) throw new Error("Could not resolve the uploaded image URL.");

  await supa.from("websites").update({ preview_image: url, updated_at: new Date().toISOString() }).eq("id", p.id);

  // Propagate to the client's subscription row(s) so the Domain tab shows it.
  let propagated = false;
  if (userId) {
    const { data: rows, error: subErr } = await supa.from("subscriptions")
      .update({ preview_image: url }).eq("user_id", userId).select("id");
    if (subErr) throw new Error(subErr.message);
    propagated = !!(rows && rows.length);
  }

  await logActivity(supa, {
    admin_email: caller.email, action: "website_preview_uploaded", entity_type: "website",
    entity_id: String(p.id), affected_user_id: userId,
    changed_field: "preview_image", old_value: site.preview_image || "", new_value: url,
  });

  return { url, propagated, hasUser: !!userId };
}

async function assignDomain(supa, caller, p) {
  if (!p.domain) throw new Error("A domain is required.");
  if (!p.user_id && !p.inquiry_id) throw new Error("A target user is required.");

  // Resolve the target auth user id. Prefer the explicit user_id; otherwise
  // pull it off the inquiry row so the subscriptions write (the client
  // dashboard's source of truth) can be keyed on the auth user id.
  let beforeDomain = null;
  let targetUserId = p.user_id || null;
  if (p.inquiry_id) {
    const { data: before } = await supa.from("project_inquiries").select("domain, user_id").eq("id", p.inquiry_id).maybeSingle();
    beforeDomain = before && before.domain;
    if (!targetUserId) targetUserId = (before && before.user_id) || null;
    const { error } = await supa.from("project_inquiries").update({ domain: p.domain }).eq("id", p.inquiry_id);
    if (error) throw new Error(error.message);
  } else if (targetUserId) {
    const { error } = await supa.from("project_inquiries").update({ domain: p.domain }).eq("user_id", targetUserId);
    if (error) throw new Error(error.message);
  }
  if (targetUserId) {
    await supa.from("websites").update({ domain: p.domain, updated_at: new Date().toISOString() }).eq("user_id", targetUserId);
  }

  // --- Source of truth: subscriptions.domain, keyed on the auth user id. ----
  // The client dashboard reads the domain from this table, so the assignment
  // MUST land here. Update the user's existing subscription row(s); if they
  // have none yet (e.g. a project-only client who never subscribed), create a
  // minimal placeholder so the domain has a home. status:'inactive' keeps the
  // dashboard from treating this as active hosting. Never a silent no-op.
  let subscriptionUpdated = false;
  let subscriptionCreated = false;
  if (targetUserId) {
    const { data: updatedRows, error: updErr } = await supa
      .from("subscriptions")
      .update({ domain: p.domain })
      .eq("user_id", targetUserId)
      .select("id");
    if (updErr) throw new Error(updErr.message);
    console.log("[admin] assign_domain → subscriptions update", { user_id: targetUserId, domain: p.domain, updated: updatedRows ? updatedRows.length : 0 }); // TEMP debug
    if (updatedRows && updatedRows.length) {
      subscriptionUpdated = true;
    } else {
      const { data: created, error: insErr } = await supa
        .from("subscriptions")
        .insert({ user_id: targetUserId, domain: p.domain, status: "inactive" })
        .select("id");
      if (insErr) throw new Error(insErr.message);
      subscriptionCreated = !!(created && created.length);
      console.log("[admin] assign_domain → subscriptions insert", { user_id: targetUserId, domain: p.domain, created: subscriptionCreated }); // TEMP debug
    }
  } else {
    // No auth user is linked to this inquiry yet, so the domain can't be stored
    // in subscriptions (the client dashboard's source of truth). Tell the admin
    // rather than silently leaving it off the client's account.
    console.warn("[admin] assign_domain: inquiry has no linked auth user; saved to inquiry only", { inquiry_id: p.inquiry_id }); // TEMP debug
  }

  await logActivity(supa, {
    admin_email: caller.email, action: "domain_assigned", entity_type: "domain",
    entity_id: p.inquiry_id ? String(p.inquiry_id) : null, affected_user_id: targetUserId || null,
    changed_field: "domain", old_value: beforeDomain || "", new_value: p.domain,
  });

  return {
    domain: p.domain,
    user_id: targetUserId || null,
    hasAccount: !!targetUserId,
    subscriptionUpdated,
    subscriptionCreated,
    message: targetUserId
      ? (subscriptionCreated
          ? "Domain saved. A billing row was created to hold it (this client had none yet)."
          : "Domain saved to the client's account.")
      : "Domain saved to the inquiry, but this client has no linked account yet — it won't appear on a client dashboard until they finish signing up.",
  };
}

// Resolve which subscription row to act on (by id, else by user_id).
async function findSub(supa, p) {
  if (p.id) {
    const { data } = await supa.from("subscriptions").select("*").eq("id", p.id).maybeSingle();
    if (data) return data;
  }
  if (p.user_id) {
    const { data } = await supa.from("subscriptions").select("*").eq("user_id", p.user_id).limit(1).maybeSingle();
    if (data) return data;
  }
  throw new Error("No subscription found for this client.");
}

async function setPaymentStatus(supa, caller, p) {
  const allowed = ["active", "unpaid", "past_due", "canceled"];
  if (!allowed.includes(p.status)) throw new Error("A valid payment status is required.");
  const sub = await findSub(supa, p);

  const updates = { status: p.status };
  if (p.status === "active") updates.last_payment_date = new Date().toISOString();
  const { data, error } = await supa.from("subscriptions").update(updates).eq("id", sub.id).select().maybeSingle();
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email,
    action: p.status === "unpaid" ? "payment_marked_unpaid" : p.status === "active" ? "payment_marked_active" : "payment_status_changed",
    entity_type: "payment", entity_id: String(sub.id), affected_user_id: sub.user_id,
    changed_field: "status", old_value: sub.status || "", new_value: p.status,
  });
  return { row: data };
}

async function updatePlan(supa, caller, p) {
  const sub = await findSub(supa, p);
  const updates = pick(p.updates || {}, ["plan_name", "plan_interval", "amount", "website_type", "current_period_end"]);
  if (!Object.keys(updates).length) throw new Error("No plan fields were provided.");
  const { data, error } = await supa.from("subscriptions").update(updates).eq("id", sub.id).select().maybeSingle();
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email, action: "plan_edited", entity_type: "payment",
    entity_id: String(sub.id), affected_user_id: sub.user_id,
    changed_field: Object.keys(updates).join(","), old_value: sub.plan_name || "", new_value: updates.plan_name || JSON.stringify(updates),
  });
  return { row: data };
}

async function cancelSubscription(supa, caller, p) {
  const sub = await findSub(supa, p);
  const { data, error } = await supa.from("subscriptions").update({ status: "canceled" }).eq("id", sub.id).select().maybeSingle();
  if (error) throw new Error(error.message);

  await logActivity(supa, {
    admin_email: caller.email, action: "subscription_canceled", entity_type: "payment",
    entity_id: String(sub.id), affected_user_id: sub.user_id,
    changed_field: "status", old_value: sub.status || "", new_value: "canceled",
  });
  return { row: data };
}
