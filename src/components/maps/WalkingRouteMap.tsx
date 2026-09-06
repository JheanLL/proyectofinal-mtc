'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TblEstacion, TblZonaTuristica } from '@/types/database';
import { Footprints, Train, Navigation, AlertCircle, Compass } from 'lucide-react';
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
  className = "h-[400px]",
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
          attribution: '&copy; OpenStreetMap | Circuito a Pie',
        }).addTo(map);

        // Custom DivIcons
        const stationIcon = L.divIcon({
          className: 'custom-station-pin',
          html: `
            <div class="bg-red-700 text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center w-9 h-9 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v2m-6 0h12m-6 6v3m-4 5h8m-8-2h8" />
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const touristIcon = L.divIcon({
          className: 'custom-tourist-pin',
          html: `
            <div class="bg-emerald-600 text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center w-9 h-9 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        // Add Station Marker
        const stationMarker = L.marker([estLat, estLng], { icon: stationIcon }).addTo(map);
        stationMarker.bindPopup(`
          <div class="p-1 font-sans">
            <span class="inline-block bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded font-bold mb-1">ESTACIÓN DE TREN</span>
            <h4 class="font-bold text-gray-900 text-xs">${estacion.est_nombre}</h4>
            <p class="text-[11px] text-gray-600 mt-0.5">Altitud: ${estacion.est_altitud_msnm} msnm</p>
          </div>
        `);

        // Add Tourist Marker
        const touristMarker = L.marker([zonLat, zonLng], { icon: touristIcon }).addTo(map);
        touristMarker.bindPopup(`
          <div class="p-1 font-sans">
            <span class="inline-block bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold mb-1">DESTINO A PIE</span>
            <h4 class="font-bold text-gray-900 text-xs">${zona.zon_nombre}</h4>
            <p class="text-[11px] text-gray-600 mt-0.5">🚶 ${formatDistance(zona.zon_distancia_metros)} (~${formatDurationMin(zona.zon_tiempo_caminata_min)})</p>
          </div>
        `);

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

        // Draw Outward Line (Green)
        L.polyline(outwardRoute, {
          color: '#059669',
          weight: 4,
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
          weight: 3.5,
          dashArray: '5, 7',
          opacity: 0.8,
        }).addTo(map);

        const bounds = L.latLngBounds([
          [estLat, estLng],
          [zonLat, zonLng],
          [midLat1, midLng1],
          [midLat2, midLng2]
        ]);
        map.fitBounds(bounds, { padding: [30, 30] });

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
      {/* Header Bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-700 rounded-lg text-white">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">Circuito Peatonal (Ida y Vuelta a Pie)</h3>
            <p className="text-[11px] text-slate-300">
              <span className="text-red-400 font-semibold">{estacion.est_nombre}</span> ➔ <span className="text-emerald-400 font-semibold">{zona.zon_nombre}</span>
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'mapa' 
                ? 'bg-red-700 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mapa
          </button>
          <button
            onClick={() => setActiveTab('itinerario_pasos')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'itinerario_pasos' 
                ? 'bg-red-700 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Paso a Paso
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-center divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-2.5 sm:p-3">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tramo Ida</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{formatDistance(zona.zon_distancia_metros)}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">~{formatDurationMin(zona.zon_tiempo_caminata_min)}</span>
        </div>
        <div className="p-2.5 sm:p-3">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Ida y Vuelta</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">{formatDistance(totalDistanciaIdaVuelta)}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">~{formatDurationMin(totalTiempoCaminataMin)} total</span>
        </div>
        <div className="p-2.5 sm:p-3">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Dificultad</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
            zona.zon_dificultad === 'Fácil' 
              ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-400'
              : zona.zon_dificultad === 'Moderado'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
              : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400'
          }`}>
            {zona.zon_dificultad}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">+{zona.zon_desnivel_metros}m desnivel</span>
        </div>
        <div className="p-2.5 sm:p-3">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estancia</span>
          <span className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400">{formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">sugerida</span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'mapa' ? (
        <div className="relative">
          <div ref={mapContainerRef} className={`w-full ${className} z-0`} />
          
          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-[11px] z-10 space-y-1 max-w-[220px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Estación (Partida/Fin)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Zona Turística</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px]">
              <span className="w-3.5 h-1 bg-emerald-600 inline-block rounded"></span>
              <span>Ruta a pie de ida</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px]">
              <span className="w-3.5 h-0.5 border-b border-dashed border-sky-600 inline-block"></span>
              <span>Ruta retorno</span>
            </div>
          </div>
        </div>
      ) : (
        /* Step by Step Itinerary Guide */
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/50 space-y-4 max-h-[420px] overflow-y-auto">
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 sm:ml-4 space-y-4">
            {/* Step 1 */}
            <li className="ml-5">
              <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-red-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-[10px] font-bold">
                1
              </span>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-red-600" />
                  Salida desde {estacion.est_nombre}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Desembarque del tren. Salir hacia el eje peatonal señalizado.
                </p>
              </div>
            </li>

            {/* Waypoints */}
            {zona.zon_puntos_interes.map((pto, idx) => (
              <li key={idx} className="ml-5">
                <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-amber-500 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-[10px] font-bold">
                  {idx + 2}
                </span>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-amber-500" />
                    Punto de Interés: {pto}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Parada intermedia recomendada para fotografías o descanso.
                  </p>
                </div>
              </li>
            ))}

            {/* Arrival */}
            <li className="ml-5">
              <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-emerald-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-[10px] font-bold">
                {zona.zon_puntos_interes.length + 2}
              </span>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs bg-emerald-50/30 dark:bg-emerald-950/20">
                <h4 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                  Llegada a {zona.zon_nombre}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {zona.zon_descripcion}
                </p>
                <div className="mt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  ⏱️ Permanencia sugerida: {formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}
                </div>
              </div>
            </li>

            {/* Return */}
            <li className="ml-5">
              <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-sky-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-[10px] font-bold">
                {zona.zon_puntos_interes.length + 3}
              </span>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-sky-600" />
                  Retorno a pie a la Estación {estacion.est_nombre}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Caminata de vuelta ({formatDistance(zona.zon_distancia_metros)}, ~{formatDurationMin(zona.zon_tiempo_caminata_min)}) para abordar el tren de retorno.
                </p>
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Recommendations Box */}
      {showElevationProfile && zona.zon_recomendaciones.length > 0 && (
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
          <span className="font-bold flex items-center gap-1 text-slate-900 dark:text-slate-100">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Recomendaciones:
          </span>
          <div className="flex flex-wrap gap-1">
            {zona.zon_recomendaciones.map((rec, i) => (
              <span key={i} className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                • {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
