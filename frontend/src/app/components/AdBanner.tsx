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

export default function AdBanner({ position, className = "" }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/ads?position=${position}&active_only=true`);
        if (res.ok) {
          const data = await res.json();
          setAds(data);
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

    const currentAd = ads[currentIndex];
    const intervalTime = (currentAd.rotation_seconds || 5) * 1000;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [ads, currentIndex]);

  if (loading) {
     return <div className={`w-full bg-muted animate-pulse rounded-sm ${position.includes("sidebar") ? "aspect-[300/600]" : "h-32"} ${className}`} />;
  }

  if (ads.length === 0) {
    let dimensions = "728x90";
    let aspectClass = "h-32";
    
    if (position.includes("sidebar")) {
        dimensions = "300x600";
        aspectClass = "aspect-[300/600]";
    }

    return (
      <div className={`w-full bg-muted flex items-center justify-center border border-border text-muted-foreground font-mono text-xs text-center px-4 rounded-sm ${aspectClass} ${className}`}>
        [ ESPACIO DISPONIBLE - {dimensions} ]
      </div>
    );
  }

  const ad = ads[currentIndex];
  const imageUrl = ad.image_url.startsWith('http') 
    ? ad.image_url 
    : ad.image_url; // already a relative path like /uploads/... — served via Next.js rewrite proxy

  // Strict dimensions for header to prevent layout shift
  const isHeader = position === 'header';
  const containerClasses = isHeader 
    ? "w-full aspect-[4/1] md:aspect-[728/90] mx-auto" 
    : "w-full";

  return (
    <div className={`overflow-hidden border border-border shadow-sm relative group transition-all duration-1000 ${containerClasses} ${className}`}>
      <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        <img 
          key={ad.id}
          src={imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 animate-in fade-in zoom-in-95 duration-700"
        />
        <div className="absolute top-0 right-0 bg-black/50 text-[10px] text-white px-1 font-sans">
            Publicidad {ads.length > 1 && `(${currentIndex + 1}/${ads.length})`}
        </div>
      </Link>
    </div>
  );
}
