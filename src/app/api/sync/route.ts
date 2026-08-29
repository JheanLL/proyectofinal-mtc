import { NextResponse } from 'next/server';
import { INITIAL_INTEGRACIONES } from '@/lib/db/initial-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_INTEGRACIONES,
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  const updated = INITIAL_INTEGRACIONES.map(item => ({
    ...item,
    int_estado: 'Sincronizado' as const,
    int_ultima_sincronizacion: `Hoy a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Recarga API)`,
    int_latencia_ms: Math.floor(75 + Math.random() * 110),
  }));

  return NextResponse.json({
    success: true,
    mensaje: 'Sincronización de flujos periódicos de SENAMHI, PeruRail y Travel Group Perú completada exitosamente.',
    data: updated,
  });
}
