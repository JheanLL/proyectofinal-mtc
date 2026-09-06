'use client';

import React from 'react';
import { TblHorarioTren, TblEstacion } from '@/types/database';
import { Train, Clock, Check, Coffee } from 'lucide-react';
import { formatCurrencyPEN, formatCurrencyUSD, formatDurationMin } from '@/lib/utils';

interface PeruRailScheduleCardProps {
  horarios: TblHorarioTren[];
  origen: TblEstacion;
  destino: TblEstacion;
  horarioSeleccionadoId?: string;
  onSelectHorario: (horario: TblHorarioTren) => void;
  tipo: 'ida' | 'retorno';
}

export default function PeruRailScheduleCard({
  horarios,
  origen,
  destino,
  horarioSeleccionadoId,
  onSelectHorario,
  tipo,
}: PeruRailScheduleCardProps) {
  const getServiceBadgeStyle = (servicio: string) => {
    switch (servicio) {
      case 'Expedition':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Vistadome':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Vistadome Observatory':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Hiram Bingham':
        return 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-300 border-yellow-400 dark:border-yellow-800 font-serif';
      case 'Tren Local':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className={`px-4 sm:px-5 py-3 text-white flex items-center justify-between ${
        tipo === 'ida' 
          ? 'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900' 
          : 'bg-gradient-to-r from-sky-950 to-slate-900 dark:from-slate-950 dark:to-slate-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-700 rounded-lg text-white">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-white/20 rounded">
              {tipo === 'ida' ? 'TREN DE IDA (PeruRail)' : 'TREN DE RETORNO (PeruRail)'}
            </span>
            <h4 className="text-xs sm:text-sm font-bold mt-0.5">
              {origen.est_nombre} ➔ {destino.est_nombre}
            </h4>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 font-medium">
          {horarios.length} frecuencias
        </div>
      </div>

      {/* Schedules List */}
      <div className="p-3 sm:p-4 space-y-2.5">
        {horarios.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
            No se encontraron frecuencias ferroviarias para este tramo.
          </div>
        ) : (
          horarios.map((hor) => {
            const isSelected = horarioSeleccionadoId === hor.hor_id;
            return (
              <div
                key={hor.hor_id}
                onClick={() => onSelectHorario(hor)}
                className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/30 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40 hover:bg-slate-50/70 dark:hover:bg-slate-850'
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Train Info */}
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold border ${getServiceBadgeStyle(hor.hor_servicio_tipo)}`}>
                      {hor.hor_servicio_tipo}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                      #{hor.hor_codigo_tren}
                    </span>
                    {hor.hor_incluye_refrigerio && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1 font-medium">
                        <Coffee className="w-2.5 h-2.5" /> Snacks
                      </span>
                    )}
                  </div>

                  {/* Hours timeline */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{hor.hor_hora_salida}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{origen.est_ciudad}</div>
                    </div>

                    <div className="flex flex-col items-center px-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        {formatDurationMin(hor.hor_duracion_min)}
                      </span>
                      <div className="w-16 sm:w-24 h-0.5 bg-slate-300 dark:bg-slate-700 relative my-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 absolute -top-0.5 -left-0.5"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-slate-400 absolute -top-0.5 -right-0.5"></div>
                      </div>
                      <span className="text-[9px] text-slate-400">Directo</span>
                    </div>

                    <div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{hor.hor_hora_llegada}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{destino.est_ciudad}</div>
                    </div>
                  </div>
                </div>

                {/* Pricing and Action */}
                <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 flex sm:flex-col items-center sm:items-end justify-between">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">
                      {formatCurrencyPEN(hor.hor_tarifa_regular_pen)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Turista: {formatCurrencyUSD(hor.hor_tarifa_turista_usd)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHorario(hor);
                    }}
                    className={`mt-1 text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-700 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Elegido' : 'Elegir'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
