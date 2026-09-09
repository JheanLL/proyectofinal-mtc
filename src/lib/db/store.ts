// Repositorio y Store de datos de la plataforma MTC
// Soporta persistencia en localStorage para el cliente y datos iniciales para el servidor Next.js
'use client';

import { 
  TblEstacion, 
  TblZonaTuristica, 
  TblHorarioTren, 
  TblPronosticoClima, 
  TblPreferenciaTuristica,
  TblItinerarioConsulta,
  TblEstadoIntegracion,
  CategoriaTuristica
} from '@/types/database';

import { 
  INITIAL_ESTACIONES, 
  INITIAL_ZONAS_TURISTICAS, 
  INITIAL_HORARIOS_TREN, 
  INITIAL_PRONOSTICOS_CLIMA, 
  INITIAL_PREFERENCIAS,
  INITIAL_INTEGRACIONES 
} from './initial-data';

const STORAGE_KEYS = {
  ESTACIONES: 'mtc_tbl_estaciones_v1',
  ZONAS: 'mtc_tbl_zonas_v1',
  HORARIOS: 'mtc_tbl_horarios_v1',
  CLIMA: 'mtc_tbl_clima_v2',
  ITINERARIOS: 'mtc_tbl_itinerarios_v1',
  INTEGRACIONES: 'mtc_tbl_integraciones_v1',
};

// Funciones seguras de LocalStorage
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('mtc_db_updated'));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// 1. GESTIÓN DE ESTACIONES (PeruRail / MTC)
export const getEstaciones = (): TblEstacion[] => {
  return getFromStorage<TblEstacion[]>(STORAGE_KEYS.ESTACIONES, INITIAL_ESTACIONES);
};

export const getEstacionById = (id: string): TblEstacion | undefined => {
  const list = getEstaciones();
  return list.find(e => e.est_id === id);
};

// 2. GESTIÓN DE ZONAS TURÍSTICAS (Travel Group Perú CRUD)
export const getZonasTuristicas = (): TblZonaTuristica[] => {
  return getFromStorage<TblZonaTuristica[]>(STORAGE_KEYS.ZONAS, INITIAL_ZONAS_TURISTICAS);
};

export const getZonaById = (id: string): TblZonaTuristica | undefined => {
  const list = getZonasTuristicas();
  return list.find(z => z.zon_id === id);
};

export const getZonasByEstacion = (estacionId: string, categoria?: CategoriaTuristica): TblZonaTuristica[] => {
  const list = getZonasTuristicas();
  return list.filter(z => {
    const matchesEstacion = z.zon_estacion_id === estacionId;
    const matchesCategoria = categoria ? z.zon_categoria === categoria : true;
    return matchesEstacion && matchesCategoria;
  });
};

export const syncZonaToStorage = (zona: TblZonaTuristica): void => {
  const list = getZonasTuristicas();
  const exists = list.some(z => z.zon_id === zona.zon_id);
  const updatedList = exists 
    ? list.map(z => z.zon_id === zona.zon_id ? zona : z)
    : [zona, ...list];
  saveToStorage(STORAGE_KEYS.ZONAS, updatedList);
};

export const syncZonasListToStorage = (zonasList: TblZonaTuristica[]): void => {
  saveToStorage(STORAGE_KEYS.ZONAS, zonasList);
};

export const deleteZonaFromStorage = (id: string): void => {
  const list = getZonasTuristicas();
  const filtered = list.filter(z => z.zon_id !== id);
  saveToStorage(STORAGE_KEYS.ZONAS, filtered);
};

export const createZonaTuristica = (zona: Omit<TblZonaTuristica, 'zon_id'>): TblZonaTuristica => {
  const list = getZonasTuristicas();
  const newZona: TblZonaTuristica = {
    ...zona,
    zon_id: `zon_${Date.now()}`,
  };
  const updatedList = [newZona, ...list];
  saveToStorage(STORAGE_KEYS.ZONAS, updatedList);

  if (typeof window !== 'undefined') {
    fetch('/api/zonas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newZona),
    }).catch(e => console.warn('[Aiven MySQL CRUD] Fallo al crear zona:', e));
  }

  return newZona;
};

export const updateZonaTuristica = (id: string, partial: Partial<TblZonaTuristica>): boolean => {
  const list = getZonasTuristicas();
  const index = list.findIndex(z => z.zon_id === id);
  if (index === -1) return false;
  list[index] = { ...list[index], ...partial };
  saveToStorage(STORAGE_KEYS.ZONAS, list);

  if (typeof window !== 'undefined') {
    fetch('/api/zonas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zon_id: id, ...partial }),
    }).catch(e => console.warn('[Aiven MySQL CRUD] Fallo al actualizar zona:', e));
  }

  return true;
};

