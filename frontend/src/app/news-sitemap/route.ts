import { getHomepageArticles, type Article } from '@/app/lib/content';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dagendang.com';

function articleRouteId(article: { id?: number | string; slug?: string; documentId?: string }) {
  return article.slug || article.documentId || article.id;
}

export async function GET() {
  let articles: Article[] = [];
  try {
    const allArticles = await getHomepageArticles();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    articles = allArticles.filter((article) => new Date(article.published_at) >= twoDaysAgo);
  } catch (error) {
    console.error('News Sitemap Error:', error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${articles.map((article) => `
    <url>
      <loc>${BASE_URL}/noticias/${articleRouteId(article)}</loc>
      <news:news>
        <news:publication>
          <news:name>DAgendaNG</news:name>
          <news:language>es</news:language>
        </news:publication>
        <news:publication_date>${new Date(article.published_at).toISOString()}</news:publication_date>
        <news:title>${escapeXml(article.title)}</news:title>
      </news:news>
    </url>
  `).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return char;
    }
  });
}
