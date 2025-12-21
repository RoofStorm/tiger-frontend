'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { useHeaderDarkMode } from '@/contexts/HeaderDarkModeContext';

export function HeaderWrapper() {
  const pathname = usePathname();
  const { isDarkMode } = useHeaderDarkMode();
  
  // Hide header on admin page (admin has its own layout)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <Header isDarkMode={isDarkMode} />;
}

