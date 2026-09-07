import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query, execute } from '@/lib/db/mysql';
import { TblItinerarioConsulta } from '@/types/database';

export const dynamic = 'force-dynamic';

function generateServerSecureCodigo(): string {
  const hex = crypto.randomBytes(8).toString('hex');
  return `MTC-${hex}`;
}

function parseItinerarioRow(r: any): TblItinerarioConsulta {
  return {
    ...r,
    iti_preferencias_seleccionadas: typeof r.iti_preferencias_seleccionadas === 'string' ? JSON.parse(r.iti_preferencias_seleccionadas) : (r.iti_preferencias_seleccionadas || []),
    iti_distancia_total_caminata_metros: Number(r.iti_distancia_total_caminata_metros),
    iti_tiempo_total_caminata_min: Number(r.iti_tiempo_total_caminata_min),
    iti_costo_tren_total_pen: Number(r.iti_costo_tren_total_pen),
    iti_costo_tren_total_usd: Number(r.iti_costo_tren_total_usd),
    iti_costo_entradas_pen: Number(r.iti_costo_entradas_pen),
    iti_costo_total_pen: Number(r.iti_costo_total_pen),
    iti_costo_total_usd: Number(r.iti_costo_total_usd),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo');

  try {
    if (codigo) {
      const rows = await query<any>(
        'SELECT * FROM tbl_itinerario_consulta WHERE iti_codigo = ? OR iti_id = ? LIMIT 1',
        [codigo, codigo]
      );
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, data: parseItinerarioRow(rows[0]) });
      }
      return NextResponse.json({ success: false, error: 'Itinerario no encontrado en Aiven MySQL' }, { status: 404 });
    }

    const rows = await query<any>('SELECT * FROM tbl_itinerario_consulta ORDER BY iti_fecha_creacion DESC LIMIT 50');
    const data = (rows || []).map(parseItinerarioRow);
    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const iti_codigo = body.iti_codigo && typeof body.iti_codigo === 'string' && body.iti_codigo.trim() !== ''
      ? body.iti_codigo.trim()
      : generateServerSecureCodigo();
    const iti_id = body.iti_id && typeof body.iti_id === 'string'
      ? body.iti_id
      : `iti_${Date.now()}`;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await execute(
      `INSERT INTO tbl_itinerario_consulta (
        iti_id, iti_codigo, iti_fecha_creacion, iti_usuario_nombre, iti_usuario_email,
        iti_estacion_origen_id, iti_estacion_destino_id, iti_zona_turistica_id,
        iti_horario_ida_id, iti_horario_retorno_id, iti_preferencias_seleccionadas,
        iti_distancia_total_caminata_metros, iti_tiempo_total_caminata_min,
        iti_costo_tren_total_pen, iti_costo_tren_total_usd, iti_costo_entradas_pen,
        iti_costo_total_pen, iti_costo_total_usd, iti_notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        iti_id,
        iti_codigo,
        now,
        body.iti_usuario_nombre || 'Viajero MTC',
        body.iti_usuario_email || null,
        body.iti_estacion_origen_id,
        body.iti_estacion_destino_id,
        body.iti_zona_turistica_id,
        body.iti_horario_ida_id,
        body.iti_horario_retorno_id,
        JSON.stringify(body.iti_preferencias_seleccionadas || []),
        body.iti_distancia_total_caminata_metros || 0,
        body.iti_tiempo_total_caminata_min || 0,
        body.iti_costo_tren_total_pen || 0,
        body.iti_costo_tren_total_usd || 0,
        body.iti_costo_entradas_pen || 0,
        body.iti_costo_total_pen || 0,
        body.iti_costo_total_usd || 0,
        body.iti_notas || null
      ]
    );

    const saved: TblItinerarioConsulta = {
      ...body,
      iti_id,
      iti_codigo,
      iti_fecha_creacion: now,
    };

    return NextResponse.json({
      success: true,
      mensaje: 'Itinerario consolidado guardado exitosamente en Aiven MySQL.',
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error al procesar el itinerario: ' + error.message },
      { status: 500 }
    );
  }
}
