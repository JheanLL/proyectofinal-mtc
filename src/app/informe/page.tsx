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
  TblPronosticoClima 
} from '@/types/database';
import { 
  FileText, 
  Search, 
  Sparkles, 
  Calendar, 
  Train, 
  Footprints, 
  ArrowRight, 
  Download, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import ConsolidatedTouristReport from '@/components/reports/ConsolidatedTouristReport';
import { formatCurrencyPEN, formatDistance, formatDurationMin, formatDateSpanish } from '@/lib/utils';

function InformeContent() {
  const searchParams = useSearchParams();
  const [itinerarios, setItinerarios] = useState<TblItinerarioConsulta[]>([]);
  const [estaciones, setEstaciones] = useState<TblEstacion[]>([]);
  const [zonas, setZonas] = useState<TblZonaTuristica[]>([]);
  const [horarios, setHorarios] = useState<TblHorarioTren[]>([]);

  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [activeItinerario, setActiveItinerario] = useState<TblItinerarioConsulta | null>(null);

  useEffect(() => {
    const loadedIti = getItinerarios();
    const loadedEst = getEstaciones();
    const loadedZon = getZonasTuristicas();
    const loadedHor = getHorariosTren();

    setItinerarios(loadedIti);
    setEstaciones(loadedEst);
    setZonas(loadedZon);
    setHorarios(loadedHor);

    const qCodigo = searchParams.get('codigo');
    if (qCodigo) {
      const found = loadedIti.find(i => i.iti_codigo.toLowerCase() === qCodigo.toLowerCase() || i.iti_id === qCodigo);
      if (found) {
        setActiveItinerario(found);
        setCodigoBusqueda(found.iti_codigo);
      }
    } else if (loadedIti.length > 0) {
      setActiveItinerario(loadedIti[0]);
    }
  }, [searchParams]);

  const handleSearchCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;
    const found = getItinerarioByCodigo(codigoBusqueda.trim());
    if (found) {
      setActiveItinerario(found);
    } else {
      alert(`No se encontró un itinerario con el código "${codigoBusqueda}".`);
    }
  };

  // If we have an active itinerary, resolve related entities
  const estacionOrigen = activeItinerario ? estaciones.find(e => e.est_id === activeItinerario.iti_estacion_origen_id) || estaciones[0] : estaciones[0];
  const estacionDestino = activeItinerario ? estaciones.find(e => e.est_id === activeItinerario.iti_estacion_destino_id) || estaciones[1] : estaciones[1];
  const zonaTuristica = activeItinerario ? zonas.find(z => z.zon_id === activeItinerario.iti_zona_turistica_id) || zonas[0] : zonas[0];
  const horarioIda = activeItinerario ? horarios.find(h => h.hor_id === activeItinerario.iti_horario_ida_id) || horarios[0] : horarios[0];
  const horarioRetorno = activeItinerario ? horarios.find(h => h.hor_id === activeItinerario.iti_horario_retorno_id) || horarios[1] : horarios[1];
  const climaSenamhi = estacionDestino ? getClimaByEstacion(estacionDestino.est_id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Módulo de Informes Consolidados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Consultas e Informes Turísticos Consolidados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Visualiza, descarga en PDF o imprime tus informes de visita generados con datos climáticos y ferroviarios actualizados.
          </p>
        </div>

        <Link
          href="/planificador"
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar Nuevo Informe</span>
        </Link>
      </div>

      {/* Lookup Bar & Recent Queries (Hidden on print) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 print:hidden">
        <form onSubmit={handleSearchCodigo} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder="Buscar por código de itinerario (Ej: MTC-TRAIN-8924)..."
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Buscar Informe
          </button>
        </form>

        {/* Recent Itineraries pill list */}
        {itinerarios.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Historial reciente:</span>
            {itinerarios.map((it) => (
              <button
                key={it.iti_id}
                onClick={() => {
                  setActiveItinerario(it);
                  setCodigoBusqueda(it.iti_codigo);
                }}
                className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all ${
                  activeItinerario?.iti_id === it.iti_id
                    ? 'bg-red-700 text-white border-red-700 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {it.iti_codigo}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Report Display */}
      {zonaTuristica && horarioIda && horarioRetorno && climaSenamhi ? (
        <ConsolidatedTouristReport
          codigoItinerario={activeItinerario?.iti_codigo || 'MTC-TRAIN-8924'}
          fechaViaje={activeItinerario?.iti_fecha_creacion?.split('T')[0] || new Date().toISOString().split('T')[0]}
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
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No hay informes seleccionados</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Utiliza el planificador asistido para configurar tus preferencias y generar tu primer informe consolidado en PDF.
          </p>
          <Link
            href="/planificador"
            className="inline-flex items-center gap-2 bg-red-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ir al Planificador</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function InformePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando Informe MTC...</div>}>
      <InformeContent />
    </Suspense>
  );
}
