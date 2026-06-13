/* ─────────────────────────────────────────────────────────────────────────
   lib/supabase/cookie-options.ts

   Shared cookie flags applied to every @supabase/ssr client — browser,
   server, middleware, and the auth callback route — so the session
   cookies are configured consistently across the app.

   - sameSite: 'lax'   Sent on top-level navigations (so the Google OAuth
                        and email-confirmation redirects back into the app
                        still carry the session) but withheld from
                        cross-site subrequests — mitigates CSRF.
   - secure:   true in production. Forces the cookie to be sent only over
                        HTTPS. Left `false` in development so the session
                        still works on plain http://localhost.
   - path:     '/'     Default, set explicitly for clarity.

   httpOnly is intentionally left at the @supabase/ssr default (`false`):
   lib/supabase/client.ts's createBrowserClient() reads/writes the session
   cookies via `document.cookie` to keep the client-side session in sync.
   Setting httpOnly here would silently break that and force constant
   re-authentication. XSS-based cookie theft is mitigated instead via
   strict input sanitization (lib/security/sanitize.ts) and by never
   rendering unsanitized user input as HTML.
───────────────────────────────────────────────────────────────────────── */
import type { CookieOptionsWithName } from '@supabase/ssr';

export const SUPABASE_COOKIE_OPTIONS: CookieOptionsWithName = {
  path:     '/',
  sameSite: 'lax',
  secure:   process.env.NODE_ENV === 'production',
};
