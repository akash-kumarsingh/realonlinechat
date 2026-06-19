import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

const SITE_URL = 'https://realonlinechat.com';

export const metadata: Metadata = {
  title: 'Online Chat - Free Real Time Chat Platform',
  description:
    'Connect with people instantly through Real Online Chat. Fast, secure and free online chat platform for real-time conversations.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Online Chat - Free Real Time Chat Platform',
    description:
      'Connect with people instantly through Real Online Chat. Fast, secure and free online chat platform for real-time conversations.',
    url: SITE_URL,
    type: 'website',
    siteName: 'Real Online Chat',
    images: [
      {
        url: 'https://realonlinechat.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Real Online Chat - Free Real Time Chat Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Chat - Free Real Time Chat Platform',
    description: 'Chat with people worldwide instantly using Real Online Chat.',
    images: ['https://realonlinechat.com/og-image.jpg'],
  },
};

export default function Home() {
  return <LandingPage />;
}
