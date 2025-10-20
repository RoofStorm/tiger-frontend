'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AuthSuccessHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user just logged in via OAuth
    const isOAuthCallback =
      searchParams.get('callbackUrl') ||
      (window.location.pathname === '/' &&
        status === 'authenticated' &&
        session?.user);

    if (isOAuthCallback && session?.user) {
      // Show success toast for OAuth login
      toast({
        title: 'Đăng nhập thành công!',
        description: 'Chào mừng bạn trở lại với Tiger.',
        duration: 3000,
      });

      // Clear the callbackUrl from URL
      if (searchParams.get('callbackUrl')) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('callbackUrl');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [session, status, searchParams, toast, router]);

  return null; // This component doesn't render anything
}
