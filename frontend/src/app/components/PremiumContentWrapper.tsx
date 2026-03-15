"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PremiumContentWrapperProps {
  content: string;
  isPremium: boolean;
  adImageUrl?: string | null;
  adLink?: string | null;
}

export default function PremiumContentWrapper({ 
  content, 
  isPremium, 
  adImageUrl, 
  adLink 
}: PremiumContentWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(isPremium);
  const [isUserPremium, setIsUserPremium] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isPremium) {
        setIsAuthorized(true);
        // Even if not premium article, we need to know if USER is premium to hide ads
      }

      const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
      if (token) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setIsUserPremium(userData.is_premium);
            setIsAuthorized(true);
          }
        } catch (error) {
          console.error("Error checking user premium status:", error);
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isPremium]);
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  if (isChecking) {
      return (
          <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
      );
  }

  // Define the Ad Component for internal use
  const AdComponent = adImageUrl ? (
    <div className="my-10 overflow-hidden">
      <a 
        href={adLink || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative w-full aspect-[16/5] bg-muted overflow-hidden shadow-sm border border-border">
          <img 
            src={adImageUrl.startsWith('http') ? adImageUrl : `https://dagendang.com${adImageUrl}`} 
            alt="Publicidad" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute top-0 right-0 bg-black/50 text-white text-[10px] px-1 font-sans">
            Publicidad
          </div>
        </div>
      </a>
    </div>
  ) : null;

  if (isPremium && !isAuthorized) {
    const teaserParagraphs = paragraphs.slice(0, 2);
    return (
      <div className="relative">
        <div className="prose prose-lg max-w-none text-foreground leading-relaxed mb-4 opacity-70">
          {teaserParagraphs.map((paragraph, i) => (
            <p key={i} className="mb-6">{paragraph}</p>
          ))}
        </div>
        
        {/* Paywall Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/95 to-transparent flex flex-col items-center justify-end pb-4 text-center">
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border max-w-md w-full mb-4 translate-y-4 border-t-4 border-t-dr-blue">
                <span className="text-3xl mb-4 block">💎</span>
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Contenido Exclusivo</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                    Este análisis es exclusivo para nuestros suscriptores premium. Únete hoy para acceder a toda nuestra base de datos económica.
                </p>
                <div className="space-y-3">
                    <Link href="/pago" className="block w-full py-3 bg-dr-blue text-white font-bold rounded-sm hover:bg-dr-blue/90 transition shadow-lg uppercase tracking-widest text-xs">
                        Suscribirse Ahora
                    </Link>
                    <Link href="/login" className="block w-full py-3 bg-accent text-dr-blue border border-border font-bold rounded-sm hover:bg-muted transition text-xs">
                        Ya soy suscriptor, iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Ad insertion logic for non-premium articles and non-premium users
  const insertIndex = paragraphs.length > 6 ? 3 : (paragraphs.length >= 3 ? 2 : -1);
  const showAds = !isPremium && !isUserPremium && !isChecking;

  return (
    <article className="prose prose-lg max-w-none text-foreground leading-relaxed">
      {paragraphs.map((paragraph, i) => (
        <div key={i}>
          <p className="mb-6">{paragraph}</p>
          {/* Only insert ad if NEITHER the article OR the USER is premium and at the calculated index AND we finished checking */}
          {showAds && i === insertIndex && AdComponent}
        </div>
      ))}
      {/* If article is too short for mid-insertion, append to bottom if not premium and user not premium */}
      {showAds && insertIndex === -1 && AdComponent}
    </article>
  );
}
