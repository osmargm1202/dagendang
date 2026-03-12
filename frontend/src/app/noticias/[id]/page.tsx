import Link from "next/link";
import { notFound } from "next/navigation";
import PremiumContentWrapper from "@/app/components/PremiumContentWrapper";
import AdBanner from "@/app/components/AdBanner";

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
      {/* Columna Principal - Artículo */}
      <div className="lg:col-span-3">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-dr-blue transition-colors">Volver al Inicio</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-dr-red font-semibold uppercase">{article.type}</span>
          {article.is_premium && (
            <span className="ml-3 px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded-sm">PREMIUM</span>
          )}
        </nav>

        {/* Main Article Image */}
        {article.image_url ? (
          <div className="w-full aspect-video bg-gray-200 mb-8 rounded-sm shadow-sm overflow-hidden">
            <img src={article.image_url.startsWith('http') ? article.image_url : `https://diariodigital.delioserver.duckdns.org${article.image_url}`} alt={article.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gray-200 mb-8 rounded-sm shadow-sm flex items-center justify-center">
              <span className="text-gray-400">Sin Imagen</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <span className="text-dr-red font-bold uppercase tracking-wider">{article.type}</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 leading-tight text-gray-900 border-b border-gray-200 pb-6 mb-6">
            {article.title}
          </h1>
          <div className="flex items-center justify-between text-gray-600 text-sm">
            <div>
              <span className="font-semibold text-gray-800">Por {article.author || "Redacción"}</span>
            </div>
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </time>
          </div>
        </header>

        {/* Article Content with Premium logic */}
        <PremiumContentWrapper 
            content={article.content} 
            isPremium={article.is_premium} 
        />

        {/* Publicidad Central */}
        <AdBanner position="content_middle" className="mt-12 mb-8" />
      </div>

      {/* Sidebar Derecha - Indicadores y Publicidad */}
      <aside className="space-y-8">
        
        {/* Tasa de Cambio */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5 mt-10 lg:mt-0">
          <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-4 text-dr-blue tracking-wide">TASA DE CAMBIO OFICIAL</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">USD</span>
                <span className="text-xs text-gray-500">Dólar</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Compra: <span className="font-bold text-gray-800">RD$ {rates?.usd_buy?.toFixed(2) || "58.70"}</span></div>
                <div className="text-sm text-gray-500">Venta: <span className="font-bold text-dr-red">RD$ {rates?.usd_sell?.toFixed(2) || "59.20"}</span></div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">EUR</span>
                <span className="text-xs text-gray-500">Euro</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Compra: <span className="font-bold text-gray-800">RD$ {rates?.eur_buy?.toFixed(2) || "63.40"}</span></div>
                <div className="text-sm text-gray-500">Venta: <span className="font-bold text-dr-red">RD$ {rates?.eur_sell?.toFixed(2) || "64.10"}</span></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">Fuente: Banco Central de la R.D.</p>
        </div>

        {/* Combustibles */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-4 text-dr-blue tracking-wide">COMBUSTIBLES</h3>
          
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Gasolina Premium</span>
              <span className="font-bold">RD$ {fuel?.gasoline_premium?.toFixed(2) || "290.10"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Gasolina Regular</span>
              <span className="font-bold">RD$ {fuel?.gasoline_regular?.toFixed(2) || "272.50"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Gasoil Óptimo</span>
              <span className="font-bold">RD$ {fuel?.diesel_optimum?.toFixed(2) || "239.10"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Gasoil Regular</span>
              <span className="font-bold">RD$ {fuel?.diesel_regular?.toFixed(2) || "221.60"}</span>
            </li>
            <li className="flex justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-gray-600">Gas Licuado (GLP)</span>
              <span className="font-bold">RD$ {fuel?.glp?.toFixed(2) || "132.60"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Gas Natural Vehicular</span>
              <span className="font-bold">RD$ {fuel?.gas_natural?.toFixed(2) || "43.90"}</span>
            </li>
          </ul>
           <p className="text-xs text-center text-gray-400 mt-4">Actualizado semanalmente (MICM)</p>
        </div>

        {/* Publicidad Lateral */}
        <AdBanner position="sidebar_top" />

      </aside>
    </div>
  );
}
