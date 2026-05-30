import Link from "next/link";
import AdBanner from "@/app/components/AdBanner";
import ArticleThumbnail from "@/app/components/ArticleThumbnail";
import type { Metadata } from "next";
import { getArticlesByCategoryPage, getCategories } from "@/app/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dagendang.com";

export const dynamic = "force-dynamic";

type CategoryLike = { slug: string; name: string };

function categoryFallbackName(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getCategoryData(slug: string, page: number, search: string) {
  const [articlePage, categories] = await Promise.all([getArticlesByCategoryPage(slug, page, 12, search), getCategories()]);
  const category = categories.find((item) => item.slug === slug);
  const categoryName = category?.name || categoryFallbackName(slug);

  return { articlePage, categories, categoryName };
}

function categoryPageHref(slug: string, page: number, search: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("q", search);
  const query = params.toString();
  return `/categoria/${slug}${query ? `?${query}` : ""}`;
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

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; q?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const currentPage = Math.max(1, Number(query.page) || 1);
  const search = (query.q || "").trim();
  const { articlePage, categoryName } = await getCategoryData(slug, currentPage, search);
  const { articles, total, page, pageCount } = articlePage;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16">
      <AdBanner position="header" className="mb-10" />

      <header className="mb-10 text-center">
        <span className="block text-secondary dark:text-secondary-fixed-dim text-xs font-black uppercase tracking-[0.3em] mb-2">Categoría</span>
        <h1 className="mt-1 text-4xl md:text-5xl font-serif font-black tracking-tight text-[#001e40] dark:text-white border-b-2 border-secondary pb-4 block max-w-fit mx-auto">
          {categoryName}
        </h1>
        <p className="mt-4 text-muted-foreground font-sans tracking-wide">
          {search ? `Resultados para “${search}” en ${categoryName}` : `Últimas noticias en ${categoryName}`}
        </p>
      </header>

      <form action={`/categoria/${slug}`} className="mb-8 grid gap-3 rounded-sm border border-border bg-card p-4 md:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="category-search">Buscar en {categoryName}</label>
        <input
          id="category-search"
          name="q"
          type="search"
          defaultValue={search}
          placeholder={`Buscar dentro de ${categoryName}`}
          className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-secondary"
        />
        <button type="submit" className="rounded-sm bg-secondary px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90">
          Buscar
        </button>
      </form>

      <div className="mb-6 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>{total} noticia{total === 1 ? "" : "s"}{search ? ` encontrada${total === 1 ? "" : "s"}` : ""}</span>
        {search && (
          <Link href={`/categoria/${slug}`} className="font-bold text-secondary hover:underline">
            Limpiar búsqueda
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link href={`/noticias/${article.slug || article.documentId || article.id}`} key={article.documentId || article.id} className="group cursor-pointer block">
              <article className="border border-border bg-card p-3 h-full">
                <ArticleThumbnail
                  imageUrl={article.image_url}
                  title={article.title}
                  isPremium={article.is_premium}
                  sizes="(min-width: 1024px) 390px, (min-width: 768px) 50vw, calc(100vw - 40px)"
                  className="mb-3"
                />
                <span className="text-secondary dark:text-secondary-fixed-dim font-bold uppercase text-xs tracking-wider">{article.type}</span>
                <h3 className="text-xl font-serif font-bold mt-2 leading-snug text-[#001e40] dark:text-white group-hover:text-secondary transition-colors">
                  {article.title}
                </h3>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span>{new Date(article.published_at).toLocaleDateString("es-DO")}</span>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-muted-foreground text-lg border border-border bg-card">
            No hay noticias publicadas en esta categoría aún.
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row" aria-label="Paginación de categoría">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Página {page} de {pageCount}
          </span>
          <div className="flex gap-3">
            {page > 1 && (
              <Link href={categoryPageHref(slug, page - 1, search)} className="rounded-sm border border-border px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-muted">
                Anterior
              </Link>
            )}
            {page < pageCount && (
              <Link href={categoryPageHref(slug, page + 1, search)} className="rounded-sm bg-secondary px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90">
                Siguiente
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
