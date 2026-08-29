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
  className = "h-[420px]",
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

        // Cleanup previous map if exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (!isMounted || !mapContainerRef.current) return;

        const estLat = estacion.est_latitud;
        const estLng = estacion.est_longitud;
        const zonLat = zona.zon_latitud;
        const zonLng = zona.zon_longitud;

        // Center between station and attraction
        const centerLat = (estLat + zonLat) / 2;
        const centerLng = (estLng + zonLng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // OpenStreetMap tile layer (100% free, no API key needed)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores | MTC Perú',
        }).addTo(map);

        // Custom DivIcons for station and tourist spot
        const stationIcon = L.divIcon({
          className: 'custom-station-pin',
          html: `
            <div class="bg-red-700 text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
            <div class="bg-emerald-600 text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
          <div class="p-2 font-sans">
            <span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-semibold mb-1">PUNTO DE PARTIDA / LLEGADA TREN</span>
            <h4 class="font-bold text-gray-900 text-sm leading-tight">${estacion.est_nombre}</h4>
            <p class="text-xs text-gray-600 mt-1">Altitud: ${estacion.est_altitud_msnm} msnm</p>
            <p class="text-xs text-blue-700 font-medium mt-1">🚆 Conexión ferroviaria PeruRail</p>
          </div>
        `);

        // Add Tourist Destination Marker
        const touristMarker = L.marker([zonLat, zonLng], { icon: touristIcon }).addTo(map);
        touristMarker.bindPopup(`
          <div class="p-2 font-sans">
            <span class="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-semibold mb-1">DESTINO PEATONAL</span>
            <h4 class="font-bold text-gray-900 text-sm leading-tight">${zona.zon_nombre}</h4>
            <p class="text-xs text-gray-600 mt-1">🚶 ${formatDistance(zona.zon_distancia_metros)} (${formatDurationMin(zona.zon_tiempo_caminata_min)} a pie)</p>
            <p class="text-xs text-emerald-700 font-medium mt-1">Dificultad: ${zona.zon_dificultad}</p>
          </div>
        `);

        // Generate synthetic realistic walking route points
        // Intermediate waypoints to simulate pedestrian walking paths
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

        // Draw Outward Walking Route (Solid Green Polyline)
        const polylineIda = L.polyline(outwardRoute, {
          color: '#059669',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(map);

        // Draw Return Route (Dashed Emerald Line)
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
          opacity: 0.75,
        }).addTo(map);

        // Fit map bounds to view both points nicely
        const bounds = L.latLngBounds([
          [estLat, estLng],
          [zonLat, zonLng],
          [midLat1, midLng1],
          [midLat2, midLng2]
        ]);
        map.fitBounds(bounds, { padding: [40, 40] });

      } catch (err) {
        console.error("Error loading Leaflet map:", err);
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600 rounded-lg text-white">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Ruta Peatonal Exclusiva (Ida y Vuelta)</h3>
            <p className="text-xs text-slate-300">
              Desde <span className="text-red-400 font-semibold">{estacion.est_nombre}</span> hacia <span className="text-emerald-400 font-semibold">{zona.zon_nombre}</span>
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-700/60 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'mapa' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Vista Mapa
          </button>
          <button
            onClick={() => setActiveTab('itinerario_pasos')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'itinerario_pasos' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Guía Paso a Paso
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 border-b border-slate-200 text-center divide-x divide-slate-200">
        <div className="p-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Tramo Ida</span>
          <span className="text-base font-bold text-slate-900">{formatDistance(zona.zon_distancia_metros)}</span>
          <span className="text-xs text-slate-500 block">~{formatDurationMin(zona.zon_tiempo_caminata_min)}</span>
        </div>
        <div className="p-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ida y Vuelta Total</span>
          <span className="text-base font-bold text-emerald-700">{formatDistance(totalDistanciaIdaVuelta)}</span>
          <span className="text-xs text-slate-500 block">~{formatDurationMin(totalTiempoCaminataMin)} a pie</span>
        </div>
        <div className="p-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Dificultad de Sendero</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
            zona.zon_dificultad === 'Fácil' 
              ? 'bg-green-100 text-green-800'
              : zona.zon_dificultad === 'Moderado'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {zona.zon_dificultad}
          </span>
          <span className="text-xs text-slate-500 block">+{zona.zon_desnivel_metros}m desnivel</span>
        </div>
        <div className="p-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Tiempo en Atractivo</span>
          <span className="text-base font-bold text-blue-700">{formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}</span>
          <span className="text-xs text-slate-500 block">Estancia sugerida</span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'mapa' ? (
        <div className="relative">
          <div ref={mapContainerRef} className={`w-full ${className} z-0`} />
          
          {/* Map Legend Floating Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-slate-200 text-xs z-10 space-y-1.5 max-w-[240px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
              <span className="font-semibold text-slate-800">Estación de Tren (Origen/Fin)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span className="font-semibold text-slate-800">Zona Turística (Destino)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-emerald-600 inline-block rounded"></span>
              <span className="text-slate-600">Ruta a pie de ida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 border-b-2 border-dashed border-sky-600 inline-block"></span>
              <span className="text-slate-600">Ruta de retorno a pie</span>
            </div>
          </div>
        </div>
      ) : (
        /* Step by Step Itinerary Guide */
        <div className="p-6 bg-slate-50 space-y-4 max-h-[460px] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex items-start gap-3">
            <Compass className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>Itinerario peatonal diseñado por Travel Group Perú:</strong> Ruta 100% peatonal señalizada y segura que parte desde la puerta principal de la estación ferroviaria y retorna al mismo punto de embarque.
            </p>
          </div>

          <ol className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {/* Step 1 */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full ring-4 ring-white text-xs font-bold">
                1
              </span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Train className="w-4 h-4 text-red-600" />
                  Salida desde {estacion.est_nombre}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Desembarque del tren PeruRail. Salir por el acceso peatonal principal hacia el eje turístico señalizado.
                </p>
              </div>
            </li>

            {/* Step 2 - Points of Interest */}
            {zona.zon_puntos_interes.map((pto, idx) => (
              <li key={idx} className="ml-6">
                <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-500 text-white rounded-full ring-4 ring-white text-xs font-bold">
                  {idx + 2}
                </span>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-600" />
                    Punto de Interés en el Camino: {pto}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Hito peatonal intermedio recomendado para fotos, hidratación o apreciación cultural.
                  </p>
                </div>
              </li>
            ))}

            {/* Step 3 - Arrival */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full ring-4 ring-white text-xs font-bold">
                {zona.zon_puntos_interes.length + 2}
              </span>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-sm bg-emerald-50/40">
                <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-emerald-700" />
                  Llegada a {zona.zon_nombre}
                </h4>
                <p className="text-xs text-slate-700 mt-1">
                  {zona.zon_descripcion}
                </p>
                <div className="mt-2 text-xs font-semibold text-emerald-800">
                  ⏱️ Tiempo sugerido de visita: {formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}
                </div>
              </div>
            </li>

            {/* Step 4 - Return */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-sky-600 text-white rounded-full ring-4 ring-white text-xs font-bold">
                {zona.zon_puntos_interes.length + 3}
              </span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Train className="w-4 h-4 text-sky-600" />
                  Retorno a pie a la Estación {estacion.est_nombre}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Caminata de retorno ({formatDistance(zona.zon_distancia_metros)}, ~{formatDurationMin(zona.zon_tiempo_caminata_min)}) para abordar el tren de vuelta a tiempo.
                </p>
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Recommendations Box */}
      {showElevationProfile && zona.zon_recomendaciones.length > 0 && (
        <div className="p-3.5 bg-slate-100/80 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="font-bold flex items-center gap-1 text-slate-900">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Recomendaciones para el trayecto a pie:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {zona.zon_recomendaciones.map((rec, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                • {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
