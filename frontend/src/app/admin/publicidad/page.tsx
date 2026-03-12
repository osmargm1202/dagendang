"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminAdsPage() {
    const [user, setUser] = useState<any>(null);
    const [ads, setAds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state for new/edit ad
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [position, setPosition] = useState("header");
    const [isActive, setIsActive] = useState(true);
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
            is_active: isActive
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
                alert(editingId ? "Anuncio actualizado" : "Anuncio creado");
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
    };

    if (isLoading || !user) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Nav */}
            <nav className="bg-dr-blue text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/admin/dashboard" className="flex-shrink-0 font-bold text-xl hover:text-white/80 transition-colors">
                            La Agenda CMS
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link href="/admin/dashboard" className="text-sm hover:underline font-medium opacity-80 hover:opacity-100">Noticias</Link>
                            <Link href="/admin/fuentes" className="text-sm hover:underline font-medium opacity-80 hover:opacity-100">Fuentes IA</Link>
                            <Link href="/admin/publicidad" className="text-sm border-b-2 border-white pb-1 font-bold">Publicidad</Link>
                            <Link href="/admin/configuracion" className="text-sm hover:underline font-medium opacity-80 hover:opacity-100">Configuración</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Formulario */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-10">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-3">
                                {editingId ? "Editar Anuncio" : "Nuevo Anuncio"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Título Interno (Referencia)</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border rounded-md focus:ring-dr-blue focus:border-dr-blue" 
                                        placeholder="Ej: Patrocinio Banco Popular"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">URL de Destino (Link)</label>
                                    <input 
                                        type="url" 
                                        className="w-full px-3 py-2 border rounded-md focus:ring-dr-blue focus:border-dr-blue" 
                                        placeholder="https://..."
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Posición</label>
                                    <select 
                                        className="w-full px-3 py-2 border rounded-md focus:ring-dr-blue focus:border-dr-blue"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                    >
                                        <option value="header">Superior (728x90)</option>
                                        <option value="sidebar_top">Lateral Superior (300x250/600)</option>
                                        <option value="sidebar_bottom">Lateral Inferior</option>
                                        <option value="content_middle">Dentro de Artículo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del Anuncio</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dr-blue/10 file:text-dr-blue hover:file:bg-dr-blue/20"
                                        onChange={handleImageUpload}
                                    />
                                    {imageUrl && (
                                        <div className="mt-2 p-2 border rounded bg-gray-50">
                                            <p className="text-[10px] text-gray-400 break-all mb-1">{imageUrl}</p>
                                            <img src={imageUrl.startsWith('http') ? imageUrl : `https://diariodigital.delioserver.duckdns.org${imageUrl}`} className="max-h-32 mx-auto" alt="Preview"/>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_active" 
                                        className="rounded text-dr-blue"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Anuncio Activo</label>
                                </div>
                                <div className="pt-4 flex gap-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="flex-grow bg-dr-red text-white py-2 rounded font-bold hover:bg-dr-red/90 disabled:bg-gray-400 transition-colors"
                                    >
                                        {isSaving ? "Guardando..." : editingId ? "Actualizar Anuncio" : "Publicar Anuncio"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            type="button" 
                                            onClick={resetForm}
                                            className="px-4 py-2 border rounded text-gray-500 hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Tabla de Resultados */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Anuncios en Rotación</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vista</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Referencia / Destino</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Posición</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {ads.map((ad) => (
                                            <tr key={ad.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="w-20 h-10 bg-gray-100 rounded overflow-hidden border">
                                                        <img src={ad.image_url.startsWith('http') ? ad.image_url : `https://diariodigital.delioserver.duckdns.org${ad.image_url}`} className="w-full h-full object-cover" alt=""/>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{ad.title}</div>
                                                    <div className="text-xs text-dr-blue truncate max-w-[200px]">{ad.link_url}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase tracking-tighter">
                                                        {ad.position}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {ad.is_active ? (
                                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Activo
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400">Pausado</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleEdit(ad)}
                                                        className="text-dr-blue hover:text-blue-900 mr-4"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(ad.id)}
                                                        className="text-dr-red hover:text-red-900"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {ads.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No hay anuncios configurados.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
