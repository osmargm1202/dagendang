"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Hide the public header in the CMS admin area
  if (pathname.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="bg-dr-blue text-white w-full shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-black tracking-widest"><Link href="/">LA AGENDA</Link></h1>
        <nav className="hidden md:flex gap-6 font-sans font-semibold text-xs tracking-widest items-center">
          <Link href="/" className="hover:text-gray-300 transition-colors">INICIO</Link>
          <Link href="/categoria/editorial" className="hover:text-gray-300 transition-colors">EDITORIAL</Link>
          <Link href="/categoria/economia" className="hover:text-gray-300 transition-colors">ECONOMÍA</Link>
          <Link href="/categoria/empresas" className="hover:text-gray-300 transition-colors">EMPRESAS</Link>
          <Link href="/categoria/mercados" className="hover:text-gray-300 transition-colors">MERCADOS</Link>
          <Link href="/categoria/opinion" className="hover:text-gray-300 transition-colors">OPINIÓN</Link>
          
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-6">
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
            <Link href="/registro" className="px-5 py-2 bg-dr-red text-white font-bold rounded-sm hover:bg-red-800 transition uppercase">
                SUSCRIBIRSE
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
