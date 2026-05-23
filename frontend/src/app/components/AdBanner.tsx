"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import DefaultAd from "@/app/components/DefaultAd";

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
  content_middle: { label: "Publicidad", size: "1600x500", className: "min-h-24 md:aspect-[16/5]" },
};

const IMAGE_PLACEHOLDER = "/images/news-placeholder.png";

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
        setAds([]);
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
    return <DefaultAd position={position} className={`${config.className} ${className}`} />;
  }
  const imageUrl = ad.image_url || IMAGE_PLACEHOLDER;

  // Strict dimensions for header to prevent layout shift
  const isHeader = position === 'header';
  const containerClasses = isHeader
    ? "w-full min-h-20 md:aspect-[728/90] mx-auto"
    : `${config.className} w-full`;

  return (
    <div className={`overflow-hidden border border-border shadow-sm relative group transition-all duration-1000 ${containerClasses} ${className}`}>
      <Link href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="relative block w-full h-full p-2 md:p-0">
        <Image
          key={ad.id}
          src={imageUrl}
          alt={ad.image_url ? ad.title : "Imagen no disponible"}
          fill
          sizes={isHeader ? "(min-width: 768px) 728px, calc(100vw - 40px)" : "300px"}
          className="object-contain transition-all duration-500 group-hover:scale-[1.02] animate-in fade-in zoom-in-95 duration-700"
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
