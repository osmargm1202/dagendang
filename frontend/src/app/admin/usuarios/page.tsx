"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/app/components/AdminHeader";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      // Get current admin user info
      const meRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error("Sesión expirada");
      const meData = await meRes.json();
      setCurrentUser(meData);

      // Get all users
      const usersRes = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      } else {
        throw new Error("No tienes permisos para ver esta página.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) {
      return;
    }

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert("Usuario eliminado exitosamente.");
      } else {
        const data = await res.json();
        alert(data.detail || "Error al eliminar usuario.");
      }
    } catch (err) {
      alert("Error de conexión al servidor.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 shadow-sm max-w-md w-full text-center">
          <p className="font-bold mb-4">{error}</p>
          <button onClick={() => router.push("/admin/dashboard")} className="text-sm font-bold underline">Volver al Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={currentUser} currentTitle="Gestión de Lectores" />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-black text-dr-blue tracking-tighter uppercase">Lectores y Suscriptores</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona la comunidad de lectores de La Agenda.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Usuarios:</span>
            <span className="text-lg font-black text-dr-blue">{users.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dr-blue"></div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Cargando base de datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lector</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-dr-blue flex items-center justify-center font-bold border border-blue-100">
                            {u.full_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{u.full_name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                            Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'text-dr-blue' : 'text-gray-400'}`}>
                           {u.role}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                        {new Date().toLocaleDateString('es-DO')} {/* Simplified for now */}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.id !== currentUser?.id ? (
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="bg-red-50 text-dr-red hover:bg-dr-red hover:text-white p-2 rounded transition-all shadow-sm"
                            title="Eliminar Usuario"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 italic">Eres tú</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
