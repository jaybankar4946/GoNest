import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/auth', '/api/', '/saved-searches'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin', '/dashboard', '/auth', '/api/', '/saved-searches'] },
    ],
    sitemap: 'https://gonest.in/sitemap.xml',
    host: 'https://gonest.in',
  };
}
