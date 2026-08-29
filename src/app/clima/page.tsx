'use client';

import React, { useState, useEffect } from 'react';
import { getEstaciones, getAllClimas } from '@/lib/db/store';
import { TblEstacion, TblPronosticoClima } from '@/types/database';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  ShieldAlert, 
  Shirt, 
  Sparkles, 
  RefreshCw,
  Wind
} from 'lucide-react';
import SenamhiWeatherCard from '@/components/weather/SenamhiWeatherCard';

export default function ClimaPage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [climas, setClimas] = useState<Record<string, TblPronosticoClima>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setEstaciones(getEstaciones());
    setClimas(getAllClimas());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setClimas(getAllClimas());
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 border border-blue-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-600/50 text-blue-200 text-xs font-bold">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>Servicio Nacional de Meteorología e Hidrología (SENAMHI)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Monitoreo Climatológico por Estación Ferroviaria
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
            Previsiones meteorológicas oficiales en tiempo real, alertas preventivas por radiación UV y lluvias para la planificación segura de caminatas a pie desde las estaciones.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all self-start md:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 text-blue-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Consultando SENAMHI...' : 'Actualizar Previsiones'}</span>
        </button>
      </div>

      {/* Weather Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {estaciones.map((est) => {
          const clima = climas[est.est_id];
          if (!clima) return null;

          return (
            <div key={est.est_id}>
              <SenamhiWeatherCard clima={clima} estacion={est} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
