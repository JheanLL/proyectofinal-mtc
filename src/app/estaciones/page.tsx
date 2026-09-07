'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEstaciones, getHorariosTren, getZonasTuristicas, getClimaByEstacion } from '@/lib/db/store';
import { TblEstacion, TblHorarioTren, TblZonaTuristica } from '@/types/database';
import { 
  Train, 
  Clock, 
  Footprints, 
  Sparkles, 
  CheckCircle2, 
  Phone
} from 'lucide-react';
import { formatCurrencyPEN, formatCurrencyUSD, formatDurationMin, formatDistance } from '@/lib/utils';
import TrainJourneyMap from '@/components/trains/TrainJourneyMap';

export default function EstacionesPage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [selectedEstacionId, setSelectedEstacionId] = useState<string>('est_04');
  const [selectedTrainForSimulation, setSelectedTrainForSimulation] = useState<TblHorarioTren | null>(null);

  useEffect(() => {
    setEstaciones(getEstaciones());
    setHorarios(getHorariosTren());
    setZonas(getZonasTuristicas());

    // Fetch from API
    fetch('/api/estaciones')
      .then(res => res.json())
      .then(data => { if (data.data) setEstaciones(data.data); })
      .catch(() => {});
  }, []);

  const activeEstacion = estaciones.find(e => e.est_id === selectedEstacionId) || estaciones[0];
  const stationZonas = zonas.filter(z => z.zon_estacion_id === selectedEstacionId);
  const stationDepartures = horarios.filter(h => h.hor_estacion_origen_id === selectedEstacionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400 text-xs font-bold mb-1.5">
            <Train className="w-3.5 h-3.5" />
            <span>Red Ferroviaria PeruRail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Estaciones Ferroviarias y Frecuencias de Tren
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Información logística de estaciones, horarios de salida y llegada, servicios a bordo y conexiones turísticas peatonales.
          </p>
        </div>

        <Link
          href="/planificador"
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planificar Ruta</span>
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Station Selector List */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Estaciones ({estaciones.length})
          </h2>

          <div className="space-y-2">
            {estaciones.map((est) => {
              const isSelected = est.est_id === selectedEstacionId;
              const countZonas = zonas.filter(z => z.zon_estacion_id === est.est_id).length;
              return (
                <div
                  key={est.est_id}
                  onClick={() => setSelectedEstacionId(est.est_id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/30 shadow-2xs ring-2 ring-red-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                      <Train className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{est.est_nombre}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{est.est_ciudad} • {est.est_altitud_msnm} msnm</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 shrink-0">
                    {countZonas} a pie
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Station Details */}
        {activeEstacion && (
          <div className="lg:col-span-2 space-y-5">
            {/* Station Hero Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="relative h-48 bg-slate-900">
                <img
                  src={activeEstacion.est_imagen_url}
                  alt={activeEstacion.est_nombre}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                <div className="absolute bottom-3 left-5 right-5 text-white space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-red-600 px-1.5 py-0.2 rounded">
                    Código: {activeEstacion.est_codigo}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">{activeEstacion.est_nombre}</h2>
                  <p className="text-[11px] text-slate-300">
                    {activeEstacion.est_ciudad}, {activeEstacion.est_departamento} • {activeEstacion.est_altitud_msnm} msnm
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-3.5">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeEstacion.est_descripcion}
                </p>

                {/* Services Pills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Servicios en estación:</span>
                  <div className="flex flex-wrap gap-1">
                    {activeEstacion.est_servicios.map((srv, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {activeEstacion.est_telefono_contacto && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Phone className="w-3 h-3 text-red-600" />
                    <span>Contacto PeruRail: <strong>{activeEstacion.est_telefono_contacto}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Walking Zones */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Atractivos a Pie desde {activeEstacion.est_nombre} ({stationZonas.length})
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Ida y vuelta a pie</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stationZonas.map((z) => (
                  <Link
                    key={z.zon_id}
                    href={`/zonas/${z.zon_id}`}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-950/40 hover:bg-emerald-50/20 transition-all flex items-start gap-2.5 group"
                  >
                    <img
                      src={z.zon_imagen_url}
                      alt={z.zon_nombre}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {z.zon_nombre}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        🚶 {formatDistance(z.zon_distancia_metros)} (~{formatDurationMin(z.zon_tiempo_caminata_min)})
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                        Dificultad: {z.zon_dificultad}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Timetables */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-600" />
                  Frecuencias de Tren Asociadas
                </h3>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {horarios
                  .filter(h => h.hor_estacion_origen_id === activeEstacion.est_id || h.hor_estacion_destino_id === activeEstacion.est_id)
                  .map((h) => {
                    const orig = estaciones.find(e => e.est_id === h.hor_estacion_origen_id);
                    const dest = estaciones.find(e => e.est_id === h.hor_estacion_destino_id);
                    const isSelected = selectedTrainForSimulation?.hor_id === h.hor_id;
                    return (
                      <div key={h.hor_id} className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${isSelected ? 'bg-red-50/60 dark:bg-red-950/30 px-3 rounded-2xl' : ''}`}>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{orig?.est_ciudad} ➔ {dest?.est_ciudad}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              {h.hor_servicio_tipo}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">({h.hor_codigo_tren})</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Salida: <strong>{h.hor_hora_salida}</strong> | Llegada: <strong>{h.hor_hora_llegada}</strong> (~{formatDurationMin(h.hor_duracion_min)})
                          </p>
                        </div>

                        <div className="flex items-center gap-3 sm:self-auto">
                          <span className="font-bold text-red-700 dark:text-red-400 text-xs sm:text-sm block">
                            {formatCurrencyPEN(h.hor_tarifa_regular_pen)}
                          </span>
                          <button
                            onClick={() => setSelectedTrainForSimulation(isSelected ? null : h)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-red-700 text-white border-red-700 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {isSelected ? 'Cerrar Mapa' : '🗺️ Simular'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Render Train Journey Map if selected */}
              {selectedTrainForSimulation && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {(() => {
                    const orig = estaciones.find(e => e.est_id === selectedTrainForSimulation.hor_estacion_origen_id) || activeEstacion;
                    const dest = estaciones.find(e => e.est_id === selectedTrainForSimulation.hor_estacion_destino_id) || activeEstacion;
                    return (
                      <TrainJourneyMap
                        horario={selectedTrainForSimulation}
                        origen={orig}
                        destino={dest}
                        onClose={() => setSelectedTrainForSimulation(null)}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
