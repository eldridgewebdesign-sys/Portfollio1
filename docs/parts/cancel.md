# Payment Cancel — `cancel.html`

> The landing page for an abandoned/cancelled payment. Static, reassuring, no charge.

- **File:** `cancel.html`
- **Type:** page (static HTML, inline CSS only — no JS)
- **Route:** `/cancel`
- **Last reviewed:** 2026-07-12

## What it does

Where a customer lands if they back out of checkout. It states plainly that no charge
was made and offers two next steps — try again or call support. There's no logic here;
it's a static reassurance page.

## How everything inside works

The same page shell as the other members-flow pages (vendored fonts, fixed ocean-wave
SVG background, masked WebSharke logo linking home, translucent aqua card), and nothing
else — no scripts, no Supabase.

- A card with an "×" icon, the heading "Payment cancelled", and copy: "No charge was
  made. You can try again or contact support at 775-250-6891."
- Two buttons: **Try again** → `/dashboard` (primary), **Call support** →
  `tel:+17752506891` (secondary).
- A support line repeating the phone number as a `tel:` link.
- One `@media(max-width:560px)` tweak shrinking the logo.

## Last five changes

Newest first. From `docs/logs.md` / `docs/CHANGELOG.md`.

- **2026-06-20** — Google Fonts CDN `<link>` + two `preconnect`s removed; replaced with
  the local inline `@font-face` block, as part of the site-wide no-CDN font pass (this
  was one of the six pages updated together). _(Session: fonts-vendored-locally.)_

## Notes & gotchas

- Purely static — if you ever need it to react to a real cancel reason, that's new JS,
  not an edit to existing behavior.
- `robots: noindex` — keep it.
- The support phone number is hardcoded here and on other pages; if it changes, grep the
  repo so every page stays consistent.

## Related parts

- [[success]] — the sibling page for a completed payment.
- [[dashboard-client]] — where "Try again" sends the customer.
