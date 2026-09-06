import { NextResponse } from 'next/server';
import { INITIAL_ESTACIONES } from '@/lib/db/initial-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    fuente: 'PeruRail / MTC',
    data: INITIAL_ESTACIONES,
    total: INITIAL_ESTACIONES.length,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }
  });
}
