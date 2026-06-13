/* ─────────────────────────────────────────────────────────────────────────
   lib/security/sanitize.ts

   Shared input-bounding helpers for API routes and forms.

   React already escapes interpolated text in JSX (no
   dangerouslySetInnerHTML is used in this codebase), so the main risks
   for free-text fields are oversized payloads (DoS) and embedded control
   characters — not raw HTML/script tags. These helpers trim, cap length,
   and strip control characters; they do NOT attempt HTML-escaping.
───────────────────────────────────────────────────────────────────────── */

export const MAX_EMAIL_LENGTH    = 254;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NAME_LENGTH     = 100;
export const MAX_SEARCH_LENGTH   = 100;
export const MAX_MESSAGE_LENGTH  = 2000;

/* C0/C1 control character code points, excluding common whitespace
   (tab, newline, carriage return), which are left intact. */
const TAB = 9;
const LF  = 10;
const CR  = 13;
const PRINTABLE_FLOOR = 32;  // first printable ASCII code point (space)
const DEL_CODE        = 127;
const C1_CEILING      = 159;

function isControlCharCode(code: number): boolean {
  if (code === TAB || code === LF || code === CR) return false;
  if (code < PRINTABLE_FLOOR) return true;
  return code >= DEL_CODE && code <= C1_CEILING;
}

/**
 * Trims surrounding whitespace, strips control characters, and truncates
 * to `maxLength`. Use on any free-text field before persisting or
 * forwarding it (search queries, names, messages, notes).
 */
export function sanitizeText(input: string, maxLength: number): string {
  let result = '';
  for (const char of input) {
    if (!isControlCharCode(char.codePointAt(0) ?? 0)) result += char;
  }
  return result.trim().slice(0, maxLength);
}

/**
 * Basic email shape check — a format check, not a deliverability check.
 * Used by lib/security/schemas.ts as a Zod `.regex()` refinement.
 */
export const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a `redirectTo`-style query param before it's handed to
 * `router.push/replace` or `NextResponse.redirect()`. Only same-origin,
 * absolute paths (e.g. `/dashboard/founder`) are allowed — anything else
 * (a full URL like `https://evil.com`, or a protocol-relative URL like
 * `//evil.com`, which browsers treat as absolute) falls back to `fallback`.
 * Without this check, `?redirectTo=` becomes an open-redirect vector that
 * can be used for post-login phishing.
 */
export function getSafeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//') || path.startsWith('/\\')) return fallback;
  return path;
}
