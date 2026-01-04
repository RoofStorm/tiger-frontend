'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { HeaderDarkModeProvider } from '@/contexts/HeaderDarkModeContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { JoinChallengeModalProvider } from '@/contexts/JoinChallengeModalContext';
import { ShareFacebookModalProvider } from '@/contexts/ShareFacebookModalContext';
import { ShareRegistrationModalProvider } from '@/contexts/ShareRegistrationModalContext';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { VideoProvider } from '@/contexts/VideoContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PopupProvider } from '@/contexts/PopupContext';
import { PopupOrchestrator } from '@/components/PopupOrchestrator';
import { NotificationPopupManager } from '@/components/NotificationPopupManager';
import { DailyLoginModalProvider } from '@/components/DailyLoginModalProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false, // Prevent refetch on window focus
            refetchOnMount: false, // Prevent refetch on component mount
            retry: (failureCount, error: unknown) => {
              if (
                (error as { response?: { status?: number } })?.response
                  ?.status === 401
              )
                return false;
              return failureCount < 1; // Reduce retry attempts
            },
          },
          mutations: {
            retry: false, // Don't retry mutations
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchInterval={0} // Disable automatic refetch
        refetchOnWindowFocus={false} // Disable refetch on window focus to reduce API calls (session is cached)
        refetchWhenOffline={false} // Don't refetch when offline
      >
        <VideoProvider>
          <AnalyticsProvider>
            <NotificationProvider>
              <PopupProvider>
                <LoadingProvider>
                  <HeaderDarkModeProvider>
                    <JoinChallengeModalProvider>
                      <ShareFacebookModalProvider>
                        <ShareRegistrationModalProvider>
                          {children}
                          <LoadingOverlay />
                          <Toaster />
                          <NotificationPopupManager />
                          <DailyLoginModalProvider />
                          <PopupOrchestrator />
                        </ShareRegistrationModalProvider>
                      </ShareFacebookModalProvider>
                    </JoinChallengeModalProvider>
                  </HeaderDarkModeProvider>
                </LoadingProvider>
              </PopupProvider>
            </NotificationProvider>
          </AnalyticsProvider>
        </VideoProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
