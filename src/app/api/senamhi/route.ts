import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveWeatherForStation, fetchAllLiveWeathers, getWeatherFromDatabase } from '@/lib/weather';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const estacionId = searchParams.get('estacionId');
  const isRefresh = searchParams.get('refresh') === 'true';

  const headers = {
    'Cache-Control': isRefresh 
      ? 'no-store, no-cache, must-revalidate' 
      : 'public, s-maxage=300, stale-while-revalidate=60',
  };

  // 1. Si no es un refresco forzado del usuario, consultar primero la base de datos relacional (Aiven MySQL)
  if (!isRefresh) {
    const dbWeather = await getWeatherFromDatabase(estacionId || undefined);
    if (dbWeather) {
      return NextResponse.json({
        success: true,
        fuente: 'Aiven MySQL (tbl_pronostico_clima)',
        data: dbWeather,
        timestamp: new Date().toISOString(),
      }, { headers });
    }
  }

  // 2. Si el usuario solicitó refresco manual ("Consultar API") o no hay registros en la BD:
  if (estacionId) {
    const liveWeather = await fetchLiveWeatherForStation(estacionId, isRefresh);
    if (liveWeather) {
      return NextResponse.json({
        success: true,
        fuente: 'Open-Meteo / SENAMHI (En Vivo)',
        data: liveWeather,
        timestamp: new Date().toISOString(),
      }, { headers });
    }
    return NextResponse.json(
      { success: false, error: 'Estación no encontrada' },
      { status: 404, headers }
    );
  }

  // Consulta global de todas las estaciones
  const weatherMap = await fetchAllLiveWeathers(isRefresh);

  return NextResponse.json({
    success: true,
    fuente: isRefresh ? 'Open-Meteo / SENAMHI (En Vivo)' : 'Aiven MySQL / SENAMHI',
    data: weatherMap,
    timestamp: new Date().toISOString(),
  }, { headers });
}
