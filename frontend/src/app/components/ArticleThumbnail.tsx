import Image from "next/image";

const IMAGE_PLACEHOLDER = "/images/news-placeholder.png";

type ArticleThumbnailProps = {
  imageUrl?: string | null;
  title: string;
  isPremium?: boolean;
  sizes: string;
  className?: string;
};

export default function ArticleThumbnail({ imageUrl, title, isPremium = false, sizes, className = "" }: ArticleThumbnailProps) {
  return (
    <div className={`relative w-full aspect-video bg-muted overflow-hidden flex items-center justify-center border border-border-light dark:border-border-dark ${className}`}>
      <Image
        src={imageUrl || IMAGE_PLACEHOLDER}
        alt={imageUrl ? title : "Imagen no disponible"}
        fill
        sizes={sizes}
        className="object-contain transition-transform duration-500"
      />
      {isPremium && (
        <span className="absolute left-0 right-0 top-0 bg-yellow-400 py-1.5 text-center text-xs md:text-sm font-black uppercase tracking-[0.2em] text-black shadow-sm">
          PREMIUM
        </span>
      )}
    </div>
  );
}
