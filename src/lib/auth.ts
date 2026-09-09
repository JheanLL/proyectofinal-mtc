import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'mtc_rutas_turisticas_secret_key_2026_jwt_token_secure';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export interface SessionUser {
  userId: number;
  email: string;
  role: 'ADMIN' | 'TRAVEL_GROUP' | 'PERURAIL';
  name: string;
  organization: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) {
    return false;
  }

  // Verificación criptográfica estricta y exclusiva con Bcrypt ($2a$, $2b$, $2y$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(plainText, hash);
    } catch {
      return false;
    }
  }

  return false;
}

export async function signJwtToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    userId: user.userId,
    email: user.email,
    role: user.role,
    name: user.name,
    organization: user.organization,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET_KEY);
}

export async function verifyJwtToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: payload.role as 'ADMIN' | 'TRAVEL_GROUP' | 'PERURAIL',
      name: String(payload.name),
      organization: String(payload.organization || 'MTC'),
    };
  } catch {
    return null;
  }
}

export async function getAuthSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyJwtToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  try {
    const tokenCookie = request.cookies.get('auth_token')?.value;
    if (tokenCookie) {
      const user = await verifyJwtToken(tokenCookie);
      if (user) return user;
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return await verifyJwtToken(token);
    }

    return null;
  } catch {
    return null;
  }
}
