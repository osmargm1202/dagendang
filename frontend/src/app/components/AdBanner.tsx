"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  rotation_seconds: number;
}

interface AdBannerProps {
  position: string;
  className?: string;
}

const AD_POSITION_CONFIG: Record<string, { label: string; size: string; className: string }> = {
  header: { label: "Publicidad", size: "728x90", className: "min-h-20 md:aspect-[728/90]" },
  home_left: { label: "Espacio patrocinado", size: "300x250", className: "min-h-[220px] md:min-h-[250px]" },
  home_middle: { label: "Publicidad", size: "728x90", className: "min-h-24 md:h-32" },
  sidebar_top: { label: "Publicidad", size: "300x250", className: "min-h-[220px] md:min-h-[250px]" },
  sidebar_bottom: { label: "Publicidad", size: "300x600", className: "min-h-[320px] md:min-h-[420px]" },
  article_sidebar: { label: "Espacio patrocinado", size: "300x600", className: "min-h-[320px] md:min-h-[420px]" },
};

const CONTACT_NUMBER = "829-988-3375";

export default function AdBanner({ position, className = "" }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentIndex(0);

    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/ads?position=${position}&active_only=true`);
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            setAds([]);
            return;
          }

          const data = await res.json();
          setAds(Array.isArray(data) ? data : []);
          setCurrentIndex(0);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error(`Error fetching ads for ${position}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const currentAd = ads[currentIndex] || ads[0];
    if (!currentAd) return;

    const intervalTime = (currentAd.rotation_seconds || 5) * 1000;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [ads, currentIndex]);

  const config = AD_POSITION_CONFIG[position] || AD_POSITION_CONFIG.header;

  if (loading) {
     return <div className={`w-full bg-muted animate-pulse rounded-sm ${position.includes("sidebar") ? "aspect-[300/600]" : "h-32"} ${className}`} />;
  }

  const ad = ads[currentIndex] || ads[0];

  if (!ad) {
    return (
      <div className={`w-full bg-surface-container-low dark:bg-dark-surface border border-dashed border-border-light dark:border-border-dark flex flex-col items-center justify-center text-center px-4 ${config.className} ${className}`}>
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{config.label}</span>
        <strong className="font-serif text-xl text-primary dark:text-primary-fixed-dim">Anúnciate aquí</strong>
        <span className="text-sm text-on-surface-variant dark:text-surface-variant mt-2">{config.size}</span>
        <span className="text-sm font-bold text-secondary dark:text-secondary-fixed-dim mt-3">Contacto: {CONTACT_NUMBER}</span>
      </div>
    );
  }
  const imageUrl = ad.image_url;

  // Strict dimensions for header to prevent layout shift
  const isHeader = position === 'header';
  const containerClasses = isHeader
    ? "w-full min-h-20 md:aspect-[728/90] mx-auto"
    : `${config.className} w-full`;

  return (
    <div className={`overflow-hidden border border-border-light dark:border-border-dark bg-surface dark:bg-dark-surface shadow-sm relative group transition-all duration-1000 ${containerClasses} ${className}`}>
      <Link href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full p-2 md:p-0">
        <img
          key={ad.id}
          src={imageUrl}
          alt={ad.title}
          className="w-full h-full max-h-[320px] md:max-h-none object-contain md:object-cover transition-all duration-500 group-hover:scale-[1.02] animate-in fade-in zoom-in-95 duration-700"
        />
        <div className="absolute top-0 right-0 bg-black/50 text-[10px] text-white px-2 font-sans py-0.5 rounded-bl-sm">
            Publicidad
        </div>
        {ads.length > 1 && (
          <div className="absolute bottom-0 right-0 bg-black/60 text-[10px] text-white px-2 py-0.5">
            {currentIndex + 1} / {ads.length}
          </div>
        )}
      </Link>
    </div>
  );
}
