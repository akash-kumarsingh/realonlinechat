import { MetadataRoute } from 'next';

const SITE_URL = 'https://realonlinechat.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/rooms',
          '/rooms/',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/api/',
          '/chat',          // no indexing of live chat sessions
          '/rooms/*',       // room sessions — only the browser page is indexed
          '/_next/',
          '/admin/',
        ],
      },
      // Block AI scrapers from live chat routes
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/chat', '/rooms/*'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
