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
      className="group flex items-center justify-center p-2 rounded-full border border-blue-400/30 hover:border-white/50 hover:bg-white/10 transition-all duration-500 relative overflow-hidden max-w-[40px] hover:max-w-[120px] gap-0 hover:gap-2 px-3"
      title={`Cambiar Tema (Actual: ${getLabel()})`}
    >
      <span className="text-xl leading-none transition-transform group-active:scale-90 flex-shrink-0">{getIcon()}</span>
      <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] text-[10px] font-bold tracking-tighter uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
        {getLabel()}
      </span>
    </button>
  );
}
