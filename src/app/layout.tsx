import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'MTC - Zonas Turísticas | Rutas a Pie desde Estaciones Ferroviarias',
  description: 'Plataforma del Ministerio de Transportes y Comunicaciones (MTC) que integra SENAMHI, PeruRail y Travel Group Perú para fomentar el transporte ferroviario y turismo local a pie.',
  keywords: ['MTC', 'Turismo Peru', 'PeruRail', 'SENAMHI', 'Travel Group Peru', 'Machu Picchu', 'Cusco', 'Tren', 'Caminata'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-red-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
