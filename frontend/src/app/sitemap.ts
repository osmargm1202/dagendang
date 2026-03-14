import { MetadataRoute } from 'next';

const BASE_URL = 'https://diariodigital.delioserver.duckdns.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
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

  // 2. Dynamic Categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://backend:8000/api/articles/categories');
    if (res.ok) {
      const categories = await res.json();
      categoryRoutes = categories.map((cat: any) => ({
        url: `${BASE_URL}/categoria/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Error fetching categories", error);
  }

  // 3. Dynamic Articles (all published)
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    // Fetch all published articles (limit 1000 for safety)
    const res = await fetch('http://backend:8000/api/articles/?status=published&limit=1000');
    if (res.ok) {
      const articles = await res.json();
      articleRoutes = articles.map((article: any) => ({
        url: `${BASE_URL}/noticias/${article.id}`,
        lastModified: new Date(article.published_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Error fetching articles", error);
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
