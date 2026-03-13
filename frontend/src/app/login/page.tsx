"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await res.json();
      localStorage.setItem("user_token", data.access_token);
      
      // If user is admin, also store as admin_token for CMS access
      if (data.role === "admin") {
        localStorage.setItem("admin_token", data.access_token);
      }
      
      router.push("/");
      
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-black text-dr-blue tracking-tighter">LA AGENDA</h2>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Iniciar Sesión
          </h3>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border-l-4 border-dr-red p-4">
              <p className="text-sm text-dr-red font-medium">{error}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico</label>
              <input
                id="email-address"
                type="email"
                required
                className="appearance-none rounded-sm relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password"  className="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none rounded-sm relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-sm text-white bg-dr-blue hover:bg-dr-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dr-blue transition-all uppercase tracking-widest disabled:bg-gray-400"
            >
              {isLoading ? "Cargando..." : "Ingresar"}
            </button>
          </div>

          <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                  ¿No tienes cuenta?{" "}
                  <Link href="/registro" className="text-dr-blue font-bold hover:underline">
                      Regístrate aquí
                  </Link>
              </p>
          </div>
        </form>
      </div>
    </div>
  );
}
