'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getZonaById, getEstacionById, getClimaByEstacion, getHorariosTren } from '@/lib/db/store';
import { TblZonaTuristica, TblEstacion, TblPronosticoClima, TblHorarioTren } from '@/types/database';
import { 
  ArrowLeft, 
  Train, 
  Footprints, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Compass
} from 'lucide-react';
import WalkingRouteMap from '@/components/maps/WalkingRouteMap';
import SenamhiWeatherCard from '@/components/weather/SenamhiWeatherCard';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';

export default function ZonaDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [zona, setZona] = useState<TblZonaTuristica | null>(null);
  const [estacion, setEstacion] = useState<TblEstacion | null>(null);
  const [clima, setClima] = useState<TblPronosticoClima | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      let currentZona = getZonaById(id);
      let currentEstacion = currentZona ? getEstacionById(currentZona.zon_estacion_id) : undefined;

      // Si no se encuentra en store local, consultar a la API de Aiven MySQL
      if (!currentZona || !currentEstacion) {
        try {
          const [resZonas, resEst] = await Promise.all([
            fetch(`/api/zonas?id=${id}&t=${Date.now()}`).then(r => r.json()),
            fetch(`/api/estaciones?t=${Date.now()}`).then(r => r.json())
          ]);

          if (resZonas.success && resZonas.data && resZonas.data.length > 0) {
            currentZona = resZonas.data[0];
          }
          if (resEst.success && Array.isArray(resEst.data) && currentZona) {
            currentEstacion = resEst.data.find((e: TblEstacion) => e.est_id === currentZona!.zon_estacion_id);
          }
        } catch (e) {
          console.warn('Error fetching zona from API:', e);
        }
      }

      if (isMounted) {
        if (currentZona) setZona(currentZona);
        if (currentEstacion) {
          setEstacion(currentEstacion);
          setClima(getClimaByEstacion(currentEstacion.est_id));
        }
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Cargando atractivo turístico...</p>
      </div>
    );
  }

  if (!zona || !estacion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Zona turística no encontrada</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Es posible que el ID sea inválido o haya sido actualizado.</p>
        <Link
          href="/zonas"
          className="inline-flex items-center gap-2 bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Back Button & Title Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/zonas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Zonas</span>
        </Link>

        <Link
          href={`/planificador?zonaId=${zona.zon_id}&estacionId=${estacion.est_id}`}
          className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planificar Itinerario</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-xl min-h-[300px] sm:min-h-[340px] flex flex-col justify-end p-5 sm:p-8">
        <img
          src={zona.zon_imagen_url}
          alt={zona.zon_nombre}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative z-10 space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {zona.zon_categoria}
            </span>
            <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Dificultad: {zona.zon_dificultad}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            {zona.zon_nombre}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {zona.zon_descripcion}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Train className="w-3.5 h-3.5 text-red-400" />
              Estación: <strong>{estacion.est_nombre}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              Distancia: <strong>{formatDistance(zona.zon_distancia_metros)}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Tiempo a pie: <strong>~{formatDurationMin(zona.zon_tiempo_caminata_min)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Route details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Interactive Map */}
          <WalkingRouteMap estacion={estacion} zona={zona} />

          {/* Details & Waypoints Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-700 dark:text-red-400" />
                Puntos de Interés en el Recorrido a Pie
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hitós señalizados para disfrutar durante la caminata de ida y vuelta.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(zona.zon_puntos_interes || []).map((pto, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pto}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Punto de descanso o fotografías.</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                Recomendaciones de Seguridad Peatonal:
              </h4>
              <ul className="text-[11px] text-amber-950 dark:text-amber-200 space-y-0.5 pl-4 list-disc">
                {(zona.zon_recomendaciones || []).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Weather + Station info */}
        <div className="space-y-5">
          {clima && (
            <SenamhiWeatherCard clima={clima} estacion={estacion} />
          )}

          {/* Station Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-700 text-white rounded-xl">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Punto de Embarque</span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{estacion.est_nombre}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {estacion.est_descripcion}
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Altitud:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{estacion.est_altitud_msnm} msnm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Ciudad:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{estacion.est_ciudad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Horario:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{zona.zon_horario_atencion}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Entrada:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                  {zona.zon_precio_entrada_pen === 0 ? 'Gratuito' : formatCurrencyPEN(zona.zon_precio_entrada_pen)}
                </span>
              </div>
            </div>

            <Link
              href={`/planificador?zonaId=${zona.zon_id}&estacionId=${estacion.est_id}`}
              className="w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-center block"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planificar Itinerario</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
