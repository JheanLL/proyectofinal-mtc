'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TblEstacion, TblZonaTuristica } from '@/types/database';
import { Footprints, Train, Navigation, AlertCircle, Compass, Play, RotateCcw } from 'lucide-react';
import { formatDistance, formatDurationMin } from '@/lib/utils';

interface WalkingRouteMapProps {
  estacion: TblEstacion;
  zona: TblZonaTuristica;
  className?: string;
  showElevationProfile?: boolean;
}

export default function WalkingRouteMap({ 
  estacion, 
  zona, 
  className = "h-[450px] sm:h-[500px]",
  showElevationProfile = true 
}: WalkingRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'mapa' | 'itinerario_pasos'>('mapa');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (!isMounted || !mapContainerRef.current) return;

        const estLat = estacion.est_latitud;
        const estLng = estacion.est_longitud;
        const zonLat = zona.zon_latitud;
        const zonLng = zona.zon_longitud;

        const centerLat = (estLat + zonLat) / 2;
        const centerLng = (estLng + zonLng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // OpenStreetMap tile layer (100% free)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap | Circuito Peatonal a Pie',
        }).addTo(map);

        // Custom DivIcons
        const stationIcon = L.divIcon({
          className: 'custom-station-pin',
          html: `
            <div class="bg-red-700 text-white p-2.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v2m-6 0h12m-6 6v3m-4 5h8m-8-2h8" />
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const touristIcon = L.divIcon({
          className: 'custom-tourist-pin',
          html: `
            <div class="bg-emerald-600 text-white p-2.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        // Add Station Marker
        const stationMarker = L.marker([estLat, estLng], { icon: stationIcon }).addTo(map);
        stationMarker.bindPopup(`
          <div class="p-1 font-sans">
            <span class="inline-block bg-red-700 text-white text-[10px] px-2 py-0.5 rounded font-extrabold uppercase mb-1">Punto de Embarque</span>
            <h4 class="font-extrabold text-sm text-slate-900">${estacion.est_nombre}</h4>
            <p class="text-xs text-slate-600 mt-1">Altitud: <strong>${estacion.est_altitud_msnm} msnm</strong></p>
          </div>
        `);

        // Add Tourist Destination Marker
        const touristMarker = L.marker([zonLat, zonLng], { icon: touristIcon }).addTo(map);
        touristMarker.bindPopup(`
          <div class="p-1 font-sans">
            <span class="inline-block bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded font-extrabold uppercase mb-1">Destino a Pie</span>
            <h4 class="font-extrabold text-sm text-slate-900">${zona.zon_nombre}</h4>
            <p class="text-xs text-slate-600 mt-1">🚶 <strong>${formatDistance(zona.zon_distancia_metros)}</strong> (~${formatDurationMin(zona.zon_tiempo_caminata_min)} a pie)</p>
          </div>
        `);

        // Natural walking route curvature
        const midLat1 = estLat + (zonLat - estLat) * 0.35 + (zonLng - estLng) * 0.15;
        const midLng1 = estLng + (zonLng - estLng) * 0.35 - (zonLat - estLat) * 0.15;
        const midLat2 = estLat + (zonLat - estLat) * 0.70 - (zonLng - estLng) * 0.10;
        const midLng2 = estLng + (zonLng - estLng) * 0.70 + (zonLat - estLat) * 0.10;

        const outwardRoute: [number, number][] = [
          [estLat, estLng],
          [midLat1, midLng1],
          [midLat2, midLng2],
          [zonLat, zonLng]
        ];

        // Draw Outward Line (Green bold)
        L.polyline(outwardRoute, {
          color: '#059669',
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);

        // Draw Return Line (Dashed Blue)
        const returnRoute: [number, number][] = [
          [zonLat, zonLng],
          [midLat2 + 0.0001, midLng2 + 0.0001],
          [midLat1 + 0.0001, midLng1 + 0.0001],
          [estLat, estLng]
        ];

        L.polyline(returnRoute, {
          color: '#0284c7',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.85,
        }).addTo(map);

        const bounds = L.latLngBounds([
          [estLat, estLng],
          [zonLat, zonLng],
          [midLat1, midLng1],
          [midLat2, midLng2]
        ]);
        map.fitBounds(bounds, { padding: [40, 40] });

      } catch (err) {
        console.error("Error Leaflet map:", err);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, estacion, zona]);

  const totalDistanciaIdaVuelta = zona.zon_distancia_metros * 2;
  const totalTiempoCaminataMin = zona.zon_tiempo_caminata_min * 2;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      {/* Header Bar with generous padding */}
      <div className="bg-slate-950 text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-700 rounded-xl text-white shadow-sm shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
              Circuito Peatonal (Ida y Vuelta Exclusiva a Pie)
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              <span className="text-red-400 font-bold">{estacion.est_nombre}</span> ➔ <span className="text-emerald-400 font-bold">{zona.zon_nombre}</span>
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl text-xs border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'mapa' 
                ? 'bg-red-700 text-white shadow-md' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Vista Mapa
          </button>
          <button
            onClick={() => setActiveTab('itinerario_pasos')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'itinerario_pasos' 
                ? 'bg-red-700 text-white shadow-md' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Itinerario Paso a Paso
          </button>
        </div>
      </div>

      {/* Metrics Banner: spacious, accessible contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-center divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Caminata Ida
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
            {formatDistance(zona.zon_distancia_metros)}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mt-0.5">
            ~{formatDurationMin(zona.zon_tiempo_caminata_min)}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Circuito Completo
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">
            {formatDistance(totalDistanciaIdaVuelta)}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mt-0.5">
            ~{formatDurationMin(totalTiempoCaminataMin)} (Ida y Retorno)
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Nivel Dificultad
          </span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-1 ${
            zona.zon_dificultad === 'Fácil' 
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
              : zona.zon_dificultad === 'Moderado'
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
              : 'bg-red-100 dark:bg-red-950 text-red-950 dark:text-red-200 border border-red-300 dark:border-red-700'
          }`}>
            {zona.zon_dificultad}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mt-1">
            +{zona.zon_desnivel_metros}m desnivel
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
            Estancia en Sitio
          </span>
          <span className="text-lg sm:text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5 block">
            {formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mt-0.5">
            Recomendada
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'mapa' ? (
        <div className="relative">
          <div ref={mapContainerRef} className={`w-full ${className} z-0`} />
          
          {/* Map Legend Overlay with high contrast */}
          <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs z-10 space-y-2 max-w-[260px]">
            <div className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1.5">
              Leyenda de Ruta Peatonal
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 shrink-0"></span>
              <span className="font-bold text-slate-800 dark:text-slate-100">Estación (Partida / Llegada)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>
              <span className="font-bold text-slate-800 dark:text-slate-100">Atractivo a Pie</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
              <span className="w-4 h-1.5 bg-emerald-600 rounded shrink-0"></span>
              <span>Sendero de ida (caminata)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
              <span className="w-4 h-1 border-b-2 border-dashed border-sky-600 shrink-0"></span>
              <span>Sendero retorno a estación</span>
            </div>
          </div>
        </div>
      ) : (
        /* Step by Step Itinerary Guide */
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950/60 space-y-5 max-h-[500px] overflow-y-auto">
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
            {/* Departure */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-red-700 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-xs font-bold">
                1
              </span>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                  Punto de Salida a Pie
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Desembarque en {estacion.est_nombre}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Llegada en tren PeruRail. Salida hacia el portal peatonal señalizado para iniciar la caminata hacia {zona.zon_nombre}.
                </p>
              </div>
            </li>

            {/* Waypoints */}
            {zona.zon_puntos_interes.map((pto, idx) => (
              <li key={idx} className="ml-6">
                <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-500 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-xs font-bold">
                  {idx + 2}
                </span>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-500 shrink-0" />
                    Punto de Interés en el Sendero: {pto}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Hito señalizado durante la caminata recomendado para descanso, observación del paisaje andino o fotografías.
                  </p>
                </div>
              </li>
            ))}

            {/* Arrival */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-xs font-bold">
                {zona.zon_puntos_interes.length + 2}
              </span>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 shadow-sm bg-emerald-50/40 dark:bg-emerald-950/30 space-y-2">
                <h4 className="font-black text-sm sm:text-base text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Llegada al Destino: {zona.zon_nombre}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {zona.zon_descripcion}
                </p>
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  ⏱️ Tiempo de permanencia y visita sugerido: {formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}
                </div>
              </div>
            </li>

            {/* Return */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-sky-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-xs font-bold">
                {zona.zon_puntos_interes.length + 3}
              </span>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Train className="w-4 h-4 text-sky-600 shrink-0" />
                  Retorno a pie a la Estación {estacion.est_nombre}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Caminata de vuelta ({formatDistance(zona.zon_distancia_metros)}, ~{formatDurationMin(zona.zon_tiempo_caminata_min)}) para abordar con suficiente anticipación el tren de retorno de PeruRail.
                </p>
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Recommendations Box with High Contrast */}
      {showElevationProfile && zona.zon_recomendaciones.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
          <span className="font-black flex items-center gap-1.5 text-slate-900 dark:text-white shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Recomendaciones Oficiales de Seguridad:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {zona.zon_recomendaciones.map((rec, i) => (
              <span key={i} className="bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold shadow-2xs">
                • {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
