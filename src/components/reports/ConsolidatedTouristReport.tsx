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
  ShieldCheck,
  Copy,
  Check,
  X,
  ExternalLink,
  Database,
  BookOpen,
  Lock,
  Globe
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Calculations
  const distanciaTotalCaminata = zonaTuristica.zon_distancia_metros * 2;
  const tiempoTotalCaminata = zonaTuristica.zon_tiempo_caminata_min * 2;
  const costoTotalTrenPEN = horarioIda.hor_tarifa_regular_pen + horarioRetorno.hor_tarifa_regular_pen;
  const costoTotalTrenUSD = horarioIda.hor_tarifa_turista_usd + horarioRetorno.hor_tarifa_turista_usd;
  const costoTotalPEN = costoTotalTrenPEN + zonaTuristica.zon_precio_entrada_pen;

  // URL universal no adivinable
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/informe?codigo=${encodeURIComponent(codigoItinerario)}`
    : `https://turismo-mtc.pe/informe?codigo=${codigoItinerario}`;

  // Resumen estructurado para mensajería
  const shareSummaryText = `🚆 *INFORME TURÍSTICO CONSOLIDADO - MTC & PERURAIL*
📍 *Ruta:* ${estacionOrigen.est_nombre} ➔ ${estacionDestino.est_nombre}
👟 *Circuito a Pie:* ${zonaTuristica.zon_nombre} (${distanciaTotalCaminata} m ida y vuelta)
🕒 *Trenes:* Ida ${horarioIda.hor_hora_salida} | Retorno ${horarioRetorno.hor_hora_salida}
🌤️ *Clima SENAMHI:* ${climaSenamhi.cli_temp_actual_c}°C (${climaSenamhi.cli_condicion_cielo})
💰 *Presupuesto Estimado:* S/ ${costoTotalPEN.toFixed(2)}
📋 *Código de Validación:* ${codigoItinerario}

🔗 *Ver informe completo y mapa interactivo:*
${shareUrl}`;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Informe Turístico MTC - ${codigoItinerario}`,
          text: shareSummaryText,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share cancelado o no soportado:', e);
      }
    } else {
      handleCopyLink();
    }
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
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl transition-all shadow-2xs border border-red-200 dark:border-red-900/60 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Compartir en Redes</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}</span>
          </button>
        </div>
      </div>

      {/* MODAL DE COMPARTIR INTERACTIVO (REDES, ENLACE Y ARCHIVO) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 print:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            {/* Header Modal */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 text-[11px] font-bold">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir Informe Consolidado</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Difunde tu Itinerario Turístico
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enlace universal seguro sincronizado con Aiven MySQL. Accesible desde cualquier PC o celular sin necesidad de cuenta.
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input con enlace directo y botón de copiar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Enlace Directo No Adivinable:</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Token Seguro 64-bit
                </span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-mono flex-1 outline-none truncate select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Redes Sociales con Iconos Oficiales */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Enviar Directamente a Redes Sociales:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareSummaryText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 font-bold transition-all shadow-2xs group"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.134 8.134 0 0 1-1.25-4.39c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.78 2.39 1.54 1.54 2.4 3.6 2.4 5.79 0 4.51-3.67 8.2-8.18 8.2zm4.51-6.14c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.28z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Informe Turístico MTC: ${estacionOrigen.est_nombre} a ${estacionDestino.est_nombre} (${zonaTuristica.zon_nombre})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 font-bold transition-all shadow-2xs group"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span>Telegram</span>
                </a>

                {/* X (Twitter) */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Informe turístico consolidado MTC: ${zonaTuristica.zon_nombre}. Rutas ferroviarias con PeruRail y clima SENAMHI.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold transition-all shadow-2xs group"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter)</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 font-bold transition-all shadow-2xs group"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* Correo Electrónico */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Informe Turístico Consolidado MTC - ${codigoItinerario}`)}&body=${encodeURIComponent(shareSummaryText)}`}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EA4335]/10 hover:bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30 font-bold transition-all shadow-2xs group col-span-2 sm:col-span-2"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>Enviar por Correo (Email)</span>
                </a>
              </div>
            </div>

            {/* Acciones para Celular / Hoja Nativa */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleNativeShare}
                className="w-full sm:w-auto flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir con el Celular (Android / iOS)</span>
              </button>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* 6. Trazabilidad de Requerimientos & Arquitectura Aiven MySQL (HU, RF y DB) */}
        <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-3xl p-5 sm:p-6 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-700 dark:text-red-400" />
              6. Trazabilidad de Requerimientos del Software (HU, RF y Aiven MySQL)
            </h2>
            <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 self-start sm:self-auto">
              <Check className="w-3 h-3 stroke-[3]" /> Conforme a Estándares MTC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* HU-08 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-red-700 dark:text-red-400 font-mono">HU-08</span>
                <span className="text-[10px] font-bold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                  Historia de Usuario
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">
                Compartir con URL Segura No Adivinable
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Como:</strong> Turista sin cuenta o Administrador MTC.<br/>
                <strong>Quiero:</strong> Compartir mi informe consolidado mediante un enlace protegido no adivinable y accesos a WhatsApp, Telegram, X y Correo.<br/>
                <strong>Para:</strong> Que cualquier acompañante lo abra en PC o móvil sin registrarse.
              </p>
            </div>

            {/* RF-09 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono">RF-09</span>
                <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                  Requerimiento Funcional
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">
                Persistencia Cloud en Aiven MySQL
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                El sistema almacena el informe en <code>tbl_itinerario_consulta</code> de Aiven con un identificador de alta entropía (64 bits, <code>MTC-hex</code>) previniendo ataques de enumeración y asegurando disponibilidad en la nube.
              </p>
            </div>

            {/* RF-10 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-700 dark:text-blue-400 font-mono">RF-10</span>
                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  Requerimiento Funcional
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">
                Compartición Multicanal & OpenGraph
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                El sistema provee integración con Web Share API (móviles), Web WhatsApp/Telegram, copiado rápido al portapapeles y metadatos OpenGraph (1200x630) para previsualizaciones vistosas en redes sociales.
              </p>
            </div>
          </div>

          {/* Database Spec Summary */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Database className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Esquema de Base de Datos Cloud: <code className="text-red-700 dark:text-red-400 font-mono">tbl_itinerario_consulta</code> (Aiven MySQL)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div><strong>iti_codigo:</strong> Token VARCHAR(64) UNIQUE</div>
              <div><strong>iti_id:</strong> VARCHAR(50) PRIMARY KEY</div>
              <div><strong>Almacenamiento:</strong> Aiven MySQL + LocalStorage</div>
              <div><strong>Seguridad:</strong> Token No Enumerable (64-bit Hex)</div>
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
            PROYECTO: {codigoItinerario}
          </div>
        </div>
      </div>
    </div>
  );
}
