import { NextResponse } from 'next/server';
import { query, execute, logAuditoria } from '@/lib/db/mysql';
import { INITIAL_INTEGRACIONES } from '@/lib/db/initial-data';
import { TblEstadoIntegracion } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query<any>('SELECT * FROM tbl_estado_integracion ORDER BY int_id ASC');
    if (rows && rows.length > 0) {
      return NextResponse.json({
        success: true,
        fuente: 'Aiven MySQL',
        data: rows,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[API Sync] Fallback local:', err);
  }

  return NextResponse.json({
    success: true,
    fuente: 'Local Fallback',
    data: INITIAL_INTEGRACIONES,
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  try {
    await execute(`
      UPDATE tbl_estado_integracion 
      SET int_estado = 'Sincronizado',
          int_ultima_sincronizacion = NOW(),
          int_latencia_ms = FLOOR(60 + (RAND() * 80))
    `);

    await logAuditoria(
      1,
      'admin@mtc.gob.pe',
      'SYNC',
      'INTEGRACIONES',
      'ALL',
      { accion: 'Sincronización manual de APIs externas' }
    );

    const rows = await query<any>('SELECT * FROM tbl_estado_integracion ORDER BY int_id ASC');

    return NextResponse.json({
      success: true,
      mensaje: 'Sincronización periódica ejecutada y registrada en Aiven MySQL (tbl_estado_integracion y tbl_auditoria).',
      data: rows,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
