"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";

export default function AdminSources() {
  const [user, setUser] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", url: "", category: "nacional", type: "rss" });
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
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/ai/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSource)
      });
      if (res.ok) {
        setIsAdding(false);
        setNewSource({ name: "", url: "", category: "nacional", type: "rss" });
        fetchSources();
      }
    } catch (err) {
      console.error(err);
    }
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
    <div className="w-full min-h-screen bg-gray-50 uppercase-none pb-20">
      <AdminHeader user={user} currentTitle="Fuentes IA" />

      <main className="max-w-5xl mx-auto py-6 md:py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-5">
           <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Fuentes de Noticias</h1>
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="w-full md:w-auto bg-dr-blue text-white px-6 py-2.5 rounded-sm font-bold hover:bg-blue-900 transition-all uppercase text-sm tracking-widest"
           >
             {isAdding ? "Cancelar" : "+ Agregar Fuente"}
           </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-2">
            <h2 className="font-bold text-lg mb-4 text-dr-blue">Nueva Fuente RSS/Atom</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <option value="editorial">Editorial</option>
                    <option value="economia">Economía</option>
                    <option value="empresas">Empresas</option>
                    <option value="mercados">Mercados</option>
                    <option value="opinion">Opinión</option>
                 </select>
               </div>
               <div className="flex items-end">
                 <button type="submit" className="bg-dr-red text-white w-full py-3 rounded-sm font-bold uppercase text-xs tracking-widest shadow-md hover:bg-red-700 transition-colors">Guardar Fuente</button>
               </div>
            </form>
          </div>
        )}

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {sources.map(source => (
            <div key={source.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{source.name}</h3>
                    <span className="uppercase text-[9px] bg-gray-100 px-2 py-0.5 rounded font-black text-gray-500 tracking-tighter">{source.category}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-4 font-mono">{source.url}</p>
                <button 
                  onClick={() => handleDelete(source.id)} 
                  className="w-full py-2 bg-red-50 text-dr-red text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-100 transition-colors"
                >
                    Eliminar Fuente
                </button>
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
                 <tr key={source.id} className="hover:bg-blue-50/50 transition-colors">
                   <td className="px-6 py-5 font-bold text-gray-900">{source.name}</td>
                   <td className="px-6 py-5 text-sm text-gray-500 font-mono italic truncate max-w-xs">{source.url}</td>
                   <td className="px-6 py-5"><span className="uppercase text-[10px] text-dr-red font-bold tracking-wider">{source.category}</span></td>
                   <td className="px-6 py-5 text-right">
                      <button onClick={() => handleDelete(source.id)} className="text-gray-300 hover:text-dr-red transition-colors">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </main>
    </div>
  );
}
