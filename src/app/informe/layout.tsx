import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informe Turístico Consolidado | MTC Perú - PeruRail & SENAMHI',
  description: 'Consulta oficial de itinerarios turísticos ferroviarios y circuitos peatonales a pie en el Perú. Previsiones climatológicas SENAMHI, frecuencias de trenes PeruRail y desglose presupuestal.',
  keywords: ['MTC', 'PeruRail', 'SENAMHI', 'Turismo Perú', 'Cusco', 'Machu Picchu', 'Ollantaytambo', 'Itinerario a pie'],
  authors: [{ name: 'Ministerio de Transportes y Comunicaciones (MTC)' }],
  openGraph: {
    title: 'Informe Turístico Consolidado | MTC & PeruRail',
    description: 'Ruta Ferroviaria & Circuito Peatonal a Pie con Clima SENAMHI en tiempo real y cálculo presupuestal.',
    url: 'https://turismo-mtc.pe/informe',
    siteName: 'Plataforma Oficial de Rutas Turísticas MTC',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Informe Turístico Consolidado | MTC & PeruRail',
    description: 'Itinerario oficial de viaje ferroviario y circuito a pie con previsiones de SENAMHI.',
  },
};

export default function InformeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
