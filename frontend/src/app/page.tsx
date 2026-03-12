import Image from "next/image";
import Link from "next/link";

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
        
        {/* Banner Superior Principal (Placeholder Publicidad) */}
        <div className="w-full bg-gray-200 h-32 flex items-center justify-center border border-gray-300 text-gray-500 font-mono text-sm">
          [ ESPACIO PUBLICITARIO PREMIUM - 728x90 ]
        </div>

        {/* Noticia Principal */}
        {mainArticle ? (
          <Link href={`/noticias/${mainArticle.id}`} className="group cursor-pointer block">
            <article>
              <div className="w-full aspect-video bg-gray-300 mb-4 relative overflow-hidden flex items-center justify-center">
                 {mainArticle.image_url ? (
                   <img src={`https://diariodigital.delioserver.duckdns.org${mainArticle.image_url}`} alt={mainArticle.title} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-gray-400">Sin Imagen</span>
                 )}
                 <div className="absolute inset-0 bg-dr-blue/10 group-hover:bg-transparent transition duration-300"></div>
              </div>
              <span className="text-dr-red font-bold uppercase text-xs tracking-wider">{mainArticle.type}</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 leading-tight text-gray-900 group-hover:text-dr-blue transition-colors">
                {mainArticle.title}
              </h2>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                {mainArticle.content.substring(0, 150)}...
              </p>
              <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <span className="font-semibold text-gray-700">Por {mainArticle.author || "Redacción"}</span>
                <span>&bull;</span>
                <span>{new Date(mainArticle.published_at).toLocaleDateString()}</span>
              </div>
            </article>
          </Link>
        ) : (
          <article className="group cursor-pointer">
            <div className="w-full aspect-video bg-gray-300 mb-4 relative overflow-hidden flex items-center justify-center text-gray-500">
               No hay noticias publicadas
            </div>
          </article>
        )}

        <hr className="border-gray-200" />

        {/* Grid de Noticias Secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {secondaryArticles.length > 0 ? (
             secondaryArticles.map((article: any) => (
              <Link href={`/noticias/${article.id}`} key={article.id} className="group cursor-pointer block">
                <article>
                  <div className="w-full aspect-video bg-gray-200 mb-3 overflow-hidden flex items-center justify-center">
                    {article.image_url ? (
                      <img src={`https://diariodigital.delioserver.duckdns.org${article.image_url}`} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin Imagen</span>
                    )}
                  </div>
                  <span className="text-dr-blue font-bold uppercase text-xs tracking-wider">{article.type}</span>
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
                <span className="text-dr-blue font-bold uppercase text-xs tracking-wider">MERCADOS</span>
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
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
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
        <div className="w-full bg-gray-200 aspect-[300/600] flex items-center justify-center border border-gray-300 text-gray-500 font-mono text-sm text-center px-4">
          [ ESPACIO PUBLICITARIO LATERAL - 300x600 ]
        </div>

      </aside>
    </div>
  );
}
