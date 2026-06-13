/* ─────────────────────────────────────────────────────────────────────────
   lib/supabase/client.ts

   BROWSER-ONLY Supabase client.
   Import this in:  'use client' components, client-side hooks, browser events
   Never import in: server components, middleware, server actions, API routes

   Uses the anon key — subject to Row Level Security policies.
───────────────────────────────────────────────────────────────────────── */
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_COOKIE_OPTIONS } from './cookie-options';

/* ── Env validation ───────────────────────────────────────────────────────
   Runs at module load time. If variables are missing the app crashes
   immediately with a clear message instead of a cryptic runtime error.
─────────────────────────────────────────────────────────────────────────*/
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration env variables.');
}

/* ── Factory function ─────────────────────────────────────────────────────
   createBrowserClient (from @supabase/ssr) handles cookie-based session
   persistence automatically — no manual localStorage management needed.
   Returns a new instance per call; @supabase/ssr handles deduplication.
─────────────────────────────────────────────────────────────────────────*/
export function createClient() {
  return createBrowserClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    { cookieOptions: SUPABASE_COOKIE_OPTIONS }
  );
}