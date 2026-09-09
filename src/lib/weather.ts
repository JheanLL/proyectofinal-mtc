import { INITIAL_ESTACIONES, INITIAL_PRONOSTICOS_CLIMA } from '@/lib/db/initial-data';
import { TblPronosticoClima, CondicionCielo, NivelAlertaClima } from '@/types/database';

export function mapWmoToCondition(code: number): CondicionCielo {
  if (code === 0) return 'Despejado';
  if (code === 1 || code === 2) return 'Parcialmente Nublado';
  if (code === 3) return 'Nublado';
  if ([51, 53, 55, 61, 63].includes(code)) return 'Lluvia Ligera';
  if ([65, 80, 81, 82].includes(code)) return 'Lluvia Moderada';
  if ([95, 96, 99].includes(code)) return 'Tormenta';
  return 'Parcialmente Nublado';
}

export function getAlertLevel(uv: number, rainProb: number): { nivel: NivelAlertaClima; mensaje: string; recomendacion: string } {
  if (rainProb > 60 || uv >= 11) {
    return {
      nivel: 'Amarillo',
      mensaje: uv >= 11 
        ? 'Índice de radiación UV muy alto en horas centrales del día.' 
        : 'Probabilidad alta de lluvias en la zona geográfica.',
      recomendacion: uv >= 11
        ? 'Uso indispensable de protector solar FPS 50+, sombrero de ala ancha y lentes con filtro UV.'
        : 'Llevar poncho impermeable y calzado de trekking con buen agarre.',
    };
  }
  return {
    nivel: 'Verde',
    mensaje: 'Condiciones meteorológicas estables y favorables para caminatas a pie.',
    recomendacion: 'Mantenerse hidratado durante el recorrido a pie.',
  };
}

export async function fetchLiveWeatherForStation(estacionId: string, forceFresh: boolean = false): Promise<TblPronosticoClima | null> {
  const estacion = INITIAL_ESTACIONES.find(e => e.est_id === estacionId);
  if (!estacion) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${estacion.est_latitud}&longitude=${estacion.est_longitud}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
    
    const fetchOptions: RequestInit = forceFresh 
      ? { cache: 'no-store' } 
      : { next: { revalidate: 300 } };

    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(`API fetch error: ${res.status}`);
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;
    const weatherCode = current?.weather_code ?? 1;
    const tempActual = Math.round(current?.temperature_2m ?? 18);
    const tempMin = Math.round(daily?.temperature_2m_min?.[0] ?? (tempActual - 8));
    const tempMax = Math.round(daily?.temperature_2m_max?.[0] ?? (tempActual + 6));
    const probLluvia = daily?.precipitation_probability_max?.[0] ?? 10;
    const uvIndex = Math.round(daily?.uv_index_max?.[0] ?? 10);
    const humedad = Math.round(current?.relative_humidity_2m ?? 50);
    const viento = Math.round(current?.wind_speed_10m ?? 12);
    const condicion = mapWmoToCondition(weatherCode);

    const alertInfo = getAlertLevel(uvIndex, probLluvia);

    return {
      cli_id: `cli_${estacionId}`,
      cli_estacion_id: estacionId,
      cli_fecha: new Date().toISOString().split('T')[0],
      cli_temp_min_c: tempMin,
      cli_temp_max_c: tempMax,
      cli_temp_actual_c: tempActual,
      cli_condicion_cielo: condicion,
      cli_prob_lluvia_pct: probLluvia,
      cli_humedad_pct: humedad,
      cli_viento_kmh: viento,
      cli_indice_uv: uvIndex,
      cli_alerta_meteorologica: alertInfo,
      cli_recomendacion_ropa: [
        uvIndex >= 10 ? 'Sombrero o gorra de ala ancha' : 'Ropa cómoda transpirable',
        probLluvia > 30 ? 'Poncho impermeable para lluvia' : 'Lentes de sol con protección UV',
        'Zapatillas o calzado de caminata con buena tracción',
        'Botella de agua recargable'
      ],
      cli_fuente_senamhi: `SENAMHI EMA ${estacion.est_ciudad} (API En Vivo)`,
      cli_fecha_actualizacion: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (En tiempo real)',
    };
  } catch (err) {
    console.error(`Error fetching live weather for ${estacionId}:`, err);
    return INITIAL_PRONOSTICOS_CLIMA[estacionId] || null;
  }
}

export async function fetchAllLiveWeathers(forceFresh: boolean = false): Promise<Record<string, TblPronosticoClima>> {
  const promises = INITIAL_ESTACIONES.map(async (est) => {
    const weather = await fetchLiveWeatherForStation(est.est_id, forceFresh);
    return [est.est_id, weather || INITIAL_PRONOSTICOS_CLIMA[est.est_id]];
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}

export async function syncAllStationsWeatherToDatabase(): Promise<number> {
  try {
    const { execute } = await import('@/lib/db/mysql');
    let synced = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const est of INITIAL_ESTACIONES) {
      const weather = await fetchLiveWeatherForStation(est.est_id, true);
      if (weather) {
        await execute(
          `INSERT INTO tbl_pronostico_clima (
            cli_id, cli_estacion_id, cli_fecha, cli_temp_min_c, cli_temp_max_c,
            cli_temp_actual_c, cli_condicion_cielo, cli_prob_lluvia_pct, cli_humedad_pct,
            cli_viento_kmh, cli_indice_uv, cli_alerta_meteorologica, cli_recomendacion_ropa,
            cli_fuente_senamhi, cli_fecha_actualizacion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            cli_temp_min_c = VALUES(cli_temp_min_c),
            cli_temp_max_c = VALUES(cli_temp_max_c),
            cli_temp_actual_c = VALUES(cli_temp_actual_c),
            cli_condicion_cielo = VALUES(cli_condicion_cielo),
            cli_prob_lluvia_pct = VALUES(cli_prob_lluvia_pct),
            cli_humedad_pct = VALUES(cli_humedad_pct),
            cli_viento_kmh = VALUES(cli_viento_kmh),
            cli_indice_uv = VALUES(cli_indice_uv),
            cli_alerta_meteorologica = VALUES(cli_alerta_meteorologica),
            cli_recomendacion_ropa = VALUES(cli_recomendacion_ropa),
            cli_fuente_senamhi = VALUES(cli_fuente_senamhi),
            cli_fecha_actualizacion = NOW()`,
          [
            `cli_${est.est_id}`,
            est.est_id,
            today,
            weather.cli_temp_min_c,
            weather.cli_temp_max_c,
            weather.cli_temp_actual_c,
            weather.cli_condicion_cielo,
            weather.cli_prob_lluvia_pct,
            weather.cli_humedad_pct,
            weather.cli_viento_kmh,
            weather.cli_indice_uv,
            JSON.stringify(weather.cli_alerta_meteorologica),
            JSON.stringify(weather.cli_recomendacion_ropa),
            weather.cli_fuente_senamhi || `SENAMHI EMA ${est.est_ciudad}`
          ]
        );
        synced++;
      }
    }
    return synced;
  } catch (error) {
    console.error('[Weather Sync Error]', error);
    return 0;
  }
}

