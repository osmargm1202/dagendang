import Link from "next/link";
import type { TonyOpinion } from "@/app/lib/content";

export default function TonyColumnCard({ opinion }: { opinion: TonyOpinion | null }) {
  return (
    <section className="bg-surface-container-low border border-border-light dark:bg-dark-surface dark:border-border-dark p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary-container/10 rounded-bl-full" />
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3 mb-4 relative z-10">
        <h2 className="font-serif text-xl font-bold text-primary dark:text-primary-fixed-dim">La Columna</h2>
        <span className="text-secondary dark:text-secondary-fixed-dim text-xs font-black uppercase tracking-widest">Diaria</span>
      </div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        {opinion?.authorPhoto ? (
          <img src={opinion.authorPhoto} alt={opinion.authorName} className="w-16 h-16 rounded-full object-cover grayscale border border-border dark:border-border-dark" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold">TDR</div>
        )}
        <div>
          <h3 className="font-serif text-xl font-bold text-primary dark:text-white">{opinion?.authorName || "Tony D. Reyes"}</h3>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant dark:text-surface-variant">{opinion?.authorPosition || "Columnista"}</p>
        </div>
      </div>
      <h4 className="font-serif text-2xl font-semibold italic text-primary dark:text-white mb-3 relative z-10">
        {opinion?.title || "La mirada del día"}
      </h4>
      <p className="text-on-surface-variant dark:text-surface-variant leading-relaxed mb-4 relative z-10 line-clamp-4">
        {opinion?.summary || "Análisis y opinión sobre los temas principales de la jornada."}
      </p>
      <Link href={opinion?.slug ? `/opinion/${opinion.slug}` : "#"} className="text-secondary dark:text-primary-fixed-dim text-sm font-bold uppercase tracking-widest hover:underline relative z-10">
        Leer columna →
      </Link>
    </section>
  );
}
