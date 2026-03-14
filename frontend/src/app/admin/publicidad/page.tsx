"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";

export default function AdminAdsPage() {
    const [user, setUser] = useState<any>(null);
    const [ads, setAds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    
    // Form state for new/edit ad
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [position, setPosition] = useState("header");
    const [isActive, setIsActive] = useState(true);
    const [rotationSeconds, setRotationSeconds] = useState(5);
    const [editingId, setEditingId] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin");
            return;
        }

        // Fetch user
        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => router.push("/admin"));

        // Fetch ads
        fetchAds();
    }, [router]);

    const fetchAds = async () => {
        try {
            const res = await fetch("/api/ads");
            const data = await res.json();
            setAds(data);
        } catch (error) {
            console.error("Error fetching ads:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            setImageUrl(data.url);
        } catch (error) {
            alert("Error al subir la imagen.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const token = localStorage.getItem("admin_token");
        const adData = {
            title,
            image_url: imageUrl,
            link_url: linkUrl,
            position,
            is_active: isActive,
            rotation_seconds: rotationSeconds
        };

        try {
            const url = editingId ? `/api/ads/${editingId}` : "/api/ads";
            const method = editingId ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(adData)
            });

            if (res.ok) {
                resetForm();
                fetchAds();
                setIsAddingNew(false);
            } else {
                alert("Error al guardar el anuncio.");
            }
        } catch (error) {
            alert("Error de conexión.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (ad: any) => {
        setEditingId(ad.id);
        setTitle(ad.title);
        setImageUrl(ad.image_url);
        setLinkUrl(ad.link_url);
        setPosition(ad.position);
        setIsActive(ad.is_active);
        setRotationSeconds(ad.rotation_seconds || 5);
        setIsAddingNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este anuncio?")) return;
        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`/api/ads/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchAds();
            }
        } catch (error) {
            alert("Error al eliminar.");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle("");
        setImageUrl("");
        setLinkUrl("");
        setPosition("header");
        setIsActive(true);
        setRotationSeconds(5);
    };

    if (isLoading || !user) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-50 pb-20">
            <AdminHeader user={user} currentTitle="Publicidad" />

            <main className="max-w-7xl mx-auto py-6 md:py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Gestión de Publicidad</h1>
                    {!isAddingNew && (
                        <button 
                            onClick={() => { resetForm(); setIsAddingNew(true); }}
                            className="w-full md:w-auto bg-dr-blue text-white px-6 py-3 rounded-sm shadow-lg hover:bg-blue-900 transition-all font-bold text-center text-sm md:text-base uppercase tracking-widest"
                        >
                            + Nuevo Anuncio
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Formulario */}
                    {isAddingNew && (
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-20 animate-in fade-in slide-in-from-top-4">
                                <div className="flex justify-between items-center mb-6 border-b pb-3">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingId ? "Editar Anuncio" : "Nuevo Anuncio"}
                                    </h2>
                                    <button onClick={() => setIsAddingNew(false)} className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Título Interno (Referencia)</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-dr-blue outline-none" 
                                            placeholder="Ej: Patrocinio Banco Popular"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">URL de Destino (Link)</label>
                                        <input 
                                            type="url" 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-dr-blue outline-none" 
                                            placeholder="https://..."
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Posición</label>
                                        <select 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-dr-blue outline-none bg-white font-bold"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                        >
                                            <option value="header">Superior (728x90)</option>
                                            <option value="sidebar_top">Lateral Superior (300x250/600)</option>
                                            <option value="sidebar_bottom">Lateral Inferior</option>
                                            <option value="content_middle">Inferior</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Segundos de Rotación</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-dr-blue outline-none" 
                                                value={rotationSeconds}
                                                onChange={(e) => setRotationSeconds(parseInt(e.target.value))}
                                                required
                                            />
                                            <span className="text-xs font-bold text-gray-400 uppercase">Segs</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 italic">* Tiempo que se muestra cada anuncio en el carrusel.</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Imagen del Anuncio</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-dr-blue/10 file:text-dr-blue hover:file:bg-dr-blue/20"
                                            onChange={handleImageUpload}
                                        />
                                        {imageUrl && (
                                            <div className="mt-4 p-3 border rounded-sm bg-gray-50 shadow-inner">
                                                <p className="text-[10px] text-gray-400 break-all mb-2 font-mono">{imageUrl}</p>
                                                <img src={imageUrl.startsWith('http') ? imageUrl : `https://diariodigital.delioserver.duckdns.org${imageUrl}`} className="max-h-40 mx-auto rounded shadow-sm" alt="Preview"/>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-sm border border-blue-100">
                                        <input 
                                            type="checkbox" 
                                            id="is_active" 
                                            className="w-5 h-5 rounded text-dr-blue focus:ring-dr-blue border-gray-300"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer uppercase tracking-tight">Anuncio Activo</label>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="flex-grow bg-dr-red text-white py-3 rounded-sm font-black uppercase text-xs tracking-widest shadow-lg hover:bg-red-700 transition-all disabled:grayscale active:scale-95"
                                        >
                                            {isSaving ? "Guardando..." : editingId ? "Actualizar" : "Publicar"}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { resetForm(); setIsAddingNew(false); }}
                                            className="px-6 py-3 border border-gray-300 rounded font-bold text-gray-500 hover:bg-gray-50 text-xs uppercase"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Tabla de Resultados / Cards */}
                    <div className={isAddingNew ? "lg:col-span-2" : "lg:col-span-3"}>
                        <div className="space-y-6">
                            {/* Listado de Anuncios */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ads.map((ad) => (
                                    <div key={ad.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="aspect-[21/9] bg-gray-100 relative group overflow-hidden">
                                            <img 
                                                src={ad.image_url.startsWith('http') ? ad.image_url : `https://diariodigital.delioserver.duckdns.org${ad.image_url}`} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                alt={ad.title}
                                            />
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-sm ${ad.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                    {ad.is_active ? 'Activo' : 'Pausado'}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-4">
                                                <button onClick={() => handleEdit(ad)} className="bg-white text-dr-blue p-2 rounded-full shadow hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                                                <button onClick={() => handleDelete(ad.id)} className="bg-dr-red text-white p-2 rounded-full shadow hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900 truncate pr-4">{ad.title}</h3>
                                                <span className="text-[10px] font-black text-dr-blue uppercase opacity-60 tracking-tighter whitespace-nowrap">
                                                    {ad.position === 'header' ? 'Superior' : 
                                                     ad.position === 'sidebar_top' ? 'Lat. Superior' : 
                                                     ad.position === 'sidebar_bottom' ? 'Lat. Inferior' : 
                                                     ad.position === 'content_middle' ? 'Inferior' : ad.position}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-mono truncate mb-4">{ad.link_url}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(ad)} className="flex-grow py-2 bg-blue-50 text-dr-blue text-[10px] font-black uppercase tracking-widest rounded hover:bg-blue-100 transition-colors">Editar</button>
                                                <button onClick={() => handleDelete(ad.id)} className="px-4 py-2 bg-red-50 text-dr-red text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-100 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ads.length === 0 && (
                                    <div className="col-span-full py-20 bg-white border border-gray-200 border-dashed rounded-lg text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">No hay anuncios configurados</p>
                                        <button onClick={() => setIsAddingNew(true)} className="mt-4 text-dr-blue font-black hover:underline text-xs">+ CREAR PRIMER ANUNCIO</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
