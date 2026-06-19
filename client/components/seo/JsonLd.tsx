/**
 * JSON-LD Structured Data — Real Online Chat
 * Schemas: WebSite, Organization, WebApplication, FAQPage, BreadcrumbList
 */

const SITE_URL = 'https://realonlinechat.com';
const BRAND    = 'Real Online Chat';

function Schema({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

/* ─── WebSite ─────────────────────────────────────────────── */
export function WebSiteSchema() {
  return (
    <Schema data={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: BRAND,
      alternateName: ['ROC', 'realonlinechat.com'],
      url: SITE_URL,
      description: 'Free real-time online chat. Connect with people worldwide instantly — no sign-up required.',
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/rooms`,
        },
        'query-input': 'required name=search_term_string',
      },
    }} />
  );
}

/* ─── Organization ────────────────────────────────────────── */
export function OrganizationSchema() {
  return (
    <Schema data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: BRAND,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
        width: 260,
        height: 48,
      },
      sameAs: [
        'https://twitter.com/realonlinechat',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['English'],
      },
    }} />
  );
}

/* ─── WebApplication ──────────────────────────────────────── */
export function WebApplicationSchema() {
  return (
    <Schema data={{
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapplication`,
      name: BRAND,
      url: SITE_URL,
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description: 'Free anonymous online chat platform. Connect with strangers worldwide via 1-on-1 chat or topic-based chat rooms.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      featureList: [
        'Anonymous 1-on-1 chat',
        '12 topic-based chat rooms',
        'No signup required',
        'Real-time messaging',
        'Interest matching',
        'Mobile friendly',
      ],
      screenshot: `${SITE_URL}/og-image.jpg`,
    }} />
  );
}

/* ─── FAQPage ─────────────────────────────────────────────── */
export function FAQSchema() {
  const faqs = [
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
      a: 'No account needed. Simply choose a nickname and optional preferences, then start chatting immediately.',
    },
    {
      q: 'Is anonymous chatting safe?',
      a: 'All connections are SSL encrypted, messages are never stored, and you can instantly report or block any user. Never share personal information.',
    },
    {
      q: 'Can I chat with people worldwide?',
      a: 'Yes. Real Online Chat connects you with people from countries around the world. You can also filter by interests to find like-minded people.',
    },
    {
      q: 'What are the chat rooms?',
      a: 'Chat rooms are public group chats organized by topic — Gaming, Music, Travel, Technology, Sports, Anime, and more. Join any room instantly.',
    },
  ];

  return (
    <Schema data={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    }} />
  );
}

/* ─── BreadcrumbList ──────────────────────────────────────── */
export function BreadcrumbSchema({ items }: {
  items: { name: string; url: string }[];
}) {
  return (
    <Schema data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    }} />
  );
}
