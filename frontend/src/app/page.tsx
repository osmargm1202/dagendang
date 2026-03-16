import Link from "next/link";
import AdBanner from "@/app/components/AdBanner";
import AdGuard from "@/app/components/AdGuard";
import type { Metadata } from 'next';
import NewsGrid from "@/app/components/NewsGrid";
import EconomyIndicators from "@/app/components/EconomyIndicators";

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

async function getArticles() {
  try {
    const res = await fetch('http://backend:8000/api/articles/?status=published', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

async function getArticlesCount() {
  try {
    const res = await fetch('http://backend:8000/api/articles/count?status=published', { cache: 'no-store' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total;
  } catch (error) {
    console.error("Error fetching articles count:", error);
    return 0;
  }
}


export default async function Home() {
  const rates = await getExchangeRates();
  const fuel = await getFuelPrices();
  const articles = await getArticles();
  const totalArticles = await getArticlesCount();
  
  const mainArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.length > 1 ? articles.slice(1, 5) : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Columna Principal - Noticias */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Banner Superior Principal - Alineado con noticias */}
          <AdGuard>
            <AdBanner position="header" className="mb-2" />
          </AdGuard>

        {/* Noticia Principal y Grid Controlado por NewsGrid */}
        <NewsGrid 
          mainArticle={mainArticle}
          initialArticles={secondaryArticles} 
          totalArticles={totalArticles} 
          pageSize={8} 
        />
      </div>

      {/* Sidebar Derecha - Indicadores y Publicidad */}
      <aside className="space-y-8">
        
        {/* Indicadores Económicos (Click para Histórico) */}
        <EconomyIndicators initialRates={rates} initialFuel={fuel} />

        {/* Publicidad Lateral */}
        <AdGuard>
          <AdBanner position="sidebar_top" className="mb-8" />
        </AdGuard>

        <AdGuard>
          <AdBanner position="sidebar_bottom" />
        </AdGuard>

      </aside>
    </div>
  </div>
  );
}
