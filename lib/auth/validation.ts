/* ─────────────────────────────────────────────────────────────────────────
   lib/auth/validation.ts

   Shared between the forgot-password form (client, for instant feedback)
   and its API route (server, for actual enforcement) — keep both in sync.
───────────────────────────────────────────────────────────────────────── */

/* Self-service password reset is restricted to NEIOX team accounts that
   follow the firstname.lastname.<role>.neiox@gmail.com convention. */
export const NEIOX_TEAM_EMAIL_PATTERN =
  /^[a-zA-Z]+\.[a-zA-Z]+\.(intern|staff|researcher)\.neiox@gmail\.com$/;

export const ACCESS_DENIED_MESSAGE =
  'Access denied. Password reset is restricted to valid NEIOX Intern, Staff, or Researcher email accounts.';

export const GENERIC_RESET_ERROR_MESSAGE =
  'Something went wrong. Please try again in a moment.';
