import Link from "next/link";
import { notFound } from "next/navigation";
import PremiumContentWrapper from "@/app/components/PremiumContentWrapper";
import AdBanner from "@/app/components/AdBanner";
import AdGuard from "@/app/components/AdGuard";
import SocialShare from "@/app/components/SocialShare";
import CommentsSection from "@/app/components/CommentsSection";
import DailyChallengeCard from "@/app/components/DailyChallengeCard";
import EconomyIndicators from "@/app/components/EconomyIndicators";
import TonyColumnCard from "@/app/components/TonyColumnCard";
import { getActivePoll, getArticleBySlugOrId, getLatestTonyOpinion } from "@/app/lib/content";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dagendang.com";

// Always fetch fresh data dynamically
export const dynamic = "force-dynamic";

async function getArticle(id: string) {
  return getArticleBySlugOrId(id);
}

async function getExchangeRates() {
  try {
    const res = await fetch("http://backend:8000/api/economy/exchange-rate/latest", { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching rates:", error);
    return null;
  }
}

async function getFuelPrices() {
  try {
    const res = await fetch("http://backend:8000/api/economy/fuel-prices/latest", { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return null;
  }
}

async function getRelatedArticles(type: string, excludeId: string) {
  try {
    const res = await fetch(`http://backend:8000/api/articles/?type=${type}&limit=4`, { cache: "no-store" });
    if (!res.ok) return [];
    const articles = await res.json();
    return Array.isArray(articles) ? articles.filter((article: { id?: number | string }) => article.id?.toString() !== excludeId).slice(0, 3) : [];
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

async function getAdjacentNavigation(publishedAt: string) {
  try {
    // Next article (published AFTER current)
    const nextRes = await fetch(`http://backend:8000/api/articles/?status=published&published_after=${encodeURIComponent(publishedAt)}&limit=1`, { cache: "no-store" });
    const nextList = nextRes.ok ? await nextRes.json() : [];

    // Previous article (published BEFORE current)
    const prevRes = await fetch(`http://backend:8000/api/articles/?status=published&published_before=${encodeURIComponent(publishedAt)}&limit=1`, { cache: "no-store" });
    const prevList = prevRes.ok ? await prevRes.json() : [];

    return {
      next: nextList.length > 0 ? nextList[0] : null,
      prev: prevList.length > 0 ? prevList[0] : null,
    };
  } catch (error) {
    console.error("Error fetching navigation articles:", error);
    return { next: null, prev: null };
  }
}

function absoluteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return `${BASE_URL}/logo.png`;
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return { title: "Nota no encontrada | DAgendaNG" };

  const snippet = `${article.content.substring(0, 160).replace(/\s+/g, " ").trim()}...`;
  const imageUrl = absoluteUrl(article.image_url);

  return {
    title: `${article.title} | DAgendaNG`,
    description: snippet,
    alternates: {
      canonical: `${BASE_URL}/noticias/${id}`,
    },
    openGraph: {
      title: article.title,
      description: snippet,
      url: `${BASE_URL}/noticias/${id}`,
      siteName: "DAgendaNG",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: "es_DO",
      type: "article",
      publishedTime: article.published_at,
      authors: [article.author || "DAgendaNG"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: snippet,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, poll, tonyOpinion, rates, fuel] = await Promise.all([
    getArticle(id),
    getActivePoll(),
    getLatestTonyOpinion(),
    getExchangeRates(),
    getFuelPrices(),
  ]);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.type, String(article.id || id));
  const navigation = await getAdjacentNavigation(article.published_at);
  const articleUrl = `${BASE_URL}/noticias/${id}`;
  const imageUrl = absoluteUrl(article.image_url);
  const commentArticleId = article.id ?? Number(id);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: `${article.content.substring(0, 160).replace(/\s+/g, " ").trim()}...`,
            image: [imageUrl],
            datePublished: article.published_at,
            dateModified: article.published_at,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": articleUrl,
            },
            articleSection: article.type,
            author: [
              {
                "@type": "Person",
                name: article.author || "DAgendaNG",
                url: BASE_URL,
              },
            ],
            publisher: {
              "@type": "Organization",
              name: "DAgendaNG",
              logo: {
                "@type": "ImageObject",
                url: `${BASE_URL}/logo.png`,
              },
            },
          }),
        }}
      />

      <article className="lg:col-span-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors text-muted-foreground">Volver al Inicio</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-secondary dark:text-secondary-fixed-dim font-semibold uppercase">{article.type}</span>
          {article.is_premium && (
            <span className="ml-3 px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded-sm">PREMIUM</span>
          )}
        </nav>

        {/* Main Article Image */}
        {article.image_url ? (
          <div className="w-full aspect-video bg-muted mb-8 overflow-hidden border border-border-light dark:border-border-dark">
            {/* eslint-disable-next-line @next/next/no-img-element -- Project still uses raw image tags until Next remote image config is implemented. */}
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted mb-8 flex items-center justify-center border border-border-light dark:border-border-dark">
            <span className="text-muted-foreground">Sin Imagen</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-8 overflow-hidden">
          <span className="bg-secondary text-white font-black uppercase text-[10px] tracking-[0.2em] px-3 py-1 inline-block mb-6">
            {article.type}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary dark:text-white leading-tight mb-4">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl text-on-surface-variant dark:text-surface-variant leading-relaxed mb-6">{article.subtitle}</p>
          )}

          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-y-3 text-muted-foreground pt-2 border-t border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-lg text-foreground/90">
                Escrito por <span className="font-bold not-italic border-b border-secondary/30 pb-0.5">{article.author || "Redacción DAgendaNG"}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Publicado el</span>
              <time className="font-sans text-sm font-semibold text-foreground/70" dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })}
              </time>
              <span className="text-gray-300 mx-1">|</span>
              <time className="font-sans text-sm font-bold text-primary/70" dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
          </div>
        </header>

        {/* Article Content with Premium logic and In-Content Ads */}
        <PremiumContentWrapper content={article.content} isPremium={Boolean(article.is_premium)} />

        <SocialShare title={article.title} url={articleUrl} />

        {Number.isFinite(commentArticleId) && <CommentsSection articleId={commentArticleId} />}

        {/* Publicidad Central (Solo para noticias no premium) */}
        {!article.is_premium && (
          <AdGuard>
            <div className="mt-8">
              <AdBanner position="content_middle" className="mb-8" />
            </div>
          </AdGuard>
        )}

        {/* RELATED NEWS SECTION */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border-light dark:border-border-dark">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter uppercase">
                <span className="w-8 h-1 bg-secondary"></span>
                Noticias Relacionadas
              </h3>

              {/* Navigation Arrows */}
              <div className="flex gap-2">
                {navigation.prev && (
                  <Link
                    href={`/noticias/${navigation.prev.id}`}
                    className="p-2 border border-border hover:bg-primary hover:text-white transition-colors rounded-sm"
                    title="Anterior"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                  </Link>
                )}
                {navigation.next && (
                  <Link
                    href={`/noticias/${navigation.next.id}`}
                    className="p-2 border border-border hover:bg-primary hover:text-white transition-colors rounded-sm"
                    title="Siguiente"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel: { id: number | string; image_url?: string; title: string; type: string }) => (
                <Link key={rel.id} href={`/noticias/${rel.id}`} className="group space-y-3">
                  <div className="aspect-video bg-muted overflow-hidden border border-border-light dark:border-border-dark">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Project still uses raw image tags until Next remote image config is implemented. */}
                    <img
                      src={rel.image_url || "/logo.png"}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest">{rel.type}</span>
                  <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <aside className="lg:col-span-4 flex flex-col gap-8">
        <TonyColumnCard opinion={tonyOpinion} />
        <DailyChallengeCard poll={poll} />
        <AdGuard>
          <AdBanner position="article_sidebar" />
        </AdGuard>
        <EconomyIndicators initialRates={rates} initialFuel={fuel} />
      </aside>
    </div>
  );
}
