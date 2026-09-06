import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Zonas Turísticas & Rutas Ferroviarias | Asesor a Pie',
  description: 'Sistema asesor de rutas turísticas peatonales de ida y vuelta desde estaciones ferroviarias integrando pronósticos de clima, horarios y catálogo turístico.',
  keywords: ['Turismo', 'PeruRail', 'SENAMHI', 'Machu Picchu', 'Cusco', 'Ollantaytambo', 'Trenes', 'Caminata'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-red-600 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
