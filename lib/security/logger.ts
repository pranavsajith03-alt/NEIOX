/* ─────────────────────────────────────────────────────────────────────────
   lib/security/logger.ts

   Internal-only error logging.

   Call this from catch blocks (API routes, route handlers, error
   boundaries) immediately before returning a generic message to the
   client. The full error — message, stack trace, provider error
   details — is written to the server/console log only and is never
   included in any response body or rendered to the user.

   Callers must pass an Error object or a static context string —
   never raw request bodies, credentials, tokens, or session/user
   objects, which would otherwise end up verbatim in server logs.
───────────────────────────────────────────────────────────────────────── */

export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}
