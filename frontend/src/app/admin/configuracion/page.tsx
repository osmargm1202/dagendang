"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "../../components/AdminHeader";

export default function AdminSettings() {
  const [user, setUser] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-flash-lite-latest");
  const [backupFreq, setBackupFreq] = useState(2);
  const [backupLimit, setBackupLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Category management state
  const [categories, setCategories] = useState<any[]>([]);
  const [isCatLoading, setIsCatLoading] = useState(true);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [catForm, setCatForm] = useState({ id: null, name: "", slug: "", order: 0, is_active: true });

  // Backup management state
  const [backups, setBackups] = useState<any[]>([]);
  const [isBackupLoading, setIsBackupLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const router = useRouter();

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
      .then(data => {
        setUser(data);
        setApiKey(data.gemini_api_key || "");
        if (data.gemini_model) setSelectedModel(data.gemini_model);
        if (data.backup_frequency_hours) setBackupFreq(data.backup_frequency_hours);
        if (data.backup_limit_gb) setBackupLimit(data.backup_limit_gb);
      })
      .catch(() => router.push("/admin"));

    fetchCategories();
    fetchBackups();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/articles/categories?include_inactive=true");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsCatLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/backups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Sort most recent first
      const sortedData = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBackups(sortedData);
    } catch (error) {
      console.error("Error fetching backups:", error);
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gemini_api_key: apiKey,
          gemini_model: selectedModel,
          backup_frequency_hours: backupFreq,
          backup_limit_gb: backupLimit
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Configuración guardada correctamente." });
      } else {
        throw new Error("Error al guardar la configuración.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleCatNameChange = (name: string) => {
    const slug = generateSlug(name);
    setCatForm(prev => ({ ...prev, name, slug }));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    const method = catForm.id ? "PUT" : "POST";
    const url = catForm.id ? `/api/articles/categories/${catForm.id}` : "/api/articles/categories";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(catForm)
      });

      if (res.ok) {
        setIsEditingCat(false);
        setCatForm({ id: null, name: "", slug: "", order: 0, is_active: true });
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.detail || "Error al guardar la categoría.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  const handleEditCategory = (cat: any) => {
    setCatForm(cat);
    setIsEditingCat(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría? Solo funcionará si no tiene artículos asociados.")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/articles/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.detail || "No se pudo eliminar la categoría.");
      }
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Respaldo iniciado. Aparecerá en la lista en unos instantes.");
        setTimeout(fetchBackups, 2000);
      }
    } catch (error) {
      alert("Error al iniciar respaldo.");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`¿Estás SEGURO de restaurar el respaldo "${filename}"? Esto reemplazará TODOS los datos actuales.`)) return;

    setIsLoading(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/backups/restore/${filename}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Base de datos restaurada correctamente. La página se reiniciará.");
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.detail || "Error al restaurar.");
      }
    } catch (error) {
      alert("Error de conexión durante la restauración.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm("¿Eliminar este archivo de respaldo definitivamente?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/backups/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBackups();
      }
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 uppercase-none pb-20">
      <AdminHeader user={user} currentTitle="Configuración" />

      <main className="max-w-6xl mx-auto py-8 md:py-12 px-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-tight uppercase">Configuración del Sistema</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Panel Izquierdo: IA y Backups */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-dr-blue mb-6 border-b pb-2 uppercase tracking-tighter">Integración con Google Gemini</h2>

              {message.text && (
                <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-dr-red border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Google Gemini API Key</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-dr-blue outline-none font-mono text-sm"
                    placeholder="Introduzca su API Key de Gemini"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="mt-2 text-[10px] text-gray-400 italic">
                    * Esta llave se utiliza para el raspado inteligente (scrawl) y la re-redacción de noticias por IA.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Modelo de Gemini</label>
                  <select
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-dr-blue outline-none bg-white font-bold text-sm"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="gemini-flash-lite-latest">Gemini Flash Lite (Recomendado)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanceado)</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frecuencia Backup (Horas)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-dr-blue outline-none font-bold text-sm"
                      value={backupFreq}
                      onChange={(e) => setBackupFreq(parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Límite Total (GB)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-dr-blue outline-none font-bold text-sm"
                      value={backupLimit}
                      onChange={(e) => setBackupLimit(parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-dr-blue text-white py-3 rounded font-black uppercase text-xs tracking-widest hover:bg-blue-900 transition-all disabled:bg-gray-400 shadow-md active:scale-95"
                >
                  {isLoading ? "Guardando..." : "Guardar Configuración"}
                </button>
              </form>
            </div>

            {/* Gestión de Respaldos */}
            <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Respaldos de Base de Datos</h2>
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="bg-green-600 text-white px-3 py-1 rounded-sm hover:bg-green-700 transition-colors text-[10px] font-black uppercase tracking-widest disabled:bg-gray-400 shadow-sm"
                >
                  {isCreatingBackup ? "Procesando..." : "Crear Backup Ahora"}
                </button>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {isBackupLoading ? (
                  <p className="text-center py-4 text-xs text-gray-400">Cargando archivos...</p>
                ) : backups.map((b) => (
                  <div key={b.filename} className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:border-gray-300 transition-colors">
                    <div>
                      <div className="font-bold text-xs text-gray-900">{b.filename}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase">{formatSize(b.size)}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">{new Date(b.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreBackup(b.filename)}
                        className="px-2 py-1 bg-dr-blue text-white text-[9px] font-black uppercase rounded-sm hover:bg-blue-900 transition-colors shadow-sm"
                        title="Restaurar"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(b.filename)}
                        className="p-1 text-dr-red hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {backups.length === 0 && !isBackupLoading && (
                  <p className="text-center py-8 text-xs text-gray-400 uppercase font-black tracking-widest italic border border-dashed rounded">No hay respaldos disponibles</p>
                )}
              </div>
              <p className="mt-4 text-[10px] text-gray-400 italic">
                * Los respaldos automáticos se generan cada 2 horas (Background Safe).
              </p>
            </div>

            {/* Accesos Rápidos */}
            <div className="grid grid-cols-1 gap-6">
              <Link href="/admin/fuentes" className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:border-dr-blue transition-all group flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded group-hover:bg-dr-blue group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-none mb-1 uppercase tracking-tighter">Fuentes para IA</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Portales y RSS externos para automatización.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Panel Derecho: Categorías */}
          <div className="bg-white p-8 rounded-lg shadow border border-gray-200 h-fit">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-dr-red uppercase tracking-tighter">Categorías de Publicación</h2>
              {!isEditingCat && (
                <button
                  onClick={() => setIsEditingCat(true)}
                  className="bg-dr-blue text-white p-1 rounded-sm hover:bg-blue-900 transition-colors shadow-sm"
                  title="Nueva Categoría"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
              )}
            </div>

            {isEditingCat && (
              <form onSubmit={handleSaveCategory} className="mb-8 p-4 bg-gray-50 border rounded-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">{catForm.id ? "Editar Categoría" : "Nueva Categoría"}</h3>
                  <button type="button" onClick={() => { setIsEditingCat(false); setCatForm({ id: null, name: "", slug: "", order: 0, is_active: true }); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-sm outline-none focus:ring-1 focus:ring-dr-blue"
                      value={catForm.name}
                      onChange={(e) => handleCatNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-sm bg-gray-100 font-mono"
                      value={catForm.slug}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Orden</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded text-sm outline-none"
                      value={catForm.order}
                      onChange={(e) => setCatForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="cat_active"
                      checked={catForm.is_active}
                      onChange={(e) => setCatForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <label htmlFor="cat_active" className="text-xs font-bold text-gray-600 uppercase">Activa</label>
                  </div>
                </div>
                <button type="submit" className="w-full bg-dr-red text-white py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-sm transition-all active:scale-95">
                  {catForm.id ? "Actualizar Categoría" : "Crear Categoría"}
                </button>
              </form>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {isCatLoading ? (
                <p className="text-center py-4 text-xs text-gray-400">Cargando categorías...</p>
              ) : categories.map((cat) => (
                <div key={cat.id} className={`flex items-center justify-between p-3 border rounded hover:border-gray-300 transition-colors ${!cat.is_active ? 'bg-gray-50 opacity-60' : 'bg-white shadow-sm'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">/{cat.slug}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-dr-blue uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">Orden: {cat.order}</span>
                      {!cat.is_active && <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-gray-200 px-1.5 py-0.5 rounded">Inactiva</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditCategory(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-dr-red hover:bg-red-50 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && !isCatLoading && (
                <p className="text-center py-8 text-xs text-gray-400 uppercase font-black tracking-widest italic border border-dashed rounded">No hay categorías configuradas</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
