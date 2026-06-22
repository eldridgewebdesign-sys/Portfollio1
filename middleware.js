// =============================================================================
// middleware.js — Vercel Edge Middleware
//
// Adds a server-side authentication gate in front of protected pages.
// This runs BEFORE the HTML is served, so unauthenticated users are
// redirected to /login without ever seeing the dashboard HTML.
//
// Works alongside the existing client-side Supabase auth check as a
// second, independent layer of defence.
//
// How the cookie is set: login.html calls goToDashboard(), which writes
// the ws_session=1 cookie on a successful Supabase signIn. The cookie is
// cleared by both signout handlers in dashboard.html.
// =============================================================================

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  // Routes that require a logged-in session.
  //
  // NOTE: /onboarding is intentionally NOT here. It is the public new-client
  // signup page (like /login) — a first-time visitor has no session yet, so
  // gating it would redirect every prospective client to /login and make
  // signup impossible. Only the logged-in area (/dashboard) is gated.
  const protectedRoutes = ["/dashboard"];

  if (protectedRoutes.includes(pathname)) {
    const cookies = request.headers.get("cookie") || "";
    const hasSession = /(?:^|;\s*)ws_session=1/.test(cookies);

    if (!hasSession) {
      // No session cookie → redirect to login (302 so the browser retries
      // after login rather than caching the redirect permanently).
      return Response.redirect(new URL("/login", request.url), 302);
    }
  }

  // Returning undefined passes the request through to the static file / function.
}

export const config = {
  matcher: ["/dashboard"],
};
