"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l border-blue-400 pl-6 ml-2">
               <button 
                onClick={handleLogout}
                className="text-[10px] uppercase font-bold text-gray-300 hover:text-white transition-colors"
                >
                Cerrar Sesión
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center border border-blue-400 shadow-inner">
                <span className="text-xs">👤</span>
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
