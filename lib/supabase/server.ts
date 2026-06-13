/* ─────────────────────────────────────────────────────────────────────────
   lib/supabase/server.ts

   SERVER-ONLY Supabase client.
   Import this in:  server components, server actions, API route handlers
   Never import in: 'use client' components — bundle will break

   Two exported functions:
   1. createClient()       — anon key + RLS enforced (most server components)
   2. createAdminClient()  — service role key, bypasses RLS entirely
                             (use ONLY for admin actions in founder dashboard)
───────────────────────────────────────────────────────────────────────── */
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient }    from '@supabase/supabase-js';
import { cookies }                                  from 'next/headers';
import { SUPABASE_COOKIE_OPTIONS }                  from './cookie-options';

const SUPABASE_URL           = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

/* ── Standard server client (anon key, RLS enforced) ─────────────────────
   Use for all normal data fetching in server components.
   Session is read from the request cookie automatically.
─────────────────────────────────────────────────────────────────────────*/
export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration env variables.');
  }

  // cookies() is async in Next.js 15 — await it
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookieOptions: SUPABASE_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            /* setAll called from a Server Component — safe to ignore.
               Middleware handles session refresh for these cases.       */
          }
        },
      },
    }
  );
}

/* ── Admin client (service role key, bypasses RLS) ────────────────────────
   DANGER: This client has full database access.
   Only use for:
   - Founder dashboard admin actions
   - Background jobs / scheduled functions
   - Seeding / migrations in dev scripts
   NEVER expose this client to the browser or pass it as a prop.
─────────────────────────────────────────────────────────────────────────*/
export function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      '[Supabase admin] SUPABASE_SERVICE_ROLE_KEY is not set.\n' +
      'This key must never be prefixed with NEXT_PUBLIC_.'
    );
  }

  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
      auth: {
        // Disable auto session management — admin client is stateless
        autoRefreshToken:  false,
        persistSession:    false,
        detectSessionInUrl: false,
      },
    }
  );
}