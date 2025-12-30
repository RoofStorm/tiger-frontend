'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AuthSuccessHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Only show toast once per session and only for OAuth callbacks
    const isOAuthCallback = searchParams.get('callbackUrl');
    const isOAuthLogin = searchParams.get('oauth') === 'success';

    // Reset the flag when session changes (new login)
    if (status === 'unauthenticated') {
      hasShownToast.current = false;
    }

    if (
      !hasShownToast.current &&
      (isOAuthCallback || isOAuthLogin) &&
      session?.user &&
      status === 'authenticated'
    ) {
      // Clear the flags when OAuth login succeeds to allow modal to show if pointsAwarded is true
      // The DailyLoginModalProvider will check the session via /api/auth/session and show the modal
      localStorage.removeItem('dailyLoginModalShown');
      localStorage.removeItem('dailyLoginModalShownDate');
      
      // Show success toast for OAuth login
      toast({
        title: 'Đăng nhập thành công!',
        description: 'Chào mừng bạn trở lại với TIGER.',
        duration: 3000,
      });

      hasShownToast.current = true;

      // Clear the callbackUrl from URL
      if (isOAuthCallback) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('callbackUrl');
        window.history.replaceState({}, '', newUrl.toString());
      }

      // Clear oauth success param
      if (isOAuthLogin) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('oauth');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [session, status, searchParams, toast, router]);

  return null; // This component doesn't render anything
}
