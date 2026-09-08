import { NextRequest, NextResponse } from 'next/server';
import { query, logAuditoria } from '@/lib/db/mysql';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/auditoria - Consulta de auditoría con segregación estricta de permisos RBAC
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({
      success: false,
      error: 'Autenticación requerida. La bitácora de auditoría exige una sesión activa con una de las cuentas autorizadas (ADMIN, TRAVEL_GROUP, PERURAIL).',
    }, { status: 401 });
  }

  const rol = session.role;
  const usuarioId = session.userId;
  const usuarioEmail = session.email;
  const { searchParams } = new URL(request.url);
  const modulo = searchParams.get('modulo');
  const accion = searchParams.get('accion');
  const limite = parseInt(searchParams.get('limite') || '100', 10);

  try {
    let sql = `
      SELECT 
        aud_id, aud_usuario_id, aud_usuario_email, 
        aud_accion, aud_modulo, aud_registro_id, 
        aud_detalles_json, aud_ip_origen, aud_fecha_hora 
      FROM tbl_auditoria
      WHERE 1=1
    `;
    const params: any[] = [];

    // --- REGLAS DE SEGREGACIÓN SEGÚN EL ROL ---
    if (rol === 'ADMIN') {
      // Superadministrador MTC: Visibilidad 100% global
      if (modulo && modulo !== 'TODOS') {
        sql += ' AND aud_modulo = ?';
        params.push(modulo);
      }
      if (accion && accion !== 'TODAS') {
        sql += ' AND aud_accion = ?';
        params.push(accion);
      }
      if (usuarioId && searchParams.has('usuarioId')) {
        sql += ' AND aud_usuario_id = ?';
        params.push(usuarioId);
      }
    } else if (rol === 'TRAVEL_GROUP') {
      // Operador Travel Group Perú: Exclusivo sobre ZONAS turísticas peatonales
      sql += " AND aud_modulo = 'ZONAS'";
      if (accion && accion !== 'TODAS') {
        sql += ' AND aud_accion = ?';
        params.push(accion);
      }
    } else if (rol === 'PERURAIL') {
      // Operador PeruRail: Exclusivo sobre HORARIOS ferroviarios y tarifas
      sql += " AND aud_modulo = 'HORARIOS'";
      if (accion && accion !== 'TODAS') {
        sql += ' AND aud_accion = ?';
        params.push(accion);
      }
    }

    sql += ' ORDER BY aud_fecha_hora DESC, aud_id DESC LIMIT ?';
    params.push(limite);

    const rows = await query<any>(sql, params);

    return NextResponse.json({
      success: true,
      rol_solicitante: rol,
      permisos_aplicados: rol === 'ADMIN' 
        ? 'Visibilidad Global Total (Superadmin MTC)' 
        : `Historial Restringido a ${rol === 'TRAVEL_GROUP' ? 'Zonas Turísticas Peatonales' : 'Horarios Ferroviarios y Tarifas'}`,
      data: rows || [],
      total: rows ? rows.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al consultar la bitácora de auditoría.',
    }, { status: 500 });
  }
}

// POST /api/auditoria - Registro manual o programático de eventos de auditoría
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const body = await request.json();
    const { usuarioId, usuarioEmail, accion, modulo, registroId, detalles, ip } = body;

    if (!accion || !modulo) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios: accion y modulo' }, { status: 400 });
    }

    const finalUserId = usuarioId || session?.userId || null;
    const finalEmail = usuarioEmail || session?.email || 'sistema@mtc.gob.pe';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const finalIp = ip || (forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1');

    await logAuditoria(
      finalUserId,
      finalEmail,
      accion,
      modulo,
      registroId || null,
      detalles || null,
      finalIp
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Evento de auditoría registrado exitosamente.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
