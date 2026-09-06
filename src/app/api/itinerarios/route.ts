import { NextRequest, NextResponse } from 'next/server';
import { TblItinerarioConsulta } from '@/types/database';

// In-memory store for serverless instance + client localstorage
export const dynamic = 'force-dynamic';
const mockItinerarios: TblItinerarioConsulta[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo');

  if (codigo) {
    const found = mockItinerarios.find(
      i => i.iti_codigo.toLowerCase() === codigo.toLowerCase() || i.iti_id === codigo
    );
    if (found) {
      return NextResponse.json({ success: true, data: found });
    }
    return NextResponse.json({ success: false, error: 'Itinerario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: mockItinerarios,
    total: mockItinerarios.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newItinerario: TblItinerarioConsulta = {
      ...body,
      iti_id: `iti_${Date.now()}`,
      iti_codigo: `TRAIN-${randomCode}`,
      iti_fecha_creacion: new Date().toISOString(),
    };

    mockItinerarios.unshift(newItinerario);

    return NextResponse.json({
      success: true,
      mensaje: 'Itinerario consolidado generado y guardado correctamente.',
      data: newItinerario,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al procesar el itinerario' },
      { status: 400 }
    );
  }
}
