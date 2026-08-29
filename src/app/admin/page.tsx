'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getEstaciones, 
  getZonasTuristicas, 
  getHorariosTren, 
  getIntegraciones,
  getItinerarios,
  resetDatabaseToDefaults 
} from '@/lib/db/store';
import { 
  TblEstacion, 
  TblZonaTuristica, 
  TblHorarioTren, 
  TblEstadoIntegracion, 
  TblItinerarioConsulta 
} from '@/types/database';
import { 
  Settings, 
  MapPin, 
  Train, 
  CloudSun, 
  FileText, 
  RefreshCw, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Download,
  Printer,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { formatCurrencyPEN, formatDistance, formatDurationMin } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);
  const [integraciones, setIntegraciones] = useState<TblEstadoIntegracion[]>([]);
  const [itinerarios, setItinerarios] = useState<TblItinerarioConsulta[]>([]);
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('todos');

  const reloadData = () => {
    setEstaciones(getEstaciones());
    setZonas(getZonasTuristicas());
    setHorarios(getHorariosTren());
    setIntegraciones(getIntegraciones());
    setItinerarios(getItinerarios());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('mtc_db_updated', reloadData);
    return () => window.removeEventListener('mtc_db_updated', reloadData);
  }, []);

  const handleResetData = () => {
    if (confirm('¿Restablecer la base de datos a sus valores iniciales oficiales?')) {
      resetDatabaseToDefaults();
      reloadData();
      alert('Base de datos restablecida.');
    }
  };

  // Matrix of Stations & Assigned Zones (Requirement for Travel Group Perú)
  const filteredZonas = zonas.filter(z => 
    selectedStationFilter === 'todos' || z.zon_estacion_id === selectedStationFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 border border-red-700/60 text-red-300 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5 text-red-400" />
            <span>Panel de Configuración y Gestión MTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Consola de Administración y Gestión de Datos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gestión de roles y módulos para <strong>Travel Group Perú</strong> (Zonas turísticas a pie), <strong>PeruRail</strong> (Horarios y tarifas) y Monitoreo del <strong>SENAMHI</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Datos</span>
          </button>

          <Link
            href="/admin/integraciones"
            className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sincronizar APIs</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estaciones */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Estaciones Ferroviarias</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{estaciones.length}</span>
            <span className="text-xs text-slate-500">PeruRail (Solo lectura)</span>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-2xl">
            <Train className="w-6 h-6" />
          </div>
        </div>

        {/* Zonas Turísticas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Zonas Turísticas a Pie</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{zonas.length}</span>
            <span className="text-xs text-slate-500">Travel Group Perú (CRUD)</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Frecuencias de Tren */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Horarios de Tren</span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">{horarios.length}</span>
            <span className="text-xs text-slate-500">PeruRail Tarifario (CRUD)</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Consultas / Informes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Itinerarios Emitidos</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">{itinerarios.length}</span>
            <span className="text-xs text-slate-500">Informes Consolidados</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Entity Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Travel Group Peru */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Travel Group Perú
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              CRUD Zonas Turísticas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Registrar, modificar y georreferenciar circuitos a pie vinculados a estaciones con cálculo de distancias y tiempos.
            </p>
          </div>
          <Link
            href="/admin/zonas"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gestionar Zonas Turísticas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: PeruRail */}
        <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Train className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              PeruRail
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              CRUD Horarios y Tarifas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Administración de trenes, salidas, llegadas, tipos de servicio (Expedition, Vistadome) y tarifas en PEN y USD.
            </p>
          </div>
          <Link
            href="/admin/horarios"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gestionar Trenes & Tarifas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Integraciones */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <CloudSun className="w-5 h-5 text-blue-700" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
              SENAMHI & APIs
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Sincronizador de Datos
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitoreo del estado de sincronización periódica, latencias de red y flujo meteorológico de SENAMHI.
            </p>
          </div>
          <Link
            href="/admin/integraciones"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Monitor de Integraciones</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Required Report for Travel Group Perú: List of Stations and Assigned Zones */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
              <span>Informe Administrativo para Travel Group Perú</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Matriz de Asignación: Estaciones y Zonas Turísticas a Pie
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Listado oficial consolidado para control del levantamiento y actualización de circuitos peatonales.
            </p>
          </div>

          {/* Station Filter for the report */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStationFilter}
              onChange={(e) => setSelectedStationFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="todos">Todas las Estaciones ({estaciones.length})</option>
              {estaciones.map(e => (
                <option key={e.est_id} value={e.est_id}>
                  {e.est_nombre}
                </option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              title="Imprimir Matriz"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">Estación Ferroviaria</th>
                <th className="p-3">Zona Turística (Travel Group)</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Distancia / Tiempo a Pie (Ida)</th>
                <th className="p-3">Ida y Vuelta Total</th>
                <th className="p-3">Dificultad</th>
                <th className="p-3">Tarifa Entrada</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredZonas.map((z) => {
                const est = estaciones.find(e => e.est_id === z.zon_estacion_id);
                return (
                  <tr key={z.zon_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Train className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{est?.est_nombre || 'No asignada'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">{est?.est_ciudad}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {z.zon_nombre}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {z.zon_categoria}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {formatDistance(z.zon_distancia_metros)} (~{formatDurationMin(z.zon_tiempo_caminata_min)})
                    </td>
                    <td className="p-3 font-bold text-emerald-800">
                      {formatDistance(z.zon_distancia_metros * 2)} (~{formatDurationMin(z.zon_tiempo_caminata_min * 2)})
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        z.zon_dificultad === 'Fácil'
                          ? 'bg-emerald-100 text-emerald-800'
                          : z.zon_dificultad === 'Moderado'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {z.zon_dificultad}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">
                      {z.zon_precio_entrada_pen === 0 ? 'Gratis' : formatCurrencyPEN(z.zon_precio_entrada_pen)}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/zonas/${z.zon_id}`}
                        className="text-red-700 hover:text-red-900 font-bold"
                      >
                        Ver Guía
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
