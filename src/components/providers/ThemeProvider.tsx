'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type UserRole = 'turista' | 'travel_group' | 'perurail' | 'admin';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  organization: string;
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  authUser: AuthUser | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginAsAdmin: (email: string, role: UserRole, name?: string, org?: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  toggleTheme: () => {},
  role: 'turista',
  setRole: () => {},
  authUser: null,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  loginAsAdmin: () => {},
  logout: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [role, setRoleState] = useState<UserRole>('turista');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read theme preference
    const savedTheme = localStorage.getItem('app_theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Read auth session from server /api/auth/me or fallback localStorage
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(json => {
        if (json.authenticated && json.user) {
          const u = json.user;
          const userObj: AuthUser = {
            email: u.email,
            role: u.role as UserRole,
            name: u.name,
            organization: u.organization,
          };
          setAuthUser(userObj);
          setRoleState(userObj.role);
          localStorage.setItem('mtc_admin_auth', JSON.stringify(userObj));
          localStorage.setItem('app_role', userObj.role);
          return;
        }

        // Si no hay sesión en cookie, revisar localStorage
        const savedAuth = localStorage.getItem('mtc_admin_auth');
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth) as AuthUser;
            setAuthUser(parsed);
            setRoleState(parsed.role);
            localStorage.setItem('app_role', parsed.role);
            return;
          } catch (e) {
            console.warn('Error reading saved auth:', e);
          }
        }

        const savedRole = localStorage.getItem('app_role') as UserRole | null;
        if (savedRole) {
          setRoleState(savedRole);
        }
      })
      .catch(() => {
        const savedAuth = localStorage.getItem('mtc_admin_auth');
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth) as AuthUser;
            setAuthUser(parsed);
            setRoleState(parsed.role);
          } catch {}
        }
      });
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('app_role', newRole);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginAsAdmin = (email: string, newRole: UserRole, name?: string, org?: string) => {
    const defaultNames: Record<UserRole, { name: string; org: string }> = {
      turista: { name: 'Visitante Turista', org: 'Público General' },
      travel_group: { name: 'Gestor de Rutas Peatonales', org: 'Travel Group Perú' },
      perurail: { name: 'Operador Logístico Ferroviario', org: 'PeruRail S.A.' },
      admin: { name: 'Administrador General MTC', org: 'Ministerio de Transportes y Comunicaciones' },
    };

    const userObj: AuthUser = {
      email,
      role: newRole,
      name: name || defaultNames[newRole]?.name || 'Administrador',
      organization: org || defaultNames[newRole]?.org || 'MTC',
    };

    setAuthUser(userObj);
    setRoleState(newRole);
    localStorage.setItem('mtc_admin_auth', JSON.stringify(userObj));
    localStorage.setItem('app_role', newRole);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthUser(null);
    setRoleState('turista');
    localStorage.removeItem('mtc_admin_auth');
    localStorage.setItem('app_role', 'turista');
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    }
  };

  return (
    <AppContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        role, 
        setRole,
        authUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginAsAdmin,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

