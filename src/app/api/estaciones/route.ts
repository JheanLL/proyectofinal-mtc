import { NextResponse } from 'next/server';
import { INITIAL_ESTACIONES } from '@/lib/db/initial-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    fuente: 'PeruRail / MTC',
    data: INITIAL_ESTACIONES,
    total: INITIAL_ESTACIONES.length,
  });
}