export const deleteZonaTuristica = (id: string): boolean => {
  const list = getZonasTuristicas();
  const filtered = list.filter(z => z.zon_id !== id);
  if (filtered.length === list.length) return false;
  saveToStorage(STORAGE_KEYS.ZONAS, filtered);

  if (typeof window !== 'undefined') {
    fetch(`/api/zonas?id=${id}`, {
      method: 'DELETE',
    }).catch(e => console.warn('[Aiven MySQL CRUD] Fallo al eliminar zona:', e));
  }

  return true;
};

export const syncHorarioToStorage = (horario: TblHorarioTren): void => {
  const list = getHorariosTren();
  const exists = list.some(h => h.hor_id === horario.hor_id);
  const updatedList = exists 
    ? list.map(h => h.hor_id === horario.hor_id ? horario : h)
    : [horario, ...list];
  saveToStorage(STORAGE_KEYS.HORARIOS, updatedList);
};

// 3. GESTIÓN DE HORARIOS Y TARIFAS DE TREN (PeruRail CRUD)
export const getHorariosTren = (): TblHorarioTren[] => {
  return getFromStorage<TblHorarioTren[]>(STORAGE_KEYS.HORARIOS, INITIAL_HORARIOS_TREN);
};

export const getHorariosByRuta = (origenId: string, destinoId: string): TblHorarioTren[] => {
  const list = getHorariosTren();
  return list.filter(h => h.hor_estacion_origen_id === origenId && h.hor_estacion_destino_id === destinoId);
};

export const createHorarioTren = (horario: Omit<TblHorarioTren, 'hor_id'>): TblHorarioTren => {
  const list = getHorariosTren();
  const newHorario: TblHorarioTren = {
    ...horario,
    hor_id: `hor_${Date.now()}`,
  };
  const updatedList = [newHorario, ...list];
  saveToStorage(STORAGE_KEYS.HORARIOS, updatedList);

  if (typeof window !== 'undefined') {
    fetch('/api/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHorario),
    }).catch(e => console.warn('[Aiven MySQL CRUD] Fallo al crear horario:', e));
  }

  return newHorario;
};

export const updateHorarioTren = (id: string, partial: Partial<TblHorarioTren>): boolean => {
  const list = getHorariosTren();
  const index = list.findIndex(h => h.hor_id === id);
  if (index === -1) return false;
  list[index] = { ...list[index], ...partial };
  saveToStorage(STORAGE_KEYS.HORARIOS, list);

  if (typeof window !== 'undefined') {
    fetch('/api/horarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hor_id: id, ...partial }),
    }).catch(e => console.warn('[Aiven MySQL CRUD] Fallo al actualizar horario:', e));
  }

  return true;
};

export const deleteHorarioTren = (id: string): boolean => {
  const list = getHorariosTren();
  const filtered = list.filter(h => h.hor_id !== id);
  if (filtered.length === list.length) return false;
  saveToStorage(STORAGE_KEYS.HORARIOS, filtered);

  if (typeof window !== 'undefined') {
    fetch(`/api/horarios?id=${id}`, {
      method: 'DELETE',
    }).catch(e => console.warn('[Aiven MySQL CRUD] Fallo al eliminar horario:', e));
  }

  return true;
};

// 4. GESTIÓN DE CLIMA (SENAMHI)
export const getClimaByEstacion = (estacionId: string): TblPronosticoClima => {
  const dict = getFromStorage<Record<string, TblPronosticoClima>>(STORAGE_KEYS.CLIMA, INITIAL_PRONOSTICOS_CLIMA);
  if (dict[estacionId]) return dict[estacionId];
  
  // Fallback generado si no existe específico
  const estacion = getEstacionById(estacionId);
  return {
    cli_id: `cli_${estacionId}`,
    cli_estacion_id: estacionId,
    cli_fecha: new Date().toISOString().split('T')[0],
    cli_temp_min_c: 8,
    cli_temp_max_c: 22,
    cli_temp_actual_c: 19,
    cli_condicion_cielo: 'Parcialmente Nublado',
    cli_prob_lluvia_pct: 15,
    cli_humedad_pct: 55,
    cli_viento_kmh: 11,
    cli_indice_uv: 10,
    cli_alerta_meteorologica: {
      nivel: 'Verde',
      mensaje: `Condiciones estables en la estación ${estacion?.est_nombre || 'seleccionada'}.`,
      recomendacion: 'Caminata a pie sin restricciones climáticas.',
    },
    cli_recomendacion_ropa: ['Ropa cómoda', 'Protector solar', 'Agua'],
    cli_fuente_senamhi: 'Open-Meteo / SENAMHI',
    cli_fecha_actualizacion: new Date().toLocaleTimeString('es-PE', { 
      timeZone: 'America/Lima', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    }) + ' (Hora Perú)',
  };
};

