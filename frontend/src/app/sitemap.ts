import { MetadataRoute } from 'next';

const BASE_URL = 'https://diariodigital.delioserver.duckdns.org';

async function getArticles() {
  try {
    const res = await fetch('http://backend:8000/api/articles/?status=published', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  
  const articleEntries: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: `${BASE_URL}/noticias/${article.id}`,
    lastModified: new Date(article.published_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categories = ['economia', 'nacional', 'empresas', 'mercados', 'opinion', 'turismo'];
  const categoryEntries: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${BASE_URL}/categoria/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...categoryEntries,
    ...articleEntries,
  ];
}
