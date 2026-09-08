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
  ArrowRight,
  TrendingUp,
  Printer,
  RotateCcw,
  History
} from 'lucide-react';
import { formatCurrencyPEN, formatDistance, formatDurationMin } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);
  const [itinerarios, setItinerarios] = useState<TblItinerarioConsulta[]>([]);
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('todos');

  const reloadData = () => {
    setEstaciones(getEstaciones());
    setZonas(getZonasTuristicas());
    setHorarios(getHorariosTren());
    setItinerarios(getItinerarios());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('mtc_db_updated', reloadData);
    return () => window.removeEventListener('mtc_db_updated', reloadData);
  }, []);

  const handleResetData = () => {
    if (confirm('¿Restablecer la base de datos a sus valores iniciales?')) {
      resetDatabaseToDefaults();
      reloadData();
      alert('Base de datos restablecida.');
    }
  };

  const filteredZonas = zonas.filter(z => 
    selectedStationFilter === 'todos' || z.zon_estacion_id === selectedStationFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Admin Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-700/60 text-red-300 text-xs font-bold mb-1.5">
            <Settings className="w-3.5 h-3.5 text-red-400" />
            <span>Panel de Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Panel de Control y Gestión MTC
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Gestión centralizada para <strong>Travel Group Perú</strong> (Zonas turísticas a pie), <strong>PeruRail</strong> (Horarios y tarifas) y Monitoreo de <strong>SENAMHI</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/zonas"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            title="Acceso directo a Gestión de Zonas Turísticas"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Gestionar Zonas</span>
          </Link>

          <Link
            href="/admin/horarios"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            title="Acceso directo a Gestión de Horarios y Trenes"
          >
            <Train className="w-3.5 h-3.5" />
            <span>Gestionar Trenes</span>
          </Link>

          <Link
            href="/informe"
            className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            title="Ver y consultar los informes turísticos generados"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Informes</span>
          </Link>

          <button
            onClick={handleResetData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          <Link
            href="/admin/integraciones"
            className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sincronizar</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Estaciones */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estaciones</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{estaciones.length}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">PeruRail (Lectura)</span>
          </div>
          <div className="p-2.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-2xl">
            <Train className="w-5 h-5" />
          </div>
        </div>

        {/* Zonas Turísticas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Zonas a Pie</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">{zonas.length}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Travel Group (CRUD)</span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-2xl">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Frecuencias de Tren */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Frecuencias</span>
            <span className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-0.5 block">{horarios.length}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">PeruRail (CRUD)</span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Consultas / Informes */}
        <Link
          href="/informe"
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all group cursor-pointer"
          title="Ver todos los informes turísticos generados"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Itinerarios</span>
            <span className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 mt-0.5 block group-hover:scale-105 transition-transform">{itinerarios.length}</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Ver Informes &rarr;</span>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-2xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Entity Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Travel Group Peru */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
              Travel Group Perú
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              CRUD Zonas Turísticas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Registrar, modificar y georreferenciar circuitos a pie vinculados a estaciones con cálculo de distancias.
            </p>
          </div>
          <Link
            href="/admin/zonas"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gestionar Zonas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: PeruRail */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-blue-200 dark:border-blue-900/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
              <Train className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
              PeruRail
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              CRUD Horarios y Tarifas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Administración de trenes, frecuencias, tipos de servicio (Expedition, Vistadome) y tarifas oficiales.
            </p>
          </div>
          <Link
            href="/admin/horarios"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gestionar Trenes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Integraciones */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
              <CloudSun className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
              SENAMHI & APIs
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Sincronizador de Datos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitoreo del estado de sincronización periódica, latencias de red y llamadas a API meteorológica.
            </p>
          </div>
          <Link
            href="/admin/integraciones"
            className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Monitor de APIs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Auditoría & Control RBAC */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-purple-200 dark:border-purple-900/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
              <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
              Auditoría & RBAC
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Bitácora de Cambios
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Historial de creaciones, modificaciones y accesos por rol con detalle de eventos.
            </p>
          </div>
          <Link
            href="/admin/auditoria"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ver Auditoría</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Listado de Estaciones y Zonas Asignadas (Informe para Travel Group Perú) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full mb-1">
              <span>Informe para Travel Group Perú (Norma MTC)</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Listado de Estaciones y Zonas Asignadas
            </h3>
          </div>

          {/* Station Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStationFilter}
              onChange={(e) => setSelectedStationFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              title="Imprimir"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-2.5">Estación</th>
                <th className="p-2.5">Zona Turística</th>
                <th className="p-2.5">Categoría</th>
                <th className="p-2.5">Ida</th>
                <th className="p-2.5">Ida y Vuelta</th>
                <th className="p-2.5">Dificultad</th>
                <th className="p-2.5">Entrada</th>
                <th className="p-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredZonas.map((z) => {
                const est = estaciones.find(e => e.est_id === z.zon_estacion_id);
                return (
                  <tr key={z.zon_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <Train className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                        <span>{est?.est_nombre || 'No asignada'}</span>
                      </div>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {z.zon_nombre}
                    </td>
                    <td className="p-2.5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                        {z.zon_categoria}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">
                      {formatDistance(z.zon_distancia_metros)} (~{formatDurationMin(z.zon_tiempo_caminata_min)})
                    </td>
                    <td className="p-2.5 font-bold text-emerald-800 dark:text-emerald-400">
                      {formatDistance(z.zon_distancia_metros * 2)} (~{formatDurationMin(z.zon_tiempo_caminata_min * 2)})
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        z.zon_dificultad === 'Fácil'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : z.zon_dificultad === 'Moderado'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                      }`}>
                        {z.zon_dificultad}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 dark:text-slate-300 font-semibold">
                      {z.zon_precio_entrada_pen === 0 ? 'Gratis' : formatCurrencyPEN(z.zon_precio_entrada_pen)}
                    </td>
                    <td className="p-2.5 text-right">
                      <Link
                        href={`/zonas/${z.zon_id}`}
                        className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold"
                      >
                        Ver
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
