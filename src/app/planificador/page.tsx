'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getEstaciones, 
  getZonasTuristicas, 
  getHorariosTren, 
  getClimaByEstacion, 
  getPreferencias,
  saveItinerario
} from '@/lib/db/store';
import { 
  TblEstacion, 
  TblZonaTuristica, 
  TblHorarioTren, 
  TblPronosticoClima, 
  TblPreferenciaTuristica,
  CategoriaTuristica 
} from '@/types/database';
import { 
  Sparkles, 
  Train, 
  Footprints, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  MapPin, 
  Radio
} from 'lucide-react';
import WalkingRouteMap from '@/components/maps/WalkingRouteMap';
import SenamhiWeatherCard from '@/components/weather/SenamhiWeatherCard';
import PeruRailScheduleCard from '@/components/trains/PeruRailScheduleCard';
import ConsolidatedTouristReport from '@/components/reports/ConsolidatedTouristReport';
import { formatDistance, formatDurationMin, formatCurrencyPEN } from '@/lib/utils';
import confetti from 'canvas-confetti';

function PlanificadorContent() {
  const searchParams = useSearchParams();

  // Master Data
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [preferencias, setPreferencias] = useState<TblPreferenciaTuristica[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);

  // Wizard State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPreferencias, setSelectedPreferencias] = useState<CategoriaTuristica[]>(['naturaleza']);
  const [origenEstacionId, setOrigenEstacionId] = useState<string>('est_03'); // Ollantaytambo default
  const [destinoEstacionId, setDestinoEstacionId] = useState<string>('est_04'); // Machu Picchu default
  const [selectedZonaId, setSelectedZonaId] = useState<string>('');
  const [selectedHorarioIdaId, setSelectedHorarioIdaId] = useState<string>('');
  const [selectedHorarioRetornoId, setSelectedHorarioRetornoId] = useState<string>('');
  const [fechaViaje, setFechaViaje] = useState<string>(new Date().toISOString().split('T')[0]);
  const [usuarioNombre, setUsuarioNombre] = useState<string>('Turista Nacional');
  const [usuarioEmail, setUsuarioEmail] = useState<string>('');
  const [liveClima, setLiveClima] = useState<TblPronosticoClima | null>(null);

  // Final Report State
  const [generatedItinerarioCodigo, setGeneratedItinerarioCodigo] = useState<string>('');

  // Load Initial Data and handle query params
  useEffect(() => {
    const loadedEstaciones = getEstaciones();
    const loadedZonas = getZonasTuristicas();
    const loadedPrefs = getPreferencias();
    const loadedHorarios = getHorariosTren();

    setEstaciones(loadedEstaciones);
    setZonas(loadedZonas);
    setPreferencias(loadedPrefs);
    setHorarios(loadedHorarios);

    // Call live APIs
    fetch('/api/estaciones')
      .then(res => res.json())
      .then(data => { if (data.data) setEstaciones(data.data); })
      .catch(() => {});

    fetch('/api/zonas')
      .then(res => res.json())
      .then(data => { if (data.data) setZonas(data.data); })
      .catch(() => {});

    fetch('/api/horarios')
      .then(res => res.json())
      .then(data => { if (data.data) setHorarios(data.data); })
      .catch(() => {});

    const qZonaId = searchParams.get('zonaId');
    const qEstacionId = searchParams.get('estacionId');

    if (qEstacionId) {
      setDestinoEstacionId(qEstacionId);
    }

    if (qZonaId) {
      const found = loadedZonas.find(z => z.zon_id === qZonaId);
      if (found) {
        setSelectedZonaId(qZonaId);
        setDestinoEstacionId(found.zon_estacion_id);
        setSelectedPreferencias([found.zon_categoria]);
      }
    }
  }, [searchParams]);

  // Fetch Live Weather when destination station changes
  useEffect(() => {
    if (!destinoEstacionId) return;
    
    // Set fallback immediately
    const fallback = getClimaByEstacion(destinoEstacionId);
    setLiveClima(fallback);

    // Fetch live API
    fetch(`/api/senamhi?estacionId=${destinoEstacionId}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setLiveClima(json.data);
        }
      })
      .catch(() => {});
  }, [destinoEstacionId]);

  // Derived objects
  const estacionOrigen = estaciones.find(e => e.est_id === origenEstacionId) || estaciones[2] || estaciones[0];
  const estacionDestino = estaciones.find(e => e.est_id === destinoEstacionId) || estaciones[3] || estaciones[0];
  
  const allZonasInDestino = zonas.filter(z => z.zon_estacion_id === destinoEstacionId);
  const zonasDisponibles = allZonasInDestino.filter(z => 
    selectedPreferencias.length === 0 || selectedPreferencias.includes(z.zon_categoria)
  );

  const selectedZona = zonas.find(z => z.zon_id === selectedZonaId) || (zonasDisponibles[0] || allZonasInDestino[0]);

  // PeruRail schedules
  const horariosIda = horarios.filter(h => h.hor_estacion_origen_id === origenEstacionId && h.hor_estacion_destino_id === destinoEstacionId);
  const horariosRetorno = horarios.filter(h => h.hor_estacion_origen_id === destinoEstacionId && h.hor_estacion_destino_id === origenEstacionId);

  const selectedHorarioIda = horarios.find(h => h.hor_id === selectedHorarioIdaId) || horariosIda[0];
  const selectedHorarioRetorno = horarios.find(h => h.hor_id === selectedHorarioRetornoId) || horariosRetorno[0];

  const climaSenamhi = liveClima || getClimaByEstacion(destinoEstacionId);

  const togglePreferencia = (prefCodigo: CategoriaTuristica) => {
    if (selectedPreferencias.includes(prefCodigo)) {
      if (selectedPreferencias.length > 1) {
        setSelectedPreferencias(selectedPreferencias.filter(p => p !== prefCodigo));
      }
    } else {
      setSelectedPreferencias([...selectedPreferencias, prefCodigo]);
    }
  };

  const handleFinalizeReport = async () => {
    if (!selectedZona || !selectedHorarioIda || !selectedHorarioRetorno) {
      alert('Por favor selecciona la zona turística y los horarios de tren.');
      return;
    }

    const payload = {
      iti_usuario_nombre: usuarioNombre || 'Turista Nacional',
      iti_usuario_email: usuarioEmail,
      iti_estacion_origen_id: origenEstacionId,
      iti_estacion_destino_id: destinoEstacionId,
      iti_zona_turistica_id: selectedZona.zon_id,
      iti_horario_ida_id: selectedHorarioIda.hor_id,
      iti_horario_retorno_id: selectedHorarioRetorno.hor_id,
      iti_preferencias_seleccionadas: selectedPreferencias,
      iti_distancia_total_caminata_metros: selectedZona.zon_distancia_metros * 2,
      iti_tiempo_total_caminata_min: selectedZona.zon_tiempo_caminata_min * 2,
      iti_costo_tren_total_pen: selectedHorarioIda.hor_tarifa_regular_pen + selectedHorarioRetorno.hor_tarifa_regular_pen,
      iti_costo_tren_total_usd: selectedHorarioIda.hor_tarifa_turista_usd + selectedHorarioRetorno.hor_tarifa_turista_usd,
      iti_costo_entradas_pen: selectedZona.zon_precio_entrada_pen,
      iti_costo_total_pen: selectedHorarioIda.hor_tarifa_regular_pen + selectedHorarioRetorno.hor_tarifa_regular_pen + selectedZona.zon_precio_entrada_pen,
      iti_costo_total_usd: selectedHorarioIda.hor_tarifa_turista_usd + selectedHorarioRetorno.hor_tarifa_turista_usd,
    };

    const saved = saveItinerario(payload);

    try {
      fetch('/api/itinerarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}

    setGeneratedItinerarioCodigo(saved.iti_codigo);
    setCurrentStep(4);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 transition-colors duration-200">
      {/* Top Header & Wizard Stepper with Ample Spacing */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 text-xs font-bold mb-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Asesor de Rutas a Pie & Tren</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Planificador de Itinerarios Turísticos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Configura tus preferencias, consulta el clima oficial de SENAMHI, selecciona horarios de tren y visualiza tu circuito peatonal a pie.
          </p>
        </div>

        {/* Stepper with clear contrast and generous padding */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto">
          {[
            { step: 1, label: '1. Preferencias' },
            { step: 2, label: '2. Estación & Zona' },
            { step: 3, label: '3. Trenes PeruRail' },
            { step: 4, label: '4. Informe Final' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                currentStep === s.step
                  ? 'bg-red-700 text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= STEP 1: PREFERENCIAS ================= */}
      {currentStep === 1 && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400">Paso 1 de 4</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Define tus preferencias turísticas
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Selecciona las actividades que deseas priorizar en tu caminata exclusiva a pie desde la estación terminal.
              </p>
            </div>

            {/* Grid of Preferences with generous padding and no squished text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {preferencias.map((pref) => {
                const isSelected = selectedPreferencias.includes(pref.pre_codigo);
                return (
                  <div
                    key={pref.pre_id}
                    onClick={() => togglePreferencia(pref.pre_codigo)}
                    className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 shadow-sm ring-2 ring-red-600/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                        isSelected ? 'bg-red-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                      }`}>
                        {pref.pre_nombre.charAt(0)}
                      </div>
                      {isSelected && (
                        <div className="bg-red-600 text-white rounded-full p-1 shadow-sm">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {pref.pre_nombre}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {pref.pre_descripcion}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-red-700 dark:text-red-400">
                      {isSelected ? '✓ Seleccionado' : '+ Seleccionar'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Date and Passenger Info: Spacious Form */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Datos del Pasajero y Fecha de Salida
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Nombre del Titular:
                  </label>
                  <input
                    type="text"
                    value={usuarioNombre}
                    onChange={(e) => setUsuarioNombre(e.target.value)}
                    placeholder="Ej: Carlos Ramírez"
                    className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Correo Electrónico (opcional):
                  </label>
                  <input
                    type="email"
                    value={usuarioEmail}
                    onChange={(e) => setUsuarioEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Fecha de Viaje:
                  </label>
                  <input
                    type="date"
                    value={fechaViaje}
                    onChange={(e) => setFechaViaje(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all"
              >
                <span>Continuar a Estaciones & Zonas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: ESTACIÓN Y ZONA TURÍSTICA ================= */}
      {currentStep === 2 && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400">Paso 2 de 4</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Selecciona la Estación y Atractivo a Pie
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Elige tu estación de llegada para consultar los atractivos caminables de Travel Group Perú y el clima de SENAMHI.
              </p>
            </div>

            {/* Station Selection: Spacious Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin Station */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Train className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Estación de Salida (Origen del Tren):
                </label>
                <select
                  value={origenEstacionId}
                  onChange={(e) => setOrigenEstacionId(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {estaciones.map(e => (
                    <option key={e.est_id} value={e.est_id}>
                      {e.est_nombre} ({e.est_ciudad} • {e.est_altitud_msnm} msnm)
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Punto de embarque inicial para tu trayecto ferroviario.
                </span>
              </div>

              {/* Destination Station */}
              <div className="bg-red-50/40 dark:bg-red-950/20 p-5 sm:p-6 rounded-3xl border border-red-200 dark:border-red-900/50 space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-red-900 dark:text-red-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Estación de Destino (Llegada & Inicio de Caminata):
                </label>
                <select
                  value={destinoEstacionId}
                  onChange={(e) => {
                    setDestinoEstacionId(e.target.value);
                    setSelectedZonaId('');
                  }}
                  className="w-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {estaciones.map(e => (
                    <option key={e.est_id} value={e.est_id}>
                      {e.est_nombre} ({e.est_ciudad} • {e.est_altitud_msnm} msnm)
                    </option>
                  ))}
                </select>
                <span className="text-xs text-red-700 dark:text-red-300 block">
                  Estación donde desembarcas para realizar el circuito a pie.
                </span>
              </div>
            </div>

            {/* Weather Widget for Destination */}
            {climaSenamhi && (
              <SenamhiWeatherCard clima={climaSenamhi} estacion={estacionDestino} />
            )}

            {/* Available Walking Zones: Spacious Cards Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Atractivos peatonales desde {estacionDestino?.est_nombre} ({allZonasInDestino.length} disponibles)
                </h3>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  Exclusivamente a pie en un solo tramo de ida y retorno
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allZonasInDestino.map((z) => {
                  const isSelected = (selectedZona?.zon_id === z.zon_id);
                  const isPrefMatched = selectedPreferencias.includes(z.zon_categoria);

                  return (
                    <div
                      key={z.zon_id}
                      onClick={() => setSelectedZonaId(z.zon_id)}
                      className={`relative rounded-3xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-600/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      {/* Image with comfortable height (192px) */}
                      <div className="relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={z.zon_imagen_url}
                          alt={z.zon_nombre}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-slate-950/80 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            {z.zon_categoria}
                          </span>
                        </div>
                        {isPrefMatched && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm">
                              ⭐ Recomendado
                            </span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute bottom-3 right-3 bg-emerald-600 text-white p-1.5 rounded-full shadow-lg">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Card Content with ample spacing */}
                      <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                            {z.zon_nombre}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {z.zon_resumen_corto}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                          <span className="font-semibold">🚶 <strong>{formatDistance(z.zon_distancia_metros)}</strong> (~{formatDurationMin(z.zon_tiempo_caminata_min)})</span>
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-400">{z.zon_dificultad}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Map */}
            {selectedZona && estacionDestino && (
              <div className="pt-4">
                <WalkingRouteMap estacion={estacionDestino} zona={selectedZona} />
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Preferencias</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all"
              >
                <span>Continuar a Horarios de Tren</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: TRENES PERURAIL ================= */}
      {currentStep === 3 && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400">Paso 3 de 4</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Selecciona los Horarios y Servicios de Tren (PeruRail)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Elige tu tren de ida desde {estacionOrigen.est_nombre} y tu tren de retorno desde {estacionDestino.est_nombre}.
              </p>
            </div>

            {/* Spacious 2-Column Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <PeruRailScheduleCard
                  horarios={horariosIda}
                  origen={estacionOrigen}
                  destino={estacionDestino}
                  horarioSeleccionadoId={selectedHorarioIda?.hor_id}
                  onSelectHorario={(h) => setSelectedHorarioIdaId(h.hor_id)}
                  tipo="ida"
                />
              </div>

              <div>
                <PeruRailScheduleCard
                  horarios={horariosRetorno}
                  origen={estacionDestino}
                  destino={estacionOrigen}
                  horarioSeleccionadoId={selectedHorarioRetorno?.hor_id}
                  onSelectHorario={(h) => setSelectedHorarioRetornoId(h.hor_id)}
                  tipo="retorno"
                />
              </div>
            </div>

            {/* Total Duration & Budget Estimation Summary: Large and Spacious */}
            {selectedHorarioIda && selectedHorarioRetorno && selectedZona && (
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    Cálculo y Resumen del Itinerario Completo
                  </h4>
                  <span className="text-xs text-slate-300 font-semibold">Trayecto único de ida y retorno</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
                  <div className="pt-2 sm:pt-0">
                    <span className="text-slate-400 text-xs block">Salida Tren Ida:</span>
                    <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">{selectedHorarioIda.hor_hora_salida}</span>
                    <span className="text-xs text-slate-300 block">{estacionOrigen.est_ciudad}</span>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-slate-400 text-xs block">Caminata Total:</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 block">
                      {formatDurationMin(selectedZona.zon_tiempo_caminata_min * 2)}
                    </span>
                    <span className="text-xs text-slate-300 block">{formatDistance(selectedZona.zon_distancia_metros * 2)} a pie</span>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-slate-400 text-xs block">Embarque Retorno:</span>
                    <span className="text-lg sm:text-xl font-black text-sky-400 mt-0.5 block">{selectedHorarioRetorno.hor_hora_salida}</span>
                    <span className="text-xs text-slate-300 block">{estacionDestino.est_ciudad}</span>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-slate-400 text-xs block">Tarifa Total Trenes:</span>
                    <span className="text-lg sm:text-xl font-black text-amber-400 mt-0.5 block">
                      {formatCurrencyPEN(selectedHorarioIda.hor_tarifa_regular_pen + selectedHorarioRetorno.hor_tarifa_regular_pen)}
                    </span>
                    <span className="text-xs text-slate-300 block">
                      USD {selectedHorarioIda.hor_tarifa_turista_usd + selectedHorarioRetorno.hor_tarifa_turista_usd}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Estación & Zona</span>
              </button>

              <button
                onClick={handleFinalizeReport}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Informe Consolidado</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 4: INFORME FINAL CONSOLIDADO ================= */}
      {currentStep === 4 && selectedZona && selectedHorarioIda && selectedHorarioRetorno && (
        <div className="space-y-8">
          <ConsolidatedTouristReport
            codigoItinerario={generatedItinerarioCodigo || 'TRAIN-8924'}
            fechaViaje={fechaViaje}
            usuarioNombre={usuarioNombre}
            usuarioEmail={usuarioEmail}
            estacionOrigen={estacionOrigen}
            estacionDestino={estacionDestino}
            zonaTuristica={selectedZona}
            horarioIda={selectedHorarioIda}
            horarioRetorno={selectedHorarioRetorno}
            climaSenamhi={climaSenamhi}
            preferenciasSeleccionadas={selectedPreferencias}
          />

          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setCurrentStep(1);
              }}
              className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all"
            >
              <span>Crear Otra Consulta de Ruta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanificadorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando Asesor...</div>}>
      <PlanificadorContent />
    </Suspense>
  );
}
