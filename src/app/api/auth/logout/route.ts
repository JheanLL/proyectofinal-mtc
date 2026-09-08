import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    mensaje: 'Sesión finalizada correctamente.'
  });

  response.cookies.delete('auth_token');
  return response;
}
