'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/ThemeProvider';
import { ShieldAlert, ArrowRight, Train, MapPin, ShieldCheck, Lock, RefreshCw } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, openAuthModal } = useApp();
  const pathname = usePathname();

  // 1. Si el usuario no ha iniciado sesión administrativa (rol turista)
  if (role === 'turista') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
              Acceso Restringido • Requiere Autenticación
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Consola de Administración y Gestión MTC
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Esta sección está reservada exclusivamente para gestores autorizados: <strong>Travel Group Perú</strong> (Catálogo turístico a pie), <strong>PeruRail</strong> (Horarios y tarifas de tren) y <strong>Admin General MTC</strong> (Gestores del sistema).
            </p>
          </div>

          {/* Primary Action: Open Login Modal */}
          <div className="pt-2">
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-sm font-black px-6 py-3 rounded-2xl shadow-lg shadow-red-700/30 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Iniciar Sesión como Administrador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Info on Available Accounts according to syllabus */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left max-w-2xl mx-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center">
              Cuentas habilitadas según la Hoja de Práctica (Unidad IV)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                onClick={openAuthModal}
                className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer hover:border-emerald-500 transition-all"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold">Travel Group</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">CRUD Zonas a pie y estaciones solo lectura.</p>
              </div>

              <div 
                onClick={openAuthModal}
                className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 mb-1">
                  <Train className="w-4 h-4" />
                  <span className="text-xs font-bold">PeruRail</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">CRUD Horarios, trenes, precios y red ferroviaria.</p>
              </div>

              <div 
                onClick={openAuthModal}
                className="p-3.5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 cursor-pointer hover:border-red-500 transition-all"
              >
                <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Admin General</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Panel de gestores MTC, APIs y control total.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Regresar al portal público para turistas</span>
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
          <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
            Restricción por Separación de Funciones
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Sección Exclusiva de PeruRail</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Como representante de <strong>Travel Group Perú</strong>, tu ámbito de gestión según los requerimientos corresponde a las <strong>zonas turísticas a pie</strong> y a consultar las <strong>estaciones en modo solo lectura</strong>. La gestión de horarios, trenes y tarifas es potestad de <strong>PeruRail</strong>.
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
          <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">
            Restricción por Separación de Funciones
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Sección Exclusiva de Travel Group Perú</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Como operador logístico <strong>PeruRail</strong>, tu ámbito de gestión según los requerimientos corresponde a los <strong>horarios, frecuencias, trenes y tarifas</strong>. El levantamiento y catalogación de atractivos peatonales es responsabilidad de <strong>Travel Group Perú</strong>.
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

  // 4. Si PeruRail o Travel Group intentan entrar al monitor de integraciones (solo Gestor MTC / Admin)
  if (role !== 'admin' && pathname.startsWith('/admin/integraciones')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
            Panel Exclusivo de Gestores MTC
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Monitor de Sincronización de APIs</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            El monitoreo y la sincronización periódica de APIs externas (SENAMHI, conectores externos) está reservado exclusivamente para los <strong>Gestores del MTC (Admin General)</strong> en cumplimiento del Módulo 2 de la práctica.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/admin" className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Volver al Panel Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
