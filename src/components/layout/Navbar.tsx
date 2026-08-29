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
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Compass },
    { href: '/planificador', label: 'Asesor Turístico', icon: Sparkles, highlight: true },
    { href: '/zonas', label: 'Zonas Turísticas', icon: MapPin },
    { href: '/estaciones', label: 'Estaciones & Trenes', icon: Train },
    { href: '/clima', label: 'Clima SENAMHI', icon: SunMedium },
    { href: '/informe', label: 'Mis Informes', icon: FileText },
    { href: '/admin', label: 'Administración', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top Academic Banner */}
      <div className="bg-slate-900 text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
          <span className="font-semibold text-slate-300">
            Proyecto Universitario • Caso MTC Zonas Turísticas | CPIS Ingeniería de Sistemas
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <span>Fuentes integradas: <strong>SENAMHI</strong> | <strong>PeruRail</strong> | <strong>Travel Group Perú</strong></span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Prototipo Académico
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-red-700 text-white p-2 rounded-xl shadow-md group-hover:bg-red-800 transition-colors">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-700 font-extrabold text-lg tracking-tight">MTC</span>
                <span className="text-slate-900 font-bold text-base">Zonas Turísticas</span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                Rutas a pie desde estaciones ferroviarias
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
                      ? 'bg-red-50 text-red-700 shadow-2xs'
                      : link.highlight
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm hover:opacity-95'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-red-700' : link.highlight ? 'text-white' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/planificador"
              className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Planificar Ruta</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-red-50 text-red-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-red-700' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/planificador"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-red-700 text-white text-sm font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Planificar Ruta a Pie</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
