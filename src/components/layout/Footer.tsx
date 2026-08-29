'use client';

import React from 'react';
import Link from 'next/link';
import { Train, CloudSun, MapPin, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 mt-auto">
      {/* Entity Integration Badges */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Alianza Interinstitucional para el Turismo Sostenible
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              Fuentes Integradas del Sistema
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SENAMHI */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">SENAMHI</h4>
                <p className="text-xs text-slate-400">Previsiones meteorológicas y alertas climáticas por estación.</p>
              </div>
            </div>

            {/* PeruRail */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">PeruRail</h4>
                <p className="text-xs text-slate-400">Datos logísticos de estaciones, frecuencias y tarifas de tren.</p>
              </div>
            </div>

            {/* Travel Group Perú */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Travel Group Perú</h4>
                <p className="text-xs text-slate-400">Levantamiento y diseño de circuitos turísticos exclusivamente a pie.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institutional */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white p-1.5 rounded-lg">
                <Train className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">MTC Perú</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma tecnológica promovida por el Ministerio de Transportes y Comunicaciones para incentivar el turismo local y el transporte ferroviario con rutas peatonales sostenibles de ida y vuelta.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Plataforma 100% Accesible & Verificada</span>
            </div>
          </div>

          {/* Col 2: Tourist Advisor */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Asesor Turístico
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/planificador" className="hover:text-white transition-colors">
                  Planificador de Rutas a Pie
                </Link>
              </li>
              <li>
                <Link href="/zonas" className="hover:text-white transition-colors">
                  Catálogo de Atractivos
                </Link>
              </li>
              <li>
                <Link href="/estaciones" className="hover:text-white transition-colors">
                  Estaciones Ferroviarias
                </Link>
              </li>
              <li>
                <Link href="/clima" className="hover:text-white transition-colors">
                  Monitoreo de Clima SENAMHI
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Reports & Administration */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Informes y Gestión
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/informe" className="hover:text-white transition-colors">
                  Generador de Informes Consolidados (PDF)
                </Link>
              </li>
              <li>
                <Link href="/admin/zonas" className="hover:text-white transition-colors">
                  Gestión Travel Group (CRUD Zonas)
                </Link>
              </li>
              <li>
                <Link href="/admin/horarios" className="hover:text-white transition-colors">
                  Gestión PeruRail (Horarios & Tarifas)
                </Link>
              </li>
              <li>
                <Link href="/admin/integraciones" className="hover:text-white transition-colors">
                  Estado de Sincronización de APIs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Normas de Senderismo
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Todas las rutas están diseñadas como trayecto único de ida y vuelta a pie desde la estación para garantizar el retorno oportuno a su tren.
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              📞 Asistencia al Turista iPerú: <strong>(01) 574-8000</strong>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Ministerio de Transportes y Comunicaciones (MTC) - Gobierno del Perú.</p>
          <p className="flex items-center gap-1">
            Diseñado para la investigación y desarrollo de software web sostenible
          </p>
        </div>
      </div>
    </footer>
  );
}
