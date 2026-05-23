"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const IMAGE_PLACEHOLDER = "/images/news-placeholder.png";

interface Article {
  id?: number;
  documentId?: string;
  slug?: string;
  title: string;
  content: string;
  type: string;
  published_at: string;
  image_url: string | null;
  is_premium?: boolean;
}

function articleHref(article: Article) {
  const identifier = article.slug || article.documentId || article.id;
  return identifier ? `/noticias/${identifier}` : "#";
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      setPage(1);
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(query)}&page=1&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : []);
          setTotal(Number(res.headers.get("X-Total-Count") || 0));
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (query) {
      fetchResults();
    } else {
      setArticles([]);
      setTotal(0);
      setIsLoading(false);
    }
  }, [query]);

  async function loadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/articles?search=${encodeURIComponent(query)}&page=${nextPage}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setArticles((current) => [...current, ...(Array.isArray(data) ? data : [])]);
        setTotal(Number(res.headers.get("X-Total-Count") || total));
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Search pagination error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-sm font-black text-dr-red uppercase tracking-[0.3em] mb-2">Búsqueda Global</h1>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {query ? `Resultados para: "${query}"` : "Ingresa un término para buscar"}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {isLoading ? "Buscando en el archivo..." : query ? `Encontramos ${total || articles.length} artículos coincidentes.` : ""}
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-sm mb-4"></div>
              <div className="h-6 bg-muted rounded-sm w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded-sm w-1/2"></div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article) => (
            <Link key={article.slug || article.documentId || article.id} href={articleHref(article)} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted mb-4 shadow-sm border border-border transition-all group-hover:shadow-md">
                <Image
                  src={article.image_url || IMAGE_PLACEHOLDER}
                  alt={article.image_url ? article.title : "Imagen no disponible"}
                  fill
                  sizes="(min-width: 1024px) 390px, (min-width: 768px) 50vw, calc(100vw - 32px)"
                  className="object-contain transition-transform duration-500 grayscale-[0.2] group-hover:grayscale-0"
                />
                {article.is_premium && (
                  <span className="absolute left-2 top-2 rounded-sm bg-yellow-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-sm">
                    PREMIUM
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-dr-red uppercase tracking-widest">{article.type}</span>
                {article.is_premium && (
                  <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-sm">PREMIUM</span>
                )}
              </div>
              <h3 className="text-xl font-serif font-bold leading-tight text-[#001e40] dark:text-white group-hover:text-secondary transition-colors mb-3">
                {article.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                {article.content}
              </p>
              <time className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                {new Date(article.published_at).toLocaleDateString("es-DO", { 
                  day: "numeric", 
                  month: "short", 
                  year: "numeric" 
                })}
              </time>
            </Link>
          ))}
          {articles.length < total && (
            <div className="col-span-full flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-dr-blue text-white rounded-sm font-black uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {isLoadingMore ? "Cargando..." : "Ver más resultados"}
              </button>
            </div>
          )}
        </div>
      ) : query ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border">
          <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-bold text-muted-foreground">No encontramos nada para &quot;{query}&quot;</h3>
          <p className="text-muted-foreground/70 mt-2">Intenta buscar con otros términos o temas.</p>
          <Link href="/" className="inline-block mt-8 text-xs font-black text-dr-blue border-b-2 border-dr-blue/30 pb-1 hover:border-dr-blue transition-all">
            VOLVER A PORTADA
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black tracking-widest animate-pulse">CARGANDO ARCHIVO...</div>}>
      <SearchResults />
    </Suspense>
  );
}
