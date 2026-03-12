"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSources() {
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

  if (isLoading) return <div className="p-10 text-center">Cargando fuentes...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 uppercase-none">
      <nav className="bg-dr-blue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/admin/dashboard" className="font-bold text-xl">La Agenda CMS</Link>
          <div className="flex gap-4 items-center">
             <Link href="/admin/dashboard" className="text-sm hover:underline">Escritorio</Link>
             <Link href="/admin/publicidad" className="text-sm hover:underline">Publicidad</Link>
             <Link href="/admin/configuracion" className="text-sm hover:underline">Configuración</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8 border-b pb-5">
           <h1 className="text-3xl font-bold text-gray-900">Fuentes de Noticias (Scraping)</h1>
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="bg-dr-blue text-white px-5 py-2 rounded font-bold hover:bg-dr-blue/90"
           >
             {isAdding ? "Cancelar" : "+ Agregar Fuente"}
           </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
            <h2 className="font-bold text-lg mb-4 text-dr-blue">Nueva Fuente RSS/Atom</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Medio</label>
                 <input 
                   required
                   className="w-full border px-3 py-2 rounded"
                   placeholder="Ej: CNN, Listín Diario..."
                   value={newSource.name}
                   onChange={e => setNewSource({...newSource, name: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">URL del Feed RSS</label>
                 <input 
                   required
                   type="url"
                   className="w-full border px-3 py-2 rounded"
                   placeholder="https://ejemplo.com/rss"
                   value={newSource.url}
                   onChange={e => setNewSource({...newSource, url: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Categoría Sugerida</label>
                 <select 
                   className="w-full border px-3 py-2 rounded"
                   value={newSource.category}
                   onChange={e => setNewSource({...newSource, category: e.target.value})}
                 >
                   <option value="nacional">Nacional</option>
                   <option value="economia">Economía</option>
                   <option value="empresa">Empresas</option>
                   <option value="opinion">Opinión</option>
                 </select>
               </div>
               <div className="flex items-end">
                 <button type="submit" className="bg-dr-red text-white w-full py-2 rounded font-bold uppercase text-xs">Guardar Fuente</button>
               </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Medio</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">URL Feed</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Categoría</th>
                 <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {sources.map(source => (
                 <tr key={source.id}>
                   <td className="px-6 py-4 font-bold text-gray-900">{source.name}</td>
                   <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{source.url}</td>
                   <td className="px-6 py-4"><span className="uppercase text-[10px] bg-gray-100 px-2 py-1 rounded font-bold">{source.category}</span></td>
                   <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(source.id)} className="text-dr-red hover:underline text-sm font-bold">Eliminar</button>
                   </td>
                 </tr>
               ))}
               {sources.length === 0 && (
                 <tr>
                   <td colSpan={4} className="p-10 text-center text-gray-400">No hay fuentes configuradas.</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </main>
    </div>
  );
}
