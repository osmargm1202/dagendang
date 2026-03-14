"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "../../components/AdminHeader";

const DEFAULT_ARTICLE_PROMPT_TEMPLATE = `Actua como el Editor en Jefe del diario digital dominicano "La Agenda".
Nuestro estilo es "Ejecutivo Dominicano": serio, profesional, analitico y elegante, en una linea cercana a Bloomberg o Financial Times.

Tu tarea es redactar una noticia ORIGINAL basada en la siguiente informacion de una fuente externa:

--- INICIO INFORMACION FUENTE ---
URL FUENTE: {source_url}
CATEGORIA ASIGNADA: {category}
CONTENIDO:
{source_content}
--- FIN INFORMACION FUENTE ---

REQUISITOS DE REDACCION:
1. No hables en primera persona.
2. El titular debe ser impactante pero profesional.
3. El contenido debe tener al menos 4 o 5 parrafos.
4. Al final del articulo, debes incluir una linea de referencia: "Basado en informaciones de [Nombre de Fuente Original]".
5. Adapta los terminos economicos al contexto dominicano si es necesario.
6. Evita duplicar el texto exacto de la fuente, pero manten todos los datos y hechos veridicos.
7. La categoria del articulo es {category}.
8. Devuelve exclusivamente un objeto JSON compatible con el esquema esperado.`;

const DEFAULT_IMAGE_PROMPT_TEMPLATE = `Crea una imagen editorial de alta calidad para un diario digital.

Contexto del articulo:
- Titulo: {title}
- Categoria: {category}
- Resumen/base editorial:
{content_excerpt}

Instrucciones visuales:
- Representa la idea central del articulo con una sola escena clara, elegante y periodistica.
- Prioriza composiciones realistas o editorialmente verosimiles.
- Evita collage caotico, simbolos genericos vacios y elementos decorativos irrelevantes.
- No renderices textos, titulares, letras, rotulos, marcas de agua, logotipos ni tipografia dentro de la imagen, salvo que sea estrictamente inevitable y natural en la escena.
- Si aparece texto incidental en el entorno, debe ser minimo, secundario y no protagonista.
- Sin marcos, sin interfaz de app, sin capturas de pantalla, sin diseno de poster.
- La imagen debe funcionar como portada de noticia profesional.`;

