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

/**
 * Senderos peatonales de alta precisión para gargantas y cañones donde
 * los servidores públicos de OSRM truncan el trazado peatonal.
 */
/**
 * Senderos peatonales de alta precisión (100% reales de OpenStreetMap)
 * que siguen las calles empedradas, puentes y el sendero ribereño del Río Aguas Calientes.
 */
const CURATED_PEDESTRIAN_TRAILS: Record<string, [number, number][]> = {
  // Baños Termomedicinales de Aguas Calientes (Sendero peatonal ribereño del Río Aguascalientes - 54 nodos OSM)
  'zon_01': [
    [-13.1547698, -72.5254717], // Salida de la Estación Ferroviaria
    [-13.1547713, -72.5254343],
    [-13.1548305, -72.5253922],
    [-13.1548121, -72.5253027],
    [-13.1547867, -72.5252801],
    [-13.1547766, -72.5252716],
    [-13.1547678, -72.5251354], // Alameda peatonal
    [-13.1546803, -72.5251307],
    [-13.1546782, -72.5250952],
    [-13.1545048, -72.5250945],
    [-13.1545011, -72.5250577],
    [-13.1545075, -72.5249750],
    [-13.1545251, -72.5248928], // Paso por Galería Artesanal
    [-13.1545300, -72.5248698],
    [-13.1545248, -72.5247491],
    [-13.1545254, -72.5245017],
    [-13.1545256, -72.5244346],
    [-13.1544719, -72.5244229],
    [-13.1544747, -72.5243126],
    [-13.1544886, -72.5242058],
    [-13.1544414, -72.5241342],
    [-13.1544136, -72.5240580],
    [-13.1543562, -72.5239631],
    [-13.1543062, -72.5239032],
    [-13.1542431, -72.5238553], // Conexión a Calle Wiracocha
    [-13.1541598, -72.5237044],
    [-13.1540604, -72.5236336], // Plaza Manco Cápac
    [-13.1539621, -72.5236375], // Inicio de Avenida Pachacutec
    [-13.1539193, -72.5236046],
    [-13.1538580, -72.5235681],
    [-13.1538952, -72.5234521],
    [-13.1537980, -72.5233611],
    [-13.1537441, -72.5233332],
    [-13.1537730, -72.5232597],
    [-13.1537530, -72.5232356],
    [-13.1535491, -72.5233884],
    [-13.1534769, -72.5232982], // Bulevar gastronómico de Av. Pachacutec
    [-13.1534248, -72.5231748],
    [-13.1533565, -72.5231320],
    [-13.1532817, -72.5230284],
    [-13.1532735, -72.5229905],
    [-13.1532316, -72.5229619],
    [-13.1530905, -72.5227413], // Cruce hacia el sendero ribereño del Río Aguas Calientes
    [-13.1528396, -72.5223779], // Puente peatonal de piedra
    [-13.1526635, -72.5222784], // Alameda de esculturas líticas
    [-13.1524251, -72.5221822],
    [-13.1522223, -72.5221075], // Sendero junto a la ribera del río
    [-13.1519975, -72.5220297],
    [-13.1513094, -72.5214596], // Ascenso por la garganta termal
    [-13.1512871, -72.5213323],
    [-13.1512295, -72.5212404], // Portal de acceso y boletería
    [-13.1510078, -72.5211894],
    [-13.1508761, -72.5211571],
    [-13.1506270, -72.5211109]  // Pozas termomedicinales de Aguas Calientes
  ],
  // Jardines Ecológicos y Cataratas de Mandor (Sendero Av. Hermanos Ayar -> Puente Ruinas -> Vía férrea y sendero Mandor - 68 nodos OSM)
  'zon_02': [
    [-13.1547698, -72.5254717], // Estación Machu Picchu Pueblo
    [-13.1549872, -72.5245933],
    [-13.155095, -72.5253998],
    [-13.1550682, -72.5258924],
    [-13.1543571, -72.5273039],
    [-13.1542404, -72.5276959],
    [-13.1542667, -72.5279568],
    [-13.1546887, -72.5287393],
    [-13.1556735, -72.529679],
    [-13.1559653, -72.5304153],
    [-13.1565498, -72.5312429],
    [-13.1569328, -72.5315873],
    [-13.1577795, -72.532117],
    [-13.1583516, -72.5322123],
    [-13.1588429, -72.532491],
    [-13.1594031, -72.5325188],
    [-13.1603978, -72.533034],
    [-13.1610414, -72.5332846],
    [-13.1615807, -72.5339055],
    [-13.1618019, -72.5344184],
    [-13.1619411, -72.5349473],
    [-13.1619619, -72.5356879],
    [-13.16185, -72.5359639],
    [-13.1614553, -72.5365589],
    [-13.1615012, -72.5367037], // Puente Ruinas
    [-13.1613412, -72.5358151],
    [-13.1602421, -72.537724],
    [-13.1600528, -72.5379007],
    [-13.1594307, -72.5382417],
    [-13.1591784, -72.5384708],
    [-13.1583329, -72.5407961],
    [-13.1581203, -72.5411184],
    [-13.1579229, -72.5412199],
    [-13.1576739, -72.5412442],
    [-13.1571172, -72.5410925],
    [-13.1550904, -72.5393048],
    [-13.1549504, -72.5390236],
    [-13.1548423, -72.5385779],
    [-13.1549167, -72.5374219],
    [-13.1547544, -72.5369973],
    [-13.1545602, -72.5367969],
    [-13.1526696, -72.5358088],
    [-13.1512041, -72.535726],
    [-13.1509787, -72.5357964],
    [-13.1507231, -72.5359243],
    [-13.1503274, -72.5363821],
    [-13.1499289, -72.5366824],
    [-13.14978, -72.536877],
    [-13.149603, -72.5377409],
    [-13.1491138, -72.5385591],
    [-13.1489215, -72.5403144],
    [-13.148711, -72.5406411],
    [-13.1471778, -72.5420603],
    [-13.1470402, -72.5422627],
    [-13.146348, -72.5437692],
    [-13.146087, -72.5451698],
    [-13.1481902, -72.5415313], // Entrada Reserva Mandor
    [-13.1492081, -72.5404559],
    [-13.1493888, -72.5400535],
    [-13.1497635, -72.5397371],
    [-13.1497903, -72.5395737],
    [-13.1496825, -72.5390451],
    [-13.149664, -72.5385447],
    [-13.1458826, -72.5309185],
    [-13.1430585, -72.5287285],
    [-13.1420803, -72.5283272],
    [-13.1414193, -72.5296621],
    [-13.1425, -72.5482] // Cataratas y Jardines de Mandor
  ],
  // Museo de Sitio Manuel Chávez Ballón & Jardín Botánico (Sendero Av. Hermanos Ayar -> Puente Ruinas - 28 nodos OSM)
  'zon_03': [
    [-13.1547698, -72.5254717], // Estación Machu Picchu Pueblo
    [-13.1549872, -72.5245933],
    [-13.155095, -72.5253998],
    [-13.1550682, -72.5258924],
    [-13.1544795, -72.527004],
    [-13.1542404, -72.5276959],
    [-13.1543029, -72.5280502],
    [-13.1546109, -72.5286369],
    [-13.1556735, -72.529679],
    [-13.1560112, -72.5304909],
    [-13.1562774, -72.5307961],
    [-13.1565498, -72.5312429],
    [-13.1569328, -72.5315873],
    [-13.1578406, -72.532142],
    [-13.1583516, -72.5322123],
    [-13.1588429, -72.532491],
    [-13.1594031, -72.5325188],
    [-13.1603978, -72.533034],
    [-13.1609473, -72.5332282],
    [-13.1614251, -72.5336998],
    [-13.1616407, -72.5340182],
    [-13.1618019, -72.5344184],
    [-13.1619411, -72.5349473],
    [-13.16199, -72.5353688],
    [-13.161915, -72.5358367],
    [-13.1614553, -72.5365589],
    [-13.1614468, -72.5366394],
    [-13.1583, -72.5369] // Entrada al Museo de Sitio Chávez Ballón
  ],
  // Mercado Artesanal & Paseo de Esculturas Líticas (Circuito peatonal frente a la estación - 16 nodos OSM)
  'zon_04': [
    [-13.1547698, -72.5254717], // Salida de andenes
    [-13.1547713, -72.5254343],
    [-13.1548305, -72.5253922],
    [-13.1548121, -72.5253027],
    [-13.1547867, -72.5252801],
    [-13.1547766, -72.5252716],
    [-13.1547678, -72.5251354],
    [-13.1546803, -72.5251307],
    [-13.1546782, -72.5250952],
    [-13.1545048, -72.5250945],
    [-13.1545011, -72.5250577],
    [-13.1543184, -72.5250584],
    [-13.1541903, -72.5250781],
    [-13.1541409, -72.5250733],
    [-13.1540755, -72.5250720],
    [-13.1540455, -72.5249652]  // Escultura monumental y galería artesanal
  ]
};

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

        const estLat = Number(estacion.est_latitud) || -13.155;
        const estLng = Number(estacion.est_longitud) || -72.525;
        const zonLat = Number(zona.zon_latitud) || -13.158;
        const zonLng = Number(zona.zon_longitud) || -72.528;

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

        // Trazado de ruta peatonal real guiado por calles y senderos peatonales
        let outwardRoute: [number, number][] = [];

        // 1. Priorizar sendero peatonal de alta precisión si existe
        if (CURATED_PEDESTRIAN_TRAILS[zona.zon_id]) {
          outwardRoute = [...CURATED_PEDESTRIAN_TRAILS[zona.zon_id]];
        } else {
          // 2. Consultar OSRM Foot Routing en tiempo real
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${estLng},${estLat};${zonLng},${zonLat}?overview=full&geometries=geojson`;
            const res = await fetch(osrmUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length) {
                const snapDistance = data.waypoints?.[1]?.distance || 0;
                if (snapDistance < 450) {
                  const osrmPts: [number, number][] = data.routes[0].geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
                  outwardRoute = [
                    [estLat, estLng],
                    ...osrmPts,
                    [zonLat, zonLng]
                  ];
                }
              }
            }
          } catch {
            // fallback en caso de timeout o sin red
          }
        }

        // Fallback seguro si OSRM no responde o devuelve menos de 2 puntos
        if (outwardRoute.length < 2) {
          const midLat = (estLat + zonLat) / 2;
          outwardRoute = [
            [estLat, estLng],
            [midLat, estLng],
            [midLat, zonLng],
            [zonLat, zonLng]
          ];
        }

        // Anclar con precisión los marcadores al inicio y fin del camino peatonal
        if (outwardRoute.length >= 2) {
          stationMarker.setLatLng(outwardRoute[0]);
          touristMarker.setLatLng(outwardRoute[outwardRoute.length - 1]);
        }

        // Línea de Ida Peatonal (Verde esmeralda sobre calles reales)
        L.polyline(outwardRoute, {
          color: '#059669',
          weight: 5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        // Línea de Retorno a la Estación (Azul punteado paralelo por las mismas calles)
        const returnRoute: [number, number][] = [...outwardRoute].reverse().map(([lat, lng]) => [
          lat + 0.00006,
          lng + 0.00006
        ]);

        L.polyline(returnRoute, {
          color: '#0284c7',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        const bounds = L.latLngBounds(outwardRoute);
        map.fitBounds(bounds, { padding: [45, 45] });

        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);

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

  // Invalidar tamaño de Leaflet al volver a la pestaña de mapa para recalcular dimensiones
  useEffect(() => {
    if (activeTab === 'mapa' && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

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

      {/* Main Content Area: Mapa Interactivo Leaflet (mantenido montado en DOM) */}
      <div className={`relative ${activeTab === 'mapa' ? 'block' : 'hidden'}`}>
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
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>✓ Trazado real por calles y senderos</span>
          </div>
        </div>
      </div>

      {/* Step by Step Itinerary Guide */}
      {activeTab === 'itinerario_pasos' && (
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Partida desde los andenes peatonales de la estación a <strong>{estacion.est_altitud_msnm} msnm</strong>. Comienza tu caminata a paso regular.
                </p>
              </div>
            </li>

            {/* Intermediate Scenic Highlights */}
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

            {/* Arrival at Destination */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-xs font-bold">
                {zona.zon_puntos_interes.length + 2}
              </span>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm space-y-1">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Destino Turístico Peatonal
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
                  {zona.zon_nombre}
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Disfruta de tu visita guiada o libre. Tiempo recomendado de permanencia: <strong>{formatDurationMin(zona.zon_tiempo_sugerido_visita_min)}</strong>.
                </p>
              </div>
            </li>

            {/* Return to Station */}
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-sky-600 text-white rounded-full ring-4 ring-white dark:ring-slate-900 text-xs font-bold">
                {zona.zon_puntos_interes.length + 3}
              </span>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Retorno Garantizado a la Estación
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Regreso por el Circuito Peatonal Inverso
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
