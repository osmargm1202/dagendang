import Link from "next/link";
import { notFound } from "next/navigation";
import PremiumContentWrapper from "@/app/components/PremiumContentWrapper";
import AdBanner from "@/app/components/AdBanner";
import type { Metadata, ResolvingMetadata } from 'next';

const BASE_URL = 'https://diariodigital.delioserver.duckdns.org';

// Always fetch fresh data dynamically
export const dynamic = 'force-dynamic';

async function getArticle(id: string) {
  try {
    const res = await fetch(`http://backend:8000/api/articles/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch article');
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

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

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return { title: 'Nota no encontrada | La Agenda' };

  const snippet = article.content.substring(0, 160).replace(/\s+/g, ' ').trim() + '...';
  const imageUrl = article.image_url?.startsWith('http') 
    ? article.image_url 
    : `${BASE_URL}${article.image_url}`;

  return {
    title: `${article.title} | La Agenda`,
    description: snippet,
    alternates: {
      canonical: `${BASE_URL}/noticias/${id}`,
    },
    openGraph: {
      title: article.title,
      description: snippet,
      url: `${BASE_URL}/noticias/${id}`,
      siteName: 'La Agenda',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'es_DO',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author || 'La Agenda'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: snippet,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  const rates = await getExchangeRates();
  const fuel = await getFuelPrices();

  if (!article) {
    notFound();
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "image": [
              article.image_url?.startsWith('http') ? article.image_url : `${BASE_URL}${article.image_url}`
            ],
            "datePublished": article.published_at,
            "dateModified": article.published_at,
            "author": [{
                "@type": "Person",
                "name": article.author || "La Agenda",
                "url": BASE_URL
              }],
            "publisher": {
              "@type": "Organization",
              "name": "La Agenda",
              "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/logo.png`
              }
            },
            "description": article.content.substring(0, 160) + "..."
          })
        }}
      />
      {/* Columna Principal - Artículo */}
      <div className="lg:col-span-3">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-dr-blue transition-colors text-muted-foreground">Volver al Inicio</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-dr-red font-semibold uppercase">{article.type}</span>
          {article.is_premium && (
            <span className="ml-3 px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded-sm">PREMIUM</span>
          )}
        </nav>

        {/* Main Article Image */}
        {article.image_url ? (
          <div className="w-full aspect-video bg-muted mb-8 rounded-sm shadow-sm overflow-hidden border border-border">
            <img src={article.image_url.startsWith('http') ? article.image_url : `https://diariodigital.delioserver.duckdns.org${article.image_url}`} alt={article.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted mb-8 rounded-sm shadow-sm flex items-center justify-center border border-border">
              <span className="text-muted-foreground">Sin Imagen</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <span className="text-dr-red font-bold uppercase tracking-wider">{article.type}</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 leading-tight text-foreground border-b border-border pb-6 mb-6">
            {article.title}
          </h1>
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div>
              <span className="font-semibold text-foreground/80">Por {article.author || "Redacción"}</span>
            </div>
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </time>
          </div>
        </header>

        {/* Article Content with Premium logic and In-Content Ads */}
        <PremiumContentWrapper 
            content={article.content} 
            isPremium={article.is_premium} 
            adImageUrl={article.ad_image_url}
            adLink={article.ad_link}
        />

        {/* Publicidad Central (Solo para noticias no premium) */}
        {!article.is_premium && (
          <div className="mt-8">
            <AdBanner position="content_middle" className="mb-8" />
          </div>
        )}
      </div>

      {/* Sidebar Derecha - Indicadores y Publicidad */}
      <aside className="space-y-8">
        
        {/* Tasa de Cambio */}
        <div className="bg-card border border-border rounded shadow-sm p-5 mt-10 lg:mt-0">
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