export default function AdminSettings() {
  const [user, setUser] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [selectedImageModel, setSelectedImageModel] = useState("gemini-3.1-flash-image-preview");
  const [selectedImageSize, setSelectedImageSize] = useState("1K");
  const [articlePromptTemplate, setArticlePromptTemplate] = useState(DEFAULT_ARTICLE_PROMPT_TEMPLATE);
  const [imagePromptTemplate, setImagePromptTemplate] = useState(DEFAULT_IMAGE_PROMPT_TEMPLATE);
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
        if (data.gemini_image_model) setSelectedImageModel(data.gemini_image_model);
        if (data.gemini_image_size) setSelectedImageSize(data.gemini_image_size);
        if (data.article_prompt_template) setArticlePromptTemplate(data.article_prompt_template);
        if (data.image_prompt_template) setImagePromptTemplate(data.image_prompt_template);
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

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
          gemini_image_model: selectedImageModel,
          gemini_image_size: selectedImageSize,
          article_prompt_template: articlePromptTemplate,
          image_prompt_template: imagePromptTemplate,
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

  const activeCategories = categories.filter((cat) => cat.is_active).length;
  const inactiveCategories = categories.filter((cat) => !cat.is_active).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(7,57,117,0.14),_transparent_34%),linear-gradient(180deg,_#f7f8fb_0%,_#eef2f7_100%)] pb-20">
      <AdminHeader user={user} currentTitle="Configuración" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#eef6ff_52%,_#f8fbff_100%)] text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.5fr_1fr] lg:px-10">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-dr-blue">Centro de Control</p>
              <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Configura IA, respaldos y estructura editorial sin mezclar contextos.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Esta pantalla ahora separa decisiones creativas, seguridad operativa y organización del portal para que cada área se administre con más claridad.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700">
                  Texto: {selectedModel}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700">
                  Imagen: {selectedImageModel}
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                  {backups.length} respaldos listos
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">IA Activa</div>
                <div className="mt-4 text-3xl font-black text-slate-950">{apiKey ? "OK" : "--"}</div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {apiKey ? "La llave de Gemini esta cargada y lista para texto e imagen." : "Falta agregar la API key para habilitar las funciones de IA."}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Categorias</div>
                <div className="mt-4 text-3xl font-black text-slate-950">{activeCategories}</div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {inactiveCategories > 0 ? `${inactiveCategories} categoria(s) inactiva(s) en reserva.` : "Todas las categorias actuales estan activas."}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Backups</div>
                <div className="mt-4 text-3xl font-black text-slate-950">{backupFreq}h</div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Frecuencia automatica con un tope total configurado de {backupLimit} GB.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_0.95fr]">
          <section className="space-y-8">
            <form onSubmit={handleSave} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 md:px-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Estudio de IA</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Motores y estilo editorial</h2>
                  </div>
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs font-semibold text-cyan-950">
                    Ajusta aqui solo lo relacionado con generacion de texto e imagen.
                  </div>
                </div>
              </div>

              <div className="space-y-8 px-6 py-6 md:px-8 md:py-8">
                {message.text && (
                  <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-dr-red"}`}>
                    {message.text}
                  </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Credenciales</div>
                    <h3 className="mt-2 text-lg font-black text-slate-900">Acceso principal</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      La misma llave controla la redaccion automatica y la generacion visual.
                    </p>
                    <div className="mt-5">
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Google Gemini API Key</label>
                      <input
                        type="password"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                        placeholder="Introduzca su API Key de Gemini"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Modelos</div>
                    <h3 className="mt-2 text-lg font-black text-slate-900">Separacion por medio</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Mantiene desacoplados el flujo de redaccion y el flujo de ilustracion.
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Modelo de Texto</label>
                        <select
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                        >
                          <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                          <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite Preview</option>
                          <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Modelo de Imagen</label>
                        <select
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                          value={selectedImageModel}
                          onChange={(e) => setSelectedImageModel(e.target.value)}
                        >
                          <option value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image Preview</option>
                          <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image Preview</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Resolucion Imagen</label>
                        <select
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                          value={selectedImageSize}
                          onChange={(e) => setSelectedImageSize(e.target.value)}
                        >
                          <option value="1K">1K (Menor costo)</option>
                          <option value="2K">2K (Balanceado)</option>
                          <option value="4K">4K (Mayor costo)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-dr-blue">Direccion Editorial</p>
                      <h3 className="mt-2 text-xl font-black tracking-tight">Plantilla de prompt de texto</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Controla como Gemini redacta el titulo y el cuerpo del articulo a partir de la fuente original.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArticlePromptTemplate(DEFAULT_ARTICLE_PROMPT_TEMPLATE)}
                      className="inline-flex h-fit items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-dr-blue transition hover:bg-blue-50"
                    >
                      Restaurar default
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    className="mt-6 w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 font-mono text-xs leading-6 text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                    value={articlePromptTemplate}
                    onChange={(e) => setArticlePromptTemplate(e.target.value)}
                  />
                  <p className="mt-3 text-[11px] leading-5 text-slate-500">
                    Variables disponibles: {"{source_url}"}, {"{category}"}, {"{source_content}"}, {"{source_excerpt}"} y {"{article_context}"}.
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] p-6 text-slate-900">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-dr-blue">Direccion Visual</p>
                      <h3 className="mt-2 text-xl font-black tracking-tight">Plantilla de prompt de imagen</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Aqui defines como Gemini interpreta el titulo, la categoria y el contenido al construir la portada. El sistema ya empuja a evitar texto dentro de la imagen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImagePromptTemplate(DEFAULT_IMAGE_PROMPT_TEMPLATE)}
                      className="inline-flex h-fit items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-dr-blue transition hover:bg-blue-50"
                    >
                      Restaurar default
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    className="mt-6 w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 font-mono text-xs leading-6 text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                    value={imagePromptTemplate}
                    onChange={(e) => setImagePromptTemplate(e.target.value)}
                  />
                  <p className="mt-3 text-[11px] leading-5 text-slate-500">
                    Variables disponibles: {"{title}"}, {"{category}"}, {"{content_excerpt}"}, {"{content}"} y {"{article_context}"}.
                  </p>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">Guardar configuracion de IA</div>
                    <p className="mt-1 text-sm text-slate-500">
                      Guarda credenciales, modelos y comportamiento visual en una sola accion.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-full bg-dr-blue px-6 py-3 text-xs font-black uppercase tracking-[0.24em] text-white transition hover:bg-blue-900 disabled:bg-slate-400"
                  >
                    {isLoading ? "Guardando..." : "Guardar IA"}
                  </button>
                </div>
              </div>
            </form>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-rose-50/70 px-6 py-5 md:px-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-rose-500">Taller Editorial</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Categorias de publicacion</h2>
                  </div>
                  {!isEditingCat && (
                    <button
                      onClick={() => setIsEditingCat(true)}
                      className="inline-flex items-center justify-center rounded-full bg-dr-red px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-red-700"
                    >
                      Nueva categoria
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-8 px-6 py-6 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                        {catForm.id ? "Edicion" : "Formulario"}
                      </div>
                      <h3 className="mt-2 text-lg font-black text-slate-900">
                        {isEditingCat ? (catForm.id ? "Editar categoria" : "Crear categoria") : "Abre el editor"}
                      </h3>
                    </div>
                    {isEditingCat && (
                      <button
                        type="button"
                        onClick={() => { setIsEditingCat(false); setCatForm({ id: null, name: "", slug: "", order: 0, is_active: true }); }}
                        className="rounded-full border border-slate-300 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                      >
                        Cerrar
                      </button>
                    )}
                  </div>

                  {isEditingCat ? (
                    <form onSubmit={handleSaveCategory} className="mt-6 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Nombre</label>
                          <input
                            type="text"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                            value={catForm.name}
                            onChange={(e) => handleCatNameChange(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Slug (URL)</label>
                          <input
                            type="text"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-mono text-sm text-slate-500"
                            value={catForm.slug}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-[0.7fr_1fr]">
                        <div>
                          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Orden</label>
                          <input
                            type="number"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-dr-blue focus:ring-2 focus:ring-dr-blue/20"
                            value={catForm.order}
                            onChange={(e) => setCatForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                          />
                        </div>
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <input
                            type="checkbox"
                            id="cat_active"
                            checked={catForm.is_active}
                            onChange={(e) => setCatForm(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span className="text-sm font-bold text-slate-700">Categoria activa y visible para nuevas publicaciones</span>
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-full bg-dr-red py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white transition hover:bg-red-700"
                      >
                        {catForm.id ? "Actualizar categoria" : "Crear categoria"}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                      <p className="text-sm font-semibold text-slate-600">
                        Usa "Nueva categoria" o edita una existente desde el listado de la derecha.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {isCatLoading ? (
                    <p className="rounded-3xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                      Cargando categorias...
                    </p>
                  ) : categories.map((cat) => (
                    <div key={cat.id} className={`rounded-3xl border p-4 transition ${!cat.is_active ? "border-slate-200 bg-slate-100/80 opacity-75" : "border-slate-200 bg-white shadow-sm hover:border-slate-300"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-black text-slate-900">{cat.name}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500">/{cat.slug}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-dr-blue">
                              Orden {cat.order}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${cat.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                              {cat.is_active ? "Activa" : "Inactiva"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditCategory(cat)} className="rounded-full border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="rounded-full border border-red-200 p-2 text-dr-red transition hover:bg-red-50">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && !isCatLoading && (
                    <p className="rounded-3xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm font-semibold text-slate-500">
                      No hay categorias configuradas.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-8">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-emerald-50/70 px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">Centro de Respaldo</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Politica y ejecucion</h2>
                  </div>
                  <button
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
                  >
                    {isCreatingBackup ? "Procesando..." : "Crear backup"}
                  </button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Politica automatica</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Frecuencia backup (horas)</label>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        value={backupFreq}
                        onChange={(e) => setBackupFreq(parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Limite total (GB)</label>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        value={backupLimit}
                        onChange={(e) => setBackupLimit(parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700 transition hover:bg-emerald-50 disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {isLoading ? "Guardando..." : "Guardar politica"}
                  </button>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Archivos disponibles</div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{backups.length} items</div>
                  </div>
                  <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                    {isBackupLoading ? (
                      <p className="rounded-3xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                        Cargando archivos...
                      </p>
                    ) : backups.map((b) => (
                      <div key={b.filename} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
                        <div className="text-sm font-black text-slate-900">{b.filename}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                            {formatSize(b.size)}
                          </span>
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                            {new Date(b.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleRestoreBackup(b.filename)}
                            className="flex-1 rounded-full bg-dr-blue px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-blue-900"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(b.filename)}
                            className="rounded-full border border-red-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-dr-red transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                    {backups.length === 0 && !isBackupLoading && (
                      <p className="rounded-3xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm font-semibold text-slate-500">
                        No hay respaldos disponibles.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-blue-50/70 px-6 py-5">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-dr-blue">Accesos Rapidos</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Herramientas conectadas</h2>
              </div>
              <div className="space-y-4 px-6 py-6">
                <Link href="/admin/fuentes" className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-dr-blue hover:bg-white">
                  <div className="rounded-2xl bg-blue-100 p-3 text-dr-blue transition group-hover:bg-dr-blue group-hover:text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">Fuentes para IA</div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Administra portales y feeds RSS usados para descubrir noticias candidatas.
                    </p>
                  </div>
                </Link>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-dr-blue">Nota operativa</div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    La configuracion de IA y la politica de backups se guardan por separado en esta interfaz, aunque comparten el mismo endpoint de perfil para preservar la funcionalidad existente.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
