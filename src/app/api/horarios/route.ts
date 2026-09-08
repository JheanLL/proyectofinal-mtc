import { NextRequest, NextResponse } from 'next/server';
import { query, execute, logAuditoria } from '@/lib/db/mysql';
import { INITIAL_HORARIOS_TREN } from '@/lib/db/initial-data';
import { TblHorarioTren } from '@/types/database';
import { getSessionFromRequest } from '@/lib/auth';

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

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origen = searchParams.get('origen');
  const destino = searchParams.get('destino');
  const isRefresh = searchParams.get('refresh') === 'true' || searchParams.has('t');

  const headers = {
    'Cache-Control': isRefresh 
      ? 'no-store, no-cache, must-revalidate' 
      : 'public, s-maxage=300, stale-while-revalidate=60',
  };

  let excludedIds: string[] = [];

  try {
    try {
      const filterRows = await query<any>(
        "SELECT fil_registro_id FROM tbl_filtro_exclusion WHERE fil_modulo = 'HORARIOS' AND fil_activo = TRUE"
      );
      if (filterRows && filterRows.length > 0) {
        excludedIds = filterRows.map(r => r.fil_registro_id);
      }
    } catch (e) {
      // Ignorar si tabla está en proceso de creación
    }

    let sql = 'SELECT * FROM tbl_horario_tren WHERE hor_activo = TRUE';
    const params: any[] = [];

    if (origen && destino) {
      sql += ' AND hor_estacion_origen_id = ? AND hor_estacion_destino_id = ?';
      params.push(origen, destino);
    } else if (origen) {
      sql += ' AND hor_estacion_origen_id = ?';
      params.push(origen);
    }

    if (excludedIds.length > 0) {
      sql += ` AND hor_id NOT IN (${excludedIds.map(() => '?').join(', ')})`;
      params.push(...excludedIds);
    }

    sql += ' ORDER BY hor_hora_salida ASC';

    const rows = await query<any>(sql, params);
    if (rows && rows.length > 0) {
      const data = rows.map(parseHorarioRow).filter(h => !excludedIds.includes(h.hor_id));
      return NextResponse.json({
        success: true,
        fuente: 'PeruRail (Aiven MySQL SSOT)',
        data,
        total: data.length,
        cacheMinutes: 5,
        exclusionesFiltradas: excludedIds.length,
        timestamp: new Date().toISOString(),
      }, { headers });
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
  if (excludedIds.length > 0) {
    fallback = fallback.filter(h => !excludedIds.includes(h.hor_id));
  }

  return NextResponse.json({
    success: true,
    fuente: 'PeruRail (Local Fallback)',
    data: fallback,
    total: fallback.length,
    cacheMinutes: 5,
    exclusionesFiltradas: excludedIds.length,
    timestamp: new Date().toISOString(),
  }, { headers });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida. Inicie sesión para registrar horarios de tren.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'PERURAIL') {
      return NextResponse.json(
        { success: false, error: 'Acceso Denegado. Solo PeruRail o Admin MTC pueden crear horarios de tren.' },
        { status: 403 }
      );
    }

    const usuarioId = session.userId;
    const usuarioEmail = session.email;
    const ip = getClientIp(request);

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
      usuarioId,
      usuarioEmail,
      'CREATE',
      'HORARIOS',
      hor_id,
      { codigo: body.hor_codigo_tren, origen: body.hor_estacion_origen_id, destino: body.hor_estacion_destino_id, operador: usuarioEmail },
      ip
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
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida. Inicie sesión para modificar horarios de tren.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'PERURAIL') {
      return NextResponse.json(
        { success: false, error: 'Acceso Denegado. Solo PeruRail o Admin MTC pueden modificar horarios de tren.' },
        { status: 403 }
      );
    }

    const usuarioId = session.userId;
    const usuarioEmail = session.email;
    const ip = getClientIp(request);

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
      usuarioId,
      usuarioEmail,
      'UPDATE',
      'HORARIOS',
      hor_id,
      { camposModificados: Object.keys(data), operador: usuarioEmail },
      ip
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
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida. Inicie sesión para eliminar horarios de tren.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'PERURAIL') {
      return NextResponse.json(
        { success: false, error: 'Acceso Denegado. Solo PeruRail o Admin MTC pueden eliminar horarios de tren.' },
        { status: 403 }
      );
    }

    const usuarioId = session.userId;
    const usuarioEmail = session.email;
    const ip = getClientIp(request);

    const { searchParams } = new URL(request.url);
    const hor_id = searchParams.get('id');

    if (!hor_id) {
      return NextResponse.json({ success: false, error: 'Se requiere id para eliminar' }, { status: 400 });
    }

    // 1. Obtener snapshot completo antes de eliminar para permitir restauración
    let horarioSnapshot: any = null;
    try {
      const snapRows = await query<any>('SELECT * FROM tbl_horario_tren WHERE hor_id = ?', [hor_id]);
      if (snapRows && snapRows.length > 0) {
        horarioSnapshot = snapRows[0];
      }
    } catch (snapErr) {
      console.warn('Advertencia obteniendo snapshot de horario:', snapErr);
    }

    // 2. Registrar en tabla de filtros y exclusiones del servidor
    try {
      await execute(
        `INSERT INTO tbl_filtro_exclusion (fil_modulo, fil_registro_id, fil_motivo, fil_usuario_email) 
         VALUES ('HORARIOS', ?, 'Eliminado por logística PeruRail / MTC', ?)`,
        [hor_id, usuarioEmail]
      );
    } catch (filterErr) {
      console.warn('Advertencia al registrar en tbl_filtro_exclusion:', filterErr);
    }

    // 3. Desactivación lógica / borrado en tbl_horario_tren
    await execute('UPDATE tbl_horario_tren SET hor_activo = FALSE WHERE hor_id = ?', [hor_id]);
    await execute('DELETE FROM tbl_horario_tren WHERE hor_id = ?', [hor_id]);

    await logAuditoria(
      usuarioId,
      usuarioEmail,
      'DELETE',
      'HORARIOS',
      hor_id,
      { 
        accion: 'Eliminación de frecuencia ferroviaria', 
        operador: usuarioEmail,
        restaurable: true,
        codigo: horarioSnapshot?.hor_codigo_tren || hor_id,
        registroSnapshot: horarioSnapshot
      },
      ip
    );

    return NextResponse.json({
      success: true,
      mensaje: `Horario ${hor_id} eliminado exitosamente.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
