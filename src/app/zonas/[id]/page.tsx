'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getZonaById, getEstacionById, getClimaByEstacion, getHorariosTren } from '@/lib/db/store';
import { TblZonaTuristica, TblEstacion, TblPronosticoClima, TblHorarioTren } from '@/types/database';
import { 
  ArrowLeft, 
  MapPin, 
  Train, 
  Footprints, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  DollarSign, 
  Calendar,
  Compass
} from 'lucide-react';
import WalkingRouteMap from '@/components/maps/WalkingRouteMap';
import SenamhiWeatherCard from '@/components/weather/SenamhiWeatherCard';
import { formatDistance, formatDurationMin, formatCurrencyPEN, formatCurrencyUSD } from '@/lib/utils';

export default function ZonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [zona, setZona] = useState<TblZonaTuristica | null>(null);
  const [estacion, setEstacion] = useState<TblEstacion | null>(null);
  const [clima, setClima] = useState<TblPronosticoClima | null>(null);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);

  useEffect(() => {
    if (!id) return;
    const loadedZona = getZonaById(id);
    if (loadedZona) {
      setZona(loadedZona);
      const loadedEstacion = getEstacionById(loadedZona.zon_estacion_id);
      if (loadedEstacion) {
        setEstacion(loadedEstacion);
        setClima(getClimaByEstacion(loadedEstacion.est_id));
        const allHorarios = getHorariosTren();
        setHorarios(allHorarios.filter(h => h.hor_estacion_destino_id === loadedEstacion.est_id || h.hor_estacion_origen_id === loadedEstacion.est_id));
      }
    }
  }, [id]);

  if (!zona || !estacion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Zona turística no encontrada</h2>
        <p className="text-xs text-slate-500">Es posible que el ID sea inválido o haya sido actualizado.</p>
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

  const distanciaTotal = zona.zon_distancia_metros * 2;
  const tiempoTotal = zona.zon_tiempo_caminata_min * 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Title Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/zonas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Zonas Turísticas</span>
        </Link>

        <Link
          href={`/planificador?zonaId=${zona.zon_id}&estacionId=${estacion.est_id}`}
          className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Planificar Itinerario Completo</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-xl min-h-[340px] flex flex-col justify-end p-6 sm:p-10">
        <img
          src={zona.zon_imagen_url}
          alt={zona.zon_nombre}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {zona.zon_categoria}
            </span>
            <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Dificultad: {zona.zon_dificultad}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Travel Group Perú
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {zona.zon_nombre}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {zona.zon_descripcion}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Train className="w-4 h-4 text-red-400" />
              Estación: <strong>{estacion.est_nombre}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" />
              Distancia un tramo: <strong>{formatDistance(zona.zon_distancia_metros)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Tiempo a pie ida: <strong>~{formatDurationMin(zona.zon_tiempo_caminata_min)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Map & Route details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Map */}
          <WalkingRouteMap estacion={estacion} zona={zona} />

          {/* Details & Waypoints Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-red-700" />
                Puntos de Interés en el Recorrido a Pie
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hitós señalizados para disfrutar durante la caminata de ida y vuelta.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zona.zon_puntos_interes.map((pto, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{pto}</h4>
                    <span className="text-[11px] text-slate-500">Parada recomendada para fotografías y descanso.</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Recomendaciones Oficiales de Seguridad Peatonal:
              </h4>
              <ul className="text-xs text-amber-950 space-y-1 pl-4 list-disc">
                {zona.zon_recomendaciones.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: SENAMHI Weather + PeruRail Station info */}
        <div className="space-y-6">
          {/* Weather Widget */}
          {clima && (
            <SenamhiWeatherCard clima={clima} estacion={estacion} />
          )}

          {/* Station Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Punto de Embarque</span>
                <h3 className="text-sm font-bold text-slate-900">{estacion.est_nombre}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {estacion.est_descripcion}
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Altitud:</span>
                <span className="font-bold text-slate-800">{estacion.est_altitud_msnm} msnm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ciudad:</span>
                <span className="font-bold text-slate-800">{estacion.est_ciudad}, {estacion.est_departamento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horario de Atención:</span>
                <span className="font-bold text-slate-800">{zona.zon_horario_atencion}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Entrada Atractivo:</span>
                <span className="font-bold text-emerald-700">
                  {zona.zon_precio_entrada_pen === 0 ? 'Acceso Gratuito' : formatCurrencyPEN(zona.zon_precio_entrada_pen)}
                </span>
              </div>
            </div>

            <Link
              href={`/planificador?zonaId=${zona.zon_id}&estacionId=${estacion.est_id}`}
              className="w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-center block"
            >
              <Sparkles className="w-4 h-4" />
              <span>Armar Itinerario y Descargar PDF</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
