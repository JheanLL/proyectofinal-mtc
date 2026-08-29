'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  CloudSun, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  ShieldCheck, 
  DollarSign,
  Compass,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import WalkingRouteMap from '@/components/maps/WalkingRouteMap';
import SenamhiWeatherCard from '@/components/weather/SenamhiWeatherCard';
import PeruRailScheduleCard from '@/components/trains/PeruRailScheduleCard';
import ConsolidatedTouristReport from '@/components/reports/ConsolidatedTouristReport';
import { formatDistance, formatDurationMin, formatCurrencyPEN, formatCurrencyUSD } from '@/lib/utils';
import confetti from 'canvas-confetti';

function PlanificadorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Final Report State
  const [generatedItinerarioCodigo, setGeneratedItinerarioCodigo] = useState<string>('');
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

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

  // Derived objects
  const estacionOrigen = estaciones.find(e => e.est_id === origenEstacionId) || estaciones[2] || estaciones[0];
  const estacionDestino = estaciones.find(e => e.est_id === destinoEstacionId) || estaciones[3] || estaciones[0];
  
  // Available tourist zones for destination station matching preferences
  const zonasDisponibles = zonas.filter(z => {
    const matchesDestino = z.zon_estacion_id === destinoEstacionId;
    const matchesPrefs = selectedPreferencias.length === 0 || selectedPreferencias.includes(z.zon_categoria);
    return matchesDestino && matchesPrefs;
  });

  const allZonasInDestino = zonas.filter(z => z.zon_estacion_id === destinoEstacionId);

  const selectedZona = zonas.find(z => z.zon_id === selectedZonaId) || (zonasDisponibles[0] || allZonasInDestino[0]);

  // PeruRail schedules
  const horariosIda = horarios.filter(h => h.hor_estacion_origen_id === origenEstacionId && h.hor_estacion_destino_id === destinoEstacionId);
  const horariosRetorno = horarios.filter(h => h.hor_estacion_origen_id === destinoEstacionId && h.hor_estacion_destino_id === origenEstacionId);

  const selectedHorarioIda = horarios.find(h => h.hor_id === selectedHorarioIdaId) || horariosIda[0];
  const selectedHorarioRetorno = horarios.find(h => h.hor_id === selectedHorarioRetornoId) || horariosRetorno[0];

  // SENAMHI Weather
  const climaSenamhi = getClimaByEstacion(destinoEstacionId);

  // Preference Toggle Handler
  const togglePreferencia = (prefCodigo: CategoriaTuristica) => {
    if (selectedPreferencias.includes(prefCodigo)) {
      if (selectedPreferencias.length > 1) {
        setSelectedPreferencias(selectedPreferencias.filter(p => p !== prefCodigo));
      }
    } else {
      setSelectedPreferencias([...selectedPreferencias, prefCodigo]);
    }
  };

  // Generate and Finalize Itinerary
  const handleFinalizeReport = () => {
    if (!selectedZona || !selectedHorarioIda || !selectedHorarioRetorno) {
      alert('Por favor selecciona la zona turística y los horarios de tren.');
      return;
    }

    const saved = saveItinerario({
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
    });

    setGeneratedItinerarioCodigo(saved.iti_codigo);
    setIsFinalized(true);
    setCurrentStep(4);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asesor Especializado MTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Planificador Inteligente de Rutas Ferroviarias y Peatonales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Configura tus preferencias, consulta previsiones climáticas del SENAMHI, selecciona billetes de PeruRail y genera tu informe de ruta caminable (ida y vuelta).
          </p>
        </div>

        {/* Wizard Stepper Dots */}
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          {[
            { step: 1, label: '1. Preferencias' },
            { step: 2, label: '2. Estación & Zona' },
            { step: 3, label: '3. Trenes PeruRail' },
            { step: 4, label: '4. Informe Final' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStep === s.step
                  ? 'bg-red-700 text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= STEP 1: PREFERENCIAS ================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Paso 1 de 4</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Define tus preferencias turísticas personales
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Selecciona las actividades y temáticas que deseas priorizar en tu caminata desde la estación ferroviaria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {preferencias.map((pref) => {
                const isSelected = selectedPreferencias.includes(pref.pre_codigo);
                return (
                  <div
                    key={pref.pre_id}
                    onClick={() => togglePreferencia(pref.pre_codigo)}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pref.pre_nombre.charAt(0)}
                      </div>
                      {isSelected && (
                        <div className="bg-red-600 text-white rounded-full p-1 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{pref.pre_nombre}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pref.pre_descripcion}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-red-700">
                      {isSelected ? '✓ Seleccionado' : '+ Seleccionar'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Date and Passenger Info */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Pasajero / Titular:
                </label>
                <input
                  type="text"
                  value={usuarioNombre}
                  onChange={(e) => setUsuarioNombre(e.target.value)}
                  placeholder="Ej: Carlos Ramírez"
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Correo Electrónico (opcional):
                </label>
                <input
                  type="email"
                  value={usuarioEmail}
                  onChange={(e) => setUsuarioEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fecha Prevista de Visita:
                </label>
                <input
                  type="date"
                  value={fechaViaje}
                  onChange={(e) => setFechaViaje(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all"
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
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Paso 2 de 4</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Selecciona la Estación Ferroviaria y Atractivo a Pie
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Elige tu estación de destino para visualizar los atractivos turísticos caminables y el clima oficial del SENAMHI.
              </p>
            </div>

            {/* Station Selection Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin Station */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
                  <Train className="w-4 h-4 text-red-600" />
                  Estación de Salida (Origen):
                </label>
                <select
                  value={origenEstacionId}
                  onChange={(e) => setOrigenEstacionId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {estaciones.map(e => (
                    <option key={e.est_id} value={e.est_id}>
                      {e.est_nombre} ({e.est_ciudad}, {e.est_altitud_msnm} msnm)
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Station */}
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200">
                <label className="text-xs font-bold text-red-800 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Estación de Destino Turístico:
                </label>
                <select
                  value={destinoEstacionId}
                  onChange={(e) => {
                    setDestinoEstacionId(e.target.value);
                    setSelectedZonaId(''); // Reset selection for new station
                  }}
                  className="w-full text-xs font-semibold bg-white border border-red-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {estaciones.map(e => (
                    <option key={e.est_id} value={e.est_id}>
                      {e.est_nombre} ({e.est_ciudad}, {e.est_altitud_msnm} msnm)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weather Widget for Destination */}
            {climaSenamhi && (
              <SenamhiWeatherCard clima={climaSenamhi} estacion={estacionDestino} />
            )}

            {/* Available Walking Zones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  Atractivos a pie desde {estacionDestino?.est_nombre} ({allZonasInDestino.length} disponibles)
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Diseñado para realizarse en un solo tramo a pie
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allZonasInDestino.map((z) => {
                  const isSelected = (selectedZona?.zon_id === z.zon_id);
                  const isPrefMatched = selectedPreferencias.includes(z.zon_categoria);

                  return (
                    <div
                      key={z.zon_id}
                      onClick={() => setSelectedZonaId(z.zon_id)}
                      className={`relative rounded-2xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="relative h-36 bg-slate-100">
                        <img
                          src={z.zon_imagen_url}
                          alt={z.zon_nombre}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {z.zon_categoria}
                          </span>
                        </div>
                        {isPrefMatched && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                              ⭐ Coincide con tu gusto
                            </span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute bottom-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{z.zon_nombre}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{z.zon_resumen_corto}</p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 flex items-center justify-between border border-slate-100">
                          <span>🚶 <strong>{formatDistance(z.zon_distancia_metros)}</strong> (~{formatDurationMin(z.zon_tiempo_caminata_min)})</span>
                          <span className="font-bold text-emerald-800">Dificultad: {z.zon_dificultad}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Map of Selected Route */}
            {selectedZona && estacionDestino && (
              <div className="pt-2">
                <WalkingRouteMap estacion={estacionDestino} zona={selectedZona} />
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Preferencias</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all"
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
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Paso 3 de 4</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Selecciona los Horarios y Servicios de Tren (PeruRail)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Elige tu tren de ida desde {estacionOrigen.est_nombre} y tu tren de retorno desde {estacionDestino.est_nombre}.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Outbound Schedules */}
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

              {/* Return Schedules */}
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

            {/* Total Duration & Budget Estimation Summary */}
            {selectedHorarioIda && selectedHorarioRetorno && selectedZona && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Cálculo del Itinerario Completo
                  </h4>
                  <span className="text-xs text-slate-400">Trayecto único de ida y vuelta</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-800 text-center">
                  <div className="pt-2 sm:pt-0">
                    <span className="text-slate-400 block">Salida Tren Ida:</span>
                    <span className="text-base font-extrabold text-white">{selectedHorarioIda.hor_hora_salida}</span>
                    <span className="text-[11px] text-slate-400 block">{estacionOrigen.est_ciudad}</span>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-slate-400 block">Caminata Total (Ida + Vuelta):</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {formatDurationMin(selectedZona.zon_tiempo_caminata_min * 2)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{formatDistance(selectedZona.zon_distancia_metros * 2)} a pie</span>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-slate-400 block">Embarque Retorno:</span>
                    <span className="text-base font-extrabold text-sky-400">{selectedHorarioRetorno.hor_hora_salida}</span>
                    <span className="text-[11px] text-slate-400 block">{estacionDestino.est_ciudad}</span>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-slate-400 block">Costo Total Billetes:</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {formatCurrencyPEN(selectedHorarioIda.hor_tarifa_regular_pen + selectedHorarioRetorno.hor_tarifa_regular_pen)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      USD {selectedHorarioIda.hor_tarifa_turista_usd + selectedHorarioRetorno.hor_tarifa_turista_usd}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Estación & Zona</span>
              </button>

              <button
                onClick={handleFinalizeReport}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-7 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Informe Consolidado Oficial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 4: INFORME FINAL CONSOLIDADO ================= */}
      {currentStep === 4 && selectedZona && selectedHorarioIda && selectedHorarioRetorno && (
        <div className="space-y-6">
          <ConsolidatedTouristReport
            codigoItinerario={generatedItinerarioCodigo || 'MTC-TRAIN-8924'}
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

          <div className="flex justify-center pt-6">
            <button
              onClick={() => {
                setCurrentStep(1);
                setIsFinalized(false);
              }}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all"
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
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando Asesor MTC...</div>}>
      <PlanificadorContent />
    </Suspense>
  );
}
