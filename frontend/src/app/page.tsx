import AdBanner from "@/app/components/AdBanner";
import AdGuard from "@/app/components/AdGuard";
import DailyChallengeCard from "@/app/components/DailyChallengeCard";
import TonyColumnCard from "@/app/components/TonyColumnCard";
import type { Metadata } from 'next';
import NewsGrid from "@/app/components/NewsGrid";
import EconomyIndicators from "@/app/components/EconomyIndicators";
import { getActivePoll, getArticlesPage, getLatestTonyOpinion } from "@/app/lib/content";
import { getExchangeRateData, getFuelPriceData } from "@/app/lib/economy";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dagendang.com';

export const metadata: Metadata = {
  title: 'DAgendaNG | De Agenda con Nelson Gómez - Diario Digital Económico',
  description: 'El portal líder en información económica, tasa de cambio y precios de combustibles en República Dominicana.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'DAgendaNG | Diario Digital Económico',
    description: 'Información económica, tasas de cambio y combustibles al instante.',
    url: BASE_URL,
    siteName: 'DAgendaNG',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'DAgendaNG | Diario Digital Económico',
      },
    ],
    locale: 'es_DO',
    type: 'website',
  },
};

// Always fetch fresh data dynamically
export const dynamic = 'force-dynamic';


export default async function Home() {
  const [articles, poll, tonyOpinion, rates, fuel] = await Promise.all([
    getArticlesPage(1, 5),
    getActivePoll(),
    getLatestTonyOpinion(),
    getExchangeRateData(),
    getFuelPriceData(),
  ]);

  const mainArticle = articles.articles[0] || null;
  const secondaryArticles = articles.articles.slice(1);
  const totalArticles = articles.total;

  return (
    <div className="w-full">
      <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <section className="lg:px-2">
            <AdGuard>
              <AdBanner position="header" className="border-b border-border-light dark:border-border-dark mb-6" />
            </AdGuard>

            <NewsGrid mainArticle={mainArticle} initialArticles={secondaryArticles} totalArticles={totalArticles} pageSize={8} />
          </section>

          <aside className="space-y-8 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-6">
            <TonyColumnCard opinion={tonyOpinion} />
            <EconomyIndicators initialRates={rates} initialFuel={fuel} />
            <DailyChallengeCard poll={poll} />
            <AdGuard><AdBanner position="home_left" /></AdGuard>
            <AdGuard><AdBanner position="sidebar_top" /></AdGuard>
            <AdGuard><AdBanner position="sidebar_bottom" /></AdGuard>
          </aside>
        </div>
      </div>
    </div>
  );
}
