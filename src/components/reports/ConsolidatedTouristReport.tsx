'use client';

import React, { useRef, useState } from 'react';
import { 
  TblEstacion, 
  TblZonaTuristica, 
  TblHorarioTren, 
  TblPronosticoClima, 
  CategoriaTuristica 
} from '@/types/database';
import { 
  Train, 
  CloudSun, 
  Footprints, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  MapPin, 
  Navigation, 
  Calendar,
  AlertCircle,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { 
  formatCurrencyPEN, 
  formatCurrencyUSD, 
  formatDistance, 
  formatDurationMin, 
  formatDateSpanish 
} from '@/lib/utils';
import confetti from 'canvas-confetti';

interface ConsolidatedTouristReportProps {
  codigoItinerario?: string;
  fechaViaje?: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  estacionOrigen: TblEstacion;
  estacionDestino: TblEstacion;
  zonaTuristica: TblZonaTuristica;
  horarioIda: TblHorarioTren;
  horarioRetorno: TblHorarioTren;
  climaSenamhi: TblPronosticoClima;
  preferenciasSeleccionadas?: CategoriaTuristica[];
}

export default function ConsolidatedTouristReport({
  codigoItinerario = 'TRAIN-8924',
  fechaViaje = new Date().toISOString().split('T')[0],
  usuarioNombre = 'Turista Nacional / Internacional',
  usuarioEmail,
  estacionOrigen,
  estacionDestino,
  zonaTuristica,
  horarioIda,
  horarioRetorno,
  climaSenamhi,
  preferenciasSeleccionadas = [],
}: ConsolidatedTouristReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculations
  const distanciaTotalCaminata = zonaTuristica.zon_distancia_metros * 2;
  const tiempoTotalCaminata = zonaTuristica.zon_tiempo_caminata_min * 2;
  const costoTotalTrenPEN = horarioIda.hor_tarifa_regular_pen + horarioRetorno.hor_tarifa_regular_pen;
  const costoTotalTrenUSD = horarioIda.hor_tarifa_turista_usd + horarioRetorno.hor_tarifa_turista_usd;
  const costoTotalPEN = costoTotalTrenPEN + zonaTuristica.zon_precio_entrada_pen;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Download Handler using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`INFORME_TURISTICO_${codigoItinerario}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden transition-colors">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base">
          <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Informe Consolidado Listo</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-xl font-mono font-bold border border-slate-200 dark:border-slate-700">
            {codigoItinerario}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition-all shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet: Spacious and Accessible in Light/Dark */}
      <div
        ref={reportRef}
        id="printable-report"
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto text-slate-900 dark:text-slate-100 transition-colors"
      >
        {/* Official Header */}
        <div className="border-b-2 border-red-700 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <Train className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs bg-slate-900 dark:bg-slate-800 text-white px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Caso de Estudio
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  INFORME TURÍSTICO CONSOLIDADO
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Ruta Ferroviaria & Circuito Peatonal Exclusivo de Ida y Vuelta
                </p>
              </div>
            </div>

            {/* Verification Code Box */}
            <div className="sm:text-right bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">CÓDIGO DE ITINERARIO</div>
              <div className="text-lg font-black font-mono text-red-700 dark:text-red-400 tracking-wider mt-0.5">
                {codigoItinerario}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Emitido: {new Date().toLocaleDateString('es-PE')}
              </div>
            </div>
          </div>

          {/* Institutional Partner Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-bold">
            <div className="bg-blue-50 dark:bg-blue-950/40 py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
              ☀️ <strong>SENAMHI</strong> (Clima Verificado)
            </div>
            <div className="bg-red-50 dark:bg-red-950/40 py-2 px-3 rounded-xl border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200">
              🚆 <strong>PeruRail</strong> (Logística Ferroviaria)
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 py-2 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
              🚶 <strong>Travel Group Perú</strong> (Rutas a Pie)
            </div>
          </div>
        </div>

        {/* 1. Trip Summary & Passenger Details */}
        <div className="bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 mb-8 space-y-4">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-700 dark:text-red-400" />
            1. Datos del Viaje y Titular
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-xs">Titular del Viaje:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5 block">{usuarioNombre}</span>
              {usuarioEmail && <span className="text-slate-600 dark:text-slate-300 text-xs block">{usuarioEmail}</span>}
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-xs">Fecha Programada:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5 block">{formatDateSpanish(fechaViaje)}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-xs">Modalidad de Circuito:</span>
              <span className="inline-block bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-200 font-bold px-3 py-1 rounded-xl text-xs mt-1 border border-red-200 dark:border-red-900">
                Trayecto Único Ida y Vuelta a Pie
              </span>
            </div>
          </div>
        </div>

        {/* 2. Rail Transport Logistics (PeruRail) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Train className="w-4 h-4 text-red-700 dark:text-red-400" />
              2. Logística Ferroviaria (PeruRail)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Billetes y Horarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Outbound Train */}
            <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-800 dark:text-red-300 uppercase">🚆 Tren de Ida</span>
                <span className="text-xs font-bold bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                  {horarioIda.hor_servicio_tipo} • #{horarioIda.hor_codigo_tren}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Salida:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{estacionOrigen.est_nombre}</span>
                  <span className="text-red-700 dark:text-red-400 font-black text-base sm:text-lg block">{horarioIda.hor_hora_salida}</span>
                </div>
                <div className="text-center px-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">{formatDurationMin(horarioIda.hor_duracion_min)}</span>
                  <span className="text-slate-400">➔</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Llegada:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{estacionDestino.est_nombre}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-black text-base sm:text-lg block">{horarioIda.hor_hora_llegada}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-red-100 dark:border-red-900/40 flex justify-between font-semibold">
                <span>Tarifa Billete Regular:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrencyPEN(horarioIda.hor_tarifa_regular_pen)}</span>
              </div>
            </div>

            {/* Return Train */}
            <div className="bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-900 dark:text-sky-300 uppercase">🚆 Tren de Retorno</span>
                <span className="text-xs font-bold bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300">
                  {horarioRetorno.hor_servicio_tipo} • #{horarioRetorno.hor_codigo_tren}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Embarque Retorno:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{estacionDestino.est_nombre}</span>
                  <span className="text-sky-700 dark:text-sky-400 font-black text-base sm:text-lg block">{horarioRetorno.hor_hora_salida}</span>
                </div>
                <div className="text-center px-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">{formatDurationMin(horarioRetorno.hor_duracion_min)}</span>
                  <span className="text-slate-400">➔</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Destino Final:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{estacionOrigen.est_nombre}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-black text-base sm:text-lg block">{horarioRetorno.hor_hora_llegada}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-sky-100 dark:border-sky-900/40 flex justify-between font-semibold">
                <span>Tarifa Billete Regular:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrencyPEN(horarioRetorno.hor_tarifa_regular_pen)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SENAMHI Meteorological Forecast */}
        <div className="border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 rounded-3xl p-5 sm:p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-3">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-950 dark:text-blue-200 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              3. Previsiones Climatológicas (SENAMHI)
            </h2>
            <span className="text-xs bg-blue-200 dark:bg-blue-900 text-blue-950 dark:text-blue-100 px-3 py-1 rounded-lg font-bold">
              Alerta {climaSenamhi.cli_alerta_meteorologica.nivel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-center">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Condición</span>
              <span className="font-black text-slate-900 dark:text-white mt-0.5 block">{climaSenamhi.cli_condicion_cielo}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Temperatura</span>
              <span className="font-black text-slate-900 dark:text-white mt-0.5 block">{climaSenamhi.cli_temp_actual_c}°C</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Prob. Lluvia</span>
              <span className="font-black text-blue-700 dark:text-blue-400 mt-0.5 block">{climaSenamhi.cli_prob_lluvia_pct}%</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Índice UV</span>
              <span className="font-black text-amber-700 dark:text-amber-300 mt-0.5 block">{climaSenamhi.cli_indice_uv}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-100 dark:border-slate-800 text-xs space-y-1.5">
            <p className="font-extrabold text-blue-950 dark:text-blue-200">
              📢 Aviso Preventivo: {climaSenamhi.cli_alerta_meteorologica.mensaje}
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              👕 Indumentaria recomendada: {climaSenamhi.cli_recomendacion_ropa.join(', ')}.
            </p>
          </div>
        </div>

        {/* 4. Travel Group Walking Tour (Exclusive Footpaths) */}
        <div className="border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-3xl p-5 sm:p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              4. Circuito Turístico a Pie (Travel Group Perú)
            </h2>
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900 px-3 py-1 rounded-full">
              Dificultad: {zonaTuristica.zon_dificultad}
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{zonaTuristica.zon_nombre}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{zonaTuristica.zon_descripcion}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Entrada:</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {zonaTuristica.zon_precio_entrada_pen === 0 ? 'Acceso Libre' : formatCurrencyPEN(zonaTuristica.zon_precio_entrada_pen)}
                  </span>
                </div>
              </div>

              {/* Pedestrian metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Tramo de Ida a Pie</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">{formatDistance(zonaTuristica.zon_distancia_metros)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Ida y Vuelta Total</span>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm">{formatDistance(distanciaTotalCaminata)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Desnivel Acumulado</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">+{zonaTuristica.zon_desnivel_metros} m</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Horario de Atención</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">{zonaTuristica.zon_horario_atencion}</span>
                </div>
              </div>
            </div>

            {/* Waypoints */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                📍 Puntos de Interés durante el recorrido peatonal:
              </span>
              <div className="flex flex-wrap gap-2">
                {zonaTuristica.zon_puntos_interes.map((p, i) => (
                  <span key={i} className="bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 font-semibold">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Cost Breakdown and Budget Consolidation */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 mb-8 space-y-4">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            5. Presupuesto Consolidado de la Visita
          </h2>

          <div className="space-y-3 text-xs sm:text-sm divide-y divide-slate-800">
            <div className="flex justify-between py-1 text-slate-300">
              <span>Billetes de Tren PeruRail (Ida + Retorno):</span>
              <span className="font-bold text-white">{formatCurrencyPEN(costoTotalTrenPEN)} ({formatCurrencyUSD(costoTotalTrenUSD)})</span>
            </div>
            <div className="flex justify-between py-2 text-slate-300">
              <span>Entrada a {zonaTuristica.zon_nombre}:</span>
              <span className="font-bold text-white">{formatCurrencyPEN(zonaTuristica.zon_precio_entrada_pen)}</span>
            </div>
            <div className="flex justify-between py-3 text-base sm:text-lg font-black text-white">
              <span className="text-emerald-400">Presupuesto Estimado Total:</span>
              <span className="text-emerald-400">{formatCurrencyPEN(costoTotalPEN)}</span>
            </div>
          </div>
        </div>

        {/* Academic Seal Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Prototipo de Software Académico generado para el caso 'Zonas Turísticas MTC' (Ingeniería de Sistemas).</span>
          </div>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
            PROYECTO: TRAIN-{codigoItinerario}
          </div>
        </div>
      </div>
    </div>
  );
}
