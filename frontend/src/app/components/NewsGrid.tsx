'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Article {
  id: number;
  title: string;
  type: string;
  image_url?: string;
  published_at: string;
  author?: string;
  content: string;
}

interface NewsGridProps {
  mainArticle: Article | null;
  initialArticles: Article[];
  totalArticles: number;
  pageSize?: number;
}

export default function NewsGrid(props: NewsGridProps) {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-gray-100 rounded-sm">Cargando noticias...</div>}>
      <NewsGridContent {...props} />
    </Suspense>
  );
}

function NewsGridContent({ mainArticle, initialArticles, totalArticles, pageSize = 8 }: NewsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get('p') || '1');

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync with URL on mount or back navigation
  useEffect(() => {
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
      fetchArticles(pageFromUrl, false);
    }
  }, [pageFromUrl]);

  // Detect mobile view and prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate total pages:
  // Page 1: 1 featured + 4 secondary (Total 5)
  // Remaining items = totalArticles - 5
  // totalPages = 1 + Math.ceil(Math.max(0, totalArticles - 5) / pageSize)
  const totalPages = 1 + Math.ceil(Math.max(0, totalArticles - 5) / pageSize);

  const fetchArticles = async (page: number, append = false) => {
    setLoading(true);
    try {
      // Offset calculation for "DAgendaNG":
      // Page 1: skip 1 (featured), limit 4 (already passed in initialArticles)
      // Page 2: skip 5 (1 featured + 4 from page 1), limit 8
      // Page 3: skip 13 (5 + 8), limit 8
      // General formula for page > 1: skip = 5 + (page - 2) * pageSize
      const skip = page === 1 ? 1 : 5 + (page - 2) * pageSize;
      const limit = page === 1 ? 4 : pageSize;
      
      const res = await fetch(`/api/articles/?status=published&skip=${skip}&limit=${limit}`);
      const data = await res.json();
      
      if (append) {
        setArticles(prev => [...prev, ...data]);
      } else {
        setArticles(data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('p', newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });

    if (newPage === 1) {
      setArticles(initialArticles);
      setCurrentPage(1);
    } else {
      setCurrentPage(newPage);
      fetchArticles(newPage, false);
    }
    // Scroll to top of grid
    document.getElementById('news-grid-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchArticles(nextPage, true);
  };

  return (
    <div className="space-y-8">
      <div id="news-grid-start" className="scroll-mt-20"></div>

      {/* featured article - Only on Page 1 */}
      {currentPage === 1 && (
        <>
          {mainArticle ? (
            <Link href={`/noticias/${mainArticle.id}`} className="group cursor-pointer block">
              <article>
                <div className="w-full aspect-video bg-gray-300 mb-4 relative overflow-hidden flex items-center justify-center">
                  {mainArticle.image_url ? (
                    <img 
                      src={mainArticle.image_url} 
                      alt={mainArticle.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-gray-400">Sin Imagen</span>
                  )}
                  <div className="absolute inset-0 bg-dr-blue/10 group-hover:bg-transparent transition duration-300"></div>
                </div>
                <span className="text-dr-red font-bold uppercase text-xs tracking-wider">{mainArticle.type}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 leading-tight text-foreground group-hover:text-dr-red transition-colors">
                  {mainArticle.title}
                </h2>
                
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-serif italic text-lg text-foreground/90">
                    Escrito por <span className="font-bold not-italic border-b border-dr-red/30 pb-0.5 hover:border-dr-red transition-all cursor-default">{mainArticle.author || "Redacción DAgendaNG"}</span>
                  </span>
                  
                  <span className="hidden md:inline text-gray-200">—</span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Publicado el</span>
                    <time className="font-sans text-sm font-semibold text-foreground/70">
                      {isMounted ? new Date(mainArticle.published_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </time>
                  </div>
                </div>
              </article>
            </Link>
          ) : (
            <article className="group cursor-pointer">
              <div className="w-full aspect-video bg-muted mb-4 relative overflow-hidden flex items-center justify-center text-muted-foreground">
                No hay noticias publicadas
              </div>
            </article>
          )}
          <hr className="border-gray-100 my-8" />
        </>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Link href={`/noticias/${article.id}`} key={article.id} className="group cursor-pointer block">
            <article>
              <div className="w-full aspect-video bg-muted mb-3 overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                {article.image_url ? (
                  <img 
                    src={article.image_url} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Sin Imagen</span>
                )}
              </div>
              <span className="text-dr-red font-bold uppercase text-[10px] tracking-widest">{article.type}</span>
              <h3 className="text-xl font-serif font-bold mt-2 leading-snug group-hover:text-dr-red transition-colors">
                {article.title}
              </h3>
            </article>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pt-8 border-t border-gray-100 flex justify-center">
        {isMobile ? (
          // Mobile: Load More button
          currentPage < totalPages && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full md:w-auto bg-dr-blue text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  CARGANDO...
                </>
              ) : (
                'VER MÁS NOTICIAS'
              )}
            </button>
          )
        ) : (
          // Desktop: Paging numbers
          totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-all"
              >
                &larr;
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first, last, and pages around current
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded transition-all font-bold ${
                        currentPage === pageNum 
                          ? 'bg-dr-blue text-white shadow-md' 
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-all"
              >
                &rarr;
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
