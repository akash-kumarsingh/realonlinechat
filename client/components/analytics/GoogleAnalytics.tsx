/**
 * Google Analytics 4 — Real Online Chat
 * - Loads only in production (NODE_ENV === 'production')
 * - Requires NEXT_PUBLIC_GA_ID environment variable
 * - Uses next/script with afterInteractive strategy (non-blocking)
 * - Tracks page views on route change via Next.js App Router
 */

import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  // Skip in dev or if no ID configured
  if (!GA_ID || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      {/* Load gtag.js — afterInteractive = after hydration, non-blocking */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/* Init + config */}
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
}
