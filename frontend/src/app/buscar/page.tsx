"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  content: string;
  type: string;
  published_at: string;
  image_url: string;
  is_premium: boolean;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(query)}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
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
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-sm font-black text-dr-red uppercase tracking-[0.3em] mb-2">Búsqueda Global</h1>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {query ? `Resultados para: "${query}"` : "Ingresa un término para buscar"}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {isLoading ? "Buscando en el archivo..." : query ? `Encontramos ${articles.length} artículos coincidentes.` : ""}
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
            <Link key={article.id} href={`/noticias/${article.id}`} className="group block">
              <div className="aspect-[16/10] overflow-hidden rounded-sm bg-muted mb-4 shadow-sm border border-border transition-all group-hover:shadow-md">
                <img 
                  src={article.image_url?.startsWith('http') ? article.image_url : `https://dagendang.com${article.image_url}`} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-dr-red uppercase tracking-widest">{article.type}</span>
                {article.is_premium && (
                  <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-sm">PREMIUM</span>
                )}
              </div>
              <h3 className="text-xl font-serif font-bold leading-tight text-foreground group-hover:text-dr-blue transition-colors mb-3">
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
        </div>
      ) : query ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border">
          <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-bold text-muted-foreground">No encontramos nada para "{query}"</h3>
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
