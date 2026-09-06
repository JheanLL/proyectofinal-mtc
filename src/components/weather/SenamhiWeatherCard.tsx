'use client';

import React, { useState } from 'react';
import { TblPronosticoClima, TblEstacion } from '@/types/database';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Thermometer, 
  Droplets, 
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

export default function SenamhiWeatherCard({ clima: initialClima, estacion, compact = false }: SenamhiWeatherCardProps) {
  const [clima, setClima] = useState<TblPronosticoClima>(initialClima);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshLiveWeather = async () => {
    if (!estacion) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/senamhi?estacionId=${estacion.est_id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setClima(json.data);
        }
      }
    } catch (e) {
      console.error('Error refreshing weather:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condicion: string) => {
    switch (condicion) {
      case 'Despejado':
        return <Sun className="w-7 h-7 text-amber-500 animate-spin-slow" />;
      case 'Parcialmente Nublado':
        return <CloudSun className="w-7 h-7 text-amber-400" />;
      case 'Nublado':
        return <Cloud className="w-7 h-7 text-slate-400" />;
      case 'Lluvia Ligera':
      case 'Lluvia Moderada':
        return <CloudRain className="w-7 h-7 text-blue-500" />;
      case 'Tormenta':
        return <CloudLightning className="w-7 h-7 text-purple-600" />;
      default:
        return <Sun className="w-7 h-7 text-amber-500" />;
    }
  };

  const getAlertBadgeColor = (nivel: string) => {
    switch (nivel) {
      case 'Verde':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Amarillo':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Naranja':
        return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'Rojo':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-xl p-3.5 shadow-md border border-blue-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-800/80 rounded-lg">
            {getWeatherIcon(clima.cli_condicion_cielo)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-300">SENAMHI Clima</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getAlertBadgeColor(clima.cli_alerta_meteorologica.nivel)}`}>
                Alerta {clima.cli_alerta_meteorologica.nivel}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold mt-0.5">{clima.cli_condicion_cielo} • {clima.cli_temp_actual_c}°C</h4>
            <p className="text-[11px] text-blue-200">
              Mín: {clima.cli_temp_min_c}°C | Máx: {clima.cli_temp_max_c}°C | Lluvia: {clima.cli_prob_lluvia_pct}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-lg p-1 flex items-center justify-center backdrop-blur-sm">
            <CloudSun className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
              Previsión Meteorológica
            </span>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">
              SENAMHI en Tiempo Real
            </h3>
          </div>
        </div>

        {estacion && (
          <button
            onClick={handleRefreshLiveWeather}
            disabled={isLoading}
            className="flex items-center gap-1 text-[11px] text-blue-200 bg-blue-950/70 hover:bg-blue-950 px-2 py-1 rounded-md border border-blue-700/50 transition-all"
            title="Consultar API meteorológica en vivo"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Actualizando...' : 'API En Vivo'}</span>
          </button>
        )}
      </div>

      {/* Main Weather Data */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-slate-950/60 p-3.5 rounded-xl border border-blue-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-2xs border border-blue-100 dark:border-slate-700 flex items-center justify-center">
              {getWeatherIcon(clima.cli_condicion_cielo)}
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {clima.cli_temp_actual_c}°C
              </span>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {clima.cli_condicion_cielo}
              </div>
              {estacion && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {estacion.est_nombre} ({estacion.est_altitud_msnm} msnm)
                </div>
              )}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Thermometer className="w-3.5 h-3.5 text-red-500 mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Mín / Máx</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{clima.cli_temp_min_c}° / {clima.cli_temp_max_c}°</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Droplets className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Lluvia</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{clima.cli_prob_lluvia_pct}%</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Sun className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Índice UV</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{clima.cli_indice_uv}</span>
            </div>
          </div>
        </div>

        {/* Warning / Alert */}
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${getAlertBadgeColor(clima.cli_alerta_meteorologica.nivel)}`}>
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5 text-xs">
            <div className="font-bold uppercase tracking-wider text-[11px]">
              Alerta Meteorológica: Nivel {clima.cli_alerta_meteorologica.nivel}
            </div>
            <p className="font-medium text-[11px] leading-relaxed">
              {clima.cli_alerta_meteorologica.mensaje}
            </p>
            <p className="font-semibold text-[11px] opacity-90">
              💡 {clima.cli_alerta_meteorologica.recomendacion}
            </p>
          </div>
        </div>

        {/* Clothing Recommendation */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">
            <Shirt className="w-3.5 h-3.5 text-indigo-500" />
            <span>Indumentaria sugerida para la caminata:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {clima.cli_recomendacion_ropa.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1 text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Footer timestamp */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>{clima.cli_fuente_senamhi}</span>
          <span>{clima.cli_fecha_actualizacion}</span>
        </div>
      </div>
    </div>
  );
}
