// scripts/test-rbac-suite.js
// Suite de verificación automatizada de RBAC y segregación de privilegios

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  const setCookie = res.headers.get('set-cookie');
  let cookieHeader = '';
  if (setCookie) {
    const match = setCookie.match(/auth_token=([^;]+)/);
    if (match) cookieHeader = `auth_token=${match[1]}`;
  }
  return { status: res.status, data, cookie: cookieHeader };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS DE SEGURIDAD RBAC (MTC)');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // TEST GRUPO 1: USUARIO NO AUTENTICADO (TURISTA / PÚBLICO)
  // ----------------------------------------------------
  console.log('📌 GRUPO 1: USUARIO NO AUTENTICADO / TURISTA');
  {
    // GET público
    const resZonasGet = await fetch(`${BASE_URL}/api/zonas`);
    assert(resZonasGet.status === 200, 'GET /api/zonas es público (200 OK)');

    const resHorariosGet = await fetch(`${BASE_URL}/api/horarios`);
    assert(resHorariosGet.status === 200, 'GET /api/horarios es público (200 OK)');

    // POST /api/zonas sin cookie -> 401
    const resZonasPost = await fetch(`${BASE_URL}/api/zonas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zon_nombre: 'Zona Hacker' }),
    });
    assert(resZonasPost.status === 401, 'POST /api/zonas sin sesión es rechazado con 401 Unauthorized');

    // POST /api/horarios sin cookie -> 401
    const resHorariosPost = await fetch(`${BASE_URL}/api/horarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hor_codigo_tren: 'TRAIN-HACK' }),
    });
    assert(resHorariosPost.status === 401, 'POST /api/horarios sin sesión es rechazado con 401 Unauthorized');

    // POST /api/sync sin cookie -> 401
    const resSyncPost = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
    });
    assert(resSyncPost.status === 401, 'POST /api/sync sin sesión es rechazado con 401 Unauthorized');

    // GET /api/auditoria sin cookie -> 401
    const resAuditGet = await fetch(`${BASE_URL}/api/auditoria`);
    assert(resAuditGet.status === 401, 'GET /api/auditoria sin sesión es rechazado con 401 Unauthorized');
  }

  // ----------------------------------------------------
  // TEST GRUPO 2: TRAVEL GROUP PERÚ (operaciones@travelgroup.pe)
  // ----------------------------------------------------
  console.log('\n📌 GRUPO 2: OPERADOR TRAVEL GROUP PERÚ');
  {
    const auth = await login('operaciones@travelgroup.pe', 'travel123');
    assert(auth.status === 200 && auth.data.user.roleRaw === 'TRAVEL_GROUP', 'Login Travel Group exitoso (Rol: TRAVEL_GROUP)');

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': auth.cookie,
    };

    // 1. Debe poder crear Zonas (200)
    const testZonaId = `test_zon_${Date.now()}`;
    const resCreateZona = await fetch(`${BASE_URL}/api/zonas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        zon_id: testZonaId,
        zon_estacion_id: 'est_04',
        zon_nombre: 'Ruta Peatonal Prueba RBAC',
        zon_categoria: 'naturaleza',
        zon_descripcion: 'Descripción de prueba de integridad RBAC',
        zon_resumen_corto: 'Resumen prueba',
        zon_distancia_metros: 1200,
        zon_tiempo_caminata_min: 20,
        zon_tiempo_sugerido_visita_min: 60,
        zon_dificultad: 'Fácil',
        zon_desnivel_metros: 15,
        zon_latitud: -13.16,
        zon_longitud: -72.54,
        zon_imagen_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377',
      }),
    });
    assert(resCreateZona.status === 200, 'Travel Group puede crear zona turística (200 OK)');

    // 2. Debe poder modificar Zonas (200)
    const resUpdateZona = await fetch(`${BASE_URL}/api/zonas`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        zon_id: testZonaId,
        zon_nombre: 'Ruta Peatonal Modificada RBAC',
      }),
    });
    assert(resUpdateZona.status === 200, 'Travel Group puede modificar zona turística (200 OK)');

    // 3. Debe poder eliminar la Zona de prueba (200)
    const resDeleteZona = await fetch(`${BASE_URL}/api/zonas?id=${testZonaId}`, {
      method: 'DELETE',
      headers,
    });
    assert(resDeleteZona.status === 200, 'Travel Group puede eliminar zona turística (200 OK)');

    // 4. NO debe poder crear Horarios (403 Forbidden)
    const resHorariosForbidden = await fetch(`${BASE_URL}/api/horarios`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ hor_codigo_tren: 'TRAIN-ILLEGAL' }),
    });
    assert(resHorariosForbidden.status === 403, 'Travel Group NO puede crear horarios de tren (403 Forbidden)');

    // 5. NO debe poder sincronizar APIs (403 Forbidden)
    const resSyncForbidden = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers,
    });
    assert(resSyncForbidden.status === 403, 'Travel Group NO puede sincronizar APIs (403 Forbidden)');

    // 6. En auditoría solo debe ver registros de ZONAS
    const resAudit = await fetch(`${BASE_URL}/api/auditoria`, { headers });
    const auditData = await resAudit.json();
    assert(resAudit.status === 200, 'Travel Group puede consultar auditoría de sus operaciones (200 OK)');
    const allAreZonas = auditData.data && auditData.data.every(r => r.aud_modulo === 'ZONAS');
    assert(allAreZonas, 'Travel Group solo visualiza registros del módulo ZONAS en auditoría');
  }

  // ----------------------------------------------------
  // TEST GRUPO 3: PERURAIL (logistica@perurail.com)
  // ----------------------------------------------------
  console.log('\n📌 GRUPO 3: OPERADOR PERURAIL');
  {
    const auth = await login('logistica@perurail.com', 'perurail123');
    assert(auth.status === 200 && auth.data.user.roleRaw === 'PERURAIL', 'Login PeruRail exitoso (Rol: PERURAIL)');

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': auth.cookie,
    };

    // 1. Debe poder crear Horarios (200)
    const testHorarioId = `test_hor_${Date.now()}`;
    const resCreateHorario = await fetch(`${BASE_URL}/api/horarios`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        hor_id: testHorarioId,
        hor_codigo_tren: 'TEST-EXP-99',
        hor_estacion_origen_id: 'est_03',
        hor_estacion_destino_id: 'est_04',
        hor_servicio_tipo: 'Expedition',
        hor_hora_salida: '06:00',
        hor_hora_llegada: '07:30',
        hor_duracion_min: 90,
        hor_tarifa_regular_pen: 120,
        hor_tarifa_turista_usd: 50,
      }),
    });
    assert(resCreateHorario.status === 200, 'PeruRail puede crear horario ferroviario (200 OK)');

    // 2. Debe poder modificar Horarios (200)
    const resUpdateHorario = await fetch(`${BASE_URL}/api/horarios`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        hor_id: testHorarioId,
        hor_tarifa_regular_pen: 130,
      }),
    });
    assert(resUpdateHorario.status === 200, 'PeruRail puede modificar horario ferroviario (200 OK)');

    // 3. Debe poder eliminar Horarios (200)
    const resDeleteHorario = await fetch(`${BASE_URL}/api/horarios?id=${testHorarioId}`, {
      method: 'DELETE',
      headers,
    });
    assert(resDeleteHorario.status === 200, 'PeruRail puede eliminar horario ferroviario (200 OK)');

    // 4. NO debe poder crear Zonas (403 Forbidden)
    const resZonasForbidden = await fetch(`${BASE_URL}/api/zonas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ zon_nombre: 'Zona No Autorizada PeruRail' }),
    });
    assert(resZonasForbidden.status === 403, 'PeruRail NO puede crear zonas turísticas (403 Forbidden)');

    // 5. NO debe poder sincronizar APIs (403 Forbidden)
    const resSyncForbidden = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers,
    });
    assert(resSyncForbidden.status === 403, 'PeruRail NO puede sincronizar APIs (403 Forbidden)');

    // 6. En auditoría solo debe ver registros de HORARIOS
    const resAudit = await fetch(`${BASE_URL}/api/auditoria`, { headers });
    const auditData = await resAudit.json();
    assert(resAudit.status === 200, 'PeruRail puede consultar auditoría de sus operaciones (200 OK)');
    const allAreHorarios = auditData.data && auditData.data.every(r => r.aud_modulo === 'HORARIOS');
    assert(allAreHorarios, 'PeruRail solo visualiza registros del módulo HORARIOS en auditoría');
  }

  // ----------------------------------------------------
  // TEST GRUPO 4: SUPERADMINISTRADOR MTC (admin@mtc.gob.pe)
  // ----------------------------------------------------
  console.log('\n📌 GRUPO 4: SUPERADMINISTRADOR MTC');
  {
    const auth = await login('admin@mtc.gob.pe', 'admin123');
    assert(auth.status === 200 && auth.data.user.roleRaw === 'ADMIN', 'Login Superadmin MTC exitoso (Rol: ADMIN)');

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': auth.cookie,
    };

    // 1. Puede sincronizar APIs (200)
    const resSync = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers,
    });
    assert(resSync.status === 200, 'Superadmin MTC puede ejecutar sincronización de APIs (200 OK)');

    // 2. Puede consultar auditoría global (200 y múltiples módulos)
    const resAudit = await fetch(`${BASE_URL}/api/auditoria`, { headers });
    const auditData = await resAudit.json();
    assert(resAudit.status === 200, 'Superadmin MTC accede a auditoría global completa (200 OK)');
    const modulos = new Set(auditData.data.map(r => r.aud_modulo));
    assert(modulos.size >= 2, `Superadmin MTC visualiza todos los módulos en auditoría (${Array.from(modulos).join(', ')})`);
  }

  console.log('\n======================================================');
  console.log(`📊 RESULTADO FINAL: ${passed} APROBADAS, ${failed} FALLIDAS`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
