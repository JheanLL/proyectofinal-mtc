import { NextRequest, NextResponse } from 'next/server';
import { query, logAuditoria } from '@/lib/db/mysql';

export const dynamic = 'force-dynamic';

// GET /api/auditoria - Consulta de auditoría con segregación estricta de permisos RBAC
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rol = (searchParams.get('rol') || '').toUpperCase();
  const usuarioId = searchParams.get('usuarioId');
  const usuarioEmail = searchParams.get('usuarioEmail') || '';
  const modulo = searchParams.get('modulo');
  const accion = searchParams.get('accion');
  const limite = parseInt(searchParams.get('limite') || '50', 10);

  // Validación de Seguridad RBAC: Solo operadores administrativos autorizados
  if (!rol || !['ADMIN', 'TRAVEL_GROUP', 'PERURAIL'].includes(rol)) {
    return NextResponse.json({
      success: false,
      error: 'Acceso Denegado. La auditoría exige autenticación con una de las 3 cuentas administrativas (ADMIN, TRAVEL_GROUP, PERURAIL). Los usuarios/turistas no tienen acceso a auditoría.',
    }, { status: 403 });
  }

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

    // --- REGLAS DE ACCESO SEGÚN EL ROL ---
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
      if (usuarioId) {
        sql += ' AND aud_usuario_id = ?';
        params.push(usuarioId);
      }
    } else if (rol === 'TRAVEL_GROUP') {
      // Operador Travel Group Perú: Únicamente sus propios cambios en ZONAS
      sql += " AND aud_modulo = 'ZONAS'";
      if (usuarioId) {
        sql += ' AND aud_usuario_id = ?';
        params.push(usuarioId);
      } else if (usuarioEmail) {
        sql += ' AND aud_usuario_email = ?';
        params.push(usuarioEmail);
      } else {
        sql += " AND (aud_usuario_email LIKE '%travelgroup%' OR aud_usuario_id = 2)";
      }
      if (accion && accion !== 'TODAS') {
        sql += ' AND aud_accion = ?';
        params.push(accion);
      }
    } else if (rol === 'PERURAIL') {
      // Operador PeruRail: Únicamente sus propios cambios en HORARIOS
      sql += " AND aud_modulo = 'HORARIOS'";
      if (usuarioId) {
        sql += ' AND aud_usuario_id = ?';
        params.push(usuarioId);
      } else if (usuarioEmail) {
        sql += ' AND aud_usuario_email = ?';
        params.push(usuarioEmail);
      } else {
        sql += " AND (aud_usuario_email LIKE '%perurail%' OR aud_usuario_id = 3)";
      }
      if (accion && accion !== 'TODAS') {
        sql += ' AND aud_accion = ?';
        params.push(accion);
      }
    }

    sql += ' ORDER BY aud_fecha_hora DESC LIMIT ?';
    params.push(limite);

    const rows = await query<any>(sql, params);

    return NextResponse.json({
      success: true,
      rol_solicitante: rol,
      permisos_aplicados: rol === 'ADMIN' 
        ? 'Visibilidad Global Total (Superadmin MTC)' 
        : `Historial Restringido a ${rol === 'TRAVEL_GROUP' ? 'Zonas Turísticas Propias' : 'Horarios Ferroviarios Propios'}`,
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

// POST /api/auditoria - Registro manual de eventos de auditoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, usuarioEmail, accion, modulo, registroId, detalles, ip } = body;

    if (!accion || !modulo) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios: accion y modulo' }, { status: 400 });
    }

    await logAuditoria(
      usuarioId || null,
      usuarioEmail || 'sistema@mtc.gob.pe',
      accion,
      modulo,
      registroId || null,
      detalles || null,
      ip || '127.0.0.1'
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Evento de auditoría registrado exitosamente.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
