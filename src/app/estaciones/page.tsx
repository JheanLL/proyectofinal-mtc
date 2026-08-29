'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEstaciones, getHorariosTren, getZonasTuristicas, getClimaByEstacion } from '@/lib/db/store';
import { TblEstacion, TblHorarioTren, TblZonaTuristica } from '@/types/database';
import { 
  Train, 
  MapPin, 
  Clock, 
  Footprints, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Phone,
  CloudSun
} from 'lucide-react';
import { formatCurrencyPEN, formatCurrencyUSD, formatDurationMin, formatDistance } from '@/lib/utils';

export default function EstacionesPage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [selectedEstacionId, setSelectedEstacionId] = useState<string>('est_04');

  useEffect(() => {
    setEstaciones(getEstaciones());
    setHorarios(getHorariosTren());
    setZonas(getZonasTuristicas());
  }, []);

  const activeEstacion = estaciones.find(e => e.est_id === selectedEstacionId) || estaciones[0];
  const stationZonas = zonas.filter(z => z.zon_estacion_id === selectedEstacionId);
  const stationDepartures = horarios.filter(h => h.hor_estacion_origen_id === selectedEstacionId);
  const stationArrivals = horarios.filter(h => h.hor_estacion_destino_id === selectedEstacionId);
  const stationWeather = activeEstacion ? getClimaByEstacion(activeEstacion.est_id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-2">
            <Train className="w-3.5 h-3.5" />
            <span>Red Ferroviaria PeruRail & MTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Estaciones Ferroviarias y Servicios de Tren
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Información logística de estaciones, horarios de salida y llegada, servicios a bordo y conexiones turísticas peatonales.
          </p>
        </div>

        <Link
          href="/planificador"
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Planificar Ruta en Tren</span>
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Station Selector List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Estaciones del Sistema ({estaciones.length})
          </h2>

          <div className="space-y-2">
            {estaciones.map((est) => {
              const isSelected = est.est_id === selectedEstacionId;
              const countZonas = zonas.filter(z => z.zon_estacion_id === est.est_id).length;
              return (
                <div
                  key={est.est_id}
                  onClick={() => setSelectedEstacionId(est.est_id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-red-600 bg-red-50/50 shadow-sm ring-2 ring-red-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{est.est_nombre}</h4>
                      <p className="text-[11px] text-slate-500">{est.est_ciudad} • {est.est_altitud_msnm} msnm</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600 shrink-0">
                    {countZonas} a pie
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Station Details */}
        {activeEstacion && (
          <div className="lg:col-span-2 space-y-6">
            {/* Station Hero Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative h-56 bg-slate-900">
                <img
                  src={activeEstacion.est_imagen_url}
                  alt={activeEstacion.est_nombre}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-red-600 px-2 py-0.5 rounded">
                    Código: {activeEstacion.est_codigo}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">{activeEstacion.est_nombre}</h2>
                  <p className="text-xs text-slate-300">
                    {activeEstacion.est_ciudad}, {activeEstacion.est_departamento} • {activeEstacion.est_altitud_msnm} metros sobre el nivel del mar
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeEstacion.est_descripcion}
                </p>

                {/* Services Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Servicios disponibles en estación:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeEstacion.est_servicios.map((srv, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {activeEstacion.est_telefono_contacto && (
                  <div className="text-xs text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>Contacto PeruRail Boletería: <strong>{activeEstacion.est_telefono_contacto}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Walking Zones */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  Atractivos para Visitar Exclusivamente a Pie ({stationZonas.length})
                </h3>
                <span className="text-xs text-slate-500">Un solo tramo ida/vuelta</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stationZonas.map((z) => (
                  <Link
                    key={z.zon_id}
                    href={`/zonas/${z.zon_id}`}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 transition-all flex items-start gap-3 group"
                  >
                    <img
                      src={z.zon_imagen_url}
                      alt={z.zon_nombre}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {z.zon_nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        🚶 {formatDistance(z.zon_distancia_metros)} (~{formatDurationMin(z.zon_tiempo_caminata_min)} a pie)
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-700 block mt-1">
                        Dificultad: {z.zon_dificultad}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Timetables for this Station */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  Frecuencias de Tren PeruRail Asociadas
                </h3>
                <span className="text-xs text-slate-500">Actualización diaria</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {horarios
                  .filter(h => h.hor_estacion_origen_id === activeEstacion.est_id || h.hor_estacion_destino_id === activeEstacion.est_id)
                  .map((h) => {
                    const orig = estaciones.find(e => e.est_id === h.hor_estacion_origen_id);
                    const dest = estaciones.find(e => e.est_id === h.hor_estacion_destino_id);
                    return (
                      <div key={h.hor_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{orig?.est_ciudad} ➔ {dest?.est_ciudad}</span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {h.hor_servicio_tipo}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">({h.hor_codigo_tren})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Salida: <strong>{h.hor_hora_salida}</strong> | Llegada: <strong>{h.hor_hora_llegada}</strong> (~{formatDurationMin(h.hor_duracion_min)})
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <span className="font-bold text-red-700 text-sm block">
                            {formatCurrencyPEN(h.hor_tarifa_regular_pen)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Turista: {formatCurrencyUSD(h.hor_tarifa_turista_usd)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
