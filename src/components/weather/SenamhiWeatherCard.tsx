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
  RefreshCw,
  Wind
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
        return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
      case 'Parcialmente Nublado':
        return <CloudSun className="w-8 h-8 text-amber-400" />;
      case 'Nublado':
        return <Cloud className="w-8 h-8 text-slate-400" />;
      case 'Lluvia Ligera':
      case 'Lluvia Moderada':
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'Tormenta':
        return <CloudLightning className="w-8 h-8 text-purple-400" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  const getAlertBadgeColor = (nivel: string) => {
    switch (nivel) {
      case 'Verde':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700';
      case 'Amarillo':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700';
      case 'Naranja':
        return 'bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      case 'Rojo':
        return 'bg-red-100 dark:bg-red-950 text-red-950 dark:text-red-200 border-red-300 dark:border-red-700';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700';
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-800/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-900/60 rounded-xl border border-blue-700/50">
            {getWeatherIcon(clima.cli_condicion_cielo)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-blue-300">SENAMHI Clima</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold border ${getAlertBadgeColor(clima.cli_alerta_meteorologica.nivel)}`}>
                Alerta {clima.cli_alerta_meteorologica.nivel}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold mt-0.5 text-white">{clima.cli_condicion_cielo} • {clima.cli_temp_actual_c}°C</h4>
            <p className="text-xs text-blue-200 font-medium mt-0.5">
              Mín: {clima.cli_temp_min_c}°C | Máx: {clima.cli_temp_max_c}°C | Lluvia: {clima.cli_prob_lluvia_pct}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl p-1.5 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <CloudSun className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-blue-300 font-extrabold uppercase tracking-wider block">
              Previsión Meteorológica Oficial
            </span>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
              SENAMHI en Tiempo Real
            </h3>
          </div>
        </div>

        {estacion && (
          <button
            onClick={handleRefreshLiveWeather}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-blue-100 bg-blue-900/80 hover:bg-blue-800 px-3 py-1.5 rounded-xl border border-blue-700/60 transition-all font-semibold"
            title="Consultar API meteorológica en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Actualizando...' : 'Consultar API'}</span>
          </button>
        )}
      </div>

      {/* Main Weather Data */}
      <div className="p-5 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-blue-50/60 dark:bg-slate-950/70 p-5 rounded-2xl border border-blue-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-800 flex items-center justify-center shrink-0">
              {getWeatherIcon(clima.cli_condicion_cielo)}
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {clima.cli_temp_actual_c}°C
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {clima.cli_condicion_cielo}
              </div>
              {estacion && (
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Estación {estacion.est_nombre} ({estacion.est_altitud_msnm} msnm)
                </div>
              )}
            </div>
          </div>

          {/* Key Indicators: spacious cards */}
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[280px]">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <Thermometer className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">Mín / Máx</span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">{clima.cli_temp_min_c}° / {clima.cli_temp_max_c}°</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">Lluvia</span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">{clima.cli_prob_lluvia_pct}%</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">Índice UV</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-300 mt-0.5 block">{clima.cli_indice_uv}</span>
            </div>
          </div>
        </div>

        {/* Warning / Alert Box with Accessible Colors */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${getAlertBadgeColor(clima.cli_alerta_meteorologica.nivel)}`}>
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-black uppercase tracking-wider text-xs">
              Alerta Meteorológica: Nivel {clima.cli_alerta_meteorologica.nivel}
            </div>
            <p className="font-semibold leading-relaxed">
              {clima.cli_alerta_meteorologica.mensaje}
            </p>
            <p className="font-bold pt-1 border-t border-black/10 dark:border-white/10">
              💡 Recomendación preventiva: {clima.cli_alerta_meteorologica.recomendacion}
            </p>
          </div>
        </div>

        {/* Clothing Recommendation */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            <Shirt className="w-4 h-4 text-indigo-500" />
            <span>Indumentaria sugerida para la caminata al aire libre:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {clima.cli_recomendacion_ropa.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Footer timestamp with high contrast */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>{clima.cli_fuente_senamhi}</span>
          <span>Actualizado: {clima.cli_fecha_actualizacion}</span>
        </div>
      </div>
    </div>
  );
}
