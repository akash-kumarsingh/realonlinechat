import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Real Online Chat',
  description: 'Terms of service for using Real Online Chat.',
  alternates: { canonical: 'https://realonlinechat.com/terms' },
};

const SECTIONS = [
  {
    title: 'Acceptance of terms',
    body: 'By using Real Online Chat, you agree to these Terms. If you do not agree, do not use the service. You must be at least 18 years old to use Real Online Chat.',
  },
  {
    title: 'Prohibited conduct',
    body: 'You may not use Real Online Chat to: send spam or unsolicited messages; harass, threaten, or abuse others; share illegal content; impersonate others; attempt to identify anonymous users; use automated bots or scripts; or engage in any activity that violates applicable laws.',
  },
  {
    title: 'Content responsibility',
    body: 'You are solely responsible for content you send. Real Online Chat does not monitor conversations in real-time but reserves the right to investigate reports of abuse and take appropriate action.',
  },
  {
    title: 'Disclaimer',
    body: 'Real Online Chat is provided "as is" without warranty of any kind. We are not responsible for the conduct of users or the content they share. Use the service at your own risk.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the maximum extent permitted by law, Real Online Chat shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.',
  },
  {
    title: 'Termination',
    body: 'We reserve the right to block or restrict access to users who violate these terms or engage in abusive behavior, without notice.',
  },
  {
    title: 'Governing law',
    body: 'These Terms are governed by applicable law. Disputes shall be resolved through binding arbitration, except where prohibited by law.',
  },
  {
    title: 'Changes to terms',
    body: 'We may update these Terms at any time. Continued use of Real Online Chat after changes constitutes acceptance of the updated Terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background grid-lines noise">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[#111] bg-black/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="btn btn-ghost btn-icon">
            <ArrowLeft size={14} />
          </Link>
          <Logo variant="full" height={28} href="/" />
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-12">
          <div className="badge mb-4">Terms of Service</div>
          <h1 className="heading-display text-4xl text-text-primary mb-3">
            The rules. Short version: be kind.
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
