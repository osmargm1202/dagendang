"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
          role: "subscriber"
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error al registrarse");
      }

      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 text-foreground">
        <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-xl shadow-lg border border-border text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">¡Casi listo!</h2>
          <p className="mt-4 text-muted-foreground">
            Hemos enviado un correo de verificación a <strong>{email}</strong>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
          </p>
          <div className="mt-8">
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-sm text-white bg-dr-blue hover:bg-dr-blue/90 transition-all uppercase tracking-widest">
              Ir al Inicio de Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-black text-dr-blue tracking-tighter">DAgendaNG</h2>
          <h3 className="mt-4 text-xl font-bold text-foreground">
            Crea tu cuenta de suscriptor
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Acceso ilimitado a noticias premium y análisis exclusivos.
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border-l-4 border-dr-red p-4">
              <p className="text-sm text-dr-red font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <label htmlFor="full-name" className="block text-xs font-bold text-muted-foreground uppercase mb-1">Nombre Completo</label>
              <input
                id="full-name"
                type="text"
                required
                className="appearance-none rounded-sm relative block w-full px-3 py-3 border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-muted-foreground uppercase mb-1">Correo Electrónico</label>
              <input
                id="email-address"
                type="email"
                required
                className="appearance-none rounded-sm relative block w-full px-3 py-3 border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password"  className="block text-xs font-bold text-muted-foreground uppercase mb-1">Nueva Contraseña</label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none rounded-sm relative block w-full px-3 py-3 border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-dr-blue focus:border-dr-blue sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-sm text-white bg-dr-blue hover:bg-dr-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dr-blue transition-all uppercase tracking-widest disabled:bg-muted-foreground/30"
            >
              {isLoading ? "Creando Cuenta..." : "Registrarse"}
            </button>
          </div>

          <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-dr-blue font-bold hover:underline">
                      Inicia Sesión
                  </Link>
              </p>
          </div>
        </form>
      </div>
    </div>
  );
}
