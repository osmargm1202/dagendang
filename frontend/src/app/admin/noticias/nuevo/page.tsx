"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewArticle() {
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("editorial");
  const [author, setAuthor] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [externalImageUrl, setExternalImageUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // AI Scrawl states
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const router = useRouter();

  const handleFetchAISuggestions = async (forceAllSources = false) => {
    setIsAiLoading(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          category: forceAllSources ? null : type, 
          limit: 20 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data.suggestions);
        setShowAIModal(true);
        setIsAiLoading(false);
      } else {
        const errorData = await res.json();
        setIsAiLoading(false);
        alert(errorData.detail || "Error al obtener sugerencias.");
      }
    } catch (err) {
      setIsAiLoading(false);
      alert("Error de red al conectar con la IA.");
    }
  };

  const handleAIGenerate = async (sourceUrl: string) => {
    setIsAiLoading(true);
    setShowAIModal(false);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ source_url: sourceUrl, category: type })
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        if (data.author) setAuthor(data.author);
        if (data.image_url) {
          setExternalImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
        setIsAiLoading(false);
      } else {
        const errorData = await res.json();
        setIsAiLoading(false);
        alert(errorData.detail || "Error al generar contenido con IA.");
      }
    } catch (err) {
      setIsAiLoading(false);
      alert("Error de red al generar con IA.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Verify token and get user
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
      setAuthor(data.full_name || "Redacción");
    })
    .catch(() => {
      localStorage.removeItem("admin_token");
      router.push("/admin");
    });

  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExternalImageUrl(null); // Clear external URL if user uploads a file
    }
  };

  const submitArticle = async (status: string) => {
    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("admin_token");
    let uploadedImageUrl = null;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Error al subir la imagen principal.");
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      } else if (externalImageUrl) {
        uploadedImageUrl = externalImageUrl;
      }

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          type,
          author,
          status,
          image_url: uploadedImageUrl,
          is_premium: isPremium,
          is_active: true
        })
      });

      if (!res.ok) {
        throw new Error("No se pudo crear el artículo.");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="w-full p-10 text-center">Cargando Panel...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-dr-blue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 font-bold text-xl">
              La Agenda CMS
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm border-r border-blue-400 pr-4">
                {user.full_name} ({user.role})
              </span>
              <Link href="/admin/dashboard" className="text-sm border border-white px-4 py-2 rounded hover:bg-white hover:text-dr-blue transition-colors font-medium">
                Cancelar
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem("admin_token");
                  router.push("/admin");
                }}
                className="text-sm bg-dr-red hover:bg-dr-red/90 px-4 py-2 rounded transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-200 pb-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Artículo</h1>
          <button 
            type="button"
            onClick={() => handleFetchAISuggestions()}
            disabled={isAiLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-dr-blue to-purple-800 text-white px-6 py-2.5 rounded-md shadow-lg hover:from-dr-blue/90 hover:to-purple-900 transition-all font-bold transition-transform active:scale-95 disabled:grayscale"
          >
            {isAiLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.450 1.259l2.5 4a1 1 0 001.450-1.259l-2.5-4zm-5.09 10.125a1 1 0 01-1.414 0L3.707 10.48a1 1 0 011.414-1.414l1.586 1.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z" clipRule="evenodd" />
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
            )}
            Generar con IA (Scrawl)
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-dr-red p-4 mb-6 rounded-r-md">
            <p className="text-sm text-dr-red font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Editor Section (Left/Center) */}
          <div className="flex-grow lg:w-2/3 space-y-6">
            <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">Título de la Noticia</label>
                  <input
                    type="text"
                    id="title"
                    required
                    placeholder="Escribe un título descriptivo y llamativo..."
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-lg font-medium"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-semibold text-gray-800 mb-1">Cuerpo de la Noticia</label>
                  <textarea
                    id="content"
                    required
                    rows={18}
                    className="mt-1 block w-full px-4 py-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-base leading-relaxed"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe el contenido detallado de la noticia aquí. Los saltos de línea se respetarán en el artículo final..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Settings Section (Right) */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">Configuración de Publicación</h3>
              
              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group cursor-pointer hover:border-dr-blue transition-colors">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                          <span className="text-white font-medium text-sm">Cambiar Imagen</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-dr-blue hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-dr-blue">
                            Subir un archivo
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 5MB</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    id="type"
                    className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm bg-gray-50"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="editorial">Editorial</option>
                    <option value="economia">Economía</option>
                    <option value="empresas">Empresas</option>
                    <option value="mercados">Mercados</option>
                    <option value="opinion">Opinión</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Autor Asignado</label>
                  <input
                    type="text"
                    id="author"
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm bg-gray-50"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-md border border-yellow-100">
                  <input
                    id="is_premium"
                    type="checkbox"
                    className="h-5 w-5 text-dr-blue focus:ring-dr-blue border-gray-300 rounded cursor-pointer"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                  />
                  <label htmlFor="is_premium" className="text-sm font-bold text-gray-900 cursor-pointer">
                    💎 Contenido Premium (Suscripción)
                  </label>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => submitArticle("published")}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-dr-blue hover:bg-dr-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dr-blue disabled:bg-gray-400 transition-colors uppercase tracking-wide"
                  >
                    {isLoading ? "Procesando..." : "Publicar Noticia"}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitArticle("draft")}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 shadow-sm text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dr-blue disabled:opacity-50 transition-colors uppercase tracking-wide"
                  >
                    {isLoading ? "Procesando..." : "Guardar Borrador"}
                  </button>
                  <p className="text-xs text-center text-gray-500 pt-2">
                    Si publicas, el artículo estará visible en la portada inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* AI Suggestions Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-dr-blue flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Noticias Candidatas ({type})
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleFetchAISuggestions(true)}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold hover:bg-purple-200 transition-colors"
                >
                  🔍 Buscar en todas las fuentes
                </button>
                <button 
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
            
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
               <p className="text-sm text-gray-600 mb-4 bg-dr-blue/5 p-3 rounded-md border border-dr-blue/10">
                 He encontrado estas noticias recientes de tus fuentes configuradas. Selecciona una para que **Gemini** redacte un artículo original para <strong>La Agenda</strong>.
               </p>
               
               {aiSuggestions.length > 0 ? aiSuggestions.map((suggestion, idx) => (
                 <div key={idx} className="p-4 border rounded-lg hover:border-dr-blue hover:shadow-md transition-all group flex justify-between items-center bg-white">
                    <div className="flex-grow pr-4">
                       <h3 className="font-bold text-gray-900 group-hover:text-dr-blue transition-colors mb-1">{suggestion.title}</h3>
                       <div className="flex items-center gap-3 text-xs">
                          <span className="font-bold text-dr-red uppercase">{suggestion.source_name}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">{suggestion.original_published_at}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleAIGenerate(suggestion.source_url)}
                      className="bg-dr-blue text-white px-4 py-2 rounded font-bold text-sm whitespace-nowrap hover:bg-dr-blue/90"
                    >
                      Redactar con IA
                    </button>
                 </div>
               )) : (
                 <div className="text-center py-20 text-gray-500">
                    <svg className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    No se encontraron noticias nuevas en esta categoría hoy.
                    <button 
                      onClick={() => handleFetchAISuggestions(true)}
                      className="mt-6 block mx-auto bg-dr-blue text-white px-6 py-2 rounded-md font-bold"
                    >
                      Intentar en todas las fuentes
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
