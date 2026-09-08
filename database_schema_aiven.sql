-- ==============================================================================
-- NOTA DE ARQUITECTURA: SIMULACIÓN DE APIS (MOCK DATA PROVIDER EN AIVEN MYSQL)
-- ==============================================================================
-- En cumplimiento de los requerimientos del MTC y dado que PeruRail y Travel Group
-- son entidades privadas que no poseen APIs públicas abiertas en internet, este script
-- DDL incluye el 'Banco de Datos Simulado' en Aiven MySQL para las tablas de estaciones,
-- horarios ferroviarios y circuitos turísticos peatonales.
-- Dichos datos emulan la infraestructura real del corredor Cusco - Machu Picchu
-- y son servidos por los endpoints REST (/api/estaciones, /api/horarios, /api/zonas)
-- simulando ser APIs externas de dichas empresas (Mock Provider).
-- En caso de integración futura con servicios web externos reales, estos conectores
-- permitirían sustituir el mock provider en el backend sin requerir cambios en el frontend.
-- En contraste, la integración meteorológica del SENAMHI (/api/senamhi) opera con una
-- API satelital real en tiempo real: Open-Meteo (https://api.open-meteo.com/v1/forecast).
-- ==============================================================================

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

DROP TABLE IF EXISTS tbl_filtro_exclusion;
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
  aud_accion ENUM('LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'SYNC', 'RESTORE') NOT NULL,
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
  zon_imagen_url MEDIUMTEXT NOT NULL,
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
-- 4. SEED SIMULADO TRAVEL GROUP PERÚ: 12 ZONAS TURÍSTICAS PEATONALES
INSERT INTO tbl_zona_turistica (zon_id, zon_estacion_id, zon_nombre, zon_categoria, zon_descripcion, zon_resumen_corto, zon_distancia_metros, zon_tiempo_caminata_min, zon_tiempo_sugerido_visita_min, zon_dificultad, zon_desnivel_metros, zon_puntos_interes, zon_recomendaciones, zon_latitud, zon_longitud, zon_imagen_url, zon_precio_entrada_pen, zon_horario_atencion, zon_es_destacado, zon_activo)
VALUES
('zon_02', 'est_04', 'Jardines Ecológicos y Cataratas de Mandor', 'naturaleza', 'Paseo ecológico bordeando la vía férrea y el río Vilcanota. Hogar del gallito de las rocas, colibríes y más de 200 especies de orquídeas autóctonas. Al final del sendero espera una imponente cascada de 30 metros.', 'Reserva natural con cascada cristalina, orquídeas nativas y aves endémicas.', 3800, 45, 120, 'Moderado', 80, '["Sendero botánico de orquídeas y bromelias","Mirador del cañón del Vilcanota","Catarata de Mandor y poza de relajación","Casona histórica de la familia Mandor"]', '["Usar repelente ecológico y bloqueador solar biodegradable","Llevar calzado de caminata con buena tracción","Llevar impermeable ligero para posibles lloviznas"]', -13.14250000, -72.54820000, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', 10.00, '06:30 - 16:30 (Lunes a Domingo)', 1, 1),
('zon_03', 'est_04', 'Museo de Sitio Manuel Chávez Ballón & Jardín Botánico', 'arqueologia', 'Ubicado al pie de la montaña de Machu Picchu cruzando el Puente Ruinas. Exhibe piezas líticas, cerámicas, herramientas de metalurgia inca y paneles interactivos sobre la ingeniería incaica.', 'Colección arqueológica de las excavaciones de Machu Picchu y sendero botánico.', 1900, 25, 75, 'Fácil', 40, '["Puente Ruinas sobre el río Urubamba","Salas temáticas de arquitectura e ingeniería lítica inca","Jardín botánico con flora endémica del Santuario"]', '["Presentar DNI o Pasaporte en la entrada","Se puede combinar con la caminata hacia Mandor","Acceso peatonal señalizado con paneles del MTC"]', -13.15830000, -72.53690000, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80', 22.00, '09:00 - 16:00 (Lunes a Sábado)', 0, 1),
('zon_04', 'est_04', 'Mercado Artesanal & Paseo de Esculturas Líticas', 'cultura', 'Justo a la salida de la estación ferroviaria se despliega este circuito peatonal repleto de artesanías finas, tejidos de alpaca y esculturas esculpidas en granito que representan deidades andinas.', 'Galería peatonal abierta con más de 37 esculturas en piedra y textilería tradicional.', 200, 3, 45, 'Fácil', 5, '["Escultura del Cóndor Andino y la Pachamama","Puestos de textilería tradicional y platería","Cafeterías de especialidad con granos de Quillabamba"]', '["Ideal para recorrer mientras se espera la salida del tren","Aceptan pagos con tarjeta y efectivo en soles"]', -13.15420000, -72.52480000, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80', 0.00, '06:00 - 21:00 (Lunes a Domingo)', 0, 1),
('zon_05', 'est_03', 'Fortaleza y Complejo Arqueológico de Ollantaytambo', 'arqueologia', 'Una de las mayores joyas de la arquitectura incaica. Caminando desde la estación por las calles empedradas se llega a las imponentes terrazas megalíticas y al Templo del Sol, escenario de la gran victoria inca ante los conquistadores.', 'Colosal fortaleza militar, ceremonial y agrícola con el imponente Templo del Sol.', 650, 9, 120, 'Moderado', 65, '["Andenería monumental de ascenso","Templo de las Diez Ventanas","Muro de los Seis Monolitos de Granito Rosado","Baño de la Ñusta y fuentes hidráulicas ceremoniales"]', '["Requiere Boleto Turístico del Cusco (BTC)","Llevar agua y sombrero de ala ancha","El ascenso tiene escalinatas empinadas pero con descansos"]', -13.25750000, -72.26550000, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80', 70.00, '07:00 - 17:30 (Lunes a Domingo)', 1, 1),
('zon_06', 'est_03', 'Colcas Sagradas de Pinkuylluna & Mirador', 'aventura', 'Sendero peatonal de ascenso libre hacia los depósitos incas construidos en la ladera vertical del cerro Pinkuylluna. Ofrece una vista aérea inigualable del trazado urbano inca y de la fortaleza.', 'Almacenes agrícolas incas suspendidos en el acantilado frente a la fortaleza.', 950, 20, 60, 'Moderado', 95, '["Almacenes incas de granos con sistema de ventilación natural","Vista panorámica en 360° del Valle Sagrado","Rostro esculpido del dios Tunupa en la roca"]', '["Ingreso libre y gratuito","Subir con calzado con agarre, no apto para personas con vértigo severo","Último ingreso recomendado a las 16:00"]', -13.25580000, -72.26180000, 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=80', 0.00, '07:00 - 16:30 (Lunes a Domingo)', 1, 1),
('zon_07', 'est_03', 'Callejones y Pueblo Viviente Inca de Ollantaytambo', 'historia', 'Recorrido a pie por las "canchas" o manzanas incas originales, con canales de agua limpia corriendo por el centro de las calles empedradas y portadas de doble jamba aún habitadas por pobladores locales.', 'El único pueblo inca que conserva intacto su trazado urbanístico original desde el siglo XV.', 400, 6, 60, 'Fácil', 10, '["Plaza de Armas de Ollantaytambo","Callejón de la Fortaleza y canales hidráulicos originales","Picanterías y cafeterías tradicionales cusqueñas"]', '["Paseo muy accesible para todas las edades","Excelente para tomar fotografías arquitectónicas","Probar la tradicional chicha de jora o café orgánico"]', -13.25820000, -72.26250000, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80', 0.00, 'Abierto 24 horas (Circuito público)', 0, 1),
('zon_08', 'est_01', 'Mercado Central de San Pedro', 'gastronomia', 'Frente a la misma estación, diseñado por Gustave Eiffel en 1925. Encontrarás secciones de jugos naturales, panes tradicionales de Oropesa, quesos andinos, hierbas medicinales y comida típica.', 'Epicentro gastronómico y cultural más vibrante y colorido del Cusco.', 120, 2, 60, 'Fácil', 0, '["Sección de jugos exóticos y frutas andinas","Pasillo de panes chuta y queso paria","Zona de artesanías y amuletos tradicionales (Pachamama)"]', '["Probar el caldo de gallina o lechón cusqueño","Llevar efectivo para compras menores","Cuidar pertenencias personales en horas punta"]', -13.52120000, -71.98220000, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 0.00, '06:00 - 18:30 (Lunes a Domingo)', 1, 1),
('zon_09', 'est_01', 'Plaza de Armas, Basílica Catedral y Templo de la Compañía', 'historia', 'Caminando por la histórica calle Santa Clara y Marqués se desemboca en la imponente Plaza Mayor del Cusco, flanqueada por la Catedral, el templo de la Compañía de Jesús y portales coloniales.', 'Corazón monumental del Imperio Inca y la época virreinal del Perú.', 750, 10, 90, 'Fácil', 15, '["Arco de Santa Clara","Basílica Catedral del Cusco y lienzos de la Escuela Cusqueña","Templo de la Compañía de Jesús","Pileta central con la estatua del Inca Pachacútec"]', '["Hermosa iluminación nocturna a partir de las 18:00","Paseo 100% peatonal por el eje procesional"]', -13.51680000, -71.97880000, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80', 40.00, '10:00 - 18:00 (Catedral)', 1, 1),
('zon_10', 'est_01', 'Calle Hatun Rumiyoc & Piedra de los Doce Ángulos', 'arqueologia', 'Continuando desde la Plaza de Armas por el callejón Hatun Rumiyoc, se encuentra este icónico muro inca que formó parte del palacio del inca Inca Roca, hoy Palacio Arzobispal.', 'Obra maestra de la cantería inca tallada con precisión milimétrica.', 1100, 14, 30, 'Fácil', 20, '["Piedra de los 12 Ángulos perfectamente encajada","Muro megalítico del Palacio de Inca Roca","Paso hacia el tradicional barrio de San Blas"]', '["No tocar la superficie lítica para preservar el patrimonio","Visita libre en cualquier horario del día"]', -13.51590000, -71.97630000, 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=80', 0.00, 'Abierto 24 horas', 0, 1),
('zon_11', 'est_02', 'Mirador Paisajístico del Valle de Poroy & Bosque Nativo', 'fotografia', 'Sendero campestre que asciende suavemente desde la estación hasta un mirador natural rodeado de eucaliptos y quenuales, ideal para disfrutar del aire puro antes de abordar el tren.', 'Vista panorámica de las colinas andinas y los campos de cultivo de maíz.', 600, 9, 40, 'Fácil', 30, '["Mirador del ferrocarril sur-oriente","Bosque de queñuales y flora altoandina","Puntos de descanso con bancas rústicas"]', '["Llevar abrigo ligero debido al viento matutino","Caminar con tiempo holgado antes del chequeo de boletos"]', -13.49350000, -72.04820000, 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80', 0.00, 'Abierto en horario diurno', 0, 1),
('zon_12', 'est_05', 'Sendero Ribereño del Río Vilcanota & Taller Cerámico Seminario', 'cultura', 'Tranquila caminata bajo árboles nativos que conecta la estación de tren con la plaza principal de Urubamba y el afamado taller de Pablo Seminario, referente del arte cerámico contemporáneo del Perú.', 'Paseo sombreado junto al río y visita a la prestigiosa cerámica de estilo precolombino.', 750, 10, 60, 'Fácil', 10, '["Paseo peatonal ribereño del Vilcanota","Exposición y hornos del Taller Seminario","Plaza de Armas y Templo San Pedro de Urubamba"]', '["El taller ofrece demostraciones en vivo gratuitas","Clima cálido durante todo el año"]', -13.30320000, -72.11900000, 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80', 0.00, '08:00 - 18:00 (Lunes a Sábado)', 0, 1),
('zon_13', 'est_06', 'Muelle Turístico del Lago Titicaca & Malecón Ecoturístico', 'naturaleza', 'Saliendo de la estación ferroviaria de Puno, a tan solo 4 minutos a pie se extiende el muelle turístico donde zarpan las lanchas hacia las islas flotantes de los Uros, con feria de artesanías y miradores lacustres.', 'Malecón peatonal con vista panorámica a la bahía del lago navegable más alto del mundo.', 350, 5, 75, 'Fácil', 5, '["Faro monumental de la bahía de Puno","Embarcadero tradicional de totora","Artesanías en lana de alpaca y totora trenzada"]', '["Llevar cortaviento y abrigo térmico por el frío altiplánico","Excelente punto para fotografiar aves acuáticas como el zambullidor del Titicaca"]', -15.83400000, -70.01650000, 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=1200&q=80', 0.00, '06:00 - 19:00 (Lunes a Domingo)', 1, 1)
ON DUPLICATE KEY UPDATE zon_nombre = VALUES(zon_nombre);

-- 5. SEED SIMULADO PERURAIL: 27 HORARIOS, FRECUENCIAS Y TARIFAS MULTIMONEDA
INSERT INTO tbl_horario_tren (hor_id, hor_codigo_tren, hor_estacion_origen_id, hor_estacion_destino_id, hor_servicio_tipo, hor_hora_salida, hor_hora_llegada, hor_duracion_min, hor_tarifa_regular_pen, hor_tarifa_turista_usd, hor_dias_operacion, hor_asientos_disponibles, hor_incluye_refrigerio, hor_activo)
VALUES
('hor_01', 'EXP-61', 'est_03', 'est_04', 'Expedition', '06:10', '07:40', 90, 120.00, 54.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 42, 0, 1),
('hor_02', 'VIS-31', 'est_03', 'est_04', 'Vistadome', '07:05', '08:27', 82, 190.00, 85.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 28, 1, 1),
('hor_03', 'VOB-501', 'est_03', 'est_04', 'Vistadome Observatory', '08:53', '10:29', 96, 245.00, 110.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 18, 1, 1),
('hor_04', 'LOC-21', 'est_03', 'est_04', 'Tren Local', '05:00', '06:45', 105, 12.00, 5.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 90, 0, 1),
('hor_05', 'EXP-64', 'est_04', 'est_03', 'Expedition', '15:20', '17:08', 108, 120.00, 54.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 36, 0, 1),
('hor_06', 'VIS-32', 'est_04', 'est_03', 'Vistadome', '16:22', '18:10', 108, 190.00, 85.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 22, 1, 1),
('hor_07', 'VOB-504', 'est_04', 'est_03', 'Vistadome Observatory', '17:23', '19:02', 99, 245.00, 110.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 15, 1, 1),
('hor_08', 'VIS-33', 'est_02', 'est_04', 'Vistadome', '07:35', '10:52', 197, 260.00, 115.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 32, 1, 1),
('hor_09', 'HIR-01', 'est_02', 'est_04', 'Hiram Bingham', '09:05', '12:24', 199, 1250.00, 520.00, '["Lunes","Miércoles","Viernes","Sábado"]', 12, 1, 1),
('hor_10', 'EXP-21', 'est_01', 'est_04', 'Expedition', '06:40', '10:15', 215, 210.00, 90.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 40, 0, 1),
('hor_11', 'VIS-34', 'est_04', 'est_02', 'Vistadome', '16:43', '20:00', 197, 260.00, 115.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 28, 1, 1),
('hor_12', 'HIR-02', 'est_04', 'est_02', 'Hiram Bingham', '17:50', '21:16', 206, 1250.00, 520.00, '["Lunes","Miércoles","Viernes","Sábado"]', 14, 1, 1),
('hor_13', 'EXP-22', 'est_04', 'est_01', 'Expedition', '14:30', '18:05', 215, 210.00, 90.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 38, 0, 1),
('hor_14', 'SV-81', 'est_05', 'est_04', 'Vistadome', '06:50', '09:25', 155, 220.00, 98.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 30, 1, 1),
('hor_15', 'SV-82', 'est_04', 'est_05', 'Vistadome', '15:48', '18:10', 142, 220.00, 98.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 30, 1, 1),
('hor_16', 'VST-10', 'est_03', 'est_05', 'Tren Local', '10:45', '11:30', 45, 25.00, 10.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 45, 0, 1),
('hor_17', 'VST-11', 'est_05', 'est_03', 'Tren Local', '18:30', '19:15', 45, 25.00, 10.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 45, 0, 1),
('hor_18', 'TIT-01', 'est_01', 'est_06', 'Vistadome Observatory', '07:10', '17:40', 630, 650.00, 270.00, '["Miércoles","Viernes","Domingo"]', 25, 1, 1),
('hor_19', 'TIT-02', 'est_06', 'est_01', 'Vistadome Observatory', '07:30', '18:00', 630, 650.00, 270.00, '["Lunes","Jueves","Sábado"]', 25, 1, 1),
('hor_20', 'SV-71', 'est_01', 'est_05', 'Vistadome', '07:05', '08:45', 100, 120.00, 55.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 38, 1, 1),
('hor_21', 'SV-72', 'est_05', 'est_01', 'Vistadome', '17:30', '19:10', 100, 120.00, 55.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 38, 1, 1),
('hor_22', 'OLL-11', 'est_01', 'est_03', 'Expedition', '06:40', '08:35', 115, 110.00, 48.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 42, 1, 1),
('hor_23', 'OLL-12', 'est_03', 'est_01', 'Expedition', '18:10', '20:05', 115, 110.00, 48.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 42, 1, 1),
('hor_24', 'POR-31', 'est_02', 'est_03', 'Expedition', '07:20', '08:50', 90, 95.00, 40.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 40, 1, 1),
('hor_25', 'POR-32', 'est_03', 'est_02', 'Expedition', '17:45', '19:15', 90, 95.00, 40.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 40, 1, 1),
('hor_26', 'URU-41', 'est_02', 'est_05', 'Vistadome', '07:50', '09:10', 80, 105.00, 45.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 36, 1, 1),
('hor_27', 'URU-42', 'est_05', 'est_02', 'Vistadome', '18:00', '19:20', 80, 105.00, 45.00, '["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]', 36, 1, 1)
ON DUPLICATE KEY UPDATE hor_codigo_tren = VALUES(hor_codigo_tren);


-- 10. TABLA: tbl_filtro_exclusion (Filtros de Exclusión y Bajas para Serverless)
-- ==============================================================================
CREATE TABLE tbl_filtro_exclusion (
  fil_id INT AUTO_INCREMENT PRIMARY KEY,
  fil_modulo ENUM('ZONAS', 'HORARIOS') NOT NULL,
  fil_registro_id VARCHAR(50) NOT NULL,
  fil_motivo VARCHAR(255) NOT NULL DEFAULT 'Exclusión por administración',
  fil_usuario_email VARCHAR(150) NULL,
  fil_activo BOOLEAN DEFAULT TRUE,
  fil_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fil_modulo_registro (fil_modulo, fil_registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de filtros y exclusiones para registros eliminados u ocultados en servidor';

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
-- ------------------------------------------------------------------------------
-- 2. SEED OFICIAL: CATÁLOGO MAESTRO DE ESTACIONES FERROVIARIAS (PeruRail / MTC)
-- Nota Arquitectónica: Este seed garantiza la Integridad Referencial (Foreign Keys)
-- en MySQL (tbl_zona_turistica y tbl_horario_tren). En tiempo de ejecución, el cliente
-- web consume esta infraestructura dinámicamente mediante el endpoint REST GET /api/estaciones.
-- ------------------------------------------------------------------------------
INSERT INTO tbl_estacion (est_id, est_codigo, est_nombre, est_ciudad, est_departamento, est_altitud_msnm, est_latitud, est_longitud, est_descripcion, est_servicios, est_imagen_url)
VALUES
('est_01', 'EST-CUS-SP', 'Estación San Pedro (Cusco)', 'Cusco', 'Cusco', 3399, -13.52040000, -71.98280000, 'Ubicada en el corazón histórico de Cusco, frente al célebre Mercado Central y a escasas cuadras de la Plaza de Armas.', '["Boletería PeruRail", "Sala de espera VIP", "Información turística iPerú", "Custodia de equipaje", "Cafetería andina", "Wifi gratuito"]', 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=80'),
('est_02', 'EST-CUS-POR', 'Estación Poroy (Cusco)', 'Poroy', 'Cusco', 3499, -13.49120000, -72.04650000, 'Punto de partida ideal en las afueras de la ciudad imperial de Cusco hacia el Valle Sagrado y Machu Picchu.', '["Boletería", "Estacionamiento vigilado", "Servicio de maleteros", "Cafetería", "Servicios higiénicos accesibles"]', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80'),
('est_03', 'EST-VAL-OLL', 'Estación Ollantaytambo', 'Ollantaytambo', 'Cusco', 2792, -13.25890000, -72.26380000, 'Principal nodo ferroviario del Valle Sagrado con conexión directa diaria hacia Machu Picchu.', '["Boletería automatizada", "Salas de embarque", "Restaurantes", "Módulo SENAMHI", "Artesanías locales", "Parqueo de bicicletas"]', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80'),
('est_04', 'EST-MAC-AGU', 'Estación Machu Picchu Pueblo (Aguas Calientes)', 'Machu Picchu Pueblo', 'Cusco', 2040, -13.15490000, -72.52550000, 'Estación terminal a orillas del río Vilcanota, puerta de entrada peatonal y vehicular al Santuario Histórico de Machu Picchu.', '["Centro de atención al visitante", "Boletería", "Embarque preferencial", "Asistencia médica", "Oficina MTC / Dircetur"]', 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80'),
('est_05', 'EST-VAL-URU', 'Estación Urubamba', 'Urubamba', 'Cusco', 2870, -13.30560000, -72.11580000, 'Estación rodeada de clima templado y valles fértiles, conectada con hoteles boutique y huertos orgánicos.', '["Boletería", "Salón de espera", "Jardín andino", "Información turística", "Café bar"]', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80'),
('est_06', 'EST-PUN-TIT', 'Estación Puno (Lago Titicaca)', 'Puno', 'Puno', 3827, -15.83640000, -70.02190000, 'Estación histórica a orillas del lago navegable más alto del mundo, conectando el Altiplano con Cusco.', '["Boletería Titicaca Train", "Sala de embarque folclórica", "Oxígeno de cortesía", "Custodia de equipaje"]', 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=1200&q=80')
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
