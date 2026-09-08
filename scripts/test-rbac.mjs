// scripts/test-rbac.mjs
// Suite automatizada de pruebas de permisos RBAC para MTC, Travel Group y PeruRail

import { SignJWT } from 'jose';
import { POST as loginPost } from '../src/app/api/auth/login/route.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mtc_rutas_turisticas_secret_key_2026_jwt_token_secure';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

async function createToken(user) {
  return await new SignJWT({
    userId: user.userId,
    email: user.email,
    role: user.role,
    name: user.name,
    organization: user.organization || 'MTC',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(SECRET_KEY);
}

const USERS = {
  admin: { userId: 1, email: 'admin@mtc.gob.pe', role: 'ADMIN', name: 'Administrador General MTC' },
  travel: { userId: 2, email: 'operaciones@travelgroup.pe', role: 'TRAVEL_GROUP', name: 'Gestor Travel Group' },
  perurail: { userId: 3, email: 'logistica@perurail.com', role: 'PERURAIL', name: 'Coordinador PeruRail' }
};

console.log('Generando tokens para prueba de matriz RBAC...');
