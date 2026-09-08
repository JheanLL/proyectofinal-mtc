import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveWeatherForStation, fetchAllLiveWeathers } from '@/lib/weather';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const estacionId = searchParams.get('estacionId');
  const isRefresh = searchParams.get('refresh') === 'true' || searchParams.has('t');

  const headers = {
    'Cache-Control': isRefresh 
      ? 'no-store, no-cache, must-revalidate' 
      : 'public, s-maxage=300, stale-while-revalidate=60',
  };

  if (estacionId) {
    const liveWeather = await fetchLiveWeatherForStation(estacionId, isRefresh);
    if (liveWeather) {
      return NextResponse.json({
        success: true,
        fuente: 'SENAMHI / Red Meteorológica',
        data: liveWeather,
        timestamp: new Date().toISOString(),
      }, { headers });
    }
    return NextResponse.json(
      { success: false, error: 'Estación no encontrada' },
      { status: 404, headers }
    );
  }

  // Fetch all stations using shared weather logic
  const weatherMap = await fetchAllLiveWeathers(isRefresh);

  return NextResponse.json({
    success: true,
    fuente: 'SENAMHI / Red Meteorológica',
    data: weatherMap,
    timestamp: new Date().toISOString(),
  }, { headers });
}
