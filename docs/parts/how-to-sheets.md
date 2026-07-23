# How-To Sheets — `how-to-sheets.html`

> A plain-English explainer of what "spreadsheet integration" means, linked from the onboarding form's Spreadsheets question.

- **File:** `how-to-sheets.html`
- **Type:** page (static HTML, inline CSS — no JS)
- **Route:** `/how-to-sheets`
- **Last reviewed:** 2026-07-12

## What it does

This is a small helper/marketing page for non-technical clients. When someone
filling out onboarding selects the **Spreadsheets** extension, a "How spreadsheets
work →" link opens this page in a new tab. It explains, in everyday language, what
a spreadsheet connection does for their website (store leads, orders, bookings,
form submissions, inventory, etc.) and how the process works, then sends them back
to their project form. It's purely informational — no accounts, no data, no
payments.

## How everything inside works

A completely static page: inline `<style>`, markup, **no `<script>` at all** and
no Supabase/Stripe. It uses the same ocean/glass visual system as onboarding
(local `@font-face`, a fixed layered-turquoise-wave SVG `.ocean` background, the
masked WebSharke logo top-left linking to `/`).

The content is one `.card` holding:
- an eyebrow + `<h1>` title and a lede paragraph,
- a **"What a spreadsheet can hold"** section,
- a grid of six example tiles (`.ex`): Leads & enquiries, Orders & sales,
  Bookings & appointments, Form submissions, Inventory & products, Client & member
  info,
- a **"How it comes together"** numbered `.steps` list (4 steps),
- a closing paragraph,
- a **"← Back to your project form"** button linking to `onboarding.html`.

There's a `@media(max-width:600px)` block that shrinks the logo and card padding
on phones. That's the whole page — nothing to break at runtime.

## Last five changes

Newest first. From `docs/logs.md` and `docs/CHANGELOG.md`. This page has two real
changes, both listed.

- **2026-07-17** — The back button now points to the extensionless `/onboarding`
  route (was `onboarding.html`, which 308-redirected). _(Session:
  `full-site-optimization-pass`.)_
- **2026-06-30** — Created the file: a client-friendly, non-technical explainer of
  spreadsheet integrations (heading, lede, six example tiles, four "how it comes
  together" steps, and a back button to the onboarding form), matching the
  WebSharke ocean/glass style. Added as part of the onboarding redesign, where the
  Spreadsheets extension links to it. _(Session: `onboarding-feature-extensions-redesign`.)_

## Notes & gotchas

- No JS, no auth, no data — nothing sensitive here. Safe to edit as pure content.
- The back button links to `onboarding.html` (with the extension) rather than the
  clean `/onboarding` route. Legacy `.html` URLs still resolve (Vercel
  308-redirects them), but per `CLAUDE.md` the convention is extensionless routes —
  worth tidying if this file is edited.
- All images must live in `images/` (only `Main-Logo.png` / `Tab-Logo.png` are
  used here).

## Related parts

- [[onboarding]] — the Spreadsheets extension question links here (new tab); the back button returns to it.
