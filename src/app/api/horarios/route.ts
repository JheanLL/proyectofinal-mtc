import { NextRequest, NextResponse } from 'next/server';
import { query, execute, logAuditoria } from '@/lib/db/mysql';
import { INITIAL_HORARIOS_TREN } from '@/lib/db/initial-data';
import { TblHorarioTren } from '@/types/database';

export const dynamic = 'force-dynamic';

function parseHorarioRow(r: any): TblHorarioTren {
  return {
    ...r,
    hor_dias_operacion: typeof r.hor_dias_operacion === 'string' ? JSON.parse(r.hor_dias_operacion) : (r.hor_dias_operacion || []),
    hor_incluye_refrigerio: Boolean(r.hor_incluye_refrigerio),
    hor_duracion_min: Number(r.hor_duracion_min),
    hor_tarifa_regular_pen: Number(r.hor_tarifa_regular_pen),
    hor_tarifa_turista_usd: Number(r.hor_tarifa_turista_usd),
    hor_asientos_disponibles: Number(r.hor_asientos_disponibles),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origen = searchParams.get('origen');
  const destino = searchParams.get('destino');

  try {
    let sql = 'SELECT * FROM tbl_horario_tren WHERE hor_activo = TRUE';
    const params: any[] = [];

    if (origen && destino) {
      sql += ' AND hor_estacion_origen_id = ? AND hor_estacion_destino_id = ?';
      params.push(origen, destino);
    } else if (origen) {
      sql += ' AND hor_estacion_origen_id = ?';
      params.push(origen);
    }

    sql += ' ORDER BY hor_hora_salida ASC';

    const rows = await query<any>(sql, params);
    if (rows && rows.length > 0) {
      const data = rows.map(parseHorarioRow);
      return NextResponse.json({
        success: true,
        fuente: 'PeruRail (Aiven MySQL)',
        data,
        total: data.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[API Horarios] Fallback local debido a:', err);
  }

  let fallback = INITIAL_HORARIOS_TREN;
  if (origen && destino) {
    fallback = fallback.filter(h => h.hor_estacion_origen_id === origen && h.hor_estacion_destino_id === destino);
  } else if (origen) {
    fallback = fallback.filter(h => h.hor_estacion_origen_id === origen);
  }

  return NextResponse.json({
    success: true,
    fuente: 'PeruRail (Local Fallback)',
    data: fallback,
    total: fallback.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hor_id = body.hor_id || `hor_${Date.now()}`;

    await execute(
      `INSERT INTO tbl_horario_tren (
        hor_id, hor_codigo_tren, hor_estacion_origen_id, hor_estacion_destino_id,
        hor_servicio_tipo, hor_hora_salida, hor_hora_llegada, hor_duracion_min,
        hor_tarifa_regular_pen, hor_tarifa_turista_usd, hor_dias_operacion,
        hor_asientos_disponibles, hor_incluye_refrigerio, hor_activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        hor_id,
        body.hor_codigo_tren,
        body.hor_estacion_origen_id,
        body.hor_estacion_destino_id,
        body.hor_servicio_tipo,
        body.hor_hora_salida,
        body.hor_hora_llegada,
        body.hor_duracion_min || 90,
        body.hor_tarifa_regular_pen || 0,
        body.hor_tarifa_turista_usd || 0,
        JSON.stringify(body.hor_dias_operacion || []),
        body.hor_asientos_disponibles || 40,
        body.hor_incluye_refrigerio ? 1 : 0,
      ]
    );

    await logAuditoria(
      3,
      'logistica@perurail.com',
      'CREATE',
      'HORARIOS',
      hor_id,
      { codigo: body.hor_codigo_tren, origen: body.hor_estacion_origen_id, destino: body.hor_estacion_destino_id }
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Horario ferroviario registrado exitosamente.',
      data: { ...body, hor_id },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { hor_id, ...data } = body;

    if (!hor_id) {
      return NextResponse.json({ success: false, error: 'Se requiere hor_id para actualizar' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === 'hor_dias_operacion') {
          setClauses.push(`${key} = ?`);
          params.push(JSON.stringify(value));
        } else if (key === 'hor_incluye_refrigerio' || key === 'hor_activo') {
          setClauses.push(`${key} = ?`);
          params.push(value ? 1 : 0);
        } else {
          setClauses.push(`${key} = ?`);
          params.push(value);
        }
      }
    }

    if (setClauses.length > 0) {
      params.push(hor_id);
      await execute(`UPDATE tbl_horario_tren SET ${setClauses.join(', ')} WHERE hor_id = ?`, params);
    }

    await logAuditoria(
      3,
      'logistica@perurail.com',
      'UPDATE',
      'HORARIOS',
      hor_id,
      { camposModificados: Object.keys(data) }
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Horario ferroviario actualizado exitosamente.',
      data: body,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hor_id = searchParams.get('id');

    if (!hor_id) {
      return NextResponse.json({ success: false, error: 'Se requiere id para eliminar' }, { status: 400 });
    }

    await execute('DELETE FROM tbl_horario_tren WHERE hor_id = ?', [hor_id]);

    await logAuditoria(
      3,
      'logistica@perurail.com',
      'DELETE',
      'HORARIOS',
      hor_id,
      { accion: 'Eliminación permanente de horario' }
    );

    return NextResponse.json({
      success: true,
      mensaje: `Horario ${hor_id} eliminado exitosamente.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
