// =====================================================================
// Shared CORS helper for the WebSharke serverless API.
//
// Files prefixed with "_" are NOT exposed as routes by Vercel, so this is
// a private module the real endpoints import.
//
// In production the site and the API are served from the same origin, so
// the browser never actually performs a CORS check for normal dashboard /
// checkout calls. We still send an allow-list (instead of the old "*") so
// the API can't be invoked from arbitrary third-party origins.
//
// Override the allow-list per environment with ALLOWED_ORIGINS
// (comma-separated), e.g. "https://websharke.com,https://staging.websharke.com".
// =====================================================================

const DEFAULT_ORIGINS = ["https://websharke.com", "https://www.websharke.com"];

function allowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ORIGINS;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// Apply CORS + common headers. Returns true if the request was a CORS
// preflight that has already been answered (caller should stop).
function applyCors(req, res, { methods = "POST, OPTIONS" } = {}) {
  const allowed = allowedOrigins();
  const origin = req.headers.origin;

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // No/disallowed Origin (same-origin requests, server-to-server, curl):
    // fall back to the canonical site origin rather than a wildcard.
    res.setHeader("Access-Control-Allow-Origin", allowed[0]);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { applyCors, allowedOrigins };
