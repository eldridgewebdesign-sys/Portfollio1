# Vendored browser libraries

These are pinned, self-hosted copies of third-party libraries so the site does
**not** depend on a public CDN (e.g. jsdelivr) being reachable. Some networks
block jsdelivr; when that happens a CDN-loaded `supabase` global never appears,
`js/supabase-config.js` can't build `db`, and every auth/dashboard page breaks.
Serving the library from our own origin removes that single point of failure.

## supabase.min.js
- Library: `@supabase/supabase-js`
- Version: **2.108.1** (matches the version in `package.json` / `node_modules`)
- Build: official UMD bundle — exposes the global `supabase` (so
  `supabase.createClient(...)` in `supabase-config.js` works unchanged).
- Source: `node_modules/@supabase/supabase-js/dist/umd/supabase.js`

### How to update
1. Bump `@supabase/supabase-js` in `package.json` and `npm install`.
2. `cp node_modules/@supabase/supabase-js/dist/umd/supabase.js js/vendor/supabase.min.js`
3. Update the version above.

## chart.umd.min.js
- Library: `chart.js` (admin Overview charts only)
- Version: **4.4.1**
- Build: official UMD bundle — exposes the global `Chart` (so `new Chart(...)` in
  `dashboard.html` works unchanged).
- Source: jsDelivr-served `chart.js@4.4.1/dist/chart.umd.min.js` (the npm package's
  already-minified `dist/chart.umd.js`).

### How to update
1. Download `https://cdn.jsdelivr.net/npm/chart.js@<version>/dist/chart.umd.min.js`
   (or `npm install chart.js@<version>` then copy `node_modules/chart.js/dist/chart.umd.js`).
2. `cp` it to `js/vendor/chart.umd.min.js` and update the version above.

## Not vendored (intentionally)
- **Stripe.js** stays on `https://js.stripe.com/v3/` — Stripe requires loading it
  directly from their domain (PCI + fraud signals); self-hosting is not allowed.
