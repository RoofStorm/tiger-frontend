'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderDarkModeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const HeaderDarkModeContext = createContext<HeaderDarkModeContextType | undefined>(undefined);

export function HeaderDarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <HeaderDarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </HeaderDarkModeContext.Provider>
  );
}

export function useHeaderDarkMode() {
  const context = useContext(HeaderDarkModeContext);
  if (context === undefined) {
    throw new Error('useHeaderDarkMode must be used within a HeaderDarkModeProvider');
  }
  return context;
}

