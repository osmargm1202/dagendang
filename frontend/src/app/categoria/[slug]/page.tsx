import Link from "next/link";
import AdBanner from "@/app/components/AdBanner";
import type { Metadata } from "next";
import { getArticlesByCategory, getCategories } from "@/app/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dagendang.com";

export const dynamic = "force-dynamic";

type CategoryLike = { slug: string; name: string };

function categoryFallbackName(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getCategoryData(slug: string) {
  const [articles, categories] = await Promise.all([getArticlesByCategory(slug), getCategories()]);
  const category = categories.find((item) => item.slug === slug);
  const categoryName = category?.name || categoryFallbackName(slug);

  return { articles, categories, categoryName };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories().catch((): CategoryLike[] => []);
  const category = categories.find((item) => item.slug === slug);
  const categoryName = category?.name || categoryFallbackName(slug);

  return {
    title: `${categoryName} | DAgendaNG`,
    description: `Noticias de última hora e información económica sobre ${categoryName} en República Dominicana.`,
    alternates: {
      canonical: `${BASE_URL}/categoria/${slug}`,
    },
    openGraph: {
      title: `${categoryName} | DAgendaNG`,
      description: `Sigue las últimas noticias de ${categoryName}.`,
      url: `${BASE_URL}/categoria/${slug}`,
      locale: "es_DO",
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { articles, categoryName } = await getCategoryData(slug);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16">
      <AdBanner position="header" className="mb-10" />

      <header className="mb-10 text-center">
        <span className="text-secondary dark:text-secondary-fixed-dim text-xs font-black uppercase tracking-[0.3em]">Categoría</span>
        <h1 className="mt-3 text-4xl md:text-5xl font-serif font-black tracking-tight text-primary dark:text-primary-fixed-dim uppercase border-b-2 border-secondary pb-4 inline-block">
          {categoryName}
        </h1>
        <p className="mt-4 text-muted-foreground font-sans tracking-wide">Últimas noticias en {categoryName}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link href={`/noticias/${article.slug || article.documentId || article.id}`} key={article.documentId || article.id} className="group cursor-pointer block">
              <article className="border border-slate-200 dark:border-border-dark bg-white dark:bg-dark-surface p-3 h-full">
                <div className="w-full aspect-video bg-muted mb-3 overflow-hidden flex items-center justify-center">
                  {article.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Strapi/S3 image URLs are already optimized by media formats.
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin Imagen</span>
                  )}
                </div>
                <span className="text-secondary dark:text-secondary-fixed-dim font-bold uppercase text-xs tracking-wider">{article.type}</span>
                <h3 className="text-xl font-serif font-bold mt-2 leading-snug text-primary dark:text-white group-hover:text-secondary transition-colors">
                  {article.title}
                </h3>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span>{new Date(article.published_at).toLocaleDateString("es-DO")}</span>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-muted-foreground text-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-dark-surface">
            No hay noticias publicadas en esta categoría aún.
          </div>
        )}
      </div>
    </div>
  );
}
