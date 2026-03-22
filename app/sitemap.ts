import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://vendly.cz'
  
  const staticPages = [
    '',
    '/inzeraty',
    '/prodat',
    '/prihlaseni',
    '/registrace',
    '/jak-to-funguje',
    '/pravni/obchodni-podminky',
    '/pravni/ochrana-osobnich-udaju',
    '/pravni/pravidla-trziste',
    '/pravni/platby-a-escrow',
    '/pravni/cookies',
  ]

  const categories = [
    'elektronika',
    'moda',
    'nabytek',
    'sport',
    'hracky',
    'knihy',
    'auto-moto',
    'domacnost',
  ]

  return [
    // Static pages
    ...staticPages.map(page => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    })),
    // Category pages
    ...categories.map(category => ({
      url: `${baseUrl}/inzeraty?kategorie=${category}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]
}
