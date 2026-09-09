import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDurationMin(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Formato intuitivo de horas y minutos para progresos y tiempos de viaje:
 * - Menor a 60 min: "40 min"
 * - 60 min o más: "1:40 horas", "2:30 horas", "10:30 horas"
 */
export function formatHoursColonMin(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  if (safeMinutes < 60) {
    return `${safeMinutes} min`;
  }
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  const paddedMinutes = remainingMinutes.toString().padStart(2, '0');
  return `${hours}:${paddedMinutes} horas`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDateSpanish(dateStr: string): string {
  try {
    if (!dateStr) return '';
    // Si dateStr viene en formato YYYY-MM-DD sin hora, agregamos T12:00:00 para evitar desplazamiento por zona horaria UTC
    const safeDateStr = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? `${dateStr}T12:00:00`
      : (dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr);
    const date = new Date(safeDateStr);
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateShortSpanish(dateStr?: string | Date | null): string {
  try {
    if (!dateStr) return new Date().toLocaleDateString('es-PE');
    const safeDateStr = typeof dateStr === 'string'
      ? (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)
          ? `${dateStr}T12:00:00`
          : (dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr))
      : dateStr;
    const date = new Date(safeDateStr);
    if (isNaN(date.getTime())) return String(dateStr).split('T')[0];
    return date.toLocaleDateString('es-PE');
  } catch {
    return new Date().toLocaleDateString('es-PE');
  }
}
