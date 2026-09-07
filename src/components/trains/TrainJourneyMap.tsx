'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TblHorarioTren, TblEstacion } from '@/types/database';
import { 
  Train, 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Compass, 
  Gauge, 
  Mountain, 
  Clock, 
  Eye, 
  Radio, 
  Info,
  CheckCircle2,
  Navigation,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { formatCurrencyPEN, formatCurrencyUSD, formatDurationMin, formatHoursColonMin } from '@/lib/utils';

interface Waypoint {
  lat: number;
  lng: number;
  nombre: string;
  altitud: number;
  descripcion: string;
  hitoKm?: string;
}

interface TrainJourneyMapProps {
  horario: TblHorarioTren;
  origen: TblEstacion;
  destino: TblEstacion;
  className?: string;
  onClose?: () => void;
}

export default function TrainJourneyMap({
  horario,
  origen,
  destino,
  className = "h-[500px]",
  onClose
}: TrainJourneyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const trainMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(3); // 1x, 3x, 5x, 10x
  const [progress, setProgress] = useState<number>(0.15); // 0.0 to 1.0 (start at 15% to show active position)
  const [activeTab, setActiveTab] = useState<'mapa' | 'detalles' | 'perfil'>('mapa');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Construcción de la ruta ferroviaria detallada según origen y destino
  const waypoints = useMemo<Waypoint[]>(() => {
    const isPunoRoute = 
      (origen.est_id === 'est_06' || destino.est_id === 'est_06') ||
      (origen.est_codigo.includes('PUN') || destino.est_codigo.includes('PUN'));

    if (isPunoRoute) {
      // Ruta Transandina Cusco - Puno
      const list: Waypoint[] = [
        { lat: -13.5204, lng: -71.9847, nombre: 'Cusco (San Pedro / Wanchaq)', altitud: 3399, descripcion: 'Partida histórica en la capital imperial.', hitoKm: 'Km 0' },
        { lat: -13.6860, lng: -71.6240, nombre: 'Urcos', altitud: 3150, descripcion: 'Paso por la laguna de Urcos y valles agrícolas.', hitoKm: 'Km 48' },
        { lat: -14.1030, lng: -71.4310, nombre: 'Combapata', altitud: 3470, descripcion: 'Confluencia de ríos y puentes coloniales.', hitoKm: 'Km 110' },
        { lat: -14.2700, lng: -71.2260, nombre: 'Sicuani', altitud: 3550, descripcion: 'Importante centro comercial del altiplano cusqueño.', hitoKm: 'Km 142' },
        { lat: -14.4820, lng: -71.0020, nombre: 'Abra La Raya (Cumbre Ferroviaria)', altitud: 4335, descripcion: 'Punto más alto del viaje ferro-andino, límite entre Cusco y Puno.', hitoKm: 'Km 210' },
        { lat: -14.6180, lng: -70.7850, nombre: 'Santa Rosa', altitud: 3990, descripcion: 'Extensas llanuras de camélidos sudamericanos (alpacas y vicuñas).', hitoKm: 'Km 245' },
        { lat: -14.8810, lng: -70.5890, nombre: 'Ayaviri', altitud: 3907, descripcion: 'Tierra del famoso Kankacho y la catedral de San Francisco.', hitoKm: 'Km 280' },
        { lat: -15.4980, lng: -70.1330, nombre: 'Juliaca', altitud: 3825, descripcion: 'Nudo ferroviario comercial de la meseta del Collao.', hitoKm: 'Km 340' },
        { lat: -15.8364, lng: -70.0219, nombre: 'Estación Puno (Lago Titicaca)', altitud: 3827, descripcion: 'Llegada a las riberas del lago navegable más alto del mundo.', hitoKm: 'Km 385' },
      ];

      return origen.est_id === 'est_06' ? [...list].reverse() : list;
    }

    // Ruta Valle Sagrado y Machu Picchu (Poroy / San Pedro / Urubamba / Ollantaytambo <-> Aguas Calientes)
    const baseCorridor: Waypoint[] = [
      { lat: -13.5204, lng: -71.9847, nombre: 'Estación San Pedro (Cusco)', altitud: 3399, descripcion: 'Salida en zigzag ferroviario "El Arco" ascendiendo de Cusco.', hitoKm: 'Km 0' },
      { lat: -13.4912, lng: -72.0125, nombre: 'Estación Poroy', altitud: 3499, descripcion: 'Estación campestre en la meseta de Poroy.', hitoKm: 'Km 18' },
      { lat: -13.4420, lng: -72.1380, nombre: 'Pampa de Anta', altitud: 3350, descripcion: 'Campos llanos cerealeros y vista panorámica a la Cordillera de Vilcabamba.', hitoKm: 'Km 35' },
      { lat: -13.4150, lng: -72.2030, nombre: 'Huarocondo', altitud: 3200, descripcion: 'Descenso serpenteante hacia la quebrada del río Pomatales.', hitoKm: 'Km 48' },
      { lat: -13.2920, lng: -72.2260, nombre: 'Pachar (Desvío Sacred Valley)', altitud: 2890, descripcion: 'Entrada formal al Valle Sagrado de los Incas junto al Río Vilcanota.', hitoKm: 'Km 62' },
      { lat: -13.2592, lng: -72.2635, nombre: 'Estación Ollantaytambo', altitud: 2792, descripcion: 'Fortaleza viviente inca y estación de trasbordo principal.', hitoKm: 'Km 67' },
      { lat: -13.2380, lng: -72.3750, nombre: 'Chilca (Km 76)', altitud: 2650, descripcion: 'Transición a ceja de selva y vegetación semitropical.', hitoKm: 'Km 76' },
      { lat: -13.2270, lng: -72.4280, nombre: 'Piscacucho (Km 82)', altitud: 2580, descripcion: 'Control oficial de inicio del clásico Camino Inca a pie.', hitoKm: 'Km 82' },
      { lat: -13.2050, lng: -72.4650, nombre: 'Qoriwayrachina (Km 88)', altitud: 2450, descripcion: 'Vista al complejo arqueológico de Patallacta y terrazas incas.', hitoKm: 'Km 88' },
      { lat: -13.1720, lng: -72.5020, nombre: 'Chachabamba (Km 104)', altitud: 2200, descripcion: 'Inicio del Camino Inca corto y santuario de orquídeas nativas.', hitoKm: 'Km 104' },
      { lat: -13.1580, lng: -72.5180, nombre: 'Puente Ruinas', altitud: 2060, descripcion: 'Base de ascenso a la ciudadela inca y puente sobre el Río Urubamba.', hitoKm: 'Km 110' },
      { lat: -13.1547, lng: -72.5255, nombre: 'Estación Machu Picchu Pueblo', altitud: 2040, descripcion: 'Terminal ferroviario en Aguas Calientes, cobijado por imponentes farallones.', hitoKm: 'Km 112' },
    ];

    const wpUrubamba: Waypoint = { 
      lat: -13.3078, 
      lng: -72.1158, 
      nombre: 'Estación Urubamba', 
      altitud: 2871, 
      descripcion: 'Corazón del Valle Sagrado junto a los huertos de maíz blanco gigante.', 
      hitoKm: 'Km 52' 
    };

    // Urubamba como origen
    if (origen.est_id === 'est_05') {
      if (destino.est_id === 'est_04') {
        // Urubamba -> Machu Picchu (vía Pachar)
        return [wpUrubamba, baseCorridor[4], ...baseCorridor.slice(5, 12)];
      }
      if (destino.est_id === 'est_03') {
        // Urubamba -> Ollantaytambo
        return [wpUrubamba, baseCorridor[4], baseCorridor[5]];
      }
      if (destino.est_id === 'est_01' || destino.est_id === 'est_02') {
        // Urubamba -> Poroy / Cusco
        const endIdx = destino.est_id === 'est_01' ? 0 : 1;
        return [wpUrubamba, baseCorridor[4], baseCorridor[3], baseCorridor[2], ...baseCorridor.slice(endIdx, 2).reverse()];
      }
    }

    // Urubamba como destino
    if (destino.est_id === 'est_05') {
      if (origen.est_id === 'est_04') {
        // Machu Picchu -> Urubamba
        return [...baseCorridor.slice(5, 12).reverse(), baseCorridor[4], wpUrubamba];
      }
      if (origen.est_id === 'est_03') {
        // Ollantaytambo -> Urubamba
        return [baseCorridor[5], baseCorridor[4], wpUrubamba];
      }
      if (origen.est_id === 'est_01' || origen.est_id === 'est_02') {
        // Cusco / Poroy -> Urubamba
        const startIdx = origen.est_id === 'est_01' ? 0 : 1;
        return [...baseCorridor.slice(startIdx, 5), wpUrubamba];
      }
    }

    // Filtrar sub-tramo según el origen y destino real (San Pedro, Poroy, Ollantaytambo, Machu Picchu)
    let startIndex = 0;
    let endIndex = baseCorridor.length - 1;

    if (origen.est_id === 'est_03') startIndex = 5; // Ollantaytambo
    else if (origen.est_id === 'est_02') startIndex = 1; // Poroy
    else if (origen.est_id === 'est_01') startIndex = 0; // San Pedro
    else if (origen.est_id === 'est_04') startIndex = 11; // Machu Picchu

    if (destino.est_id === 'est_04') endIndex = 11;
    else if (destino.est_id === 'est_03') endIndex = 5;
    else if (destino.est_id === 'est_02') endIndex = 1;
    else if (destino.est_id === 'est_01') endIndex = 0;

    let corridorSlice: Waypoint[] = [];
    if (startIndex <= endIndex) {
      corridorSlice = baseCorridor.slice(startIndex, endIndex + 1);
    } else {
      corridorSlice = baseCorridor.slice(endIndex, startIndex + 1).reverse();
    }

    if (corridorSlice.length >= 2) {
      return corridorSlice;
    }

    // Fallback garantizado entre cualquier par de estaciones
    const oLat = Number(origen.est_latitud) || -13.5;
    const oLng = Number(origen.est_longitud) || -72.0;
    const dLat = Number(destino.est_latitud) || -13.1;
    const dLng = Number(destino.est_longitud) || -72.5;
    return [
      { lat: oLat, lng: oLng, nombre: origen.est_nombre, altitud: Number(origen.est_altitud_msnm) || 2800, descripcion: 'Estación de embarque inicial.', hitoKm: 'Salida' },
      { lat: (oLat + dLat) / 2, lng: (oLng + dLng) / 2, nombre: 'Corredor Ferroviario Andino', altitud: Math.round((Number(origen.est_altitud_msnm) + Number(destino.est_altitud_msnm)) / 2), descripcion: 'Trayecto en curso por la vía férrea.', hitoKm: 'En ruta' },
      { lat: dLat, lng: dLng, nombre: destino.est_nombre, altitud: Number(destino.est_altitud_msnm) || 2040, descripcion: 'Estación de desembarque y destino.', hitoKm: 'Llegada' },
    ];
  }, [origen, destino]);

  // Interpolación de posición actual según progreso [0..1]
  const currentStatus = useMemo(() => {
    if (!waypoints || waypoints.length < 2) {
      return {
        lat: origen.est_latitud,
        lng: origen.est_longitud,
        altitud: origen.est_altitud_msnm,
        sector: origen.est_nombre,
        velocidad: 0,
        distanciaRecorridaKm: 0,
        distanciaTotalKm: 45,
        minutosTranscurridos: 0,
        minutosRestantes: horario.hor_duracion_min,
      };
    }

    const totalSegments = waypoints.length - 1;
    const scaledProgress = Math.max(0, Math.min(1, progress)) * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentProgress = scaledProgress - segmentIndex;

    const p1 = waypoints[segmentIndex];
    const p2 = waypoints[segmentIndex + 1];

    const curLat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
    const curLng = p1.lng + (p2.lng - p1.lng) * segmentProgress;
    const curAlt = Math.round(p1.altitud + (p2.altitud - p1.altitud) * segmentProgress);

    // Velocidad simulada con variaciones realistas según altitud/curvatura
    const baseSpeed = horario.hor_servicio_tipo.includes('Hiram') ? 52 : (horario.hor_servicio_tipo.includes('Vistadome') ? 48 : 42);
    const speedVariation = Math.sin(progress * Math.PI * 6) * 6;
    const curSpeed = isPlaying ? Math.max(28, Math.round(baseSpeed + speedVariation)) : 0;

    const totalDur = horario.hor_duracion_min;
    const elapsed = Math.round(totalDur * progress);
    const remaining = Math.max(0, totalDur - elapsed);

    return {
      lat: curLat,
      lng: curLng,
      altitud: curAlt,
      sector: segmentProgress > 0.5 ? p2.nombre : p1.nombre,
      sectorDetalle: segmentProgress > 0.5 ? p2.descripcion : p1.descripcion,
      hitoKm: p1.hitoKm || 'Sector Ferroviario',
      velocidad: curSpeed,
      minutosTranscurridos: elapsed,
      minutosRestantes: remaining,
    };
  }, [waypoints, progress, horario, isPlaying, origen]);

  // Loop de simulación local
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = (0.0008 * simulationSpeed);
        if (prev + step >= 1) {
          return 0; // Loop o reiniciar
        }
        return prev + step;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed]);

  // Inicialización del mapa Leaflet
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (!isMounted || !mapContainerRef.current) return;

        const coords = waypoints.map(w => [Number(w.lat), Number(w.lng)] as [number, number]);
        const center = coords[Math.floor(coords.length / 2)] || [Number(origen.est_latitud), Number(origen.est_longitud)];

        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 12,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // Tile layer OSM
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; PeruRail / OpenStreetMap | Red Ferroviaria MTC',
        }).addTo(map);

        // Polyline de la vía férrea
        const railwayLine = L.polyline(coords, {
          color: '#b91c1c', // red-700
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8', // Estilo de vía de tren
          lineCap: 'round',
        }).addTo(map);

        polylineRef.current = railwayLine;

        // Marcador Estación Origen
        const origIcon = L.divIcon({
          className: 'custom-orig-pin',
          html: `
            <div class="bg-slate-900 text-white p-2 rounded-2xl shadow-xl border-2 border-red-500 flex items-center justify-center text-xs font-bold w-9 h-9">
              🚉
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker([Number(origen.est_latitud), Number(origen.est_longitud)], { icon: origIcon })
          .addTo(map)
          .bindPopup(`<strong>Partida: ${origen.est_nombre}</strong><br/>Salida: ${horario.hor_hora_salida}<br/>Altitud: ${origen.est_altitud_msnm} msnm`);

        // Marcador Estación Destino
        const destIcon = L.divIcon({
          className: 'custom-dest-pin',
          html: `
            <div class="bg-emerald-700 text-white p-2 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center text-xs font-bold w-9 h-9 animate-pulse">
              🏁
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker([Number(destino.est_latitud), Number(destino.est_longitud)], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<strong>Destino: ${destino.est_nombre}</strong><br/>Llegada estimada: ${horario.hor_hora_llegada}<br/>Altitud: ${destino.est_altitud_msnm} msnm`);

        // Marcadores de Waypoints intermedios
        waypoints.slice(1, -1).forEach((wp) => {
          const wpIcon = L.divIcon({
            className: 'custom-wp-pin',
            html: `<div class="w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-md"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          L.marker([wp.lat, wp.lng], { icon: wpIcon })
            .addTo(map)
            .bindPopup(`<strong>${wp.nombre}</strong> (${wp.hitoKm || ''})<br/>${wp.descripcion}<br/>Altitud: ${wp.altitud} msnm`);
        });

        // Marcador Animado del TREN
        const trainIcon = L.divIcon({
          className: 'custom-live-train',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute w-12 h-12 bg-red-600/30 rounded-full animate-ping"></span>
              <div class="bg-gradient-to-tr from-red-700 to-red-500 text-white p-2.5 rounded-full shadow-2xl border-2 border-white transform hover:scale-125 transition-transform flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v2m-6 0h12m-6 6v3m-4 5h8m-8-2h8" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const trainMarker = L.marker([currentStatus.lat, currentStatus.lng], { icon: trainIcon, zIndexOffset: 1000 }).addTo(map);
        trainMarkerRef.current = trainMarker;

        // Auto-fit bounds
        map.fitBounds(railwayLine.getBounds(), { padding: [40, 40] });

        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      } catch (err) {
        console.error('[TrainJourneyMap Error]', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, waypoints]);

  // Actualizar posición del tren en el mapa en cada tick
  useEffect(() => {
    if (trainMarkerRef.current && currentStatus) {
      trainMarkerRef.current.setLatLng([currentStatus.lat, currentStatus.lng]);
    }
  }, [currentStatus]);

  // Invalidar tamaño de Leaflet al volver a la pestaña de mapa para recalcular dimensiones
  useEffect(() => {
    if (activeTab === 'mapa' && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const percentage = Math.round(progress * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-200">
      {/* Header del Tren y Controles */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-red-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Train className="w-3 h-3" />
              {horario.hor_servicio_tipo}
            </span>
            <span className="bg-white/10 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
              Tren #{horario.hor_codigo_tren}
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Simulación de Tránsito Activa
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>{origen.est_ciudad}</span>
            <span className="text-red-500">➔</span>
            <span>{destino.est_ciudad}</span>
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">
            Salida programada: <strong className="text-white">{horario.hor_hora_salida}</strong> | Llegada estimada: <strong className="text-white">{horario.hor_hora_llegada}</strong> (~{formatDurationMin(horario.hor_duracion_min)})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play / Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pausar Simulación' : 'Reanudar'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={() => setProgress(0)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Reiniciar a partida"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-[11px] font-bold">
            {[1, 3, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  simulationSpeed === spd ? 'bg-red-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Live Dashboard HUD */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Posición / Sector actual */}
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 text-[10px] block flex items-center gap-1">
            <Compass className="w-3 h-3 text-red-400" />
            Sector Ferroviario Actual
          </span>
          <span className="font-extrabold text-white text-xs sm:text-sm truncate block mt-0.5">
            {currentStatus.sector}
          </span>
          <span className="text-[10px] text-amber-400 font-mono">
            {currentStatus.hitoKm}
          </span>
        </div>

        {/* Altitud dinámica */}
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 text-[10px] block flex items-center gap-1">
            <Mountain className="w-3 h-3 text-emerald-400" />
            Altitud del Tramo
          </span>
          <span className="font-extrabold text-emerald-400 text-xs sm:text-sm block mt-0.5 font-mono">
            {currentStatus.altitud.toLocaleString()} msnm
          </span>
          <span className="text-[10px] text-slate-400">
            {origen.est_altitud_msnm}m ➔ {destino.est_altitud_msnm}m
          </span>
        </div>

        {/* Velocidad de la locomotora */}
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 text-[10px] block flex items-center gap-1">
            <Gauge className="w-3 h-3 text-sky-400" />
            Velocidad Estimada
          </span>
          <span className="font-extrabold text-sky-400 text-xs sm:text-sm block mt-0.5 font-mono">
            {currentStatus.velocidad} km/h
          </span>
          <span className="text-[10px] text-slate-400">
            {horario.hor_incluye_refrigerio ? 'Snack a bordo' : 'Coche estándar'}
          </span>
        </div>

        {/* Tiempo transcurrido / ETA */}
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 text-[10px] block flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" />
            Progreso del Trayecto
          </span>
          <span className="font-extrabold text-white text-xs sm:text-sm block mt-0.5 font-mono">
            {percentage}% ({formatHoursColonMin(currentStatus.minutosTranscurridos)} de {formatHoursColonMin(horario.hor_duracion_min)})
          </span>
          <span className="text-[10px] text-purple-400">
            ETA: ~{formatHoursColonMin(currentStatus.minutosRestantes)} restantes
          </span>
        </div>
      </div>

      {/* Progress Bar / Scrubber */}
      <div className="bg-slate-950 px-4 py-2 flex items-center gap-3 border-b border-slate-800">
        <span className="text-[10px] text-slate-400 font-bold shrink-0 font-mono">0%</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => {
            setProgress(parseFloat(e.target.value));
            setIsPlaying(false); // Pausar al arrastrar
          }}
          className="w-full accent-red-600 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <span className="text-[10px] text-slate-400 font-bold shrink-0 font-mono">100%</span>
      </div>

      {/* Tab Switcher: Mapa vs Waypoints vs Detalles de Cabina */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'mapa'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🗺️ Mapa y Ruta en Vivo
          </button>
          <button
            onClick={() => setActiveTab('detalles')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'detalles'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📋 Hitos & Puntos Escénicos ({waypoints.length})
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'perfil'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎟️ Tarifa y Servicios
          </button>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
          {waypoints.length} estaciones y pasos intermedios georreferenciados
        </span>
      </div>

      {/* Vista 1: Mapa Interactivo Leaflet (se mantiene montado para preservar la instancia y estado de Leaflet) */}
      <div className={`relative ${activeTab === 'mapa' ? 'block' : 'hidden'}`}>
        <div ref={mapContainerRef} className={`${className} w-full z-0`} />

        {/* Floating Sector Badge */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-slate-950/90 text-white p-3 rounded-2xl backdrop-blur-md border border-slate-800 shadow-2xl max-w-sm z-[500] pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Locomotora en Vía</span>
          </div>
          <h5 className="text-xs sm:text-sm font-black text-white mt-1">
            {currentStatus.sector}
          </h5>
          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
            {currentStatus.sectorDetalle}
          </p>
        </div>
      </div>

      {/* Vista 2: Hitos y Puntos Escénicos */}
      {activeTab === 'detalles' && (
        <div className="p-5 sm:p-6 max-h-[450px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
          {waypoints.map((wp, idx) => {
            const isPassed = (idx / (waypoints.length - 1)) <= progress;
            return (
              <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                    isPassed ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {idx === 0 ? 'PARTIDA' : (idx === waypoints.length - 1 ? 'LLEGADA' : wp.hitoKm || `#${idx}`)}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      {wp.nombre}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {wp.descripcion}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {wp.altitud} msnm
                  </span>
                  {isPassed && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Cruzado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista 3: Tarifa y Servicios */}
      {activeTab === 'perfil' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-xs block">Tarifa Nacional / Regular</span>
              <span className="text-2xl font-black text-red-700 dark:text-red-400 mt-1 block">
                {formatCurrencyPEN(horario.hor_tarifa_regular_pen)}
              </span>
              <span className="text-[11px] text-slate-500">Tarifa oficial Perú</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-xs block">Tarifa Turista Extranjero</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                USD {horario.hor_tarifa_turista_usd}
              </span>
              <span className="text-[11px] text-slate-500">Boleto internacional</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-xs block">Disponibilidad en Tiempo Real</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {horario.hor_asientos_disponibles} asientos
              </span>
              <span className="text-[11px] text-slate-500">Coche asignado</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <h5 className="font-bold text-sm text-red-400">Servicios y Políticas Incluidas</h5>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{horario.hor_incluye_refrigerio ? 'Incluye refrigerio andino y bebidas calientes de cortesía.' : 'Venta de snacks y bebidas a bordo a través del carro bar.'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Equipaje de mano permitido: 1 mochila de hasta 5.0 kg / 11 lbs por pasajero.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Música ambiental tradicional y comentarios de audio-guía durante el paso por sitios arqueológicos.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ventanas panorámicas con filtro UV para contemplar los nevados del Valle Sagrado.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
