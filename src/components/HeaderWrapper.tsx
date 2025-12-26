'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { useHeaderDarkMode } from '@/contexts/HeaderDarkModeContext';
import { useContext } from 'react';
import { VideoContext } from '@/contexts/VideoContext';

export function HeaderWrapper() {
  const pathname = usePathname();
  const { isDarkMode } = useHeaderDarkMode();
  
  // Try to get video context (may not be available if not wrapped in VideoProvider)
  let isVideoPlaying = false;
  try {
    const videoContext = useContext(VideoContext);
    if (videoContext) {
      isVideoPlaying = videoContext.isVideoPlaying;
    }
  } catch {
    // VideoContext not available, ignore
  }
  
  // Hide header on admin page (admin has its own layout)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Hide header when video is playing (only on home page)
  if (isVideoPlaying && pathname === '/') {
    return null;
  }

  return <Header isDarkMode={isDarkMode} />;
}

