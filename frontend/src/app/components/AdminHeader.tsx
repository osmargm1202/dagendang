"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user: { full_name: string; role: string } | null;
  currentTitle?: string;
}

export default function AdminHeader({ user, currentTitle }: AdminHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  };

  if (!user) return null;

  return (
    <nav className="bg-dr-blue text-white shadow-md sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle */}
             <button 
              className="md:hidden p-2 hover:bg-blue-800 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 {isMobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                 )}
               </svg>
             </button>
             <Link href="/admin/dashboard" className="font-bold text-lg md:text-xl tracking-tight">
               La Agenda <span className="text-blue-300 font-normal">CMS</span>
             </Link>
             {currentTitle && <span className="hidden lg:inline text-blue-400 mx-2">/</span>}
             {currentTitle && <span className="hidden lg:inline text-xs font-bold uppercase tracking-widest text-white/70">{currentTitle}</span>}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/admin/publicidad" className="text-xs font-bold hover:text-blue-300 tracking-widest transition-colors uppercase">Publicidad</Link>
            <Link href="/admin/configuracion" className="text-xs font-bold hover:text-blue-300 tracking-widest transition-colors uppercase">Configuración</Link>
            
            <div className="flex items-center gap-3 pl-4 border-l border-blue-400">
              <div className="text-right">
                <p className="text-[10px] font-bold leading-none">{user.full_name}</p>
                <p className="text-[9px] text-blue-300 uppercase tracking-tighter">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-dr-red hover:bg-dr-red/90 p-2 rounded shadow-sm transition-colors group"
                title="Cerrar Sesión"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile User Info (Short) */}
          <div className="md:hidden flex items-center gap-3">
             <span className="text-[10px] font-bold bg-blue-800 px-2 py-1 rounded">{user.full_name.split(' ')[0]}</span>
             <button onClick={handleLogout} className="text-red-300 p-1">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar/Menu Drawer */}
      <div className={`md:hidden bg-blue-900 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-64 border-t border-blue-800' : 'max-h-0'}`}>
        <div className="px-4 py-4 space-y-3">
          <Link href="/admin/dashboard" className="block text-sm font-bold tracking-widest uppercase py-2">Dashboard</Link>
          <Link href="/admin/publicidad" className="block text-sm font-bold tracking-widest uppercase py-2">Publicidad</Link>
          <Link href="/admin/configuracion" className="block text-sm font-bold tracking-widest uppercase py-2 border-b border-blue-800 pb-2">Configuración</Link>
          <Link href="/" className="block text-xs font-bold text-blue-300 py-2">IR AL PORTAL PÚBLICO</Link>
        </div>
      </div>
    </nav>
  );
}
