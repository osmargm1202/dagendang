"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const SOCIAL_BUTTONS = [
  { label: "Instagram", icon: "IG" },
  { label: "X", icon: "X" },
  { label: "Facebook", icon: "FB" },
  { label: "WhatsApp", icon: "WA" },
  { label: "Teléfono Tony", icon: "☎" },
];

export default function SiteFooter() {
  const pathname = usePathname();

  // Hide the public footer in the CMS admin area
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-surface-container-highest dark:bg-dark-surface border-t border-border-light dark:border-border-dark mt-12">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-serif font-bold text-primary dark:text-primary-fixed-dim mb-3">DAgenda<span className="text-[#b6171e]">NG</span></h2>
          <p className="text-on-surface-variant dark:text-surface-variant mb-5">Periodismo con autoridad. De Agenda con Nelson Gómez.</p>
          <div className="flex flex-wrap gap-2" aria-label="Redes sociales">
            {SOCIAL_BUTTONS.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                title={`${item.label} (pendiente)`}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border dark:border-border-dark bg-surface dark:bg-dark-bg px-3 text-xs font-black uppercase tracking-widest text-primary dark:text-primary-fixed-dim transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary-fixed-dim dark:hover:text-dark-bg"
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
        <nav className="flex flex-col gap-2 text-sm text-on-surface-variant dark:text-surface-variant">
          <Link href="/">Inicio</Link>
          <Link href="/buscar">Buscar</Link>
          <Link href="/registro">Suscripción</Link>
        </nav>
        <div className="text-sm text-on-surface-variant dark:text-surface-variant">
          <p>&copy; {new Date().getFullYear()} DAgendaNG.</p>
          <p>Derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
