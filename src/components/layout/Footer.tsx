'use client';

import React from 'react';
import Link from 'next/link';
import { Train, CloudSun, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800/80 mt-auto transition-colors duration-200">
      {/* 3 Core Integrations Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SENAMHI */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">SENAMHI (Clima en Vivo)</h4>
                <p className="text-[11px] text-slate-400">Pronósticos de temperatura, lluvia y radiación UV por estación.</p>
              </div>
            </div>

            {/* PeruRail */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">PeruRail (Transporte)</h4>
                <p className="text-[11px] text-slate-400">Horarios de tránsito, frecuencias y tarifas en Soles y Dólares.</p>
              </div>
            </div>

            {/* Travel Group Perú */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Travel Group Perú (Rutas)</h4>
                <p className="text-[11px] text-slate-400">Circuitos peatonales de ida y vuelta desde estaciones de tren.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          {/* Col 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-red-700 text-white p-1 rounded-lg">
                <Train className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">Rutas Ferroviarias</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Asesor interactivo de caminatas a pie desde estaciones de tren para fomentar el turismo local sostenible.
            </p>
          </div>

          {/* Col 2: Tourist Advisor */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-[11px] mb-2.5">
              Asesor & Rutas
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/planificador" className="hover:text-white transition-colors">
                  Planificador de Rutas
                </Link>
              </li>
              <li>
                <Link href="/zonas" className="hover:text-white transition-colors">
                  Catálogo de Zonas a Pie
                </Link>
              </li>
              <li>
                <Link href="/estaciones" className="hover:text-white transition-colors">
                  Estaciones y Trenes
                </Link>
              </li>
              <li>
                <Link href="/clima" className="hover:text-white transition-colors">
                  Monitoreo de Clima
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Reports & Administration */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-[11px] mb-2.5">
              Gestión & Reportes
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/informe" className="hover:text-white transition-colors">
                  Descargar Informes (PDF)
                </Link>
              </li>
              <li>
                <Link href="/admin/zonas" className="hover:text-white transition-colors">
                  CRUD Zonas Turísticas
                </Link>
              </li>
              <li>
                <Link href="/admin/horarios" className="hover:text-white transition-colors">
                  CRUD Horarios de Tren
                </Link>
              </li>
              <li>
                <Link href="/admin/integraciones" className="hover:text-white transition-colors">
                  Sincronización de APIs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-[11px] mb-2.5">
              Norma Peatonal
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Circuitos de ida y vuelta a pie desde la estación para garantizar el retorno oportuno a su tren.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Plataforma de Rutas Turísticas y Ferroviarias a Pie.</p>
          <p>Desarrollo de Software Web Sostenible</p>
        </div>
      </div>
    </footer>
  );
}
