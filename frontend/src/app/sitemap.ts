import { getCategories, getHomepageArticles } from '@/app/lib/content';
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dagendang.com';

function articleRouteId(article: { id?: number | string; slug?: string; documentId?: string }) {
  return article.slug || article.documentId || article.id;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${BASE_URL}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const [categories, articles] = await Promise.all([
    getCategories().catch((error) => {
      console.error('Sitemap: Error fetching Strapi categories', error);
      return [];
    }),
    getHomepageArticles().catch((error) => {
      console.error('Sitemap: Error fetching Strapi articles', error);
      return [];
    }),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/categoria/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/noticias/${articleRouteId(article)}`,
    lastModified: new Date(article.published_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
