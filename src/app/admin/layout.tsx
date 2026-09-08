'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/ThemeProvider';
import { ArrowRight, Train, MapPin, Lock, RefreshCw } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
              Acceso Restringido
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Esta sección requiere inicio de sesión con credenciales autorizadas del Ministerio de Transportes y Comunicaciones o de las entidades operadoras.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openAuthModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Volver al portal</span>
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
            Sección Restringida
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Gestión de Horarios y Tarifas</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Esta sección está reservada para el operador ferroviario PeruRail. Su cuenta tiene asignada la administración del catálogo de zonas turísticas.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/admin/zonas" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Ir a Zonas Turísticas
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
            Sección Restringida
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Gestión de Zonas Turísticas</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Esta sección está reservada para la entidad gestora de turismo Travel Group Perú. Su cuenta tiene asignada la administración de horarios y tarifas ferroviarias.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/admin/horarios" className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Ir a Horarios de Tren
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
            Supervisión del Sistema
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Sincronización de Servicios</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            La supervisión y sincronización de servicios e integraciones externas está reservada para los administradores del Ministerio de Transportes y Comunicaciones.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/admin" className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Volver al Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
