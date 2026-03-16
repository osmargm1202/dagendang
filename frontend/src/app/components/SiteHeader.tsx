"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  
  // Slider State & Refs
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const startScrolling = (direction: "left" | "right") => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft += direction === "right" ? 5 : -5;
        checkScroll();
      }
    }, 16);
  };

  const stopScrolling = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

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
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-auto min-h-[90px] py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:gap-5 shrink-0">
          {/* Official Logo Image - Adjusted for natural width */}
          <div className="flex flex-col justify-center">
            <Link href="/" className="block group">
              <div className="h-16 md:h-20 flex items-center justify-center rounded-sm transition-all duration-500 group-hover:scale-105">
                <img 
                  src="/logo-header.png" 
                  alt="Logo DAgendaNG" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          <Link href="/" className="flex flex-col group select-none py-1">
            <h1 className="flex flex-col items-start translate-y-1">
              {/* Line 1: D' Agenda */}
              <span className="text-xl md:text-2xl lg:text-3xl font-serif font-black tracking-tighter uppercase text-white group-hover:text-white transition-all duration-300 drop-shadow-sm flex items-start leading-none">
                D<span className="text-blue-300 font-sans font-black align-top relative -top-[0.1em] mx-[0.5px]">`</span>&nbsp;Agenda
              </span>
              
              {/* Line 2: con (connecting line) - Compact */}
              <div className="flex items-center w-full gap-1 lg:gap-2 my-0">
                <div className="h-[0.5px] bg-white/20 flex-grow"></div>
                <span className="text-[8px] md:text-[10px] lg:text-[11px] font-serif italic font-medium lowercase text-blue-300 tracking-[0.2em] px-1">
                  con
                </span>
                <div className="h-[0.5px] bg-white/20 flex-grow"></div>
              </div>
              
              {/* Line 3: Nelson Gómez */}
              <span className="text-lg md:text-xl lg:text-2xl font-serif font-bold tracking-tight uppercase text-white leading-none">
                Nelson Gómez
              </span>
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-grow items-center justify-end h-full">
          {/* Categories Slider - Now flexible Center */}
          <div className="relative flex items-center group/slider flex-grow mx-4 lg:mx-8">
            {/* Left Arrow */}
            <div 
              className={`absolute left-0 z-10 bg-gradient-to-r from-dr-blue via-dr-blue/90 to-transparent pr-8 py-4 transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onMouseEnter={() => startScrolling("left")}
              onMouseLeave={stopScrolling}
            >
              <button className="animate-pulse">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Categories Container */}
            <div 
              ref={containerRef}
              className="flex gap-4 lg:gap-7 overflow-x-hidden scroll-smooth whitespace-nowrap px-4 py-2 no-scrollbar font-sans font-bold text-[10px] lg:text-[11px] tracking-[0.15em]"
              onScroll={checkScroll}
            >
              {categories.map(cat => (
                <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="hover:text-blue-300 transition-colors uppercase">
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            <div 
              className={`absolute right-0 z-10 bg-gradient-to-l from-dr-blue via-dr-blue/90 to-transparent pl-8 py-4 transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onMouseEnter={() => startScrolling("right")}
              onMouseLeave={stopScrolling}
            >
              <button className="animate-pulse">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          
          {/* Action Tools Cluster - COMPACT */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0 pr-1">
            {/* Search - Minimalized */}
            <form onSubmit={handleSearch} className="relative group/search h-10 flex items-center">
              <input 
                type="text" 
                placeholder="BUSCAR..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-full px-4 h-10 text-[10px] font-bold focus:outline-none focus:bg-white/10 focus:border-blue-400/50 transition-all w-10 group-hover/search:w-40 focus:w-48 overflow-hidden placeholder:text-transparent group-hover/search:placeholder:text-white/30"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <ThemeToggle />

            {isLoggedIn ? (
              <div className="flex items-center gap-2 lg:gap-3 lg:ml-2">
                {isAdmin && (
                  <Link 
                    href="/admin/dashboard" 
                    className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] font-black px-3 py-1.5 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-sm tracking-widest uppercase"
                  >
                    ADMIN
                  </Link>
                )}
                 <button 
                  onClick={handleLogout}
                  className="text-[9px] uppercase font-black text-white/50 hover:text-red-400 transition-colors px-1"
                  title="Cerrar Sesión"
                  >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center shadow-lg transition-transform hover:scale-105 shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            ) : (
              <Link href="/registro" className="px-5 py-2.5 bg-dr-red text-white text-[10px] font-black rounded-full hover:bg-red-700 transition-all uppercase shrink-0 tracking-widest shadow-lg shadow-red-900/20">
                  SUSCRIBIRSE
              </Link>
            )}
          </div>
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
        className={`md:hidden absolute top-full left-0 w-full bg-dr-blue border-t border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
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
