'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp, UserRole } from '@/components/providers/ThemeProvider';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  Train, 
  AlertCircle, 
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsAdmin } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor complete todos los campos requeridos.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Correo o contraseña incorrectos.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);

      const user = json.user;
      loginAsAdmin(user.email, user.role as UserRole, user.name, user.organization);

      // Redirección formal según el perfil del usuario autenticado
      setTimeout(() => {
        if (user.role === 'travel_group') {
          router.push('/admin/zonas');
        } else if (user.role === 'perurail') {
          router.push('/admin/horarios');
        } else {
          router.push('/admin');
        }
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('No fue posible establecer conexión con el servidor. Intente nuevamente.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden my-6">
        {/* Barra superior institucional */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-700 to-slate-800" />

        {/* Encabezado formal */}
        <div className="p-6 sm:p-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-red-700 text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <Train className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-700 dark:text-red-400">
            Ministerio de Transportes y Comunicaciones
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Plataforma de Gestión de Rutas Ferroviarias y Turísticas
          </p>
        </div>

        {/* Formulario */}
        <div className="p-6 sm:p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@entidad.gob.pe"
                  autoComplete="email"
                  required
                  className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full text-xs font-medium pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-75 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Acceso concedido</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al portal principal</span>
            </Link>
          </div>
        </div>

        {/* Pie formal */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
          Acceso exclusivo para operadores y administradores autorizados.
        </div>
      </div>
    </div>
  );
}
