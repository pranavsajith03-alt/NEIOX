/* ─────────────────────────────────────────────────────────────────────────
   app/dashboard/reset-password/page.tsx

   Landing page for the password-recovery flow. Reached via the link in
   the "Forgot password" email — app/auth/callback/route.ts exchanges the
   recovery code for a session and redirects here (?type=recovery).

   Any authenticated user may reach this page (it isn't role-scoped), but
   it only makes sense as the destination of a recovery link, so a missing
   session is treated as an expired/invalid link.
───────────────────────────────────────────────────────────────────────── */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again in a moment.';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession]           = useState(false);

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [isSuccess, setIsSuccess]             = useState(false);

  /* ── A recovery session must already exist — set by the auth callback ── */
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setHasSession(!!user);
      setCheckingSession(false);
    }
    checkSession();
  }, []);

  /* ── Send the user to sign in with their new password ────────────── */
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => router.push('/login'), 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(GENERIC_ERROR_MESSAGE);
        return;
      }

      // End the recovery session — the user signs back in with the new password.
      await supabase.auth.signOut();
      setIsSuccess(true);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-site-2xl border border-neiox-outline-variant bg-neiox-surface-lowest p-8 shadow-card-site">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-hanken text-2xl font-medium text-neiox-on-surface">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-neiox-on-surface-variant">
            Choose a new password for your NEIOX account.
          </p>
        </div>

        {checkingSession ? (
          <p className="text-center text-sm text-neiox-outline">Verifying your reset link…</p>

        ) : !hasSession ? (
          <div className="space-y-6">
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-site-lg border border-status-error/25
                         bg-status-error/10 px-4 py-3 text-sm leading-relaxed text-status-error"
            >
              <span className="shrink-0 text-xs font-bold mt-0.5">✕</span>
              <span>This password reset link is invalid or has expired. Please request a new one.</span>
            </div>
            <Link
              href="/forgot-password"
              className="block text-center text-sm font-medium text-neiox-primary
                         hover:text-neiox-primary-container transition-colors"
            >
              Request a new link
            </Link>
          </div>

        ) : isSuccess ? (
          <div className="space-y-6">
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-site-lg border border-status-success/25
                         bg-status-success/10 px-4 py-3 text-sm leading-relaxed text-status-success"
            >
              <span className="shrink-0 text-xs font-bold mt-0.5">✓</span>
              <span>Password updated. Redirecting you to sign in…</span>
            </div>
          </div>

        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neiox-on-surface-variant"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Min. 8 characters"
                className="w-full rounded-site-lg border border-neiox-outline-variant
                           bg-neiox-surface-lowest px-4 py-3 text-sm text-neiox-on-surface
                           placeholder:text-neiox-outline transition-colors
                           focus:border-neiox-primary focus:outline-none
                           focus:ring-1 focus:ring-neiox-primary/40"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-neiox-on-surface-variant"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Repeat your new password"
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
              {isLoading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
