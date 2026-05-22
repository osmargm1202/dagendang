"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

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
          <h2 className="text-3xl font-serif font-bold text-primary dark:text-primary-fixed-dim mb-3">DAgendaNG</h2>
          <p className="text-on-surface-variant dark:text-surface-variant">Periodismo con autoridad. De Agenda con Nelson Gómez.</p>
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
