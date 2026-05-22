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
    return <div className="p-2 w-10 h-10 border border-border-light dark:border-border-dark rounded-full animate-pulse bg-surface-container-low dark:bg-dark-surface" />;
  }

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (theme === "system") return (
      <svg className="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18a9 9 0 110 18m0-18a9 9 0 000 18" />
        <path d="M12 3a9 9 0 000 18V3z" fill="currentColor" fillOpacity="0.3" stroke="none" />
      </svg>
    );
    return resolvedTheme === "dark" ? (
      <svg className="w-5 h-5 text-yellow-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l.707-.707" />
        <circle cx="12" cy="12" r="4" strokeWidth={2} />
      </svg>
    );
  };

  const getLabel = () => {
    if (theme === "system") return "Sistema";
    return theme === "dark" ? "Oscuro" : "Claro";
  };

  return (
    <button
      onClick={toggleTheme}
      className="group flex items-center justify-center h-10 rounded-full border border-border-light dark:border-border-dark bg-surface dark:bg-dark-surface hover:border-primary/40 dark:hover:border-primary-fixed-dim/60 hover:bg-surface-container-low dark:hover:bg-dark-bg transition-all duration-500 relative overflow-hidden w-10 hover:w-[120px] gap-0 hover:gap-2 px-3 text-primary dark:text-primary-fixed-dim"
      title={`Cambiar Tema (Actual: ${getLabel()})`}
    >
      <div className="transition-transform group-active:scale-90 flex-shrink-0 flex items-center justify-center">
        {getIcon()}
      </div>
      <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] text-[10px] font-bold tracking-tighter uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
        {getLabel()}
      </span>
    </button>
  );
}
