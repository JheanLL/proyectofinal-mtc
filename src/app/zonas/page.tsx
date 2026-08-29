'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getZonasTuristicas, getEstaciones, getPreferencias } from '@/lib/db/store';
import { TblZonaTuristica, TblEstacion, TblPreferenciaTuristica, CategoriaTuristica, NivelDificultad } from '@/types/database';
import { 
  MapPin, 
  Search, 
  Filter, 
  Train, 
  Footprints, 
  Clock, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Compass
} from 'lucide-react';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';

export default function ZonasPage() {
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [preferencias, setPreferencias] = useState<TblPreferenciaTuristica[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstacion, setSelectedEstacion] = useState('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedDificultad, setSelectedDificultad] = useState<string>('todos');

  useEffect(() => {
    setZonas(getZonasTuristicas());
    setEstaciones(getEstaciones());
    setPreferencias(getPreferencias());
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Footprints className="w-3.5 h-3.5" />
            <span>Catálogo Travel Group Perú</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Zonas Turísticas y Circuitos Peatonales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Catálogo georreferenciado de atractivos turísticos diseñados para realizarse exclusivamente a pie desde las estaciones ferroviarias de PeruRail.
          </p>
        </div>

        <Link
          href="/planificador"
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Planificar Ruta Asistida</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, atractivo o palabra clave..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>

          {/* Station dropdown */}
          <div className="w-full sm:w-auto flex-1">
            <select
              value={selectedEstacion}
              onChange={(e) => setSelectedEstacion(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
          <div className="w-full sm:w-auto flex-1">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
          <div className="w-full sm:w-auto flex-1">
            <select
              value={selectedDificultad}
              onChange={(e) => setSelectedDificultad(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="todos">Cualquier Dificultad</option>
              <option value="Fácil">Fácil (Sendero llano)</option>
              <option value="Moderado">Moderado (Desnivel medio)</option>
              <option value="Exigente">Exigente (Escalinatas)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Mostrando <strong>{filteredZonas.length}</strong> zonas turísticas</span>
          {(searchTerm || selectedEstacion !== 'todos' || selectedCategoria !== 'todos' || selectedDificultad !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEstacion('todos');
                setSelectedCategoria('todos');
                setSelectedDificultad('todos');
              }}
              className="text-red-700 hover:text-red-800 font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZonas.map((zona) => {
          const estacion = estaciones.find(e => e.est_id === zona.zon_estacion_id);
          return (
            <div
              key={zona.zon_id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Banner */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={zona.zon_imagen_url}
                  alt={zona.zon_nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3">
                  <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {zona.zon_categoria}
                  </span>
                </div>

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

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-semibold text-emerald-300 block">
                    🚶 {formatDistance(zona.zon_distancia_metros)} (~{formatDurationMin(zona.zon_tiempo_caminata_min)} a pie)
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {zona.zon_nombre}
                  </h3>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {estacion && (
                    <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold">
                      <Train className="w-3.5 h-3.5" />
                      <span>{estacion.est_nombre}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {zona.zon_descripcion}
                  </p>
                </div>

                {/* Waypoints preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Puntos de paso:</span>
                  <div className="flex flex-wrap gap-1">
                    {zona.zon_puntos_interes.slice(0, 2).map((p, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                        • {p}
                      </span>
                    ))}
                    {zona.zon_puntos_interes.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-semibold self-center">
                        +{zona.zon_puntos_interes.length - 2} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Entrada:</span>
                    <span className="text-xs font-bold text-slate-900">
                      {zona.zon_precio_entrada_pen === 0 ? 'Gratuito' : formatCurrencyPEN(zona.zon_precio_entrada_pen)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/zonas/${zona.zon_id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      Detalle
                    </Link>
                    <Link
                      href={`/planificador?zonaId=${zona.zon_id}&estacionId=${zona.zon_estacion_id}`}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
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
