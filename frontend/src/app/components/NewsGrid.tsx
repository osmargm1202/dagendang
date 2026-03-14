'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function NewsGrid({ mainArticle, initialArticles, totalArticles, pageSize = 8 }: NewsGridProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate total pages accounting for page 1 (4 items) and subsequent pages (pageSize/6 items)
  // Total of secondary articles = totalArticles - 1 (featured)
  // First page takes 4. Remaining = (totalArticles - 1) - 4 = totalArticles - 5
  // totalPages = 1 + Math.ceil(Math.max(0, totalArticles - 5) / pageSize)
  const totalPages = 1 + Math.ceil(Math.max(0, totalArticles - 5) / pageSize);

  const fetchArticles = async (page: number, append = false) => {
    setLoading(true);
    try {
      // Offset calculation:
      // Page 1: skip 1 (featured article), limit 4 (passed as initialArticles)
      // Page 2: skip 1 + 4 = 5, limit 6
      // Page 3: skip 1 + 4 + 6 = 11, limit 6
      // Formula: skip = 5 + (page - 2) * pageSize for page > 1
      const skip = page === 1 ? 1 : 5 + (page - 2) * pageSize;
      const res = await fetch(`/api/articles/?status=published&skip=${skip}&limit=${pageSize}`);
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
    setCurrentPage(newPage);
    fetchArticles(newPage, false);
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
                      src={mainArticle.image_url.startsWith('http') ? mainArticle.image_url : `https://diariodigital.delioserver.duckdns.org${mainArticle.image_url}`} 
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
                <div className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  {/* We use div for content snippet to avoid p-within-p issues if any */}
                  {mainArticle.title.length < 50 ? mainArticle.title : mainArticle.title.substring(0, 150) + "..."}
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-foreground/80">Por {mainArticle.author || "Redacción"}</span>
                  <span>&bull;</span>
                  <span>{new Date(mainArticle.published_at).toLocaleDateString()}</span>
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
          <hr className="border-border" />
        </>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Link href={`/noticias/${article.id}`} key={article.id} className="group cursor-pointer block">
            <article>
              <div className="w-full aspect-video bg-muted mb-3 overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                {article.image_url ? (
                  <img 
                    src={article.image_url.startsWith('http') ? article.image_url : `https://diariodigital.delioserver.duckdns.org${article.image_url}`} 
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
