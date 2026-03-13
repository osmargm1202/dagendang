'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  type: string;
  image_url?: string;
  published_at: string;
}

interface NewsGridProps {
  initialArticles: Article[];
  totalArticles: number;
  pageSize?: number;
}

export default function NewsGrid({ initialArticles, totalArticles, pageSize = 10 }: NewsGridProps) {
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

  const totalPages = Math.ceil((totalArticles - 1) / pageSize); // -1 because first article is featured

  const fetchArticles = async (page: number, append = false) => {
    setLoading(true);
    try {
      // Offset skips the featured article (1) and then calculates based on page
      const skip = 1 + (page - 1) * pageSize;
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
