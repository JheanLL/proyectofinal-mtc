'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIntegraciones, triggerSyncIntegraciones } from '@/lib/db/store';
import { TblEstadoIntegracion } from '@/types/database';
import { 
  CloudSun, 
  Train, 
  MapPin, 
  RefreshCw, 
  ArrowLeft, 
  Activity, 
  Terminal,
  Code
} from 'lucide-react';

export default function AdminIntegracionesPage() {
  const [integraciones, setIntegraciones] = useState<TblEstadoIntegracion[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedApiJson, setSelectedApiJson] = useState<string>('SENAMHI');
  const [jsonResponse, setJsonResponse] = useState<any>(null);

  const reload = () => {
    setIntegraciones(getIntegraciones());
  };

  useEffect(() => {
    reload();
    fetchMockApi('SENAMHI');
  }, []);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = triggerSyncIntegraciones();
      setIntegraciones(updated);
      setIsSyncing(false);
      fetchMockApi(selectedApiJson);
    }, 800);
  };

  const fetchMockApi = async (source: string) => {
    setSelectedApiJson(source);
    try {
      if (source === 'SENAMHI') {
        const res = await fetch('/api/senamhi');
        const data = await res.json();
        setJsonResponse(data);
      } else if (source === 'PeruRail') {
        const res = await fetch('/api/horarios');
        const data = await res.json();
        setJsonResponse(data);
      } else {
        const res = await fetch('/api/zonas');
        const data = await res.json();
        setJsonResponse(data);
      }
    } catch (e) {
      setJsonResponse({ status: 'OK', fuente: source, simulated: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300 text-xs font-bold mb-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Módulo 1: Integración de Flujos Periódicos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Monitoreo y Sincronización de APIs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Control de los flujos periódicos provenientes de <strong>SENAMHI</strong> (clima), <strong>PeruRail</strong> (horarios/tarifas) y <strong>Travel Group Perú</strong> (zonas a pie).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Panel</span>
          </Link>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización'}</span>
          </button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {integraciones.map((item) => {
          const isSenamhi = item.int_fuente === 'SENAMHI';
          const isPeruRail = item.int_fuente === 'PeruRail';
          return (
            <div
              key={item.int_fuente}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all shadow-2xs flex flex-col justify-between space-y-3.5 ${
                selectedApiJson === item.int_fuente
                  ? 'border-red-600 ring-2 ring-red-600/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-2xl ${
                    isSenamhi ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' : isPeruRail ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {isSenamhi ? <CloudSun className="w-5 h-5" /> : isPeruRail ? <Train className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {item.int_estado}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.int_fuente}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.int_detalles}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Última Sincronización:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{item.int_ultima_sincronizacion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Latencia:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">{item.int_latencia_ms} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Registros activos:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">{item.int_total_registros} entidades</span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                    Versión: {item.int_version_api}
                  </div>
                </div>
              </div>

              <button
                onClick={() => fetchMockApi(item.int_fuente)}
                className={`w-full text-xs font-bold py-2 px-3 rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedApiJson === item.int_fuente
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-red-700 dark:border-red-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Inspeccionar JSON</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* JSON Payload Inspector */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Visor de Payload API en Tiempo Real ({selectedApiJson})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            HTTP 200 OK • Content-Type: application/json
          </span>
        </div>

        <pre className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-80">
          {jsonResponse ? JSON.stringify(jsonResponse, null, 2) : 'Cargando payload...'}
        </pre>
      </div>
    </div>
  );
}