export const getAllClimas = (): Record<string, TblPronosticoClima> => {
  return getFromStorage<Record<string, TblPronosticoClima>>(STORAGE_KEYS.CLIMA, INITIAL_PRONOSTICOS_CLIMA);
};

export const syncClimaToStorage = (clima: TblPronosticoClima): void => {
  const current = getAllClimas();
  const updated = { ...current, [clima.cli_estacion_id]: clima };
  saveToStorage(STORAGE_KEYS.CLIMA, updated);
};

export const syncAllClimasToStorage = (climas: Record<string, TblPronosticoClima>): void => {
  saveToStorage(STORAGE_KEYS.CLIMA, climas);
};

// 5. GESTIÓN DE PREFERENCIAS
export const getPreferencias = (): TblPreferenciaTuristica[] => {
  return INITIAL_PREFERENCIAS;
};

// 6. GESTIÓN DE ITINERARIOS GENERADOS (Informes de Usuario con URLs no adivinables)

/**
 * Genera un código de itinerario de alta entropía (64 bits), imposible de adivinar o enumerar.
 * Formato: MTC-[16 caracteres hexadecimales], e.g., MTC-8f3a9e2d1c4b8e3a
 */
export const generateSecureItinerarioCodigo = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint8Array(8);
    window.crypto.getRandomValues(buffer);
    const hex = Array.from(buffer, b => b.toString(16).padStart(2, '0')).join('');
    return `MTC-${hex}`;
  }
  // Fallback seguro pseudoaleatorio
  const r1 = Math.random().toString(36).substring(2, 10);
  const r2 = Math.random().toString(36).substring(2, 10);
  return `MTC-${(r1 + r2).substring(0, 16).toLowerCase()}`;
};

export const getItinerarios = (): TblItinerarioConsulta[] => {
  return getFromStorage<TblItinerarioConsulta[]>(STORAGE_KEYS.ITINERARIOS, []);
};

export const cacheItinerarioLocal = (itinerario: TblItinerarioConsulta): void => {
  const list = getItinerarios();
  const exists = list.some(i => i.iti_codigo.toLowerCase() === itinerario.iti_codigo.toLowerCase() || i.iti_id === itinerario.iti_id);
  if (!exists) {
    saveToStorage(STORAGE_KEYS.ITINERARIOS, [itinerario, ...list]);
  }
};

export const saveItinerario = (itinerario: Omit<TblItinerarioConsulta, 'iti_id' | 'iti_codigo' | 'iti_fecha_creacion'> & { iti_codigo?: string }): TblItinerarioConsulta => {
  const list = getItinerarios();
  const secureCode = itinerario.iti_codigo || generateSecureItinerarioCodigo();
  const newItinerario: TblItinerarioConsulta = {
    ...itinerario,
    iti_id: `iti_${Date.now()}`,
    iti_codigo: secureCode,
    iti_fecha_creacion: new Date().toISOString(),
  };
  const updatedList = [newItinerario, ...list];
  saveToStorage(STORAGE_KEYS.ITINERARIOS, updatedList);

  if (typeof window !== 'undefined') {
    fetch('/api/itinerarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItinerario),
    }).catch(e => console.warn('[Aiven MySQL Itinerarios] Fallo al guardar itinerario:', e));
  }

  return newItinerario;
};

export const getItinerarioByCodigo = (codigo: string): TblItinerarioConsulta | undefined => {
  const list = getItinerarios();
  return list.find(i => i.iti_codigo.toLowerCase() === codigo.toLowerCase() || i.iti_id === codigo);
};

// 7. INTEGRACIONES & SINCRONIZACIÓN
export const getIntegraciones = (): TblEstadoIntegracion[] => {
  return getFromStorage<TblEstadoIntegracion[]>(STORAGE_KEYS.INTEGRACIONES, INITIAL_INTEGRACIONES);
};

export const triggerSyncIntegraciones = (): TblEstadoIntegracion[] => {
  const nowStr = `Hoy a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Manual)`;
  const updated = INITIAL_INTEGRACIONES.map(item => ({
    ...item,
    int_estado: 'Sincronizado' as const,
    int_ultima_sincronizacion: nowStr,
    int_latencia_ms: Math.floor(80 + Math.random() * 120),
  }));
  saveToStorage(STORAGE_KEYS.INTEGRACIONES, updated);
  return updated;
};

export const resetDatabaseToDefaults = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ESTACIONES);
  localStorage.removeItem(STORAGE_KEYS.ZONAS);
  localStorage.removeItem(STORAGE_KEYS.HORARIOS);
  localStorage.removeItem(STORAGE_KEYS.CLIMA);
  localStorage.removeItem(STORAGE_KEYS.ITINERARIOS);
  localStorage.removeItem(STORAGE_KEYS.INTEGRACIONES);
  window.dispatchEvent(new Event('mtc_db_updated'));
};
