"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify/${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.detail || "¡Tu cuenta ha sido verificada exitosamente!");
        } else {
          setStatus("error");
          setMessage(data.detail || "Hubo un error al verificar tu cuenta.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error de conexión al servidor.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dr-blue mx-auto"></div>
          <p className="text-gray-600 font-medium whitespace-pre-wrap">Verificando tu cuenta...</p>
        </div>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Verificación Exitosa!</h2>
          <p className="mt-4 text-gray-600 whitespace-pre-wrap">{message}</p>
          <div className="mt-8">
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold rounded-sm text-white bg-dr-blue hover:bg-dr-blue/90 transition-all uppercase tracking-widest">
              Iniciar Sesión
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Error de Verificación</h2>
          <p className="mt-4 text-red-600 font-medium whitespace-pre-wrap">{message}</p>
          <div className="mt-8">
            <Link href="/registro" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-sm font-bold rounded-sm text-gray-700 bg-white hover:bg-gray-50 transition-all uppercase tracking-widest">
              Intentar Registrarse de Nuevo
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dr-blue mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
