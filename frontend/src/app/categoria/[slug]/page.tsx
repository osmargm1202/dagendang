import Link from "next/link";
import { notFound } from "next/navigation";
import AdBanner from "@/app/components/AdBanner";
import type { Metadata } from 'next';

const BASE_URL = 'https://diariodigital.delioserver.duckdns.org';

// Always fetch fresh data dynamically
export const dynamic = 'force-dynamic';

async function getCategoryArticles(slug: string) {
  try {
    const res = await fetch(`http://backend:8000/api/articles/?status=published&type=${slug}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error('Failed to fetch articles');
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `${categoryName} | La Agenda`,
    description: `Noticias de última hora e información económica sobre ${categoryName} en República Dominicana.`,
    alternates: {
      canonical: `${BASE_URL}/categoria/${slug}`,
    },
    openGraph: {
      title: `${categoryName} | La Agenda`,
      description: `Sigue las últimas noticias de ${categoryName}.`,
      url: `${BASE_URL}/categoria/${slug}`,
      locale: 'es_DO',
      type: 'website',
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = await getCategoryArticles(slug);
  
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <AdBanner position="header" className="mb-10" />
      {/* Breadcrumb & Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-widest text-dr-blue dark:text-blue-400 uppercase border-b-2 border-dr-red pb-4 inline-block">
          {categoryName}
        </h1>
        <p className="mt-4 text-muted-foreground font-sans tracking-wide">Últimas noticias en {categoryName}</p>
      </header>

      {/* Grid de Noticias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.length > 0 ? (
          articles.map((article: any) => (
            <Link href={`/noticias/${article.id}`} key={article.id} className="group cursor-pointer block">
              <article>
                <div className="w-full aspect-video bg-gray-200 mb-3 overflow-hidden flex items-center justify-center rounded-sm shadow-sm">
                  {article.image_url ? (
                     <img src={article.image_url.startsWith('http') ? article.image_url : `https://diariodigital.delioserver.duckdns.org${article.image_url}`} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin Imagen</span>
                  )}
                </div>
                <span className="text-dr-red font-bold uppercase text-xs tracking-wider">{article.type}</span>
                <h3 className="text-xl font-serif font-bold mt-2 leading-snug text-foreground group-hover:text-dr-blue transition-colors">
                  {article.title}
                </h3>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-muted-foreground text-lg">
            No hay noticias publicadas en esta categoría aún.
          </div>
        )}
      </div>
    </div>
  );
}
