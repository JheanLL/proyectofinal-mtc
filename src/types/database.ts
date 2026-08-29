// Tipos TypeScript para la plataforma MTC - Rutas Ferroviarias y Zonas Turísticas
// Siguiendo la norma de convención de nombres con prefijos para Base de Datos

export type CategoriaTuristica = 
  | 'naturaleza' 
  | 'historia' 
  | 'arqueologia' 
  | 'gastronomia' 
  | 'fotografia' 
  | 'aventura' 
  | 'cultura' 
  | 'descanso';

export type NivelDificultad = 'Fácil' | 'Moderado' | 'Exigente';

export type TipoServicioTren = 
  | 'Expedition' 
  | 'Vistadome' 
  | 'Vistadome Observatory' 
  | 'Hiram Bingham' 
  | 'Tren Local';

export type CondicionCielo = 
  | 'Despejado' 
  | 'Parcialmente Nublado' 
  | 'Nublado' 
  | 'Lluvia Ligera' 
  | 'Lluvia Moderada' 
  | 'Tormenta';

export type NivelAlertaClima = 'Verde' | 'Amarillo' | 'Naranja' | 'Rojo';

// 1. Entidad Estación Ferroviaria (PeruRail)
export interface TblEstacion {
  est_id: string;
  est_codigo: string;
  est_nombre: string;
  est_ciudad: string;
  est_departamento: string;
  est_altitud_msnm: number;
  est_latitud: number;
  est_longitud: number;
  est_descripcion: string;
  est_servicios: string[]; // ["Boletería", "Sala de espera", "Cafetería", "Custodia de equipaje", "Información turística"]
  est_imagen_url: string;
  est_telefono_contacto?: string;
}

// 2. Entidad Zona Turística a Pie (Travel Group Perú)
export interface TblZonaTuristica {
  zon_id: string;
  zon_estacion_id: string;
  zon_nombre: string;
  zon_categoria: CategoriaTuristica;
  zon_descripcion: string;
  zon_resumen_corto: string;
  zon_distancia_metros: number; // Distancia a pie desde la estación (un tramo)
  zon_tiempo_caminata_min: number; // Tiempo estimado a pie (un solo tramo)
  zon_tiempo_sugerido_visita_min: number; // Tiempo sugerido dentro del atractivo
  zon_dificultad: NivelDificultad;
  zon_desnivel_metros: number;
  zon_puntos_interes: string[]; // Puntos destacados durante el trayecto a pie
  zon_recomendaciones: string[]; // Ej: "Llevar calzado de trekking", "Bloqueador solar"
  zon_latitud: number;
  zon_longitud: number;
  zon_imagen_url: string;
  zon_precio_entrada_pen: number;
  zon_horario_atencion: string;
  zon_es_destacado?: boolean;
}

// 3. Entidad Horario y Tarifa de Tren (PeruRail)
export interface TblHorarioTren {
  hor_id: string;
  hor_codigo_tren: string;
  hor_estacion_origen_id: string;
  hor_estacion_destino_id: string;
  hor_servicio_tipo: TipoServicioTren;
  hor_hora_salida: string; // Formato "06:40"
  hor_hora_llegada: string; // Formato "08:20"
  hor_duracion_min: number;
  hor_tarifa_regular_pen: number;
  hor_tarifa_turista_usd: number;
  hor_dias_operacion: string[]; // ["Lunes", "Martes", ...]
  hor_asientos_disponibles: number;
  hor_incluye_refrigerio: boolean;
}

// 4. Entidad Pronóstico de Clima (SENAMHI)
export interface TblPronosticoClima {
  cli_id: string;
  cli_estacion_id: string;
  cli_fecha: string; // "2026-08-30"
  cli_temp_min_c: number;
  cli_temp_max_c: number;
  cli_temp_actual_c: number;
  cli_condicion_cielo: CondicionCielo;
  cli_prob_lluvia_pct: number;
  cli_humedad_pct: number;
  cli_viento_kmh: number;
  cli_indice_uv: number;
  cli_alerta_meteorologica: {
    nivel: NivelAlertaClima;
    mensaje: string;
    recomendacion: string;
  };
  cli_recomendacion_ropa: string[];
  cli_fuente_senamhi: string;
  cli_fecha_actualizacion: string;
}

// 5. Preferencias de Usuario
export interface TblPreferenciaTuristica {
  pre_id: string;
  pre_codigo: CategoriaTuristica;
  pre_nombre: string;
  pre_icono: string;
  pre_descripcion: string;
  pre_color_badge: string;
}

// 6. Itinerario Consolidado / Consulta de Usuario
export interface TblItinerarioConsulta {
  iti_id: string;
  iti_codigo: string; // Ej: "MTC-2026-8472"
  iti_fecha_creacion: string;
  iti_usuario_nombre: string;
  iti_usuario_email?: string;
  iti_estacion_origen_id: string;
  iti_estacion_destino_id: string;
  iti_zona_turistica_id: string;
  iti_horario_ida_id: string;
  iti_horario_retorno_id: string;
  iti_preferencias_seleccionadas: CategoriaTuristica[];
  iti_distancia_total_caminata_metros: number;
  iti_tiempo_total_caminata_min: number;
  iti_costo_tren_total_pen: number;
  iti_costo_tren_total_usd: number;
  iti_costo_entradas_pen: number;
  iti_costo_total_pen: number;
  iti_costo_total_usd: number;
  iti_notas?: string;
}

// 7. Estado de Sincronización de Integraciones
export interface TblEstadoIntegracion {
  int_fuente: 'SENAMHI' | 'PeruRail' | 'Travel Group Perú';
  int_estado: 'Conectado' | 'Sincronizado' | 'Actualizando' | 'Alerta';
  int_ultima_sincronizacion: string;
  int_total_registros: number;
  int_latencia_ms: number;
  int_version_api: string;
  int_detalles: string;
}
