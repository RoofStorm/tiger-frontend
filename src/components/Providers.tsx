'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';

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
        refetchOnWindowFocus={false} // Don't refetch on window focus
        refetchWhenOffline={false} // Don't refetch when offline
      >
        <LoadingProvider>
          {children}
          <LoadingOverlay />
          <Toaster />
        </LoadingProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
