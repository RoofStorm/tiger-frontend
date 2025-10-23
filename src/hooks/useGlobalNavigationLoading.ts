'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import { useEffect, useTransition } from 'react';

// Global navigation state to prevent conflicts between multiple components
const globalNavigationState = {
  isNavigating: false,
  previousPath: '',
  timeoutRef: null as NodeJS.Timeout | null,
  maxTimeoutRef: null as NodeJS.Timeout | null,
};

export function useGlobalNavigationLoading() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading, setLoadingMessage } = useLoading();
  const [, startTransition] = useTransition();

  // Track navigation completion using pathname changes
  useEffect(() => {
    const currentPath = pathname;

    // Always hide loading when pathname changes (regardless of isNavigating state)
    if (globalNavigationState.previousPath !== currentPath) {
      // Clear timeouts
      if (globalNavigationState.timeoutRef) {
        clearTimeout(globalNavigationState.timeoutRef);
        globalNavigationState.timeoutRef = null;
      }
      if (globalNavigationState.maxTimeoutRef) {
        clearTimeout(globalNavigationState.maxTimeoutRef);
        globalNavigationState.maxTimeoutRef = null;
      }

      // Hide loading immediately when path changes
      setLoading(false);
      globalNavigationState.isNavigating = false;
    }

    // Update previous path
    globalNavigationState.previousPath = currentPath;
  }, [pathname, setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (globalNavigationState.timeoutRef) {
        clearTimeout(globalNavigationState.timeoutRef);
        globalNavigationState.timeoutRef = null;
      }
      if (globalNavigationState.maxTimeoutRef) {
        clearTimeout(globalNavigationState.maxTimeoutRef);
        globalNavigationState.maxTimeoutRef = null;
      }
    };
  }, []);

  const navigateWithLoading = (
    url: string,
    message = 'Đang chuyển trang...'
  ) => {
    // Clear any existing navigation
    if (globalNavigationState.timeoutRef) {
      clearTimeout(globalNavigationState.timeoutRef);
    }
    if (globalNavigationState.maxTimeoutRef) {
      clearTimeout(globalNavigationState.maxTimeoutRef);
    }

    // Set loading state
    setLoadingMessage(message);
    setLoading(true);
    globalNavigationState.isNavigating = true;

    // Set a backup timeout to hide loading after a short delay (fallback)
    globalNavigationState.timeoutRef = setTimeout(() => {
      setLoading(false);
      globalNavigationState.isNavigating = false;
    }, 1000); // 1 second backup

    // Set maximum loading timeout (5 seconds)
    globalNavigationState.maxTimeoutRef = setTimeout(() => {
      setLoading(false);
      globalNavigationState.isNavigating = false;
    }, 5000);

    // Use startTransition to wrap the navigation
    startTransition(() => {
      router.push(url);
    });
  };

  return { navigateWithLoading };
}
