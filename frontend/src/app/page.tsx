import Link from "next/link";
import AdBanner from "@/app/components/AdBanner";
import type { Metadata } from 'next';

const BASE_URL = 'https://diariodigital.delioserver.duckdns.org';

export const metadata: Metadata = {
  title: 'La Agenda | Diario Digital Económico de la República Dominicana',
  description: 'El portal líder en información económica, tasa de cambio y precios de combustibles en República Dominicana.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'La Agenda | Diario Digital Económico',
    description: 'Información económica, tasas de cambio y combustibles al instante.',
    url: BASE_URL,
    siteName: 'La Agenda',
    images: [
      {
        url: `${BASE_URL}/og-main.png`, // Placeholder for future OG image
        width: 1200,
        height: 630,
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

export default async function Home() {
  const rates = await getExchangeRates();
  const fuel = await getFuelPrices();
  const articles = await getArticles();
  
  const mainArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.length > 1 ? articles.slice(1, 5) : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Columna Principal - Noticias */}
      <div className="lg:col-span-3 space-y-8">
        
        {/* Banner Superior Principal */}
        <AdBanner position="header" className="mb-2" />

        {/* Noticia Principal */}
        {mainArticle ? (
          <Link href={`/noticias/${mainArticle.id}`} className="group cursor-pointer block">
            <article>
              <div className="w-full aspect-video bg-gray-300 mb-4 relative overflow-hidden flex items-center justify-center">
                 {mainArticle.image_url ? (
                   <img src={mainArticle.image_url.startsWith('http') ? mainArticle.image_url : `https://diariodigital.delioserver.duckdns.org${mainArticle.image_url}`} alt={mainArticle.title} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-gray-400">Sin Imagen</span>
                 )}
                  <div className="absolute inset-0 bg-dr-blue/10 group-hover:bg-transparent transition duration-300"></div>
              </div>
              <span className="text-dr-red font-bold uppercase text-xs tracking-wider">{mainArticle.type}</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 leading-tight text-foreground group-hover:text-dr-red transition-colors">
                {mainArticle.title}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                {mainArticle.content.substring(0, 150)}...
              </p>
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

        {/* Grid de Noticias Secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {secondaryArticles.length > 0 ? (
             secondaryArticles.map((article: any) => (
              <Link href={`/noticias/${article.id}`} key={article.id} className="group cursor-pointer block">
                <article>
                  <div className="w-full aspect-video bg-muted mb-3 overflow-hidden flex items-center justify-center">
                    {article.image_url ? (
                      <img src={article.image_url.startsWith('http') ? article.image_url : `https://diariodigital.delioserver.duckdns.org${article.image_url}`} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin Imagen</span>
                    )}
                  </div>
                  <span className="text-primary font-bold uppercase text-xs tracking-wider">{article.type}</span>
                  <h3 className="text-xl font-serif font-bold mt-2 leading-snug group-hover:text-dr-red transition-colors">
                    {article.title}
                  </h3>
                </article>
              </Link>
             ))
           ) : (
             [1, 2, 3, 4].map((i) => (
              <article key={i} className="group cursor-pointer">
                <div className="w-full aspect-video bg-gray-200 mb-3"></div>
                <span className="text-primary font-bold uppercase text-xs tracking-wider">MERCADOS</span>
                <h3 className="text-xl font-serif font-bold mt-2 leading-snug group-hover:text-dr-red transition-colors">
                  Exportaciones dominicanas hacia EE.UU. crecen un 14% este semestre
                </h3>
              </article>
             ))
           )}
        </div>
      </div>

      {/* Sidebar Derecha - Indicadores y Publicidad */}
      <aside className="space-y-8">
        
        {/* Tasa de Cambio */}
        <div className="bg-card border border-border rounded shadow-sm p-5">
          <h3 className="font-bold text-lg border-b border-border pb-2 mb-4 text-primary tracking-wide uppercase">TASA DE CAMBIO OFICIAL</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">USD</span>
                <span className="text-xs text-muted-foreground">Dólar</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Compra: <span className="font-bold text-foreground">RD$ {rates?.usd_buy?.toFixed(2) || "58.70"}</span></div>
                <div className="text-sm text-muted-foreground">Venta: <span className="font-bold text-dr-red">RD$ {rates?.usd_sell?.toFixed(2) || "59.20"}</span></div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">EUR</span>
                <span className="text-xs text-muted-foreground">Euro</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Compra: <span className="font-bold text-foreground">RD$ {rates?.eur_buy?.toFixed(2) || "63.40"}</span></div>
                <div className="text-sm text-muted-foreground">Venta: <span className="font-bold text-dr-red">RD$ {rates?.eur_sell?.toFixed(2) || "64.10"}</span></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">Fuente: Banco Central de la R.D.</p>
        </div>

        {/* Combustibles */}
        <div className="bg-card border border-border rounded shadow-sm p-5">
          <h3 className="font-bold text-lg border-b border-border pb-2 mb-4 text-primary tracking-wide uppercase">COMBUSTIBLES</h3>
          
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Gasolina Premium</span>
              <span className="font-bold text-foreground">RD$ {fuel?.gasoline_premium?.toFixed(2) || "290.10"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Gasolina Regular</span>
              <span className="font-bold text-foreground">RD$ {fuel?.gasoline_regular?.toFixed(2) || "272.50"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Gasoil Óptimo</span>
              <span className="font-bold text-foreground">RD$ {fuel?.diesel_optimum?.toFixed(2) || "239.10"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Gasoil Regular</span>
              <span className="font-bold text-foreground">RD$ {fuel?.diesel_regular?.toFixed(2) || "221.60"}</span>
            </li>
            <li className="flex justify-between mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Gas Licuado (GLP)</span>
              <span className="font-bold text-foreground">RD$ {fuel?.glp?.toFixed(2) || "132.60"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Gas Natural Vehicular</span>
              <span className="font-bold text-foreground">RD$ {fuel?.gas_natural?.toFixed(2) || "43.90"}</span>
            </li>
          </ul>
           <p className="text-xs text-center text-muted-foreground mt-4">Actualizado semanalmente (MICM)</p>
        </div>

        {/* Publicidad Lateral */}
        <AdBanner position="sidebar_top" />

      </aside>
    </div>
  );
}
