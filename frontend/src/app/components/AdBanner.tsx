import Link from "next/link";

interface AdBannerProps {
  position: string;
  className?: string;
}

async function getAdForPosition(position: string) {
  try {
    // We use the interior network URL for server-side fetch
    const res = await fetch(`http://backend:8000/api/ads?position=${position}&active_only=true`, { cache: 'no-store' });
    if (!res.ok) return null;
    const ads = await res.json();
    if (ads.length === 0) return null;
    
    // For now, let's just pick the first one. 
    // In the future we could implement rotation or random selection.
    return ads[0];
  } catch (error) {
    console.error(`Error fetching ad for ${position}:`, error);
    return null;
  }
}

export default async function AdBanner({ position, className = "" }: AdBannerProps) {
  const ad = await getAdForPosition(position);

  if (!ad) {
    // Placeholder if no ad is found, keeping same dimensions
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

  const imageUrl = ad.image_url.startsWith('http') 
    ? ad.image_url 
    : `https://diariodigital.delioserver.duckdns.org${ad.image_url}`;

  return (
    <div className={`w-full overflow-hidden border border-border shadow-sm rounded-sm relative group ${className}`}>
      <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
        <img 
          src={imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
        />
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest backdrop-blur-sm">
            Publicidad
        </div>
      </Link>
    </div>
  );
}
