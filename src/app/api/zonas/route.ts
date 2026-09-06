import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ZONAS_TURISTICAS } from '@/lib/db/initial-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const estacionId = searchParams.get('estacionId');
  const categoria = searchParams.get('categoria');

  let result = INITIAL_ZONAS_TURISTICAS;

  if (estacionId) {
    result = result.filter(z => z.zon_estacion_id === estacionId);
  }

  if (categoria) {
    result = result.filter(z => z.zon_categoria === categoria);
  }

  return NextResponse.json({
    success: true,
    fuente: 'Travel Group Perú',
    data: result,
    total: result.length,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }
  });
}
