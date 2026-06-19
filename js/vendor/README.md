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

## Not vendored (intentionally)
- **Stripe.js** stays on `https://js.stripe.com/v3/` — Stripe requires loading it
  directly from their domain (PCI + fraud signals); self-hosting is not allowed.
- **Chart.js** (admin Overview charts) still loads from jsdelivr. Vendor it the
  same way if the admin dashboard must work on a CDN-blocked network.
