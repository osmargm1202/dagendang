"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "../../components/AdminHeader";

export default function AdminDashboard() {
  const [user, setUser] = useState<{ full_name: string; email: string; role: string; is_premium: boolean } | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Fetch user profile
    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Invalid token");
      return res.json();
    })
    .then(data => {
      setUser(data);
      setIsPremium(data.is_premium);
    })
    .catch(() => {
      localStorage.removeItem("admin_token");
      router.push("/admin");
    });

    // Fetch articles
    fetch("/api/articles")
    .then(res => res.json())
    .then(data => setArticles(data))
    .catch(err => console.error(err));

  }, [router]);

  const togglePremium = async () => {
    console.log("Toggle Premium clicked");
    const token = localStorage.getItem("admin_token");
    if (!token) {
        console.error("No admin token found");
        return;
    }
    try {
      console.log("Sending POST /api/subscriptions/toggle-premium");
      const res = await fetch("/api/subscriptions/toggle-premium", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("New premium status:", data.is_premium);
        setIsPremium(data.is_premium);
      } else {
        const errorText = await res.text();
        console.error("API Error:", errorText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta noticia?")) return;
    
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setArticles(articles.filter(article => article.id !== id));
      } else {
        alert("Hubo un error al eliminar el artículo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al intentar eliminar.");
    }
  };

  if (!user) return <div className="w-full p-10 text-center">Cargando Panel...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Noticias Publicadas</h1>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modo Premium</span>
              <button 
                onClick={togglePremium}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPremium ? 'bg-dr-blue' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <Link href="/admin/noticias/nuevo" className="w-full md:w-auto bg-dr-blue text-white px-6 py-3 rounded-sm shadow-lg hover:bg-blue-900 transition-all font-bold text-center text-sm md:text-base uppercase tracking-widest">
            + Nuevo Artículo
          </Link>
        </div>

        <div className="md:hidden space-y-4">
          {Array.isArray(articles) && articles.map((article) => (
            <div key={article.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-dr-red uppercase tracking-wider">{article.type}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {article.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  {article.is_premium && <span className="text-xs" title="Contenido Premium">💎</span>}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 leading-tight">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <span>{article.author || 'Redacción'}</span>
                <span>{new Date(article.published_at).toLocaleDateString('es-DO')}</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/noticias/${article.id}/editar`} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded text-xs font-bold text-center hover:bg-gray-200">
                  EDITAR
                </Link>
                <Link href={`/noticias/${article.id}`} target="_blank" className="flex-1 bg-blue-50 text-dr-blue py-2.5 rounded text-xs font-bold text-center hover:bg-blue-100">
                  VER
                </Link>
                <button 
                  onClick={() => handleDelete(article.id)}
                  className="p-2.5 bg-red-50 text-dr-red rounded hover:bg-red-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="p-8 text-center text-gray-400 italic text-sm">No hay artículos.</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white shadow-xl overflow-hidden rounded-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Título</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Autor</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {Array.isArray(articles) && articles.map((article) => (
                  <tr key={article.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900 max-w-xs truncate">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] text-dr-red font-bold uppercase tracking-wider">
                        {article.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs text-gray-600 font-medium">{article.author || 'Redacción'}</div>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-500 font-mono">
                      {new Date(article.published_at).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 inline-flex text-[9px] font-black uppercase tracking-tighter rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {article.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                        {article.is_premium && <span title="Contenido Premium">💎</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right space-x-3">
                      <Link href={`/noticias/${article.id}`} className="text-blue-400 hover:text-dr-blue transition-colors" target="_blank">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </Link>
                      <Link href={`/admin/noticias/${article.id}/editar`} className="text-gray-400 hover:text-dr-blue transition-colors">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="text-gray-300 hover:text-dr-red transition-colors"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
