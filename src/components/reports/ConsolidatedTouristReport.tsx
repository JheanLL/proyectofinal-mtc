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
  codigoItinerario = 'MTC-TRAIN-8924',
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
      // Trigger festive celebration
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
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Informe_Turistico_MTC_${codigoItinerario}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Se generó la vista de impresión lista para guardar.');
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <span>Informe Consolidado Listo</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
            {codigoItinerario}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Informe PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div
        ref={reportRef}
        id="printable-report"
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto text-slate-800"
      >
        {/* Official Header */}
        <div className="border-b-2 border-red-700 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <Train className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-red-700 font-black text-xl tracking-tight">MTC</span>
                  <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded font-bold uppercase">
                    Caso de Estudio
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  INFORME TURÍSTICO CONSOLIDADO
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Ruta Ferroviaria & Circuito Peatonal Exclusivo de Ida y Vuelta
                </p>
              </div>
            </div>

            {/* Verification Code Box */}
            <div className="sm:text-right bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">CÓDIGO DE ITINERARIO</div>
              <div className="text-base font-black font-mono text-red-700 tracking-wider">
                {codigoItinerario}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Emitido: {new Date().toLocaleDateString('es-PE')}
              </div>
            </div>
          </div>

          {/* Institutional Partner Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-[10px] font-semibold text-slate-600">
            <div className="bg-blue-50/80 py-1.5 px-2 rounded-lg border border-blue-200 text-blue-900">
              ☀️ <strong>SENAMHI</strong> (Clima Verificado)
            </div>
            <div className="bg-red-50/80 py-1.5 px-2 rounded-lg border border-red-200 text-red-900">
              🚆 <strong>PeruRail</strong> (Logística Ferroviaria)
            </div>
            <div className="bg-emerald-50/80 py-1.5 px-2 rounded-lg border border-emerald-200 text-emerald-900">
              🚶 <strong>Travel Group Perú</strong> (Rutas a Pie)
            </div>
          </div>
        </div>

        {/* 1. Trip Summary & Passenger Details */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-red-700" />
            1. Datos del Viaje y Titular
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Titular del Viaje:</span>
              <span className="font-bold text-slate-900 text-sm">{usuarioNombre}</span>
              {usuarioEmail && <span className="text-slate-500 block">{usuarioEmail}</span>}
            </div>
            <div>
              <span className="text-slate-500 block">Fecha Programada:</span>
              <span className="font-bold text-slate-900 text-sm">{formatDateSpanish(fechaViaje)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Modelo Operativo:</span>
              <span className="inline-block bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[11px] mt-0.5">
                Trayecto Único Ida y Vuelta a Pie
              </span>
            </div>
          </div>
        </div>

        {/* 2. Rail Transport Logistics (PeruRail) */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Train className="w-4 h-4 text-red-700" />
              2. Logística Ferroviaria (PeruRail)
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Billetes y Horarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Outbound Train */}
            <div className="bg-red-50/50 border border-red-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 uppercase">🚆 Tren de Ida</span>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-red-200 text-red-700">
                  {horarioIda.hor_servicio_tipo} • {horarioIda.hor_codigo_tren}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Origen:</span>
                  <span className="font-bold text-slate-900">{estacionOrigen.est_nombre}</span>
                  <span className="text-red-700 font-extrabold text-sm block">{horarioIda.hor_hora_salida}</span>
                </div>
                <div className="text-center px-2">
                  <span className="text-[10px] text-slate-500 block">{formatDurationMin(horarioIda.hor_duracion_min)}</span>
                  <span className="text-slate-300">➔</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Llegada:</span>
                  <span className="font-bold text-slate-900">{estacionDestino.est_nombre}</span>
                  <span className="text-slate-800 font-bold text-sm block">{horarioIda.hor_hora_llegada}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-red-100 flex justify-between">
                <span>Tarifa Regular:</span>
                <span className="font-bold text-slate-900">{formatCurrencyPEN(horarioIda.hor_tarifa_regular_pen)}</span>
              </div>
            </div>

            {/* Return Train */}
            <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 uppercase">🚆 Tren de Retorno</span>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-sky-200 text-sky-800">
                  {horarioRetorno.hor_servicio_tipo} • {horarioRetorno.hor_codigo_tren}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Embarque:</span>
                  <span className="font-bold text-slate-900">{estacionDestino.est_nombre}</span>
                  <span className="text-sky-800 font-extrabold text-sm block">{horarioRetorno.hor_hora_salida}</span>
                </div>
                <div className="text-center px-2">
                  <span className="text-[10px] text-slate-500 block">{formatDurationMin(horarioRetorno.hor_duracion_min)}</span>
                  <span className="text-slate-300">➔</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Destino Final:</span>
                  <span className="font-bold text-slate-900">{estacionOrigen.est_nombre}</span>
                  <span className="text-slate-800 font-bold text-sm block">{horarioRetorno.hor_hora_llegada}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-sky-100 flex justify-between">
                <span>Tarifa Regular:</span>
                <span className="font-bold text-slate-900">{formatCurrencyPEN(horarioRetorno.hor_tarifa_regular_pen)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SENAMHI Meteorological Forecast */}
        <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-blue-700" />
              3. Previsiones Climatológicas (SENAMHI)
            </h2>
            <span className="text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded font-bold">
              Alerta {climaSenamhi.cli_alerta_meteorologica.nivel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center mb-3">
            <div className="bg-white p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Condición</span>
              <span className="font-bold text-slate-900">{climaSenamhi.cli_condicion_cielo}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Temperatura</span>
              <span className="font-bold text-slate-900">{climaSenamhi.cli_temp_actual_c}°C ({climaSenamhi.cli_temp_min_c}° / {climaSenamhi.cli_temp_max_c}°C)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Prob. Lluvia</span>
              <span className="font-bold text-blue-700">{climaSenamhi.cli_prob_lluvia_pct}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Índice UV</span>
              <span className="font-bold text-amber-700">{climaSenamhi.cli_indice_uv} (Extremo)</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-100 text-xs space-y-1">
            <p className="font-semibold text-blue-950">
              📢 Aviso Oficial: {climaSenamhi.cli_alerta_meteorologica.mensaje}
            </p>
            <p className="text-slate-600 text-[11px]">
              👕 Indumentaria recomendada para la caminata: {climaSenamhi.cli_recomendacion_ropa.join(', ')}.
            </p>
          </div>
        </div>

        {/* 4. Travel Group Walking Tour (Exclusive Footpaths) */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-700" />
              4. Circuito Turístico a Pie (Travel Group Perú)
            </h2>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Dificultad: {zonaTuristica.zon_dificultad}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{zonaTuristica.zon_nombre}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{zonaTuristica.zon_descripcion}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500 block">Entrada al Atractivo:</span>
                  <span className="text-base font-bold text-emerald-700">
                    {zonaTuristica.zon_precio_entrada_pen === 0 ? 'Acceso Libre' : formatCurrencyPEN(zonaTuristica.zon_precio_entrada_pen)}
                  </span>
                </div>
              </div>

              {/* Pedestrian metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Tramo de Ida a Pie</span>
                  <span className="font-bold text-slate-800">{formatDistance(zonaTuristica.zon_distancia_metros)} (~{formatDurationMin(zonaTuristica.zon_tiempo_caminata_min)})</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Ida y Vuelta Total</span>
                  <span className="font-bold text-emerald-800">{formatDistance(distanciaTotalCaminata)} (~{formatDurationMin(tiempoTotalCaminata)})</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Desnivel Acumulado</span>
                  <span className="font-bold text-slate-800">+{zonaTuristica.zon_desnivel_metros} m</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Horario de Atención</span>
                  <span className="font-bold text-slate-800 text-[11px]">{zonaTuristica.zon_horario_atencion}</span>
                </div>
              </div>
            </div>

            {/* Waypoints */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-100 text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                📍 Puntos de Interés durante el recorrido peatonal:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {zonaTuristica.zon_puntos_interes.map((p, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Cost Breakdown and Budget Consolidation */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            5. Presupuesto Consolidado de la Visita
          </h2>

          <div className="space-y-2 text-xs divide-y divide-slate-800">
            <div className="flex justify-between py-1 text-slate-300">
              <span>Billetes de Tren PeruRail (Ida + Retorno):</span>
              <span className="font-semibold">{formatCurrencyPEN(costoTotalTrenPEN)} ({formatCurrencyUSD(costoTotalTrenUSD)})</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Entrada a {zonaTuristica.zon_nombre}:</span>
              <span className="font-semibold">{formatCurrencyPEN(zonaTuristica.zon_precio_entrada_pen)}</span>
            </div>
            <div className="flex justify-between py-2 text-base font-extrabold text-white">
              <span className="text-emerald-400">Presupuesto Estimado Total:</span>
              <span className="text-emerald-400">{formatCurrencyPEN(costoTotalPEN)}</span>
            </div>
          </div>
        </div>

        {/* Academic Seal Footer */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Prototipo de Software Académico generado para el caso 'Zonas Turísticas MTC' (Ingeniería de Sistemas).</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            PROYECTO: MTC-TRAIN-{codigoItinerario}
          </div>
        </div>
      </div>
    </div>
  );
}
