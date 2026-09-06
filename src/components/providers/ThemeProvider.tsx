'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type UserRole = 'turista' | 'travel_group' | 'perurail' | 'admin';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  toggleTheme: () => {},
  role: 'turista',
  setRole: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [role, setRoleState] = useState<UserRole>('turista');
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

    // Read role preference
    const savedRole = localStorage.getItem('app_role') as UserRole | null;
    if (savedRole) {
      setRoleState(savedRole);
    }
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

  return (
    <AppContext.Provider value={{ theme, toggleTheme, role, setRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
