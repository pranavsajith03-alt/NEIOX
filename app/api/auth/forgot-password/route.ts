/* ─────────────────────────────────────────────────────────────────────────
   app/api/auth/forgot-password/route.ts

   Server-side enforcement for the forgot-password flow.

   The form at app/forgot-password/page.tsx already checks the email
   pattern client-side for instant feedback, but that check is purely
   cosmetic — anyone can call this endpoint directly. This route
   re-validates against the same pattern (lib/auth/validation.ts) before
   ever touching Supabase, so the restriction holds even for direct API
   calls that bypass the frontend.

   Anti-enumeration: regex-valid-but-nonexistent emails get the same
   ok(null) response as real accounts — Supabase's resetPasswordForEmail
   does not reveal whether an account exists, and neither do we.
───────────────────────────────────────────────────────────────────────── */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ok, err } from '@/lib/supabase/types';
import {
  NEIOX_TEAM_EMAIL_PATTERN,
  ACCESS_DENIED_MESSAGE,
  GENERIC_RESET_ERROR_MESSAGE,
} from '@/lib/auth/validation';
import { getCorsHeaders, corsPreflightResponse } from '@/lib/security/cors';
import { logError } from '@/lib/security/logger';
import { forgotPasswordSchema } from '@/lib/security/schemas';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'));

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    logError('api/auth/forgot-password:parse', error);
    return NextResponse.json(err(GENERIC_RESET_ERROR_MESSAGE), { status: 400, headers: corsHeaders });
  }

  /* ── Schema validation ────────────────────────────────────────────
     Applied before the team-email regex below so oversized or
     malformed payloads are rejected with the same generic shape.
  ─────────────────────────────────────────────────────────────────── */
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(err(GENERIC_RESET_ERROR_MESSAGE), { status: 400, headers: corsHeaders });
  }
  const { email } = parsed.data;

  /* ── Hard server-side gate ────────────────────────────────────────
     Non-matching emails never reach Supabase, regardless of whether
     this was called from the form or directly.
  ─────────────────────────────────────────────────────────────────── */
  if (!NEIOX_TEAM_EMAIL_PATTERN.test(email)) {
    return NextResponse.json(err(ACCESS_DENIED_MESSAGE), { status: 403, headers: corsHeaders });
  }

  try {
    const supabase = await createClient();
    const { origin } = new URL(request.url);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${origin}/auth/callback?type=recovery&redirectTo=${encodeURIComponent('/dashboard/reset-password')}`,
      }
    );

    if (resetError) {
      logError('api/auth/forgot-password:resetPasswordForEmail', resetError);
      return NextResponse.json(err(GENERIC_RESET_ERROR_MESSAGE), { status: 500, headers: corsHeaders });
    }

    return NextResponse.json(ok(null), { headers: corsHeaders });
  } catch (error) {
    logError('api/auth/forgot-password', error);
    return NextResponse.json(err(GENERIC_RESET_ERROR_MESSAGE), { status: 500, headers: corsHeaders });
  }
}
