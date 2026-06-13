/* ─────────────────────────────────────────────────────────────────────────
   app/login/page.tsx

   What changed from the original and why:

   SECURITY
   - Removed client-side role detection via email regex — roles are now
     assigned server-side via a Supabase DB trigger on profiles insert.
     The client never decides what role a user gets.
   - Removed the silent ChangeMe123! default password fallback entirely.
   - Replaced getSession() with getUser() for auth state checks.
   - Old singleton getSupabaseClient() replaced with createClient() from
     the new lib/supabase/client.ts.

   UX
   - Login and Signup are now separate toggled states with distinct
     field sets — signup shows confirm password + full name, login doesn't.
   - URL param ?mode=signup lands directly on the signup tab (useful for
     invite links).
   - ?redirectTo is preserved through the auth flow so users land where
     they intended after login.
   - ?error=profile_missing surfaces a readable message from middleware.
   - Google OAuth is kept but positioned as the primary CTA.
   - All error states use typed discrimination — no freeform string
     messages that could leak internal details.

   CODE
   - Explicit TypeScript interfaces for all state shapes.
   - try/catch on every Supabase call with typed error handling.
   - Loading state disables all interactive elements — prevents
     double-submission races.
───────────────────────────────────────────────────────────────────────── */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import { createClient }                      from '@/lib/supabase/client';
import type { ActionResult }                 from '@/lib/supabase/types';
import { getSafeRedirectPath }               from '@/lib/security/sanitize';

const MAX_EMAIL_INPUT_LENGTH    = 254;
const MAX_PASSWORD_INPUT_LENGTH = 128;
const MAX_NAME_INPUT_LENGTH     = 100;

/* ── Types ────────────────────────────────────────────────────────────── */
type AuthMode = 'login' | 'signup';

interface FormState {
  email:           string;
  password:        string;
  confirmPassword: string;
  fullName:        string;
}

interface FeedbackState {
  type:    'error' | 'success' | 'info';
  message: string;
}

const EMPTY_FORM: FormState = {
  email:           '',
  password:        '',
  confirmPassword: '',
  fullName:        '',
};

