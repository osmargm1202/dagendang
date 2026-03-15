"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";

export default function AdminSources() {
  const [user, setUser] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);
  const [newSource, setNewSource] = useState({ name: "", url: "", category: "editorial", type: "rss" });
  const [cachedSuggestions, setCachedSuggestions] = useState<any[]>([]);
  const [selectedSourceName, setSelectedSourceName] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const router = useRouter();

  const fetchSources = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/ai/sources", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCache = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/ai/cache", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCachedSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Error fetching AI cache:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }
    
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(() => router.push("/admin"));

    fetchSources();
    fetchCache();

    // Fetch categories
    fetch("/api/articles/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setNewSource(prev => ({ ...prev, category: data[0].slug }));
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/ai/sources/${editingId}` : "/api/ai/sources";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSource)
      });
      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setNewSource({ name: "", url: "", category: "nacional", type: "rss" });
        fetchSources();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (source: any) => {
    setEditingId(source.id);
    setNewSource({
      name: source.name,
      url: source.url,
      category: source.category,
      type: source.type || "rss"
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewSource({ name: "", url: "", category: "nacional", type: "rss" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta fuente de noticias?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/ai/sources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchSources();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !user) return <div className="p-10 text-center">Cargando fuentes...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <AdminHeader user={user} currentTitle="Fuentes IA" />

      <main className="max-w-7xl mx-auto py-6 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-5">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Fuentes de Noticias</h1>
            <button 
              onClick={() => {
                if (isAdding) cancelEdit();
                else setIsAdding(true);
              }}
              className="w-full md:w-auto bg-dr-blue text-white px-6 py-2.5 rounded-sm font-bold hover:bg-blue-900 transition-all uppercase text-sm tracking-widest text-center"
            >
              {isAdding ? "Cancelar" : "+ Agregar Fuente"}
            </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-2">
            <h2 className="font-bold text-lg mb-4 text-dr-blue">
              {editingId ? "Editar Fuente" : "Nueva Fuente RSS/Atom"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre del Medio</label>
                 <input 
                   required
                   className="w-full border border-gray-300 px-4 py-2.5 rounded focus:ring-2 focus:ring-dr-blue outline-none"
                   placeholder="Ej: CNN, Listín Diario..."
                   value={newSource.name}
                   onChange={e => setNewSource({...newSource, name: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">URL del Feed RSS</label>
                 <input 
                   required
                   type="url"
                   className="w-full border border-gray-300 px-4 py-2.5 rounded focus:ring-2 focus:ring-dr-blue outline-none"
                   placeholder="https://ejemplo.com/rss"
                   value={newSource.url}
                   onChange={e => setNewSource({...newSource, url: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Categoría Sugerida</label>
                  <select 
                    className="w-full border border-gray-300 px-4 py-2.5 rounded focus:ring-2 focus:ring-dr-blue outline-none bg-white"
                    value={newSource.category}
                    onChange={e => setNewSource({...newSource, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
               </div>
               <div className="flex items-end">
                 <button type="submit" className="bg-dr-red text-white w-full py-3 rounded-sm font-bold uppercase text-xs tracking-widest shadow-md hover:bg-red-700 transition-colors">
                   {editingId ? "Actualizar Fuente" : "Guardar Fuente"}
                 </button>
               </div>
            </form>
          </div>
        )}

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {sources.map(source => (
            <div key={source.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div 
                    className="flex justify-between items-start mb-2 cursor-pointer group"
                    onClick={() => setSelectedSourceName(source.name)}
                >
                    <h3 className="font-bold text-gray-900 group-hover:text-dr-blue transition-colors">{source.name}</h3>
                    <span className="uppercase text-[9px] bg-gray-100 px-2 py-0.5 rounded font-black text-gray-500 tracking-tighter">{source.category}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-4 font-mono">{source.url}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleEdit(source)} 
                    className="py-2 bg-blue-50 text-dr-blue text-[10px] font-black uppercase tracking-widest rounded hover:bg-blue-100 transition-colors"
                  >
                      Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(source.id)} 
                    className="py-2 bg-red-50 text-dr-red text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-100 transition-colors"
                  >
                      Eliminar
                  </button>
                </div>
            </div>
          ))}
          {sources.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic text-sm">No hay fuentes configuradas.</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white shadow-xl overflow-hidden rounded-sm border border-gray-200">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Medio</th>
                 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">URL Feed</th>
                 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                 <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {sources.map(source => (
                 <tr 
                   key={source.id} 
                   className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${selectedSourceName === source.name ? 'bg-blue-50' : ''}`}
                   onClick={() => setSelectedSourceName(source.name)}
                 >
                   <td className="px-6 py-5 font-bold text-gray-900 group-hover:text-dr-blue transition-colors">{source.name}</td>
                   <td className="px-6 py-5 text-sm text-gray-500 font-mono italic truncate max-w-xs">{source.url}</td>
                   <td className="px-6 py-5"><span className="uppercase text-[10px] text-dr-red font-bold tracking-wider">{source.category}</span></td>
                   <td className="px-6 py-5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(source)} className="text-gray-300 hover:text-dr-blue transition-colors">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(source.id)} className="text-gray-300 hover:text-dr-red transition-colors">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* --- Cached News Preview Panel --- */}
        {selectedSourceName && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-8 bg-dr-red inline-block"></span>
                  Noticias en Caché: <span className="text-dr-blue">{selectedSourceName}</span>
                </h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                  Mostrando hasta 500 sugerencias disponibles en memoria para este medio
                </p>
              </div>
              <button 
                onClick={() => setSelectedSourceName(null)}
                className="text-gray-400 hover:text-dr-red transition-colors"
                title="Cerrar vista previa"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cachedSuggestions.filter(s => s.source_name === selectedSourceName).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cachedSuggestions
                  .filter(s => s.source_name === selectedSourceName)
                  .map((news, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {news.image_url ? (
                          <img 
                            src={news.image_url} 
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Sin imagen disponible</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-dr-blue text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest shadow-lg">
                            {news.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-3 leading-snug mb-3">
                          {news.title}
                        </h3>
                        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 font-mono italic truncate max-w-[150px]">
                            {news.source_url}
                          </span>
                          <button 
                            onClick={() => window.open(news.source_url, '_blank')}
                            className="text-dr-blue hover:text-blue-800 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white border rounded p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-bold">Sin noticias en memoria</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                  La IA aún no ha procesado noticias para este medio en esta sesión o el caché ha expirado.
                </p>
                <button 
                  onClick={() => router.push('/admin/noticias/nuevo')}
                  className="mt-6 text-dr-blue font-black uppercase text-[10px] tracking-widest hover:underline"
                >
                  Generar sugerencias ahora →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
