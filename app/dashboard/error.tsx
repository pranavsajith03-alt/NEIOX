'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/security/logger';

const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /* Log the real error (message, stack, digest) to the console for
     debugging — the UI below only ever shows a generic message. */
  useEffect(() => {
    logError('dashboard/error-boundary', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center
                    min-h-[60vh] gap-4 text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center
                      rounded-2xl border border-status-error/25
                      bg-status-error/10">
        <svg viewBox="0 0 24 24" fill="none"
             className="h-7 w-7 text-status-error"
             stroke="currentColor" strokeWidth={2}
             strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-sage-100">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-sage-400 max-w-sm">
          {GENERIC_ERROR_MESSAGE}
        </p>
      </div>
      <button onClick={reset} className="btn-primary">
        Try Again
      </button>
    </div>
  );
}