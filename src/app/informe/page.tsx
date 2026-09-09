'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  getItinerarios, 
  getItinerarioByCodigo, 
  getEstaciones, 
  getZonasTuristicas, 
  getHorariosTren, 
  getClimaByEstacion 
} from '@/lib/db/store';
import { 
  TblItinerarioConsulta, 
  TblEstacion, 
  TblZonaTuristica, 
  TblHorarioTren, 
} from '@/types/database';
import { 
  FileText, 
  Search, 
  Sparkles, 
  ArrowRight,
} from 'lucide-react';
import ConsolidatedTouristReport from '@/components/reports/ConsolidatedTouristReport';

function InformeContent() {
  const searchParams = useSearchParams();
  const [itinerarios, setItinerarios] = useState<TblItinerarioConsulta[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);

  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [activeItinerario, setActiveItinerario] = useState<TblItinerarioConsulta | null>(null);
  const [isLoadingCodigo, setIsLoadingCodigo] = useState(false);

  useEffect(() => {
    const loadedIti = getItinerarios();
    const loadedEst = getEstaciones();
    const loadedZon = getZonasTuristicas();
    const loadedHor = getHorariosTren();

    setItinerarios(loadedIti);
    setEstaciones(loadedEst);
    setZonas(loadedZon);
    setHorarios(loadedHor);

    // 1. Fetch recent itinerarios from Aiven MySQL
    fetch('/api/itinerarios')
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          setItinerarios(prev => {
            const map = new Map<string, TblItinerarioConsulta>();
            prev.forEach(i => map.set(i.iti_codigo.toLowerCase(), i));
            (json.data as TblItinerarioConsulta[]).forEach(i => map.set(i.iti_codigo.toLowerCase(), i));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    // 2. Si viene un código en la URL (enlace compartido desde Aiven o redes)
    const qCodigo = searchParams.get('codigo');
    if (qCodigo) {
      const cleanQ = qCodigo.trim();
      setCodigoBusqueda(cleanQ);

      const foundLocal = loadedIti.find(i => 
        i.iti_codigo.toLowerCase() === cleanQ.toLowerCase() || i.iti_id === cleanQ
      );

      if (foundLocal) {
        setActiveItinerario(foundLocal);
      } else {
        // Consultar directamente a Aiven MySQL en la nube
        setIsLoadingCodigo(true);
        fetch(`/api/itinerarios?codigo=${encodeURIComponent(cleanQ)}`)
          .then(res => res.json())
          .then(json => {
            if (json.success && json.data) {
              const itiData = json.data as TblItinerarioConsulta;
              setActiveItinerario(itiData);
              // Cachear en el historial local del visitante sin cuenta
              setItinerarios(prev => {
                const filtered = prev.filter(i => i.iti_codigo.toLowerCase() !== itiData.iti_codigo.toLowerCase());
                return [itiData, ...filtered];
              });
            } else if (loadedIti.length > 0) {
              setActiveItinerario(loadedIti[0]);
            }
          })
          .catch(() => {
            if (loadedIti.length > 0) setActiveItinerario(loadedIti[0]);
          })
          .finally(() => setIsLoadingCodigo(false));
      }
    } else if (loadedIti.length > 0) {
      setActiveItinerario(loadedIti[0]);
    }
  }, [searchParams]);

  const handleSearchCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryTerm = codigoBusqueda.trim();
    if (!queryTerm) return;

    const foundLocal = getItinerarioByCodigo(queryTerm) || 
      itinerarios.find(i => i.iti_codigo.toLowerCase() === queryTerm.toLowerCase());
    
    if (foundLocal) {
      setActiveItinerario(foundLocal);
      return;
    }

    // Buscar en Aiven MySQL
    setIsLoadingCodigo(true);
    try {
      const res = await fetch(`/api/itinerarios?codigo=${encodeURIComponent(queryTerm)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const foundAiven = json.data as TblItinerarioConsulta;
        setActiveItinerario(foundAiven);
        setItinerarios(prev => [foundAiven, ...prev.filter(i => i.iti_codigo !== foundAiven.iti_codigo)]);
      } else {
        alert(`No se encontró ningún itinerario con el código "${queryTerm}".`);
      }
    } catch {
      alert('Error al consultar el itinerario. Por favor intenta de nuevo.');
    } finally {
      setIsLoadingCodigo(false);
    }
  };

  const estacionOrigen = activeItinerario ? estaciones.find(e => e.est_id === activeItinerario.iti_estacion_origen_id) || estaciones[0] : estaciones[0];
  const estacionDestino = activeItinerario ? estaciones.find(e => e.est_id === activeItinerario.iti_estacion_destino_id) || estaciones[1] : estaciones[1];
  const zonaTuristica = activeItinerario ? zonas.find(z => z.zon_id === activeItinerario.iti_zona_turistica_id) || zonas[0] : zonas[0];
  const horarioIda = activeItinerario ? horarios.find(h => h.hor_id === activeItinerario.iti_horario_ida_id) || horarios[0] : horarios[0];
  const horarioRetorno = activeItinerario ? horarios.find(h => h.hor_id === activeItinerario.iti_horario_retorno_id) || horarios[1] : horarios[1];
  const climaSenamhi = estacionDestino ? getClimaByEstacion(estacionDestino.est_id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400 text-xs font-bold mb-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Módulo de Informes Consolidados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Consultas e Informes Turísticos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Visualiza, descarga en PDF o imprime tus informes de visita generados con datos climáticos y ferroviarios en vivo.
          </p>
        </div>

        <Link
          href="/planificador"
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nuevo Itinerario</span>
        </Link>
      </div>

      {/* Lookup Bar & Recent Queries (Hidden on print) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 print:hidden">
        <form onSubmit={handleSearchCodigo} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder="Buscar por código de itinerario (Ej: MTC-8f3a9e2d1c4b8e3a)..."
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingCodigo}
            className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isLoadingCodigo ? 'Buscando...' : 'Buscar Informe'}
          </button>
        </form>

        {/* Recent Itineraries pill list */}
        {itinerarios.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Historial:</span>
            {itinerarios.map((it) => (
              <button
                key={it.iti_id}
                onClick={() => {
                  setActiveItinerario(it);
                  setCodigoBusqueda(it.iti_codigo);
                }}
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-lg border transition-all ${
                  activeItinerario?.iti_id === it.iti_id
                    ? 'bg-red-700 text-white border-red-700 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {it.iti_codigo}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Report Display */}
      {(() => {
        if (!zonaTuristica || !horarioIda || !horarioRetorno || !climaSenamhi) return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No hay informes seleccionados</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Utiliza el planificador asistido para configurar tus preferencias y generar tu primer informe consolidado en PDF.
            </p>
            <Link
              href="/planificador"
              className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
            >
              <span>Ir al Planificador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        );

        // Resolver fecha de viaje real y fecha de emisión inmutable
        const resolvedFechaEmision = activeItinerario?.iti_fecha_creacion;
        let resolvedFechaViaje = activeItinerario?.iti_fecha_creacion?.split('T')[0] || new Date().toISOString().split('T')[0];
        if (activeItinerario?.iti_notas) {
          try {
            const parsedNotes = JSON.parse(activeItinerario.iti_notas);
            if (parsedNotes.fechaViaje) {
              resolvedFechaViaje = parsedNotes.fechaViaje;
            }
          } catch {
            if (/^\d{4}-\d{2}-\d{2}$/.test(activeItinerario.iti_notas.trim())) {
              resolvedFechaViaje = activeItinerario.iti_notas.trim();
            }
          }
        }

        return (
          <ConsolidatedTouristReport
            codigoItinerario={activeItinerario?.iti_codigo || 'TRAIN-8924'}
            fechaEmision={resolvedFechaEmision}
            fechaViaje={resolvedFechaViaje}
            usuarioNombre={activeItinerario?.iti_usuario_nombre || 'Turista Nacional / Internacional'}
            usuarioEmail={activeItinerario?.iti_usuario_email}
            estacionOrigen={estacionOrigen}
            estacionDestino={estacionDestino}
            zonaTuristica={zonaTuristica}
            horarioIda={horarioIda}
            horarioRetorno={horarioRetorno}
            climaSenamhi={climaSenamhi}
            preferenciasSeleccionadas={activeItinerario?.iti_preferencias_seleccionadas || ['naturaleza']}
          />
        );
      })()}
    </div>
  );
}

export default function InformePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando Informe...</div>}>
      <InformeContent />
    </Suspense>
  );
}
