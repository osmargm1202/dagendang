import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dagendang.com';

export async function GET() {
  let articles = [];
  try {
    // Fetch recent articles (last 48 hours roughly, but we'll fetch last 50 for safety)
    const res = await fetch('http://backend:8000/api/articles/?status=published&limit=50', { cache: 'no-store' });
    if (res.ok) {
      const allArticles = await res.json();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      articles = allArticles.filter((a: any) => new Date(a.published_at) >= twoDaysAgo);
    }
  } catch (error) {
    console.error("News Sitemap Error:", error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${articles.map((article: any) => `
    <url>
      <loc>${BASE_URL}/noticias/${article.id}</loc>
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
    return unsafe.replace(/[<>&"']/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
        }
        return c;
    });
}
