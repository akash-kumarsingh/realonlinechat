'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in dev; in production wire to your error service
    if (process.env.NODE_ENV === 'development') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error mark */}
        <div
          className="font-mono text-[80px] font-bold leading-none mb-6 select-none"
          style={{
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          aria-hidden
        >
          500
        </div>

        {/* Divider */}
        <div className="h-px bg-[#111] mb-8 mx-auto w-16" />

        <h1 className="text-lg font-semibold text-[#ededed] mb-3 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-[#555] leading-relaxed mb-8 max-w-xs mx-auto">
          An unexpected error occurred. Our team has been notified.
          Please try again or return to the homepage.
        </p>

        {/* Error digest for support (production) */}
        {error.digest && (
          <p className="text-[10px] font-mono text-[#2a2a2a] mb-6">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn btn-primary w-full sm:w-auto"
            style={{ height: 40, padding: '0 20px' }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn btn-secondary w-full sm:w-auto"
            style={{ height: 40, padding: '0 20px' }}
          >
            Go home
          </Link>
        </div>

        <p className="mt-10 text-xs text-[#2a2a2a]">
          Real Online Chat ·{' '}
          <Link href="/privacy" className="hover:text-[#444] transition-colors">
            Privacy
          </Link>
          {' '}·{' '}
          <Link href="/terms" className="hover:text-[#444] transition-colors">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
