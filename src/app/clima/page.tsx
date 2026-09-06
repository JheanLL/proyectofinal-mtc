'use client';

import React, { useState, useEffect } from 'react';
import { getEstaciones, getAllClimas } from '@/lib/db/store';
import { TblEstacion, TblPronosticoClima } from '@/types/database';
import { 
  CloudSun, 
  RefreshCw,
  Radio
} from 'lucide-react';
import SenamhiWeatherCard from '@/components/weather/SenamhiWeatherCard';

export default function ClimaPage() {
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [climas, setClimas] = useState<Record<string, TblPronosticoClima>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveClimas = async (force: boolean = false) => {
    setIsRefreshing(true);
    try {
      const url = force ? `/api/senamhi?refresh=true&t=${Date.now()}` : '/api/senamhi';
      const res = await fetch(url, { cache: force ? 'no-store' : 'default' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setClimas(json.data);
        }
      }
    } catch (e) {
      console.error('Error fetching live weather:', e);
      setClimas(getAllClimas());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setEstaciones(getEstaciones());
    setClimas(getAllClimas());
    fetchLiveClimas();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-8 border border-blue-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-600/50 text-blue-200 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SENAMHI • Previsión Meteorológica en Tiempo Real</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            Monitoreo Climatológico por Estación
          </h1>
          <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
            Previsiones meteorológicas en tiempo real, alertas preventivas por radiación UV y lluvias para la planificación segura de caminatas a pie desde las estaciones.
          </p>
        </div>

        <button
          onClick={() => fetchLiveClimas(true)}
          disabled={isRefreshing}
          className="bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Consultando API...' : 'Actualizar Clima en Vivo'}</span>
        </button>
      </div>

      {/* Weather Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
