"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Fetch user profile
    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Invalid token");
      return res.json();
    })
    .then(data => setUser(data))
    .catch(() => {
      localStorage.removeItem("admin_token");
      router.push("/admin");
    });

    // Fetch articles
    fetch("/api/articles")
    .then(res => res.json())
    .then(data => setArticles(data))
    .catch(err => console.error(err));

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta noticia?")) return;
    
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setArticles(articles.filter(article => article.id !== id));
      } else {
        alert("Hubo un error al eliminar el artículo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al intentar eliminar.");
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
            <div className="flex items-center gap-6">
              <Link href="/admin/fuentes" className="text-sm hover:underline font-medium">Fuentes IA</Link>
              <Link href="/admin/configuracion" className="text-sm hover:underline font-medium">Configuración</Link>
              <span className="text-sm border-r border-blue-400 pr-4">
                {user.full_name} ({user.role})
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm bg-dr-red hover:bg-dr-red/90 px-4 py-2 rounded transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold text-gray-900">Artículos Publicados</h1>
          <Link href="/admin/noticias/nuevo" className="bg-dr-blue text-white px-6 py-2 rounded shadow hover:bg-dr-blue/90 transition-colors font-semibold">
            + Nuevo Artículo
          </Link>
        </div>

        {/* Articles list - Desktop Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Fecha de Publicación
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">{article.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                        {article.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{article.author || 'Redacción'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.published_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.status === 'draft' ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Borrador
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Publicado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/noticias/${article.id}`} className="text-dr-blue hover:text-blue-900 transition-colors mr-4" target="_blank">
                        Ver
                      </Link>
                      <Link href={`/admin/noticias/${article.id}/editar`} className="text-gray-600 hover:text-dr-blue transition-colors font-semibold mr-4">
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="text-dr-red hover:text-red-900 transition-colors font-semibold"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No hay artículos publicados aún. Empieza creando tu primera noticia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
