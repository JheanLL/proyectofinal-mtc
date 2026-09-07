'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, UserRole } from '@/components/providers/ThemeProvider';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  X, 
  Check, 
  ArrowRight, 
  Train, 
  MapPin, 
  AlertCircle, 
  Loader2,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';

interface PresetAccount {
  id: UserRole;
  label: string;
  sublabel: string;
  email: string;
  pass: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  borderColor: string;
  activeBg: string;
  textColor: string;
  permissions: string[];
  restrictions: string[];
  redirectPath: string;
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    id: 'travel_group',
    label: 'Travel Group Perú',
    sublabel: 'Gestor Turístico Peatonal',
    email: 'contacto@travelgroup.pe',
    pass: 'travel123',
    icon: MapPin,
    badge: 'Catálogo Turístico',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    borderColor: 'border-emerald-500',
    activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    permissions: [
      'CRUD completo de Zonas Turísticas a pie (/admin/zonas)',
      'Consultar listado de estaciones en solo lectura',
      'Exportar matriz de asignación estación-zona',
    ],
    restrictions: [
      'Sin acceso a Horarios y Precios de trenes (PeruRail)',
      'Sin acceso a sincronización de APIs externas',
    ],
    redirectPath: '/admin/zonas',
  },
  {
    id: 'perurail',
    label: 'PeruRail',
    sublabel: 'Operador Logístico Ferroviario',
    email: 'operaciones@perurail.com',
    pass: 'perurail123',
    icon: Train,
    badge: 'Logística & Tarifas',
    badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    borderColor: 'border-blue-500',
    activeBg: 'bg-blue-50/70 dark:bg-blue-950/40',
    textColor: 'text-blue-600 dark:text-blue-400',
    permissions: [
      'CRUD completo de Horarios, Trenes y Frecuencias (/admin/horarios)',
      'Fijar tarifas regulares (PEN) y turista (USD)',
      'Consultar red de estaciones y clima en vías',
    ],
    restrictions: [
      'Sin acceso a Zonas Turísticas peatonales (Travel Group Perú)',
      'Sin acceso a sincronización global de APIs de terceros',
    ],
    redirectPath: '/admin/horarios',
  },
  {
    id: 'admin',
    label: 'Admin General (MTC)',
    sublabel: 'Panel de Gestores / Superadmin',
    email: 'admin@mtc.gob.pe',
    pass: 'admin123',
    icon: ShieldCheck,
    badge: 'Superusuario',
    badgeColor: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800',
    borderColor: 'border-red-600',
    activeBg: 'bg-red-50/70 dark:bg-red-950/40',
    textColor: 'text-red-600 dark:text-red-400',
    permissions: [
      'Acceso total a Zonas Turísticas y Horarios de Tren',
      'Panel de configuración para gestores MTC',
      'Monitoreo y forzar sincronización de APIs (/admin/integraciones)',
      'Restablecimiento y mantenimiento de base de datos',
    ],
    restrictions: [],
    redirectPath: '/admin',
  },
];

export default function AdminLoginModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, loginAsAdmin } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('perurail');
  const [email, setEmail] = useState('operaciones@perurail.com');
  const [password, setPassword] = useState('perurail123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync selected preset when role changes
  const activePreset = PRESET_ACCOUNTS.find(a => a.id === selectedRole) || PRESET_ACCOUNTS[1];

  const handleSelectPreset = (account: PresetAccount) => {
    setSelectedRole(account.id);
    setEmail(account.email);
    setPassword(account.pass);
    setErrorMsg('');
  };

  // Keyboard navigation & Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setIsSuccess(false);
      setIsLoading(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    // Check credentials against any preset account
    const matchedAccount = PRESET_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.trim().toLowerCase() && a.pass === password.trim()
    );

    setIsLoading(true);

    setTimeout(() => {
      if (matchedAccount) {
        setIsLoading(false);
        setIsSuccess(true);
        loginAsAdmin(matchedAccount.email, matchedAccount.id, matchedAccount.label, matchedAccount.sublabel);

        setTimeout(() => {
          setIsSuccess(false);
          closeAuthModal();
          router.push(matchedAccount.redirectPath);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMsg('Credenciales incorrectas. Selecciona una de las 3 cuentas oficiales en los botones superiores.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={closeAuthModal} 
        aria-label="Cerrar modal"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-6 transition-all duration-300">
        {/* Institutional Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900">
                  Acceso Administrativo
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold hidden sm:inline">
                  MTC • Unidad IV
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                Iniciar Sesión como Administrador
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecciona una cuenta o ingresa tus credenciales autorizadas.
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Account Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Cuentas de Acceso Rápido (1-Click Demo)</span>
              </label>
              <span className="text-[10px] text-slate-400">3 roles según requerimientos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `${acc.borderColor} ${acc.activeBg} border-2 shadow-sm`
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white dark:bg-slate-900 shadow-xs' : 'bg-slate-200/60 dark:bg-slate-700/60'}`}>
                          <Icon className={`w-3.5 h-3.5 ${acc.textColor}`} />
                        </div>
                        {isSelected && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {acc.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {acc.sublabel}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="truncate">{acc.email.split('@')[0]}</span>
                      <ArrowRight className="w-3 h-3 opacity-60 shrink-0 ml-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Permissions Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Permisos del perfil según la Hoja de Práctica:</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activePreset.badgeColor}`}>
                {activePreset.badge}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              {activePreset.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </div>
              ))}
              {activePreset.restrictions.map((rest, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-400 dark:text-slate-500">
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="line-through">{rest}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@entidad.gob.pe"
                  required
                  className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs font-medium pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeAuthModal}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-75 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Sesión Iniciada!</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar como {activePreset.label.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
          Autenticación segura para gestores oficiales • Ministerio de Transportes y Comunicaciones (MTC)
        </div>
      </div>
    </div>
  );
}