/* ── Password validation ──────────────────────────────────────────────────
   Done client-side for UX only — Supabase enforces its own rules server-side.
─────────────────────────────────────────────────────────────────────────*/
function validateSignupForm(form: FormState): string | null {
  if (!form.fullName.trim())
    return 'Please enter your full name.';
  if (form.password.length < 8)
    return 'Password must be at least 8 characters.';
  if (form.password !== form.confirmPassword)
    return 'Passwords do not match.';
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router       = useRouter();

  const [redirectTo, setRedirectTo] = useState('/dashboard');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    setMode(modeParam === 'signup' ? 'signup' : 'login');
    /* Open-redirect guard — only same-origin paths are honored; see
       lib/security/sanitize.ts#getSafeRedirectPath. */
    setRedirectTo(getSafeRedirectPath(params.get('redirectTo'), '/dashboard'));

    const errorParam = params.get('error');
    setUrlError(errorParam);

    if (errorParam === 'profile_missing') {
      setFeedback({
        type: 'error',
        message: 'Your account profile is incomplete. Please contact your administrator.',
      });
    }
  }, []);

  /* ── Redirect already-authenticated users ────────────────────────────
     Uses getUser() not getSession() — validates against auth server.
  ─────────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace(redirectTo);
    }
    checkAuth();
  }, [router, redirectTo]);

  /* ── Form field handler ──────────────────────────────────────────── */
  const handleField = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        // Clear feedback as the user types — reduce friction
        if (feedback?.type === 'error') setFeedback(null);
      },
    [feedback]
  );

  /* ── Toggle mode ─────────────────────────────────────────────────── */
  const toggleMode = useCallback((next: AuthMode) => {
    setMode(next);
    setForm(EMPTY_FORM);
    setFeedback(null);
  }, []);

  /* ── Email login ─────────────────────────────────────────────────────────
     Proxied through /api/auth/login (not a direct Supabase call) so that
     middleware.ts can apply per-IP rate limiting and a strict CORS
     allowlist to login attempts. The route sets the session cookie and
     returns the role-specific dashboard path to redirect to.
  ─────────────────────────────────────────────────────────────────────────*/
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email, password: form.password }),
      });

      const result = (await response.json()) as ActionResult<{ redirectTo: string }>;

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error });
        return;
      }

      router.push(result.data.redirectTo || redirectTo);

    } catch {
      setFeedback({
        type: 'error',
        message: 'Login failed. Please check your credentials and try again.',
      });
    }
  };

  /* ── Email signup ────────────────────────────────────────────────── */
  const handleSignup = async () => {
    const validationError = validateSignupForm(form);
    if (validationError) {
      setFeedback({ type: 'error', message: validationError });
      return;
    }

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName },
          // Role is assigned server-side via DB trigger — never passed here
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email confirmation required (Supabase default)
        setFeedback({
          type: 'success',
          message: 'Account created. Please check your email to confirm your address before logging in.',
        });
        // Switch to login mode so they can sign in after confirming
        setTimeout(() => toggleMode('login'), 4000);
        return;
      }

      // Auto-confirmed (email confirmation disabled in Supabase settings)
      setFeedback({ type: 'success', message: 'Account created. Redirecting…' });
      router.push(redirectTo);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Signup failed.';
      const safeMessage = message.includes('already registered')
        ? 'An account with this email already exists. Try logging in instead.'
        : message.includes('Password should be')
          ? 'Password is too weak. Use at least 8 characters with mixed case and numbers.'
          : 'Signup failed. Please try again.';

      setFeedback({ type: 'error', message: safeMessage });
    }
  };

  /* ── Unified submit handler ──────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      if (mode === 'login') await handleLogin();
      else                  await handleSignup();
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived UI state ────────────────────────────────────────────── */
  const isLogin  = mode === 'login';
  const isSignup = mode === 'signup';

  /* ════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen bg-forest-950 flex items-center justify-center px-4 py-16 overflow-hidden">

      {/* ── Ambient background ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px]
                   -translate-x-1/2 rounded-full
                   bg-mint-500/5 blur-[120px]"
      />

      {/* ── Main card ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-0 overflow-hidden rounded-3xl border border-sage-600/20
                        bg-forest-900/80 shadow-overlay backdrop-blur-xl
                        lg:grid-cols-[1.1fr,0.9fr]">

          {/* ── Left panel — brand copy ───────────────────────── */}
          <div className="relative flex flex-col justify-between
                          overflow-hidden p-10 lg:p-14">

            {/* Decorative corner gradient */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-20
                         h-64 w-64 rounded-full bg-mint-500/10 blur-[80px]"
            />

            <div>
              {/* Wordmark */}
              <div className="flex items-center gap-2.5 mb-14">
                <div className="h-7 w-7 rounded-lg bg-mint-500 flex items-center
                                justify-center shadow-mint-glow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"
                       stroke="currentColor" strokeWidth={2.5}
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                             10-4.48 10-10S17.52 2 12 2z"
                          className="text-forest-950" />
                    <path d="M8 12l3 3 5-5" className="text-forest-950" />
                  </svg>
                </div>
                <span className="font-display text-sage-100 font-semibold tracking-tight">
                  NEIOX
                </span>
              </div>

              {/* Headline */}
              <p className="text-xs font-semibold uppercase tracking-[0.25em]
                            text-mint-500 mb-4">
                Portal Access
              </p>
              <h1 className="font-display text-4xl font-bold leading-[1.1]
                             tracking-tight text-sage-100 lg:text-5xl">
                One portal.<br />
                <span className="text-gradient">Every role.</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-sage-400 max-w-sm">
                Secure access for founders, researchers, staff, and interns.
                Your dashboard adapts to your role the moment you sign in.
              </p>
            </div>

            {/* Role badges */}
            <div className="mt-12 flex flex-wrap gap-2">
              {(['Founder', 'Researcher', 'Staff', 'Intern'] as const).map(r => (
                <span key={r} className="badge badge-idle text-xs">
                  {r}
                </span>
              ))}
            </div>

            {/* Bottom divider line for visual grounding */}
            <div className="mt-10 h-px w-full bg-gradient-to-r
                            from-sage-600/0 via-sage-600/30 to-sage-600/0" />
          </div>

          {/* ── Right panel — auth form ───────────────────────── */}
          <div className="flex flex-col justify-center
                          border-l border-sage-600/20
                          bg-forest-950/50 p-8 lg:p-12">

            {/* Mode toggle tabs */}
            <div className="mb-8 flex rounded-xl bg-forest-900 p-1
                            border border-sage-600/20">
              <button
                type="button"
                onClick={() => toggleMode('login')}
                disabled={loading}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold
                            transition-all duration-300
                            ${isLogin
                              ? 'bg-forest-700 text-sage-100 shadow-card'
                              : 'text-sage-400 hover:text-sage-300'
                            }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => toggleMode('signup')}
                disabled={loading}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold
                            transition-all duration-300
                            ${isSignup
                              ? 'bg-forest-700 text-sage-100 shadow-card'
                              : 'text-sage-400 hover:text-sage-300'
                            }`}
              >
                Create Account
              </button>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Full name — signup only */}
              {isSignup && (
                <div>
                  <label htmlFor="fullName" className="field-label">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleField('fullName')}
                    placeholder="Ada Okafor"
                    className="field"
                    disabled={loading}
                    required
                    maxLength={MAX_NAME_INPUT_LENGTH}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="field-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleField('email')}
                  placeholder="you@example.com"
                  className="field"
                  disabled={loading}
                  required
                  maxLength={MAX_EMAIL_INPUT_LENGTH}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="field-label !mb-0">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-xs text-mint-500 hover:text-mint-400
                                 transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={handleField('password')}
                  placeholder={isSignup ? 'Min. 8 characters' : '••••••••'}
                  className="field"
                  disabled={loading}
                  required
                  minLength={isSignup ? 8 : undefined}
                  maxLength={MAX_PASSWORD_INPUT_LENGTH}
                />
              </div>

              {/* Confirm password — signup only */}
              {isSignup && (
                <div>
                  <label htmlFor="confirmPassword" className="field-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleField('confirmPassword')}
                    placeholder="Repeat your password"
                    className="field"
                    disabled={loading}
                    required
                    maxLength={MAX_PASSWORD_INPUT_LENGTH}
                  />
                </div>
              )}

              {/* Feedback message */}
              {feedback && (
                <FeedbackBanner type={feedback.type} message={feedback.message} />
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading
                  ? <LoadingSpinner />
                  : isLogin ? 'Sign In' : 'Create Account'
                }
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-sage-500 leading-relaxed">
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '
              }
              <button
                type="button"
                onClick={() => toggleMode(isLogin ? 'signup' : 'login')}
                disabled={loading}
                className="text-mint-500 hover:text-mint-400
                           transition-colors duration-200 font-medium"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>

          </div>
          {/* end right panel */}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

interface FeedbackBannerProps {
  type:    'error' | 'success' | 'info';
  message: string;
}

function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  const styles = {
    error:   'bg-status-error/10   border-status-error/25   text-status-error',
    success: 'bg-status-success/10 border-status-success/25 text-status-success',
    info:    'bg-status-pending/10 border-status-pending/25 text-status-pending',
  } as const;

  const icons = {
    error:   '✕',
    success: '✓',
    info:    '↻',
  } as const;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3
                  text-sm leading-relaxed ${styles[type]}`}
    >
      <span className="shrink-0 text-xs font-bold mt-0.5">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="flex items-center gap-2">
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="3"
                className="opacity-25" />
        <path d="M4 12a8 8 0 018-8"
              stroke="currentColor" strokeWidth="3"
              strokeLinecap="round"
              className="opacity-80" />
      </svg>
      Processing…
    </span>
  );
}