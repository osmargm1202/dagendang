import AdBanner from "@/app/components/AdBanner";
import AdGuard from "@/app/components/AdGuard";
import DailyChallengeCard from "@/app/components/DailyChallengeCard";
import TonyColumnCard from "@/app/components/TonyColumnCard";
import type { Metadata } from 'next';
import NewsGrid from "@/app/components/NewsGrid";
import EconomyIndicators from "@/app/components/EconomyIndicators";
import { getActivePoll, getHomepageArticles, getLatestTonyOpinion } from "@/app/lib/content";

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

async function getExchangeRates() {
  try {
    const res = await fetch('http://backend:8000/api/economy/exchange-rate/latest', { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching rates:", error);
    return null;
  }
}

async function getFuelPrices() {
  try {
    const res = await fetch('http://backend:8000/api/economy/fuel-prices/latest', { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return null;
  }
}

export default async function Home() {
  const [articles, poll, tonyOpinion, rates, fuel] = await Promise.all([
    getHomepageArticles(),
    getActivePoll(),
    getLatestTonyOpinion(),
    getExchangeRates(),
    getFuelPrices(),
  ]);

  const mainArticle = articles[0] || null;
  const secondaryArticles = articles.slice(1);
  const totalArticles = mainArticle ? secondaryArticles.length + 1 : secondaryArticles.length;

  return (
    <div className="w-full">
      <AdGuard>
        <AdBanner position="header" className="border-b border-border-light dark:border-border-dark" />
      </AdGuard>

      <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 xl:col-span-2 space-y-8 lg:border-r lg:border-border-light dark:lg:border-border-dark lg:pr-6">
            <DailyChallengeCard poll={poll} />
            <AdGuard><AdBanner position="home_left" /></AdGuard>
          </aside>

          <section className="lg:col-span-6 xl:col-span-7 lg:px-2">
            <NewsGrid mainArticle={mainArticle} initialArticles={secondaryArticles} totalArticles={totalArticles} pageSize={8} />
          </section>

          <aside className="lg:col-span-3 space-y-8 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-6">
            <TonyColumnCard opinion={tonyOpinion} />
            <EconomyIndicators initialRates={rates} initialFuel={fuel} />
            <AdGuard><AdBanner position="sidebar_top" /></AdGuard>
            <AdGuard><AdBanner position="sidebar_bottom" /></AdGuard>
          </aside>
        </div>
      </div>
    </div>
  );
}
