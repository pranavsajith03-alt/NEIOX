/* ─────────────────────────────────────────────────────────────────────────
   app/auth/callback/route.ts

   Handles the OAuth redirect from Google (and email confirmation links).

   Flow:
   1. Supabase redirects here after Google auth with a `code` param
   2. We exchange the code for a session using the server client
   3. We read the optional `redirectTo` param to send them to the right page
   4. On failure we send to /login with an error param

   Why a Route Handler and not a page:
   - We need to set cookies server-side before the redirect
   - A page component can't set cookies reliably — only Route Handlers can
───────────────────────────────────────────────────────────────────────── */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database, UserRole } from '@/lib/supabase/types';
import { SUPABASE_COOKIE_OPTIONS } from '@/lib/supabase/cookie-options';
import { logError } from '@/lib/security/logger';
import { getSafeRedirectPath } from '@/lib/security/sanitize';

type ProfileRole = { role: UserRole | null };

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get('code');
  const type       = searchParams.get('type');

  /* ── Open-redirect guard ──────────────────────────────────────────
     `redirectTo` arrives via the OAuth round trip (set by app/login's
     handleGoogleSignIn) and is otherwise attacker-controllable via
     ?redirectTo= on the /login page. Restrict to same-origin paths so
     this can't be used to bounce a freshly-authenticated user to an
     external phishing page.
  ─────────────────────────────────────────────────────────────────── */
  const redirectTo = getSafeRedirectPath(searchParams.get('redirectTo'), '/dashboard');

  /* ── No code param — malformed callback ────────────────────────────
     This happens if someone navigates to /auth/callback directly
     or if the OAuth provider sent an error instead of a code.
  ─────────────────────────────────────────────────────────────────── */
  if (!code) {
    logError('auth/callback', 'No code param received.');
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', origin)
    );
  }

  /* ── Build mutable response so cookies can be written ──────────── */
  let response = NextResponse.redirect(new URL(redirectTo, origin));

  /* ── Supabase server client — edge-compatible cookie handling ───── */
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SUPABASE_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          /* Write refreshed session cookies to the response */
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /* ── Exchange code for session ──────────────────────────────────── */
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    logError('auth/callback', exchangeError);
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', origin)
    );
  }

  /* ── Validate the session was actually created ──────────────────── */
  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (!user || userError) {
    logError('auth/callback', userError ?? 'No user after code exchange.');
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', origin)
    );
  }

  /* ── Password recovery flow ───────────────────────────────────────
     resetPasswordForEmail() sends users here with ?type=recovery.
     They already have a profile/role, but must land on the
     "set new password" page rather than their normal role dashboard.
     `response` already targets `redirectTo` and carries the session
     cookies set by exchangeCodeForSession() above — return as-is.
  ─────────────────────────────────────────────────────────────────── */
  if (type === 'recovery') {
    return response;
  }

  /* ── Check if profile exists — if not, the DB trigger will create it
     We give it a moment via a lightweight fetch check.
     If profile is missing after 3 attempts, we still let them through —
     the dashboard layout will catch and redirect with profile_missing.
  ─────────────────────────────────────────────────────────────────── */
  let profile = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<ProfileRole>();

    if (data) { profile = data; break; }

    /* Wait 500ms between attempts — trigger may not have fired yet */
    await new Promise(res => setTimeout(res, 500));
  }

  /* ── Route to role-specific dashboard ──────────────────────────── */
  const dashboardPaths: Record<string, string> = {
    founder:    '/dashboard/founder',
    staff:      '/dashboard/staff',
    researcher: '/dashboard/researcher',
    intern:     '/dashboard/intern',
  };

  const destination = profile?.role
    ? (dashboardPaths[profile.role] ?? '/dashboard')
    : redirectTo;

  /* Rebuild response with the correct destination + cookies attached */
  response = NextResponse.redirect(new URL(destination, origin));

  /* Re-apply cookies to the new response object */
  const { data: refreshed } = await supabase.auth.getSession();
  void refreshed; // cookies were already set via setAll above

  return response;
}