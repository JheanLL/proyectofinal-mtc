import { NextResponse } from 'next/server';
import { initAivenDatabase, query } from '@/lib/db/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let initError = null;
  let initialized = false;
  try {
    initialized = await initAivenDatabase();
  } catch (e: any) {
    initError = e.message || String(e);
  }

  const latency = Date.now() - startTime;
  try {
    const counts = await query<{ tbl: string; total: number }>(`
      SELECT 'tbl_estacion' as tbl, count(*) as total FROM tbl_estacion
      UNION ALL SELECT 'tbl_zona_turistica', count(*) FROM tbl_zona_turistica
      UNION ALL SELECT 'tbl_horario_tren', count(*) FROM tbl_horario_tren
      UNION ALL SELECT 'tbl_preferencia_turistica', count(*) FROM tbl_preferencia_turistica
      UNION ALL SELECT 'tbl_estado_integracion', count(*) FROM tbl_estado_integracion
      UNION ALL SELECT 'tbl_usuario_sistema', count(*) FROM tbl_usuario_sistema
      UNION ALL SELECT 'tbl_itinerario_consulta', count(*) FROM tbl_itinerario_consulta
      UNION ALL SELECT 'tbl_auditoria', count(*) FROM tbl_auditoria
    `);

    return NextResponse.json({
      success: true,
      conexion: 'Aiven Cloud MySQL 8.0 (SSL Activo)',
      host: 'api-empleadosgestion.e.aivencloud.com',
      database: 'defaultdb',
      latencia_ms: latency,
      inicializado: initialized,
      initError,
      tablas: counts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      conexion: 'Error de conexión',
      error: error.message || String(error)
    }, { status: 500 });
  }
}
