'use client';

import React from 'react';
import { useApp } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { toggleTheme } = useApp();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar tema claro / oscuro"
      className={`p-1.5 rounded-xl border flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ${className}`}
      title="Cambiar tema claro / oscuro"
    >
      <Sun className="w-3.5 h-3.5 text-amber-400 hidden dark:block transition-transform duration-300 hover:rotate-45" />
      <Moon className="w-3.5 h-3.5 text-slate-300 block dark:hidden transition-transform duration-300 hover:-rotate-12" />
    </button>
  );
}
