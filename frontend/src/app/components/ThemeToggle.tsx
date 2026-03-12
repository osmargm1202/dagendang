"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-10 h-10 border border-blue-400/30 rounded-full animate-pulse bg-blue-800/10" />;
  }

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (theme === "system") return "🌓";
    return resolvedTheme === "dark" ? "🌙" : "☀️";
  };

  const getLabel = () => {
    if (theme === "system") return "Sistema";
    return theme === "dark" ? "Oscuro" : "Claro";
  };

  return (
    <button
      onClick={toggleTheme}
      className="group flex items-center justify-center gap-2 p-2 rounded-full border border-blue-400/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
      title={`Cambiar Tema (Actual: ${getLabel()})`}
    >
      <span className="text-xl leading-none transition-transform group-active:scale-90">{getIcon()}</span>
      <span className="hidden lg:block text-[10px] font-bold tracking-tighter uppercase opacity-80 group-hover:opacity-100">{getLabel()}</span>
      
      {/* Tooltip for mobile or small screens */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        Tema: {getLabel()}
      </span>
    </button>
  );
}
