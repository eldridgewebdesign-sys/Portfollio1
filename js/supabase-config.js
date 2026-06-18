// =====================================================================
// Shared Supabase configuration for the Eldridge Web Design client portal.
//
// This file is loaded by BOTH login.html and onboarding.html so the
// connection details live in exactly one place. Load it AFTER the
// supabase-js CDN script, e.g.:
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="js/supabase-config.js"></script>
//
// It exposes one global, `db`, which is the Supabase client every page
// uses for auth and database calls.
// =====================================================================

// ---------------------------------------------------------------------
// PUBLIC config values.
//
// These are the project's PUBLIC "anon" values. They are designed to
// live safely in frontend code — Row Level Security (RLS) protects your
// data on the server side.
//
// *** NEVER put your service_role (secret) key here or in ANY frontend
//     file. That key bypasses RLS. ***
//
// Found in the Supabase dashboard under: Project Settings → API
// ---------------------------------------------------------------------
const SUPABASE_URL = "https://pvamosrjqgzeuymwkruv.supabase.co"; // your project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2YW1vc3JqcWd6ZXV5bXdrcnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDUzMzEsImV4cCI6MjA5NTkyMTMzMX0.U4MA9Pd98_rVAXwmsp4QKfKXeJeCoDq_TWNBFUDp_Tk"; // the long public "anon" key

// ---------------------------------------------------------------------
// Create the Supabase client.
//
// The CDN script exposes a global called `supabase` (the library). We
// build a client from it and name our instance `db` so it doesn't clash
// with that library global.
// ---------------------------------------------------------------------
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
