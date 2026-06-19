import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Real Online Chat',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error code */}
        <div
          className="font-mono text-[96px] font-bold leading-none mb-6 select-none"
          style={{
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          aria-hidden
        >
          404
        </div>

        {/* Divider */}
        <div className="h-px bg-[#111] mb-8 mx-auto w-16" />

        <h1 className="text-lg font-semibold text-[#ededed] mb-3 tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-[#555] leading-relaxed mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved to a different URL.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn btn-primary w-full sm:w-auto"
            style={{ height: 40, padding: '0 20px' }}
          >
            Go home
          </Link>
          <Link
            href="/rooms"
            className="btn btn-secondary w-full sm:w-auto"
            style={{ height: 40, padding: '0 20px' }}
          >
            Browse chat rooms
          </Link>
        </div>

        {/* Footer link */}
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
