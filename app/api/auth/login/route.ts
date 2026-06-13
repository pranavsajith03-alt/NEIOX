/* ─────────────────────────────────────────────────────────────────────────
   app/api/auth/login/route.ts

   Rate-limited, CORS-protected login proxy.

   supabase.auth.signInWithPassword() normally runs directly from the
   browser to Supabase's Auth API — Next.js middleware can't rate-limit
   or CORS-gate that call. Routing login through this Route Handler lets
   middleware.ts apply per-IP rate limiting (lib/security/rate-limit.ts,
   5 attempts / 15 min) and lets us return a strict CORS allowlist
   (lib/security/cors.ts) before any credentials are checked.

   Uses the anon-key server client (RLS-enforced) — signInWithPassword
   needs neither RLS bypass nor admin privileges, and the Route Handler
   context lets Supabase set the session cookies on the response.

   Error messages mirror the previous client-side mapping in
   app/login/page.tsx so the UX is unchanged — no internal Supabase
   error strings are ever exposed.
───────────────────────────────────────────────────────────────────────── */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ok, err, ROLE_DASHBOARD_PATHS, type UserRole } from '@/lib/supabase/types';
import { getCorsHeaders, corsPreflightResponse } from '@/lib/security/cors';
import { logError } from '@/lib/security/logger';
import { loginSchema } from '@/lib/security/schemas';

const GENERIC_LOGIN_ERROR =
  'Login failed. Please check your credentials and try again.';
const INVALID_CREDENTIALS_ERROR = 'Incorrect email or password.';

type ProfileRole = { role: UserRole | null };

interface LoginResult {
  redirectTo: string;
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'));

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    logError('api/auth/login:parse', error);
    return NextResponse.json(err(GENERIC_LOGIN_ERROR), { status: 400, headers: corsHeaders });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(err(INVALID_CREDENTIALS_ERROR), { status: 400, headers: corsHeaders });
  }
  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const safeMessage = error.message.includes('Invalid login credentials')
        ? INVALID_CREDENTIALS_ERROR
        : error.message.includes('Email not confirmed')
          ? 'Please verify your email address before logging in.'
          : GENERIC_LOGIN_ERROR;

      // Log unrecognized Supabase auth errors for ops visibility — the
      // known cases above are expected user-input failures, not bugs.
      if (safeMessage === GENERIC_LOGIN_ERROR) {
        logError('api/auth/login:signIn', error);
      }

      return NextResponse.json(err(safeMessage), { status: 401, headers: corsHeaders });
    }

    if (!data.user) {
      return NextResponse.json(err(GENERIC_LOGIN_ERROR), { status: 500, headers: corsHeaders });
    }

    /* Fetch role to pick the right dashboard — fall back to the
       generic /dashboard if the profile row hasn't been created yet
       (DB trigger races); middleware handles routing from there. */
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single<ProfileRole>();

    const redirectTo = profile?.role ? (ROLE_DASHBOARD_PATHS[profile.role] ?? '/dashboard') : '/dashboard';

    return NextResponse.json(ok<LoginResult>({ redirectTo }), { headers: corsHeaders });
  } catch (error) {
    logError('api/auth/login', error);
    return NextResponse.json(err(GENERIC_LOGIN_ERROR), { status: 500, headers: corsHeaders });
  }
}
