"use client";

import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  
  // Hide the public footer in the CMS admin area
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-muted text-muted-foreground py-12 text-center text-sm font-sans border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-4 tracking-widest">LA AGENDA</h2>
        <p>&copy; {new Date().getFullYear()} La Agenda Digital. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
