'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Train, 
  Footprints, 
  CloudSun, 
  Sparkles, 
  ArrowRight, 
  Compass,
  Trees,
  Landmark,
  Utensils,
  Camera,
  Mountain,
  HeartPulse,
  Radio
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
    // Initial fetch from store / API
    setEstaciones(getEstaciones());
    setZonas(getZonasTuristicas());
    setPreferencias(getPreferencias());

    // Fetch live from internal APIs
    fetch('/api/estaciones')
      .then(res => res.json())
      .then(data => { if (data.data) setEstaciones(data.data); })
      .catch(() => {});

    fetch('/api/zonas')
      .then(res => res.json())
      .then(data => { if (data.data) setZonas(data.data); })
      .catch(() => {});
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
    <div className="space-y-12 sm:space-y-16 pb-16 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-10 pb-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
        <div className="absolute -bottom-10 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-semibold backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Plataforma de Rutas Ferroviarias & Circuitos a Pie</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Viaja en Tren y Explora <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">Caminatas a Pie</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Planifica tus excursiones turísticas diseñadas <strong>exclusivamente a pie</strong> en trayecto de ida y vuelta desde las estaciones de tren, integrando pronósticos climáticos en tiempo real de <strong>SENAMHI</strong> y logística de <strong>PeruRail</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/planificador"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 rounded-2xl shadow-xl shadow-red-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Asesor Inteligente de Rutas</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>

              <Link
                href="/zonas"
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm px-5 sm:px-6 py-3 rounded-2xl border border-slate-700 backdrop-blur-md transition-all"
              >
                Explorar Catálogo de Zonas
              </Link>
            </div>

            {/* 3 Key Integrations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">SENAMHI</span>
                  <span className="text-slate-400 text-[11px]">Clima & Radiación UV en vivo</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                  <Train className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">PeruRail</span>
                  <span className="text-slate-400 text-[11px]">Horarios y tarifas oficiales</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Footprints className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">Travel Group Perú</span>
                  <span className="text-slate-400 text-[11px]">Rutas a pie de ida y vuelta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Filtro de Preferencias</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                ¿Qué tipo de caminata buscas realizar?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Filtra las zonas turísticas por categoría de interés o por estación ferroviaria.
              </p>
            </div>

            {/* Station dropdown filter */}
            <div className="w-full md:w-72">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Estación de Partida:
              </label>
              <select
                value={selectedEstacionId}
                onChange={(e) => setSelectedEstacionId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedCategoria('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                selectedCategoria === 'todos'
                  ? 'bg-red-700 text-white border-red-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white border-slate-300 dark:border-slate-700'
              }`}
            >
              Todas ({zonas.length})
            </button>

            {preferencias.map((pref) => {
              const Icon = getPrefIcon(pref.pre_codigo);
              const isSelected = selectedCategoria === pref.pre_codigo;
              const count = zonas.filter(z => z.zon_categoria === pref.pre_codigo).length;
              return (
                <button
                  key={pref.pre_id}
                  onClick={() => setSelectedCategoria(pref.pre_codigo)}
                  className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm ring-2 ring-red-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-950 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white font-extrabold">
                    {pref.pre_nombre}
                  </span>
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Walking Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Zonas Turísticas a Pie ({filteredZonas.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Circuitos de ida y vuelta a pie desde la estación de tren seleccionada.
            </p>
          </div>
          <Link
            href="/zonas"
            className="text-xs font-bold text-red-700 dark:text-red-400 hover:text-red-800 flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredZonas.map((zona) => {
            const estacion = estaciones.find(e => e.est_id === zona.zon_estacion_id);
            return (
              <div
                key={zona.zon_id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={zona.zon_imagen_url}
                    alt={zona.zon_nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                      {zona.zon_categoria}
                    </span>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
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
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <span className="text-[11px] font-semibold text-emerald-300 block">
                      🚶 {formatDistance(zona.zon_distancia_metros)} (~{formatDurationMin(zona.zon_tiempo_caminata_min)} a pie)
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {zona.zon_nombre}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {estacion && (
                      <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400 font-semibold">
                        <Train className="w-3.5 h-3.5" />
                        <span>Estación: {estacion.est_nombre}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {zona.zon_resumen_corto}
                    </p>
                  </div>

                  {/* Quick Highlights */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                    <span>Desnivel: <strong>+{zona.zon_desnivel_metros}m</strong></span>
                    <span>Entrada: <strong className="text-slate-900 dark:text-white">{zona.zon_precio_entrada_pen === 0 ? 'Gratis' : formatCurrencyPEN(zona.zon_precio_entrada_pen)}</strong></span>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-1 flex items-center gap-2">
                    <Link
                      href={`/zonas/${zona.zon_id}`}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-2 px-2 rounded-xl text-center transition-colors"
                    >
                      Ver Ruta
                    </Link>
                    <Link
                      href={`/planificador?zonaId=${zona.zon_id}&estacionId=${zona.zon_estacion_id}`}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-2xs"
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
              Guía de Planificación
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              ¿Cómo armar tu itinerario en 4 pasos?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              El sistema conecta automáticamente los horarios de tren, el pronóstico meteorológico y las rutas peatonales para consolidar tu viaje.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/80">
            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="text-xs sm:text-sm font-bold">Elige tus Preferencias</h4>
              <p className="text-[11px] text-slate-400">Selecciona tus gustos turísticos y estación de salida.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="text-xs sm:text-sm font-bold">Verifica el Clima</h4>
              <p className="text-[11px] text-slate-400">Consulta las alertas meteorológicas y vestimenta de SENAMHI.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
              <h4 className="text-xs sm:text-sm font-bold">Ruta a Pie Ida y Vuelta</h4>
              <p className="text-[11px] text-slate-400">Revisa el mapa interactivo y calcula tiempos de caminata.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
              <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center font-bold text-xs">4</span>
              <h4 className="text-xs sm:text-sm font-bold">Descarga tu Informe</h4>
              <p className="text-[11px] text-slate-400">Obtén tu itinerario en PDF listo con horarios y presupuestos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
