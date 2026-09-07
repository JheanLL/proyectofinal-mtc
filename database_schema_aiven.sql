-- ==============================================================================
-- PROYECTO FINAL - MINISTERIO DE TRANSPORTES Y COMUNICACIONES (MTC)
-- PLATAFORMA WEB: RUTAS FERROVIARIAS & PEATONALES TURÍSTICAS
-- SCRIPT DDL Y DML MAESTRO PARA AIVEN FOR MYSQL Y MYSQL WORKBENCH (DIAGRAMA E-R)
-- ==============================================================================
-- Convención estricta: Prefijos de tablas 'tbl_' y campos de 3 letras.
-- Compatibilidad: MySQL 8.0+ / Aiven Cloud / MySQL Workbench / DBeaver.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS bd_zonas_turisticas_mtc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bd_zonas_turisticas_mtc;

-- Desactivar temporalmente revisión de claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS tbl_auditoria;
DROP TABLE IF EXISTS tbl_itinerario_consulta;
DROP TABLE IF EXISTS tbl_pronostico_clima;
DROP TABLE IF EXISTS tbl_horario_tren;
DROP TABLE IF EXISTS tbl_zona_turistica;
DROP TABLE IF EXISTS tbl_estacion;
DROP TABLE IF EXISTS tbl_preferencia_turistica;
DROP TABLE IF EXISTS tbl_estado_integracion;
DROP TABLE IF EXISTS tbl_usuario_sistema;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. TABLA: tbl_usuario_sistema (Cuentas de Operadores Administrativos)
-- NOTA ARQUITECTÓNICA CRÍTICA:
-- Solo existen 3 cuentas con credenciales para los operadores del sistema.
-- Los turistas/ciudadanos NO tienen cuenta en la base de datos (acceso 100% local).
-- ==============================================================================
CREATE TABLE tbl_usuario_sistema (
  usu_id INT AUTO_INCREMENT PRIMARY KEY,
  usu_email VARCHAR(150) NOT NULL UNIQUE,
  usu_password_hash VARCHAR(255) NOT NULL,
  usu_rol ENUM('ADMIN', 'TRAVEL_GROUP', 'PERURAIL') NOT NULL,
  usu_nombre VARCHAR(150) NOT NULL,
  usu_activo BOOLEAN DEFAULT TRUE,
  usu_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usu_email (usu_email),
  INDEX idx_usu_rol (usu_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cuentas de acceso administrativo RBAC (MTC, Travel Group y PeruRail)';

-- ==============================================================================
-- 2. TABLA: tbl_auditoria (Bitácora no repudiable de eventos CRUD y accesos)
-- ==============================================================================
CREATE TABLE tbl_auditoria (
  aud_id INT AUTO_INCREMENT PRIMARY KEY,
  aud_usuario_id INT NULL,
  aud_usuario_email VARCHAR(150) NULL,
  aud_accion ENUM('LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'SYNC') NOT NULL,
  aud_modulo ENUM('ZONAS', 'HORARIOS', 'INTEGRACIONES', 'AUTH') NOT NULL,
  aud_registro_id VARCHAR(50) NULL,
  aud_detalles_json JSON NULL,
  aud_ip_origen VARCHAR(50) NULL DEFAULT '127.0.0.1',
  aud_fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aud_usuario_fecha (aud_usuario_id, aud_fecha_hora),
  INDEX idx_aud_modulo_accion (aud_modulo, aud_accion),
  CONSTRAINT fk_auditoria_usuario
    FOREIGN KEY (aud_usuario_id)
    REFERENCES tbl_usuario_sistema (usu_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro inmutable de trazabilidad y auditoría de operaciones CRUD';

-- ==============================================================================
-- 3. TABLA: tbl_estacion (Estaciones de la Red Ferroviaria PeruRail / MTC)
-- ==============================================================================
CREATE TABLE tbl_estacion (
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
  est_creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_est_codigo (est_codigo),
  INDEX idx_est_ciudad (est_ciudad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Estaciones ferroviarias de conexión logística';

-- ==============================================================================
-- 4. TABLA: tbl_zona_turistica (Atractivos a Pie - Gestionado por Travel Group)
-- ==============================================================================
CREATE TABLE tbl_zona_turistica (
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
  zon_precio_entrada_pen DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  zon_horario_atencion VARCHAR(100) NOT NULL DEFAULT '08:00 - 17:00',
  zon_es_destacado BOOLEAN DEFAULT FALSE,
  zon_activo BOOLEAN DEFAULT TRUE,
  zon_creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_zon_estacion (zon_estacion_id),
  INDEX idx_zon_categoria (zon_categoria),
  CONSTRAINT fk_zona_estacion
    FOREIGN KEY (zon_estacion_id)
    REFERENCES tbl_estacion (est_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de zonas turísticas a pie en tramo único de ida y vuelta';

-- ==============================================================================
-- 5. TABLA: tbl_horario_tren (Frecuencias y Tarifas Ferroviarias - PeruRail)
-- ==============================================================================
CREATE TABLE tbl_horario_tren (
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
  INDEX idx_hor_origen_destino (hor_estacion_origen_id, hor_estacion_destino_id),
  CONSTRAINT fk_horario_estacion_origen
    FOREIGN KEY (hor_estacion_origen_id)
    REFERENCES tbl_estacion (est_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_horario_estacion_destino
    FOREIGN KEY (hor_estacion_destino_id)
    REFERENCES tbl_estacion (est_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Horarios, servicios y tarifarios de trenes PeruRail';

-- ==============================================================================
-- 6. TABLA: tbl_pronostico_clima (Integración Meteorológica SENAMHI)
-- ==============================================================================
CREATE TABLE tbl_pronostico_clima (
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
  INDEX idx_cli_estacion_fecha (cli_estacion_id, cli_fecha),
  CONSTRAINT fk_clima_estacion
    FOREIGN KEY (cli_estacion_id)
    REFERENCES tbl_estacion (est_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pronósticos climáticos y alertas meteorológicas oficiales por estación';

-- ==============================================================================
-- 7. TABLA: tbl_preferencia_turistica (Taxonomía de Intereses Turísticos)
-- ==============================================================================
CREATE TABLE tbl_preferencia_turistica (
  pre_id VARCHAR(50) PRIMARY KEY,
  pre_codigo VARCHAR(50) NOT NULL UNIQUE,
  pre_nombre VARCHAR(100) NOT NULL,
  pre_icono VARCHAR(50) NOT NULL,
  pre_descripcion TEXT NOT NULL,
  pre_color_badge VARCHAR(50) NOT NULL,
  pre_activo BOOLEAN DEFAULT TRUE,
  INDEX idx_pre_codigo (pre_codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Categorías de preferencias para el asesor inteligente de rutas';

-- ==============================================================================
-- 8. TABLA: tbl_itinerario_consulta (Informes Emitidos y Tokens No Adivinables)
-- NOTA: Permite consulta pública universal por código hash sin requerir cuenta.
-- ==============================================================================
CREATE TABLE tbl_itinerario_consulta (
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
  iti_costo_entradas_pen DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  iti_costo_total_pen DECIMAL(10, 2) NOT NULL,
  iti_costo_total_usd DECIMAL(10, 2) NOT NULL,
  iti_notas TEXT NULL,
  INDEX idx_iti_codigo (iti_codigo),
  CONSTRAINT fk_itinerario_origen
    FOREIGN KEY (iti_estacion_origen_id) REFERENCES tbl_estacion (est_id),
  CONSTRAINT fk_itinerario_destino
    FOREIGN KEY (iti_estacion_destino_id) REFERENCES tbl_estacion (est_id),
  CONSTRAINT fk_itinerario_zona
    FOREIGN KEY (iti_zona_turistica_id) REFERENCES tbl_zona_turistica (zon_id),
  CONSTRAINT fk_itinerario_horario_ida
    FOREIGN KEY (iti_horario_ida_id) REFERENCES tbl_horario_tren (hor_id),
  CONSTRAINT fk_itinerario_horario_retorno
    FOREIGN KEY (iti_horario_retorno_id) REFERENCES tbl_horario_tren (hor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro de itinerarios consultados y códigos para compartición multicanal';

-- ==============================================================================
-- 9. TABLA: tbl_estado_integracion (Monitoreo de APIs Externas y Latencias)
-- ==============================================================================
CREATE TABLE tbl_estado_integracion (
  int_id INT AUTO_INCREMENT PRIMARY KEY,
  int_fuente VARCHAR(50) NOT NULL,
  int_estado VARCHAR(30) NOT NULL,
  int_ultima_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  int_total_registros INT NOT NULL DEFAULT 0,
  int_latencia_ms INT NOT NULL DEFAULT 0,
  int_version_api VARCHAR(100) NOT NULL DEFAULT 'v1.0',
  int_detalles TEXT NULL,
  INDEX idx_int_fuente (int_fuente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Estado de sincronización y latencia de servicios SENAMHI, PeruRail y Travel Group';

-- ==============================================================================
-- INSERCIÓN DE DATOS SEMILLA (SEEDS)
-- ==============================================================================

-- 1. Inserción de las 3 Cuentas Administrativas Oficiales (RBAC)
INSERT INTO tbl_usuario_sistema (usu_id, usu_email, usu_password_hash, usu_rol, usu_nombre, usu_activo)
VALUES 
  (1, 'admin@mtc.gob.pe', 'scrypt:admin123_hash', 'ADMIN', 'Administrador General MTC', TRUE),
  (2, 'operaciones@travelgroup.pe', 'scrypt:travel123_hash', 'TRAVEL_GROUP', 'Gestor Travel Group Perú', TRUE),
  (3, 'logistica@perurail.com', 'scrypt:perurail123_hash', 'PERURAIL', 'Coordinador PeruRail', TRUE)
ON DUPLICATE KEY UPDATE usu_nombre = VALUES(usu_nombre);

-- 2. Inserción de Estaciones Ferroviarias
INSERT INTO tbl_estacion (est_id, est_codigo, est_nombre, est_ciudad, est_departamento, est_altitud_msnm, est_latitud, est_longitud, est_descripcion, est_servicios, est_imagen_url)
VALUES
('est_01', 'EST-WNC', 'Estación Wánchaq (Cusco)', 'Cusco', 'Cusco', 3399, -13.52260000, -71.96780000, 'Principal estación ferroviaria de Cusco para salidas turísticas.', '["Sala VIP", "Custodia de Equipaje", "Cafetería", "WiFi"]', 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80'),
('est_02', 'EST-POR', 'Estación Poroy', 'Poroy', 'Cusco', 3499, -13.49120000, -72.04560000, 'Estación intermedia estratégica situada en el Valle de Poroy.', '["Estacionamiento", "Check-in Rápido", "Tópico de Emergencia"]', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80'),
('est_03', 'EST-OLL', 'Estación Ollantaytambo', 'Ollantaytambo', 'Cusco', 2792, -13.25840000, -72.26330000, 'Centro neurálgico del Valle Sagrado para conexiones directas a Machu Picchu Pueblo.', '["Restaurante", "Cajero Automático", "Información Turística", "Lockers"]', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80'),
('est_04', 'EST-MCH', 'Estación Machu Picchu (Aguas Calientes)', 'Aguas Calientes', 'Cusco', 2040, -13.15470000, -72.52550000, 'Estación terminal a orillas del río Urubamba y punto de inicio de circuitos a pie.', '["Sala de Espera", "Asistencia Médica", "Servicios Higiénicos", "Puntos de Recarga"]', 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE est_nombre = VALUES(est_nombre);

-- 3. Inserción de Preferencias Turísticas
INSERT INTO tbl_preferencia_turistica (pre_id, pre_codigo, pre_nombre, pre_icono, pre_descripcion, pre_color_badge, pre_activo)
VALUES
('pre_01', 'naturaleza', 'Naturaleza & Paisajes', 'Trees', 'Caminatas ecológicas, cataratas y orquídeas.', 'bg-emerald-100 text-emerald-800', TRUE),
('pre_02', 'historia', 'Historia & Cultura', 'Landmark', 'Sitios arqueológicos, templos incas y museos.', 'bg-amber-100 text-amber-800', TRUE),
('pre_03', 'gastronomia', 'Gastronomía Local', 'Utensils', 'Rutas culinarias, mercados tradicionales y café de altura.', 'bg-orange-100 text-orange-800', TRUE),
('pre_04', 'aventura', 'Aventura & Trekking', 'Compass', 'Senderismo de montaña y miradores elevados.', 'bg-red-100 text-red-800', TRUE)
ON DUPLICATE KEY UPDATE pre_nombre = VALUES(pre_nombre);

-- 4. Inserción de Estado de Integración de Servicios
INSERT INTO tbl_estado_integracion (int_id, int_fuente, int_estado, int_ultima_sincronizacion, int_total_registros, int_latencia_ms, int_version_api, int_detalles)
VALUES
(1, 'SENAMHI', 'OPERATIVO', NOW(), 4, 320, 'v2.1-REST', 'Previsiones meteorológicas e índices UV actualizados.'),
(2, 'PeruRail', 'OPERATIVO', NOW(), 27, 180, 'v3.0-SOAP-JSON', 'Tarifarios y frecuencias ferroviarias sincronizadas.'),
(3, 'Travel Group Perú', 'OPERATIVO', NOW(), 13, 210, 'v1.4-REST', 'Catálogo de circuitos peatonales georreferenciados.')
ON DUPLICATE KEY UPDATE int_estado = VALUES(int_estado);

-- ==============================================================================
-- FIN DEL SCRIPT DDL MAESTRO
-- ==============================================================================
