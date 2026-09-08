import { NextRequest, NextResponse } from 'next/server';
import { query, execute, logAuditoria } from '@/lib/db/mysql';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida. Debe iniciar sesión para restaurar registros.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const aud_id = body.aud_id;

    if (!aud_id) {
      return NextResponse.json(
        { success: false, error: 'Se requiere aud_id para identificar el registro a restaurar.' },
        { status: 400 }
      );
    }

    // 1. Obtener el evento de auditoría
    const rows = await query<any>('SELECT * FROM tbl_auditoria WHERE aud_id = ?', [aud_id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Evento de auditoría no encontrado.' },
        { status: 404 }
      );
    }

    const auditRow = rows[0];
    if (auditRow.aud_accion !== 'DELETE') {
      return NextResponse.json(
        { success: false, error: 'Solo los eventos de eliminación (DELETE) pueden ser restaurados.' },
        { status: 400 }
      );
    }

    // 2. Validación estricta de permisos RBAC
    if (auditRow.aud_modulo === 'ZONAS' && session.role !== 'ADMIN' && session.role !== 'TRAVEL_GROUP') {
      return NextResponse.json(
        { success: false, error: 'Acceso Denegado. Solo Travel Group Perú o Admin MTC pueden restaurar zonas turísticas.' },
        { status: 403 }
      );
    }

    if (auditRow.aud_modulo === 'HORARIOS' && session.role !== 'ADMIN' && session.role !== 'PERURAIL') {
      return NextResponse.json(
        { success: false, error: 'Acceso Denegado. Solo PeruRail o Admin MTC pueden restaurar frecuencias de tren.' },
        { status: 403 }
      );
    }

    let detalles: any = {};
    try {
      detalles = typeof auditRow.aud_detalles_json === 'string'
        ? JSON.parse(auditRow.aud_detalles_json)
        : auditRow.aud_detalles_json || {};
    } catch {
      detalles = {};
    }

    const registroId = auditRow.aud_registro_id;
    const snapshot = detalles.registroSnapshot || null;
    const ip = getClientIp(request);

    // 3. Ejecución de Restauración según el módulo
    if (auditRow.aud_modulo === 'ZONAS') {
      // a) Desactivar exclusión del servidor
      await execute(
        "DELETE FROM tbl_filtro_exclusion WHERE fil_modulo = 'ZONAS' AND fil_registro_id = ?",
        [registroId]
      );

      // b) Reactivar zona o reinsertar snapshot si existiera
      if (snapshot) {
        await execute(
          `INSERT INTO tbl_zona_turistica (
            zon_id, zon_estacion_id, zon_nombre, zon_categoria, zon_descripcion,
            zon_resumen_corto, zon_distancia_metros, zon_tiempo_caminata_min,
            zon_tiempo_sugerido_visita_min, zon_dificultad, zon_desnivel_metros,
            zon_puntos_interes, zon_recomendaciones, zon_latitud, zon_longitud,
            zon_imagen_url, zon_precio_entrada_pen, zon_horario_atencion, zon_es_destacado, zon_activo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
          ON DUPLICATE KEY UPDATE zon_activo = TRUE`,
          [
            snapshot.zon_id || registroId,
            snapshot.zon_estacion_id || 'est_04',
            snapshot.zon_nombre || 'Zona Restaurada',
            snapshot.zon_categoria || 'naturaleza',
            snapshot.zon_descripcion || '',
            snapshot.zon_resumen_corto || '',
            snapshot.zon_distancia_metros || 500,
            snapshot.zon_tiempo_caminata_min || 10,
            snapshot.zon_tiempo_sugerido_visita_min || 60,
            snapshot.zon_dificultad || 'Fácil',
            snapshot.zon_desnivel_metros || 0,
            typeof snapshot.zon_puntos_interes === 'string' ? snapshot.zon_puntos_interes : JSON.stringify(snapshot.zon_puntos_interes || []),
            typeof snapshot.zon_recomendaciones === 'string' ? snapshot.zon_recomendaciones : JSON.stringify(snapshot.zon_recomendaciones || []),
            snapshot.zon_latitud || -13.16,
            snapshot.zon_longitud || -72.54,
            snapshot.zon_imagen_url || '',
            snapshot.zon_precio_entrada_pen || 0,
            snapshot.zon_horario_atencion || '08:00 - 17:00',
            snapshot.zon_es_destacado ? 1 : 0
          ]
        );
      } else {
        await execute(
          'UPDATE tbl_zona_turistica SET zon_activo = TRUE WHERE zon_id = ?',
          [registroId]
        );
      }
    } else if (auditRow.aud_modulo === 'HORARIOS') {
      // a) Desactivar exclusión del servidor
      await execute(
        "DELETE FROM tbl_filtro_exclusion WHERE fil_modulo = 'HORARIOS' AND fil_registro_id = ?",
        [registroId]
      );

      // b) Reactivar horario o reinsertar snapshot si existiera
      if (snapshot) {
        await execute(
          `INSERT INTO tbl_horario_tren (
            hor_id, hor_codigo_tren, hor_estacion_origen_id, hor_estacion_destino_id,
            hor_servicio_tipo, hor_hora_salida, hor_hora_llegada, hor_duracion_min,
            hor_tarifa_regular_pen, hor_tarifa_turista_usd, hor_dias_operacion,
            hor_asientos_disponibles, hor_incluye_refrigerio, hor_activo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
          ON DUPLICATE KEY UPDATE hor_activo = TRUE`,
          [
            snapshot.hor_id || registroId,
            snapshot.hor_codigo_tren || 'HOR-RESTORE',
            snapshot.hor_estacion_origen_id || 'est_03',
            snapshot.hor_estacion_destino_id || 'est_04',
            snapshot.hor_servicio_tipo || 'Expedition',
            snapshot.hor_hora_salida || '08:00',
            snapshot.hor_hora_llegada || '09:30',
            snapshot.hor_duracion_min || 90,
            snapshot.hor_tarifa_regular_pen || 150,
            snapshot.hor_tarifa_turista_usd || 65,
            typeof snapshot.hor_dias_operacion === 'string' ? snapshot.hor_dias_operacion : JSON.stringify(snapshot.hor_dias_operacion || []),
            snapshot.hor_asientos_disponibles || 40,
            snapshot.hor_incluye_refrigerio ? 1 : 0
          ]
        );
      } else {
        await execute(
          'UPDATE tbl_horario_tren SET hor_activo = TRUE WHERE hor_id = ?',
          [registroId]
        );
      }
    }

    // 4. Registrar evento de Auditoría RESTORE
    await logAuditoria(
      session.userId,
      session.email,
      'RESTORE',
      auditRow.aud_modulo,
      registroId,
      {
        accion: `Restauración exitosa de ${auditRow.aud_modulo.toLowerCase()}`,
        auditoriaOrigenId: aud_id,
        operador: session.email,
        timestamp: new Date().toISOString()
      },
      ip
    );

    return NextResponse.json({
      success: true,
      mensaje: `Registro ${registroId} restaurado exitosamente en Aiven MySQL.`,
      modulo: auditRow.aud_modulo,
      registroId
    });
  } catch (err: any) {
    console.error('Error restaurando registro:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno al restaurar el registro.' },
      { status: 500 }
    );
  }
}
