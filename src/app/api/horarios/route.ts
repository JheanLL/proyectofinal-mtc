import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_HORARIOS_TREN } from '@/lib/db/initial-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origen = searchParams.get('origen');
  const destino = searchParams.get('destino');

  let result = INITIAL_HORARIOS_TREN;

  if (origen && destino) {
    result = result.filter(
      h => h.hor_estacion_origen_id === origen && h.hor_estacion_destino_id === destino
    );
  } else if (origen) {
    result = result.filter(h => h.hor_estacion_origen_id === origen);
  }

  return NextResponse.json({
    success: true,
    fuente: 'PeruRail',
    data: result,
    total: result.length,
  });
}
