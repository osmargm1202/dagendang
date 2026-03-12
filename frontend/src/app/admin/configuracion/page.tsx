"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSettings() {
  const [user, setUser] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-flash-lite-latest");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
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
    })
    .catch(() => router.push("/admin"));
  }, [router]);

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
          gemini_model: selectedModel
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

  if (!user) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 uppercase-none">
      <nav className="bg-dr-blue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/admin/dashboard" className="font-bold text-xl">La Agenda CMS</Link>
          <div className="flex gap-4 items-center">
             <Link href="/admin/dashboard" className="text-sm hover:underline">Escritorio</Link>
             <button onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin"); }} className="text-sm bg-dr-red px-3 py-1 rounded">Salir</button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración del Sistema</h1>
        
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-dr-blue mb-6 border-b pb-2">Integración con Google Gemini</h2>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-dr-red border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Google Gemini API Key</label>
              <input 
                type="password"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-dr-blue outline-none"
                placeholder="Introduzca su API Key de Gemini"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">
                Esta llave se utiliza para el raspado inteligente (scrawl) y la re-redacción de noticias por IA.
                Obtén una en <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-dr-blue underline">Google AI Studio</a>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Modelo de Gemini</label>
              <select 
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-dr-blue outline-none bg-white"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="gemini-flash-lite-latest">Gemini Flash Lite (Recomendado - Ultra Rápido)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanceado)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Máxima Calidad - Más Lento)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Flash Lite es ideal para redactar rápido. Pro es mejor para análisis complejos.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-dr-blue text-white py-3 rounded font-bold hover:bg-dr-blue/90 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
