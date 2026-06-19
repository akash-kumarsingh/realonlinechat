'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Shield, Globe, Lock, MessageSquare,
  Users, ChevronRight, Eye, UserCheck, Zap, Heart,
} from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { formatCount, TAGLINE } from '@/lib/utils';
import {
  WebSiteSchema, WebApplicationSchema, OrganizationSchema,
  FAQSchema, BreadcrumbSchema,
} from '@/components/seo/JsonLd';
import SeoContent from '@/components/seo/SeoContent';

/* ─── Static data ─────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '/rooms', label: 'Chat Rooms', prefetch: true },
  { href: '#how-it-works', label: 'How it works' },
  { href: '/privacy', label: 'Privacy' },
];

const TRUST_INDICATORS = [
  'No Signup Required',
  'Anonymous Chat',
  'Worldwide Community',
  'Real-Time Messaging',
  'Free Forever',
];

const FEATURES = [
  {
    icon: Lock,
    title: 'Anonymous Chat',
    description: 'Talk freely without creating an account. No email, no name, no trace.',
  },
  {
    icon: Heart,
    title: 'Interest Matching',
    description: 'Connect with people who share your hobbies and passions for better conversations.',
  },
  {
    icon: Globe,
    title: 'Worldwide Community',
    description: 'Meet users from every corner of the globe, 24 hours a day, 7 days a week.',
  },
  {
    icon: Zap,
    title: 'Instant Messaging',
    description: 'Fast real-time conversations powered by WebSocket technology with zero lag.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'No unnecessary personal information required. Your conversations are never stored.',
  },
  {
    icon: UserCheck,
    title: 'Safe Platform',
    description: 'One-tap report and block. Our moderation systems keep the community safe.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Set your nickname',
    description: 'Choose how you want to be known. No real name needed.',
  },
  {
    number: '02',
    title: 'Get matched instantly',
    description: 'Our system pairs you with a random stranger in under a second.',
  },
  {
    number: '03',
    title: 'Chat freely',
    description: 'Talk about anything. Hit Next anytime to find someone new.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is Real Online Chat?',
    a: 'Real Online Chat is a free anonymous chat platform where you can instantly connect with strangers worldwide. No account required — just open the site and start chatting.',
  },
  {
    q: 'Is Real Online Chat free?',
    a: 'Yes, completely free. No subscriptions, no premium plans, no hidden costs. Every feature is available to everyone, forever.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed. You simply choose a nickname and optional preferences, then start chatting immediately.',
  },
  {
    q: 'Is anonymous chatting safe?',
    a: 'We take safety seriously. All connections are SSL encrypted, messages are never stored, and you can instantly report or block any user. Always use common sense and never share personal information.',
  },
  {
    q: 'Can I chat with people worldwide?',
    a: 'Absolutely. Real Online Chat connects you with people from countries all around the world. You can also filter by interests to find like-minded people.',
  },
];

/* ─── Component ───────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const [onlineCount, setOnlineCount] = useState(0);
  const [visible, setVisible] = useState(false);
  // Simulated social proof counters (augmented with live socket data)
  const [countriesCount] = useState(142);
  const [messagesCount, setMessagesCount] = useState(28_430);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();
    socket.on('online_count', ({ count }: { count: number }) => setOnlineCount(count));
    const t = setTimeout(() => setVisible(true), 80);

    // Simulate messages ticking up
    const msgTimer = setInterval(() => {
      setMessagesCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);

    return () => {
      clearTimeout(t);
      clearInterval(msgTimer);
      socket.off('online_count');
    };
  }, []);

  const handleStart = () => router.push('/chat');

  return (
    <>
      {/* ─── JSON-LD ─── */}
      <WebSiteSchema />
      <WebApplicationSchema />
      <OrganizationSchema />
      <FAQSchema />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://realonlinechat.com' },
        { name: 'Start Chat', url: 'https://realonlinechat.com/chat' },
      ]} />

      <div className="min-h-screen bg-background grid-lines overflow-x-hidden">
        {/* Ambient glow */}
        <div
          className="fixed top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.018) 0%, transparent 65%)' }}
          aria-hidden
        />

        {/* ─── Nav ─── */}
        <nav className="sticky top-0 z-30 border-b border-[#111111] bg-black/85 backdrop-blur-xl" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Logo variant="full" height={28} />

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-1.5 text-sm text-text-tertiary hover:text-text-primary rounded-md hover:bg-[#0d0d0d] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5" role="status" aria-live="polite">
                <div className="live-dot-ring" aria-hidden />
                <span className="text-xs font-mono text-text-tertiary tabular-nums">
                  {formatCount(onlineCount || 847)} online
                </span>
              </div>
              <button onClick={handleStart} className="btn btn-primary" aria-label="Start chatting">
                Start Chatting <ChevronRight size={13} aria-hidden />
              </button>
            </div>
          </div>
        </nav>

        {/* ─── Hero ─── */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4" aria-labelledby="hero-h1">
          <div className="max-w-4xl mx-auto text-center">
            {/* Live badge */}
            <div className={`inline-flex items-center gap-2 badge mb-7 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} role="status" aria-live="polite">
              <div className="live-dot live-dot-pulse" aria-hidden />
              <span>{formatCount(onlineCount || 847)} people chatting right now</span>
            </div>

            {/* H1 — SEO spec */}
            <h1
              id="hero-h1"
              className={`heading-display text-4xl sm:text-5xl md:text-[64px] text-text-primary mb-5 leading-[1.06] text-balance transition-all duration-500 delay-75 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Online Chat — Connect Instantly<br className="hidden sm:block" />
              <span className="text-text-tertiary"> With People Worldwide</span>
            </h1>

            {/* Subheading — spec exact */}
            <p className={`text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8 text-balance transition-all duration-500 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Meet real people, start anonymous conversations, and discover new connections in seconds.
              <strong className="text-text-primary font-medium"> No signup required.</strong>
            </p>

            {/* CTA */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 transition-all duration-500 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={handleStart}
                className="btn btn-primary btn-primary-lg group w-full sm:w-auto"
                aria-label="Start Chatting — free and anonymous"
              >
                Start Chatting
                <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
              </button>
              <Link href="#features" className="btn btn-secondary w-full sm:w-auto" style={{ height: '44px', padding: '0 20px', fontSize: '14px' }}>
                Learn more
              </Link>
              <Link href="/rooms" className="btn btn-secondary w-full sm:w-auto" style={{ height: '44px', padding: '0 20px', fontSize: '14px' }}>
                Browse Chat Rooms
              </Link>
            </div>

            {/* Trust indicators */}
            <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 transition-all duration-500 delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              {TRUST_INDICATORS.map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 8 8" fill="none" aria-hidden>
                    <path d="M1 4L3.2 6.2L7 2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs text-text-tertiary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Social proof stats ─── */}
        <section className="border-y border-[#0f0f0f] bg-[#030303]" aria-label="Platform statistics">
          <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-3 divide-x divide-[#0f0f0f]">
            {[
              {
                value: formatCount(onlineCount || 1000) + '+',
                label: 'Chatting right now',
                live: true,
              },
              {
                value: countriesCount + '+',
                label: 'Countries connected today',
                live: false,
              },
              {
                value: formatCount(messagesCount),
                label: 'Messages exchanged',
                live: true,
              },
            ].map(({ value, label, live }) => (
              <div key={label} className="stat-card border-0 rounded-none mx-0 py-4">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  {live && <div className="live-dot" style={{ width: 4, height: 4 }} aria-hidden />}
                  <span className="text-lg sm:text-xl font-semibold text-text-primary font-mono tracking-tight tabular-nums">
                    {value}
                  </span>
                </div>
                <div className="text-[11px] text-text-tertiary">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="py-20 px-4" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12 max-w-lg">
              <div className="badge mb-4"><Zap size={10} aria-hidden /> Features</div>
              <h2 id="features-heading" className="heading-display text-3xl sm:text-4xl text-text-primary mb-3">
                Everything you need,<br />nothing you don&apos;t.
              </h2>
              <p className="text-text-secondary text-base leading-relaxed">
                Built for real conversations — fast, private, and distraction-free.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="feature-card" role="listitem">
                  <div className="w-8 h-8 rounded-md bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center mb-5" aria-hidden>
                    <Icon size={15} className="text-text-secondary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2 tracking-tight">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section id="how-it-works" className="py-20 px-4 border-t border-[#0a0a0a]" aria-labelledby="how-heading">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="badge mb-4 mx-auto inline-flex">How it works</div>
              <h2 id="how-heading" className="heading-display text-3xl sm:text-4xl text-text-primary">
                Start chatting in 3 steps
              </h2>
            </div>
            <ol className="grid sm:grid-cols-3 gap-4 list-none">
              {STEPS.map(({ number, title, description }, i) => (
                <li key={number} className="relative panel p-6">
                  {i < 2 && (
                    <div className="hidden sm:block absolute top-8 right-0 translate-x-1/2 z-10" aria-hidden>
                      <ChevronRight size={14} className="text-[#1e1e1e]" />
                    </div>
                  )}
                  <div className="text-4xl font-mono font-bold text-[#151515] mb-4 leading-none" aria-hidden>{number}</div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Privacy callout ─── */}
        <section className="py-20 px-4 border-t border-[#0a0a0a]" aria-labelledby="privacy-heading">
          <div className="max-w-3xl mx-auto">
            <div className="gradient-border p-8 sm:p-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-6" aria-hidden>
                <Eye size={17} className="text-text-secondary" />
              </div>
              <h2 id="privacy-heading" className="heading-display text-2xl sm:text-3xl text-text-primary mb-4 text-balance">
                Your privacy is the product —<br className="hidden sm:block" />
                <span className="text-text-secondary">not the sacrifice.</span>
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
                Messages are never stored. We don&apos;t know who you are. Every conversation exists only in the moment.
              </p>
              <ul className="flex flex-wrap justify-center gap-2" aria-label="Privacy guarantees">
                {['No registration', 'No message storage', 'No tracking', 'SSL encrypted', 'Free forever'].map(badge => (
                  <li key={badge} className="badge list-none">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-[#22c55e]" aria-hidden>
                      <path d="M1 4L3.2 6.2L7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-20 px-4 border-t border-[#0a0a0a]" aria-labelledby="faq-heading">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="badge mb-4 mx-auto inline-flex">FAQ</div>
              <h2 id="faq-heading" className="heading-display text-3xl sm:text-4xl text-text-primary">
                Common questions
              </h2>
            </div>

            <div className="space-y-0" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_ITEMS.map(({ q, a }, i) => (
                <div
                  key={q}
                  className={`py-5 ${i > 0 ? 'border-t border-[#0f0f0f]' : ''}`}
                  itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                >
                  <h3 className="text-sm font-semibold text-text-primary mb-2" itemProp="name">{q}</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="text-sm text-text-secondary leading-relaxed" itemProp="text">{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24 px-4 border-t border-[#0a0a0a]" aria-labelledby="cta-heading">
          <div className="max-w-2xl mx-auto text-center">
            <h2 id="cta-heading" className="heading-display text-4xl sm:text-5xl text-text-primary mb-4 text-balance">
              Ready for a real conversation?
            </h2>
            <p className="text-text-secondary mb-8 text-balance">
              {formatCount(onlineCount || 1200)} people are chatting right now. Join them.
            </p>
            <button onClick={handleStart} className="btn btn-primary btn-primary-lg group" aria-label="Start free chat now">
              Start Chatting — It&apos;s Free
              <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
            </button>
            <p className="text-xs text-text-tertiary mt-4">No signup · No downloads · Works on any device</p>
          </div>
        </section>

        {/* ─── SEO Content ─── */}
        <SeoContent />

        {/* ─── Footer ─── */}
        <footer className="border-t border-[#0a0a0a] bg-[#020202]" role="contentinfo">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo variant="full" height={28} />
            <nav aria-label="Footer navigation">
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">Terms of Service</Link>
                <Link href="/chat" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">Start Chat</Link>
              </div>
            </nav>
            <p className="text-xs text-[#222222]">© {new Date().getFullYear()} realonlinechat.com</p>
          </div>
        </footer>
      </div>
    </>
  );
}
