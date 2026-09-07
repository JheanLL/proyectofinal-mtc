import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { INITIAL_ESTACIONES } from '@/lib/db/initial-data';
import { TblEstacion } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query<any>('SELECT * FROM tbl_estacion WHERE est_activo = TRUE ORDER BY est_id ASC');
    if (rows && rows.length > 0) {
      const data: TblEstacion[] = rows.map(r => ({
        ...r,
        est_latitud: Number(r.est_latitud),
        est_longitud: Number(r.est_longitud),
        est_altitud_msnm: Number(r.est_altitud_msnm),
        est_servicios: typeof r.est_servicios === 'string' ? JSON.parse(r.est_servicios) : r.est_servicios
      }));
      return NextResponse.json({
        success: true,
        fuente: 'PeruRail / MTC (Aiven MySQL)',
        data,
        total: data.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[API Estaciones] Fallback a datos locales:', err);
  }

  return NextResponse.json({
    success: true,
    fuente: 'PeruRail / MTC (Local Fallback)',
    data: INITIAL_ESTACIONES,
    total: INITIAL_ESTACIONES.length,
    timestamp: new Date().toISOString(),
  });
}
