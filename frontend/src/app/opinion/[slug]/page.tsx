import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDailyOpinionBySlug } from "@/app/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dagendang.com";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const opinion = await getDailyOpinionBySlug(slug);
  if (!opinion) return { title: "Opinión | DAgendaNG" };

  return {
    title: `${opinion.title} | La Columna | DAgendaNG`,
    description: opinion.summary,
    alternates: { canonical: `${BASE_URL}/opinion/${slug}` },
    openGraph: {
      title: opinion.title,
      description: opinion.summary,
      url: `${BASE_URL}/opinion/${slug}`,
      type: "article",
      images: opinion.imageUrl ? [{ url: opinion.imageUrl }] : undefined,
    },
  };
}

export default async function OpinionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opinion = await getDailyOpinionBySlug(slug);
  if (!opinion) notFound();

  const paragraphs = (opinion.content || opinion.summary).split("\n").map((item) => item.trim()).filter(Boolean);

  return (
    <main className="w-full max-w-[920px] mx-auto px-5 md:px-10 py-10 md:py-16">
      <nav className="text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Volver al Inicio</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-secondary dark:text-secondary-fixed-dim font-semibold uppercase">La Columna</span>
      </nav>

      <article className="bg-card border border-border-light dark:border-border-dark p-6 md:p-10">
        <header className="mb-8 border-b border-border-light dark:border-border-dark pb-6">
          <span className="bg-secondary text-white font-black uppercase text-[10px] tracking-[0.2em] px-3 py-1 inline-block mb-5">
            La Columna
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#001e40] dark:text-white leading-tight mb-5 tracking-tight">
            {opinion.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{opinion.summary}</p>

          <div className="flex items-center gap-4">
            {opinion.authorPhoto ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border dark:border-border-dark">
                <Image src={opinion.authorPhoto} alt={opinion.authorName} fill sizes="64px" className="object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-surface-container border border-border flex items-center justify-center font-serif font-bold text-xs text-foreground">TDR</div>
            )}
            <div>
              <p className="font-serif text-xl font-bold text-dr-blue dark:text-white">{opinion.authorName}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{opinion.authorPosition}</p>
              {opinion.date && (
                <time className="block mt-1 text-xs text-muted-foreground">
                  {new Date(opinion.date).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              )}
            </div>
          </div>
        </header>

        <div className="font-sans text-lg text-foreground leading-[1.8] max-w-none antialiased">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={`mb-6 ${index === 0 ? "first-letter:font-serif first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
