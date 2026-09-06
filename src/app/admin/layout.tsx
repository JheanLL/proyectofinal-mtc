'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/ThemeProvider';
import { ShieldAlert, ArrowRight, Train, MapPin, ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, setRole } = useApp();
  const pathname = usePathname();

  // 1. Si el usuario tiene rol de cliente (turista), ocultamos la consola interna
  if (role === 'turista') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full">
              Sección Restringida para Clientes
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Consola de Gestión Interna
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Actualmente estás navegando con el rol <strong>Turista (Cliente)</strong>. Esta sección está reservada para los gestores autorizados: <strong>Travel Group Perú</strong>, <strong>PeruRail</strong> y <strong>Administradores</strong>.
            </p>
          </div>

          {/* Quick role change options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-2xl mx-auto">
            <button
              onClick={() => setRole('travel_group')}
              className="p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Entrar como</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Travel Group Perú</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Gestión CRUD de zonas a pie</p>
            </button>

            <button
              onClick={() => setRole('perurail')}
              className="p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Train className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">Entrar como</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">PeruRail</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Gestión CRUD de horarios y trenes</p>
            </button>

            <button
              onClick={() => setRole('admin')}
              className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:border-red-600 bg-slate-50 dark:bg-slate-800/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Entrar como</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600">Administrador</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Acceso total y sincronización</p>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Regresar a la página principal de clientes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Si Travel Group intenta entrar al CRUD de horarios de PeruRail
  if (role === 'travel_group' && pathname.startsWith('/admin/horarios')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
            <Train className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Sección Exclusiva de PeruRail</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Como representante de <strong>Travel Group Perú</strong>, tu ámbito de gestión corresponde a las zonas turísticas a pie y la asignación con estaciones. La gestión de horarios y tarifas es potestad de PeruRail.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/admin/zonas" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Ir a Mis Zonas Turísticas
            </Link>
            <Link href="/admin" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">
              Volver al Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Si PeruRail intenta entrar al CRUD de zonas turísticas de Travel Group
  if (role === 'perurail' && pathname.startsWith('/admin/zonas')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Sección Exclusiva de Travel Group Perú</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Como operador ferroviario <strong>PeruRail</strong>, tu ámbito de gestión corresponde a los horarios, tarifas y servicios de tren. El levantamiento de atractivos peatonales es responsabilidad de Travel Group Perú.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/admin/horarios" className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Ir a Mis Horarios de Tren
            </Link>
            <Link href="/admin" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">
              Volver al Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
