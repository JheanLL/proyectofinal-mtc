'use client';

import React from 'react';
import { TblHorarioTren, TblEstacion } from '@/types/database';
import { Train, Clock, Check, Coffee, ArrowRight } from 'lucide-react';
import { formatCurrencyPEN, formatCurrencyUSD, formatDurationMin } from '@/lib/utils';

interface PeruRailScheduleCardProps {
  horarios: TblHorarioTren[];
  origen: TblEstacion;
  destino: TblEstacion;
  horarioSeleccionadoId?: string;
  onSelectHorario: (horario: TblHorarioTren) => void;
  onInspectMap?: (horario: TblHorarioTren) => void;
  tipo: 'ida' | 'retorno';
}

export default function PeruRailScheduleCard({
  horarios,
  origen,
  destino,
  horarioSeleccionadoId,
  onSelectHorario,
  onInspectMap,
  tipo,
}: PeruRailScheduleCardProps) {
  const getServiceBadgeStyle = (servicio: string) => {
    switch (servicio) {
      case 'Expedition':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800';
      case 'Vistadome':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700';
      case 'Vistadome Observatory':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700';
      case 'Hiram Bingham':
        return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-950 dark:text-yellow-200 border-yellow-400 dark:border-yellow-700 font-serif';
      case 'Tren Local':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header with spacious padding */}
      <div className={`px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        tipo === 'ida' 
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-r from-slate-900 via-sky-950 to-slate-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-700 rounded-xl text-white shadow-sm shrink-0">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-white/20 rounded-md">
              {tipo === 'ida' ? 'TREN DE IDA (PeruRail)' : 'TREN DE RETORNO (PeruRail)'}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold mt-1 text-white">
              {origen.est_nombre} ➔ {destino.est_nombre}
            </h4>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-semibold bg-white/10 px-3 py-1 rounded-xl self-start sm:self-auto">
          {horarios.length} frecuencias disponibles
        </div>
      </div>

      {/* Schedules List with generous spacing */}
      <div className="p-4 sm:p-6 space-y-4">
        {horarios.length === 0 ? (
          <div className="text-center py-10 text-slate-600 dark:text-slate-300 text-xs">
            No se encontraron frecuencias ferroviarias programadas para este tramo.
          </div>
        ) : (
          horarios.map((hor) => {
            const isSelected = horarioSeleccionadoId === hor.hor_id;
            return (
              <div
                key={hor.hor_id}
                onClick={() => onSelectHorario(hor)}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  isSelected
                    ? 'border-red-600 bg-red-50/70 dark:bg-red-950/50 shadow-sm ring-2 ring-red-600/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800'
                }`}
              >
                {/* Selected Indicator Badge */}
                {isSelected && (
                  <div className="absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full p-1 shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Train Info & Departure/Arrival Timeline */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getServiceBadgeStyle(hor.hor_servicio_tipo)}`}>
                      {hor.hor_servicio_tipo}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      Tren #{hor.hor_codigo_tren}
                    </span>
                    {hor.hor_incluye_refrigerio && (
                      <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Snacks incluidos
                      </span>
                    )}
                  </div>

                  {/* Hours timeline: spacious with prominent cities and duration */}
                  <div className="flex items-center gap-4 pt-1">
                    <div className="min-w-[80px]">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {hor.hor_hora_salida}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[120px]">
                        {origen.est_ciudad}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-2">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        {formatDurationMin(hor.hor_duracion_min)}
                      </span>
                      <div className="w-full max-w-[140px] sm:max-w-[180px] h-1 bg-slate-200 dark:bg-slate-700 rounded-full relative my-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -top-0.75 -left-1 ring-2 ring-white dark:ring-slate-900"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-300 absolute -top-0.75 -right-1 ring-2 ring-white dark:ring-slate-900"></div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        Ruta Directa
                      </span>
                    </div>

                    <div className="min-w-[80px] text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {hor.hor_hora_llegada}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[120px]">
                        {destino.est_ciudad}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing and Action Button */}
                <div className="md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <div>
                    <div className="text-lg sm:text-xl font-black text-red-700 dark:text-red-400 tracking-tight">
                      {formatCurrencyPEN(hor.hor_tarifa_regular_pen)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Turista: {formatCurrencyUSD(hor.hor_tarifa_turista_usd)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHorario(hor);
                      }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${
                        isSelected
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-red-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                    </button>

                    {onInspectMap && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHorario(hor);
                          onInspectMap(hor);
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        🗺️ Ver Mapa & Simulación
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
