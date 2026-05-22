"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(async (res) => {
        if (!res.ok) return [];
        const contentType = res.headers.get("content-type") || "";
        return contentType.includes("application/json") ? res.json() : [];
      })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      const adminToken = localStorage.getItem("admin_token");
      const userToken = localStorage.getItem("user_token");
      setIsLoggedIn(!!(adminToken || userToken));
      setIsAdmin(!!adminToken);
    };

    const timeoutId = window.setTimeout(syncAuth, 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsMenuOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFormattedDate(
        new Date().toLocaleDateString("es-DO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-background/95 dark:bg-dark-bg/95 backdrop-blur sticky top-0 z-50 border-b border-border-light dark:border-border-dark">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="hidden md:block flex-1 text-xs uppercase tracking-widest text-on-surface-variant dark:text-surface-variant">
            {formattedDate}
          </div>

          <Link href="/" className="flex items-center justify-center gap-3 md:flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- Existing public logo asset keeps header behavior unchanged. */}
            <img src="/logo-header.png" alt="DAgendaNG" className="h-14 md:h-16 w-auto object-contain" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center border border-border dark:border-border-dark h-10 px-3 bg-surface dark:bg-dark-surface"
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar"
                className="bg-transparent outline-none text-sm w-32 text-foreground placeholder:text-muted-foreground"
              />
              <button type="submit" className="text-primary dark:text-primary-fixed-dim" aria-label="Buscar">
                ⌕
              </button>
            </form>

            <ThemeToggle />

            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3">
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="border border-primary/30 text-primary dark:text-primary-fixed-dim px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary-fixed-dim dark:hover:text-dark-bg transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-secondary dark:text-surface-variant dark:hover:text-secondary-fixed-dim"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/registro"
                className="hidden md:inline-flex bg-primary text-primary-foreground px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-secondary transition-colors"
              >
                Suscribirse
              </Link>
            )}

            <button
              className="md:hidden text-primary dark:text-primary-fixed-dim text-2xl leading-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        <nav className="hidden md:flex justify-center gap-6 border-t border-border-light dark:border-border-dark pt-3 overflow-x-auto">
          <Link href="/" className="text-secondary text-sm font-bold uppercase tracking-widest border-b-2 border-secondary pb-1">
            Inicio
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim text-sm font-bold uppercase tracking-widest pb-1 whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 w-full bg-background dark:bg-dark-bg border-t border-border-light dark:border-border-dark shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-screen pb-8" : "max-h-0"
        }`}
      >
        <div className="px-6 pt-6">
          <form onSubmit={handleSearch} className="relative mb-8">
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface dark:bg-dark-surface border border-border-light dark:border-border-dark w-full px-4 py-3 text-xs font-bold focus:outline-none focus:border-secondary transition-all placeholder:text-muted-foreground tracking-widest text-center"
            />
            <button type="submit" className="sr-only">
              Buscar
            </button>
          </form>

          <nav className="flex flex-col gap-6 font-sans font-bold text-sm tracking-[0.2em] uppercase text-primary dark:text-primary-fixed-dim">
            <Link href="/" className="text-secondary dark:text-secondary-fixed-dim">
              Inicio
            </Link>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors">
                {cat.name}
              </Link>
            ))}

            <div className="pt-4 mt-2 border-t border-border-light dark:border-border-dark flex flex-col gap-5">
              {isLoggedIn ? (
                <div className="space-y-4">
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="block text-center bg-primary text-primary-foreground py-3 font-black tracking-widest">
                      Dashboard admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-center text-secondary dark:text-secondary-fixed-dim text-xs py-3 border border-secondary/30">
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link href="/registro" className="block text-center bg-secondary text-white py-4 font-black tracking-[0.2em]">
                  Suscribirse ahora
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
