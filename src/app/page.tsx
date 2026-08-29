'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Train, 
  Footprints, 
  CloudSun, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Search,
  Compass,
  Trees,
  Landmark,
  Utensils,
  Camera,
  Mountain,
  HeartPulse
} from 'lucide-react';
import { getEstaciones, getZonasTuristicas, getPreferencias } from '@/lib/db/store';
import { TblEstacion, TblZonaTuristica, TblPreferenciaTuristica, CategoriaTuristica } from '@/types/database';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';

export default function HomePage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [preferencias, setPreferencias] = useState<TblPreferenciaTuristica[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaTuristica | 'todos'>('todos');
  const [selectedEstacionId, setSelectedEstacionId] = useState<string>('todos');

  useEffect(() => {
    setEstaciones(getEstaciones());
    setZonas(getZonasTuristicas());
    setPreferencias(getPreferencias());
  }, []);

  const getPrefIcon = (codigo: CategoriaTuristica) => {
    switch (codigo) {
      case 'naturaleza': return Trees;
      case 'arqueologia': return Landmark;
      case 'historia': return Compass;
      case 'gastronomia': return Utensils;
      case 'fotografia': return Camera;
      case 'aventura': return Mountain;
      case 'descanso': return HeartPulse;
      default: return Sparkles;
    }
  };

  const filteredZonas = zonas.filter(z => {
    const matchesCat = selectedCategoria === 'todos' || z.zon_categoria === selectedCategoria;
    const matchesEst = selectedEstacionId === 'todos' || z.zon_estacion_id === selectedEstacionId;
    return matchesCat && matchesEst;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-12 pb-24 overflow-hidden border-b border-slate-800">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
        <div className="absolute -bottom-10 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Proyecto Universitario • Caso MTC Turismo Ferroviario y Peatonal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Descubre el Perú en Tren y <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">Caminatas a Pie</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Plataforma desarrollada como caso de estudio del Ministerio de Transportes y Comunicaciones. Conecta tus viajes en <strong>PeruRail</strong> con circuitos turísticos diseñados para realizarse <strong>exclusivamente a pie</strong> desde cada estación, con pronóstico climático de <strong>SENAMHI</strong> en tiempo real.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/planificador"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-red-900/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                <span>Asesor Inteligente de Rutas</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/zonas"
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm px-6 py-3.5 rounded-2xl border border-slate-700 backdrop-blur-md transition-all"
              >
                Explorar Catálogo de Zonas
              </Link>
            </div>

            {/* Three key pillars indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">SENAMHI</span>
                  <span className="text-slate-400">Clima & Alertas en vivo</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                  <Train className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">PeruRail</span>
                  <span className="text-slate-400">Horarios, tarifas y trenes</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Footprints className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">Travel Group Perú</span>
                  <span className="text-slate-400">Rutas 100% a pie ida/vuelta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Interactive Preference Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Explorador Rápido</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                ¿Qué tipo de experiencia buscas desde la estación?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Filtra las zonas turísticas por tus intereses personales o por estación ferroviaria.
              </p>
            </div>

            {/* Station dropdown filter */}
            <div className="w-full md:w-72">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Filtrar por Estación Ferroviaria:
              </label>
              <select
                value={selectedEstacionId}
                onChange={(e) => setSelectedEstacionId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-red-600 focus:outline-none"
              >
                <option value="todos">Todas las Estaciones ({estaciones.length})</option>
                {estaciones.map(est => (
                  <option key={est.est_id} value={est.est_id}>
                    {est.est_nombre} ({est.est_ciudad})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preference Pill buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedCategoria('todos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategoria === 'todos'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas las categorías ({zonas.length})
            </button>

            {preferencias.map((pref) => {
              const Icon = getPrefIcon(pref.pre_codigo);
              const isSelected = selectedCategoria === pref.pre_codigo;
              const count = zonas.filter(z => z.zon_categoria === pref.pre_codigo).length;
              return (
                <button
                  key={pref.pre_id}
                  onClick={() => setSelectedCategoria(pref.pre_codigo)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-red-600'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-red-600" />
                  <span>{pref.pre_nombre}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Walking Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Circuitos a Pie Disponibles ({filteredZonas.length})
            </h2>
            <p className="text-xs text-slate-500">
              Todas las rutas parten y retornan a la estación ferroviaria en un solo tramo a pie.
            </p>
          </div>
          <Link
            href="/zonas"
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZonas.map((zona) => {
            const estacion = estaciones.find(e => e.est_id === zona.zon_estacion_id);
            return (
              <div
                key={zona.zon_id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={zona.zon_imagen_url}
                    alt={zona.zon_nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                      {zona.zon_categoria}
                    </span>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold px-2 py-0.8 rounded-md border ${
                      zona.zon_dificultad === 'Fácil'
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : zona.zon_dificultad === 'Moderado'
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-red-600 text-white border-red-500'
                    }`}>
                      {zona.zon_dificultad}
                    </span>
                  </div>

                  {/* Distance Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-semibold text-emerald-300 block">
                      🚶 {formatDistance(zona.zon_distancia_metros)} a pie (~{formatDurationMin(zona.zon_tiempo_caminata_min)} un tramo)
                    </span>
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {zona.zon_nombre}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {estacion && (
                      <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold">
                        <Train className="w-3.5 h-3.5" />
                        <span>Desde: {estacion.est_nombre}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {zona.zon_resumen_corto}
                    </p>
                  </div>

                  {/* Quick Highlights */}
                  <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 flex items-center justify-between border border-slate-100">
                    <span>Desnivel: <strong>+{zona.zon_desnivel_metros}m</strong></span>
                    <span>Entrada: <strong className="text-slate-900">{zona.zon_precio_entrada_pen === 0 ? 'Gratis' : formatCurrencyPEN(zona.zon_precio_entrada_pen)}</strong></span>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/zonas/${zona.zon_id}`}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl text-center transition-colors"
                    >
                      Ver Guía de Ruta
                    </Link>
                    <Link
                      href={`/planificador?zonaId=${zona.zon_id}&estacionId=${zona.zon_estacion_id}`}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Planificar</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-700 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">
              Modelo de Operación Sostenible
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¿Cómo funciona el Asesor Especializado del MTC?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              El sistema integra de forma automática los horarios de PeruRail, el pronóstico meteorológico del SENAMHI y las rutas peatonales curadas por Travel Group Perú para armar tu visita consolidada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-700/80">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <span className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="text-sm font-bold">Define tus Preferencias</h4>
              <p className="text-xs text-slate-400">Elige tus gustos turísticos y tu estación de origen.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="text-sm font-bold">Verifica el Clima</h4>
              <p className="text-xs text-slate-400">Revisa la alerta meteorológica de SENAMHI y ropa recomendada.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <span className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
              <h4 className="text-sm font-bold">Ruta a Pie Ida y Vuelta</h4>
              <p className="text-xs text-slate-400">Visualiza en mapa interactivo el trayecto a pie desde el tren.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <span className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center font-bold text-xs">4</span>
              <h4 className="text-sm font-bold">Informe PDF Consolidado</h4>
              <p className="text-xs text-slate-400">Descarga tu informe consolidado con horarios y presupuesto.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
