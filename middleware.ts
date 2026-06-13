import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest }          from 'next/server';
import {
  type Database,
  type UserRole,
  ROLE_DASHBOARD_PATHS,
  err,
} from '@/lib/supabase/types';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { SUPABASE_COOKIE_OPTIONS } from '@/lib/supabase/cookie-options';

type ProfileRole = { role: UserRole | null };

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ROLE_ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/dashboard/founder':    ['founder'],
  '/dashboard/staff':      ['staff', 'founder'],
  '/dashboard/researcher': ['researcher', 'founder'],
  '/dashboard/intern':     ['intern', 'founder'],
};

/* POST requests to these prefixes are rate-limited per-IP — see
   lib/security/rate-limit.ts (5 requests / 15 min by default). */
const RATE_LIMITED_AUTH_PATHS = ['/api/auth/login', '/api/auth/forgot-password'];

function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_ROUTE_ACCESS)) {
    if (pathname.startsWith(prefix)) return roles;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── Rate limit sensitive auth endpoints ──────────────────────────
     Checked before any Supabase calls so an over-budget client
     doesn't cost us an auth round trip. ─────────────────────────── */
  if (request.method === 'POST' && RATE_LIMITED_AUTH_PATHS.some(p => pathname.startsWith(p))) {
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await checkRateLimit(`${pathname}:${ip}`);

    if (!success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(err('Too many requests. Please try again later.'), {
        status: 429,
        headers: {
          'Retry-After':           String(retryAfterSeconds),
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': String(remaining),
        },
      });
    }
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookieOptions: SUPABASE_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  /* ── /login route ───────────────────────────────────────────────── */
  if (pathname.startsWith('/login')) {
    if (user && !authError) {
      /* ── Only redirect away from login if profile exists ──────────
         This is the critical fix — without this check, a user with
         no profile bounces login → dashboard → login infinitely.
      ─────────────────────────────────────────────────────────────*/
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<ProfileRole>();

      if (profile?.role) {
        const destination = ROLE_DASHBOARD_PATHS[profile.role] ?? '/dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
      }

      /* Profile missing — sign them out so login page shows cleanly */
      await supabase.auth.signOut();
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'profile_missing');
      /* Clear cookies on the response to kill the session */
      const signOutResponse = NextResponse.redirect(loginUrl);
      request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
          signOutResponse.cookies.delete(cookie.name);
        }
      });
      return signOutResponse;
    }
    return response;
  }

  /* ── /dashboard routes — must be authenticated ──────────────────── */
  if (pathname.startsWith('/dashboard')) {
    if (!user || authError) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const requiredRoles = getRequiredRoles(pathname);

    if (requiredRoles !== null) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<ProfileRole>();

      if (!profile?.role) {
        /* ── Profile missing — sign out + redirect, no loop ─────────
           Sign out first so /login doesn't see an active session
           and immediately redirect back here.
        ─────────────────────────────────────────────────────────────*/
        await supabase.auth.signOut();
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'profile_missing');
        const signOutResponse = NextResponse.redirect(loginUrl);
        request.cookies.getAll().forEach(cookie => {
          if (cookie.name.startsWith('sb-')) {
            signOutResponse.cookies.delete(cookie.name);
          }
        });
        return signOutResponse;
      }

      const hasAccess = requiredRoles.includes(profile.role);
      if (!hasAccess) {
        const correctPath = ROLE_DASHBOARD_PATHS[profile.role];
        return NextResponse.redirect(new URL(correctPath, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};