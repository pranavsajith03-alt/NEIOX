/* ─────────────────────────────────────────────────────────────────────────
   app/forgot-password/page.tsx

   Self-service password reset entry point.

   - Restricted to NEIOX team accounts that follow the
     firstname.lastname.<role>.neiox@gmail.com convention (intern, staff,
     researcher). Anything else is rejected client-side before Supabase
     is ever called.
   - Anti-enumeration: a correctly-formatted email always gets the same
     generic success message, whether or not an account exists for it.
───────────────────────────────────────────────────────────────────────── */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ActionResult } from '@/lib/supabase/types';
import { NEIOX_TEAM_EMAIL_PATTERN, ACCESS_DENIED_MESSAGE } from '@/lib/auth/validation';

const GENERIC_SUCCESS_MESSAGE =
  'If this account exists, a password reset link has been sent to it. Please check your inbox.';

const GENERIC_ERROR_MESSAGE =
  'Something went wrong. Please try again in a moment.';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    const trimmedEmail = email.trim();

    /* ── Client-side gate ────────────────────────────────────────────
       Non-matching emails never reach Supabase.
    ─────────────────────────────────────────────────────────────────*/
    if (!NEIOX_TEAM_EMAIL_PATTERN.test(trimmedEmail)) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const result = (await response.json()) as ActionResult<null>;

      /* The API route re-validates the email pattern server-side and
         returns the same ACCESS_DENIED_MESSAGE if it doesn't match —
         surface that distinctly, everything else is generic. */
      if (!result.success) {
        setError(result.error === ACCESS_DENIED_MESSAGE ? ACCESS_DENIED_MESSAGE : GENERIC_ERROR_MESSAGE);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neiox-surface px-4 py-16">
      <div className="w-full max-w-md rounded-site-2xl border border-neiox-outline-variant bg-neiox-surface-lowest p-8 shadow-card-site">

        {/* Wordmark */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neiox-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"
                 stroke="currentColor" strokeWidth={2.5}
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                       10-4.48 10-10S17.52 2 12 2z"
                    className="text-neiox-surface" />
              <path d="M8 12l3 3 5-5" className="text-neiox-surface" />
            </svg>
          </div>
          <span className="font-display text-neiox-on-surface font-semibold tracking-tight">
            NEIOX
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-hanken text-2xl font-medium text-neiox-on-surface">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-neiox-on-surface-variant">
            Enter your NEIOX team email and we&rsquo;ll send you a link to reset your password.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6">
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-site-lg border border-status-success/25
                         bg-status-success/10 px-4 py-3 text-sm leading-relaxed text-status-success"
            >
              <span className="shrink-0 text-xs font-bold mt-0.5">✓</span>
              <span>{GENERIC_SUCCESS_MESSAGE}</span>
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-neiox-primary
                         hover:text-neiox-primary-container transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neiox-on-surface-variant"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                className="w-full rounded-site-lg border border-neiox-outline-variant
                           bg-neiox-surface-lowest px-4 py-3 text-sm text-neiox-on-surface
                           placeholder:text-neiox-outline transition-colors
                           focus:border-neiox-primary focus:outline-none
                           focus:ring-1 focus:ring-neiox-primary/40"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-site-lg border border-status-error/25
                           bg-status-error/10 px-4 py-3 text-sm leading-relaxed text-status-error"
              >
                <span className="shrink-0 text-xs font-bold mt-0.5">✕</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-site-lg bg-neiox-primary px-6 py-3 text-sm font-semibold
                         text-white transition-all duration-300 hover:bg-neiox-primary-container
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm font-medium text-neiox-on-surface-variant
                         hover:text-neiox-on-surface transition-colors"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
