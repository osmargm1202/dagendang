"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PremiumContentWrapperProps {
  content: string;
  isPremium: boolean;
}

export default function PremiumContentWrapper({ content, isPremium }: PremiumContentWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(isPremium);

  useEffect(() => {
    if (!isPremium) {
      setIsAuthorized(true);
      return;
    }

    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    if (token) {
      // In a real app, we would verify the token role here
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
    setIsChecking(false);
  }, [isPremium]);

  const paragraphs = content.split('\n');
  const teaserParagraphs = paragraphs.slice(0, 2);

  if (isChecking) {
      return (
          <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
      );
  }

  if (isPremium && !isAuthorized) {
    return (
      <div className="relative">
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-4 opacity-70">
          {teaserParagraphs.map((paragraph, i) => (
            <p key={i} className="mb-6">{paragraph}</p>
          ))}
        </div>
        
        {/* Paywall Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-4 text-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 max-w-md w-full mb-4 translate-y-4 border-t-4 border-t-dr-blue">
                <span className="text-3xl mb-4 block">💎</span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Contenido Exclusivo</h3>
                <p className="text-gray-600 mb-6 text-sm">
                    Este análisis es exclusivo para nuestros suscriptores premium. Únete hoy para acceder a toda nuestra base de datos económica.
                </p>
                <div className="space-y-3">
                    <Link href="/registro" className="block w-full py-3 bg-dr-blue text-white font-bold rounded-sm hover:bg-dr-blue/90 transition shadow-lg uppercase tracking-widest text-xs">
                        Suscribirse Ahora
                    </Link>
                    <Link href="/login" className="block w-full py-3 bg-gray-50 text-dr-blue border border-gray-200 font-bold rounded-sm hover:bg-gray-100 transition text-xs">
                        Ya soy suscriptor, iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="mb-6">{paragraph}</p>
      ))}
    </article>
  );
}
