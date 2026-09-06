'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/providers/ThemeProvider';
import { User, ShieldCheck, Train, MapPin, ChevronDown, Check } from 'lucide-react';

const ROLES = [
  { id: 'turista', label: 'Turista (Cliente)', icon: User, desc: 'Planifica rutas, consulta clima y genera informes' },
  { id: 'travel_group', label: 'Travel Group Perú', icon: MapPin, desc: 'Gestión CRUD de zonas a pie y asignaciones' },
  { id: 'perurail', label: 'PeruRail', icon: Train, desc: 'Gestión CRUD de horarios y tarifas de tren' },
  { id: 'admin', label: 'Administrador', icon: ShieldCheck, desc: 'Acceso total y sincronización de APIs' },
] as const;

export default function RoleSwitcher() {
  const { role, setRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const currentRole = ROLES.find(r => r.id === role) || ROLES[0];
  const Icon = currentRole.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        title="Cambiar rol de usuario"
      >
        <Icon className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        <span className="hidden sm:inline">{currentRole.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Seleccionar Rol de Usuario
            </div>
            {ROLES.map((r) => {
              const RoleIcon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <RoleIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>{r.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
