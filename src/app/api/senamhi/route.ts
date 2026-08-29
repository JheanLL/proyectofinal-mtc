import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRONOSTICOS_CLIMA } from '@/lib/db/initial-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const estacionId = searchParams.get('estacionId');

  if (estacionId && INITIAL_PRONOSTICOS_CLIMA[estacionId]) {
    return NextResponse.json({
      success: true,
      fuente: 'SENAMHI',
      data: INITIAL_PRONOSTICOS_CLIMA[estacionId],
    });
  }

  return NextResponse.json({
    success: true,
    fuente: 'SENAMHI',
    data: INITIAL_PRONOSTICOS_CLIMA,
  });
}
