'use client';

import React from 'react';
import { TblHorarioTren, TblEstacion } from '@/types/database';
import { Train, Clock, DollarSign, Check, Sparkles, Coffee, Users } from 'lucide-react';
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vistadome':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Vistadome Observatory':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Hiram Bingham':
        return 'bg-yellow-100 text-yellow-900 border-yellow-400 font-serif';
      case 'Tren Local':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-3.5 text-white flex items-center justify-between ${
        tipo === 'ida' 
          ? 'bg-gradient-to-r from-slate-900 to-slate-800' 
          : 'bg-gradient-to-r from-sky-950 to-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg text-white">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 rounded">
              {tipo === 'ida' ? 'TREN DE IDA (PeruRail)' : 'TREN DE RETORNO (PeruRail)'}
            </span>
            <h4 className="text-sm font-bold mt-0.5">
              {origen.est_nombre} ➔ {destino.est_nombre}
            </h4>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-medium">
          {horarios.length} frecuencias disponibles
        </div>
      </div>

      {/* Schedules List */}
      <div className="p-4 space-y-3">
        {horarios.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No se encontraron frecuencias ferroviarias directas para este tramo.
          </div>
        ) : (
          horarios.map((hor) => {
            const isSelected = horarioSeleccionadoId === hor.hor_id;
            return (
              <div
                key={hor.hor_id}
                onClick={() => onSelectHorario(hor)}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-red-600 bg-red-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-0.5 shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                {/* Train Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getServiceBadgeStyle(hor.hor_servicio_tipo)}`}>
                      {hor.hor_servicio_tipo}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      Código: {hor.hor_codigo_tren}
                    </span>
                    {hor.hor_incluye_refrigerio && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-medium">
                        <Coffee className="w-3 h-3" /> Snacks a bordo
                      </span>
                    )}
                  </div>

                  {/* Hours timeline */}
                  <div className="flex items-center gap-4 pt-1">
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">{hor.hor_hora_salida}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{origen.est_ciudad}</div>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDurationMin(hor.hor_duracion_min)}
                      </span>
                      <div className="w-20 sm:w-28 h-0.5 bg-slate-300 relative my-1">
                        <div className="w-2 h-2 rounded-full bg-red-600 absolute -top-0.75 -left-1"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700 absolute -top-0.75 -right-1"></div>
                      </div>
                      <span className="text-[10px] text-slate-400">Directo</span>
                    </div>

                    <div>
                      <div className="text-xl font-extrabold text-slate-900">{hor.hor_hora_llegada}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{destino.est_ciudad}</div>
                    </div>
                  </div>
                </div>

                {/* Pricing and Action */}
                <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
                  <div>
                    <div className="text-lg font-bold text-red-700">
                      {formatCurrencyPEN(hor.hor_tarifa_regular_pen)}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Turista: {formatCurrencyUSD(hor.hor_tarifa_turista_usd)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHorario(hor);
                    }}
                    className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Seleccionado' : 'Seleccionar'}
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
