import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import './globals.css';

const SITE_URL = 'https://realonlinechat.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Real Online Chat',

  // ─── Title ────────────────────────────────────────────────
  title: {
    default: 'Real Online Chat — Connect. Chat. Discover.',
    template: '%s | Real Online Chat',
  },
  description:
    'Chat instantly with people worldwide through anonymous text chat and public chat rooms. Free, no signup required — Real Online Chat.',

  keywords: [
    'online chat', 'free online chat', 'real time chat', 'chat rooms',
    'anonymous chat', 'instant messaging', 'live chat', 'global chat',
    'random chat', 'online chatting platform', 'real online chat',
    'talk to strangers', 'meet people online',
  ],
  authors: [{ name: 'Real Online Chat', url: SITE_URL }],
  creator: 'Real Online Chat',
  publisher: 'Real Online Chat',
  category: 'communication',

  // ─── Canonical ─────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': SITE_URL },
  },

  // ─── Icons ─────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico',         sizes: 'any' },
      { url: '/favicon.svg',         type: 'image/svg+xml' },
      { url: '/favicon-16x16.png',   sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png',   sizes: '32x32', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#000000' }],
  },
  manifest: '/site.webmanifest',

  // ─── Open Graph ────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Real Online Chat',
    title: 'Online Chat - Free Real Time Chat Platform',
    description:
      'Chat instantly with people worldwide through anonymous text chat and public chat rooms. Free, no signup required.',
    images: [
      {
        url: `${SITE_URL}/og`,
        width: 1200,
        height: 630,
        alt: 'Real Online Chat — Connect. Chat. Discover.',
        type: 'image/png',
      },
    ],
  },

  // ─── Twitter Card ──────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Online Chat - Free Real Time Chat Platform',
    description: 'Chat with people worldwide instantly using Real Online Chat.',
    images: [`${SITE_URL}/og`],
    creator: '@realonlinechat',
    site: '@realonlinechat',
  },

  // ─── Robots ────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ─── Verification ──────────────────────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-geist-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --font-geist-mono: 'JetBrains Mono', 'Fira Code', monospace;
          }
        `}} />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body className="noise">
        {/* GA4 — production only, non-blocking */}
        <GoogleAnalytics />

        {children}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111111',
              color: '#ededed',
              border: '1px solid #222222',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-geist-sans)',
              padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
            },
          }}
        />
      </body>
    </html>
  );
}
