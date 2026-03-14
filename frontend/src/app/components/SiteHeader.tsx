"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/articles/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);
  

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    const userToken = localStorage.getItem("user_token");
    setIsLoggedIn(!!(adminToken || userToken));
    setIsAdmin(!!adminToken);
  }, [pathname]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Hide the public header in the CMS admin area
  if (!mounted || pathname.startsWith("/admin")) {
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
    <header className="bg-dr-blue text-white w-full shadow-md z-50 sticky top-0 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-serif font-black tracking-widest shrink-0">
          <Link href="/">LA AGENDA</Link>
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 font-sans font-semibold text-[10px] lg:text-xs tracking-widest items-center">

          <div className="flex gap-4">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="hover:text-gray-300 transition-colors uppercase">
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Search Bar Desktop */}
          <form onSubmit={handleSearch} className="relative ml-2">
            <input 
              type="text" 
              placeholder="BUSCAR..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-sm px-3 py-1.5 text-[10px] font-bold focus:outline-none focus:bg-white/20 transition-all w-32 focus:w-48 placeholder:text-white/40"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          
          <div className="mx-2 h-4 w-px bg-white/20"></div>
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-6">
              {isAdmin && (
                <Link 
                  href="/admin/dashboard" 
                  className="bg-white text-dr-blue text-[10px] font-bold px-3 py-1.5 rounded-sm hover:bg-gray-100 transition shadow-sm tracking-wider"
                >
                  ADMIN
                </Link>
              )}
               <button 
                onClick={handleLogout}
                className="text-[10px] uppercase font-bold text-blue-200 hover:text-white transition-colors"
                >
                Cerrar Sesión
              </button>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md transition-transform hover:scale-105">
                <svg className="w-5 h-5 text-dr-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          ) : (
            <Link href="/registro" className="px-5 py-2 bg-dr-red text-white font-bold rounded-sm hover:bg-red-800 transition uppercase shrink-0">
                SUSCRIBIRSE
            </Link>
          )}
        </nav>

        {/* Mobile Actions (Theme Toggle + Hamburger) */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white focus:outline-none"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full bg-dr-blue border-t border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-screen pb-8' : 'max-h-0'
        }`}
      >
        <div className="px-6 pt-6">
          {/* Search Bar Mobile */}
          <form onSubmit={handleSearch} className="relative mb-8">
            <input 
              type="text" 
              placeholder="¿QUÉ ESTÁS BUSCANDO?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-sm w-full px-4 py-3 text-xs font-bold focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/40 tracking-widest text-center"
            />
            <button type="submit" className="sr-only">BUSCAR</button>
          </form>

          <nav className="flex flex-col gap-6 font-sans font-bold text-sm tracking-[0.2em] uppercase">

            {categories.map(cat => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="hover:text-blue-300 transition-colors uppercase">
                {cat.name}
              </Link>
            ))}
            
            <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-5">
              {isLoggedIn ? (
                <div className="space-y-4">
                  {isAdmin && (
                    <Link 
                      href="/admin/dashboard" 
                      className="block text-center bg-white text-dr-blue py-3 rounded-sm font-black tracking-widest shadow-lg"
                    >
                      DASHBOARD ADMIN
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-center text-red-300 text-xs py-2 border border-red-300/30 rounded-sm"
                  >
                    CERRAR SESIÓN
                  </button>
                </div>
              ) : (
                <Link href="/registro" className="block text-center bg-dr-red text-white py-4 rounded-sm font-black tracking-[0.2em] shadow-lg">
                  SUSCRIBIRSE AHORA
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
