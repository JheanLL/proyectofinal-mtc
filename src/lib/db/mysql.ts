import mysql, { Pool } from 'mysql2/promise';
import { 
  INITIAL_ESTACIONES, 
  INITIAL_ZONAS_TURISTICAS, 
  INITIAL_HORARIOS_TREN, 
  INITIAL_PREFERENCIAS, 
  INITIAL_INTEGRACIONES 
} from './initial-data';

let pool: Pool | null = null;
let isInitialized = false;
export let lastInitError: string | null = null;

export function getMySqlPool(): Pool {
  if (!pool) {
    let host = process.env.host || process.env.AIVEN_MYSQL_HOST || 'api-empleadosgestion.e.aivencloud.com';
    let port = parseInt(process.env.port || process.env.AIVEN_MYSQL_PORT || '13185', 10);
    let user = process.env.user || process.env.AIVEN_MYSQL_USER || 'avnadmin';
    let password = process.env.password || process.env.AIVEN_MYSQL_PASSWORD || '';
    let database = process.env.dbname || process.env.AIVEN_MYSQL_DATABASE || 'defaultdb';

    const connUri = process.env.DATABASE_URL || process.env.serviceuri;
    if (connUri && connUri.startsWith('mysql://')) {
      try {
        const parsed = new URL(connUri);
        host = parsed.hostname || host;
        port = parseInt(parsed.port || String(port), 10);
        if (parsed.username && !parsed.username.includes('CLICK_TO')) {
          user = decodeURIComponent(parsed.username);
        }
        if (parsed.password && !parsed.password.includes('REVEAL_PASSWORD')) {
          password = decodeURIComponent(parsed.password);
        }
        database = parsed.pathname.replace(/^\//, '') || database;
      } catch (e) {
        console.warn('Error parsing DATABASE_URL:', e);
      }
    }

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getMySqlPool();
  const [rows] = await p.query(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: any[] = []) {
  const p = getMySqlPool();
  const [result] = await p.execute(sql, params);
  return result;
}

export async function logAuditoria(
  usuarioId: number | null,
  usuarioEmail: string | null,
  accion: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'RESTORE',
  modulo: 'ZONAS' | 'HORARIOS' | 'INTEGRACIONES' | 'AUTH',
  registroId: string | null = null,
  detalles: any = null,
  ip: string | null = null
) {
  try {
    await execute(
      `INSERT INTO tbl_auditoria (aud_usuario_id, aud_usuario_email, aud_accion, aud_modulo, aud_registro_id, aud_detalles_json, aud_ip_origen)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        usuarioEmail || 'sistema@mtc.gob.pe',
        accion,
        modulo,
        registroId,
        detalles ? JSON.stringify(detalles) : null,
        ip || '127.0.0.1'
      ]
    );
  } catch (err) {
    console.warn('[Auditoría MySQL Warning]', err);
  }
}

export async function initAivenDatabase() {
  if (isInitialized) return true;
  try {
    console.log('[Aiven MySQL] Verificando e inicializando tablas...');

    // 1. tbl_estacion
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_estacion (
        est_id VARCHAR(50) PRIMARY KEY,
        est_codigo VARCHAR(20) NOT NULL UNIQUE,
        est_nombre VARCHAR(150) NOT NULL,
        est_ciudad VARCHAR(100) NOT NULL,
        est_departamento VARCHAR(100) NOT NULL,
        est_altitud_msnm INT NOT NULL,
        est_latitud DECIMAL(10, 8) NOT NULL,
        est_longitud DECIMAL(11, 8) NOT NULL,
        est_descripcion TEXT NOT NULL,
        est_servicios JSON NOT NULL,
        est_imagen_url TEXT NOT NULL,
        est_telefono_contacto VARCHAR(50) NULL,
        est_activo BOOLEAN DEFAULT TRUE,
        est_creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. tbl_zona_turistica
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_zona_turistica (
        zon_id VARCHAR(50) PRIMARY KEY,
        zon_estacion_id VARCHAR(50) NOT NULL,
        zon_nombre VARCHAR(150) NOT NULL,
        zon_categoria VARCHAR(50) NOT NULL,
        zon_descripcion TEXT NOT NULL,
        zon_resumen_corto TEXT NOT NULL,
        zon_distancia_metros INT NOT NULL,
        zon_tiempo_caminata_min INT NOT NULL,
        zon_tiempo_sugerido_visita_min INT NOT NULL,
        zon_dificultad VARCHAR(30) NOT NULL,
        zon_desnivel_metros INT NOT NULL DEFAULT 0,
        zon_puntos_interes JSON NULL,
        zon_recomendaciones JSON NULL,
        zon_latitud DECIMAL(10, 8) NOT NULL,
        zon_longitud DECIMAL(11, 8) NOT NULL,
        zon_imagen_url TEXT NOT NULL,
        zon_precio_entrada_pen DECIMAL(10, 2) NOT NULL DEFAULT 0,
        zon_horario_atencion VARCHAR(100) NOT NULL DEFAULT '08:00 - 17:00',
        zon_es_destacado BOOLEAN DEFAULT FALSE,
        zon_activo BOOLEAN DEFAULT TRUE,
        zon_creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_estacion (zon_estacion_id),
        CONSTRAINT fk_zona_estacion FOREIGN KEY (zon_estacion_id) REFERENCES tbl_estacion(est_id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. tbl_horario_tren
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_horario_tren (
        hor_id VARCHAR(50) PRIMARY KEY,
        hor_codigo_tren VARCHAR(30) NOT NULL,
        hor_estacion_origen_id VARCHAR(50) NOT NULL,
        hor_estacion_destino_id VARCHAR(50) NOT NULL,
        hor_servicio_tipo VARCHAR(50) NOT NULL,
        hor_hora_salida VARCHAR(10) NOT NULL,
        hor_hora_llegada VARCHAR(10) NOT NULL,
        hor_duracion_min INT NOT NULL,
        hor_tarifa_regular_pen DECIMAL(10, 2) NOT NULL,
        hor_tarifa_turista_usd DECIMAL(10, 2) NOT NULL,
        hor_dias_operacion JSON NULL,
        hor_asientos_disponibles INT NOT NULL DEFAULT 40,
        hor_incluye_refrigerio BOOLEAN DEFAULT FALSE,
        hor_activo BOOLEAN DEFAULT TRUE,
        hor_creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_origen_destino (hor_estacion_origen_id, hor_estacion_destino_id),
        CONSTRAINT fk_horario_estacion_origen FOREIGN KEY (hor_estacion_origen_id) REFERENCES tbl_estacion(est_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_horario_estacion_destino FOREIGN KEY (hor_estacion_destino_id) REFERENCES tbl_estacion(est_id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. tbl_pronostico_clima
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_pronostico_clima (
        cli_id VARCHAR(50) PRIMARY KEY,
        cli_estacion_id VARCHAR(50) NOT NULL,
        cli_fecha DATE NOT NULL,
        cli_temp_min_c DECIMAL(4, 1) NOT NULL,
        cli_temp_max_c DECIMAL(4, 1) NOT NULL,
        cli_temp_actual_c DECIMAL(4, 1) NOT NULL,
        cli_condicion_cielo VARCHAR(50) NOT NULL,
        cli_prob_lluvia_pct INT NOT NULL,
        cli_humedad_pct INT NOT NULL,
        cli_viento_kmh INT NOT NULL,
        cli_indice_uv INT NOT NULL,
        cli_alerta_meteorologica JSON NULL,
        cli_recomendacion_ropa JSON NULL,
        cli_fuente_senamhi VARCHAR(100) NOT NULL DEFAULT 'SENAMHI / Open-Meteo',
        cli_fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_estacion_fecha (cli_estacion_id, cli_fecha),
        CONSTRAINT fk_clima_estacion FOREIGN KEY (cli_estacion_id) REFERENCES tbl_estacion(est_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. tbl_preferencia_turistica
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_preferencia_turistica (
        pre_id VARCHAR(50) PRIMARY KEY,
        pre_codigo VARCHAR(50) NOT NULL UNIQUE,
        pre_nombre VARCHAR(100) NOT NULL,
        pre_icono VARCHAR(50) NOT NULL,
        pre_descripcion TEXT NOT NULL,
        pre_color_badge VARCHAR(50) NOT NULL,
        pre_activo BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. tbl_itinerario_consulta
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_itinerario_consulta (
        iti_id VARCHAR(50) PRIMARY KEY,
        iti_codigo VARCHAR(64) NOT NULL UNIQUE,
        iti_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        iti_usuario_nombre VARCHAR(150) NOT NULL,
        iti_usuario_email VARCHAR(150) NULL,
        iti_estacion_origen_id VARCHAR(50) NOT NULL,
        iti_estacion_destino_id VARCHAR(50) NOT NULL,
        iti_zona_turistica_id VARCHAR(50) NOT NULL,
        iti_horario_ida_id VARCHAR(50) NOT NULL,
        iti_horario_retorno_id VARCHAR(50) NOT NULL,
        iti_preferencias_seleccionadas JSON NULL,
        iti_distancia_total_caminata_metros INT NOT NULL,
        iti_tiempo_total_caminata_min INT NOT NULL,
        iti_costo_tren_total_pen DECIMAL(10, 2) NOT NULL,
        iti_costo_tren_total_usd DECIMAL(10, 2) NOT NULL,
        iti_costo_entradas_pen DECIMAL(10, 2) NOT NULL DEFAULT 0,
        iti_costo_total_pen DECIMAL(10, 2) NOT NULL,
        iti_costo_total_usd DECIMAL(10, 2) NOT NULL,
        iti_notas TEXT NULL,
        CONSTRAINT fk_itinerario_origen FOREIGN KEY (iti_estacion_origen_id) REFERENCES tbl_estacion(est_id),
        CONSTRAINT fk_itinerario_destino FOREIGN KEY (iti_estacion_destino_id) REFERENCES tbl_estacion(est_id),
        CONSTRAINT fk_itinerario_zona FOREIGN KEY (iti_zona_turistica_id) REFERENCES tbl_zona_turistica(zon_id),
        CONSTRAINT fk_itinerario_horario_ida FOREIGN KEY (iti_horario_ida_id) REFERENCES tbl_horario_tren(hor_id),
        CONSTRAINT fk_itinerario_horario_retorno FOREIGN KEY (iti_horario_retorno_id) REFERENCES tbl_horario_tren(hor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await execute('ALTER TABLE tbl_itinerario_consulta MODIFY iti_codigo VARCHAR(64) NOT NULL;');
    } catch {}

    // 7. tbl_estado_integracion
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_estado_integracion (
        int_id INT AUTO_INCREMENT PRIMARY KEY,
        int_fuente VARCHAR(50) NOT NULL,
        int_estado VARCHAR(30) NOT NULL,
        int_ultima_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        int_total_registros INT NOT NULL DEFAULT 0,
        int_latencia_ms INT NOT NULL DEFAULT 0,
        int_version_api VARCHAR(100) NOT NULL DEFAULT 'v1.0',
        int_detalles TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. tbl_usuario_sistema (para login de operadores CRUD)
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_usuario_sistema (
        usu_id INT AUTO_INCREMENT PRIMARY KEY,
        usu_email VARCHAR(150) NOT NULL UNIQUE,
        usu_password_hash VARCHAR(255) NOT NULL,
        usu_rol ENUM('ADMIN', 'TRAVEL_GROUP', 'PERURAIL') NOT NULL,
        usu_nombre VARCHAR(150) NOT NULL,
        usu_activo BOOLEAN DEFAULT TRUE,
        usu_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. tbl_auditoria (trazabilidad y auditoría de cambios CRUD)
    await execute(`
      CREATE TABLE IF NOT EXISTS tbl_auditoria (
        aud_id INT AUTO_INCREMENT PRIMARY KEY,
        aud_usuario_id INT NULL,
        aud_usuario_email VARCHAR(150) NULL,
        aud_accion VARCHAR(50) NOT NULL,
        aud_modulo VARCHAR(50) NOT NULL,
        aud_registro_id VARCHAR(50) NULL,
        aud_detalles_json JSON NULL,
        aud_ip_origen VARCHAR(50) NULL,
        aud_fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_aud_usuario (aud_usuario_id),
        CONSTRAINT fk_auditoria_usuario FOREIGN KEY (aud_usuario_id) REFERENCES tbl_usuario_sistema(usu_id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // --- VERIFICAR Y SEMBRAR (SEED) SI ESTÁN VACÍAS ---
    const estacionesCount = await query<{ c: number }>('SELECT COUNT(*) as c FROM tbl_estacion');
    if (estacionesCount[0]?.c === 0) {
      console.log('[Aiven MySQL] Sembrando catálogo inicial de estaciones...');
      for (const e of INITIAL_ESTACIONES) {
        await execute(
          `INSERT INTO tbl_estacion (est_id, est_codigo, est_nombre, est_ciudad, est_departamento, est_altitud_msnm, est_latitud, est_longitud, est_descripcion, est_servicios, est_imagen_url, est_telefono_contacto)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.est_id,
            e.est_codigo,
            e.est_nombre,
            e.est_ciudad,
            e.est_departamento,
            e.est_altitud_msnm,
            e.est_latitud,
            e.est_longitud,
            e.est_descripcion,
            JSON.stringify(e.est_servicios),
            e.est_imagen_url,
            e.est_telefono_contacto || null
          ]
        );
      }
    }

    const zonasCount = await query<{ c: number }>('SELECT COUNT(*) as c FROM tbl_zona_turistica');
    if (zonasCount[0]?.c === 0) {
      console.log('[Aiven MySQL] Sembrando catálogo inicial de zonas turísticas...');
      for (const z of INITIAL_ZONAS_TURISTICAS) {
        await execute(
          `INSERT INTO tbl_zona_turistica (zon_id, zon_estacion_id, zon_nombre, zon_categoria, zon_descripcion, zon_resumen_corto, zon_distancia_metros, zon_tiempo_caminata_min, zon_tiempo_sugerido_visita_min, zon_dificultad, zon_desnivel_metros, zon_puntos_interes, zon_recomendaciones, zon_latitud, zon_longitud, zon_imagen_url, zon_precio_entrada_pen, zon_horario_atencion, zon_es_destacado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            z.zon_id,
            z.zon_estacion_id,
            z.zon_nombre,
            z.zon_categoria,
            z.zon_descripcion,
            z.zon_resumen_corto,
            z.zon_distancia_metros,
            z.zon_tiempo_caminata_min,
            z.zon_tiempo_sugerido_visita_min,
            z.zon_dificultad,
            z.zon_desnivel_metros,
            JSON.stringify(z.zon_puntos_interes),
            JSON.stringify(z.zon_recomendaciones),
            z.zon_latitud,
            z.zon_longitud,
            z.zon_imagen_url,
            z.zon_precio_entrada_pen,
            z.zon_horario_atencion,
            z.zon_es_destacado ? 1 : 0
          ]
        );
      }
    }

    const horariosCount = await query<{ c: number }>('SELECT COUNT(*) as c FROM tbl_horario_tren');
    if (horariosCount[0]?.c === 0) {
      console.log('[Aiven MySQL] Sembrando catálogo inicial de horarios de tren...');
      for (const h of INITIAL_HORARIOS_TREN) {
        await execute(
          `INSERT INTO tbl_horario_tren (hor_id, hor_codigo_tren, hor_estacion_origen_id, hor_estacion_destino_id, hor_servicio_tipo, hor_hora_salida, hor_hora_llegada, hor_duracion_min, hor_tarifa_regular_pen, hor_tarifa_turista_usd, hor_dias_operacion, hor_asientos_disponibles, hor_incluye_refrigerio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            h.hor_id,
            h.hor_codigo_tren,
            h.hor_estacion_origen_id,
            h.hor_estacion_destino_id,
            h.hor_servicio_tipo,
            h.hor_hora_salida,
            h.hor_hora_llegada,
            h.hor_duracion_min,
            h.hor_tarifa_regular_pen,
            h.hor_tarifa_turista_usd,
            JSON.stringify(h.hor_dias_operacion),
            h.hor_asientos_disponibles,
            h.hor_incluye_refrigerio ? 1 : 0
          ]
        );
      }
    }

    const usuariosCount = await query<{ c: number }>('SELECT COUNT(*) as c FROM tbl_usuario_sistema');
    if (usuariosCount[0]?.c === 0) {
      console.log('[Aiven MySQL] Creando usuarios administrativos para Travel Group, PeruRail y MTC...');
      await execute(`
        INSERT INTO tbl_usuario_sistema (usu_email, usu_password_hash, usu_rol, usu_nombre)
        VALUES 
        ('admin@mtc.gob.pe', '$2b$10$.6Wq7zotY1GOnWyh9bt6COrSUGJoufV1LXJ6Vrbt0hfV2nv0qYDZ2', 'ADMIN', 'Administrador General MTC'),
        ('operaciones@travelgroup.pe', '$2b$10$QxXVAJBC5h0LURn.lkxY8OeNw86UoJfdAbvy9sXJ/UUg2j2Schsse', 'TRAVEL_GROUP', 'Gestor Travel Group Perú'),
        ('logistica@perurail.com', '$2b$10$jcbgDL3H6Yw96y04RSoeHOKYw2i9vsxTC58yIps4G4rUuXgVFxGA2', 'PERURAIL', 'Coordinador PeruRail');
      `);
    }

    const prefCount = await query<{ c: number }>('SELECT COUNT(*) as c FROM tbl_preferencia_turistica');
    if (prefCount[0]?.c === 0) {
      console.log('[Aiven MySQL] Sembrando preferencias turísticas...');
      for (const p of INITIAL_PREFERENCIAS) {
        await execute(
          `INSERT INTO tbl_preferencia_turistica (pre_id, pre_codigo, pre_nombre, pre_icono, pre_descripcion, pre_color_badge, pre_activo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [p.pre_id, p.pre_codigo, p.pre_nombre, p.pre_icono, p.pre_descripcion, p.pre_color_badge, 1]
        );
      }
    }

    const intCount = await query<{ c: number }>('SELECT COUNT(*) as c FROM tbl_estado_integracion');
    if (intCount[0]?.c === 0) {
      console.log('[Aiven MySQL] Sembrando estado de integraciones...');
      for (const i of INITIAL_INTEGRACIONES) {
        await execute(
          `INSERT INTO tbl_estado_integracion (int_fuente, int_estado, int_ultima_sincronizacion, int_total_registros, int_latencia_ms, int_version_api, int_detalles)
           VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
          [i.int_fuente, i.int_estado, i.int_total_registros, i.int_latencia_ms, i.int_version_api, i.int_detalles]
        );
      }
    }

    isInitialized = true;
    console.log('[Aiven MySQL] Inicialización y verificación DDL completada exitosamente.');
    return true;
  } catch (error: any) {
    lastInitError = error?.message || String(error);
    console.error('[Aiven MySQL Error en Inicialización]', error);
    return false;
  }
}
