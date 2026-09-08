'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getZonasTuristicas, getEstaciones, getPreferencias } from '@/lib/db/store';
import { TblZonaTuristica, TblEstacion, TblPreferenciaTuristica } from '@/types/database';
import { 
  Search, 
  Train, 
  Footprints, 
  Sparkles, 
  RefreshCw,
} from 'lucide-react';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';

export default function ZonasPage() {
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [preferencias, setPreferencias] = useState<TblPreferenciaTuristica[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstacion, setSelectedEstacion] = useState('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedDificultad, setSelectedDificultad] = useState<string>('todos');

  useEffect(() => {
    setZonas(getZonasTuristicas());
    setEstaciones(getEstaciones());
    setPreferencias(getPreferencias());

    // Fetch from APIs
    fetch('/api/zonas')
      .then(res => res.json())
      .then(data => { if (data.data) setZonas(data.data); })
      .catch(() => {});

    fetch('/api/estaciones')
      .then(res => res.json())
      .then(data => { if (data.data) setEstaciones(data.data); })
      .catch(() => {});
  }, []);

  const refreshZonas = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/zonas?refresh=true&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setZonas(data.data);
      }
    } catch (e) {
      console.error('Error refreshing zonas:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredZonas = zonas.filter((zona) => {
    const matchesSearch = 
      zona.zon_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zona.zon_descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zona.zon_puntos_interes.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstacion = selectedEstacion === 'todos' || zona.zon_estacion_id === selectedEstacion;
    const matchesCategoria = selectedCategoria === 'todos' || zona.zon_categoria === selectedCategoria;
    const matchesDificultad = selectedDificultad === 'todos' || zona.zon_dificultad === selectedDificultad;

    return matchesSearch && matchesEstacion && matchesCategoria && matchesDificultad;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
              <Footprints className="w-3.5 h-3.5" />
              <span>Catálogo Travel Group Perú</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              • Caché de 5 min (Vercel Edge)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Zonas Turísticas y Circuitos Peatonales
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Catálogo georreferenciado de atractivos turísticos diseñados para realizarse exclusivamente a pie desde las estaciones ferroviarias de PeruRail.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={refreshZonas}
            disabled={isRefreshing}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refrescar catálogo saltando la caché"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <Link
            href="/planificador"
            className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planificar Ruta</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o lugar..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>

          {/* Station dropdown */}
          <div>
            <select
              value={selectedEstacion}
              onChange={(e) => setSelectedEstacion(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="todos">Todas las Estaciones ({estaciones.length})</option>
              {estaciones.map(e => (
                <option key={e.est_id} value={e.est_id}>
                  {e.est_nombre} ({e.est_ciudad})
                </option>
              ))}
            </select>
          </div>

          {/* Category dropdown */}
          <div>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="todos">Todas las Categorías</option>
              {preferencias.map(p => (
                <option key={p.pre_id} value={p.pre_codigo}>
                  {p.pre_nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty dropdown */}
          <div>
            <select
              value={selectedDificultad}
              onChange={(e) => setSelectedDificultad(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="todos">Cualquier Dificultad</option>
              <option value="Fácil">Fácil (Sendero llano)</option>
              <option value="Moderado">Moderado (Desnivel medio)</option>
              <option value="Exigente">Exigente (Escalinatas)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Mostrando <strong>{filteredZonas.length}</strong> circuitos a pie</span>
          {(searchTerm || selectedEstacion !== 'todos' || selectedCategoria !== 'todos' || selectedDificultad !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEstacion('todos');
                setSelectedCategoria('todos');
                setSelectedDificultad('todos');
              }}
              className="text-red-700 dark:text-red-400 font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredZonas.map((zona) => {
          const estacion = estaciones.find(e => e.est_id === zona.zon_estacion_id);
          return (
            <div
              key={zona.zon_id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Image Banner */}
              <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={zona.zon_imagen_url}
                  alt={zona.zon_nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute top-2.5 left-2.5">
                  <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {zona.zon_categoria}
                  </span>
                </div>

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

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <span className="text-[11px] font-semibold text-emerald-300 block">
                    🚶 {formatDistance(zona.zon_distancia_metros)} (~{formatDurationMin(zona.zon_tiempo_caminata_min)} a pie)
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {zona.zon_nombre}
                  </h3>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  {estacion && (
                    <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-semibold">
                      <Train className="w-3.5 h-3.5" />
                      <span>{estacion.est_nombre}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {zona.zon_descripcion}
                  </p>
                </div>

                {/* Waypoints preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Puntos de paso:</span>
                  <div className="flex flex-wrap gap-1">
                    {zona.zon_puntos_interes.slice(0, 2).map((p, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded">
                        • {p}
                      </span>
                    ))}
                    {zona.zon_puntos_interes.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-semibold self-center">
                        +{zona.zon_puntos_interes.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Entrada:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {zona.zon_precio_entrada_pen === 0 ? 'Gratuito' : formatCurrencyPEN(zona.zon_precio_entrada_pen)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/zonas/${zona.zon_id}`}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-1.5 px-2.5 rounded-xl transition-colors"
                    >
                      Detalle
                    </Link>
                    <Link
                      href={`/planificador?zonaId=${zona.zon_id}&estacionId=${zona.zon_estacion_id}`}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Ruta</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
