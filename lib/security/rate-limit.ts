/* ─────────────────────────────────────────────────────────────────────────
   lib/security/rate-limit.ts

   IP-based rate limiting for sensitive auth endpoints (login,
   forgot-password). Used from middleware.ts, which runs on the Edge
   runtime — both the Upstash client and the in-memory fallback below
   are Edge-compatible.

   - If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set, uses a
     distributed sliding-window limiter (correct across multiple
     server instances / edge regions).
   - Otherwise falls back to an in-memory sliding window. This is
     PER-INSTANCE only — fine for local dev or a single-server deploy,
     but on multi-instance/edge deployments each instance has its own
     counter. Configure Upstash for production. See SECURITY_AUDIT_REPORT.md.
───────────────────────────────────────────────────────────────────────── */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

export const RATE_LIMIT_MAX_REQUESTS = 5;
export const RATE_LIMIT_WINDOW       = '15 m';
const RATE_LIMIT_WINDOW_MS           = 15 * 60 * 1000;

export interface RateLimitResult {
  success:   boolean;
  limit:     number;
  remaining: number;
  /** Unix ms timestamp when the window resets. */
  reset:     number;
}

/* ── Upstash-backed limiter (only constructed if env vars are present) ── */
const upstashLimiter = (() => {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW),
    prefix:  'neiox-rl',
  });
})();

/* ── In-memory fallback (per-instance) ──────────────────────────────────
   Map<key, { count, resetAt }>. Cleared lazily — entries past their
   reset time are treated as fresh on next access.
─────────────────────────────────────────────────────────────────────────*/
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkMemoryLimit(key: string): RateLimitResult {
  const now   = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, limit: RATE_LIMIT_MAX_REQUESTS, remaining: RATE_LIMIT_MAX_REQUESTS - 1, reset: resetAt };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { success: false, limit: RATE_LIMIT_MAX_REQUESTS, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, limit: RATE_LIMIT_MAX_REQUESTS, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, reset: entry.resetAt };
}

/* ── Public API ──────────────────────────────────────────────────────────
   `key` should already be scoped (e.g. `login:<ip>`) so different
   endpoints don't share a budget.
─────────────────────────────────────────────────────────────────────────*/
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  if (upstashLimiter) {
    const { success, limit, remaining, reset } = await upstashLimiter.limit(key);
    return { success, limit, remaining, reset };
  }
  return checkMemoryLimit(key);
}

/* ── Client IP extraction ────────────────────────────────────────────────
   NextRequest.ip is only populated on Vercel. Fall back to the standard
   forwarding headers for other hosts/local dev.
─────────────────────────────────────────────────────────────────────────*/
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}
