import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export const metadata: Metadata = {
  title: 'Privacy Policy — Real Online Chat',
  description: 'How Real Online Chat handles your data — designed with privacy first.',
  alternates: { canonical: 'https://realonlinechat.com/privacy' },
};

const SECTIONS = [
  {
    title: 'Anonymous by design',
    body: 'Real Online Chat is built with privacy as a core principle. We do not require registration, email, or any personal information. Each session is anonymous and identified only by a temporary connection ID.',
  },
  {
    title: 'What we collect',
    body: 'We collect minimal technical data: your IP address temporarily for rate-limiting and abuse prevention, connection timestamps, and anonymous usage analytics. We do not store message content.',
  },
  {
    title: 'Chat messages',
    body: 'Messages are transmitted in real-time between users and are NOT stored on our servers. Once a session ends, message content is permanently gone. We cannot retrieve past conversations.',
  },
  {
    title: 'Reports and safety',
    body: 'When you submit a report, we store the session IDs involved, the reason, and timestamp. This data is used solely for safety enforcement and is deleted after 30 days.',
  },
  {
    title: 'Cookies and storage',
    body: 'We use minimal browser session storage to maintain your active connection state. We do not use tracking cookies or advertising cookies.',
  },
  {
    title: 'Third parties',
    body: 'We do not sell, rent, or share your data with third parties for marketing. We use infrastructure providers that process data on our behalf under strict agreements.',
  },
  {
    title: 'Your rights',
    body: 'Since we collect no personally identifiable information, there is no personal data to access, export, or delete. Clear your browser data to remove any locally stored session information.',
  },
  {
    title: 'Changes',
    body: 'We may update this privacy policy from time to time. Continued use of the service constitutes acceptance of any changes.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background grid-lines noise">
      <nav className="sticky top-0 z-30 border-b border-[#111] bg-black/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="btn btn-ghost btn-icon">
            <ArrowLeft size={14} />
          </Link>
          <Logo variant="full" height={28} href="/" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-12">
          <div className="badge mb-4">Privacy Policy</div>
          <h1 className="heading-display text-4xl text-text-primary mb-3">
            Your privacy, protected.
          </h1>
          <p className="text-text-secondary">
            Last updated June 2025 · realonlinechat.com
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map(({ title, body }, i) => (
            <div key={title} className="flex gap-6">
              <div className="text-xs font-mono text-[#2a2a2a] pt-1 w-5 flex-shrink-0 text-right">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary mb-2 tracking-tight">
                  {title}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#111111]">
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={13} />
            Back to Real Online Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
