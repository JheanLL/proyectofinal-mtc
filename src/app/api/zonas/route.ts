import { NextRequest, NextResponse } from 'next/server';
import { query, execute, logAuditoria } from '@/lib/db/mysql';
import { INITIAL_ZONAS_TURISTICAS } from '@/lib/db/initial-data';
import { TblZonaTuristica } from '@/types/database';

export const dynamic = 'force-dynamic';

function parseZonaRow(r: any): TblZonaTuristica {
  return {
    ...r,
    zon_puntos_interes: typeof r.zon_puntos_interes === 'string' ? JSON.parse(r.zon_puntos_interes) : (r.zon_puntos_interes || []),
    zon_recomendaciones: typeof r.zon_recomendaciones === 'string' ? JSON.parse(r.zon_recomendaciones) : (r.zon_recomendaciones || []),
    zon_es_destacado: Boolean(r.zon_es_destacado),
    zon_distancia_metros: Number(r.zon_distancia_metros),
    zon_tiempo_caminata_min: Number(r.zon_tiempo_caminata_min),
    zon_tiempo_sugerido_visita_min: Number(r.zon_tiempo_sugerido_visita_min),
    zon_desnivel_metros: Number(r.zon_desnivel_metros),
    zon_precio_entrada_pen: Number(r.zon_precio_entrada_pen),
    zon_latitud: Number(r.zon_latitud),
    zon_longitud: Number(r.zon_longitud),
  };
}

// 1. GET - Obtener zonas (todas o filtradas por estacionId / categoria)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const estacionId = searchParams.get('estacionId');
  const categoria = searchParams.get('categoria');

  try {
    let sql = 'SELECT * FROM tbl_zona_turistica WHERE zon_activo = TRUE';
    const params: any[] = [];

    if (estacionId) {
      sql += ' AND zon_estacion_id = ?';
      params.push(estacionId);
    }
    if (categoria) {
      sql += ' AND zon_categoria = ?';
      params.push(categoria);
    }

    sql += ' ORDER BY zon_distancia_metros ASC';

    const rows = await query<any>(sql, params);
    if (rows && rows.length > 0) {
      const data = rows.map(parseZonaRow);
      return NextResponse.json({
        success: true,
        fuente: 'Travel Group Perú (Aiven MySQL)',
        data,
        total: data.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[API Zonas] Fallback local debido a:', err);
  }

  // Fallback local
  let fallback = INITIAL_ZONAS_TURISTICAS;
  if (estacionId) fallback = fallback.filter(z => z.zon_estacion_id === estacionId);
  if (categoria) fallback = fallback.filter(z => z.zon_categoria === categoria);

  return NextResponse.json({
    success: true,
    fuente: 'Travel Group Perú (Local Fallback)',
    data: fallback,
    total: fallback.length,
    timestamp: new Date().toISOString(),
  });
}

// 2. POST - Crear nueva zona turística en Aiven MySQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const zon_id = body.zon_id || `zon_${Date.now()}`;

    await execute(
      `INSERT INTO tbl_zona_turistica (
        zon_id, zon_estacion_id, zon_nombre, zon_categoria, zon_descripcion,
        zon_resumen_corto, zon_distancia_metros, zon_tiempo_caminata_min,
        zon_tiempo_sugerido_visita_min, zon_dificultad, zon_desnivel_metros,
        zon_puntos_interes, zon_recomendaciones, zon_latitud, zon_longitud,
        zon_imagen_url, zon_precio_entrada_pen, zon_horario_atencion, zon_es_destacado, zon_activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        zon_id,
        body.zon_estacion_id,
        body.zon_nombre,
        body.zon_categoria,
        body.zon_descripcion,
        body.zon_resumen_corto,
        body.zon_distancia_metros || 0,
        body.zon_tiempo_caminata_min || 0,
        body.zon_tiempo_sugerido_visita_min || 0,
        body.zon_dificultad || 'Fácil',
        body.zon_desnivel_metros || 0,
        JSON.stringify(body.zon_puntos_interes || []),
        JSON.stringify(body.zon_recomendaciones || []),
        body.zon_latitud || -13.16,
        body.zon_longitud || -72.54,
        body.zon_imagen_url || '',
        body.zon_precio_entrada_pen || 0,
        body.zon_horario_atencion || '08:00 - 17:00',
        body.zon_es_destacado ? 1 : 0,
      ]
    );

    await logAuditoria(
      2,
      'operaciones@travelgroup.pe',
      'CREATE',
      'ZONAS',
      zon_id,
      { nombre: body.zon_nombre, estacion: body.zon_estacion_id }
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Zona turística registrada exitosamente en Aiven MySQL.',
      data: { ...body, zon_id },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { zon_id, ...data } = body;

    if (!zon_id) {
      return NextResponse.json({ success: false, error: 'Se requiere zon_id para actualizar' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === 'zon_puntos_interes' || key === 'zon_recomendaciones') {
          setClauses.push(`${key} = ?`);
          params.push(JSON.stringify(value));
        } else if (key === 'zon_es_destacado' || key === 'zon_activo') {
          setClauses.push(`${key} = ?`);
          params.push(value ? 1 : 0);
        } else {
          setClauses.push(`${key} = ?`);
          params.push(value);
        }
      }
    }

    if (setClauses.length > 0) {
      params.push(zon_id);
      await execute(`UPDATE tbl_zona_turistica SET ${setClauses.join(', ')} WHERE zon_id = ?`, params);
    }

    await logAuditoria(
      2,
      'operaciones@travelgroup.pe',
      'UPDATE',
      'ZONAS',
      zon_id,
      { camposModificados: Object.keys(data) }
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Zona turística actualizada exitosamente en Aiven MySQL.',
      data: body,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 4. DELETE - Eliminar zona en Aiven MySQL
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zon_id = searchParams.get('id');

    if (!zon_id) {
      return NextResponse.json({ success: false, error: 'Se requiere id para eliminar' }, { status: 400 });
    }

    await execute('DELETE FROM tbl_zona_turistica WHERE zon_id = ?', [zon_id]);

    await logAuditoria(
      2,
      'operaciones@travelgroup.pe',
      'DELETE',
      'ZONAS',
      zon_id,
      { accion: 'Eliminación permanente de zona' }
    );

    return NextResponse.json({
      success: true,
      mensaje: `Zona turística ${zon_id} eliminada exitosamente en Aiven MySQL.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
