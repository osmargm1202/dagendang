"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "../../../../components/AdminHeader";

export default function EditArticle() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("editorial");
  const [author, setAuthor] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [adImagePreview, setAdImagePreview] = useState<string>("");
  const [existingAdImageUrl, setExistingAdImageUrl] = useState<string | null>(null);
  const [adLink, setAdLink] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);
  const router = useRouter();

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
        // Fetch existing article data
        return fetch(`/api/articles/${id}`);
      })
      .then(res => {
        if (!res.ok) throw new Error("Artículo no encontrado");
        return res.json();
      })
      .then(article => {
        setTitle(article.title);
        setContent(article.content);
        setType(article.type);
        setAuthor(article.author);
        setIsPremium(article.is_premium || false);
        if (article.image_url) {
          setExistingImageUrl(article.image_url);
          setImagePreview(article.image_url);
        }
        if (article.ad_image_url) {
          setExistingAdImageUrl(article.ad_image_url);
          setAdImagePreview(article.ad_image_url);
        }
        if (article.ad_link) {
          setAdLink(article.ad_link);
        }
        setIsFetching(false);
      })
      .catch((err) => {
        if (err.message === "Invalid token") {
          localStorage.removeItem("admin_token");
          router.push("/admin");
        } else {
          setError("Error al cargar el artículo. Puede que no exista.");
          setIsFetching(false);
        }
      });

    // Fetch categories
    fetch("/api/articles/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));

  }, [router, id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImageUrl(null);
    }
  };

  const handleAdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdImageFile(file);
      setAdImagePreview(URL.createObjectURL(file));
      setExistingAdImageUrl(null);
    }
  };

  const submitArticle = async (status: string) => {
    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("admin_token");
    let uploadedImageUrl = existingImageUrl;

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
      }

      let uploadedAdImageUrl = existingAdImageUrl;
      if (adImageFile) {
        const adFormData = new FormData();
        adFormData.append("file", adImageFile);
        const adUploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: adFormData
        });
        if (!adUploadRes.ok) throw new Error("Error al subir la imagen de la publicidad.");
        const adUploadData = await adUploadRes.json();
        uploadedAdImageUrl = adUploadData.url;
      }

      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
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
          ad_image_url: uploadedAdImageUrl,
          ad_link: adLink,
          is_premium: isPremium,
          is_active: true
        })
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el artículo.");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isFetching) return <div className="w-full p-10 text-center text-lg text-gray-600">Cargando Artículo...</div>;

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-20">
      <AdminHeader user={user} currentTitle="Editar Noticia" />

      <main className="max-w-7xl mx-auto py-6 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border pb-5">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Editar Noticia
          </h1>
        </div>

        {error && (
          <div className="bg-dr-red/10 border-l-4 border-dr-red p-4 mb-6 rounded-r-md">
            <p className="text-sm text-dr-red font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Editor Section (Left/Center) */}
          <div className="flex-grow lg:w-2/3 space-y-6">
            <div className="bg-card shadow sm:rounded-lg border border-border p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-1">Título de la Noticia</label>
                  <input
                    type="text"
                    id="title"
                    required
                    placeholder="Escribe un título descriptivo y llamativo..."
                    className="mt-1 block w-full px-4 py-3 bg-background border border-border text-foreground rounded-md shadow-sm focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-lg font-medium placeholder:text-muted-foreground"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-semibold text-foreground mb-1">Cuerpo de la Noticia</label>
                  <textarea
                    id="content"
                    required
                    rows={18}
                    className="mt-1 block w-full px-4 py-4 bg-background border border-border text-foreground rounded-md shadow-sm focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-base leading-relaxed placeholder:text-muted-foreground"
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
            <div className="bg-card shadow sm:rounded-lg border border-border p-6">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 mb-4">Configuración de Publicación</h3>

              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Imagen de Portada</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md relative group cursor-pointer hover:border-dr-blue transition-colors">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                          <span className="text-white font-medium text-sm">Cambiar Imagen</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-muted-foreground justify-center">
                          <span className="relative cursor-pointer bg-card rounded-md font-medium text-dr-blue hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-dr-blue">
                            Subir un archivo
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP hasta 5MB</p>
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
                  <label htmlFor="type" className="block text-sm font-medium text-muted-foreground mb-1">Categoría</label>
                  <select
                    id="type"
                    className="block w-full pl-3 pr-10 py-2.5 bg-background border border-border text-foreground rounded-md focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-muted-foreground mb-1">Autor Asignado</label>
                  <input
                    type="text"
                    id="author"
                    className="block w-full px-3 py-2.5 bg-background border border-border text-foreground rounded-md shadow-sm focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-dr-blue/5 rounded-md border border-dr-blue/20">
                  <input
                    id="is_premium"
                    type="checkbox"
                    className="h-5 w-5 text-dr-blue focus:ring-dr-blue border-border rounded cursor-pointer"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                  />
                  <label htmlFor="is_premium" className="text-sm font-bold text-foreground cursor-pointer">
                    💎 Contenido Premium
                  </label>
                </div>

                {/* Sección de Publicidad */}
                <div className="pt-6 border-t border-border">
                  <h4 className="text-sm font-bold text-dr-blue uppercase tracking-wider mb-4">Publicidad del Artículo</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase">Imagen Publicitaria</label>
                      <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-border border-dashed rounded-md relative group cursor-pointer hover:border-dr-blue transition-colors bg-background">
                        {adImagePreview ? (
                          <div className="relative w-full aspect-[16/5]">
                            <img src={adImagePreview} alt="Ad Preview" className="w-full h-full object-cover rounded shadow-inner" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                              <span className="text-white font-bold text-xs uppercase">Cambiar</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center py-2">
                            <svg className="mx-auto h-8 w-8 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Banner (Ej. 1200x400)</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleAdImageChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ad_link" className="block text-xs font-medium text-muted-foreground mb-1 uppercase">Enlace del Anuncio</label>
                      <input
                        type="url"
                        id="ad_link"
                        placeholder="https://ejemplo.com/promo"
                        className="block w-full px-3 py-2 bg-background border border-border text-foreground rounded-md shadow-sm focus:ring-dr-blue focus:border-dr-blue text-xs placeholder:text-muted-foreground"
                        value={adLink}
                        onChange={(e) => setAdLink(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => submitArticle("published")}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-dr-blue hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dr-blue disabled:grayscale transition-colors uppercase tracking-wide"
                  >
                    {isLoading ? "Procesando..." : "Publicar Noticia"}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitArticle("draft")}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-border shadow-sm text-sm font-bold rounded-md text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dr-blue disabled:opacity-50 transition-colors uppercase tracking-wide"
                  >
                    {isLoading ? "Procesando..." : "Guardar Borrador"}
                  </button>
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Si publicas, el artículo estará visible en la portada inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
