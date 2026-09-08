import { NextRequest, NextResponse } from 'next/server';
import { query, logAuditoria } from '@/lib/db/mysql';
import { verifyPassword, signJwtToken, SessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALIAS_MAP: Record<string, string> = {
  'contacto@travelgroup.pe': 'operaciones@travelgroup.pe',
  'operaciones@perurail.com': 'logistica@perurail.com',
};

const ORG_MAP: Record<string, string> = {
  ADMIN: 'Ministerio de Transportes y Comunicaciones (MTC)',
  TRAVEL_GROUP: 'Travel Group Perú',
  PERURAIL: 'PeruRail S.A.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!rawEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Por favor proporciona el correo electrónico y la contraseña.' },
        { status: 400 }
      );
    }

    // Resolver posibles alias a la cuenta canónica registrada en BD
    const canonicalEmail = ALIAS_MAP[rawEmail] || rawEmail;

    // Consultar usuario en tbl_usuario_sistema
    const rows = await query<any>(
      `SELECT usu_id, usu_email, usu_password_hash, usu_rol, usu_nombre, usu_activo 
       FROM tbl_usuario_sistema 
       WHERE (usu_email = ? OR usu_email = ?) AND usu_activo = TRUE LIMIT 1`,
      [canonicalEmail, rawEmail]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Correo electrónico o contraseña incorrectos. Verifique sus credenciales.' 
        },
        { status: 401 }
      );
    }

    // Validar contraseña
    const isValid = await verifyPassword(password, user.usu_password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Correo electrónico o contraseña incorrectos. Verifique sus credenciales.' },
        { status: 401 }
      );
    }

    const org = ORG_MAP[user.usu_rol] || 'MTC';
    const sessionData: SessionUser = {
      userId: user.usu_id,
      email: user.usu_email,
      role: user.usu_rol,
      name: user.usu_nombre,
      organization: org,
    };

    // Generar token JWT con jose
    const token = await signJwtToken(sessionData);

    // Obtener IP del cliente
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Registrar evento LOGIN en tbl_auditoria
    await logAuditoria(
      user.usu_id,
      user.usu_email,
      'LOGIN',
      'AUTH',
      user.usu_rol,
      {
        rol: user.usu_rol,
        nombre: user.usu_nombre,
        emailIngresado: rawEmail,
        metodo: 'CREDENTIALS_JWT',
        timestamp: new Date().toISOString()
      },
      clientIp
    );

    // Respuesta con cookie segura HttpOnly
    const response = NextResponse.json({
      success: true,
      mensaje: `Sesión iniciada exitosamente como ${user.usu_nombre}`,
      user: {
        id: user.usu_id,
        email: user.usu_email,
        role: user.usu_rol.toLowerCase(), // 'admin' | 'travel_group' | 'perurail'
        roleRaw: user.usu_rol,
        name: user.usu_nombre,
        organization: org,
      },
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[API Login Error]:', error);
    let userFriendlyError = 'No fue posible completar el inicio de sesión. Intente nuevamente en unos instantes.';
    if (
      error?.code === 'ER_ACCESS_DENIED_ERROR' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT' ||
      error?.message?.includes('Access denied')
    ) {
      userFriendlyError = 'El servicio de base de datos no se encuentra disponible temporalmente. Intente más tarde.';
    }
    return NextResponse.json(
      { success: false, error: userFriendlyError },
      { status: 500 }
    );
  }
}
