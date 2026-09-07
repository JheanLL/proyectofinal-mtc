'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/providers/ThemeProvider';
import { 
  ShieldCheck, 
  History, 
  Filter, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  Layers, 
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Lock,
  Sparkles
} from 'lucide-react';

interface AuditItem {
  aud_id: number;
  aud_usuario_id: number | null;
  aud_usuario_email: string | null;
  aud_accion: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  aud_modulo: 'ZONAS' | 'HORARIOS' | 'INTEGRACIONES' | 'AUTH';
  aud_registro_id: string | null;
  aud_detalles_json: any;
  aud_ip_origen: string | null;
  aud_fecha_hora: string;
}

export default function AuditoriaAdminPage() {
  const { role, authUser } = useApp();
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permisosTexto, setPermisosTexto] = useState('');
  const [selectedModulo, setSelectedModulo] = useState<string>('TODOS');
  const [selectedAccion, setSelectedAccion] = useState<string>('TODAS');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeDiffModal, setActiveDiffModal] = useState<AuditItem | null>(null);

  const fetchAuditoria = async () => {
    setIsLoading(true);
    try {
      const rolParam = role === 'admin' ? 'ADMIN' 
        : role === 'travel_group' ? 'TRAVEL_GROUP' 
        : role === 'perurail' ? 'PERURAIL' 
        : '';

      if (!rolParam) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        rol: rolParam,
        modulo: selectedModulo,
        accion: selectedAccion,
        usuarioEmail: authUser?.email || '',
        limite: '100'
      });

      const res = await fetch(`/api/auditoria?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
        setPermisosTexto(json.permisos_aplicados || '');
      }
    } catch (e) {
      console.error('Error cargando auditoría:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditoria();
  }, [role, selectedModulo, selectedAccion]);

  const filteredLogs = logs.filter(l => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (l.aud_registro_id && l.aud_registro_id.toLowerCase().includes(term)) ||
      (l.aud_usuario_email && l.aud_usuario_email.toLowerCase().includes(term)) ||
      (l.aud_modulo && l.aud_modulo.toLowerCase().includes(term)) ||
      (l.aud_accion && l.aud_accion.toLowerCase().includes(term))
    );
  });

  const getActionBadge = (accion: string) => {
    switch (accion) {
      case 'CREATE':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'UPDATE':
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'DELETE':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'SYNC':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'LOGIN':
        return 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300';
    }
  };

  if (role === 'turista') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Acceso Restringido para Turistas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          El módulo de auditoría es de uso exclusivo para las 3 cuentas operativas del MTC, Travel Group Perú y PeruRail. Los turistas operan de forma local sin cuenta.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Asesor Turístico</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 text-xs font-bold mb-1.5">
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Módulo de Trazabilidad & Auditoría (Aiven Cloud)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Bitácora de Auditoría de Cambios</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              tbl_auditoria
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {permisosTexto || 'Control de cambios e historial de modificaciones en tiempo real sobre la base de datos de Aiven MySQL.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAuditoria}
            disabled={isLoading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar Bitácora</span>
          </button>
          <Link
            href="/admin"
            className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Panel General</span>
          </Link>
        </div>
      </div>

      {/* Role Scope Notice Card */}
      <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        role === 'admin'
          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200'
          : role === 'travel_group'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
          : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-extrabold uppercase tracking-wide">
              {role === 'admin' ? '🛡️ Perfil Superadministrador MTC' : role === 'travel_group' ? '🌿 Perfil Travel Group Perú' : '🚂 Perfil PeruRail'}
            </span>
            <p className="opacity-90 mt-0.5">
              {role === 'admin' 
                ? 'Permisos Totales: Tienes visibilidad completa de todas las modificaciones y creaciones de todos los operadores y módulos.' 
                : role === 'travel_group'
                ? 'Permisos Segmentados: Solo puedes auditar y visualizar las modificaciones y creaciones realizadas sobre el catálogo de Zonas Turísticas.'
                : 'Permisos Segmentados: Solo puedes auditar y visualizar las modificaciones y creaciones realizadas sobre el catálogo de Horarios y Tarifas.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-slate-900/80 font-mono font-bold text-[11px] border border-current/20">
            {authUser?.email || 'operador@mtc.gob.pe'}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por ID de registro, correo o módulo..."
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        {role === 'admin' && (
          <select
            value={selectedModulo}
            onChange={(e) => setSelectedModulo(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-600 focus:outline-none"
          >
            <option value="TODOS">Todos los Módulos</option>
            <option value="ZONAS">Zonas Turísticas</option>
            <option value="HORARIOS">Horarios Ferroviarios</option>
            <option value="INTEGRACIONES">Integraciones APIs</option>
            <option value="AUTH">Autenticación</option>
          </select>
        )}

        <select
          value={selectedAccion}
          onChange={(e) => setSelectedAccion(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-600 focus:outline-none"
        >
          <option value="TODAS">Todas las Acciones</option>
          <option value="CREATE">CREATE (Altas)</option>
          <option value="UPDATE">UPDATE (Ediciones)</option>
          <option value="DELETE">DELETE (Bajas)</option>
          <option value="SYNC">SYNC (Sincronizaciones)</option>
          <option value="LOGIN">LOGIN (Inicios de Sesión)</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">ID / Fecha</th>
                <th className="p-3">Operador / Email</th>
                <th className="p-3">Acción</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Registro Afectado</th>
                <th className="p-3">IP Origen</th>
                <th className="p-3 text-right">Detalle de Cambios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Cargando eventos de auditoría desde Aiven MySQL...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron registros de auditoría para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.aud_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">#{l.aud_id}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(l.aud_fecha_hora).toLocaleString('es-PE')}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{l.aud_usuario_email || 'Sistema Automático'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getActionBadge(l.aud_accion)}`}>
                        {l.aud_accion}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {l.aud_modulo}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {l.aud_registro_id || '—'}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      {l.aud_ip_origen || '127.0.0.1'}
                    </td>
                    <td className="p-3 text-right">
                      {l.aud_detalles_json ? (
                        <button
                          onClick={() => setActiveDiffModal(l)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3 text-blue-500" />
                          <span>Ver Diff JSON</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin payload</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Diff Viewer Modal */}
      {activeDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Detalle de Modificación #{activeDiffModal.aud_id}
                </h3>
              </div>
              <button
                onClick={() => setActiveDiffModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Acción: <strong>{activeDiffModal.aud_accion}</strong></span>
                <span>Módulo: <strong>{activeDiffModal.aud_modulo}</strong></span>
                <span>Registro: <strong>{activeDiffModal.aud_registro_id || 'N/A'}</strong></span>
              </div>

              <div className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-3 rounded-xl overflow-x-auto max-h-60">
                <pre>{JSON.stringify(activeDiffModal.aud_detalles_json, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDiffModal(null)}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
