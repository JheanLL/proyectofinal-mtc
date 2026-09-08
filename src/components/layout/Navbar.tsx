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
  Radio, 
  ArrowRight,
  Lock,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AdminLoginModal from '@/components/auth/AdminLoginModal';
import { useApp } from '@/components/providers/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { role, authUser, openAuthModal, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinks = () => {
    switch (role) {
      case 'turista':
        return [
          { href: '/', label: 'Inicio', icon: Compass },
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
          { href: '/admin', label: 'Panel de Control', icon: Settings },
        ];
      case 'perurail':
        return [
          { href: '/', label: 'Inicio', icon: Compass },
          { href: '/estaciones', label: 'Red Ferroviaria', icon: Train },
          { href: '/clima', label: 'Clima en Estaciones', icon: SunMedium },
          { href: '/admin', label: 'Panel de Control', icon: Settings },
        ];
      case 'admin':
      default:
        return [
          { href: '/', label: 'Inicio', icon: Compass },
          { href: '/planificador', label: 'Asesor Turístico', icon: Sparkles },
          { href: '/zonas', label: 'Zonas a Pie', icon: MapPin },
          { href: '/estaciones', label: 'Trenes & Estaciones', icon: Train },
          { href: '/clima', label: 'Clima en Vivo', icon: SunMedium },
          { href: '/informe', label: 'Informes', icon: FileText },
          { href: '/admin', label: 'Panel de Control', icon: Settings },
        ];
    }
  };

  const navLinks = getNavLinks();

  const getCtaButton = () => {
    switch (role) {
      case 'turista':
        return { href: '/planificador', label: 'Planificar Ruta', icon: Sparkles };
      case 'travel_group':
      case 'perurail':
      case 'admin':
      default:
        return { href: '/admin', label: 'Panel de Control', icon: Settings };
    }
  };

  const cta = getCtaButton();
  const CtaIcon = cta.icon;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/admin') return pathname === '/admin';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isAdministratorLoggedIn = role !== 'turista';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
        {/* Top Status & Role Bar */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold truncate">
              <Radio className="w-3 h-3 animate-pulse shrink-0" />
              <span className="hidden sm:inline">APIs Conectadas:</span> SENAMHI • PeruRail • Travel Group
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Botón de Switch de Tema a la IZQUIERDA de todo, al costado de Usuario (Turista) */}
            <ThemeToggle className="h-7 w-7" />

            {/* 2. Cuadro de estado: Usuario (Turista) */}
            <div 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                role === 'turista'
                  ? 'bg-slate-800/90 text-slate-300 border-slate-700'
                  : role === 'travel_group'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                  : role === 'perurail'
                  ? 'bg-blue-950/90 text-blue-300 border-blue-800'
                  : 'bg-red-950/90 text-red-300 border-red-800'
              }`}
              title={isAdministratorLoggedIn ? `Sesión activa: ${authUser?.email || role}` : 'Navegando como Usuario (Turista)'}
            >
              {role === 'turista' && <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {role === 'travel_group' && <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {role === 'perurail' && <Train className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                {role === 'turista' && 'Usuario (Turista)'}
                {role === 'travel_group' && (authUser?.name || 'Travel Group Perú')}
                {role === 'perurail' && (authUser?.name || 'PeruRail')}
                {role === 'admin' && (authUser?.name || 'Admin General MTC')}
              </span>
            </div>

            {/* 3. Iniciar sesión como administrador (o Cerrar sesión si ya inició) */}
            {!isAdministratorLoggedIn ? (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-[11px] font-bold bg-red-700 hover:bg-red-800 text-white shadow-xs transition-all cursor-pointer group"
                title="Acceso institucional para operadores y administradores"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Iniciar sesión</span>
              </button>
            ) : (
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            )}
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
                  Circuitos peatonales desde estaciones MTC
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
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <Link
                href={cta.href}
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-600 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-md shadow-red-700/30 hover:shadow-xl hover:shadow-red-600/40 border border-red-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <CtaIcon className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                <span className="tracking-tight">{cta.label}</span>
                <ArrowRight className="w-4 h-4 text-red-200 group-hover:text-white group-hover:translate-x-1.5 transition-transform shrink-0" />
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
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-5 space-y-2 shadow-xl">
            {/* Mobile Status & Actions */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThemeToggle className="h-7 w-7" />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {role === 'turista' ? <User className="w-3.5 h-3.5 text-slate-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-red-500" />}
                    <span>
                      {role === 'turista' ? 'Usuario (Turista)' : (authUser?.name || role)}
                    </span>
                  </div>
                </div>
              </div>

              {!isAdministratorLoggedIn ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Iniciar sesión</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Cerrar sesión</span>
                </button>
              )}
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
                className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-600 text-white text-sm font-black py-3 rounded-2xl shadow-lg shadow-red-700/30 flex items-center justify-center gap-2 group"
              >
                <CtaIcon className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{cta.label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Login Modal for Administrators */}
      <AdminLoginModal />
    </>
  );
}
