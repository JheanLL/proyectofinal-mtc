'use client';

import React from 'react';
import { TblPronosticoClima, TblEstacion } from '@/types/database';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldAlert, 
  Shirt, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface SenamhiWeatherCardProps {
  clima: TblPronosticoClima;
  estacion?: TblEstacion;
  compact?: boolean;
}

export default function SenamhiWeatherCard({ clima, estacion, compact = false }: SenamhiWeatherCardProps) {
  // Helper for weather icons
  const getWeatherIcon = (condicion: string) => {
    switch (condicion) {
      case 'Despejado':
        return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
      case 'Parcialmente Nublado':
        return <CloudSun className="w-8 h-8 text-amber-400" />;
      case 'Nublado':
        return <Cloud className="w-8 h-8 text-slate-400" />;
      case 'Lluvia Ligera':
      case 'Lluvia Moderada':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'Tormenta':
        return <CloudLightning className="w-8 h-8 text-purple-600" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  const getAlertBadgeColor = (nivel: string) => {
    switch (nivel) {
      case 'Verde':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Amarillo':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Naranja':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Rojo':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl p-4 shadow-md border border-blue-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-800/80 rounded-lg">
            {getWeatherIcon(clima.cli_condicion_cielo)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-300">SENAMHI Clima</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getAlertBadgeColor(clima.cli_alerta_meteorologica.nivel)}`}>
                Alerta {clima.cli_alerta_meteorologica.nivel}
              </span>
            </div>
            <h4 className="text-sm font-bold mt-0.5">{clima.cli_condicion_cielo} • {clima.cli_temp_actual_c}°C</h4>
            <p className="text-xs text-blue-200">
              Mín: {clima.cli_temp_min_c}°C | Máx: {clima.cli_temp_max_c}°C | Lluvia: {clima.cli_prob_lluvia_pct}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Institutional SENAMHI Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-md">
            <CloudSun className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600/80 text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase">
                Servicio Nacional de Meteorología e Hidrología
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight mt-0.5">
              Pronóstico Meteorológico SENAMHI
            </h3>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-700/50">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>{clima.cli_fuente_senamhi}</span>
        </div>
      </div>

      {/* Main Weather Data */}
      <div className="p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/70 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center">
              {getWeatherIcon(clima.cli_condicion_cielo)}
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {clima.cli_temp_actual_c}°C
              </span>
              <div className="text-sm font-semibold text-slate-700">
                {clima.cli_condicion_cielo}
              </div>
              {estacion && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Estación: {estacion.est_nombre} ({estacion.est_altitud_msnm} msnm)
                </div>
              )}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <Thermometer className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-500 block">Mín / Máx</span>
              <span className="text-xs font-bold text-slate-800">{clima.cli_temp_min_c}° / {clima.cli_temp_max_c}°C</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-500 block">Lluvia</span>
              <span className="text-xs font-bold text-slate-800">{clima.cli_prob_lluvia_pct}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-500 block">Índice UV</span>
              <span className="text-xs font-bold text-amber-700">{clima.cli_indice_uv} (Extremo)</span>
            </div>
          </div>
        </div>

        {/* Official Warning / Alert */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${getAlertBadgeColor(clima.cli_alerta_meteorologica.nivel)}`}>
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider">
              Aviso Meteorológico SENAMHI: Nivel {clima.cli_alerta_meteorologica.nivel}
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {clima.cli_alerta_meteorologica.mensaje}
            </p>
            <p className="text-xs font-semibold text-slate-800">
              💡 {clima.cli_alerta_meteorologica.recomendacion}
            </p>
          </div>
        </div>

        {/* Clothing / Equipment Recommendation for Walking */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
            <Shirt className="w-4 h-4 text-indigo-600" />
            <span>Indumentaria recomendada para caminatas a pie:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {clima.cli_recomendacion_ropa.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Footer timestamp */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Actualización periódica diaria según protocolo SENAMHI</span>
          <span>{clima.cli_fecha_actualizacion}</span>
        </div>
      </div>
    </div>
  );
}
