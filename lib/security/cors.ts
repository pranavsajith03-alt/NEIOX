/* ─────────────────────────────────────────────────────────────────────────
   lib/security/cors.ts

   CORS allowlist for our own API routes (app/api/**).

   No wildcards. Production origins are the canonical site domains;
   localhost is only included outside of production. Override via the
   ALLOWED_ORIGINS env var (comma-separated) if the production domain
   differs from the placeholders below — see SECURITY_AUDIT_REPORT.md.
───────────────────────────────────────────────────────────────────────── */

const DEFAULT_PRODUCTION_ORIGINS = ['https://neiox.com', 'https://www.neiox.com'];
const DEVELOPMENT_ORIGINS        = ['http://localhost:3000'];

export const ALLOWED_ORIGINS: readonly string[] = (() => {
  const fromEnv = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  const productionOrigins = fromEnv?.length ? fromEnv : DEFAULT_PRODUCTION_ORIGINS;

  return process.env.NODE_ENV === 'production'
    ? productionOrigins
    : [...productionOrigins, ...DEVELOPMENT_ORIGINS];
})();

/* ── Per-request CORS headers ─────────────────────────────────────────────
   Only echoes back the request's Origin if it's on the allowlist —
   never a wildcard. `Vary: Origin` ensures shared caches don't leak one
   origin's CORS headers to another.
─────────────────────────────────────────────────────────────────────────*/
export function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    'Vary':                          'Origin',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

/* ── Preflight response ─────────────────────────────────────────────────── */
export function corsPreflightResponse(origin: string | null): Response {
  return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
}
