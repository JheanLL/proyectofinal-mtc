'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Train, 
  MapPin, 
  SunMedium, 
  FileText, 
  Compass, 
  Settings, 
  Menu, 
  X,
  Sparkles,
  Radio
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import RoleSwitcher from '@/components/ui/RoleSwitcher';
import { useApp } from '@/components/providers/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { role } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinks = () => {
    switch (role) {
      case 'turista':
        return [
          { href: '/', label: 'Inicio', icon: Compass },
          { href: '/planificador', label: 'Asesor Turístico', icon: Sparkles, highlight: true },
          { href: '/zonas', label: 'Zonas a Pie', icon: MapPin },
          { href: '/estaciones', label: 'Trenes & Estaciones', icon: Train },
          { href: '/clima', label: 'Clima en Vivo', icon: SunMedium },
          { href: '/informe', label: 'Mis Informes', icon: FileText },
        ];
      case 'travel_group':
        return [
          { href: '/', label: 'Inicio', icon: Compass },
          { href: '/zonas', label: 'Zonas a Pie', icon: MapPin },
          { href: '/estaciones', label: 'Consultar Estaciones', icon: Train },
          { href: '/admin/zonas', label: 'CRUD Zonas a Pie', icon: MapPin, highlight: true },
          { href: '/admin', label: 'Matriz Asignación', icon: Settings },
        ];
      case 'perurail':
        return [
          { href: '/', label: 'Inicio', icon: Compass },
          { href: '/estaciones', label: 'Red Ferroviaria', icon: Train },
          { href: '/admin/horarios', label: 'CRUD Horarios & Tarifas', icon: Train, highlight: true },
          { href: '/clima', label: 'Clima en Estaciones', icon: SunMedium },
          { href: '/admin', label: 'Panel Operativo', icon: Settings },
        ];
      case 'admin':
      default:
        return [
          { href: '/', label: 'Inicio', icon: Compass },
          { href: '/planificador', label: 'Asesor Turístico', icon: Sparkles, highlight: true },
          { href: '/zonas', label: 'Zonas a Pie', icon: MapPin },
          { href: '/estaciones', label: 'Trenes & Estaciones', icon: Train },
          { href: '/clima', label: 'Clima en Vivo', icon: SunMedium },
          { href: '/informe', label: 'Informes', icon: FileText },
          { href: '/admin', label: 'Gestión', icon: Settings },
        ];
    }
  };

  const navLinks = getNavLinks();

  const getCtaButton = () => {
    switch (role) {
      case 'turista':
        return { href: '/planificador', label: 'Planificar Ruta', icon: Sparkles };
      case 'travel_group':
        return { href: '/admin/zonas', label: '+ Gestionar Zonas', icon: MapPin };
      case 'perurail':
        return { href: '/admin/horarios', label: '+ Gestionar Horarios', icon: Train };
      case 'admin':
      default:
        return { href: '/admin', label: 'Panel Gestión', icon: Settings };
    }
  };

  const cta = getCtaButton();
  const CtaIcon = cta.icon;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      {/* Top Status & Role Bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="hidden sm:inline">APIs Conectadas:</span> SENAMHI • PeruRail • Travel Group
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden md:inline">Rol activo:</span>
          <RoleSwitcher />
          <ThemeToggle className="h-7 w-7" />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-red-700 dark:bg-red-600 text-white p-2 rounded-xl shadow-md group-hover:scale-105 transition-all">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight">
                  Rutas Turísticas
                </span>
                <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  Tren & Pie
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight font-medium">
                Circuitos peatonales desde estaciones
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 shadow-2xs font-bold'
                      : link.highlight
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm hover:opacity-95'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-red-700 dark:text-red-400' : link.highlight ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href={cta.href}
              className="hidden sm:flex bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all items-center gap-1.5"
            >
              <CtaIcon className="w-3.5 h-3.5" />
              <span>{cta.label}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rol & Tema</span>
            <div className="flex items-center gap-2">
              <RoleSwitcher />
              <ThemeToggle className="h-8 w-8" />
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-2">
            <Link
              href={cta.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-red-700 text-white text-sm font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <CtaIcon className="w-4 h-4" />
              <span>{cta.label}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
